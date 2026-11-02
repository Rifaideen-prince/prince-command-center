'use client';

import React from 'react';
import { Flame, Plus, Check, ArrowRight, Brain, Microscope, GraduationCap, ShieldAlert, Zap } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';

export function HabitsWidget() {
  const { habits, incrementHabitProgress, decrementHabitProgress, setCurrentView } = useCommandCenter();
  const todayStr = new Date().toISOString().split('T')[0];

  const getCategoryIcon = (category: string) => {
    if (category === 'academic') return GraduationCap;
    if (category === 'not_to_do') return ShieldAlert;
    return Brain;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Daily Habits</h3>
            <span className="text-[11px] text-slate-400 font-mono">Radial Progress Rings</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('habits')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All Habits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {habits.length === 0 ? (
          <p className="col-span-full text-xs text-slate-500 py-4 text-center">
            No habits configured yet. Add habits in the Habits view.
          </p>
        ) : (
          habits.map((habit) => {
          const count = habit.history[todayStr] || 0;
          const isComplete = count >= habit.targetCount;
          const progressPercent = Math.min(100, Math.round((count / habit.targetCount) * 100));
          const Icon = getCategoryIcon(habit.category);

          return (
            <div
              key={habit.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                isComplete
                  ? 'bg-slate-950/80 border-emerald-500/30 shadow-sm'
                  : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                {/* Radial progress ring with click-to-increment */}
                <button
                  onClick={() => incrementHabitProgress(habit.id, todayStr)}
                  className="relative group shrink-0 transition-transform active:scale-90"
                  title="Click to record progress (click-and-hold radial interaction supported)"
                >
                  <ProgressRing
                    progress={progressPercent}
                    size={42}
                    strokeWidth={3.5}
                    color={habit.color || '#6366f1'}
                    bgColor="rgba(30, 41, 59, 0.6)"
                  >
                    {isComplete ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-slate-300">
                        {count}/{habit.targetCount}
                      </span>
                    )}
                  </ProgressRing>
                </button>

                <div className="flex flex-col truncate">
                  <span className={`text-xs font-semibold truncate ${isComplete ? 'text-emerald-300' : 'text-slate-200'}`}>
                    {habit.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>{habit.currentStreak} day streak</span>
                    {habit.category === 'not_to_do' && (
                      <span className="text-rose-400 font-bold ml-1">• Avoid</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress adjustment + / - buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {count > 0 && !isComplete && (
                  <button
                    onClick={() => decrementHabitProgress(habit.id, todayStr)}
                    className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-mono"
                    title="Decrement count"
                  >
                    -
                  </button>
                )}
                <button
                  onClick={() => incrementHabitProgress(habit.id, todayStr)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                  title={isComplete ? 'Completed!' : 'Increment +1'}
                >
                  {isComplete ? <Check className="w-3.5 h-3.5" /> : '+'}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
    </div>
  );
}
