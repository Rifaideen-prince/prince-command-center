'use client';

import React from 'react';
import { Hourglass, ArrowRight, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export function WaitingForWidget() {
  const { waitingItems, updateWaitingItem, setCurrentView } = useCommandCenter();

  const pendingItems = waitingItems.filter(w => w.status !== 'received');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Waiting For (External)</h3>
            <span className="text-[11px] text-slate-400 font-mono">Blocked on external dependencies</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('waiting')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All ({pendingItems.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {pendingItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No pending external items blocking your work.</p>
        ) : (
          pendingItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    ⏳ {item.waitingFor}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span className="text-indigo-400 font-medium flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-indigo-400" />
                    {item.personOrEntity}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">
                    Follow-up: {item.followUpDate}
                  </span>
                </div>
              </div>

              <button
                onClick={() => updateWaitingItem(item.id, { status: 'received' })}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-semibold text-slate-300 hover:text-emerald-400 transition-colors shrink-0"
                title="Mark as Received"
              >
                Received
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
