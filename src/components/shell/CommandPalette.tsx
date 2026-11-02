'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckSquare,
  Flame,
  BookOpen,
  Calendar,
  FolderKanban,
  Microscope,
  Hourglass,
  Wallet,
  Bot,
  Brain,
  Timer,
  Plus,
  Focus,
  BarChart3,
  X,
  ArrowRight
} from 'lucide-react';
import { useCommandCenter, NavigationView } from '../../context/CommandCenterContext';

interface PaletteCommand {
  id: string;
  category: 'Commands' | 'Navigation' | 'Tasks' | 'Projects' | 'Research';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCurrentView,
    setQuickCaptureOpen,
    setMinimalDistractionMode,
    setShouldIDoThisOpen,
    tasks,
    projects,
    research,
    startPomodoro,
    pausePomodoro,
    pomodoro
  } = useCommandCenter();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Base list of dynamic & static commands
  const allCommands: PaletteCommand[] = [
    {
      id: 'cmd-pomodoro-toggle',
      category: 'Commands',
      title: pomodoro.isRunning ? 'Pause Focus Pomodoro' : 'Start Focus Pomodoro (50 min)',
      subtitle: `${Math.floor(pomodoro.timeLeftSeconds / 60)}m remaining`,
      icon: Timer,
      action: () => {
        if (pomodoro.isRunning) pausePomodoro();
        else startPomodoro();
      }
    },
    {
      id: 'cmd-quick-capture',
      category: 'Commands',
      title: 'Quick Capture',
      subtitle: 'Add task, reminder, note, or transaction instantly',
      icon: Plus,
      action: () => setQuickCaptureOpen(true)
    },
    {
      id: 'cmd-minimal-distraction',
      category: 'Commands',
      title: 'Enter Minimal Distraction Mode',
      subtitle: 'Deep focus cockpit with only Task + Timer + Progress',
      icon: Focus,
      action: () => setMinimalDistractionMode(true)
    },
    {
      id: 'cmd-should-i-do-this',
      category: 'Commands',
      title: 'Ask AI: "Should I Do This?"',
      subtitle: 'Evaluate new opportunity against deadlines and available hours',
      icon: Bot,
      action: () => setShouldIDoThisOpen(true)
    },
    {
      id: 'nav-today',
      category: 'Navigation',
      title: "Open Today's Cockpit",
      subtitle: 'What should I do now? Immediate next action',
      icon: CheckSquare,
      action: () => setCurrentView('today')
    },
    {
      id: 'nav-research',
      category: 'Navigation',
      title: 'Open Research Lab (Electrochemical Graphene)',
      subtitle: 'Papers, methodology, experiments, and results',
      icon: Microscope,
      action: () => setCurrentView('research')
    },
    {
      id: 'nav-diary',
      category: 'Navigation',
      title: 'Open Diary & Personal Journal',
      subtitle: 'Write reflections, logs, and get AI insights',
      icon: BookOpen,
      action: () => setCurrentView('diary')
    },
    {
      id: 'nav-habits',
      category: 'Navigation',
      title: 'Open Habit Tracker',
      subtitle: 'Log radial progress and maintain streaks',
      icon: Flame,
      action: () => setCurrentView('habits')
    },
    {
      id: 'nav-calendar',
      category: 'Navigation',
      title: 'Open Calendar & Schedule',
      subtitle: 'Check exams, deadlines, and time blocks',
      icon: Calendar,
      action: () => setCurrentView('calendar')
    },
    {
      id: 'nav-waiting',
      category: 'Navigation',
      title: 'Open Waiting For Tracker',
      subtitle: 'External dependencies, Dr. Sharma slides, SIH hardware',
      icon: Hourglass,
      action: () => setCurrentView('waiting')
    },
    {
      id: 'nav-money',
      category: 'Navigation',
      title: 'Open Money Management',
      subtitle: 'Log income, expenses, and check net savings',
      icon: Wallet,
      action: () => setCurrentView('money')
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      title: 'Open Analytics & Weekly Review',
      subtitle: 'Deep focus time, completion rates, and AI review',
      icon: BarChart3,
      action: () => setCurrentView('analytics')
    },
    {
      id: 'nav-memory',
      category: 'Navigation',
      title: 'Open AI Long-term Memory Bank',
      subtitle: 'Permanent, temporary, and project memory items',
      icon: Brain,
      action: () => setCurrentView('memory')
    },
  ];

  // Append live tasks to search
  tasks.forEach((t) => {
    allCommands.push({
      id: `task-${t.id}`,
      category: 'Tasks',
      title: t.title,
      subtitle: `${t.priority.toUpperCase()} • ${t.category} • ${t.status}`,
      icon: CheckSquare,
      action: () => setCurrentView('tasks')
    });
  });

  // Append projects
  projects.forEach((p) => {
    allCommands.push({
      id: `proj-${p.id}`,
      category: 'Projects',
      title: p.name,
      subtitle: `${p.category} • ${p.progress}% completed`,
      icon: FolderKanban,
      action: () => setCurrentView('projects')
    });
  });

  // Filter commands
  const filtered = allCommands.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[selectedIndex];
      if (selected) {
        selected.action();
        setCommandPaletteOpen(false);
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-200">
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. 'Pomodoro', 'Graphene', 'NPTEL')..."
            className="w-full px-3 py-4 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands or entities found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/20 border border-indigo-500/30 text-white' : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium truncate">{cmd.title}</span>
                      {cmd.subtitle && (
                        <span className="text-[10px] text-slate-400 truncate">{cmd.subtitle}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{cmd.category}</span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono">PRINCE CORE v1.0</span>
        </div>
      </div>
    </div>
  );
}
