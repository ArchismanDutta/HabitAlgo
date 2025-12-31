import { api } from '@/lib/api';
import { db, getPendingSyncItems, markSyncItemComplete, clearSyncedItems } from '@/lib/db';
import { habitService } from './habitService';
import { logService } from './logService';

export const syncService = {
  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  },

  // Push local changes to server
  async pushChanges(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Offline - skipping push');
      return;
    }

    const pendingItems = await getPendingSyncItems();

    if (pendingItems.length === 0) {
      console.log('No pending changes to sync');
      return;
    }

    console.log(`Syncing ${pendingItems.length} items...`);

    const habits = [];
    const logs = [];
    const deletedIds = [];

    // Group by entity type
    for (const item of pendingItems) {
      if (item.entity === 'habit') {
        if (item.type === 'DELETE') {
          deletedIds.push(item.entityId);
        } else {
          habits.push(item.payload);
        }
      } else if (item.entity === 'log') {
        logs.push(item.payload);
      }
    }

    try {
      const response = await api.post('/sync/push', {
        habits,
        logs,
        deletedIds
      });

      if (response.data.success) {
        // Mark all as synced
        for (const item of pendingItems) {
          if (item.id) {
            await markSyncItemComplete(item.id);
          }
        }

        // Clear synced items
        await clearSyncedItems();

        console.log('Sync completed successfully');
      }
    } catch (error) {
      console.error('Push sync failed:', error);
      throw error;
    }
  },

  // Pull latest data from server
  async pullChanges(lastSync?: string): Promise<void> {
    if (!this.isOnline()) {
      console.log('Offline - skipping pull');
      return;
    }

    try {
      const response = await api.get('/sync/pull', {
        params: { lastSync }
      });

      if (response.data.success && response.data.data) {
        const { habits, logs, settings } = response.data.data;

        // Update IndexedDB
        if (habits && habits.length > 0) {
          await db.habits.bulkPut(habits);
        }

        if (logs && logs.length > 0) {
          await db.dailyLogs.bulkPut(logs);
        }

        if (settings) {
          await db.settings.put(settings);
        }

        console.log('Pull sync completed');
      }
    } catch (error) {
      console.error('Pull sync failed:', error);
      throw error;
    }
  },

  // Full sync (push then pull)
  async fullSync(): Promise<void> {
    try {
      await this.pushChanges();
      await this.pullChanges();
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  },

  // Get sync status
  async getSyncStatus(): Promise<any> {
    try {
      const response = await api.post('/sync/status');
      return response.data.data;
    } catch (error) {
      return {
        lastSyncTime: null,
        habitCount: 0,
        logCount: 0,
        serverTime: null
      };
    }
  }
};
