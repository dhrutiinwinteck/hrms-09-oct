import { MonthOption } from '../types/editPunchInOut.types';

export const MONTHS: MonthOption[] = [
  { value: '2026-01', label: 'January 2026', month: 0, year: 2026 },
  { value: '2026-02', label: 'February 2026', month: 1, year: 2026 },
  { value: '2026-03', label: 'March 2026', month: 2, year: 2026 },
  { value: '2026-04', label: 'April 2026', month: 3, year: 2026 },
  { value: '2026-05', label: 'May 2026', month: 4, year: 2026 },
  { value: '2026-06', label: 'June 2026', month: 5, year: 2026 },
  { value: '2026-07', label: 'July 2026', month: 6, year: 2026 },
  { value: '2026-08', label: 'August 2026', month: 7, year: 2026 },
  { value: '2026-09', label: 'September 2026', month: 8, year: 2026 },
  { value: '2026-10', label: 'October 2026', month: 9, year: 2026 },
  { value: '2026-11', label: 'November 2026', month: 10, year: 2026 },
  { value: '2026-12', label: 'December 2026', month: 11, year: 2026 },
];

export const UI_LABELS = {
  employee: 'Employee',
  month: 'Month',
  selectEmployee: 'Select employee',
  selectMonth: 'Select month',
  searchEmployee: 'Search employee...',
  searchMonth: 'Search month...',
  search: 'Search',
  attendance: 'Attendance',
  subtitle: 'View and manage attendance records for your team.',
  emptyState: 'Select an employee and month to view attendance details',
};

export const DROPDOWN_CONFIG = {
  maxHeight: '200px',
  minWidth: '200px',
  animationDuration: '200ms',
};