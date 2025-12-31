import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDaysInMonth,
  parseISO
} from 'date-fns';

export const formatDate = (date: Date | string, formatStr: string = 'yyyy-MM-dd') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const date = new Date(year, month - 1, 1);
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));

  return eachDayOfInterval({ start, end });
};

export const getDaysInMonthCount = (year: number, month: number): number => {
  return getDaysInMonth(new Date(year, month - 1));
};

export const getMonthName = (month: number): string => {
  return format(new Date(2024, month - 1, 1), 'MMMM');
};

export const getMonthYear = (year: number, month: number): string => {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy');
};

export const isDateInMonth = (date: Date, year: number, month: number): boolean => {
  return isSameMonth(date, new Date(year, month - 1, 1));
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

export const compareDates = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

export const getToday = (): Date => {
  return new Date();
};

export const getTodayString = (): string => {
  return formatDate(new Date(), 'yyyy-MM-dd');
};

export const normalizeDate = (date: Date | string): Date => {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekNumber = (date: Date): number => {
  const day = date.getDate();
  return Math.ceil(day / 7);
};

export const getDateRange = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(new Date(year, month - 1, 1));

  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

export const navigateMonth = (year: number, month: number, direction: 'prev' | 'next') => {
  const date = new Date(year, month - 1, 1);
  const newDate = direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);

  return {
    year: newDate.getFullYear(),
    month: newDate.getMonth() + 1
  };
};
