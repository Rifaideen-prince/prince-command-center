'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Shield,
  Keyboard,
  Check,
  HardDrive,
  Sliders,
  Lock
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export function SettingsView({ initialTab = 'preferences' }: { initialTab?: 'preferences' | 'sync' | 'security' }) {
  const {
    currentView,
    setCurrentView,
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    syncWithGoogleDrive,
    clearAllData
  } = useCommandCenter();

  const [activeTab, setActiveTab] = useState<'preferences' | 'sync' | 'security'>(initialTab);
  const [productName, setProductName] = useState(settings.productName || 'PRINCE');
  const [googleEmail, setGoogleEmail] = useState(
    settings.googleAccount || 'rifaideenprofessional@gmail.com'
  );
  const [dailyHours, setDailyHours] = useState(String(settings.dailyAvailableHours || 8));
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentView === 'settings_sync') setActiveTab('sync');
    else if (currentView === 'settings_security') setActiveTab('security');
    else if (currentView === 'settings') setActiveTab('preferences');
  }, [currentView]);

  const handleTabChange = (tab: 'preferences' | 'sync' | 'security') => {
    setActiveTab(tab);
    if (tab === 'preferences') setCurrentView('settings');
    else if (tab === 'sync') setCurrentView('settings_sync');
    else setCurrentView('settings_security');
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      productName: productName.trim() || 'PRINCE',
      googleAccount: googleEmail.trim(),
      dailyAvailableHours: parseFloat(dailyHours) || 8
    });
    setFeedback('Preferences saved');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const ok = await importBackup(text);
        if (ok) {
          setFeedback('Backup imported and restored');
        } else {
          setFeedback('Invalid backup file format');
        }
      } catch {
        setFeedback('Error reading backup file');
      }
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleDriveBackup = async () => {
    setFeedback('Synchronizing with Google Drive...');
    const msg = await syncWithGoogleDrive();
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleResetAllData = async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all workspace data and reset to a clean state?'
      )
    ) {
      await clearAllData();
      setFeedback('Workspace reset to a clean state');
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header & Section Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Settings</h1>
          <p className="text-xs text-slate-400">
            Manage workspace preferences, synchronization, and data security.
          </p>
        </div>

        <div className="inline-flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleTabChange('preferences')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
          <button
            onClick={() => handleTabChange('sync')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'sync'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Synchronization</span>
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="px-4 py-2.5 bg-slate-900 border border-indigo-500/30 rounded-lg text-xs text-slate-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* TAB 1: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800/90 rounded-xl space-y-4">
            <h2 className="text-sm font-semibold text-white">Workspace Preferences</h2>
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="PRINCE"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Daily Available Focus Hours
                  </label>
                  <input
                    type="number"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    min="2"
                    max="18"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Appearance Theme
                  </label>
                  <div className="flex gap-2">
                    {(['dark', 'light', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateSettings({ theme: t })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${
                          settings.theme === t
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Sound Effects
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateSettings({ soundEffects: true })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        settings.soundEffects
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSettings({ soundEffects: false })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        !settings.soundEffects
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Muted
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-6 bg-slate-900 border border-slate-800/90 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { label: 'Command Palette', key: 'Ctrl+K' },
                { label: 'Quick Capture', key: 'Q' },
                { label: 'Today View', key: 'T' },
                { label: 'Tasks', key: 'N' },
                { label: 'Diary & Journal', key: 'D' },
                { label: 'Skills & Habits', key: 'H' },
                { label: 'Research', key: 'R' },
                { label: 'Close / Exit', key: 'Esc' }
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center"
                >
                  <span className="text-slate-400">{s.label}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px]">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYNCHRONIZATION */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800/90 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">
                Cloud Backup &amp; Synchronization Behaviour
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tasks, projects, calendar, habits, and memories synchronize automatically. Diary &amp;
              Journal entries use local autosave while typing and synchronize when you click{' '}
              <strong className="text-slate-200">UPLOAD DIARY</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Connected Google Drive Account
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={handleDriveBackup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync to Google Drive</span>
              </button>

              <button
                onClick={exportBackup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Snapshot</span>
              </button>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON Backup</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800/90 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">
                Data Privacy, AI Trust &amp; Storage Control
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your workspace data and local diary drafts are stored on your device in IndexedDB and
              local storage. You have full control over AI action permissions and data retention.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                AI Assistant Execution Permission
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    { id: 'confirm_destructive', label: 'Confirm Destructive Changes' },
                    { id: 'always_confirm', label: 'Always Ask Before Changes' },
                    { id: 'autonomous', label: 'Autonomous Updates' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSettings({ aiTrustLevel: opt.id })}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                      settings.aiTrustLevel === opt.id
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-semibold text-rose-400">Reset Workspace Data</h3>
                <p className="text-[11px] text-slate-400">
                  Permanently clear all local tasks, projects, habits, and journal records.
                </p>
              </div>
              <button
                onClick={handleResetAllData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
