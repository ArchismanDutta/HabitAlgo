import { create } from 'zustand';

interface CalendarStore {
  selectedYear: number;
  selectedMonth: number;
  setDate: (year: number, month: number) => void;
  goToToday: () => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => {
  // Load from localStorage
  const stored = localStorage.getItem('calendar-storage');
  const initial = stored
    ? JSON.parse(stored)
    : {
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth() + 1,
      };

  return {
    selectedYear: initial.selectedYear,
    selectedMonth: initial.selectedMonth,

    setDate: (year, month) => {
      set({ selectedYear: year, selectedMonth: month });
      localStorage.setItem(
        'calendar-storage',
        JSON.stringify({ selectedYear: year, selectedMonth: month })
      );
    },

    goToToday: () => {
      const now = new Date();
      const data = {
        selectedYear: now.getFullYear(),
        selectedMonth: now.getMonth() + 1,
      };
      set(data);
      localStorage.setItem('calendar-storage', JSON.stringify(data));
    },

    navigateMonth: (direction) => {
      const { selectedYear, selectedMonth } = get();
      const date = new Date(selectedYear, selectedMonth - 1, 1);

      if (direction === 'next') {
        date.setMonth(date.getMonth() + 1);
      } else {
        date.setMonth(date.getMonth() - 1);
      }

      const data = {
        selectedYear: date.getFullYear(),
        selectedMonth: date.getMonth() + 1,
      };
      set(data);
      localStorage.setItem('calendar-storage', JSON.stringify(data));
    },
  };
});
