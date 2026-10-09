// // src/pages/attendance/attendance-history/constants/attendanceHistory.constants.ts

// import type { MonthOption, AttendanceInsights } from '../types/attendanceHistory.types';
// export type { MonthOption, AttendanceInsights };

// export const STATUS_LABELS: Record<string, string> = {
//   P: 'Present',
//   AB: 'Absent',
//   WO: 'Week Off',
//   LOP: 'LOP',
//   PL: 'Paid Leave',
//   CO: 'Compensatory Off',
//   CL: 'Casual Leave',
//   'HD-PL': 'Half Day PL',
//   'HD-CL': 'Half Day CL',
//   'HD-CO': 'Half Day CO',
//   PH: 'Public Holiday',
//   'HD-LOP': 'Half Day LOP',
//   LWP: 'Leave Without Pay'
// };

// export const STATUS_COLORS: Record<string, string> = {
//   P: '#22c55e',
//   AB: '#ef4444',
//   WO: '#94a3b8',
//   LOP: '#8b5cf6',
//   PL: '#3b82f6',
//   CO: '#8b5cf6',
//   CL: '#f59e0b',
//   'HD-PL': '#60a5fa',
//   'HD-CL': '#fbbf24',
//   'HD-CO': '#a78bfa',
//   PH: '#ef4444',
//   'HD-LOP': '#a78bfa',
//   LWP: '#9ca3af'
// };

// export const STATUS_BG_COLORS: Record<string, string> = {
//   P: '#dcfce7',
//   AB: '#fee2e2',
//   WO: '#f1f5f9',
//   LOP: '#ede9fe',
//   PL: '#dbeafe',
//   CO: '#ede9fe',
//   CL: '#fef3c7',
//   'HD-PL': '#dbeafe',
//   'HD-CL': '#fef3c7',
//   'HD-CO': '#ede9fe',
//   PH: '#fee2e2',
//   'HD-LOP': '#ede9fe',
//   LWP: '#f3f4f6'
// };

// export const TABLE_HEADERS = {
//   employee: 'Employee',
//   id: 'ID',
//   lateCount: 'Late Count',
//   monthlySummary: 'Monthly Attendance Summary'
// };

// export const SUMMARY_COLUMNS = [
//   { key: 'present', label: 'Present (P)' },
//   { key: 'weekOff', label: 'WO' },
//   { key: 'paidLeave', label: 'PL' },
//   { key: 'casualLeave', label: 'CL' },
//   { key: 'compensatoryLeave', label: 'CO' },
//   { key: 'halfDayPL', label: 'HD-PL' },
//   { key: 'halfDayCL', label: 'HD-CL' },
//   { key: 'halfDayCO', label: 'HD-CO' },
//   { key: 'publicHoliday', label: 'PH' },
//   { key: 'lop', label: 'LOP' },
//   { key: 'halfDayLOP', label: 'HD-LOP' },
//   { key: 'lwp', label: 'LWP' },
//   { key: 'paidDays', label: 'Paid Days' },
//   { key: 'lopAbsent', label: 'LOP/Absent' }
// ];

// export const DEFAULT_MONTH: MonthOption = {
//   label: 'May 2026',
//   value: '2026-05',
//   year: 2026,
//   month: 5
// };

// export const AVAILABLE_MONTHS: MonthOption[] = [
//   { label: 'May 2026', value: '2026-05', year: 2026, month: 5 },
//   { label: 'April 2026', value: '2026-04', year: 2026, month: 4 },
//   { label: 'March 2026', value: '2026-03', year: 2026, month: 3 },
//   { label: 'February 2026', value: '2026-02', year: 2026, month: 2 },
//   { label: 'January 2026', value: '2026-01', year: 2026, month: 1 }
// ];

// export const PAGINATION_DEFAULTS = {
//   pageSize: 5,
//   currentPage: 1
// };

// export const STATISTICS_LABELS = {
//   totalEmployees: 'Total Employees',
//   present: 'Present',
//   absent: 'Absent',
//   weekOff: 'Week Off',
//   latePunchIn: 'Late Punch In',
//   lop: 'LOP'
// };

// export const STATISTICS_ICONS = {
//   totalEmployees: 'Users',
//   present: 'CheckCircle2',
//   absent: 'XCircle',
//   weekOff: 'CalendarDays',
//   latePunchIn: 'Clock',
//   lop: 'FileText'
// };

// export const DEFAULT_INSIGHTS: AttendanceInsights = {
//   title: 'Late Arrivals Alert',
//   description: 'employees have more than 3 late arrivals this month.',
//   count: 6,
//   actionLabel: 'View Details'
// };

// export const DATE_FORMAT = 'DD MMM YYYY';
// export const SHORT_DATE_FORMAT = 'DD MMM';



import type {
  MonthOption,
  AttendanceInsights,
} from '../types/attendanceHistory.types';

export type { MonthOption, AttendanceInsights };

export const STATUS_LABELS: Record<string, string> = {
  P: 'Present',
  AB: 'Absent',
  WO: 'Week Off',
  LOP: 'LOP',
  PL: 'Paid Leave',
  CO: 'Compensatory Off',
  CL: 'Casual Leave',
  'HD-PL': 'Half Day PL',
  'HD-CL': 'Half Day CL',
  'HD-CO': 'Half Day CO',
  PH: 'Public Holiday',
  'HD-LOP': 'Half Day LOP',
  LWP: 'Leave Without Pay',
};

export const STATUS_COLORS: Record<string, string> = {
  P: '#22c55e',
  AB: '#ef4444',
  WO: '#94a3b8',
  LOP: '#8b5cf6',
  PL: '#3b82f6',
  CO: '#8b5cf6',
  CL: '#f59e0b',
  'HD-PL': '#60a5fa',
  'HD-CL': '#fbbf24',
  'HD-CO': '#a78bfa',
  PH: '#ef4444',
  'HD-LOP': '#a78bfa',
  LWP: '#9ca3af',
};

export const STATUS_BG_COLORS: Record<string, string> = {
  P: '#dcfce7',
  AB: '#fee2e2',
  WO: '#f1f5f9',
  LOP: '#ede9fe',
  PL: '#dbeafe',
  CO: '#ede9fe',
  CL: '#fef3c7',
  'HD-PL': '#dbeafe',
  'HD-CL': '#fef3c7',
  'HD-CO': '#ede9fe',
  PH: '#fee2e2',
  'HD-LOP': '#ede9fe',
  LWP: '#f3f4f6',
};

export const TABLE_HEADERS = {
  employee: 'Employee',
  id: 'ID',
  lateCount: 'Late Count',
  monthlySummary: 'Monthly Attendance Summary',
};

export const SUMMARY_COLUMNS = [
  { key: 'present', label: 'Present (P)' },
  { key: 'weekOff', label: 'WO' },
  { key: 'paidLeave', label: 'PL' },
  { key: 'casualLeave', label: 'CL' },
  { key: 'compensatoryLeave', label: 'CO' },
  { key: 'halfDayPL', label: 'HD-PL' },
  { key: 'halfDayCL', label: 'HD-CL' },
  { key: 'halfDayCO', label: 'HD-CO' },
  { key: 'publicHoliday', label: 'PH' },
  { key: 'lop', label: 'LOP' },
  { key: 'halfDayLOP', label: 'HD-LOP' },
  { key: 'lwp', label: 'LWP' },
  { key: 'paidDays', label: 'Paid Days' },
  { key: 'lopAbsent', label: 'LOP/Absent' },
];

/* ============================================================
   MONTH / YEAR CONFIGURATION
   ============================================================ */

export const MONTH_NAMES: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_NAMES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Creates all 12 month options for a given year.
 *
 * Example:
 * createMonthOptions(2026)
 *
 * returns:
 * January 2026
 * February 2026
 * ...
 * December 2026
 */
export const createMonthOptions = (
  year: number,
): MonthOption[] => {
  return MONTH_NAMES.map((label, index) => {
    const month = index + 1;

    return {
      label: `${label} ${year}`,
      value: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
    };
  });
};

/**
 * Default month used when Attendance History opens.
 */
export const DEFAULT_MONTH: MonthOption = {
  label: 'May 2026',
  value: '2026-05',
  year: 2026,
  month: 5,
};

export const PAGINATION_DEFAULTS = {
  pageSize: 20,
  currentPage: 1,
};

export const STATISTICS_LABELS = {
  totalEmployees: 'Total Employees',
  present: 'Present',
  absent: 'Absent',
  weekOff: 'Week Off',
  latePunchIn: 'Late Punch In',
  lop: 'LOP',
};

export const STATISTICS_ICONS = {
  totalEmployees: 'Users',
  present: 'CheckCircle2',
  absent: 'XCircle',
  weekOff: 'CalendarDays',
  latePunchIn: 'Clock',
  lop: 'FileText',
};

export const DEFAULT_INSIGHTS: AttendanceInsights = {
  title: 'Late Arrivals Alert',
  description: 'employees have more than 3 late arrivals this month.',
  count: 6,
  actionLabel: 'View Details',
};

export const DATE_FORMAT = 'DD MMM YYYY';

export const SHORT_DATE_FORMAT = 'DD MMM';