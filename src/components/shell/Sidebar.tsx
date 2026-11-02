'use client';

import React from 'react';
import {
  LayoutDashboard,
  Target,
  Calendar,
  CheckSquare,
  FolderKanban,
  Timer,
  BookOpen,
  GraduationCap,
  Microscope,
  FileText,
  Library,
  Briefcase,
  Flame,
  Award,
  MessageSquare,
  Brain,
  Workflow,
  Sliders,
  RefreshCw,
  Shield,
  ChevronLeft,
  ChevronRight,
  Focus,
  Command
} from 'lucide-react';
import { useCommandCenter, NavigationView } from '../../context/CommandCenterContext';

interface NavItem {
  id: NavigationView;
  label: string;
  icon: React.ElementType;
  badge?: number;
  hotkey?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const {
    currentView,
    setCurrentView,
    sidebarExpanded,
    setSidebarExpanded,
    tasks,
    setMinimalDistractionMode,
    settings
  } = useCommandCenter();

  const pendingTasksCount = tasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'planned'
  ).length;

  const navGroups: NavGroup[] = [
    {
      title: 'HOME',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'today', label: 'Today', icon: Target, hotkey: 'T' },
        { id: 'calendar', label: 'Calendar', icon: Calendar, hotkey: 'C' }
      ]
    },
    {
      title: 'PRODUCTIVITY',
      items: [
        {
          id: 'tasks',
          label: 'Tasks',
          icon: CheckSquare,
          badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
          hotkey: 'N'
        },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'pomodoro', label: 'Pomodoro', icon: Timer, hotkey: 'P' },
        { id: 'diary', label: 'Diary & Journal', icon: BookOpen, hotkey: 'D' }
      ]
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'academics', label: 'Academics', icon: GraduationCap },
        { id: 'research', label: 'Research', icon: Microscope, hotkey: 'R' },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'resources', label: 'Resources', icon: Library }
      ]
    },
    {
      title: 'CAREER',
      items: [
        { id: 'internships', label: 'Internships', icon: Briefcase },
        { id: 'skills', label: 'Skills', icon: Flame, hotkey: 'H' },
        { id: 'portfolio', label: 'Portfolio', icon: Award }
      ]
    },
    {
      title: 'AI',
      items: [
        { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
        { id: 'memory', label: 'Memory', icon: Brain },
        { id: 'automations', label: 'Automations', icon: Workflow }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'settings', label: 'Preferences', icon: Sliders },
        { id: 'settings_sync', label: 'Synchronization', icon: RefreshCw },
        { id: 'settings_security', label: 'Security', icon: Shield }
      ]
    }
  ];

  // Map legacy view aliases so active highlight remains accurate
  const isViewActive = (itemId: NavigationView) => {
    if (currentView === itemId) return true;
    if (itemId === 'skills' && currentView === 'habits') return true;
    if (itemId === 'internships' && currentView === 'waiting') return true;
    if (itemId === 'portfolio' && (currentView === 'analytics' || currentView === 'money')) return true;
    return false;
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950 transition-all duration-200 select-none z-30 ${
        sidebarExpanded ? 'w-60' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Command className="w-4 h-4 text-white" />
          </div>
          {sidebarExpanded && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold tracking-tight text-white truncate">
                {settings.productName || 'PRINCE'}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                Personal Workspace
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setSidebarExpanded((prev) => !prev)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Grouped Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-0.5">
            {sidebarExpanded && (
              <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isViewActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors group relative ${
                    !sidebarExpanded ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                  title={
                    !sidebarExpanded
                      ? `${group.title}: ${item.label}${item.hotkey ? ` (${item.hotkey})` : ''}`
                      : undefined
                  }
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {sidebarExpanded && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {sidebarExpanded && item.badge !== undefined && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                      {item.badge}
                    </span>
                  )}
                  {sidebarExpanded && item.hotkey && item.badge === undefined && (
                    <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hotkey}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Subtle Focus Mode Trigger */}
      <div className="p-2.5 border-t border-slate-800/80 shrink-0">
        <button
          onClick={() => setMinimalDistractionMode(true)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors ${
            sidebarExpanded ? 'justify-start' : 'justify-center'
          }`}
          title="Focus Mode (Esc to exit)"
        >
          <Focus className="w-4 h-4 text-indigo-400 shrink-0" />
          {sidebarExpanded && <span className="truncate">Focus Mode</span>}
        </button>
      </div>
    </aside>
  );
}
