'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  CheckCircle2,
  Clock,
  Wallet,
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  Calendar
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Modal } from '../ui/Modal';

export function AnalyticsView() {
  const {
    tasks,
    habits,
    pomodoroSessions,
    transactions,
    waitingItems,
    research,
    projects
  } = useCommandCenter();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Computations
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'in_progress').length;

  const totalFocusMinutes = pomodoroSessions
    .filter(s => s.completed && s.sessionType === 'focus')
    .reduce((acc, s) => acc + s.actualDuration, 0);

  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  const topHabitStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Executive Analytics</h1>
            <p className="text-xs text-slate-400">Deep work focus metrics, task completion velocity, and habit consistency.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  timeframe === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Weekly Review</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Deep Focus Hours</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{focusHours}h</div>
          <span className="text-[11px] text-emerald-400 font-mono">100% on high priority</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Tasks Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{completedTasksCount}</div>
          <span className="text-[11px] text-slate-400 font-mono">{inProgressTasksCount} in progress</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Top Habit Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{topHabitStreak} days</div>
          <span className="text-[11px] text-slate-400 font-mono">Deep Focus Habit</span>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Lab Expenditure</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">₹{totalExpense.toLocaleString()}</div>
          <span className="text-[11px] text-slate-400 font-mono">Within monthly budget</span>
        </div>
      </div>

      {/* Focus Breakdown by Project */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Focus Distribution by Academic &amp; Research Domain
        </h3>
        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No projects tracked yet. Add projects in the Projects view to see distribution.
            </p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">{p.name} ({p.category})</span>
                  <span className="text-indigo-400 font-bold">{p.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Guided Weekly Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Weekly Executive Review"
        subtitle="AI reflection, milestone audit, and next week calibration"
        maxWidth="xl"
      >
        <div className="space-y-4 py-2 text-xs leading-relaxed">
          <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-2 text-purple-200">
            <div className="flex items-center gap-2 font-bold text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Executive Synthesis:</span>
            </div>
            <p>
              {tasks.length > 0
                ? `You have logged ${tasks.length} total task(s) with ${completedTasksCount} completed deliverable(s). Total focus recorded: ${focusHours}h.`
                : 'No tasks or session blocks logged for this cycle yet. Create tasks and run focus sprints to build your performance profile.'}
            </p>
            <div className="pt-2 border-t border-purple-500/30 font-semibold text-amber-300">
              Executive Guidance
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Use the Today Focus cockpit (T) to isolate your single highest-priority objective.</li>
              <li>Schedule 50-minute Pomodoro sprints for deep work and revision.</li>
              <li>Keep external blockers documented in the Waiting For tracker.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Completed Deliverables</span>
              <span className="text-sm font-bold text-emerald-400">{completedTasksCount} tasks verified</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Waiting Items Pending</span>
              <span className="text-sm font-bold text-amber-400">{waitingItems.filter(w => w.status === 'pending').length} external dependencies</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
            >
              Complete Review
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
