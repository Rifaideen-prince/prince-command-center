import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DiarySyncEngine } from '../src/lib/diarySync.ts';

describe('Diary & Journal Synchronization Engine Verification (10 Scenarios)', () => {
  it('Executes all 10 required scenarios cleanly', async () => {
    const syncEngine = new DiarySyncEngine();
    syncEngine.clearAllDrafts();
    const diaryEntries = {};
    const tasks = [];
    const testDate = '2026-11-02';

    // 1. Write a diary without uploading
    const morningContent = 'Morning entry: Completed electrochemical cell setup and verified reference electrode.';
    const morningTitle = 'Monday Morning Lab Log';
    syncEngine.saveLocalDraft(testDate, morningContent, morningTitle, diaryEntries[testDate]);
    assert.strictEqual(diaryEntries[testDate], undefined, '1. DB untouched while writing locally');

    // 2. Refresh the page and verify the local draft survives
    const afterRefresh = syncEngine.resolveInitialEntryState(testDate, diaryEntries[testDate]);
    assert.strictEqual(afterRefresh.content, morningContent, '2. Local draft survives page refresh');
    assert.strictEqual(afterRefresh.status, 'Draft saved locally', '2. Status is Draft saved locally');

    // 3. Upload the diary
    const upload1 = await syncEngine.uploadDiaryEntry(
      testDate,
      morningContent,
      morningTitle,
      diaryEntries[testDate],
      (entry) => {
        diaryEntries[entry.date] = entry;
      },
      { isOnline: true, simulateDelayMs: 5 }
    );
    assert.strictEqual(upload1.success, true, '3. Initial upload succeeds');
    assert.strictEqual(upload1.status, 'Uploaded ✓', '3. Status becomes Uploaded ✓');
    assert.strictEqual(diaryEntries[testDate].content, morningContent);
    const originalId = diaryEntries[testDate].id;

    // 4. Edit the same diary after uploading
    const eveningContent = morningContent + '\n\nEvening update: Analyzed Raman spectra.';
    syncEngine.saveLocalDraft(testDate, eveningContent, morningTitle, diaryEntries[testDate]);
    const statusAfterEdit = syncEngine.computeSyncStatus(
      testDate,
      eveningContent,
      morningTitle,
      diaryEntries[testDate]
    );
    assert.strictEqual(statusAfterEdit, 'Changes pending', '4. Post-upload edit marks entry as Changes pending');

    // 5. Upload the updated diary
    const upload2 = await syncEngine.uploadDiaryEntry(
      testDate,
      eveningContent,
      morningTitle,
      diaryEntries[testDate],
      (entry) => {
        diaryEntries[entry.date] = entry;
      },
      { isOnline: true, simulateDelayMs: 5 }
    );
    assert.strictEqual(upload2.success, true, '5. Second upload succeeds');
    assert.strictEqual(upload2.status, 'Uploaded ✓');

    // 6. Verify that the existing record is updated (no duplicates)
    assert.strictEqual(diaryEntries[testDate].id, originalId, '6. Existing record ID is preserved');
    assert.strictEqual(diaryEntries[testDate].content, eveningContent, '6. Existing record content is updated');
    assert.strictEqual(diaryEntries[testDate].version, 2, '6. Version incremented to 2');
    assert.strictEqual(Object.keys(diaryEntries).length, 1, '6. Only one record exists for the date');

    // 7. Disconnect the internet and attempt an upload
    const nightContent = eveningContent + '\n\nNight note: Prepared presentation.';
    const offlineUpload = await syncEngine.uploadDiaryEntry(
      testDate,
      nightContent,
      morningTitle,
      diaryEntries[testDate],
      (entry) => {
        diaryEntries[entry.date] = entry;
      },
      { isOnline: false, simulateDelayMs: 5 }
    );
    assert.strictEqual(offlineUpload.success, false, '7. Offline upload fails gracefully');
    assert.strictEqual(offlineUpload.status, 'Upload failed', '7. Status is Upload failed');

    // 8. Verify that the draft remains intact
    const draftAfterFailure = syncEngine.getLocalDraft(testDate);
    assert.ok(draftAfterFailure, '8. Draft exists after failure');
    assert.strictEqual(draftAfterFailure.content, nightContent, '8. Draft content remains intact');

    // 9. Reconnect and retry the upload
    const retryUpload = await syncEngine.uploadDiaryEntry(
      testDate,
      draftAfterFailure.content,
      draftAfterFailure.title,
      diaryEntries[testDate],
      (entry) => {
        diaryEntries[entry.date] = entry;
      },
      { isOnline: true, simulateDelayMs: 5 }
    );
    assert.strictEqual(retryUpload.success, true, '9. Retry upload succeeds when online');
    assert.strictEqual(retryUpload.status, 'Uploaded ✓', '9. Status becomes Uploaded ✓');
    assert.strictEqual(diaryEntries[testDate].content, nightContent);
    assert.strictEqual(diaryEntries[testDate].version, 3);

    // 10. Verify conflict protection (never overwrite newer server version silently)
    const serverNewerEntry = {
      ...diaryEntries[testDate],
      version: 4,
      updatedAt: new Date(Date.now() + 60000).toISOString(),
      content: 'Edited from another device'
    };
    const conflictUpload = await syncEngine.uploadDiaryEntry(
      testDate,
      'Stale local edit',
      morningTitle,
      serverNewerEntry,
      (entry) => {
        diaryEntries[entry.date] = entry;
      },
      { isOnline: true, simulateDelayMs: 5 }
    );
    assert.strictEqual(conflictUpload.success, false, '10. Blocks silent overwrite of newer server version');
    assert.strictEqual(conflictUpload.conflictDetected, true, '10. Reports conflictDetected');
  });
});

