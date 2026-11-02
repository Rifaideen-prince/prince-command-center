'use client';

import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, X, Check, Flame, ChevronRight } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';
import { RadialTimerMenu } from '../pomodoro/RadialTimerMenu';

export function MinimalDistractionModal() {
  const {
    minimalDistractionMode,
    setMinimalDistractionMode,
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    adjustPomodoroMinutes,
    tasks,
    toggleTaskStatus
  } = useCommandCenter();

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (!minimalDistractionMode) return null;

  // Active or top priority task
  const activeTask =
    tasks.find(t => t.id === pomodoro.currentTaskId) ||
    tasks.find(t => t.status === 'in_progress') ||
    tasks.find(t => t.status === 'planned');

  const minutes = Math.floor(pomodoro.timeLeftSeconds / 60);
  const seconds = pomodoro.timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(
    ((pomodoro.totalDurationSeconds - pomodoro.timeLeftSeconds) / pomodoro.totalDurationSeconds) * 100
  );

  // Press-and-hold radial detection
  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      setRadialMenuOpen(true);
    }, 450); // 450ms hold triggers radial
  };

  const handlePointerUp = () => {
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-300 select-none">
      {/* Top Bar with Minimal Exit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-xs text-slate-400 font-medium">
            Focus Mode
          </span>
        </div>
        <button
          onClick={() => setMinimalDistractionMode(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit (Esc)</span>
        </button>
      </div>

      {/* Center Cockpit: Task, Timer, Progress */}
      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-8">
        {/* CURRENT TASK */}
        <div className="space-y-2">
          <span className="text-xs text-indigo-400 font-medium">
            Current Focus
          </span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
            {activeTask?.title || 'Deep Focus Session'}
          </h1>
          {activeTask?.description && (
            <p className="text-sm text-slate-400 max-w-md mx-auto line-clamp-2">
              {activeTask.description}
            </p>
          )}
        </div>

        {/* INTERACTIVE POMODORO TIMER SURFACE (Click: Pause/Start, Hold: Radial Menu) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleTimerClick}
          className="relative cursor-pointer group transition-transform active:scale-98"
          title="Click to pause/start • Press and hold for 4-direction radial menu"
        >
          <ProgressRing
            progress={progressPercent}
            size={280}
            strokeWidth={10}
            color={pomodoro.mode === 'focus' ? '#6366f1' : '#10b981'}
            bgColor="rgba(30, 41, 59, 0.6)"
            className="shadow-2xl shadow-indigo-500/10 rounded-full"
          >
            <div className="flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                {formattedTime}
              </span>
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400 mt-2 flex items-center gap-1.5">
                {pomodoro.isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-indigo-400" />
                    <span>RUNNING ({pomodoro.mode})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PAUSED (CLICK TO RESUME)</span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Press &amp; hold for radial controls</span>
            </div>
          </ProgressRing>
        </div>

        {/* PROGRESS METRICS & ACTIONS */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Session Progress</span>
            <span className="text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            {activeTask && (
              <button
                onClick={() => toggleTaskStatus(activeTask.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                  activeTask.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{activeTask.status === 'completed' ? 'Completed!' : 'Mark Task Complete'}</span>
              </button>
            )}
            <button
              onClick={resetPomodoro}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Habit & Session Tracker */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Sessions completed today: {pomodoro.sessionCountToday}</span>
        </div>
        <div>No distractions. Just pure execution.</div>
      </div>

      {/* 4-Direction Radial Control Menu */}
      <RadialTimerMenu
        isOpen={radialMenuOpen}
        onClose={() => setRadialMenuOpen(false)}
        onFastForward={(mins) => adjustPomodoroMinutes(-mins)}
        onRewind={(mins) => adjustPomodoroMinutes(mins)}
        onAddMinutes={(mins) => adjustPomodoroMinutes(mins)}
        onStop={() => resetPomodoro()}
      />
    </div>
  );
}
