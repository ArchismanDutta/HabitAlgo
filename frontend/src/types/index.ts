export interface Habit {
  _id: string;
  name: string;
  category: 'Health' | 'Work' | 'Mind' | 'Custom';
  customCategory?: string;
  type: 'boolean' | 'numeric';
  numericConfig?: {
    unit: 'minutes' | 'reps' | 'count' | 'custom';
    customUnit?: string;
  };
  targetMonthly: number;
  isActive: boolean;
  color: string;
  icon: string;

  // ✨ NEW: Why & Identity
  why?: string;
  identityStatement?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  _id: string;
  date: string;
  habitId: string | Habit;
  completed: boolean;
  value: number;
  note?: string;
  mood?: number;
  screenTime?: {
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  reflection?: {
    text: string;
    achievements: string[];
    energy: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  _id: string;
  year: number;
  month: number;
  habitId: string | Habit;
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalValue: number;
  weeklyStats: WeeklyStat[];
  lastCalculated: string;
}

export interface WeeklyStat {
  week: number;
  completed: number;
  total: number;
  rate: number;
}

export interface Settings {
  _id: string;
  theme: 'light' | 'dark' | 'auto';
  primaryView: 'today' | 'monthly' | 'weekly' | 'analytics' | 'focus';
  selectedMonth: number;
  selectedYear: number;
  showStreaks: boolean;
  showCompletionRate: boolean;
  compactMode: boolean;
  lastSyncTime: string | null;
  totalHabits: number;
}

export interface ChartData {
  dailyData: DailyChartPoint[];
  overallCompletion: {
    completed: number;
    total: number;
    rate: number;
  };
  habitStats: HabitStat[];
}

export interface DailyChartPoint {
  day: number;
  date: string;
  completed: number;
  total: number;
  rate: number;
}

export interface HabitStat {
  habitId: string;
  name: string;
  color: string;
  icon: string;
  completed: number;
  total: number;
  rate: number;
}

export interface StreakData {
  habitId: string;
  habitName: string;
  currentStreak: number;
  color: string;
  icon: string;
}

export interface SyncQueueItem {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'habit' | 'log' | 'reflection';
  entityId: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
}
