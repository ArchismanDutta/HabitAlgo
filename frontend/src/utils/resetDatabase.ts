import { db } from '@/lib/db';

/**
 * Reset the entire IndexedDB database
 * WARNING: This will delete all local data!
 */
export const resetDatabase = async () => {
  try {
    console.warn('🗑️ Resetting IndexedDB database...');

    // Clear all tables
    await db.habits.clear();
    await db.dailyLogs.clear();
    await db.syncQueue.clear();
    await db.settings.clear();

    console.log('✅ Database reset complete');

    // Reload the page to reinitialize
    window.location.reload();
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    throw error;
  }
};

/**
 * Clear only sync queue (useful when sync is stuck)
 */
export const clearSyncQueue = async () => {
  try {
    console.warn('🗑️ Clearing sync queue...');
    await db.syncQueue.clear();
    console.log('✅ Sync queue cleared');
  } catch (error) {
    console.error('❌ Failed to clear sync queue:', error);
    throw error;
  }
};

// Expose to window for debugging (dev mode only)
if (import.meta.env.DEV) {
  (window as any).resetDatabase = resetDatabase;
  (window as any).clearSyncQueue = clearSyncQueue;
  console.log('🛠️ Debug utilities available: window.resetDatabase(), window.clearSyncQueue()');
}
