'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft, Plus, FastForward, Rewind, Square, X } from 'lucide-react';

interface RadialTimerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onFastForward: (minutes: number) => void;
  onRewind: (minutes: number) => void;
  onAddMinutes: (minutes: number) => void;
  onStop: () => void;
}

export function RadialTimerMenu({
  isOpen,
  onClose,
  onFastForward,
  onRewind,
  onAddMinutes,
  onStop
}: RadialTimerMenuProps) {
  const [activePrompt, setActivePrompt] = useState<'ff' | 'rewind' | 'add' | null>(null);
  const [customMinutes, setCustomMinutes] = useState('5');

  if (!isOpen) return null;

  const handleAction = (direction: 'right' | 'left' | 'up' | 'down') => {
    if (direction === 'down') {
      onStop();
      onClose();
    } else if (direction === 'right') {
      setActivePrompt('ff');
    } else if (direction === 'left') {
      setActivePrompt('rewind');
    } else if (direction === 'up') {
      setActivePrompt('add');
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseFloat(customMinutes) || 5;
    if (activePrompt === 'ff') {
      onFastForward(mins);
    } else if (activePrompt === 'rewind') {
      onRewind(mins);
    } else if (activePrompt === 'add') {
      onAddMinutes(mins);
    }
    setActivePrompt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center">
        {/* If user picked a direction that requires minutes input */}
        {activePrompt ? (
          <div className="w-80 bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl text-slate-200">
            <h3 className="text-sm font-bold text-white mb-2">
              {activePrompt === 'ff' && 'Fast Forward Timer'}
              {activePrompt === 'rewind' && 'Move Backward / Rewind'}
              {activePrompt === 'add' && 'Extend Focus Session'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              How many minutes do you want to {activePrompt === 'ff' ? 'skip' : activePrompt === 'rewind' ? 'rewind' : 'add'}?
            </p>
            <form onSubmit={handlePromptSubmit} className="space-y-3">
              <input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                min="1"
                max="120"
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActivePrompt(null)}
                  className="flex-1 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 4-Direction Physical Radial Controller */
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Center cancel/close hub */}
            <button
              onClick={onClose}
              className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 shadow-xl transition-transform active:scale-95 z-20"
            >
              <X className="w-5 h-5 mb-0.5 text-slate-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Cancel</span>
            </button>

            {/* UP: Add Minutes */}
            <button
              onClick={() => handleAction('up')}
              className="absolute top-2 w-28 h-20 rounded-2xl bg-slate-900/90 hover:bg-indigo-950/80 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center text-indigo-400 shadow-lg transition-all hover:scale-105"
            >
              <ArrowUp className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold text-white">Add Minutes</span>
              <span className="text-[9px] text-indigo-300 font-mono">+Extend</span>
            </button>

            {/* RIGHT: Fast Forward */}
            <button
              onClick={() => handleAction('right')}
              className="absolute right-2 w-28 h-20 rounded-2xl bg-slate-900/90 hover:bg-sky-950/80 border border-slate-800 hover:border-sky-500/50 flex flex-col items-center justify-center text-sky-400 shadow-lg transition-all hover:scale-105"
            >
              <FastForward className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold text-white">Fast Forward</span>
              <span className="text-[9px] text-sky-300 font-mono">Skip time</span>
            </button>

            {/* LEFT: Backward */}
            <button
              onClick={() => handleAction('left')}
              className="absolute left-2 w-28 h-20 rounded-2xl bg-slate-900/90 hover:bg-amber-950/80 border border-slate-800 hover:border-amber-500/50 flex flex-col items-center justify-center text-amber-400 shadow-lg transition-all hover:scale-105"
            >
              <Rewind className="w-5 h-5 mb-1" />
              <span className="text-xs font-bold text-white">Backward</span>
              <span className="text-[9px] text-amber-300 font-mono">Rewind</span>
            </button>

            {/* DOWN: Stop */}
            <button
              onClick={() => handleAction('down')}
              className="absolute bottom-2 w-28 h-20 rounded-2xl bg-slate-900/90 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/50 flex flex-col items-center justify-center text-rose-400 shadow-lg transition-all hover:scale-105"
            >
              <Square className="w-4 h-4 mb-1" />
              <span className="text-xs font-bold text-rose-300">Stop</span>
              <span className="text-[9px] text-rose-400/80 font-mono">Terminate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
