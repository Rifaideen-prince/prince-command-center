// Core Types for PRINCE Command Center

export type Priority = 'strategic' | 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'blocked' | 'completed' | 'deferred' | 'cancelled';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type ProjectCategory = 'College' | 'NPTEL' | 'BS Degree' | 'Hackathon' | 'Projects' | 'Internship' | 'Research' | 'Personal';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type HabitCategory = 'regular' | 'academic' | 'not_to_do';
export type WaitingStatus = 'pending' | 'received' | 'followed_up' | 'overdue';
export type SyncStatusType = 'synced' | 'syncing' | 'offline' | 'error';
export type MemoryType = 'permanent' | 'temporary' | 'project';
export type TransactionType = 'income' | 'expense';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string; // ISO date string
  startDate?: string;
  priority: Priority;
  category: ProjectCategory | string;
  projectId?: string;
  estimatedDuration: number; // in minutes
  actualDuration: number; // in minutes
  status: TaskStatus;
  dependencies: string[]; // task IDs
  subtasks: Subtask[];
  notes?: string;
  attachments?: TaskAttachment[];
  recurrence: RecurrenceType;
  recurrenceInterval?: number;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  goal: string;
  category: ProjectCategory;
  status: ProjectStatus;
  deadline?: string;
  priority: Priority;
  progress: number; // 0 to 100
  notes?: string;
  links: { title: string; url: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year?: number;
  doi?: string;
  url?: string;
  status: 'to_read' | 'reading' | 'extracted' | 'cited';
  keyFindings?: string;
  methodologyNotes?: string;
}

export interface ResearchExperiment {
  id: string;
  title: string;
  date: string;
  parameters: string;
  results: string;
  conclusion: string;
  success: boolean;
}

export interface ResearchProject {
  id: string;
  title: string;
  problem: string;
  solution: string;
  researchQuestion: string;
  hypothesis: string;
  objectives: string[];
  methodology: string;
  literature: ResearchPaper[];
  experiments: ResearchExperiment[];
  results: string;
  notes: string;
  references: string[];
  status: 'ideation' | 'active_research' | 'experimentation' | 'writing' | 'completed';
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: HabitCategory;
  targetCount: number; // times per day, e.g. 1, 3
  color: string;
  reminderTime?: string;
  startDate: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  history: Record<string, number>; // date string "YYYY-MM-DD" -> count completed
}

export interface WaitingItem {
  id: string;
  waitingFor: string;
  personOrEntity: string;
  expectedDate?: string;
  followUpDate: string;
  projectId?: string;
  notes?: string;
  status: WaitingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReminder {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export type DiarySyncStatus =
  | 'Draft saved locally'
  | 'Uploading...'
  | 'Uploaded ✓'
  | 'Changes pending'
  | 'Upload failed';

export interface DiaryLocalDraft {
  date: string;
  title: string;
  content: string;
  wordCount: number;
  savedAt: string;
  baseVersion?: number;
  baseUpdatedAt?: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  dayOfWeek: string;
  title?: string;
  content: string; // rich text or markdown
  wordCount: number;
  aiAnalyzed?: boolean;
  aiInsights?: string[];
  productivityRating?: number; // 1-5
  updatedAt: string;
  uploadedAt?: string;
  version?: number;
}

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime: string;
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  sessionType: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
  taskId?: string;
  projectId?: string;
  notes?: string;
  manualAdjustmentsMinutes?: number;
}

export interface PomodoroSettings {
  focusDuration: number; // minutes, default 50
  shortBreak: number; // minutes, default 10
  longBreak: number; // minutes, default 20
  sessionsBeforeLongBreak: number; // default 4
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  keepScreenAwake: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO
  endDate: string; // ISO
  type: 'deadline' | 'task' | 'exam' | 'class' | 'meeting' | 'milestone' | 'focus';
  priority?: Priority;
  projectId?: string;
  allDay?: boolean;
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  sourceOrReason: string;
  createdAt: string;
}

export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string;
  source: string;
  importance: 'high' | 'medium' | 'low';
  pinned: boolean;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIActionLog {
  id: string;
  timestamp: string;
  toolName: string;
  params: Record<string, any>;
  status: 'executed' | 'cancelled' | 'pending_confirmation';
  summary: string;
}

export interface ProactiveInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'praise' | 'workload';
  title: string;
  message: string;
  actionText?: string;
  actionPayload?: {
    type: string;
    [key: string]: any;
  };
  dismissed: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'task' | 'project' | 'habit' | 'pomodoro' | 'money' | 'diary' | 'ai' | 'research';
  action: string;
  description: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'reminder' | 'habit' | 'pomodoro' | 'waiting' | 'ai';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface SystemSettings {
  productName: string; // "PRINCE" or "COMMAND CENTER"
  theme: 'dark' | 'light' | 'system';
  timezone: string;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "21:00"
  dailyAvailableHours: number; // e.g. 8
  googleAccount: string; // default "rifaideenprofessional@gmail.com"
  googleDriveConnected: boolean;
  googleDriveFolder: string; // "/CommandCenter"
  autoSyncIntervalSec: number; // 60
  soundEffects: boolean;
  confettiEnabled: boolean;
  aiTrustLevel: 'confirm_destructive' | 'always_confirm' | 'autonomous';
}

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}
