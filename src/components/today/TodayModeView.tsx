'use client';

import React, { useRef, useState } from 'react';
import {
  Target,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Focus,
  Check
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';
import { RadialTimerMenu } from '../pomodoro/RadialTimerMenu';
import { Badge } from '../ui/Badge';

export function TodayModeView() {
  const {
    tasks,
    pomodoro,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    adjustPomodoroMinutes,
    toggleTaskStatus,
    setMinimalDistractionMode,
    settings
  } = useCommandCenter();

  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active / priority task
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const currentTask =
    activeTasks.find(t => t.id === pomodoro.currentTaskId) ||
    activeTasks.find(t => t.status === 'in_progress') ||
    activeTasks[0];

  const nextTask = activeTasks.filter(t => t.id !== currentTask?.id)[0];

  // Pomodoro calculations
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

  const handleTimerClick = () => {
    if (!radialMenuOpen) {
      if (pomodoro.isRunning) pausePomodoro();
      else startPomodoro();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800/90 p-5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">Today&apos;s Focus</h1>
            <p className="text-xs text-slate-400">Immediate next actions and focused execution.</p>
          </div>
        </div>

        <button
          onClick={() => setMinimalDistractionMode(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors"
        >
          <Focus className="w-4 h-4 text-indigo-400" />
          <span>Fullscreen Focus (Esc)</span>
        </button>
      </div>

      {/* Main Cockpit Split: Left Hero Task, Right Timer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: What Should I Do Now? */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Current Priority
              </span>
              {currentTask && <Badge variant={currentTask.priority}>{currentTask.priority.toUpperCase()}</Badge>}
            </div>

            {currentTask ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white leading-snug">
                  {currentTask.title}
                </h2>
                {currentTask.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentTask.description}
                  </p>
                )}

                {/* Subtask checklist */}
                {currentTask.subtasks && currentTask.subtasks.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Immediate Subtasks
                    </span>
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      {currentTask.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2 text-xs">
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                              st.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-300'}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                All daily priorities completed!
              </div>
            )}
          </div>

          {/* Action Button */}
          {currentTask && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-mono">
                Est: {currentTask.estimatedDuration}m • {currentTask.category}
              </div>
              <button
                onClick={() => toggleTaskStatus(currentTask.id)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Mark Finished</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Embedded Interactive Focus Timer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            {pomodoro.mode.toUpperCase()} SPRINT
          </span>

          <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onClick={handleTimerClick}
            className="cursor-pointer group select-none transition-transform active:scale-95"
            title="Click to start/pause • Hold for 4-direction radial menu"
          >
            <ProgressRing
              progress={progressPercent}
              size={200}
              strokeWidth={8}
              color={pomodoro.mode === 'focus' ? '#6366f1' : '#10b981'}
              bgColor="rgba(30, 41, 59, 0.6)"
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black font-mono text-white tracking-tight">
                  {formattedTime}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1 flex items-center gap-1">
                  {pomodoro.isRunning ? <Pause className="w-3 h-3 text-indigo-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  {pomodoro.isRunning ? 'Active' : 'Paused'}
                </span>
                <span className="text-[9px] text-slate-500 mt-1">Press &amp; hold for radial</span>
              </div>
            </ProgressRing>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetPomodoro}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => adjustPomodoroMinutes(5)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-indigo-400"
            >
              +5 min
            </button>
            <button
              onClick={() => adjustPomodoroMinutes(15)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-indigo-400"
            >
              +15 min
            </button>
          </div>
        </div>
      </div>

      {/* Up Next & Available Time Gauge */}
      {nextTask && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold shrink-0">
              Up Next:
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate">
              {nextTask.title}
            </span>
          </div>
          <Badge variant={nextTask.priority} size="sm">{nextTask.priority}</Badge>
        </div>
      )}

      {/* Radial Menu Modal */}
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
