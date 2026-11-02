'use client';

import React, { useState } from 'react';
import {
  Hourglass,
  Plus,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { WaitingItem, WaitingStatus } from '../../lib/types';
import { Modal } from '../ui/Modal';

export function WaitingForView() {
  const { waitingItems, addWaitingItem, updateWaitingItem, deleteWaitingItem, projects } = useCommandCenter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WaitingItem | null>(null);

  // Form states
  const [waitingFor, setWaitingFor] = useState('');
  const [personOrEntity, setPersonOrEntity] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<WaitingStatus>('pending');

  const handleOpenCreate = () => {
    setEditingItem(null);
    setWaitingFor('');
    setPersonOrEntity('');
    setExpectedDate('');
    setFollowUpDate('');
    setProjectId('');
    setNotes('');
    setStatus('pending');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: WaitingItem) => {
    setEditingItem(item);
    setWaitingFor(item.waitingFor);
    setPersonOrEntity(item.personOrEntity);
    setExpectedDate(item.expectedDate || '');
    setFollowUpDate(item.followUpDate);
    setProjectId(item.projectId || '');
    setNotes(item.notes || '');
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitingFor.trim() || !personOrEntity.trim()) return;

    if (editingItem) {
      updateWaitingItem(editingItem.id, {
        waitingFor: waitingFor.trim(),
        personOrEntity: personOrEntity.trim(),
        expectedDate: expectedDate || undefined,
        followUpDate: followUpDate || new Date().toISOString().split('T')[0],
        projectId: projectId || undefined,
        notes: notes.trim(),
        status
      });
    } else {
      addWaitingItem({
        waitingFor: waitingFor.trim(),
        personOrEntity: personOrEntity.trim(),
        expectedDate: expectedDate || undefined,
        followUpDate: followUpDate || new Date().toISOString().split('T')[0],
        projectId: projectId || undefined,
        notes: notes.trim(),
        status
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
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Waiting For Tracker</h1>
            <p className="text-xs text-slate-400">
              Track blocked items, professors, lab hardware dispatches, and follow-up reminders.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Waiting Item</span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {waitingItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No pending items. Click &quot;Track Waiting Item&quot; above to track external dependencies.
          </div>
        ) : (
          waitingItems.map((item) => {
          const isDone = item.status === 'received';
          const proj = projects.find(p => p.id === item.projectId);

          return (
            <div
              key={item.id}
              className={`p-4 bg-slate-900 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isDone ? 'border-slate-800/50 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    ⏳ {item.waitingFor}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.status === 'followed_up'
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="text-indigo-400 flex items-center gap-1 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    {item.personOrEntity}
                  </span>
                  {item.expectedDate && (
                    <span>• Expected: {item.expectedDate}</span>
                  )}
                  <span className="text-amber-400 font-bold">• Follow-up: {item.followUpDate}</span>
                  {proj && (
                    <span className="text-slate-500">• {proj.name}</span>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!isDone ? (
                  <button
                    onClick={() => updateWaitingItem(item.id, { status: 'received' })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Received</span>
                  </button>
                ) : (
                  <button
                    onClick={() => updateWaitingItem(item.id, { status: 'pending' })}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Reopen
                  </button>
                )}

                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteWaitingItem(item.id)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Waiting Item' : 'New Waiting Item'}
        subtitle="Record external dependencies, contact person, and follow-up timeline"
      >
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">What are you waiting for?</label>
            <input
              type="text"
              value={waitingFor}
              onChange={(e) => setWaitingFor(e.target.value)}
              placeholder="e.g. Unit 3 PPT & Numerical problems"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Person or Entity</label>
            <input
              type="text"
              value={personOrEntity}
              onChange={(e) => setPersonOrEntity(e.target.value)}
              placeholder="e.g. Dr. Sharma / Innovation Cell"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Expected Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Follow-Up Alert Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Related Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="">None / General</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes &amp; Email Draft</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Context or prepared follow-up message..."
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
              {editingItem ? 'Save Changes' : 'Save Waiting Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
