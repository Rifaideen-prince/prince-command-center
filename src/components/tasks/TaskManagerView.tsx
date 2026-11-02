'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  Circle,
  GripVertical,
  Tag,
  AlertCircle,
  Layers,
  ChevronDown,
  Trash2,
  Edit2
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { Task, TaskStatus, Priority, ProjectCategory } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export function TaskManagerView() {
  const { tasks, addTask, updateTask, deleteTask, reorderTasks, toggleTaskStatus } = useCommandCenter();

  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states for creating/editing task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [category, setCategory] = useState<ProjectCategory>('College');
  const [status, setStatus] = useState<TaskStatus>('planned');
  const [estimatedDuration, setEstimatedDuration] = useState('60');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  // Drag-and-Drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const statuses: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'inbox', label: 'Inbox', color: 'border-slate-700' },
    { id: 'planned', label: 'Planned', color: 'border-indigo-500/40' },
    { id: 'in_progress', label: 'In Progress', color: 'border-amber-500/40' },
    { id: 'blocked', label: 'Blocked', color: 'border-rose-500/40' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500/40' }
  ];

  const filteredTasks = tasks.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = (targetStatus?: TaskStatus) => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('high');
    setCategory('College');
    setStatus(targetStatus || 'planned');
    setEstimatedDuration('60');
    setSubtasks([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    setPriority(task.priority);
    setCategory(task.category as ProjectCategory);
    setStatus(task.status);
    setEstimatedDuration(String(task.estimatedDuration));
    setSubtasks(task.subtasks || []);
    setModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { id: `sub-${Date.now()}`, title: subtaskInput.trim(), completed: false }]);
    setSubtaskInput('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? `${deadline}T18:00:00Z` : undefined,
        priority,
        category,
        status,
        estimatedDuration: parseInt(estimatedDuration) || 60,
        subtasks
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? `${deadline}T18:00:00Z` : undefined,
        priority,
        category,
        status,
        estimatedDuration: parseInt(estimatedDuration) || 60,
        actualDuration: 0,
        dependencies: [],
        subtasks,
        recurrence: 'none',
        tags: [category.toLowerCase()]
      });
    }

    setModalOpen(false);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropStatus = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    updateTask(draggedTaskId, { status: newStatus });
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Task Engine &amp; Kanban</h1>
            <p className="text-xs text-slate-400">
              Drag-and-drop workflow, priorities, subtask progress, and deadline timers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks by name, tag, or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="College">College</option>
            <option value="Research">Research</option>
            <option value="NPTEL">NPTEL</option>
            <option value="BS Degree">BS Degree</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Internship">Internship</option>
            <option value="Personal">Personal</option>
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="strategic">Strategic</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {activeTab === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statuses.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropStatus(e, col.id)}
                className={`bg-slate-900/80 border rounded-2xl p-3 flex flex-col space-y-3 min-h-[450px] transition-colors ${col.color}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column task items */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.map((task) => {
                    const completedSubs = (task.subtasks || []).filter(s => s.completed).length;
                    const totalSubs = (task.subtasks || []).length;
                    const subPercent = totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 cursor-grab active:cursor-grabbing hover:border-slate-700 transition-all shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant={task.priority} size="sm">{task.priority}</Badge>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEditModal(task)}
                              className="p-1 text-slate-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-white leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Subtask progress bar */}
                        {totalSubs > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Subtasks</span>
                              <span>{completedSubs}/{totalSubs} ({subPercent}%)</span>
                            </div>
                            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${subPercent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer tags & deadline */}
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-900">
                          <span className="truncate">{task.category}</span>
                          {task.deadline && (
                            <span className="text-indigo-400">
                              {new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add task button in column */}
                <button
                  onClick={() => handleOpenCreateModal(col.id)}
                  className="w-full py-1.5 rounded-xl border border-dashed border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700 text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No tasks found. Click &quot;Add Task&quot; above to create one.
            </div>
          ) : (
            filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-950/40 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 truncate">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className="text-slate-500 hover:text-indigo-400 shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex flex-col truncate">
                  <span
                    className={`text-xs font-semibold truncate ${
                      task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-0.5">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>Status: {task.status}</span>
                    <span>•</span>
                    <span>Est: {task.estimatedDuration}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={task.priority}>{task.priority}</Badge>
                <button
                  onClick={() => handleOpenEditModal(task)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )}

      {/* Task Creation / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        subtitle="Manage priority, deadline, category, and subtasks"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTask} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Synthesize Batch B3 graphene sample"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description &amp; Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Context, experimental parameters, or reference links..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
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

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="inbox">Inbox</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Est. Duration (min)</label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                min="5"
                max="600"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Subtasks Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              Subtasks ({subtasks.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                placeholder="e.g. Read literature section 3.2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Add Subtask
              </button>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div
                    onClick={() => handleToggleSubtask(st.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                        st.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-700'
                      }`}
                    >
                      ✓
                    </span>
                    <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {st.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
