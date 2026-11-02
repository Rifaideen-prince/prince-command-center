'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  CloudUpload,
  RotateCcw,
  Clock,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { DiaryEntry, DiarySyncStatus } from '../../lib/types';
import { diarySyncEngine } from '../../lib/diarySync';

export function DiaryView() {
  const { diaryEntries, saveDiaryEntry } = useCommandCenter();

  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [syncStatus, setSyncStatus] = useState<DiarySyncStatus>('Draft saved locally');
  const [lastLocalSaveAt, setLastLocalSaveAt] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const localSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loadedDateRef = useRef<string | null>(null);
  const latestContentRef = useRef<{ date: string; content: string; title: string }>({
    date: selectedDate,
    content: '',
    title: ''
  });

  // Keep ref updated for beforeunload flushing
  useEffect(() => {
    latestContentRef.current = { date: selectedDate, content, title };
  }, [selectedDate, content, title]);

  // Load entry or local draft ONLY when selectedDate changes (or when initial DB entry first appears for an untouched date)
  const uploadedEntry = diaryEntries[selectedDate];

  useEffect(() => {
    const resolved = diarySyncEngine.resolveInitialEntryState(selectedDate, uploadedEntry);
    setContent(resolved.content);
    setTitle(resolved.title);
    setSyncStatus(resolved.status);
    setLastLocalSaveAt(resolved.lastLocalSaveAt || null);
    setUploadError(null);
    setConflictDetected(false);
    setAiInsights(uploadedEntry?.aiInsights || []);
    loadedDateRef.current = selectedDate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // If the database finishes async loading after mount and the user hasn't typed anything yet, sync initial state once
  useEffect(() => {
    if (
      uploadedEntry &&
      loadedDateRef.current === selectedDate &&
      !content &&
      !diarySyncEngine.getLocalDraft(selectedDate)?.content
    ) {
      const resolved = diarySyncEngine.resolveInitialEntryState(selectedDate, uploadedEntry);
      setContent(resolved.content);
      setTitle(resolved.title);
      setSyncStatus(resolved.status);
      setLastLocalSaveAt(resolved.lastLocalSaveAt || null);
      setAiInsights(uploadedEntry.aiInsights || []);
    }
  }, [uploadedEntry, selectedDate, content]);

  // Flush local draft immediately on page unload / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { date, content: curContent, title: curTitle } = latestContentRef.current;
      const currentUploaded = diaryEntries[date];
      if (curContent || curTitle || currentUploaded) {
        diarySyncEngine.saveLocalDraft(date, curContent, curTitle, currentUploaded);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (localSaveTimerRef.current) {
        clearTimeout(localSaveTimerRef.current);
      }
    };
  }, [diaryEntries]);

  // Local autosave helper (never triggers global database/cloud sync)
  const triggerLocalAutosave = useCallback(
    (nextContent: string, nextTitle: string, date: string) => {
      const currentUploaded = diaryEntries[date];

      // Update status immediately based on whether an uploaded version exists
      const nextStatus = diarySyncEngine.computeSyncStatus(
        date,
        nextContent,
        nextTitle,
        currentUploaded,
        false,
        false
      );
      setSyncStatus(nextStatus);
      setUploadError(null);

      // Save to local storage immediately & update timestamp
      const savedDraft = diarySyncEngine.saveLocalDraft(
        date,
        nextContent,
        nextTitle,
        currentUploaded
      );
      setLastLocalSaveAt(savedDraft.savedAt);
    },
    [diaryEntries]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setContent(newVal);

    if (localSaveTimerRef.current) {
      clearTimeout(localSaveTimerRef.current);
    }
    // Persist immediately to local draft storage so even an instant refresh never loses a single character
    triggerLocalAutosave(newVal, title, selectedDate);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    triggerLocalAutosave(content, newTitle, selectedDate);
  };

  // Manual Cloud/Database Upload Handler
  const handleUploadDiary = async (forceOverwrite: boolean = false) => {
    if (isUploading || diarySyncEngine.isUploadInProgress(selectedDate)) return;

    setIsUploading(true);
    setSyncStatus('Uploading...');
    setUploadError(null);
    setConflictDetected(false);

    const result = await diarySyncEngine.uploadDiaryEntry(
      selectedDate,
      content,
      title,
      diaryEntries[selectedDate],
      (updatedEntry: DiaryEntry) => {
        saveDiaryEntry(updatedEntry);
      },
      {
        forceOverwrite,
        aiInsights,
        simulateDelayMs: 250
      }
    );

    setIsUploading(false);
    setSyncStatus(result.status);

    if (!result.success) {
      setUploadError(result.error || 'Upload failed, local draft preserved.');
      if (result.conflictDetected) {
        setConflictDetected(true);
      }
    } else if (result.entry) {
      setLastLocalSaveAt(result.entry.updatedAt);
    }
  };

  // Formatting toolbar helper (inserts markdown without recreating editor or losing focus)
  const insertFormatting = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const replacement = `${prefix}${selectedText}${suffix}`;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(nextContent);
    triggerLocalAutosave(nextContent, title, selectedDate);

    requestAnimationFrame(() => {
      el.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      el.setSelectionRange(start + prefix.length, newCursorPos);
    });
  };

  const handleInsertTimestamp = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    insertFormatting(`\n[${nowTime}] `, '', '');
  };

  // Date details
  const dateObj = new Date(`${selectedDate}T00:00:00`);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDateFormatted = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const wordCount = diarySyncEngine.countWords(content);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(`${fullDateFormatted} — ${dayName}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T00:00:00`);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleRunAiAnalysis = () => {
    if (!content.trim()) return;
    setIsAiAnalyzing(true);

    setTimeout(() => {
      const insights = [
        'Structured reflection noted on current priorities and synthesis milestones.',
        'Consider scheduling a dedicated focus block tomorrow morning for your primary deliverable.',
        'Steady daily writing consistency maintained.'
      ];
      setAiInsights(insights);
      setIsAiAnalyzing(false);
    }, 500);
  };

  const formattedLocalSaveTime = lastLocalSaveAt
    ? new Date(lastLocalSaveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  // Synchronization Status Badge Styling
  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'Uploaded ✓':
        return (
          <span
            data-testid="diary-sync-status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Uploaded ✓</span>
          </span>
        );
      case 'Uploading...':
        return (
          <span
            data-testid="diary-sync-status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading...</span>
          </span>
        );
      case 'Changes pending':
        return (
          <span
            data-testid="diary-sync-status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Changes pending</span>
          </span>
        );
      case 'Upload failed':
        return (
          <span
            data-testid="diary-sync-status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Upload failed</span>
          </span>
        );
      case 'Draft saved locally':
      default:
        return (
          <span
            data-testid="diary-sync-status"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/70"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Draft saved locally</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-20">
      {/* Top Bar: Date Navigation & Manual Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800/80 px-5 py-4 rounded-xl">
        {/* Left: Date Selector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="relative flex items-center">
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Right: Synchronization Status Indicator & Manual [ UPLOAD DIARY ] Button */}
        <div className="flex flex-wrap items-center gap-3">
          {renderSyncBadge()}

          {syncStatus === 'Upload failed' && (
            <button
              type="button"
              onClick={() => handleUploadDiary(false)}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}

          <button
            type="button"
            data-testid="upload-diary-button"
            onClick={() => handleUploadDiary(false)}
            disabled={isUploading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isUploading
                ? 'bg-indigo-600/50 text-white/70 cursor-not-allowed'
                : syncStatus === 'Uploaded ✓'
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm ring-1 ring-indigo-400/30'
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4" />
            )}
            <span>UPLOAD DIARY</span>
          </button>
        </div>
      </div>

      {/* Upload Error or Conflict Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-rose-300">{uploadError}</p>
              <p className="text-slate-400 mt-0.5">
                Your local draft is safely saved on this device and has not been lost.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {conflictDetected && (
              <button
                type="button"
                onClick={() => handleUploadDiary(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors"
              >
                Keep My Local Version &amp; Upload
              </button>
            )}
            <button
              type="button"
              onClick={() => handleUploadDiary(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Retry Upload
            </button>
          </div>
        </div>
      )}

      {/* Distraction-Free Digital Notebook Surface */}
      <div className="bg-slate-900 border border-slate-800/90 rounded-xl shadow-sm overflow-hidden">
        {/* Notebook Header */}
        <div className="px-6 sm:px-10 pt-7 pb-5 border-b border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-indigo-400 tracking-wide">
                {dayName}
              </span>
              <h1 className="text-2xl font-semibold text-white tracking-tight mt-0.5">
                {fullDateFormatted}
              </h1>
            </div>

            {/* Metadata: Word Count, Local Draft Status & Optional Timestamp */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>

              {showTimestamp && formattedLocalSaveTime && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Local draft: {formattedLocalSaveTime}
                  </span>
                </>
              )}

              {uploadedEntry?.uploadedAt && (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-slate-400">
                    Last uploaded:{' '}
                    {new Date(uploadedEntry.uploadedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Optional Entry Title Input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={`${dayName} Reflection — Add an optional title...`}
            className="w-full bg-transparent text-base font-medium text-slate-200 placeholder-slate-500 focus:outline-none pt-1"
          />
        </div>

        {/* Minimal Formatting Toolbar */}
        <div className="px-6 sm:px-10 py-2.5 bg-slate-950/50 border-b border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n## ', '\n', 'Section Heading')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Heading"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '', 'List item')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n> ', '', 'Note or quote')}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={handleInsertTimestamp}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
              title="Insert current time stamp"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTimestamp((prev) => !prev)}
              className="px-2 py-1 rounded-md text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showTimestamp ? 'Hide Timestamp' : 'Show Timestamp'}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
              title="Copy entry to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Distraction-Free Writing Area */}
        <div className="px-6 sm:px-10 py-6">
          <textarea
            ref={textareaRef}
            data-testid="diary-editor-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="Write freely without interruptions. Your thoughts are automatically saved to this device as you type, and uploaded only when you click UPLOAD DIARY..."
            rows={18}
            className="w-full min-h-[420px] bg-transparent text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-y leading-relaxed font-sans selection:bg-indigo-500/30"
          />
        </div>

        {/* Subtle Footer with Optional AI Reflection */}
        <div className="px-6 sm:px-10 py-4 bg-slate-950/40 border-t border-slate-800/70 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {syncStatus === 'Uploaded ✓'
                ? 'All changes for this date are synchronized.'
                : syncStatus === 'Changes pending'
                ? 'You have edited this entry since the last upload. Click UPLOAD DIARY to synchronize.'
                : 'Changes are saved locally on this device. Click UPLOAD DIARY when you finish writing.'}
            </span>

            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAiAnalyzing || !content.trim()}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-40 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiAnalyzing ? 'Reflecting...' : 'Generate Reflection Summary'}</span>
            </button>
          </div>

          {aiInsights.length > 0 && (
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
              {aiInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-semibold">•</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
