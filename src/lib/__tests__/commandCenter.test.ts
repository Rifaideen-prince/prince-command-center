import { describe, it } from 'node:test';
import assert from 'node:assert';
import { initialTasks, initialHabits, initialProjects, initialDiaryEntries, initialTransactions, initialSettings } from '../initialData';
import { AIEngine } from '../aiEngine';
import { GoogleDriveService } from '../googleDrive';
import { CommandCenterDatabase } from '../storage';

describe('PRINCE Command Center Core Functionality', () => {
  const ai = new AIEngine();
  const drive = new GoogleDriveService();

  const mockDb: CommandCenterDatabase = {
    tasks: [...initialTasks],
    projects: [...initialProjects],
    research: {
      id: 'res-1',
      title: 'Electrochemical Graphene Production',
      problem: 'Defects in Hummer method',
      solution: 'Pulsed exfoliation',
      researchQuestion: 'How does pulse frequency affect flake size?',
      hypothesis: '10Hz suppresses edge tearing',
      objectives: ['Run 5 concentrations'],
      methodology: 'Graphite foil in ammonium sulfate',
      literature: [
        { id: 'paper-7', title: 'Paper 7 on Supercapacitors', authors: 'Paton', status: 'to_read' }
      ],
      experiments: [],
      results: 'Flake size 4.8um',
      notes: 'AFM slot confirmed',
      references: [],
      status: 'active_research',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z'
    },
    habits: [...initialHabits],
    waitingItems: [],
    quickReminders: [],
    diaryEntries: { ...initialDiaryEntries },
    pomodoroSessions: [],
    calendarEvents: [],
    transactions: [...initialTransactions],
    memories: [],
    aiActionLogs: [],
    insights: [],
    activityLogs: [],
    notifications: [],
    settings: { ...initialSettings },
    widgets: [],
    pomodoroSettings: {
      focusDuration: 50,
      shortBreak: 10,
      longBreak: 20,
      sessionsBeforeLongBreak: 4,
      autoStartBreak: false,
      autoStartFocus: false,
      soundEnabled: true,
      keepScreenAwake: true
    },
    version: 1,
    lastSyncedAt: new Date().toISOString()
  };

  it('1. Task Deadline & Urgency Calculation', () => {
    const task = mockDb.tasks.find(t => t.id === 'task-1');
    assert.ok(task, 'Task-1 should exist');
    assert.strictEqual(task.priority, 'critical');
    assert.ok(task.deadline);

    const now = new Date('2026-10-03T17:00:00Z').getTime();
    const due = new Date(task.deadline).getTime();
    const diffDays = Math.round((due - now) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 2, 'Task-1 should be due in 2 days');
  });

  it('2. Habit Streak & Radial Increments', () => {
    const habit = mockDb.habits.find(h => h.id === 'habit-1');
    assert.ok(habit, 'Habit-1 should exist');
    assert.strictEqual(habit.targetCount, 3);
    assert.strictEqual(habit.currentStreak, 14);

    // Simulate completion
    const updatedCount = 3;
    const isCompleted = updatedCount >= habit.targetCount;
    assert.strictEqual(isCompleted, true, 'Habit should be marked completed');
  });

  it('3. AI "Should I Do This?" Opportunity Evaluation', () => {
    const evalResult = ai.evaluateOpportunity(
      'Join 48h Non-Academic Gaming Hackathon',
      'Requires full weekend coding without research alignment',
      16,
      mockDb
    );
    assert.ok(evalResult.verdict === 'NOT NOW' || evalResult.verdict === 'NO', 'Should warn against overloading near deadlines');
    assert.ok(evalResult.strategicScore < 80);
  });

  it('4. AI Automated Tool Execution ("I finished Paper 7")', async () => {
    const res = await ai.processCommand('I finished Paper 7', mockDb);
    assert.ok(res.toolExecuted === 'update_research_paper', 'Should execute tool to update research paper');
    assert.ok(res.updatedDb, 'Should provide updated database state');
    const paper = res.updatedDb.research.literature.find(p => p.id === 'paper-7');
    assert.strictEqual(paper?.status, 'extracted', 'Paper 7 status should be extracted');
  });

  it('5. Money Calculations & Net Balance', () => {
    const totalIncome = mockDb.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = mockDb.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    assert.strictEqual(totalIncome, 23000);
    assert.strictEqual(totalExpense, 4230);
    assert.strictEqual(netBalance, 18770);
  });

  it('6. Google Drive Structured Backup Generation', () => {
    const payload = drive.generateBackupPayload(mockDb);
    assert.strictEqual(payload.metadata.user, 'rifaideenprofessional@gmail.com');
    assert.strictEqual(payload.metadata.folderStructure, '/CommandCenter/data/');
    assert.ok(payload.data.tasks.length > 0);
    assert.ok(payload.filename.startsWith('PRINCE_Backup_'));
  });

  it('7. Diary Retrieval by Date', () => {
    const entry = mockDb.diaryEntries['2026-10-03'];
    assert.ok(entry, 'Oct 3 entry should exist');
    assert.strictEqual(entry.dayOfWeek, 'Saturday');
    assert.ok(entry.wordCount > 50);
  });
});
