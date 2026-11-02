'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  Plus,
  Bell,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Menu,
  Sparkles,
  Check
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export function Topbar() {
  const {
    setMobileDrawerOpen,
    setCommandPaletteOpen,
    setQuickCaptureOpen,
    setShouldIDoThisOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    syncStatus,
    settings,
    updateSettings,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    syncWithGoogleDrive
  } = useCommandCenter();

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      setCurrentDateStr(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const cycleTheme = () => {
    if (settings.theme === 'dark') updateSettings({ theme: 'light' });
    else if (settings.theme === 'light') updateSettings({ theme: 'system' });
    else updateSettings({ theme: 'dark' });
  };

  const handleManualSync = async () => {
    try {
      const msg = await syncWithGoogleDrive();
      setSyncFeedback(msg);
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback('Sync failed. Local data preserved.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={() => {
              if (!globalSearchQuery) setCommandPaletteOpen(true);
            }}
            placeholder="Search or jump to... (Ctrl + K)"
            className="w-full pl-8 pr-16 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="absolute inset-y-1 right-1.5 px-1.5 bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono rounded border border-slate-700/60 flex items-center gap-0.5 transition-colors"
            title="Open Command Palette (Ctrl+K)"
          >
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Right: Quick actions, Date, Sync State, Notifications, Theme */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShouldIDoThisOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
          title="Evaluate Opportunity Against Workload"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Evaluate Commitment</span>
        </button>

        <button
          onClick={() => setQuickCaptureOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
          title="Quick Capture (Press Q)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Capture</span>
        </button>

        <div className="hidden xl:flex items-center gap-2 px-2 text-xs text-slate-400 border-l border-slate-800/80 ml-1 pl-3">
          <span>{currentDateStr}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300">{currentTimeStr}</span>
        </div>

        {/* Synchronization Status Indicator */}
        <button
          onClick={handleManualSync}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs transition-colors hover:border-slate-700"
          title={`Workspace sync: ${syncStatus}. Click to back up to Google Drive`}
        >
          {syncStatus === 'synced' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">Synced</span>
            </>
          )}
          {syncStatus === 'syncing' && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">Syncing</span>
            </>
          )}
          {syncStatus === 'offline' && (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px] text-amber-400 font-medium">Offline</span>
            </>
          )}
          {syncStatus === 'error' && (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline text-[11px] text-rose-400 font-medium">Error</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-xs font-semibold text-white">
                  Notifications ({unreadCount})
                </span>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="mt-2 max-h-72 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No new notifications.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title={`Theme: ${settings.theme} (Click to switch)`}
          aria-label="Toggle theme"
        >
          {settings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-slate-300" />
          ) : settings.theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Laptop className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>

      {syncFeedback && (
        <div className="absolute top-14 right-4 mt-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 shadow-lg flex items-center gap-2 z-50">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{syncFeedback}</span>
        </div>
      )}
    </header>
  );
}
