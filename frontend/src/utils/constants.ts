export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const CATEGORIES = [
  { value: 'Health', label: 'Health', color: '#10b981', icon: '💪' },
  { value: 'Work', label: 'Work', color: '#3b82f6', icon: '💼' },
  { value: 'Mind', label: 'Mind', color: '#8b5cf6', icon: '🧠' },
  { value: 'Custom', label: 'Custom', color: '#f59e0b', icon: '⭐' }
] as const;

export const HABIT_TYPES = [
  { value: 'boolean', label: 'Yes/No (Checkbox)' },
  { value: 'numeric', label: 'Number (Count/Track)' }
] as const;

export const NUMERIC_UNITS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'reps', label: 'Reps' },
  { value: 'count', label: 'Count' },
  { value: 'custom', label: 'Custom' }
] as const;

export const VIEWS = [
  { value: 'today', label: 'Today', icon: '📅' },
  { value: 'monthly', label: 'Monthly', icon: '📆' },
  { value: 'weekly', label: 'Weekly', icon: '📊' },
  { value: 'analytics', label: 'Analytics', icon: '📈' },
  { value: 'focus', label: 'Focus', icon: '🎯' }
] as const;

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'auto', label: 'Auto' }
] as const;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export const ICONS = [
  '⭐', '🔥', '💪', '🎯', '📚', '🏃', '🧘', '💻', '🎨', '🎵',
  '✍️', '🍎', '💧', '😴', '🧠', '💼', '🏆', '🌟', '✨', '💎'
];

export const DEFAULT_HABIT = {
  name: '',
  category: 'Custom' as const,
  type: 'boolean' as const,
  targetMonthly: 30,
  isActive: true,
  color: '#6366f1',
  icon: '⭐'
};

export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
