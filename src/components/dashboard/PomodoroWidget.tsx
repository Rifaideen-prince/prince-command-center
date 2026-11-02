'use client';

import React, { useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, ArrowRight, Focus } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';
import { RadialTimerMenu } from '../pomodoro/RadialTimerMenu';

export function PomodoroWidget() {
  const {
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    adjustPomodoroMinutes,
    switchPomodoroMode,
    setCurrentView,
    setMinimalDistractionMode
  } = useCommandCenter();

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const minutes = Math.floor(pomodoro.timeLeftSeconds / 60);
  const seconds = pomodoro.timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(
    ((pomodoro.totalDurationSeconds - pomodoro.timeLeftSeconds) / pomodoro.totalDurationSeconds) * 100
  );

  const handlePointerDown = () => {
    holdTimerRef.current = setTimeout(() => {
      setRadialMenuOpen(true);
    }, 450);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleClick = () => {
    if (!radialMenuOpen) {
      if (pomodoro.isRunning) pausePomodoro();
      else startPomodoro();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Focus Engine</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {pomodoro.sessionCountToday} completed today
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimalDistractionMode(true)}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors"
            title="Full Minimal Focus Mode"
          >
            <Focus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('today')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => switchPomodoroMode('focus')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            pomodoro.mode === 'focus' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Focus (50m)
        </button>
        <button
          onClick={() => switchPomodoroMode('short_break')}
          className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
            pomodoro.mode === 'short_break' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Break (10m)
        </button>
      </div>

      {/* Timer Surface */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleClick}
          className="cursor-pointer group select-none transition-transform active:scale-95"
          title="Click to start/pause • Hold for 4-direction radial menu"
        >
          <ProgressRing
            progress={progressPercent}
            size={160}
            strokeWidth={7}
            color={pomodoro.mode === 'focus' ? '#6366f1' : '#10b981'}
            bgColor="rgba(30, 41, 59, 0.5)"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black font-mono text-white tracking-tight">
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                {pomodoro.isRunning ? <Pause className="w-3 h-3 text-indigo-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                {pomodoro.isRunning ? 'Active' : 'Paused'}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">Hold for radial</span>
            </div>
          </ProgressRing>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={resetPomodoro}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => adjustPomodoroMinutes(5)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-indigo-400 transition-colors"
            title="Add 5 minutes"
          >
            +5 min
          </button>
        </div>
      </div>

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
