import { api } from '@/lib/api';

export interface HabitCorrelation {
  habitId: string;
  habitName: string;
  habitIcon: string;
  habitColor: string;
  daysCompleted: number;
  daysNotCompleted: number;
  avgVolumeWhenCompleted: number;
  avgVolumeWhenNotCompleted: number;
  volumeImpact: number;
  avgDurationWhenCompleted: number;
  avgDurationWhenNotCompleted: number;
  durationImpact: number;
  sampleSize: number;
}

export interface SleepCorrelation {
  range: string;
  avgVolume: number;
  sampleSize: number;
}

export interface MoodCorrelation {
  level: string;
  avgVolume: number;
  sampleSize: number;
}

export interface CorrelationData {
  habitCorrelations: HabitCorrelation[];
  sleepCorrelation: SleepCorrelation[] | null;
  moodCorrelation: MoodCorrelation[] | null;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  totalWorkouts: number;
}

export const correlationService = {
  async getHabitGymCorrelation(days: number = 30): Promise<CorrelationData> {
    try {
      const response = await api.get<{ success: boolean; data: CorrelationData }>('/gym/analytics/correlations', {
        params: { days }
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch correlation data');
    } catch (error) {
      console.error('Failed to fetch correlations:', error);
      // Return empty data structure on error
      return {
        habitCorrelations: [],
        sleepCorrelation: null,
        moodCorrelation: null,
        dateRange: {
          start: '',
          end: '',
          days: 0
        },
        totalWorkouts: 0
      };
    }
  }
};
