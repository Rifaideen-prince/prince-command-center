'use client';

import React, { useState } from 'react';
import { Sparkles, X, CheckCircle, AlertCircle, Clock, Calendar, Check, ArrowRight, ShieldAlert } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { aiEngine, DecisionEvaluation } from '../../lib/aiEngine';
import { offlineStorage } from '../../lib/storage';

export function ShouldIDoThisModal() {
  const {
    shouldIDoThisOpen,
    setShouldIDoThisOpen,
    addWaitingItem,
    addTask,
    tasks,
    projects,
    research,
    settings,
    habits,
    diaryEntries,
    pomodoroSessions,
    calendarEvents,
    transactions,
    memories,
    aiActionLogs,
    insights,
    activityLogs,
    notifications,
    widgets,
    pomodoroSettings,
    waitingItems,
    quickReminders
  } = useCommandCenter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('8');
  const [result, setResult] = useState<DecisionEvaluation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  if (!shouldIDoThisOpen) return null;

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setAnalyzing(true);
    setActionDone(false);

    // Current DB snapshot for AI evaluation
    const currentDb = {
      tasks,
      projects,
      research,
      habits,
      waitingItems,
      quickReminders,
      diaryEntries,
      pomodoroSessions,
      calendarEvents,
      transactions,
      memories,
      aiActionLogs,
      insights,
      activityLogs,
      notifications,
      settings,
      widgets,
      pomodoroSettings,
      version: 1,
      lastSyncedAt: new Date().toISOString()
    };

    setTimeout(() => {
      const evaluation = aiEngine.evaluateOpportunity(
        title,
        description,
        parseFloat(hours) || 6,
        currentDb
      );
      setResult(evaluation);
      setAnalyzing(false);
    }, 600);
  };

  const handleAddToFutureQueue = () => {
    addWaitingItem({
      waitingFor: `Future Opportunity: ${title}`,
      personOrEntity: 'Self (Review after exams)',
      expectedDate: '2026-10-10',
      followUpDate: '2026-10-10',
      notes: `${description} | Required: ~${hours}h | Recommendation: ${result?.recommendation}`,
      status: 'pending'
    });
    setActionDone(true);
  };

  const handleAcceptAndSchedule = () => {
    addTask({
      title: `Kickoff: ${title}`,
      description: `${description} (Strategic Score: ${result?.strategicScore}/100)`,
      priority: 'high',
      category: 'Projects',
      estimatedDuration: Math.min(120, (parseFloat(hours) || 2) * 60),
      actualDuration: 0,
      status: 'planned',
      dependencies: [],
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Define scope and milestones', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute first working session', completed: false }
      ],
      recurrence: 'none',
      tags: ['evaluated-opportunity']
    });
    setActionDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setShouldIDoThisOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl p-6 text-slate-200 z-10">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">AI Executive: &quot;Should I Do This?&quot;</h2>
              <p className="text-xs text-slate-400">Evaluates commitments against your active workload &amp; deadlines.</p>
            </div>
          </div>
          <button
            onClick={() => setShouldIDoThisOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        {!result && (
          <form onSubmit={handleEvaluate} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Opportunity / Commitment / Course / Hackathon
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Join 48h AI Hackathon, Enroll in Quantum Computing course, Take external freelance gig"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Context &amp; Details
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is required? Who is organizing it? What is the expected deliverable?"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Time Required (Hours)
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
                max="200"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={analyzing}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzing ? 'Analyzing Workload & Constraints...' : 'Evaluate Feasibility'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Evaluation Output Screen */}
        {result && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-200">
            {/* Prominent Verdict Card */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                result.verdict === 'YES'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : result.verdict === 'NOT NOW'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-400'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-400'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.verdict === 'YES' && <CheckCircle className="w-8 h-8 text-emerald-400" />}
                {result.verdict === 'NOT NOW' && <Clock className="w-8 h-8 text-amber-400" />}
                {result.verdict === 'NO' && <ShieldAlert className="w-8 h-8 text-rose-400" />}
                <div>
                  <div className="text-xl font-black tracking-wider uppercase">{result.verdict}</div>
                  <div className="text-xs text-slate-300 font-medium">{result.summary}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Strategic Alignment</div>
                <div className="text-lg font-bold font-mono text-white">{result.strategicScore}/100</div>
              </div>
            </div>

            {/* Analysis details */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-400 shrink-0">Workload Conflict:</span>
                <span className="text-slate-200">{result.workloadConflict}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-400 shrink-0">AI Recommendation:</span>
                <span className="text-indigo-300 font-medium">{result.recommendation}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setResult(null)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Test Another Opportunity
              </button>

              <div className="flex items-center gap-2">
                {result.verdict === 'NOT NOW' && !actionDone && (
                  <button
                    onClick={handleAddToFutureQueue}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold rounded-xl transition-all"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Add to Future Queue (Post-Exam)</span>
                  </button>
                )}

                {result.verdict === 'YES' && !actionDone && (
                  <button
                    onClick={handleAcceptAndSchedule}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept &amp; Create Task</span>
                  </button>
                )}

                {actionDone && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4" /> Added to your command center!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
