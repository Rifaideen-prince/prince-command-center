'use client';

import React from 'react';
import { Bot, Sparkles, AlertTriangle, CheckCircle, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { aiEngine } from '../../lib/aiEngine';

export function AIInsightsWidget() {
  const context = useCommandCenter();
  const { insights, dismissInsight, setCurrentView, setShouldIDoThisOpen } = context;

  // Compute live workload safety
  const currentDb = {
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
    lastSyncedAt: new Date().toISOString()
  };

  const workload = aiEngine.calculateWorkload(currentDb);
  const activeInsights = insights.filter(i => !i.dismissed);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">AI Executive Insights</h3>
            <span className="text-[11px] text-slate-400 font-mono">Workload &amp; Cognitive Bandwidth</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShouldIDoThisOpen(true)}
            className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold rounded-lg transition-colors"
          >
            Ask &quot;Should I Do This?&quot;
          </button>
          <button
            onClick={() => setCurrentView('ai')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Command</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Workload Detection Gauge */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">3-Day Workload Feasibility:</span>
          <span className="font-mono font-bold text-white">
            {workload.requiredHours}h required / {workload.availableHours}h prime capacity
          </span>
        </div>

        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              workload.isOvercommitted
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
            }`}
            style={{ width: `${Math.min(100, Math.round((workload.requiredHours / workload.availableHours) * 100))}%` }}
          />
        </div>

        {workload.isOvercommitted ? (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Overcommitted by {workload.overcommittedHours} hours. Defer low priority tasks.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Optimal workload balance. Prime focus hours protected for exam &amp; research.</span>
          </div>
        )}
      </div>

      {/* Actionable Proactive Insights */}
      <div className="space-y-2">
        {activeInsights.slice(0, 2).map((ins) => (
          <div
            key={ins.id}
            className={`p-3 rounded-xl border relative transition-colors ${
              ins.type === 'workload'
                ? 'bg-amber-950/20 border-amber-500/30'
                : ins.type === 'warning'
                ? 'bg-purple-950/20 border-purple-500/30'
                : 'bg-emerald-950/20 border-emerald-500/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                {ins.type === 'workload' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                {ins.type === 'warning' && <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}
                {ins.type === 'praise' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                <div>
                  <h4 className="text-xs font-bold text-white">{ins.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{ins.message}</p>
                </div>
              </div>
              <button
                onClick={() => dismissInsight(ins.id)}
                className="text-slate-500 hover:text-white p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
