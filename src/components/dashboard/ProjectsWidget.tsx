'use client';

import React from 'react';
import { FolderKanban, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { ProgressRing } from '../ui/ProgressRing';

export function ProjectsWidget() {
  const { projects, setCurrentView } = useCommandCenter();

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active Projects</h3>
            <span className="text-[11px] text-slate-400 font-mono">Milestone Tracking</span>
          </div>
        </div>
        <button
          onClick={() => setCurrentView('projects')}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>All ({projects.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {activeProjects.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No active projects. Create a project in the Projects view.
          </p>
        ) : (
          activeProjects.slice(0, 4).map((proj) => (
          <div
            key={proj.id}
            onClick={() => setCurrentView(proj.category === 'Research' ? 'research' : 'projects')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 truncate">
              <ProgressRing
                progress={proj.progress}
                size={38}
                strokeWidth={3.5}
                color="#0284c7"
                bgColor="rgba(30, 41, 59, 0.6)"
              >
                <span className="text-[10px] font-mono font-bold text-white">{proj.progress}%</span>
              </ProgressRing>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors truncate">
                  {proj.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Category: {proj.category}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400">
                {proj.deadline ? `Due ${proj.deadline}` : 'Continuous'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
    </div>
  );
}
