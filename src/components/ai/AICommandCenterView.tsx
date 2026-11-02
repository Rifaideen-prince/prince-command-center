'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  X,
  Check,
  ArrowRight,
  Loader2,
  FileText,
  Play,
  CheckSquare
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { aiEngine } from '../../lib/aiEngine';

interface ChatAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

interface ProposedAction {
  label: string;
  onClick: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
  toolExecuted?: string;
  actions?: ProposedAction[];
  timestamp: string;
}

export function AICommandCenterView() {
  const context = useCommandCenter();
  const {
    setShouldIDoThisOpen,
    setCurrentView,
    startPomodoro,
    replaceDatabase
  } = context;

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: `Hello Rifai. How can I help you organize your day or progress on your work?

You can ask me to plan your available hours, add or complete tasks, log research progress, or evaluate a new commitment against your current deadlines.`,
      actions: [
        { label: 'Plan my day', onClick: () => handleSend('Plan my day') },
        { label: 'Evaluate a commitment', onClick: () => setShouldIDoThisOpen(true) }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = Array.from(files).map((file) => ({
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const buildFollowUpActions = (toolExecuted?: string): ProposedAction[] => {
    switch (toolExecuted) {
      case 'generate_smart_schedule':
        return [
          {
            label: 'Start 50m Focus Session',
            onClick: () => {
              startPomodoro();
              setCurrentView('pomodoro');
            }
          },
          {
            label: 'Open Today View',
            onClick: () => setCurrentView('today')
          }
        ];
      case 'create_task':
      case 'complete_task':
      case 'reschedule_task':
        return [
          {
            label: 'Open Tasks',
            onClick: () => setCurrentView('tasks')
          }
        ];
      case 'update_research_paper':
        return [
          {
            label: 'Open Research',
            onClick: () => setCurrentView('research')
          }
        ];
      case 'log_expense':
        return [
          {
            label: 'Open Finances',
            onClick: () => setCurrentView('money')
          }
        ];
      default:
        return [
          {
            label: 'Start Focus Session',
            onClick: () => {
              startPomodoro();
              setCurrentView('pomodoro');
            }
          },
          {
            label: 'Evaluate Opportunity',
            onClick: () => setShouldIDoThisOpen(true)
          }
        ];
    }
  };

  const handleSend = async (textOverride?: string) => {
    const prompt = (textOverride ?? input).trim();
    if (!prompt && attachments.length === 0) return;

    const currentAttachments = textOverride ? [] : [...attachments];
    const effectivePrompt =
      prompt || `Attached: ${currentAttachments.map((a) => a.name).join(', ')}`;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: effectivePrompt,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) {
      setInput('');
      setAttachments([]);
    }
    setIsProcessing(true);

    const currentDb = {
      tasks: context.tasks,
      projects: context.projects,
      research: context.research,
      habits: context.habits,
      waitingItems: context.waitingItems,
      quickReminders: context.quickReminders,
      diaryEntries: context.diaryEntries,
      pomodoroSessions: context.pomodoroSessions,
      calendarEvents: context.calendarEvents,
      transactions: context.transactions,
      memories: context.memories,
      aiActionLogs: context.aiActionLogs,
      insights: context.insights,
      activityLogs: context.activityLogs,
      notifications: context.notifications,
      settings: context.settings,
      widgets: context.widgets,
      pomodoroSettings: context.pomodoroSettings,
      version: 1,
      lastSyncedAt: new Date().toISOString()
    };

    try {
      const res = await aiEngine.processCommand(effectivePrompt, currentDb);

      if (res.updatedDb) {
        replaceDatabase(res.updatedDb);
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: res.response,
        toolExecuted: res.toolExecuted,
        actions: buildFollowUpActions(res.toolExecuted),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          content:
            'Unable to process that request right now. Your local workspace data remains intact.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickSuggestions = [
    'Plan my day',
    'I have 3 hours free. What should I do?',
    'Add task: Review research notes',
    'I finished Paper 7',
    'Remind me to follow up tomorrow'
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Clean Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Personal Assistant</h1>
          <p className="text-xs text-slate-400">
            Ask questions, schedule work blocks, or update tasks and notes conversationally.
          </p>
        </div>

        <button
          onClick={() => setShouldIDoThisOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
        >
          Should I Do This?
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-1">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-medium text-slate-400">
                  {isUser ? 'You' : 'Assistant'}
                </span>
                <span className="text-[10px] text-slate-500">{m.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl rounded-xl px-4 py-3.5 text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800/90 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Attachments if any */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.attachments.map((att) => (
                      <span
                        key={att.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 text-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{att.name}</span>
                        <span className="opacity-70">({att.sizeLabel})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Executed change confirmation */}
                {m.toolExecuted && m.toolExecuted !== 'query_context' && (
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-xs text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Workspace updated ({m.toolExecuted.replace(/_/g, ' ')})</span>
                  </div>
                )}

                {/* Action buttons when AI proposes changes */}
                {!isUser && m.actions && m.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {m.actions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={act.onClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                      >
                        <span>{act.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Clear Processing Indicator */}
        {isProcessing && (
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-medium text-slate-400 mb-1 px-1">Assistant</span>
            <div className="bg-slate-900 border border-slate-800/90 rounded-xl px-4 py-3 text-xs text-slate-300 inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Working on your request...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area with Attachments & Suggestions */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2.5 shrink-0">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {quickSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Pending Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{att.name}</span>
                <span className="text-slate-500">({att.sizeLabel})</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-slate-400 hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition-colors"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Attach file or note"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your assistant..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isProcessing}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
