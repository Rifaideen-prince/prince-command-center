'use client';

import React from 'react';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  MessageSquare,
  Timer,
  Menu,
  X,
  Plus,
  Flame,
  BookOpen,
  Calendar,
  FolderKanban,
  Microscope,
  GraduationCap,
  FileText,
  Library,
  Briefcase,
  Award,
  Brain,
  Workflow,
  Sliders,
  RefreshCw,
  Shield,
  Focus,
  Command
} from 'lucide-react';
import { useCommandCenter, NavigationView } from '../../context/CommandCenterContext';

export function MobileNav() {
  const {
    currentView,
    setCurrentView,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    setQuickCaptureOpen,
    setMinimalDistractionMode,
    settings
  } = useCommandCenter();

  const mainTabs: { id: NavigationView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'pomodoro', label: 'Timer', icon: Timer },
    { id: 'ai', label: 'Assistant', icon: MessageSquare }
  ];

  const drawerGroups: {
    title: string;
    items: { id: NavigationView; label: string; icon: React.ElementType }[];
  }[] = [
    {
      title: 'HOME',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'today', label: 'Today', icon: Target },
        { id: 'calendar', label: 'Calendar', icon: Calendar }
      ]
    },
    {
      title: 'PRODUCTIVITY',
      items: [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'projects', label: 'Projects', icon: FolderKanban },
        { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
        { id: 'diary', label: 'Diary & Journal', icon: BookOpen }
      ]
    },
    {
      title: 'KNOWLEDGE',
      items: [
        { id: 'academics', label: 'Academics', icon: GraduationCap },
        { id: 'research', label: 'Research', icon: Microscope },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'resources', label: 'Resources', icon: Library }
      ]
    },
    {
      title: 'CAREER',
      items: [
        { id: 'internships', label: 'Internships', icon: Briefcase },
        { id: 'skills', label: 'Skills', icon: Flame },
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

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-15 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around px-2 z-40">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}

        {/* Quick Capture Center Action */}
        <button
          onClick={() => setQuickCaptureOpen(true)}
          className="flex flex-col items-center justify-center w-14 h-12 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
          aria-label="Quick capture"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Capture</span>
        </button>

        {/* Menu Drawer Trigger */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${
            mobileDrawerOpen ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[82%] bg-slate-950 border-r border-slate-800 h-full flex flex-col z-10 p-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Command className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm text-white">
                  {settings.productName || 'PRINCE'}
                </span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {drawerGroups.map((group) => (
                <div key={group.title} className="space-y-0.5">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMinimalDistractionMode(true);
                  setMobileDrawerOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200"
              >
                <Focus className="w-4 h-4 text-indigo-400" />
                <span>Focus Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
