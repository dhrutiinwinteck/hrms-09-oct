/**
 * ======================================================
 * Attendance Module - Utility Functions
 * ======================================================
 * Enterprise-grade utility functions for attendance operations.
 * Provides pure functions for data transformation, formatting,
 * calculations, and status helpers.
 *
 * Principles:
 * - Pure Functions: No side effects, deterministic outputs
 * - Immutability: Returns new objects/arrays, doesn't mutate inputs
 * - Composition: Functions can be composed for complex operations
 * - Type Safety: Fully typed with TypeScript
 *
 * @module utils/attendance.utils
 */

import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceOverviewItem,
  AttendanceStatus,
  AttendanceFilter,
} from '../types/attendance.types';
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_BG_COLORS,
  ATTENDANCE_STATUS_TEXT_COLORS,
  ATTENDANCE_STATUS_BORDER_COLORS,
  WEEKDAY_SHORT_NAMES,
  MONTH_SHORT_NAMES,
} from '../constants/attendance.constants';

// -----------------------------------------------------------------------------
// Status Helpers
// -----------------------------------------------------------------------------

/**
 * Gets the human-readable label for an attendance status.
 * @param status - Attendance status.
 * @returns Display label.
 */
export const getStatusLabel = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_LABELS[status] || status;
};

/**
 * Gets the CSS color for a status (for dots, badges, etc.).
 * @param status - Attendance status.
 * @returns Hex color code.
 */
export const getStatusColor = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_COLORS[status] || '#94a3b8';
};

/**
 * Gets the background color for a status badge.
 * @param status - Attendance status.
 * @returns Hex color code.
 */
export const getStatusBgColor = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_BG_COLORS[status] || '#f1f5f9';
};

/**
 * Gets the text color for a status badge.
 * @param status - Attendance status.
 * @returns Hex color code.
 */
export const getStatusTextColor = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_TEXT_COLORS[status] || '#475569';
};

/**
 * Gets the border color for a status badge.
 * @param status - Attendance status.
 * @returns Hex color code.
 */
export const getStatusBorderColor = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_BORDER_COLORS[status] || '#cbd5e1';
};

/**
 * Checks if a status indicates the employee was present (includes Late).
 * @param status - Attendance status.
 * @returns True if present or late.
 */
export const isPresentStatus = (status: AttendanceStatus): boolean => {
  return status === 'Present' || status === 'Late';
};

/**
 * Checks if a status indicates the employee was absent.
 * @param status - Attendance status.
 * @returns True if absent.
 */
export const isAbsentStatus = (status: AttendanceStatus): boolean => {
  return status === 'Absent';
};

/**
 * Checks if a status indicates a non-working day (Holiday or Weekly Off).
 * @param status - Attendance status.
 * @returns True if holiday or weekly off.
 */
export const isNonWorkingDay = (status: AttendanceStatus): boolean => {
  return status === 'Holiday' || status === 'WeeklyOff';
};

// -----------------------------------------------------------------------------
// Date & Time Formatting
// -----------------------------------------------------------------------------

/**
 * Formats a date string (YYYY-MM-DD) to display format (e.g., "01 Jul 2026").
 * @param dateStr - Date string in YYYY-MM-DD format.
 * @returns Formatted date string.
 */
export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  // const date = new Date(year, month, day);
  const monthName = MONTH_SHORT_NAMES[month];
  return `${String(day).padStart(2, '0')} ${monthName} ${year}`;
};

/**
 * Formats a time string (HH:MM) to display format (e.g., "09:02 AM").
 * Handles special values like "--:--" and "No Punch".
 * @param timeStr - Time string in HH:MM format or special value.
 * @returns Formatted time string.
 */
export const formatDisplayTime = (timeStr: string): string => {
  if (!timeStr || timeStr === '--:--' || timeStr === 'No Punch') {
    return timeStr || '--:--';
  }
  const parts = timeStr.split(':');
  if (parts.length !== 2) return timeStr;
  const hour = parseInt(parts[0]);
  const minute = parseInt(parts[1]);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
};

/**
 * Formats working hours (decimal) to display format (e.g., "08:59").
 * @param hours - Working hours as decimal.
 * @returns Formatted hours string (HH:MM).
 */
export const formatWorkingHours = (hours: number): string => {
  if (hours === 0) return '00:00';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Formats break time (minutes) to display format (e.g., "01:00").
 * @param minutes - Break time in minutes.
 * @returns Formatted time string (HH:MM).
 */
export const formatBreakTime = (minutes: number): string => {
  if (minutes === 0) return '00:00';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Gets the short weekday name for a date string.
 * @param dateStr - Date string in YYYY-MM-DD format.
 * @returns Short weekday name (e.g., "Mon").
 */
export const getDayOfWeek = (dateStr: string): string => {
  const date = new Date(dateStr);
  return WEEKDAY_SHORT_NAMES[date.getDay()];
};

/**
 * Gets the day of month for a date string.
 * @param dateStr - Date string in YYYY-MM-DD format.
 * @returns Day of month (1-31).
 */
export const getDayOfMonth = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getDate();
};

// -----------------------------------------------------------------------------
// Summary Calculations
// -----------------------------------------------------------------------------

/**
 * Calculates summary statistics from attendance records.
 * @param records - Array of attendance records.
 * @param totalDays - Total working days (optional, if not provided, calculated from records).
 * @returns AttendanceSummary object.
 */
export const calculateSummaryFromRecords = (
  records: AttendanceRecord[],
  totalDays?: number
): AttendanceSummary => {
  const total = records.length;
  
  // Count by status
  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const late = records.filter(r => r.status === 'Late').length;
  const weeklyOff = records.filter(r => r.status === 'WeeklyOff').length;
  const holiday = records.filter(r => r.status === 'Holiday').length;

  // Calculate working days (excluding WeeklyOff and Holiday)
  const workingDays = total - weeklyOff - holiday;
  
  // Calculate percentages (based on working days)
  const presentPercentage = workingDays > 0 ? Math.round((present / workingDays) * 100) : 0;
  const absentPercentage = workingDays > 0 ? Math.round((absent / workingDays) * 100) : 0;
  const latePercentage = workingDays > 0 ? Math.round((late / workingDays) * 100) : 0;

  // Calculate average working hours (from Present and Late records only)
  const workRecords = records.filter(r => r.status === 'Present' || r.status === 'Late');
  const totalHours = workRecords.reduce((sum, r) => sum + r.workingHours, 0);
  const avgHours = workRecords.length > 0 ? totalHours / workRecords.length : 0;
  
  // Format average hours as HH:MM
  const avgHoursFormatted = formatWorkingHours(avgHours);

  // If totalDays not provided, use total records count (or workingDays + weeklyOff + holiday)
  const totalDaysValue = totalDays || total;

  return {
    totalDays: totalDaysValue,
    presentDays: present,
    presentPercentage,
    absentDays: absent,
    absentPercentage,
    lateDays: late,
    latePercentage,
    averageWorkingHours: avgHoursFormatted,
  };
};

/**
 * Calculates the total number of days in a given month.
 * @param year - Year (e.g., 2026).
 * @param month - Month (1-12).
 * @returns Number of days in the month.
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Generates an array of dates for a given month.
 * @param year - Year (e.g., 2026).
 * @param month - Month (1-12).
 * @returns Array of date strings in YYYY-MM-DD format.
 */
export const getMonthDates = (year: number, month: number): string[] => {
  const daysInMonth = getDaysInMonth(year, month);
  const dates: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }
  return dates;
};

// -----------------------------------------------------------------------------
// Filter Operations
// -----------------------------------------------------------------------------

/**
 * Filters attendance records based on criteria.
 * Performs client-side filtering (useful for mock data or when API lacks filtering).
 * @param records - Array of attendance records.
 * @param filters - Filter criteria.
 * @returns Filtered array of records.
 */
export const filterAttendanceRecords = (
  records: AttendanceRecord[],
  filters: AttendanceFilter
): AttendanceRecord[] => {
  let filtered = [...records];

  if (filters.selectedDate) {
    filtered = filtered.filter(r => r.date === filters.selectedDate);
  }
  if (filters.startDate) {
    filtered = filtered.filter(r => r.date >= filters.startDate!);
  }
  if (filters.endDate) {
    filtered = filtered.filter(r => r.date <= filters.endDate!);
  }
  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  if (filters.searchTerm) {
    const search = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(r =>
      (r.employeeName && r.employeeName.toLowerCase().includes(search)) ||
      r.id.toLowerCase().includes(search) ||
      r.shift.toLowerCase().includes(search)
    );
  }

  return filtered;
};

/**
 * Checks if a date is within a given range.
 * @param date - Date string in YYYY-MM-DD format.
 * @param startDate - Start date (inclusive).
 * @param endDate - End date (inclusive).
 * @returns True if date is within range.
 */
export const isDateInRange = (
  date: string,
  startDate?: string,
  endDate?: string
): boolean => {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

// -----------------------------------------------------------------------------
// Overview Generation
// -----------------------------------------------------------------------------

/**
 * Generates attendance overview data for a month from attendance records.
 * @param records - Attendance records.
 * @param year - Year.
 * @param month - Month (1-12).
 * @returns Array of AttendanceOverviewItem.
 */
export const generateOverviewFromRecords = (
  records: AttendanceRecord[],
  year: number,
  month: number
): AttendanceOverviewItem[] => {
  const dates = getMonthDates(year, month);
  const overview: AttendanceOverviewItem[] = [];

  dates.forEach(dateStr => {
    const record = records.find(r => r.date === dateStr);
    const status = record ? record.status : 'WeeklyOff'; // Default to WeeklyOff if no record (weekend)
    const dayOfWeek = getDayOfWeek(dateStr);
    const dayOfMonth = getDayOfMonth(dateStr);

    overview.push({
      date: dateStr,
      dayOfWeek,
      dayOfMonth,
      status,
    });
  });

  return overview;
};

// -----------------------------------------------------------------------------
// Sort & Group Utilities
// -----------------------------------------------------------------------------

/**
 * Sorts attendance records by date (newest first).
 * @param records - Array of attendance records.
 * @returns Sorted array (newest first).
 */
export const sortRecordsByDateDesc = (records: AttendanceRecord[]): AttendanceRecord[] => {
  return [...records].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });
};

/**
 * Sorts attendance records by date (oldest first).
 * @param records - Array of attendance records.
 * @returns Sorted array (oldest first).
 */
export const sortRecordsByDateAsc = (records: AttendanceRecord[]): AttendanceRecord[] => {
  return [...records].sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return 0;
  });
};

/**
 * Groups attendance records by month.
 * @param records - Array of attendance records.
 * @returns Object with month-year keys and arrays of records.
 */
export const groupRecordsByMonth = (
  records: AttendanceRecord[]
): Record<string, AttendanceRecord[]> => {
  const groups: Record<string, AttendanceRecord[]> = {};
  records.forEach(record => {
    const key = record.date.substring(0, 7); // YYYY-MM
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
  });
  return groups;
};

// -----------------------------------------------------------------------------
// Validation Helpers
// -----------------------------------------------------------------------------

/**
 * Checks if a status is valid.
 * @param status - Status string.
 * @returns True if valid AttendanceStatus.
 */
export const isValidStatus = (status: string): status is AttendanceStatus => {
  return Object.keys(ATTENDANCE_STATUS_LABELS).includes(status);
};

// -----------------------------------------------------------------------------
// Percentage Calculation
// -----------------------------------------------------------------------------

/**
 * Calculates percentage from part and total.
 * @param part - Part value.
 * @param total - Total value.
 * @param decimals - Number of decimal places (default: 0).
 * @returns Percentage as a number.
 */
export const calculatePercentage = (
  part: number,
  total: number,
  decimals: number = 0
): number => {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
};