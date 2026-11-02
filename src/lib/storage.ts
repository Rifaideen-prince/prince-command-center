// Offline-first Storage Engine with IndexedDB & Local Persistence for PRINCE Command Center

import {
  Task,
  Project,
  ResearchProject,
  Habit,
  WaitingItem,
  QuickReminder,
  DiaryEntry,
  PomodoroSession,
  CalendarEvent,
  Transaction,
  MemoryItem,
  AIActionLog,
  ProactiveInsight,
  ActivityItem,
  NotificationItem,
  SystemSettings,
  DashboardWidgetConfig,
  PomodoroSettings,
  SyncStatusType
} from './types';
import {
  initialTasks,
  initialProjects,
  initialResearch,
  initialHabits,
  initialWaitingItems,
  initialQuickReminders,
  initialDiaryEntries,
  initialTransactions,
  initialMemories,
  initialInsights,
  initialSettings,
  initialWidgets,
  initialPomodoroSettings
} from './initialData';

export interface CommandCenterDatabase {
  tasks: Task[];
  projects: Project[];
  research: ResearchProject;
  habits: Habit[];
  waitingItems: WaitingItem[];
  quickReminders: QuickReminder[];
  diaryEntries: Record<string, DiaryEntry>;
  pomodoroSessions: PomodoroSession[];
  calendarEvents: CalendarEvent[];
  transactions: Transaction[];
  memories: MemoryItem[];
  aiActionLogs: AIActionLog[];
  insights: ProactiveInsight[];
  activityLogs: ActivityItem[];
  notifications: NotificationItem[];
  settings: SystemSettings;
  widgets: DashboardWidgetConfig[];
  pomodoroSettings: PomodoroSettings;
  version: number;
  lastSyncedAt: string;
}

const DB_KEY = 'prince_command_center_v2';
const DB_NAME = 'PrinceCommandCenterDB';
const DB_VERSION = 2;

class OfflineStorageEngine {
  private memoryCache: CommandCenterDatabase | null = null;
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private syncListeners: ((status: SyncStatusType) => void)[] = [];
  private currentStatus: SyncStatusType = 'synced';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('prince_command_center_v1');
      } catch {
        // ignore
      }
      this.initIndexedDB();
      this.setupNetworkListeners();
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.notifyStatus('syncing');
      setTimeout(() => this.notifyStatus('synced'), 1200);
    });
    window.addEventListener('offline', () => {
      this.notifyStatus('offline');
    });
  }

  public subscribeSync(listener: (status: SyncStatusType) => void): () => void {
    this.syncListeners.push(listener);
    listener(this.currentStatus);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifyStatus(status: SyncStatusType) {
    this.currentStatus = status;
    this.syncListeners.forEach(listener => listener(status));
  }

  private async initIndexedDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('store')) {
            db.createObjectStore('store', { keyPath: 'id' });
          }
        };
        req.onsuccess = (e: any) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  public getInitialState(): CommandCenterDatabase {
    return {
      tasks: initialTasks,
      projects: initialProjects,
      research: initialResearch,
      habits: initialHabits,
      waitingItems: initialWaitingItems,
      quickReminders: initialQuickReminders,
      diaryEntries: initialDiaryEntries,
      pomodoroSessions: [],
      calendarEvents: [],
      transactions: initialTransactions,
      memories: initialMemories,
      aiActionLogs: [],
      insights: initialInsights,
      activityLogs: [],
      notifications: [],
      settings: initialSettings,
      widgets: initialWidgets,
      pomodoroSettings: initialPomodoroSettings,
      version: 1,
      lastSyncedAt: new Date().toISOString()
    };
  }

  public async loadDatabase(): Promise<CommandCenterDatabase> {
    if (this.memoryCache) return this.memoryCache;

    if (typeof window === 'undefined') {
      return this.getInitialState();
    }

    // Try IndexedDB first
    try {
      const db = await this.initIndexedDB();
      if (db) {
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        const req = store.get(DB_KEY);
        const data = await new Promise<any>((resolve) => {
          req.onsuccess = () => resolve(req.result?.data || null);
          req.onerror = () => resolve(null);
        });

        if (data) {
          this.memoryCache = data;
          return data;
        }
      }
    } catch (err) {
      console.warn('IndexedDB read error, falling back to localStorage:', err);
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.memoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Default seed
    const defaultData = this.getInitialState();
    await this.saveDatabase(defaultData);
    this.memoryCache = defaultData;
    return defaultData;
  }

  public async saveDatabase(data: CommandCenterDatabase): Promise<void> {
    this.memoryCache = data;
    data.lastSyncedAt = new Date().toISOString();
    data.version = (data.version || 0) + 1;

    if (typeof window === 'undefined') return;

    this.notifyStatus('syncing');

    // Save in localStorage immediately for instantaneous recovery
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // Save in IndexedDB
    try {
      const db = await this.initIndexedDB();
      if (db) {
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        store.put({ id: DB_KEY, data });
      }
    } catch (err) {
      console.warn('IndexedDB save failed:', err);
    }

    setTimeout(() => {
      this.notifyStatus(navigator.onLine ? 'synced' : 'offline');
    }, 400);
  }

  public exportDataJson(): string {
    const data = this.memoryCache || this.getInitialState();
    return JSON.stringify(data, null, 2);
  }

  public async importDataJson(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString) as CommandCenterDatabase;
      if (!parsed.tasks || !parsed.projects) {
        throw new Error('Invalid Command Center data structure');
      }
      await this.saveDatabase(parsed);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  public async clearAllData(): Promise<CommandCenterDatabase> {
    const fresh = this.getInitialState();
    try {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem('prince_command_center_v1');
    } catch {}
    await this.saveDatabase(fresh);
    return fresh;
  }
}

export const offlineStorage = new OfflineStorageEngine();
