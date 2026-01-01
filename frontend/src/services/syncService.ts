import { api } from '@/lib/api';
import { db, getPendingSyncItems, markSyncItemComplete, clearSyncedItems } from '@/lib/db';

// Helper function for retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isLastRetry = i === maxRetries - 1;
      const isTimeout = error.code === 'ECONNABORTED';
      const isNetworkError = !error.response;

      // Don't retry on authentication or validation errors
      if (error.response?.status === 401 || error.response?.status === 422) {
        throw error;
      }

      if (isLastRetry) {
        throw error;
      }

      // Only retry on timeouts and network errors
      if (isTimeout || isNetworkError) {
        const delay = baseDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

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

    const habits: any[] = [];
    const logs: any[] = [];
    const deletedIds: string[] = [];

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
      const response = await retryWithBackoff(
        () => api.post('/sync/push', {
          habits,
          logs,
          deletedIds
        }),
        3,
        2000
      );

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
      // Don't throw - let the app continue working offline
    }
  },

  // Pull latest data from server
  async pullChanges(lastSync?: string): Promise<void> {
    if (!this.isOnline()) {
      console.log('Offline - skipping pull');
      return;
    }

    try {
      const response = await retryWithBackoff(
        () => api.get('/sync/pull', {
          params: { lastSync }
        }),
        3,
        2000
      );

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
      // Don't throw - let the app continue working offline
    }
  },

  // Full sync (push then pull)
  async fullSync(): Promise<void> {
    try {
      await this.pushChanges();
      await this.pullChanges();
    } catch (error) {
      console.error('Full sync failed:', error);
      // Don't throw - let the app continue working offline
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
