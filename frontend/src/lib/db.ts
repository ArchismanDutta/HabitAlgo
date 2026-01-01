import Dexie, { Table } from 'dexie';
import { Habit, DailyLog, Settings, SyncQueueItem } from '@/types';
import type { FinancialAccount, FinancialTransaction, Budget, RecurringTransaction, FinancialGoal } from '@/types/finance';

export class HabitTrackerDB extends Dexie {
  habits!: Table<Habit, string>;
  dailyLogs!: Table<DailyLog, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  settings!: Table<Settings, string>;

  // Financial tables
  financialAccounts!: Table<FinancialAccount, string>;
  financialTransactions!: Table<FinancialTransaction, string>;
  budgets!: Table<Budget, string>;
  recurringTransactions!: Table<RecurringTransaction, string>;
  financialGoals!: Table<FinancialGoal, string>;

  constructor() {
    super('HabitTrackerDB');

    this.version(1).stores({
      habits: '_id, name, isActive, createdAt, category',
      dailyLogs: '_id, date, habitId, [date+habitId]',
      syncQueue: '++id, type, timestamp, synced, entity',
      settings: '_id'
    });

    // Version 2: Add financial tables
    this.version(2).stores({
      habits: '_id, name, isActive, createdAt, category',
      dailyLogs: '_id, date, habitId, [date+habitId]',
      syncQueue: '++id, type, timestamp, synced, entity',
      settings: '_id',
      financialAccounts: '_id, userId, type, isActive, createdAt',
      financialTransactions: '_id, userId, type, date, accountId, category, merchant, isImpulsive, [userId+date]',
      budgets: '_id, userId, type, category, isActive',
      recurringTransactions: '_id, userId, nextScheduledDate, isActive',
      financialGoals: '_id, userId, type, isActive, isAchieved'
    });
  }
}

export const db = new HabitTrackerDB();

// Utility functions for offline operations
export const addToSyncQueue = async (
  type: SyncQueueItem['type'],
  entity: SyncQueueItem['entity'],
  entityId: string,
  payload: any
) => {
  await db.syncQueue.add({
    type,
    entity,
    entityId,
    payload,
    timestamp: new Date().toISOString(),
    synced: false
  });
};

export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  return await db.syncQueue.filter(item => item.synced === false).toArray();
};

export const markSyncItemComplete = async (id: number) => {
  await db.syncQueue.update(id, { synced: true });
};

export const clearSyncedItems = async () => {
  await db.syncQueue.filter(item => item.synced === true).delete();
};

// Initialize default settings
export const initializeSettings = async () => {
  const existing = await db.settings.toArray();

  if (existing.length === 0) {
    const now = new Date();
    await db.settings.add({
      _id: 'default',
      theme: 'auto',
      primaryView: 'today',
      selectedMonth: now.getMonth() + 1,
      selectedYear: now.getFullYear(),
      showStreaks: true,
      showCompletionRate: true,
      compactMode: false,
      lastSyncTime: null,
      totalHabits: 0
    });
  }
};
