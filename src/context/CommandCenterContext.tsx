'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  SyncStatusType,
  TaskStatus,
  Priority
} from '../lib/types';
import { CommandCenterDatabase, offlineStorage } from '../lib/storage';
import { sounds } from '../lib/sound';
import { googleDriveService } from '../lib/googleDrive';

export type NavigationView =
  | 'dashboard'
  | 'today'
  | 'calendar'
  | 'tasks'
  | 'projects'
  | 'pomodoro'
  | 'diary'
  | 'academics'
  | 'research'
  | 'notes'
  | 'resources'
  | 'internships'
  | 'skills'
  | 'portfolio'
  | 'habits'
  | 'waiting'
  | 'money'
  | 'analytics'
  | 'files'
  | 'ai'
  | 'memory'
  | 'automations'
  | 'settings'
  | 'settings_sync'
  | 'settings_security';

interface PomodoroTimerState {
  mode: 'focus' | 'short_break' | 'long_break';
  isRunning: boolean;
  timeLeftSeconds: number;
  totalDurationSeconds: number;
  sessionCountToday: number;
  currentTaskId?: string;
  currentProjectId?: string;
  lastTimestamp: number;
}

interface CommandCenterContextType {
  // Navigation & Shell
  currentView: NavigationView;
  setCurrentView: (view: NavigationView) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  quickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;
  minimalDistractionMode: boolean;
  setMinimalDistractionMode: (active: boolean) => void;
  shouldIDoThisOpen: boolean;
  setShouldIDoThisOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  syncStatus: SyncStatusType;

  // Data Collections
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

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (reorderedTasks: Task[]) => void;
  toggleTaskStatus: (id: string) => void;

  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Research Actions
  updateResearch: (updates: Partial<ResearchProject>) => void;

  // Habit Actions
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'totalCompletions' | 'history'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  incrementHabitProgress: (id: string, dateStr?: string) => void;
  decrementHabitProgress: (id: string, dateStr?: string) => void;
  deleteHabit: (id: string) => void;

  // Waiting Item Actions
  addWaitingItem: (item: Omit<WaitingItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWaitingItem: (id: string, updates: Partial<WaitingItem>) => void;
  deleteWaitingItem: (id: string) => void;

  // Quick Reminders
  addQuickReminder: (text: string) => void;
  toggleQuickReminder: (id: string) => void;
  deleteQuickReminder: (id: string) => void;

  // Diary Actions
  saveDiaryEntry: (entry: DiaryEntry) => void;

  // Finance Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  // Memory Actions
  addMemory: (mem: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<MemoryItem>) => void;
  deleteMemory: (id: string) => void;

  // Pomodoro Timer Engine
  pomodoro: PomodoroTimerState;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  adjustPomodoroMinutes: (deltaMinutes: number) => void; // fast forward, rewind, or extend
  switchPomodoroMode: (mode: 'focus' | 'short_break' | 'long_break') => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => void;

  // Widget Actions
  reorderWidgets: (widgets: DashboardWidgetConfig[]) => void;
  toggleWidgetVisibility: (id: string) => void;

  // Settings & Sync Actions
  updateSettings: (updates: Partial<SystemSettings>) => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => Promise<boolean>;
  syncWithGoogleDrive: () => Promise<string>;
  dismissInsight: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  clearAllData: () => Promise<void>;
  replaceDatabase: (newDb: CommandCenterDatabase) => void;
}

const CommandCenterContext = createContext<CommandCenterContextType | null>(null);

export function CommandCenterProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<CommandCenterDatabase>(offlineStorage.getInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [minimalDistractionMode, setMinimalDistractionMode] = useState(false);
  const [shouldIDoThisOpen, setShouldIDoThisOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');

  // Pomodoro Live State (Timestamp-anchored for background accuracy)
  const [pomodoro, setPomodoro] = useState<PomodoroTimerState>({
    mode: 'focus',
    isRunning: false,
    timeLeftSeconds: 50 * 60,
    totalDurationSeconds: 50 * 60,
    sessionCountToday: 0,
    lastTimestamp: Date.now()
  });

  // Load database from IndexedDB/localStorage on mount
  useEffect(() => {
    offlineStorage.loadDatabase().then((loaded) => {
      setDb(loaded);
      setPomodoro(prev => ({
        ...prev,
        timeLeftSeconds: (loaded.pomodoroSettings?.focusDuration || 50) * 60,
        totalDurationSeconds: (loaded.pomodoroSettings?.focusDuration || 50) * 60
      }));
      setIsLoaded(true);
    });

    const unsubscribeSync = offlineStorage.subscribeSync(status => {
      setSyncStatus(status);
    });

    return () => unsubscribeSync();
  }, []);

  // Theme application
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (db.settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (db.settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [db.settings.theme]);

  // Pomodoro Background Accurate Timer Engine
  useEffect(() => {
    if (!pomodoro.isRunning) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - pomodoro.lastTimestamp) / 1000);

      if (elapsedSeconds >= 1) {
        setPomodoro(prev => {
          const nextTime = Math.max(0, prev.timeLeftSeconds - elapsedSeconds);
          if (nextTime === 0 && prev.timeLeftSeconds > 0) {
            // Session completed!
            if (db.settings.soundEffects) {
              sounds.playPomodoroFinish();
            }
            // Record pomodoro session in DB
            const isFocus = prev.mode === 'focus';
            const newSession: PomodoroSession = {
              id: `pomo-${Date.now()}`,
              startTime: new Date(now - prev.totalDurationSeconds * 1000).toISOString(),
              endTime: new Date(now).toISOString(),
              plannedDuration: Math.round(prev.totalDurationSeconds / 60),
              actualDuration: Math.round(prev.totalDurationSeconds / 60),
              sessionType: prev.mode,
              completed: true,
              taskId: prev.currentTaskId,
              projectId: prev.currentProjectId
            };

            const nextMode = isFocus ? 'short_break' : 'focus';
            const nextDurationMin = isFocus
              ? (db.pomodoroSettings.shortBreak || 10)
              : (db.pomodoroSettings.focusDuration || 50);

            // Log activity
            commitDb(latest => ({
              ...latest,
              pomodoroSessions: [newSession, ...latest.pomodoroSessions],
              activityLogs: [
                {
                  id: `act-${Date.now()}`,
                  type: 'pomodoro',
                  action: `${isFocus ? 'Focus block' : 'Break'} completed`,
                  description: `Completed ${Math.round(prev.totalDurationSeconds / 60)}m ${prev.mode} session`,
                  timestamp: new Date().toISOString()
                },
                ...latest.activityLogs
              ]
            }));

            return {
              ...prev,
              isRunning: false,
              mode: nextMode,
              timeLeftSeconds: nextDurationMin * 60,
              totalDurationSeconds: nextDurationMin * 60,
              sessionCountToday: isFocus ? prev.sessionCountToday + 1 : prev.sessionCountToday,
              lastTimestamp: now
            };
          }

          return {
            ...prev,
            timeLeftSeconds: nextTime,
            lastTimestamp: now
          };
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.lastTimestamp, db.pomodoroSettings, db.settings.soundEffects]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger single-letter shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl + K or Cmd + K: Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      // Esc: Close Modals or Exit Minimal Distraction Mode
      if (e.key === 'Escape') {
        if (minimalDistractionMode) {
          setMinimalDistractionMode(false);
          return;
        }
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (quickCaptureOpen) {
          setQuickCaptureOpen(false);
          return;
        }
        if (shouldIDoThisOpen) {
          setShouldIDoThisOpen(false);
          return;
        }
      }

      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.toLowerCase() === 'q') {
          e.preventDefault();
          setQuickCaptureOpen(true);
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          setCurrentView('today');
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setCurrentView('tasks');
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          setCurrentView('today');
        } else if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          setCurrentView('diary');
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setCurrentView('habits');
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          setCurrentView('calendar');
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setCurrentView('research');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minimalDistractionMode, commandPaletteOpen, quickCaptureOpen, shouldIDoThisOpen]);

  // Commit changes to persistent storage
  const commitDb = useCallback((updater: (prev: CommandCenterDatabase) => CommandCenterDatabase) => {
    setDb(current => {
      const updated = updater(current);
      offlineStorage.saveDatabase(updated);
      return updated;
    });
  }, []);

  // Task Handlers
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
    commitDb(prev => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        order: prev.tasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedTasks = [newTask, ...prev.tasks];
      const activity: ActivityItem = {
        id: `act-${Date.now()}`,
        type: 'task',
        action: 'Created task',
        description: newTask.title,
        timestamp: new Date().toISOString()
      };
      return {
        ...prev,
        tasks: updatedTasks,
        activityLogs: [activity, ...prev.activityLogs]
      };
    });
  }, [commitDb]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    commitDb(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === id) {
          const isCompleting = updates.status === 'completed' && t.status !== 'completed';
          if (isCompleting && prev.settings.soundEffects) {
            sounds.playTaskComplete();
          }
          return {
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
            completedAt: isCompleting ? new Date().toISOString() : t.completedAt
          };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  }, [commitDb]);

  const deleteTask = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  }, [commitDb]);

  const reorderTasks = useCallback((reordered: Task[]) => {
    commitDb(prev => ({
      ...prev,
      tasks: reordered.map((t, idx) => ({ ...t, order: idx }))
    }));
  }, [commitDb]);

  const toggleTaskStatus = useCallback((id: string) => {
    commitDb(prev => {
      const target = prev.tasks.find(t => t.id === id);
      if (!target) return prev;
      const isComplete = target.status === 'completed';
      const newStatus: TaskStatus = isComplete ? 'in_progress' : 'completed';

      if (!isComplete && prev.settings.soundEffects) {
        sounds.playTaskComplete();
      }

      const updatedTasks = prev.tasks.map(t =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedAt: !isComplete ? new Date().toISOString() : undefined
            }
          : t
      );
      return { ...prev, tasks: updatedTasks };
    });
  }, [commitDb]);

  // Project Handlers
  const addProject = useCallback((projData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    commitDb(prev => {
      const newProj: Project = {
        ...projData,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { ...prev, projects: [...prev.projects, newProj] };
    });
  }, [commitDb]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    commitDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    }));
  }, [commitDb]);

  const deleteProject = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  }, [commitDb]);

  // Research Handlers
  const updateResearch = useCallback((updates: Partial<ResearchProject>) => {
    commitDb(prev => ({
      ...prev,
      research: { ...prev.research, ...updates, updatedAt: new Date().toISOString() }
    }));
  }, [commitDb]);

  // Habit Handlers
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'totalCompletions' | 'history'>) => {
    commitDb(prev => {
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        history: {}
      };
      return { ...prev, habits: [...prev.habits, newHabit] };
    });
  }, [commitDb]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    commitDb(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === id ? { ...h, ...updates } : h))
    }));
  }, [commitDb]);

  const incrementHabitProgress = useCallback((id: string, dateStr?: string) => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    commitDb(prev => {
      const habit = prev.habits.find(h => h.id === id);
      if (!habit) return prev;

      const currentCount = habit.history[today] || 0;
      const nextCount = currentCount + 1;
      const isNewlyCompleted = nextCount === habit.targetCount;

      if (isNewlyCompleted) {
        if (prev.settings.soundEffects) sounds.playHabitComplete();
      } else {
        if (prev.settings.soundEffects) sounds.playHabitStep();
      }

      const nextStreak = isNewlyCompleted ? habit.currentStreak + 1 : habit.currentStreak;
      const nextBest = Math.max(habit.bestStreak, nextStreak);

      const updatedHabits = prev.habits.map(h => {
        if (h.id === id) {
          return {
            ...h,
            currentStreak: nextStreak,
            bestStreak: nextBest,
            totalCompletions: isNewlyCompleted ? h.totalCompletions + 1 : h.totalCompletions,
            history: {
              ...h.history,
              [today]: nextCount
            }
          };
        }
        return h;
      });

      return {
        ...prev,
        habits: updatedHabits,
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            type: 'habit',
            action: isNewlyCompleted ? 'Completed habit' : 'Logged habit progress',
            description: `${habit.name} (${nextCount}/${habit.targetCount})`,
            timestamp: new Date().toISOString()
          },
          ...prev.activityLogs
        ]
      };
    });
  }, [commitDb]);

  const decrementHabitProgress = useCallback((id: string, dateStr?: string) => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    commitDb(prev => {
      const habit = prev.habits.find(h => h.id === id);
      if (!habit) return prev;

      const currentCount = habit.history[today] || 0;
      if (currentCount <= 0) return prev;

      const nextCount = currentCount - 1;
      const updatedHabits = prev.habits.map(h => {
        if (h.id === id) {
          return {
            ...h,
            history: {
              ...h.history,
              [today]: nextCount
            }
          };
        }
        return h;
      });

      return { ...prev, habits: updatedHabits };
    });
  }, [commitDb]);

  const deleteHabit = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  }, [commitDb]);

  // Waiting Items
  const addWaitingItem = useCallback((itemData: Omit<WaitingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    commitDb(prev => {
      const newItem: WaitingItem = {
        ...itemData,
        id: `wait-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { ...prev, waitingItems: [newItem, ...prev.waitingItems] };
    });
  }, [commitDb]);

  const updateWaitingItem = useCallback((id: string, updates: Partial<WaitingItem>) => {
    commitDb(prev => ({
      ...prev,
      waitingItems: prev.waitingItems.map(w => (w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    }));
  }, [commitDb]);

  const deleteWaitingItem = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      waitingItems: prev.waitingItems.filter(w => w.id !== id)
    }));
  }, [commitDb]);

  // Quick Reminders
  const addQuickReminder = useCallback((text: string) => {
    commitDb(prev => {
      const newRem: QuickReminder = {
        id: `rem-${Date.now()}`,
        text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      return { ...prev, quickReminders: [newRem, ...prev.quickReminders] };
    });
  }, [commitDb]);

  const toggleQuickReminder = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      quickReminders: prev.quickReminders.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    }));
  }, [commitDb]);

  const deleteQuickReminder = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      quickReminders: prev.quickReminders.filter(r => r.id !== id)
    }));
  }, [commitDb]);

  // Diary
  const saveDiaryEntry = useCallback((entry: DiaryEntry) => {
    commitDb(prev => ({
      ...prev,
      diaryEntries: {
        ...prev.diaryEntries,
        [entry.date]: entry
      },
      activityLogs: [
        {
          id: `act-${Date.now()}`,
          type: 'diary',
          action: 'Saved diary entry',
          description: `${entry.date} (${entry.wordCount} words)`,
          timestamp: new Date().toISOString()
        },
        ...prev.activityLogs
      ]
    }));
  }, [commitDb]);

  // Finance
  const addTransaction = useCallback((txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    commitDb(prev => {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            type: 'money',
            action: `Logged ${newTx.type}`,
            description: `₹${newTx.amount} - ${newTx.description}`,
            timestamp: new Date().toISOString()
          },
          ...prev.activityLogs
        ]
      };
    });
  }, [commitDb]);

  const deleteTransaction = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  }, [commitDb]);

  // Memories
  const addMemory = useCallback((memData: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    commitDb(prev => {
      const newMem: MemoryItem = {
        ...memData,
        id: `mem-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return { ...prev, memories: [newMem, ...prev.memories] };
    });
  }, [commitDb]);

  const updateMemory = useCallback((id: string, updates: Partial<MemoryItem>) => {
    commitDb(prev => ({
      ...prev,
      memories: prev.memories.map(m => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    }));
  }, [commitDb]);

  const deleteMemory = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      memories: prev.memories.filter(m => m.id !== id)
    }));
  }, [commitDb]);

  // Pomodoro Actions
  const startPomodoro = useCallback(() => {
    setPomodoro(prev => ({
      ...prev,
      isRunning: true,
      lastTimestamp: Date.now()
    }));
  }, []);

  const pausePomodoro = useCallback(() => {
    setPomodoro(prev => ({
      ...prev,
      isRunning: false
    }));
  }, []);

  const resetPomodoro = useCallback(() => {
    const defaultMins =
      pomodoro.mode === 'focus'
        ? db.pomodoroSettings.focusDuration || 50
        : db.pomodoroSettings.shortBreak || 10;
    setPomodoro(prev => ({
      ...prev,
      isRunning: false,
      timeLeftSeconds: defaultMins * 60,
      totalDurationSeconds: defaultMins * 60,
      lastTimestamp: Date.now()
    }));
  }, [pomodoro.mode, db.pomodoroSettings]);

  const adjustPomodoroMinutes = useCallback((deltaMinutes: number) => {
    setPomodoro(prev => {
      const newSeconds = Math.max(60, prev.timeLeftSeconds + deltaMinutes * 60);
      const newTotal = Math.max(newSeconds, prev.totalDurationSeconds + (deltaMinutes > 0 ? deltaMinutes * 60 : 0));
      return {
        ...prev,
        timeLeftSeconds: newSeconds,
        totalDurationSeconds: newTotal
      };
    });
  }, []);

  const switchPomodoroMode = useCallback((mode: 'focus' | 'short_break' | 'long_break') => {
    const mins =
      mode === 'focus'
        ? db.pomodoroSettings.focusDuration || 50
        : mode === 'short_break'
        ? db.pomodoroSettings.shortBreak || 10
        : db.pomodoroSettings.longBreak || 20;

    setPomodoro(prev => ({
      ...prev,
      mode,
      isRunning: false,
      timeLeftSeconds: mins * 60,
      totalDurationSeconds: mins * 60,
      lastTimestamp: Date.now()
    }));
  }, [db.pomodoroSettings]);

  const updatePomodoroSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    commitDb(prev => ({
      ...prev,
      pomodoroSettings: { ...prev.pomodoroSettings, ...newSettings }
    }));
  }, [commitDb]);

  // Widgets
  const reorderWidgets = useCallback((widgets: DashboardWidgetConfig[]) => {
    commitDb(prev => ({ ...prev, widgets }));
  }, [commitDb]);

  const toggleWidgetVisibility = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    }));
  }, [commitDb]);

  // Settings & Sync
  const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
    commitDb(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, [commitDb]);

  const exportBackup = useCallback(() => {
    googleDriveService.downloadLocalBackupFile(db);
  }, [db]);

  const importBackup = useCallback(async (jsonStr: string) => {
    const success = await offlineStorage.importDataJson(jsonStr);
    if (success) {
      const fresh = await offlineStorage.loadDatabase();
      setDb(fresh);
    }
    return success;
  }, []);

  const syncWithGoogleDrive = useCallback(async () => {
    const res = await googleDriveService.uploadToGoogleDrive(db);
    return res.message;
  }, [db]);

  const dismissInsight = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      insights: prev.insights.map(i => (i.id === id ? { ...i, dismissed: true } : i))
    }));
  }, [commitDb]);

  const markNotificationRead = useCallback((id: string) => {
    commitDb(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    }));
  }, [commitDb]);

  const clearAllNotifications = useCallback(() => {
    commitDb(prev => ({
      ...prev,
      notifications: []
    }));
  }, [commitDb]);

  const clearAllData = useCallback(async () => {
    const fresh = await offlineStorage.clearAllData();
    setDb(fresh);
    setPomodoro(prev => ({
      ...prev,
      sessionCountToday: 0,
      timeLeftSeconds: (fresh.pomodoroSettings?.focusDuration || 50) * 60,
      totalDurationSeconds: (fresh.pomodoroSettings?.focusDuration || 50) * 60
    }));
  }, []);

  const replaceDatabase = useCallback((newDb: CommandCenterDatabase) => {
    setDb(newDb);
    offlineStorage.saveDatabase(newDb);
  }, []);

  const value = useMemo(
    () => ({
      currentView,
      setCurrentView,
      sidebarExpanded,
      setSidebarExpanded,
      mobileDrawerOpen,
      setMobileDrawerOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      quickCaptureOpen,
      setQuickCaptureOpen,
      minimalDistractionMode,
      setMinimalDistractionMode,
      shouldIDoThisOpen,
      setShouldIDoThisOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      syncStatus,

      tasks: db.tasks,
      projects: db.projects,
      research: db.research,
      habits: db.habits,
      waitingItems: db.waitingItems,
      quickReminders: db.quickReminders,
      diaryEntries: db.diaryEntries,
      pomodoroSessions: db.pomodoroSessions,
      calendarEvents: db.calendarEvents,
      transactions: db.transactions,
      memories: db.memories,
      aiActionLogs: db.aiActionLogs,
      insights: db.insights,
      activityLogs: db.activityLogs,
      notifications: db.notifications,
      settings: db.settings,
      widgets: db.widgets,
      pomodoroSettings: db.pomodoroSettings,

      addTask,
      updateTask,
      deleteTask,
      reorderTasks,
      toggleTaskStatus,

      addProject,
      updateProject,
      deleteProject,

      updateResearch,

      addHabit,
      updateHabit,
      incrementHabitProgress,
      decrementHabitProgress,
      deleteHabit,

      addWaitingItem,
      updateWaitingItem,
      deleteWaitingItem,

      addQuickReminder,
      toggleQuickReminder,
      deleteQuickReminder,

      saveDiaryEntry,

      addTransaction,
      deleteTransaction,

      addMemory,
      updateMemory,
      deleteMemory,

      pomodoro,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      adjustPomodoroMinutes,
      switchPomodoroMode,
      updatePomodoroSettings,

      reorderWidgets,
      toggleWidgetVisibility,

      updateSettings,
      exportBackup,
      importBackup,
      syncWithGoogleDrive,
      dismissInsight,
      markNotificationRead,
      clearAllNotifications,
      clearAllData,
      replaceDatabase,
    }),
    [
      currentView,
      sidebarExpanded,
      mobileDrawerOpen,
      commandPaletteOpen,
      quickCaptureOpen,
      minimalDistractionMode,
      shouldIDoThisOpen,
      globalSearchQuery,
      syncStatus,
      db,
      pomodoro,
      addTask,
      updateTask,
      deleteTask,
      reorderTasks,
      toggleTaskStatus,
      addProject,
      updateProject,
      deleteProject,
      updateResearch,
      addHabit,
      updateHabit,
      incrementHabitProgress,
      decrementHabitProgress,
      deleteHabit,
      addWaitingItem,
      updateWaitingItem,
      deleteWaitingItem,
      addQuickReminder,
      toggleQuickReminder,
      deleteQuickReminder,
      saveDiaryEntry,
      addTransaction,
      deleteTransaction,
      addMemory,
      updateMemory,
      deleteMemory,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
      adjustPomodoroMinutes,
      switchPomodoroMode,
      updatePomodoroSettings,
      reorderWidgets,
      toggleWidgetVisibility,
      updateSettings,
      exportBackup,
      importBackup,
      syncWithGoogleDrive,
      dismissInsight,
      markNotificationRead,
      clearAllNotifications,
      clearAllData,
      replaceDatabase,
    ]
  );

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  const ctx = useContext(CommandCenterContext);
  if (!ctx) {
    throw new Error('useCommandCenter must be used within CommandCenterProvider');
  }
  return ctx;
}
