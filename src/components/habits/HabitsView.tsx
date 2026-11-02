'use client';

import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  RotateCcw,
  Sparkles,
  Trophy,
  Calendar,
  Brain,
  GraduationCap,
  ShieldAlert,
  Trash2,
  Edit2
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Habit, HabitCategory } from '../../lib/types';
import { ProgressRing } from '../ui/ProgressRing';
import { Modal } from '../ui/Modal';

export function HabitsView() {
  const { habits, addHabit, updateHabit, incrementHabitProgress, decrementHabitProgress, deleteHabit } = useCommandCenter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('regular');
  const [targetCount, setTargetCount] = useState('3');
  const [color, setColor] = useState('#3b82f6');
  const [reminderTime, setReminderTime] = useState('09:00');

  const todayStr = new Date().toISOString().split('T')[0];

  // Past 7 days array for mini heatmap
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const colorPalette = [
    '#3b82f6', // blue
    '#10b981', // green
    '#ef4444', // red
    '#8b5cf6', // purple
    '#f59e0b', // orange
    '#06b6d4', // teal
    '#ec4899', // pink
    '#64748b', // neutral
  ];

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setName('');
    setCategory('regular');
    setTargetCount('3');
    setColor('#3b82f6');
    setReminderTime('09:00');
    setModalOpen(true);
  };

  const handleOpenEdit = (h: Habit) => {
    setEditingHabit(h);
    setName(h.name);
    setCategory(h.category);
    setTargetCount(String(h.targetCount));
    setColor(h.color);
    setReminderTime(h.reminderTime || '09:00');
    setModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: name.trim(),
        category,
        targetCount: parseInt(targetCount) || 1,
        color,
        reminderTime
      });
    } else {
      addHabit({
        name: name.trim(),
        icon: 'Flame',
        category,
        targetCount: parseInt(targetCount) || 1,
        color,
        reminderTime,
        startDate: todayStr
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Daily Habit Architecture</h1>
            <p className="text-xs text-slate-400">
              Interactive radial rings, multiple daily counts, and zero-distraction streaks.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Habit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {habits.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No habits configured yet. Click &quot;New Habit&quot; above to set up daily habits or routines.
          </div>
        ) : (
          habits.map((habit) => {
          const currentCount = habit.history[todayStr] || 0;
          const isComplete = currentCount >= habit.targetCount;
          const progressPercent = Math.min(100, Math.round((currentCount / habit.targetCount) * 100));

          return (
            <div
              key={habit.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                isComplete
                  ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card top */}
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      habit.category === 'academic'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : habit.category === 'not_to_do'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    {habit.category === 'not_to_do' ? 'Not-To-Do Behavior' : `${habit.category} Habit`}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {habit.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(habit)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center Radial Progress Ring Surface */}
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() => incrementHabitProgress(habit.id, todayStr)}
                  className="relative group shrink-0 transition-transform active:scale-95"
                  title="Click to increment progress • Streak updates automatically upon target"
                >
                  <ProgressRing
                    progress={progressPercent}
                    size={84}
                    strokeWidth={6}
                    color={habit.color || '#6366f1'}
                    bgColor="rgba(30, 41, 59, 0.6)"
                  >
                    {isComplete ? (
                      <Check className="w-7 h-7 text-emerald-400 animate-in zoom-in-50" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-base font-black font-mono text-white">
                          {currentCount}/{habit.targetCount}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Today</span>
                      </div>
                    )}
                  </ProgressRing>
                </button>

                <div className="space-y-1.5 text-right font-mono">
                  <div className="flex items-center justify-end gap-1.5 text-amber-400">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{habit.currentStreak} day streak</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Best: {habit.bestStreak} days
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Total: {habit.totalCompletions} times
                  </div>
                </div>
              </div>

              {/* 7-Day Mini Heatmap */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Last 7 Days Consistency
                </span>
                <div className="flex items-center justify-between gap-1">
                  {pastDays.map((d) => {
                    const cnt = habit.history[d] || 0;
                    const done = cnt >= habit.targetCount;
                    const dateObj = new Date(d);
                    const dayLabel = dateObj.toLocaleDateString([], { weekday: 'narrow' });

                    return (
                      <div key={d} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full h-5 rounded-md flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                            done
                              ? 'bg-emerald-500 text-slate-950'
                              : cnt > 0
                              ? 'bg-indigo-900 text-indigo-200'
                              : 'bg-slate-950 border border-slate-800 text-slate-600'
                          }`}
                          title={`${d}: ${cnt}/${habit.targetCount}`}
                        >
                          {cnt > 0 ? cnt : ''}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">{dayLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Habit Creation / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHabit ? 'Edit Habit' : 'Create New Habit'}
        subtitle="Set target completions per day, color tone, and reminder"
      >
        <form onSubmit={handleSaveHabit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Focus Session (50m)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="regular">Regular Habit (Blue)</option>
                <option value="academic">Academic Habit (Green)</option>
                <option value="not_to_do">Not-To-Do Habit (Red)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Target Count / Day</label>
              <input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                min="1"
                max="20"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-2">Accent Color Tone</label>
            <div className="flex items-center gap-2">
              {colorPalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
