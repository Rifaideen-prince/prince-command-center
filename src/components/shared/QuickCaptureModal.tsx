'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Bell, Wallet, Flame, BookOpen, X, Sparkles, Send } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Priority, ProjectCategory } from '../../lib/types';
import { diarySyncEngine } from '../../lib/diarySync';

export function QuickCaptureModal() {
  const {
    quickCaptureOpen,
    setQuickCaptureOpen,
    addTask,
    addQuickReminder,
    addTransaction,
    diaryEntries,
    projects
  } = useCommandCenter();

  const [activeTab, setActiveTab] = useState<'task' | 'reminder' | 'finance' | 'diary'>('task');
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [category, setCategory] = useState<ProjectCategory>('College');
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (quickCaptureOpen) {
      setInputText('');
      setAmount('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickCaptureOpen, activeTab]);

  if (!quickCaptureOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'task') {
      addTask({
        title: inputText.trim(),
        description: 'Captured via Quick Capture',
        priority,
        category,
        estimatedDuration: 45,
        actualDuration: 0,
        status: 'planned',
        dependencies: [],
        subtasks: [],
        recurrence: 'none',
        tags: ['quick-capture']
      });
    } else if (activeTab === 'reminder') {
      addQuickReminder(inputText.trim());
    } else if (activeTab === 'finance') {
      const parsedAmount = parseFloat(amount) || 0;
      addTransaction({
        type: txType,
        amount: parsedAmount,
        category: 'Quick Log',
        date: new Date().toISOString().split('T')[0],
        description: inputText.trim(),
        sourceOrReason: 'Quick Capture'
      });
    } else if (activeTab === 'diary') {
      const today = new Date().toISOString().split('T')[0];
      const existingServer = diaryEntries[today];
      const existingDraft = diarySyncEngine.getLocalDraft(today);
      const baseContent = existingDraft?.content ?? existingServer?.content ?? '';
      const baseTitle = existingDraft?.title || existingServer?.title || '';
      const nextContent = baseContent
        ? `${baseContent}\n\n${inputText.trim()}`
        : inputText.trim();
      diarySyncEngine.saveLocalDraft(today, nextContent, baseTitle, existingServer);
    }

    setQuickCaptureOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setQuickCaptureOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 text-slate-200 z-10">
        {/* Header with Type Selector */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'task' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Task</span>
            </button>
            <button
              onClick={() => setActiveTab('reminder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'reminder' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Reminder</span>
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'finance' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Finance</span>
            </button>
            <button
              onClick={() => setActiveTab('diary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'diary' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>
          <button
            onClick={() => setQuickCaptureOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              {activeTab === 'task' && 'What do you want to accomplish?'}
              {activeTab === 'reminder' && 'What should the system remind you of?'}
              {activeTab === 'finance' && 'Transaction description'}
              {activeTab === 'diary' && 'Quick reflection or note'}
            </label>
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeTab === 'task'
                  ? 'e.g. Synthesize Batch B3 graphene sample'
                  : activeTab === 'reminder'
                  ? 'e.g. Check spectrophotometer calibration at 2 PM'
                  : activeTab === 'finance'
                  ? 'e.g. 500ml Acetone solvent from Sigma'
                  : 'e.g. Today I discovered that square-wave pulses reduce edge oxidation...'
              }
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Conditional Controls for Tasks */}
          {activeTab === 'task' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="strategic">Strategic</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="College">College</option>
                  <option value="Research">Research</option>
                  <option value="NPTEL">NPTEL</option>
                  <option value="BS Degree">BS Degree</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Internship">Internship</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>
          )}

          {/* Conditional Controls for Finance */}
          {activeTab === 'finance' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                      txType === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                      txType === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">Press Enter to save</span>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Capture to System</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
