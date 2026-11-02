'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Trash2,
  Edit2
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Project, ProjectCategory, ProjectStatus, Priority } from '../../lib/types';
import { ProgressRing } from '../ui/ProgressRing';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export function ProjectsView() {
  const { projects, addProject, updateProject, deleteProject, setCurrentView } = useCommandCenter();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('College');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [priority, setPriority] = useState<Priority>('high');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('50');

  const categories: ProjectCategory[] = [
    'College',
    'NPTEL',
    'BS Degree',
    'Hackathon',
    'Projects',
    'Internship',
    'Research'
  ];

  const filtered = projects.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setGoal('');
    setCategory('College');
    setStatus('active');
    setPriority('high');
    setDeadline('');
    setProgress('30');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setGoal(p.goal);
    setCategory(p.category);
    setStatus(p.status);
    setPriority(p.priority);
    setDeadline(p.deadline || '');
    setProgress(String(p.progress));
    setModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        description: description.trim(),
        goal: goal.trim(),
        category,
        status,
        priority,
        deadline: deadline || undefined,
        progress: parseInt(progress) || 0
      });
    } else {
      addProject({
        name: name.trim(),
        description: description.trim(),
        goal: goal.trim(),
        category,
        status,
        priority,
        deadline: deadline || undefined,
        progress: parseInt(progress) || 0,
        links: []
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Project Portfolio</h1>
            <p className="text-xs text-slate-400">
              College, NPTEL, BS Degree, Hackathon, Research, and Internship tracking.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            filterCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          All Categories ({projects.length})
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterCategory === c ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No projects found. Click &quot;New Project&quot; above to add your first project.
          </div>
        ) : (
          filtered.map((proj) => (
          <div
            key={proj.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {proj.category}
                </span>
                <div className="flex items-center gap-1">
                  <Badge variant={proj.priority} size="sm">{proj.priority}</Badge>
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProject(proj.id)}
                    className="p-1 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {proj.goal && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-indigo-400 block mb-0.5 font-mono">Target Goal:</strong>
                  {proj.goal}
                </div>
              )}
            </div>

            {/* Bottom Progress Ring & Deadline */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProgressRing
                  progress={proj.progress}
                  size={42}
                  strokeWidth={4}
                  color="#6366f1"
                  bgColor="rgba(30, 41, 59, 0.6)"
                >
                  <span className="text-[10px] font-mono font-bold text-white">{proj.progress}%</span>
                </ProgressRing>
                <div className="text-[10px] font-mono text-slate-400">
                  <span>Status: {proj.status}</span>
                </div>
              </div>

              {proj.deadline && (
                <span className="text-[10px] font-mono text-slate-400">
                  Due {proj.deadline}
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>

      {/* Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        subtitle="Specify category, goal, priority, and completion milestones"
      >
        <form onSubmit={handleSaveProject} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NPTEL Nanotechnology Certification"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Scope and purpose..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Milestone / Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Score >90% Elite+Gold in exam"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="strategic">Strategic</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Progress (%)</label>
              <input
                type="number"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                min="0"
                max="100"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
