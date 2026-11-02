'use client';

import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  EyeOff,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { MemoryItem, MemoryType } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

export function MemoryManagerView() {
  const { memories, addMemory, updateMemory, deleteMemory } = useCommandCenter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [content, setContent] = useState('');
  const [type, setType] = useState<MemoryType>('permanent');
  const [source, setSource] = useState('');
  const [importance, setImportance] = useState<'high' | 'medium' | 'low'>('high');

  const filtered = memories.filter(m => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return m.content.toLowerCase().includes(q) || m.source.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingMemory(null);
    setContent('');
    setType('permanent');
    setSource('User Stored Rule');
    setImportance('high');
    setModalOpen(true);
  };

  const handleOpenEdit = (m: MemoryItem) => {
    setEditingMemory(m);
    setContent(m.content);
    setType(m.type);
    setSource(m.source);
    setImportance(m.importance);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingMemory) {
      updateMemory(editingMemory.id, {
        content: content.trim(),
        type,
        source: source.trim() || 'User Preference',
        importance
      });
    } else {
      addMemory({
        content: content.trim(),
        type,
        source: source.trim() || 'User Preference',
        importance,
        pinned: false,
        disabled: false
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Long-term Memory Bank</h1>
            <p className="text-xs text-slate-400">
              Inspect, edit, pin, and control exact context items stored across conversations.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Memory</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stored memory content or sources..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1">
          {(['all', 'permanent', 'temporary', 'project'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterType === t ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No memories stored. Click &quot;Add Memory&quot; above to store custom directives or preferences for the AI engine.
          </div>
        ) : (
          filtered.map((mem) => (
          <div
            key={mem.id}
            className={`p-5 bg-slate-900 border rounded-2xl space-y-3 transition-colors ${
              mem.disabled ? 'opacity-40 border-slate-800' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                  mem.type === 'permanent'
                    ? 'bg-purple-500/20 text-purple-300'
                    : mem.type === 'temporary'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-sky-500/20 text-sky-300'
                }`}
              >
                {mem.type} memory
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateMemory(mem.id, { pinned: !mem.pinned })}
                  className={`p-1 transition-colors ${
                    mem.pinned ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title={mem.pinned ? 'Unpin' : 'Pin Memory'}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateMemory(mem.id, { disabled: !mem.disabled })}
                  className="p-1 text-slate-500 hover:text-white"
                  title={mem.disabled ? 'Enable Memory' : 'Disable Memory'}
                >
                  {mem.disabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleOpenEdit(mem)}
                  className="p-1 text-slate-500 hover:text-white"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteMemory(mem.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {mem.content}
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Source: {mem.source}</span>
              <span className="capitalize">Importance: {mem.importance}</span>
            </div>
          </div>
        ))
      )}
    </div>

      {/* Memory Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMemory ? 'Edit Stored Memory' : 'Create New AI Memory'}
        subtitle="Specify memory classification, source context, and priority"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Memory Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="e.g. Always prioritize Electrochemical Graphene synthesis rigor..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Memory Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MemoryType)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="permanent">Permanent (Goals &amp; Workstyle)</option>
                <option value="temporary">Temporary (Current Semester Crunch)</option>
                <option value="project">Project (Technical Decisions)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Importance</label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Source / Attribution</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. User Profile / Lab Run Batch B2"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Save Memory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
