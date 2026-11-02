// Dedicated Synchronization & Local Autosave Engine for Diary & Journal
// Separates local draft persistence from manual cloud/database upload.

import type { DiaryEntry, DiaryLocalDraft, DiarySyncStatus } from './types';

const DIARY_DRAFTS_STORAGE_KEY = 'prince_diary_drafts_v1';

export interface DiaryUploadResult {
  success: boolean;
  status: DiarySyncStatus;
  entry?: DiaryEntry;
  error?: string;
  conflictDetected?: boolean;
}

export interface DiaryUploadOptions {
  isOnline?: boolean;
  forceOverwrite?: boolean;
  simulateDelayMs?: number;
   productivityRating?: number;
  aiInsights?: string[];
}

export class DiarySyncEngine {
  private memoryDrafts: Record<string, DiaryLocalDraft> = {};
  private inFlightUploads: Set<string> = new Set();

  constructor() {
    this.loadDraftsFromStorage();
  }

  private loadDraftsFromStorage(): Record<string, DiaryLocalDraft> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(DIARY_DRAFTS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, DiaryLocalDraft>;
          this.memoryDrafts = { ...this.memoryDrafts, ...parsed };
        }
      } catch {
        // Ignore storage read errors
      }
    }
    return this.memoryDrafts;
  }

  private persistDraftsToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(DIARY_DRAFTS_STORAGE_KEY, JSON.stringify(this.memoryDrafts));
      } catch {
        // Ignore storage quota errors
      }
    }
  }

  public countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  /**
   * Saves changes strictly to local draft storage without triggering global database/cloud sync.
   */
  public saveLocalDraft(
    date: string,
    content: string,
    title: string,
    uploadedEntry?: DiaryEntry
  ): DiaryLocalDraft {
    this.loadDraftsFromStorage();
    const existingDraft = this.memoryDrafts[date];

    const draft: DiaryLocalDraft = {
      date,
      title,
      content,
      wordCount: this.countWords(content),
      savedAt: new Date().toISOString(),
      baseVersion: existingDraft?.baseVersion ?? uploadedEntry?.version ?? (uploadedEntry ? 1 : 0),
      baseUpdatedAt: existingDraft?.baseUpdatedAt ?? uploadedEntry?.updatedAt,
    };

    this.memoryDrafts[date] = draft;
    this.persistDraftsToStorage();
    return draft;
  }

  /**
   * Retrieves a saved local draft for a specific date.
   */
  public getLocalDraft(date: string): DiaryLocalDraft | null {
    this.loadDraftsFromStorage();
    return this.memoryDrafts[date] || null;
  }

  /**
   * Resolves what state to display when opening a given date's diary.
   * Preserves unsent local drafts across refreshes and compares with uploaded database state.
   */
  public resolveInitialEntryState(
    date: string,
    uploadedEntry?: DiaryEntry
  ): {
    content: string;
    title: string;
    status: DiarySyncStatus;
    hasUnsentDraft: boolean;
    lastLocalSaveAt?: string;
  } {
    const draft = this.getLocalDraft(date);

    if (draft && uploadedEntry) {
      const uploadedTitle = uploadedEntry.title || '';
      const isModified =
        draft.content !== uploadedEntry.content ||
        (draft.title || '') !== uploadedTitle;

      if (isModified) {
        return {
          content: draft.content,
          title: draft.title,
          status: 'Changes pending',
          hasUnsentDraft: true,
          lastLocalSaveAt: draft.savedAt,
        };
      }

      return {
        content: uploadedEntry.content,
        title: uploadedTitle,
        status: 'Uploaded ✓',
        hasUnsentDraft: false,
        lastLocalSaveAt: draft.savedAt,
      };
    }

    if (draft && !uploadedEntry) {
      return {
        content: draft.content,
        title: draft.title,
        status: 'Draft saved locally',
        hasUnsentDraft: draft.content.trim().length > 0 || draft.title.trim().length > 0,
        lastLocalSaveAt: draft.savedAt,
      };
    }

    if (uploadedEntry) {
      // Sync baseline into local draft cache so future edits know the base version
      this.memoryDrafts[date] = {
        date,
        title: uploadedEntry.title || '',
        content: uploadedEntry.content,
        wordCount: uploadedEntry.wordCount,
        savedAt: uploadedEntry.updatedAt,
        baseVersion: uploadedEntry.version ?? 1,
        baseUpdatedAt: uploadedEntry.updatedAt,
      };
      this.persistDraftsToStorage();

      return {
        content: uploadedEntry.content,
        title: uploadedEntry.title || '',
        status: 'Uploaded ✓',
        hasUnsentDraft: false,
        lastLocalSaveAt: uploadedEntry.updatedAt,
      };
    }

    return {
      content: '',
      title: '',
      status: 'Draft saved locally',
      hasUnsentDraft: false,
    };
  }

  /**
   * Computes the exact synchronization status indicator for a diary entry.
   */
  public computeSyncStatus(
    date: string,
    localContent: string,
    localTitle: string,
    uploadedEntry?: DiaryEntry,
    isUploading: boolean = false,
    uploadFailed: boolean = false
  ): DiarySyncStatus {
    if (isUploading || this.inFlightUploads.has(date)) {
      return 'Uploading...';
    }
    if (uploadFailed) {
      return 'Upload failed';
    }
    if (!uploadedEntry) {
      return 'Draft saved locally';
    }

    const uploadedTitle = uploadedEntry.title || '';
    const isModified =
      localContent !== uploadedEntry.content ||
      localTitle.trim() !== uploadedTitle.trim();

    if (isModified) {
      return 'Changes pending';
    }

    return 'Uploaded ✓';
  }

  public isUploadInProgress(date: string): boolean {
    return this.inFlightUploads.has(date);
  }

  /**
   * Manual Upload handler for [ UPLOAD DIARY ].
   * - Prevents duplicate uploads
   * - Checks online status
   * - Checks version/timestamp conflict so a newer server version is never silently overwritten
   * - Updates existing diary record for that date instead of creating duplicates
   */
  public async uploadDiaryEntry(
    date: string,
    content: string,
    title: string,
    existingServerEntry: DiaryEntry | undefined,
    onCommitToDb: (entry: DiaryEntry) => Promise<void> | void,
    options: DiaryUploadOptions = {}
  ): Promise<DiaryUploadResult> {
    // 1. Prevent duplicate concurrent uploads for the same date
    if (this.inFlightUploads.has(date)) {
      return {
        success: false,
        status: 'Uploading...',
        error: 'Upload already in progress for this date.',
      };
    }

    // Ensure latest changes are saved in local draft before attempting upload
    const draft = this.saveLocalDraft(date, content, title, existingServerEntry);

    this.inFlightUploads.add(date);

    try {
      const delayMs = options.simulateDelayMs ?? 150;
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // 2. Check internet connectivity
      const online =
        options.isOnline !== undefined
          ? options.isOnline
          : typeof navigator !== 'undefined'
          ? navigator.onLine
          : true;

      if (!online) {
        return {
          success: false,
          status: 'Upload failed',
          error: 'No internet connection. Your draft is safely preserved on this device.',
        };
      }

      // 3. Conflict detection: Never overwrite a newer server version with an older local version silently
      if (existingServerEntry && !options.forceOverwrite) {
        const serverVersion = existingServerEntry.version ?? 1;
        const baseVersion = draft.baseVersion ?? serverVersion;

        if (serverVersion > baseVersion) {
          return {
            success: false,
            status: 'Upload failed',
            conflictDetected: true,
            error: `Conflict detected: Server has a newer version (v${serverVersion}) than your local draft base (v${baseVersion}).`,
          };
        }

        if (draft.baseUpdatedAt && existingServerEntry.updatedAt) {
          const serverTime = new Date(existingServerEntry.updatedAt).getTime();
          const baseTime = new Date(draft.baseUpdatedAt).getTime();
          if (serverTime > baseTime && existingServerEntry.content !== content) {
            return {
              success: false,
              status: 'Upload failed',
              conflictDetected: true,
              error: 'Conflict detected: This diary entry was updated more recently on the server.',
            };
          }
        }
      }

      // 4. Construct updated single record per date (updates existing record if present)
      const dateObj = new Date(`${date}T00:00:00`);
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const nowIso = new Date().toISOString();
      const nextVersion = (existingServerEntry?.version ?? 0) + 1;

      const updatedEntry: DiaryEntry = {
        id: existingServerEntry?.id || `diary-${date}`,
        date,
        dayOfWeek,
        title: title.trim() || existingServerEntry?.title || `${dayOfWeek} Journal`,
        content,
        wordCount: this.countWords(content),
        aiAnalyzed: options.aiInsights
          ? options.aiInsights.length > 0
          : existingServerEntry?.aiAnalyzed ?? false,
        aiInsights: options.aiInsights ?? existingServerEntry?.aiInsights ?? [],
        productivityRating: options.productivityRating ?? existingServerEntry?.productivityRating ?? 5,
        updatedAt: nowIso,
        uploadedAt: nowIso,
        version: nextVersion,
      };

      // 5. Commit to database
      await onCommitToDb(updatedEntry);

      // 6. Update local draft baseline to reflect successful synchronization
      this.memoryDrafts[date] = {
        date,
        title: updatedEntry.title || '',
        content: updatedEntry.content,
        wordCount: updatedEntry.wordCount,
        savedAt: nowIso,
        baseVersion: nextVersion,
        baseUpdatedAt: nowIso,
      };
      this.persistDraftsToStorage();

      return {
        success: true,
        status: 'Uploaded ✓',
        entry: updatedEntry,
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'Upload failed',
        error: err?.message || 'Upload failed. Local draft is preserved.',
      };
    } finally {
      this.inFlightUploads.delete(date);
    }
  }

  public clearAllDrafts(): void {
    this.memoryDrafts = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(DIARY_DRAFTS_STORAGE_KEY);
      } catch {}
    }
  }
}

export const diarySyncEngine = new DiarySyncEngine();
