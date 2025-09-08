import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatDate = (date: Date | string): string => {
  return dayjs(date).format('DD/MM/YYYY');
};

export const formatDateTime = (date: Date | string): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatTime = (date: Date | string): string => {
  return dayjs(date).format('HH:mm');
};

export const getRelativeTime = (date: Date | string): string => {
  return dayjs(date).fromNow();
};

export const isToday = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isTomorrow = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

export const isThisWeek = (date: Date | string): boolean => {
  return dayjs(date).isSame(dayjs(), 'week');
};

export const getDaysUntil = (date: Date | string): number => {
  return dayjs(date).diff(dayjs(), 'day');
};

export const getHoursUntil = (date: Date | string): number => {
  return dayjs(date).diff(dayjs(), 'hour');
};

export const sortByDate = <T extends { startTime: Date | string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
};

export const generateId = (): string => {
  return dayjs().valueOf().toString() + Math.random().toString(36).substr(2, 9);
};
