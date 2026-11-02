'use client';

import React, { useState } from 'react';
import { Bell, Plus, Check, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export function RemindersWidget() {
  const { quickReminders, addQuickReminder, toggleQuickReminder, deleteQuickReminder } = useCommandCenter();
  const [inputText, setInputText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addQuickReminder(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Quick Reminders</h3>
            <span className="text-[11px] text-slate-400 font-mono">Instant scratch reminders</span>
          </div>
        </div>
        <span className="text-xs font-mono font-semibold text-amber-400">
          {quickReminders.filter(r => !r.completed).length} active
        </span>
      </div>

      {/* Inline add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Ask mam for Unit 3 PPT..."
          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm transition-colors"
          title="Add Reminder"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Reminders List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {quickReminders.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">No quick reminders. Add one above.</p>
        ) : (
          quickReminders.map((rem) => (
            <div
              key={rem.id}
              className={`flex items-center justify-between p-2 rounded-xl border transition-colors group ${
                rem.completed ? 'bg-slate-950/40 border-slate-800/40 opacity-60' : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => toggleQuickReminder(rem.id)}
                className="flex items-center gap-2.5 flex-1 cursor-pointer truncate"
              >
                {rem.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 transition-colors" />
                )}
                <span
                  className={`text-xs text-slate-200 truncate ${
                    rem.completed ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {rem.text}
                </span>
              </div>
              <button
                onClick={() => deleteQuickReminder(rem.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
