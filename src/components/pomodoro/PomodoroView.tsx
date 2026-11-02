'use client';

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Focus,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';
import { RadialTimerMenu } from './RadialTimerMenu';
import { Modal } from '../ui/Modal';

export function PomodoroView() {
  const {
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    adjustPomodoroMinutes,
    switchPomodoroMode,
    pomodoroSettings,
    updatePomodoroSettings,
    tasks,
    toggleTaskStatus,
    setMinimalDistractionMode
  } = useCommandCenter();

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const currentTask =
    activeTasks.find((t) => t.id === (selectedTaskId || pomodoro.currentTaskId)) ||
    activeTasks.find((t) => t.status === 'in_progress') ||
    activeTasks[0];

  const minutes = Math.floor(pomodoro.timeLeftSeconds / 60);
  const seconds = pomodoro.timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.round(
    ((pomodoro.totalDurationSeconds - pomodoro.timeLeftSeconds) /
      Math.max(1, pomodoro.totalDurationSeconds)) *
      100
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

  const handleTimerClick = () => {
    if (!radialMenuOpen) {
      if (pomodoro.isRunning) pausePomodoro();
      else startPomodoro();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Pomodoro Focus</h1>
          <p className="text-xs text-slate-400">
            {pomodoro.sessionCountToday} sessions completed today
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimalDistractionMode(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
          >
            <Focus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fullscreen</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Timer Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center space-y-8">
        {/* Mode Switcher */}
        <div className="inline-flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => switchPomodoroMode('focus')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pomodoro.mode === 'focus'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus ({pomodoroSettings.focusDuration}m)
          </button>
          <button
            onClick={() => switchPomodoroMode('short_break')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pomodoro.mode === 'short_break'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break ({pomodoroSettings.shortBreak}m)
          </button>
          <button
            onClick={() => switchPomodoroMode('long_break')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              pomodoro.mode === 'long_break'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break ({pomodoroSettings.longBreak}m)
          </button>
        </div>

        {/* Center Radial Timer Surface */}
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleTimerClick}
          className="cursor-pointer select-none transition-transform active:scale-98"
          title="Click to start or pause • Press and hold for 4-direction radial menu"
        >
          <ProgressRing
            progress={progressPercent}
            size={260}
            strokeWidth={8}
            color={pomodoro.mode === 'focus' ? '#4f46e5' : '#10b981'}
            bgColor="rgba(148, 163, 184, 0.14)"
          >
            <div className="flex flex-col items-center">
              <span className="text-5xl font-semibold font-mono text-white tracking-tight">
                {formattedTime}
              </span>
              <span className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                {pomodoro.isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-slate-400" />
                    <span>Click to Start</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Hold for radial controls
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Unobtrusive Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => (pomodoro.isRunning ? pausePomodoro() : startPomodoro())}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            {pomodoro.isRunning ? 'Pause' : 'Start Session'}
          </button>
          <button
            onClick={() => adjustPomodoroMinutes(5)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            +5 min
          </button>
          <button
            onClick={() => adjustPomodoroMinutes(15)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            +15 min
          </button>
          <button
            onClick={resetPomodoro}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Current Focus Task Link */}
        {currentTask && (
          <div className="w-full max-w-md pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-left">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-slate-400 block">Focusing on</span>
              <select
                value={currentTask.id}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-200 focus:outline-none truncate mt-0.5"
              >
                {activeTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => toggleTaskStatus(currentTask.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white shrink-0 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complete</span>
            </button>
          </div>
        )}
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

      {/* Timer Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Timer Durations"
        subtitle="Customize focus and break intervals"
      >
        <div className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Focus (min)</label>
              <input
                type="number"
                value={pomodoroSettings.focusDuration}
                onChange={(e) =>
                  updatePomodoroSettings({ focusDuration: parseInt(e.target.value) || 50 })
                }
                min="5"
                max="180"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Short Break (min)</label>
              <input
                type="number"
                value={pomodoroSettings.shortBreak}
                onChange={(e) =>
                  updatePomodoroSettings({ shortBreak: parseInt(e.target.value) || 10 })
                }
                min="1"
                max="60"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Long Break (min)</label>
              <input
                type="number"
                value={pomodoroSettings.longBreak}
                onChange={(e) =>
                  updatePomodoroSettings({ longBreak: parseInt(e.target.value) || 20 })
                }
                min="5"
                max="90"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setSettingsOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

