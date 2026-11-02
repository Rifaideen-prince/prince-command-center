'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { CalendarEvent, Priority } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export function CalendarView() {
  const { calendarEvents, tasks, projects } = useCommandCenter();

  const [currentDate, setCurrentDate] = useState(new Date('2026-10-03'));
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Merge calendarEvents + tasks with deadlines into unified calendar items
  const allItems = [
    ...calendarEvents.map(e => ({
      id: e.id,
      title: e.title,
      dateStr: e.startDate.split('T')[0],
      type: e.type,
      priority: e.priority || 'high',
      isEvent: true
    })),
    ...tasks
      .filter(t => t.deadline)
      .map(t => ({
        id: `task-${t.id}`,
        title: t.title,
        dateStr: t.deadline!.split('T')[0],
        type: 'deadline',
        priority: t.priority,
        isTask: true,
        taskData: t
      }))
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const daysGrid = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    daysGrid.push(day);
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Smart Academic &amp; Research Calendar</h1>
            <p className="text-xs text-slate-400">
              Correlates deadlines, exams, laboratory time slots, and workload density.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'month' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'agenda' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Agenda
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white font-mono px-2">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-mono font-bold text-slate-400">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-28 bg-slate-950/40 rounded-xl border border-slate-800/40"
                  />
                );
              }

              const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayItems = allItems.filter(item => item.dateStr === formattedDayStr);
              const isToday = formattedDayStr === '2026-10-03';

              return (
                <div
                  key={`day-${day}`}
                  className={`h-28 p-2 rounded-xl border flex flex-col justify-between transition-colors overflow-hidden ${
                    isToday
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEvent(item)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-opacity hover:opacity-90 ${
                          item.priority === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.priority === 'strategic'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {allItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No calendar events or task deadlines scheduled.
            </div>
          ) : (
            allItems
              .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
              .map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedEvent(item)}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-950/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono shrink-0">
                    <span className="text-[10px] text-slate-500 block uppercase">
                      {new Date(item.dateStr).toLocaleDateString([], { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {new Date(item.dateStr).getDate()}
                    </span>
                  </div>

                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-white truncate">{item.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Type: {item.type} • Priority: {item.priority}
                    </span>
                  </div>
                </div>

                <Badge variant={item.priority as Priority}>{item.priority}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          title="Scheduled Commitment Details"
          subtitle={selectedEvent.dateStr}
        >
          <div className="space-y-4 py-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Title</span>
              <h3 className="text-sm font-bold text-white mt-0.5">{selectedEvent.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={selectedEvent.priority}>{selectedEvent.priority}</Badge>
              <span className="text-slate-400 font-mono">Date: {selectedEvent.dateStr}</span>
            </div>
            {selectedEvent.taskData?.description && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                {selectedEvent.taskData.description}
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
