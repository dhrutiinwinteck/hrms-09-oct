export const HOLIDAY_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [
  5,
  10,
  25,
  50,
];

export const HOLIDAY_API_ENDPOINT =
  '/api/v1/holiday';

export const ADMIN_HOLIDAY_STATISTICS_CONFIG = {
  totalHolidays: {
    title: 'Total Holidays',
  },

  upcomingHoliday: {
    title: 'Upcoming Holiday',
  },

  holidaysTaken: {
    title: 'Holidays Taken',
  },

  weekendDays: {
    title: 'Weekend Days',
  },
} as const;