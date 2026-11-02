'use client';

import React, { useState } from 'react';
import { useCommandCenter } from '../context/CommandCenterContext';
import { Sidebar } from '../components/shell/Sidebar';
import { Topbar } from '../components/shell/Topbar';
import { MobileNav } from '../components/shell/MobileNav';
import { CommandPalette } from '../components/shell/CommandPalette';
import { QuickCaptureModal } from '../components/shared/QuickCaptureModal';
import { ShouldIDoThisModal } from '../components/ai/ShouldIDoThisModal';
import { MinimalDistractionModal } from '../components/today/MinimalDistractionModal';

// Views
import { DashboardView } from '../components/dashboard/DashboardView';
import { TodayModeView } from '../components/today/TodayModeView';
import { TaskManagerView } from '../components/tasks/TaskManagerView';
import { CalendarView } from '../components/calendar/CalendarView';
import { ProjectsView } from '../components/projects/ProjectsView';
import { PomodoroView } from '../components/pomodoro/PomodoroView';
import { ResearchView } from '../components/research/ResearchView';
import { DiaryView } from '../components/diary/DiaryView';
import { HabitsView } from '../components/habits/HabitsView';
import { WaitingForView } from '../components/waiting/WaitingForView';
import { MoneyView } from '../components/money/MoneyView';
import { AnalyticsView } from '../components/analytics/AnalyticsView';
import { AICommandCenterView } from '../components/ai/AICommandCenterView';
import { MemoryManagerView } from '../components/ai/MemoryManagerView';
import { SettingsView } from '../components/settings/SettingsView';
import { RemindersWidget } from '../components/dashboard/RemindersWidget';
import { Sparkles, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';

function NotesWorkspaceView() {
  const { research, updateResearch, setCurrentView } = useCommandCenter();
  const [notesText, setNotesText] = useState(research.notes || '');
  const [saved, setSaved] = useState(false);

  const handleSaveNotes = () => {
    updateResearch({ notes: notesText });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Notes &amp; Reminders</h1>
          <p className="text-xs text-slate-400">
            Quick scratchpad notes, research observations, and active reminders.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('diary')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Open Diary &amp; Journal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Study &amp; Lab Scratchpad</h2>
              {saved && <span className="text-xs text-emerald-400">Saved</span>}
            </div>
            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={10}
              placeholder="Jot down quick lecture notes, formulas, or research observations..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveNotes}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>

        <RemindersWidget />
      </div>
    </div>
  );
}

function ResourcesWorkspaceView() {
  const { research, projects, setCurrentView } = useCommandCenter();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            Knowledge Resources &amp; References
          </h1>
          <p className="text-xs text-slate-400">
            Cataloged research literature, papers, and project reference links.
          </p>
        </div>
        <button
          onClick={() => setCurrentView('research')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
        >
          <span>Manage in Research</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800/90 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Literature Library ({research.literature.length})
          </h2>
        </div>
        {research.literature.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No literature resources added yet. Open the Research section to catalog papers.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {research.literature.map((paper) => (
              <div
                key={paper.id}
                className="px-5 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="text-xs font-medium text-white truncate">{paper.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {paper.authors} {paper.year ? `• ${paper.year}` : ''}{' '}
                    {paper.doi ? `• ${paper.doi}` : ''}
                  </p>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize shrink-0">
                  {paper.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Project Bookmarks</h2>
        {projects.flatMap((p) => p.links || []).length === 0 ? (
          <p className="text-xs text-slate-400">
            Active projects ({projects.length}) are linked under the Projects section.
          </p>
        ) : (
          <div className="space-y-2">
            {projects
              .flatMap((p) => p.links || [])
              .map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-400 hover:underline"
                >
                  <span>{link.title}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioWorkspaceView() {
  const [subTab, setSubTab] = useState<'analytics' | 'finances'>('analytics');

  return (
    <div className="space-y-5">
      <div className="max-w-5xl mx-auto flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h1 className="text-base font-semibold text-white">Portfolio, Analytics &amp; Finances</h1>
          <p className="text-xs text-slate-400">
            Track project milestones, focus hours, and financial records.
          </p>
        </div>
        <div className="inline-flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSubTab('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              subTab === 'analytics'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview &amp; Metrics
          </button>
          <button
            onClick={() => setSubTab('finances')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              subTab === 'finances'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Finances &amp; Budget
          </button>
        </div>
      </div>

      {subTab === 'analytics' ? <AnalyticsView /> : <MoneyView />}
    </div>
  );
}

function AutomationsWorkspaceView() {
  const { setShouldIDoThisOpen, activityLogs, setCurrentView } = useCommandCenter();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">
            AI Automations &amp; Decision Workflows
          </h1>
          <p className="text-xs text-slate-400">
            Automated workload protection, natural-language task mutations, and activity logs.
          </p>
        </div>
        <button
          onClick={() => setShouldIDoThisOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Evaluate Opportunity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-xl space-y-2">
          <h2 className="text-sm font-semibold text-white">Opportunity &amp; Capacity Guard</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatically compares new commitments against your next 8 days of deadlines and daily
            available focus hours.
          </p>
          <button
            onClick={() => setShouldIDoThisOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 pt-1"
          >
            <span>Run Evaluator</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-xl space-y-2">
          <h2 className="text-sm font-semibold text-white">Natural Language Actions</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create tasks, log research paper status, add reminders, and record expenses directly
            from the AI Assistant chat.
          </p>
          <button
            onClick={() => setCurrentView('ai')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 pt-1"
          >
            <span>Open AI Assistant</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/90 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Recent Automated &amp; System Activity</h2>
        </div>
        {activityLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No recent automated actions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {activityLogs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="px-5 py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200">{log.action}: </span>
                  <span className="text-slate-400">{log.description}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { currentView } = useCommandCenter();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'today':
        return <TodayModeView />;
      case 'tasks':
        return <TaskManagerView />;
      case 'calendar':
        return <CalendarView />;
      case 'projects':
      case 'academics':
        return <ProjectsView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'research':
        return <ResearchView />;
      case 'notes':
        return <NotesWorkspaceView />;
      case 'resources':
        return <ResourcesWorkspaceView />;
      case 'diary':
        return <DiaryView />;
      case 'skills':
      case 'habits':
        return <HabitsView />;
      case 'internships':
      case 'waiting':
        return <WaitingForView />;
      case 'portfolio':
        return <PortfolioWorkspaceView />;
      case 'money':
        return <MoneyView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'ai':
        return <AICommandCenterView />;
      case 'memory':
        return <MemoryManagerView />;
      case 'automations':
        return <AutomationsWorkspaceView />;
      case 'settings':
        return <SettingsView initialTab="preferences" />;
      case 'settings_sync':
        return <SettingsView initialTab="sync" />;
      case 'settings_security':
        return <SettingsView initialTab="security" />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Left Collapsible Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Global Topbar */}
        <Topbar />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Drawer & Bottom Navigation */}
      <MobileNav />

      {/* Command Palette (Ctrl + K) */}
      <CommandPalette />

      {/* Quick Capture Modal (Q) */}
      <QuickCaptureModal />

      {/* AI "Should I Do This?" Opportunity Evaluator */}
      <ShouldIDoThisModal />

      {/* Distraction Free Cockpit (Task + Timer + Progress) */}
      <MinimalDistractionModal />
    </div>
  );
}
