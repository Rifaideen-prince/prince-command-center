import {
  Task,
  Project,
  ResearchProject,
  Habit,
  WaitingItem,
  QuickReminder,
  DiaryEntry,
  Transaction,
  MemoryItem,
  ProactiveInsight,
  SystemSettings,
  DashboardWidgetConfig,
  PomodoroSettings
} from './types';

export const initialSettings: SystemSettings = {
  productName: 'PRINCE',
  theme: 'dark',
  timezone: 'Asia/Kolkata',
  workingHoursStart: '08:30',
  workingHoursEnd: '21:30',
  dailyAvailableHours: 8,
  googleAccount: 'rifaideenprofessional@gmail.com',
  googleDriveConnected: true,
  googleDriveFolder: '/CommandCenter',
  autoSyncIntervalSec: 60,
  soundEffects: true,
  confettiEnabled: true,
  aiTrustLevel: 'confirm_destructive',
};

export const initialPomodoroSettings: PomodoroSettings = {
  focusDuration: 50,
  shortBreak: 10,
  longBreak: 20,
  sessionsBeforeLongBreak: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  soundEnabled: true,
  keepScreenAwake: true,
};

export const initialWidgets: DashboardWidgetConfig[] = [
  { id: 'today', name: 'Today Focus & Cockpit', visible: true, order: 0 },
  { id: 'deadlines', name: 'Deadlines & Countdown', visible: true, order: 1 },
  { id: 'ai_insights', name: 'AI Workload & Insights', visible: true, order: 2 },
  { id: 'reminders', name: 'Quick Reminders', visible: true, order: 3 },
  { id: 'pomodoro', name: 'Pomodoro Focus Timer', visible: true, order: 4 },
  { id: 'habits', name: 'Habits Radial Progress', visible: true, order: 5 },
  { id: 'projects', name: 'Active Projects', visible: true, order: 6 },
  { id: 'waiting', name: 'Waiting For (External)', visible: true, order: 7 },
  { id: 'finance', name: 'Financial Overview', visible: true, order: 8 },
  { id: 'calendar', name: 'Calendar Schedule', visible: true, order: 9 },
];

export const initialProjects: Project[] = [];

export const initialTasks: Task[] = [];

export const initialResearch: ResearchProject = {
  id: 'research-1',
  title: '',
  problem: '',
  solution: '',
  researchQuestion: '',
  hypothesis: '',
  objectives: [],
  methodology: '',
  literature: [],
  experiments: [],
  results: '',
  notes: '',
  references: [],
  status: 'ideation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const initialWaitingItems: WaitingItem[] = [];

export const initialQuickReminders: QuickReminder[] = [];

export const initialHabits: Habit[] = [];

export const initialDiaryEntries: Record<string, DiaryEntry> = {};

export const initialTransactions: Transaction[] = [];

export const initialMemories: MemoryItem[] = [];

export const initialInsights: ProactiveInsight[] = [];
