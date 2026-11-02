'use client';

import React from 'react';
import { Target, ArrowRight, Clock, CheckCircle2, Circle, AlertCircle, Focus } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Badge } from '../ui/Badge';

export function TodayWidget() {
  const { tasks, setCurrentView, setMinimalDistractionMode, toggleTaskStatus } = useCommandCenter();

  // Top focus task (critical/strategic and in_progress/planned)
  const todayTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const currentFocusTask =
    todayTasks.find(t => t.status === 'in_progress') ||
    todayTasks.find(t => t.priority === 'critical') ||
    todayTasks[0];

  const nextTasks = todayTasks.filter(t => t.id !== currentFocusTask?.id).slice(0, 3);

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Today Focus &amp; Cockpit</h3>
            <span className="text-[11px] text-slate-400 font-mono">{dateFormatted}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimalDistractionMode(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg transition-all"
            title="Open Distraction-free Cockpit"
          >
            <Focus className="w-3.5 h-3.5" />
            <span>Focus Mode</span>
          </button>
          <button
            onClick={() => setCurrentView('today')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Full Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero: "What should I do now?" Current Focus */}
      {currentFocusTask ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              What Should I Do Now?
            </span>
            <Badge variant={currentFocusTask.priority}>{currentFocusTask.priority.toUpperCase()}</Badge>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white leading-snug">
                {currentFocusTask.title}
              </h4>
              {currentFocusTask.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {currentFocusTask.description}
                </p>
              )}
            </div>
            <button
              onClick={() => toggleTaskStatus(currentFocusTask.id)}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
              title="Mark Task Complete"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Est: {currentFocusTask.estimatedDuration} min
            </span>
            <span className="text-slate-500">•</span>
            <span>Category: {currentFocusTask.category}</span>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
          All planned tasks completed for today! Great execution.
        </div>
      )}

      {/* Next Actions In Queue */}
      {nextTasks.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Next Actions In Queue
          </span>
          <div className="space-y-1">
            {nextTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <Circle className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-300 truncate font-medium">{t.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={t.priority} size="sm">{t.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
