'use client';

import React from 'react';
import { CalendarClock, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Badge } from '../ui/Badge';

export function DeadlinesWidget() {
  const { tasks, projects, setCurrentView } = useCommandCenter();

  // Find all tasks with deadlines that are not completed
  const activeWithDeadlines = tasks
    .filter(t => t.deadline && t.status !== 'completed' && t.status !== 'cancelled')
    .map(t => {
      const now = new Date().getTime();
      const due = new Date(t.deadline!).getTime();
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      const proj = projects.find(p => p.id === t.projectId);

      let urgency: 'critical' | 'warning' | 'normal' | 'overdue' = 'normal';
      let urgencyText = `${diffDays} days remaining`;

      if (diffDays < 0) {
        urgency = 'overdue';
        urgencyText = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
      } else if (diffDays === 0) {
        urgency = 'critical';
        urgencyText = 'Due Today';
      } else if (diffDays === 1) {
        urgency = 'critical';
        urgencyText = 'Due Tomorrow';
      } else if (diffDays <= 2) {
        urgency = 'critical';
        urgencyText = `${diffDays} days remaining`;
      } else if (diffDays <= 5) {
        urgency = 'warning';
        urgencyText = `${diffDays} days remaining`;
      }

      return {
        ...t,
        projectName: proj?.name || t.category,
        diffDays,
        urgency,
        urgencyText
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Upcoming Deadlines</h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Countdown</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('calendar')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Calendar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {activeWithDeadlines.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No urgent deadlines scheduled.</p>
        ) : (
          activeWithDeadlines.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                item.urgency === 'critical' || item.urgency === 'overdue'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : item.urgency === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950 border-slate-800/80'
              }`}
            >
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                  <span className="truncate">{item.projectName}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>

              {/* Urgency Pill & Days remaining */}
              <div className="flex flex-col items-end shrink-0">
                <span
                  className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                    item.urgency === 'critical' || item.urgency === 'overdue'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : item.urgency === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {item.urgencyText}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {new Date(item.deadline!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
