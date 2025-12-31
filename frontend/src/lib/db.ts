import Dexie, { Table } from 'dexie';
import { Habit, DailyLog, Settings, SyncQueueItem } from '@/types';

export class HabitTrackerDB extends Dexie {
  habits!: Table<Habit, string>;
  dailyLogs!: Table<DailyLog, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  settings!: Table<Settings, string>;

  constructor() {
    super('HabitTrackerDB');

    this.version(1).stores({
      habits: '_id, name, isActive, createdAt, category',
      dailyLogs: '_id, date, habitId, [date+habitId]',
      syncQueue: '++id, type, timestamp, synced, entity',
      settings: '_id'
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
  return await db.syncQueue.where('synced').equals(false).toArray();
};

export const markSyncItemComplete = async (id: number) => {
  await db.syncQueue.update(id, { synced: true });
};

export const clearSyncedItems = async () => {
  await db.syncQueue.where('synced').equals(true).delete();
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
