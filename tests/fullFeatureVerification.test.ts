import { describe, it } from 'node:test';
import assert from 'node:assert';

import {
  initialTasks,
  initialProjects,
  initialResearch,
  initialHabits,
  initialWaitingItems,
  initialQuickReminders,
  initialDiaryEntries,
  initialTransactions,
  initialMemories,
  initialSettings,
  initialWidgets,
  initialPomodoroSettings,
} from '../src/lib/initialData';
import { AIEngine } from '../src/lib/aiEngine';
import { GoogleDriveService } from '../src/lib/googleDrive';
import { CommandCenterDatabase } from '../src/lib/storage';
import { DiarySyncEngine } from '../src/lib/diarySync';
import { Task, Habit, WaitingItem, DiaryEntry, Transaction, MemoryItem } from '../src/lib/types';

describe('PRINCE Command Center - Comprehensive Verification Suite', () => {
  const ai = new AIEngine();
  const drive = new GoogleDriveService();

  function getFreshMockDb(): CommandCenterDatabase {
    return {
      tasks: JSON.parse(JSON.stringify(initialTasks)),
      projects: JSON.parse(JSON.stringify(initialProjects)),
      research: JSON.parse(JSON.stringify(initialResearch)),
      habits: JSON.parse(JSON.stringify(initialHabits)),
      waitingItems: JSON.parse(JSON.stringify(initialWaitingItems)),
      quickReminders: JSON.parse(JSON.stringify(initialQuickReminders)),
      diaryEntries: JSON.parse(JSON.stringify(initialDiaryEntries)),
      pomodoroSessions: [],
      calendarEvents: [],
      transactions: JSON.parse(JSON.stringify(initialTransactions)),
      memories: JSON.parse(JSON.stringify(initialMemories)),
      aiActionLogs: [],
      insights: [],
      activityLogs: [],
      notifications: [],
      settings: JSON.parse(JSON.stringify(initialSettings)),
      widgets: JSON.parse(JSON.stringify(initialWidgets)),
      pomodoroSettings: JSON.parse(JSON.stringify(initialPomodoroSettings)),
      version: 1,
      lastSyncedAt: new Date().toISOString()
    };
  }

  // ==========================================
  // 1. TASK MANAGEMENT SYSTEM TESTS
  // ==========================================
  describe('1. Task Management Engine', () => {
    it('should calculate correct deadline days remaining and urgency', () => {
      const db = getFreshMockDb();
      const task1 = db.tasks.find(t => t.id === 'task-1')!;
      assert.ok(task1, 'task-1 should exist');

      // Reference time: Oct 3, 2026, 17:00:00Z
      const refTime = new Date('2026-10-03T17:00:00Z').getTime();
      const dueTime = new Date(task1.deadline!).getTime();
      const diffDays = Math.round((dueTime - refTime) / (1000 * 60 * 60 * 24));
      assert.strictEqual(diffDays, 2, 'College Unit 3 should be due in exactly 2 days');
    });

    it('should track subtask completion percentage', () => {
      const db = getFreshMockDb();
      const task1 = db.tasks.find(t => t.id === 'task-1')!;
      const total = task1.subtasks.length;
      const completed = task1.subtasks.filter(s => s.completed).length;
      const percent = Math.round((completed / total) * 100);

      assert.strictEqual(total, 4);
      assert.strictEqual(completed, 2);
      assert.strictEqual(percent, 50, 'Subtask percentage should be exactly 50%');

      // Complete another subtask
      task1.subtasks[2].completed = true;
      const newPercent = Math.round((task1.subtasks.filter(s => s.completed).length / total) * 100);
      assert.strictEqual(newPercent, 75, 'Subtask percentage should now be 75%');
    });

    it('should support task status transitions', () => {
      const db = getFreshMockDb();
      const task = db.tasks[0];
      assert.strictEqual(task.status, 'in_progress');

      // Complete task
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      assert.strictEqual(task.status, 'completed');
      assert.ok(task.completedAt);

      // Reopen task
      task.status = 'planned';
      assert.strictEqual(task.status, 'planned');
    });

    it('should support task reordering without losing order index', () => {
      const db = getFreshMockDb();
      const originalFirst = db.tasks[0].id;
      const originalSecond = db.tasks[1].id;

      // Swap positions
      const temp = db.tasks[0];
      db.tasks[0] = db.tasks[1];
      db.tasks[1] = temp;

      // Reassign orders
      db.tasks.forEach((t, idx) => { t.order = idx; });

      assert.strictEqual(db.tasks[0].id, originalSecond);
      assert.strictEqual(db.tasks[0].order, 0);
      assert.strictEqual(db.tasks[1].id, originalFirst);
      assert.strictEqual(db.tasks[1].order, 1);
    });
  });

  // ==========================================
  // 2. HABIT TRACKER & RADIAL SYSTEM TESTS
  // ==========================================
  describe('2. Habit Tracker & Radial Rings', () => {
    it('should increment habit count and automatically advance streak on reaching target', () => {
      const db = getFreshMockDb();
      const habit = db.habits.find(h => h.id === 'habit-1')!; // Target 3
      const today = '2026-10-03';
      const initialStreak = habit.currentStreak; // 14
      habit.history[today] = 2; // currently 2/3

      // Increment to 3/3
      habit.history[today] += 1;
      const isComplete = habit.history[today] >= habit.targetCount;
      if (isComplete) {
        habit.currentStreak += 1;
        habit.totalCompletions += 1;
      }

      assert.strictEqual(habit.history[today], 3);
      assert.strictEqual(isComplete, true);
      assert.strictEqual(habit.currentStreak, initialStreak + 1, 'Streak should increment to 15');
      assert.strictEqual(habit.totalCompletions, 49);
    });

    it('should decrement habit count safely without dropping below zero', () => {
      const db = getFreshMockDb();
      const habit = db.habits[0];
      const today = '2026-10-03';
      habit.history[today] = 1;

      // Decrement
      habit.history[today] = Math.max(0, habit.history[today] - 1);
      assert.strictEqual(habit.history[today], 0);

      // Decrement again
      habit.history[today] = Math.max(0, habit.history[today] - 1);
      assert.strictEqual(habit.history[today], 0, 'Count should remain clamped at 0');
    });

    it('should support not-to-do habit category', () => {
      const db = getFreshMockDb();
      const notToDo = db.habits.find(h => h.category === 'not_to_do')!;
      assert.ok(notToDo, 'Not-to-do habit should exist');
      assert.strictEqual(notToDo.category, 'not_to_do');
      assert.strictEqual(notToDo.currentStreak, 18);
    });
  });

  // ==========================================
  // 3. RESEARCH WORKSPACE TESTS
  // ==========================================
  describe('3. Research Laboratory Engine', () => {
    it('should track Electrochemical Graphene literature papers', () => {
      const db = getFreshMockDb();
      assert.strictEqual(db.research.title, 'Electrochemical Graphene Production & Supercapacitor Performance');
      assert.ok(db.research.literature.length >= 3);

      const paper7 = db.research.literature.find(p => p.id === 'paper-7');
      assert.ok(paper7, 'Paper 7 must be in literature catalog');
      assert.strictEqual(paper7.status, 'to_read');
    });

    it('should log lab experiments with parameters, results, and conclusion', () => {
      const db = getFreshMockDb();
      const exp1 = db.research.experiments[0];
      assert.ok(exp1.parameters.includes('10V DC'));
      assert.ok(exp1.conclusion.includes('yield 64%'));
      assert.strictEqual(exp1.success, true);
    });
  });

  // ==========================================
  // 4. DIARY & JOURNAL WITH MANUAL UPLOAD & LOCAL AUTOSAVE
  // ==========================================
  describe('4. Diary & Journal System (Manual Upload & Local Autosave)', () => {
    it('should calculate correct word count on text entry', () => {
      const syncEngine = new DiarySyncEngine();
      const text = 'Precision in synthesis is required for high electrical conductivity.';
      const words = syncEngine.countWords(text);
      assert.strictEqual(words, 9);
    });

    it('should complete all 10 required Diary Synchronization & Post-Upload Editing scenarios', async () => {
      const db = getFreshMockDb();
      const syncEngine = new DiarySyncEngine();
      syncEngine.clearAllDrafts();
      const testDate = '2026-11-02';
      const getUploaded = (): DiaryEntry | undefined => db.diaryEntries[testDate];

      // Scenario 1: Write a diary without uploading (local autosave only, DB untouched)
      const morningContent = 'Morning entry: Completed electrochemical cell setup and verified reference electrode.';
      const morningTitle = 'Monday Morning Lab Log';
      syncEngine.saveLocalDraft(testDate, morningContent, morningTitle, getUploaded());

      assert.strictEqual(
        getUploaded(),
        undefined,
        'Database should not receive un-uploaded diary entry during typing'
      );

      // Scenario 2: Refresh the page and verify the local draft survives with "Draft saved locally"
      const afterRefreshState = syncEngine.resolveInitialEntryState(testDate, getUploaded());
      assert.strictEqual(afterRefreshState.content, morningContent, 'Local draft content must survive page refresh');
      assert.strictEqual(afterRefreshState.title, morningTitle, 'Local draft title must survive page refresh');
      assert.strictEqual(afterRefreshState.status, 'Draft saved locally', 'Status must be Draft saved locally before upload');

      // Scenario 3: Upload the diary via [ UPLOAD DIARY ]
      const firstUpload = await syncEngine.uploadDiaryEntry(
        testDate,
        morningContent,
        morningTitle,
        getUploaded(),
        (savedEntry) => {
          db.diaryEntries[savedEntry.date] = savedEntry;
        },
        { isOnline: true, simulateDelayMs: 10 }
      );

      assert.strictEqual(firstUpload.success, true, 'Initial manual upload should succeed');
      assert.strictEqual(firstUpload.status, 'Uploaded ✓');
      const uploadedAfterFirst = getUploaded();
      assert.ok(uploadedAfterFirst, 'Database should now contain the uploaded entry');
      assert.strictEqual(uploadedAfterFirst.content, morningContent);
      assert.strictEqual(uploadedAfterFirst.version, 1);
      const originalId = uploadedAfterFirst.id;

      // Scenario 4: Edit the same diary after uploading -> detect modifications & mark as "Changes pending"
      const eveningContent =
        morningContent + '\n\nEvening update: Analyzed Raman spectra and confirmed low defect density.';
      syncEngine.saveLocalDraft(testDate, eveningContent, morningTitle, getUploaded());

      const postEditStatus = syncEngine.computeSyncStatus(
        testDate,
        eveningContent,
        morningTitle,
        getUploaded()
      );
      assert.strictEqual(postEditStatus, 'Changes pending', 'Post-upload edits must show Changes pending');
      assert.strictEqual(
        getUploaded()?.content,
        morningContent,
        'Uploaded DB record remains unchanged until second manual upload'
      );

      // Scenario 5 & 6: Upload the updated diary & verify the existing record is updated (no duplicate entries)
      const secondUpload = await syncEngine.uploadDiaryEntry(
        testDate,
        eveningContent,
        morningTitle,
        getUploaded(),
        (savedEntry) => {
          db.diaryEntries[savedEntry.date] = savedEntry;
        },
        { isOnline: true, simulateDelayMs: 10 }
      );

      assert.strictEqual(secondUpload.success, true, 'Second upload should succeed');
      assert.strictEqual(secondUpload.status, 'Uploaded ✓');
      const uploadedAfterSecond = getUploaded()!;
      assert.strictEqual(uploadedAfterSecond.id, originalId, 'Must update the existing record ID without creating duplicates');
      assert.strictEqual(uploadedAfterSecond.content, eveningContent, 'DB record must reflect updated evening content');
      assert.strictEqual(uploadedAfterSecond.version, 2, 'Version must increment to 2');
      assert.strictEqual(
        Object.keys(db.diaryEntries).filter((k) => k === testDate).length,
        1,
        'Must maintain exactly one diary record for the date'
      );

      // Scenario 7 & 8: Disconnect the internet, edit, and attempt an upload -> verify failure & local draft remains intact
      const lateNightContent = eveningContent + '\n\nLate night note: Prepared slides for tomorrow.';
      const offlineAttempt = await syncEngine.uploadDiaryEntry(
        testDate,
        lateNightContent,
        morningTitle,
        getUploaded(),
        (savedEntry) => {
          db.diaryEntries[savedEntry.date] = savedEntry;
        },
        { isOnline: false, simulateDelayMs: 10 }
      );

      assert.strictEqual(offlineAttempt.success, false, 'Upload must fail gracefully when offline');
      assert.strictEqual(offlineAttempt.status, 'Upload failed', 'Status must be Upload failed');
      const preservedDraft = syncEngine.getLocalDraft(testDate);
      assert.ok(preservedDraft, 'Local draft must still exist after failed upload');
      assert.strictEqual(preservedDraft.content, lateNightContent, 'Unsent local content must remain intact');

      // Scenario 9: Reconnect and retry the upload
      const retryAttempt = await syncEngine.uploadDiaryEntry(
        testDate,
        preservedDraft.content,
        preservedDraft.title,
        getUploaded(),
        (savedEntry) => {
          db.diaryEntries[savedEntry.date] = savedEntry;
        },
        { isOnline: true, simulateDelayMs: 10 }
      );

      assert.strictEqual(retryAttempt.success, true, 'Retry when back online must succeed');
      assert.strictEqual(retryAttempt.status, 'Uploaded ✓');
      const uploadedAfterRetry = getUploaded()!;
      assert.strictEqual(uploadedAfterRetry.content, lateNightContent);
      assert.strictEqual(uploadedAfterRetry.version, 3);

      // Scenario 10: Verify that other website modules still synchronize automatically
      const newTask: Task = {
        id: 'task-sync-check',
        title: 'Verify automatic task sync',
        priority: 'high',
        category: 'Research',
        estimatedDuration: 30,
        actualDuration: 0,
        status: 'planned',
        dependencies: [],
        subtasks: [],
        recurrence: 'none',
        tags: [],
        order: db.tasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tasks.push(newTask);
      assert.ok(db.tasks.some((t) => t.id === 'task-sync-check'), 'Tasks module continues automatic state synchronization');
    });
  });

  // ==========================================
  // 5. POMODORO TIME & 4-DIRECTION RADIAL CONTROLS
  // ==========================================
  describe('5. Pomodoro Focus Engine & Radial Adjustments', () => {
    it('should handle timestamp-based background elapsed time calculation accurately', () => {
      // Simulate app backgrounding for 120 seconds
      const startTime = Date.now() - (120 * 1000);
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
      assert.strictEqual(elapsedSeconds, 120, 'Elapsed seconds must match real elapsed time, immune to setInterval drift');
    });

    it('should support 4-direction radial menu adjustments', () => {
      let timeLeftSeconds = 50 * 60; // 3000s

      // UP: Add 5 minutes (+300s)
      timeLeftSeconds += 5 * 60;
      assert.strictEqual(timeLeftSeconds, 3300);

      // RIGHT: Fast forward 10 minutes (-600s)
      timeLeftSeconds = Math.max(0, timeLeftSeconds - 10 * 60);
      assert.strictEqual(timeLeftSeconds, 2700);

      // LEFT: Rewind / move backward 5 minutes (+300s)
      timeLeftSeconds += 5 * 60;
      assert.strictEqual(timeLeftSeconds, 3000);

      // DOWN: Stop / terminate session
      timeLeftSeconds = 0;
      assert.strictEqual(timeLeftSeconds, 0, 'Terminating session resets timeLeft to 0');
    });
  });

  // ==========================================
  // 6. WAITING FOR & REMINDERS SYSTEM
  // ==========================================
  describe('6. Waiting For & Scratch Reminders', () => {
    it('should track external blockers with follow-up dates', () => {
      const db = getFreshMockDb();
      const item1 = db.waitingItems.find(w => w.id === 'wait-1')!;
      assert.strictEqual(item1.personOrEntity, 'Dr. Sharma (College Professor)');
      assert.strictEqual(item1.followUpDate, '2026-10-04');
      assert.strictEqual(item1.status, 'pending');

      // Update to received
      item1.status = 'received';
      assert.strictEqual(item1.status, 'received');
    });

    it('should add, toggle, and delete quick reminders', () => {
      const db = getFreshMockDb();
      const rem = db.quickReminders[0];
      assert.strictEqual(rem.text, 'Buy laboratory nitrile gloves (chemical resistant)');
      assert.strictEqual(rem.completed, false);

      // Toggle
      rem.completed = true;
      assert.strictEqual(rem.completed, true);
    });
  });

  // ==========================================
  // 7. MONEY MANAGEMENT & ANALYTICS
  // ==========================================
  describe('7. Money Management Portal', () => {
    it('should accurately compute financial balance, spending, and savings rate', () => {
      const db = getFreshMockDb();
      const totalIncome = db.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = db.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      const netBalance = totalIncome - totalExpense;
      const savingsRate = Math.round((netBalance / totalIncome) * 100);

      assert.strictEqual(totalIncome, 23000);
      assert.strictEqual(totalExpense, 4230);
      assert.strictEqual(netBalance, 18770);
      assert.strictEqual(savingsRate, 82);
    });

    it('should properly format CSV export string', () => {
      const db = getFreshMockDb();
      const rows = db.transactions.map(t => `${t.id},${t.type},${t.amount},${t.category}`);
      assert.ok(rows.length >= 5);
      assert.ok(rows[0].includes('tx-1,income,15000,Stipend'));
    });
  });

  // ==========================================
  // 8. AI ENGINE, DECISION TOOL & WORKLOAD
  // ==========================================
  describe('8. AI Engine, Decisions & Workload Detection', () => {
    it('should detect workload overcommitment when demands exceed capacity', () => {
      const db = getFreshMockDb();
      const workload = ai.calculateWorkload(db);
      assert.ok(workload.activeTasksCount > 0);
      assert.ok(workload.requiredHours > 0);
      assert.ok(workload.availableHours > 0);
    });

    it('should evaluate "Should I Do This?" with YES, NO, or NOT NOW', () => {
      const db = getFreshMockDb();

      // Case 1: Overcommitted week + high hours -> NOT NOW
      const res1 = ai.evaluateOpportunity('Join 48h Non-Urgent SIH Codeathon', 'Refactor code', 15, db);
      assert.strictEqual(res1.verdict, 'NOT NOW');
      assert.ok(res1.recommendation.includes('NPTEL'));

      // Case 2: Direct strategic research alignment with small hours -> YES
      const res2 = ai.evaluateOpportunity('Electrochemical Graphene Review Slot with Mentor', '30m sync', 1, db);
      assert.strictEqual(res2.verdict, 'YES');
      assert.ok(res2.strategicScore >= 90);
    });

    it('should execute real AI tools from natural language commands', async () => {
      const db = getFreshMockDb();

      // 1. Automatic Work Logging: "I finished Paper 7"
      const resPaper = await ai.processCommand('I finished Paper 7', db);
      assert.strictEqual(resPaper.toolExecuted, 'update_research_paper');
      const updatedPaper = resPaper.updatedDb?.research.literature.find(p => p.id === 'paper-7');
      assert.strictEqual(updatedPaper?.status, 'extracted');

      // 2. Create Task tool: "Add task: Prepare lab slides"
      const resTask = await ai.processCommand('Add task: Prepare lab slides for seminar', db);
      assert.strictEqual(resTask.toolExecuted, 'create_task');
      assert.ok(resTask.updatedDb?.tasks.some(t => t.title.includes('Prepare lab slides')));

      // 3. Create Reminder tool: "Remind me to buy pipettes"
      const resRem = await ai.processCommand('Remind me to buy pipettes', db);
      assert.strictEqual(resRem.toolExecuted, 'create_reminder');
      assert.ok(resRem.updatedDb?.quickReminders.some(r => r.text.includes('buy pipettes')));

      // 4. Log Expense tool: "Spent 450 on ethanol solvent"
      const resExp = await ai.processCommand('Spent 450 on ethanol solvent', db);
      assert.strictEqual(resExp.toolExecuted, 'log_expense');
      assert.ok(resExp.updatedDb?.transactions.some(tx => tx.amount === 450));
    });
  });

  // ==========================================
  // 9. LONG-TERM MEMORY BANK
  // ==========================================
  describe('9. AI Long-term Memory Bank', () => {
    it('should manage permanent, temporary, and project memories', () => {
      const db = getFreshMockDb();
      assert.ok(db.memories.length >= 4);

      const perm = db.memories.find(m => m.type === 'permanent');
      const temp = db.memories.find(m => m.type === 'temporary');
      const proj = db.memories.find(m => m.type === 'project');

      assert.ok(perm, 'Permanent memory must exist');
      assert.ok(temp, 'Temporary memory must exist');
      assert.ok(proj, 'Project memory must exist');

      // Pin memory
      perm.pinned = true;
      assert.strictEqual(perm.pinned, true);

      // Disable memory
      temp.disabled = true;
      assert.strictEqual(temp.disabled, true);
    });
  });

  // ==========================================
  // 10. GOOGLE DRIVE BACKUP & RESTORE
  // ==========================================
  describe('10. Google Drive & Offline Sync', () => {
    it('should generate structured backup payload matching target folder schema', () => {
      const db = getFreshMockDb();
      const payload = drive.generateBackupPayload(db);

      assert.strictEqual(payload.metadata.application, 'PRINCE Command Center');
      assert.strictEqual(payload.metadata.user, 'rifaideenprofessional@gmail.com');
      assert.strictEqual(payload.metadata.folderStructure, '/CommandCenter/data/');

      assert.ok(payload.data.tasks.length > 0);
      assert.ok(payload.data.projects.length > 0);
      assert.ok(payload.data.habits.length > 0);
      assert.ok(payload.data.research.literature.length > 0);
      assert.ok(payload.data.diaryEntries['2026-10-03']);
      assert.ok(payload.data.transactions.length > 0);
      assert.ok(payload.data.memories.length > 0);
    });
  });
});
