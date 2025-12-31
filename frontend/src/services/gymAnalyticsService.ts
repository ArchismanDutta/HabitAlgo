import { api } from '@/lib/api';
import { GymApiResponse, PersonalRecord, VolumeData, ExerciseProgress } from '@/types/gym';

const BASE_URL = '/gym/analytics';

interface VolumeAnalyticsResponse {
  volumeData: VolumeData[];
  summary: {
    totalVolume: number;
    totalWorkouts: number;
    averageVolume: number;
    period: string;
  };
}

interface PersonalRecordsResponse {
  personalRecords: PersonalRecord[];
  groupedByExercise: {
    exerciseId: string;
    exerciseName: string;
    records: PersonalRecord[];
  }[];
  totalPRs: number;
}

interface ProgressSummaryResponse {
  period: string;
  workouts: {
    total: number;
    avgPerWeek: string;
  };
  volume: {
    total: number;
    average: number;
  };
  duration: {
    average: number;
  };
  bodyMetrics: {
    weightChange: string;
    currentWeight: number | null;
    startWeight: number | null;
  };
  recentPRs: {
    exerciseName: string;
    type: string;
    value: number;
    date: Date;
  }[];
}

interface StrengthComparisonResponse {
  weekly: {
    current: { workouts: number; volume: number; avgDuration: number };
    previous: { workouts: number; volume: number; avgDuration: number };
    change: { workouts: number; volume: number };
  };
  monthly: {
    current: { workouts: number; volume: number; avgDuration: number };
    previous: { workouts: number; volume: number; avgDuration: number };
    change: { workouts: number; volume: number };
  };
}

export const gymAnalyticsService = {
  async getVolumeAnalytics(params?: {
    period?: 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<VolumeAnalyticsResponse> {
    const response = await api.get<GymApiResponse<VolumeAnalyticsResponse>>(`${BASE_URL}/volume`, {
      params
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch volume analytics');
    }
    return response.data.data;
  },

  async getPersonalRecords(params?: {
    exerciseId?: string;
    type?: 'max_weight' | 'max_reps' | 'max_volume';
  }): Promise<PersonalRecordsResponse> {
    const response = await api.get<GymApiResponse<PersonalRecordsResponse>>(`${BASE_URL}/prs`, {
      params
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch personal records');
    }
    return response.data.data;
  },

  async getExerciseProgress(exerciseId: string, limit: number = 20): Promise<ExerciseProgress> {
    const response = await api.get<GymApiResponse<ExerciseProgress>>(
      `${BASE_URL}/exercise/${exerciseId}`,
      { params: { limit } }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch exercise progress');
    }
    return response.data.data;
  },

  async getProgressSummary(days: number = 30): Promise<ProgressSummaryResponse> {
    const response = await api.get<GymApiResponse<ProgressSummaryResponse>>(`${BASE_URL}/progress`, {
      params: { days }
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch progress summary');
    }
    return response.data.data;
  },

  async getStrengthComparison(): Promise<StrengthComparisonResponse> {
    const response = await api.get<GymApiResponse<StrengthComparisonResponse>>(`${BASE_URL}/comparison`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch strength comparison');
    }
    return response.data.data;
  }
};
