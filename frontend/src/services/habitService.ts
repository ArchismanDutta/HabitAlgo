import { api } from '@/lib/api';
import { Habit, ApiResponse } from '@/types';
import { db, addToSyncQueue } from '@/lib/db';

export const habitService = {
  // Get all habits (with offline fallback)
  async getAll(activeOnly = true): Promise<Habit[]> {
    try {
      const response = await api.get<ApiResponse<Habit[]>>('/habits', {
        params: { active: activeOnly }
      });

      if (response.data.success && response.data.data) {
        // Update IndexedDB
        await db.habits.bulkPut(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to fetch habits');
    } catch (error) {
      // Fallback to IndexedDB if offline
      console.warn('Fetching from IndexedDB (offline mode)');

      if (activeOnly) {
        return await db.habits.filter(habit => habit.isActive === true).toArray();
      } else {
        return await db.habits.toArray();
      }
    }
  },

  // Get habit by ID
  async getById(id: string): Promise<Habit> {
    try {
      const response = await api.get<ApiResponse<{ habit: Habit }>>(`/habits/${id}`);

      if (response.data.success && response.data.data) {
        await db.habits.put(response.data.data.habit);
        return response.data.data.habit;
      }

      throw new Error(response.data.error || 'Failed to fetch habit');
    } catch (error) {
      const habit = await db.habits.get(id);
      if (!habit) throw new Error('Habit not found');
      return habit;
    }
  },

  // Create new habit
  async create(habitData: Partial<Habit>): Promise<Habit> {
    try {
      const response = await api.post<ApiResponse<Habit>>('/habits', habitData);

      if (response.data.success && response.data.data) {
        await db.habits.put(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to create habit');
    } catch (error) {
      // Create offline with temporary ID
      const tempId = `temp_${Date.now()}`;
      const newHabit = {
        ...habitData,
        _id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Habit;

      await db.habits.put(newHabit);
      await addToSyncQueue('CREATE', 'habit', tempId, newHabit);

      return newHabit;
    }
  },

  // Update habit
  async update(id: string, updates: Partial<Habit>): Promise<Habit> {
    try {
      const response = await api.put<ApiResponse<Habit>>(`/habits/${id}`, updates);

      if (response.data.success && response.data.data) {
        await db.habits.put(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to update habit');
    } catch (error) {
      // Update offline
      const existing = await db.habits.get(id);
      if (!existing) throw new Error('Habit not found');

      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      await db.habits.put(updated);
      await addToSyncQueue('UPDATE', 'habit', id, updated);

      return updated;
    }
  },

  // Delete habit (soft delete)
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/habits/${id}`);
      await db.habits.update(id, { isActive: false });
    } catch (error) {
      await db.habits.update(id, { isActive: false });
      await addToSyncQueue('DELETE', 'habit', id, { isActive: false });
    }
  },

  // Toggle habit active status
  async toggle(id: string): Promise<Habit> {
    try {
      const response = await api.patch<ApiResponse<Habit>>(`/habits/${id}/toggle`);

      if (response.data.success && response.data.data) {
        await db.habits.put(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to toggle habit');
    } catch (error) {
      const habit = await db.habits.get(id);
      if (!habit) throw new Error('Habit not found');

      const updated = { ...habit, isActive: !habit.isActive };
      await db.habits.put(updated);
      await addToSyncQueue('UPDATE', 'habit', id, updated);

      return updated;
    }
  }
};
