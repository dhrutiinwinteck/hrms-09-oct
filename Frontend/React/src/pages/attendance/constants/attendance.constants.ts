/**
 * ======================================================
 * Attendance Module - Constants
 * ======================================================
 *
 * Centralized configuration for the Attendance module.
 *
 * Contains:
 * - Attendance status mappings
 * - Date/time constants
 * - Week/month constants
 * - Filter options
 * - Statistics configuration
 * - Table configuration
 * - Accessibility labels
 * - API endpoints
 *
 * @module constants/attendance.constants
 */

import {
  AttendanceStatus,
  StatusColorMap,
  StatusLabelMap,
} from '../types/attendance.types';

// =============================================================================
// Attendance Status Labels
// =============================================================================

export const ATTENDANCE_STATUS_LABELS: StatusLabelMap = {
  Present: 'Present',
  Absent: 'Absent',
  Late: 'Late',
  WeeklyOff: 'Weekly Off',
  Holiday: 'Holiday',
};

// =============================================================================
// Attendance Status Colors
// =============================================================================

export const ATTENDANCE_STATUS_COLORS: StatusColorMap = {
  Present: '#22c55e',
  Absent: '#ef4444',
  Late: '#f59e0b',
  WeeklyOff: '#94a3b8',
  Holiday: '#94a3b8',
};

// =============================================================================
// Attendance Status Background Colors
// =============================================================================

export const ATTENDANCE_STATUS_BG_COLORS: StatusColorMap = {
  Present: '#dcfce7',
  Absent: '#fee2e2',
  Late: '#fef3c7',
  WeeklyOff: '#f1f5f9',
  Holiday: '#f1f5f9',
};

// =============================================================================
// Attendance Status Text Colors
// =============================================================================

export const ATTENDANCE_STATUS_TEXT_COLORS: StatusColorMap = {
  Present: '#166534',
  Absent: '#991b1b',
  Late: '#92400e',
  WeeklyOff: '#475569',
  Holiday: '#475569',
};

// =============================================================================
// Attendance Status Border Colors
// =============================================================================

export const ATTENDANCE_STATUS_BORDER_COLORS: StatusColorMap = {
  Present: '#86efac',
  Absent: '#fca5a5',
  Late: '#fcd34d',
  WeeklyOff: '#cbd5e1',
  Holiday: '#cbd5e1',
};

// =============================================================================
// Attendance Status Icons
// =============================================================================

export const ATTENDANCE_STATUS_ICONS = {
  Present: 'CheckCircle',
  Absent: 'XCircle',
  Late: 'Clock',
  WeeklyOff: 'CalendarDays',
  Holiday: 'Calendar',
} as const;

// =============================================================================
// Default Attendance Filters
// =============================================================================

export const DEFAULT_ATTENDANCE_FILTERS = {
  startDate: undefined,

  endDate: undefined,

  selectedDate: undefined,

  status:
    undefined as AttendanceStatus | undefined,

  searchTerm: '',
} as const;

// =============================================================================
// General Attendance Configuration
// =============================================================================

export const DEFAULT_DAYS_IN_MONTH = 31;

export const API_DATE_FORMAT = 'YYYY-MM-DD';

export const DISPLAY_DATE_FORMAT = 'DD MMM YYYY';

export const DISPLAY_TIME_FORMAT = 'hh:mm A';

export const DEFAULT_SHIFT_NAME =
  'Regular Shift';

export const DEFAULT_PAGE_SIZE = 10;

export const STANDARD_WORKING_HOURS = 8;

export const DEFAULT_BREAK_TIME = 60;

// =============================================================================
// Weekday Constants
// =============================================================================

/**
 * Short weekday names.
 *
 * IMPORTANT:
 * attendance.mock.ts imports this constant.
 */
export const WEEKDAY_SHORT_NAMES = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

/**
 * Long weekday names.
 */
export const WEEKDAY_LONG_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// =============================================================================
// Month Constants
// =============================================================================

/**
 * Short month names.
 */
export const MONTH_SHORT_NAMES = [
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
] as const;

/**
 * Long month names.
 */
export const MONTH_LONG_NAMES = [
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
] as const;

// =============================================================================
// Status Filter Options
// =============================================================================

export const ATTENDANCE_FILTER_STATUS_OPTIONS = [
  {
    value: '',
    label: 'All Statuses',
  },
  {
    value: 'Present',
    label: 'Present',
  },
  {
    value: 'Absent',
    label: 'Absent',
  },
  {
    value: 'Late',
    label: 'Late',
  },
  {
    value: 'WeeklyOff',
    label: 'Weekly Off',
  },
  {
    value: 'Holiday',
    label: 'Holiday',
  },
] as const;

// =============================================================================
// Statistics Card Configuration
// =============================================================================

export const STATISTICS_CARDS_CONFIG = [
  {
    id: 'total-days',

    title: 'Total Days',

    iconName: 'Calendar',

    iconBgColor: '#dbeafe',

    subtitle: 'In Selected Period',
  },

  {
    id: 'present-days',

    title: 'Present Days',

    iconName: 'CheckCircle',

    iconBgColor: '#dcfce7',

    subtitle: '',

    trendLabel: 'Present',
  },

  {
    id: 'absent-days',

    title: 'Absent Days',

    iconName: 'XCircle',

    iconBgColor: '#fee2e2',

    subtitle: '',

    trendLabel: 'Absent',
  },

  {
    id: 'late-days',

    title: 'Late Days',

    iconName: 'Clock',

    iconBgColor: '#fef3c7',

    subtitle: '',

    trendLabel: 'Late',
  },

  {
    id: 'avg-hours',

    title: 'Average Working Hours',

    iconName: 'Clock',

    iconBgColor: '#f3e8ff',

    subtitle: 'Per Day',
  },
] as const;

// =============================================================================
// Attendance Table Configuration
// =============================================================================

export const ATTENDANCE_TABLE_COLUMNS = [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
  },

  {
    key: 'shift',
    label: 'Shift Time',
    sortable: false,
  },

  {
    key: 'punchIn',
    label: 'Punch In',
    sortable: false,
  },

  {
    key: 'punchOut',
    label: 'Punch Out',
    sortable: false,
  },

  {
    key: 'workingHours',
    label: 'Working Hours',
    sortable: true,
  },

  {
    key: 'breakTime',
    label: 'Break Time',
    sortable: true,
  },

  {
    key: 'status',
    label: 'Status',
    sortable: true,
  },

  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
] as const;

// =============================================================================
// Animation Configuration
// =============================================================================

export const TRANSITION_DURATION = 200;

export const TRANSITION_EASING =
  'ease-in-out';

// =============================================================================
// Accessibility Labels
// =============================================================================

export const ARIA_LABELS = {
  attendanceDashboard:
    'Attendance Dashboard',

  overviewStrip:
    'Monthly attendance overview',

  table:
    'Attendance records table',

  filterBar:
    'Attendance filters',

  downloadButton:
    'Download attendance report as Excel',

  calendarButton:
    'Select date to filter attendance',

  statusBadge: (
    status: string
  ) =>
    `Attendance status: ${status}`,

  actionMenu:
    'Actions menu',
} as const;

// =============================================================================
// API Endpoints
// =============================================================================

/**
 * Attendance API endpoints.
 *
 * These endpoints map directly to the
 * Attendance API exposed by the HRMS backend.
 */
export const API_ENDPOINTS = {
  /**
   * Attendance history.
   *
   * GET /api/v1/attendance/
   */
  attendance:
    '/api/v1/attendance/',

  /**
   * Attendance summary.
   */
  summary:
    '/api/v1/attendance/summary',

  /**
   * Monthly attendance overview.
   */
  overview:
    '/api/v1/attendance/overview',

  /**
   * Attendance export.
   */
  export:
    '/api/v1/attendance/export',

  /**
   * Attendance filtering.
   */
  filter:
    '/api/v1/attendance/filter',

  /**
   * Punch In.
   *
   * POST /api/v1/attendance/punch-in
   */
  punchIn:
    '/api/v1/attendance/punch-in',

  /**
   * Break In.
   *
   * POST /api/v1/attendance/break-in
   */
  breakIn:
    '/api/v1/attendance/break-in',

  /**
   * Break Out.
   *
   * POST /api/v1/attendance/break-out
   */
  breakOut:
    '/api/v1/attendance/break-out',

  /**
   * Punch Out.
   *
   * POST /api/v1/attendance/punch-out
   */
  punchOut:
    '/api/v1/attendance/punch-out',
} as const;