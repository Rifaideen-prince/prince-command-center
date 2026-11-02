'use client';

import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  ArrowRight,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  FolderKanban,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Focus,
  Check
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';
import { RadialTimerMenu } from '../pomodoro/RadialTimerMenu';
import { Modal } from '../ui/Modal';
import { aiEngine } from '../../lib/aiEngine';
import { Priority } from '../../lib/types';

export function DashboardView() {
  const context = useCommandCenter();
  const {
    tasks,
    projects,
    calendarEvents,
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    adjustPomodoroMinutes,
    switchPomodoroMode,
    toggleTaskStatus,
    addTask,
    addQuickReminder,
    setCurrentView,
    setMinimalDistractionMode,
    setShouldIDoThisOpen,
    widgets,
    toggleWidgetVisibility
  } = context;

  const [quickInput, setQuickInput] = useState('');
  const [quickType, setQuickType] = useState<'task' | 'reminder'>('task');
  const [quickSaved, setQuickSaved] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Greeting & Current Date
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // 2. Today's Priorities
  const priorityOrder: Record<Priority, number> = {
    strategic: 5,
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  const activeTasks = tasks
    .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  const todaysPriorities = activeTasks.slice(0, 5);

  // 3. Upcoming Deadlines
  const upcomingDeadlines = activeTasks
    .filter((t) => Boolean(t.deadline))
    .map((t) => {
      const dueTime = new Date(t.deadline!).getTime();
      const diffDays = Math.ceil((dueTime - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...t, diffDays };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 4);

  // 4. Active Pomodoro Timer calculations
  const minutes = Math.floor(pomodoro.timeLeftSeconds / 60);
  const seconds = pomodoro.timeLeftSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const timerProgress = Math.round(
    ((pomodoro.totalDurationSeconds - pomodoro.timeLeftSeconds) /
      Math.max(1, pomodoro.totalDurationSeconds)) *
      100
  );

  const handleTimerPointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      setRadialMenuOpen(true);
    }, 450);
  };

  const handleTimerPointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleTimerClick = () => {
    if (!radialMenuOpen) {
      if (pomodoro.isRunning) pausePomodoro();
      else startPomodoro();
    }
  };

  // 5. Current Projects
  const activeProjects = projects.filter((p) => p.status === 'active').slice(0, 4);

  // 6. Calendar Overview (Next 7 days strip + scheduled items)
  const upcomingDays = Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const dayEventsCount =
      calendarEvents.filter((e) => e.startDate.startsWith(dateStr)).length +
      tasks.filter((t) => t.deadline && t.deadline.startsWith(dateStr) && t.status !== 'completed')
        .length;
    return {
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: idx === 0,
      count: dayEventsCount
    };
  });

  // 7. Quick Capture inline submit
  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    if (quickType === 'task') {
      addTask({
        title: quickInput.trim(),
        priority: 'high',
        category: 'Personal',
        estimatedDuration: 45,
        actualDuration: 0,
        status: 'planned',
        dependencies: [],
        subtasks: [],
        recurrence: 'none',
        tags: ['quick-capture']
      });
    } else {
      addQuickReminder(quickInput.trim());
    }

    setQuickInput('');
    setQuickSaved(true);
    setTimeout(() => setQuickSaved(false), 2000);
  };

  // 8. AI Recommendations & Workload Summary
  const workload = aiEngine.calculateWorkload({
    tasks: context.tasks,
    projects: context.projects,
    research: context.research,
    habits: context.habits,
    waitingItems: context.waitingItems,
    quickReminders: context.quickReminders,
    diaryEntries: context.diaryEntries,
    pomodoroSessions: context.pomodoroSessions,
    calendarEvents: context.calendarEvents,
    transactions: context.transactions,
    memories: context.memories,
    aiActionLogs: context.aiActionLogs,
    insights: context.insights,
    activityLogs: context.activityLogs,
    notifications: context.notifications,
    settings: context.settings,
    widgets: context.widgets,
    pomodoroSettings: context.pomodoroSettings,
    version: 1,
    lastSyncedAt: now.toISOString()
  });

  const primaryRecommendation = todaysPriorities[0]
    ? `Focus on "${todaysPriorities[0].title}" first (${todaysPriorities[0].estimatedDuration || 45}m estimated).`
    : 'Your task queue is clear. Use this block for deep research or strategic planning.';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. Greeting & Current Date + 7. Quick Capture */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <p className="text-xs font-medium text-slate-400">{formattedDate}</p>
          <h1 className="text-2xl font-semibold text-white tracking-tight mt-0.5">
            {greeting}, Rifai
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeTasks.length} active {activeTasks.length === 1 ? 'task' : 'tasks'} •{' '}
            {upcomingDeadlines.length} upcoming{' '}
            {upcomingDeadlines.length === 1 ? 'deadline' : 'deadlines'} •{' '}
            {workload.requiredHours}h planned over 3 days
          </p>
        </div>

        {/* 7. Quick Capture Inline Bar */}
        <form
          onSubmit={handleQuickCapture}
          className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[420px]"
        >
          <div className="flex items-center flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500 transition-colors">
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value as 'task' | 'reminder')}
              className="bg-transparent text-xs font-medium text-slate-400 focus:outline-none pr-2 border-r border-slate-800 mr-2"
              aria-label="Quick capture type"
            >
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
            </select>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick capture a task or reminder..."
              className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            {quickSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{quickSaved ? 'Added' : 'Add'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCustomizeOpen(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Customize Dashboard"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main Grid: Priorities (Left 2 cols) & Active Pomodoro Timer (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Today's Priorities */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Today&apos;s Priorities</h2>
                <p className="text-xs text-slate-400">Most important actions ordered by impact</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('today')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  <span>Today View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {todaysPriorities.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-800 rounded-lg space-y-2">
                <p className="text-xs text-slate-400">No active tasks in your queue for today.</p>
                <button
                  onClick={() => setCurrentView('tasks')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + Create a task in Task Manager
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/70 border border-slate-800/80 rounded-lg bg-slate-950/50 overflow-hidden">
                {todaysPriorities.map((task, idx) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                        title="Mark completed"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-100 truncate">
                            {task.title}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-medium shrink-0">
                              Next Up
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.estimatedDuration || 45}m</span>
                          {task.deadline && (
                            <>
                              <span>•</span>
                              <span>
                                Due{' '}
                                {new Date(task.deadline).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-medium capitalize shrink-0 ${
                        task.priority === 'critical' || task.priority === 'strategic'
                          ? 'bg-rose-500/10 text-rose-400'
                          : task.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/70">
            <span>Press T for Today view or N for all tasks</span>
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-slate-300 hover:text-white font-medium"
            >
              View all tasks ({tasks.length}) →
            </button>
          </div>
        </section>

        {/* 4. Active Pomodoro Timer */}
        <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Pomodoro Timer</h2>
              <p className="text-xs text-slate-400">
                {pomodoro.sessionCountToday} sessions completed today
              </p>
            </div>
            <button
              onClick={() => setMinimalDistractionMode(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open Fullscreen Focus Mode"
            >
              <Focus className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 my-3">
            <button
              onClick={() => switchPomodoroMode('focus')}
              className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                pomodoro.mode === 'focus'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => switchPomodoroMode('short_break')}
              className={`flex-1 py-1 rounded-md text-xs font-medium transition-colors ${
                pomodoro.mode === 'short_break'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Break
            </button>
          </div>

          {/* Interactive Radial Timer */}
          <div className="flex flex-col items-center justify-center py-2">
            <div
              onPointerDown={handleTimerPointerDown}
              onPointerUp={handleTimerPointerUp}
              onPointerLeave={handleTimerPointerUp}
              onClick={handleTimerClick}
              className="cursor-pointer select-none transition-transform active:scale-95"
              title="Click to start/pause • Press and hold for radial controls"
            >
              <ProgressRing
                progress={timerProgress}
                size={156}
                strokeWidth={6}
                color={pomodoro.mode === 'focus' ? '#4f46e5' : '#10b981'}
                bgColor="rgba(148, 163, 184, 0.14)"
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-semibold font-mono text-white tracking-tight">
                    {formattedTimer}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    {pomodoro.isRunning ? (
                      <>
                        <Pause className="w-3 h-3 text-indigo-400" />
                        <span>Running</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-slate-400" />
                        <span>Paused</span>
                      </>
                    )}
                  </span>
                </div>
              </ProgressRing>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => (pomodoro.isRunning ? pausePomodoro() : startPomodoro())}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                {pomodoro.isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={() => adjustPomodoroMinutes(5)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
              >
                +5m
              </button>
              <button
                onClick={resetPomodoro}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Second Row: 3. Upcoming Deadlines, 5. Current Projects, 8. AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 3. Upcoming Deadlines */}
        <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Upcoming Deadlines</h2>
              <button
                onClick={() => setCurrentView('calendar')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Calendar →
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-800 rounded-lg">
                No upcoming deadlines scheduled.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/70 border border-slate-800/80 rounded-lg bg-slate-950/50">
                {upcomingDeadlines.map((item) => (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-100 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                    </div>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded shrink-0 ${
                        item.diffDays <= 2
                          ? 'bg-rose-500/10 text-rose-400'
                          : item.diffDays <= 5
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.diffDays < 0
                        ? `${Math.abs(item.diffDays)}d overdue`
                        : item.diffDays === 0
                        ? 'Today'
                        : item.diffDays === 1
                        ? 'Tomorrow'
                        : `${item.diffDays}d left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 5. Current Projects */}
        <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Current Projects</h2>
              <button
                onClick={() => setCurrentView('projects')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                All ({projects.length}) →
              </button>
            </div>

            {activeProjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-800 rounded-lg">
                No active projects yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setCurrentView('projects')}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-100 truncate">{proj.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{proj.category}</span>
                      {proj.deadline && <span>Due {proj.deadline}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 8. AI Recommendations */}
        <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white">AI Recommendations</h2>
              </div>
              <button
                onClick={() => setCurrentView('ai')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Assistant →
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Workload Balance</span>
                <span
                  className={`font-medium ${
                    workload.isOvercommitted ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {workload.requiredHours}h / {workload.availableHours}h capacity
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    workload.isOvercommitted ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (workload.requiredHours / Math.max(1, workload.availableHours)) * 100
                      )
                    )}%`
                  }}
                />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {primaryRecommendation}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShouldIDoThisOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Evaluate a New Commitment</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </section>
      </div>

      {/* 6. Calendar Overview (7-Day Strip) */}
      <section className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-white">7-Day Calendar Overview</h2>
          </div>
          <button
            onClick={() => setCurrentView('calendar')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Open Full Calendar →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {upcomingDays.map((day) => (
            <button
              key={day.dateStr}
              onClick={() => setCurrentView('calendar')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                day.isToday
                  ? 'bg-indigo-600/10 border-indigo-500/40'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">{day.dayName}</span>
                {day.isToday && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-medium">
                    Today
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold text-white mt-1">{day.dayNumber}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {day.count === 0 ? 'Free' : `${day.count} scheduled`}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Radial Timer Menu Modal */}
      <RadialTimerMenu
        isOpen={radialMenuOpen}
        onClose={() => setRadialMenuOpen(false)}
        onFastForward={(mins) => adjustPomodoroMinutes(-mins)}
        onRewind={(mins) => adjustPomodoroMinutes(mins)}
        onAddMinutes={(mins) => adjustPomodoroMinutes(mins)}
        onStop={() => resetPomodoro()}
      />

      {/* Customize Dashboard Modal */}
      <Modal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        title="Customize Workspace Preferences"
        subtitle="Toggle visibility of dashboard modules"
      >
        <div className="space-y-2 py-2">
          {widgets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800"
            >
              <span className="text-xs font-medium text-slate-200">{w.name}</span>
              <button
                onClick={() => toggleWidgetVisibility(w.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  w.visible
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                {w.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{w.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
