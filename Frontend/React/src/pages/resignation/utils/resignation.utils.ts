// ============================================================
// RESIGNATION UTILITIES
// Enterprise-grade pure helper functions.
// No React, No API, No Axios.
// ============================================================

/**
 * Formats a date to a localized string (DD MMM YYYY).
 * @param date - The date string or Date object.
 * @param fallback - The value to return if parsing fails.
 * @returns The formatted date string.
 */
export const formatDate = (date: string | Date, fallback: string = '-'): string => {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats a date to a localized date and time string (DD MMM YYYY, HH:MM AM/PM).
 * @param date - The date string or Date object.
 * @param fallback - The value to return if parsing fails.
 * @returns The formatted date-time string.
 */
export const formatDateTime = (date: string | Date, fallback: string = '-'): string => {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Calculates the end date of the notice period.
 * @param startDate - The start date (ISO string or Date object).
 * @param noticeDays - The number of days in the notice period.
 * @returns The end date as an ISO string, or an empty string if invalid.
 */
export const calculateNoticeEndDate = (startDate: string | Date, noticeDays: number): string => {
  if (!startDate || isNaN(noticeDays) || noticeDays < 0) return '';
  const d = new Date(startDate);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + noticeDays);
  return d.toISOString().split('T')[0];
};

/**
 * Calculates the remaining days in the notice period.
 * @param startDate - The start date (ISO string or Date object).
 * @param endDate - The end date (ISO string or Date object).
 * @returns The number of remaining days, or -1 if dates are invalid.
 */
export const calculateRemainingNoticeDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return -1;
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Checks if the notice period is completed (end date is in the past).
 * @param endDate - The end date to check.
 * @returns True if the end date is in the past, false otherwise.
 */
export const isNoticeCompleted = (endDate: string | Date): boolean => {
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
};

/**
 * Sorts an array of resignation records by submission date (newest first).
 * @param records - The array of objects containing a 'submissionDate' key.
 * @returns The sorted array.
 */
export const sortBySubmissionDate = <T extends { submissionDate: string | Date }>(records: T[]): T[] => {
  return [...records].sort((a, b) => {
    const dA = new Date(a.submissionDate).getTime();
    const dB = new Date(b.submissionDate).getTime();
    return dB - dA;
  });
};

/**
 * Sorts an array of resignation records by status.
 * @param records - The array of objects containing a 'status' key.
 * @param order - The order to sort by (default: 'asc').
 * @returns The sorted array.
 */
export const sortByStatus = <T extends { status: string }>(
  records: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...records].sort((a, b) => {
    const compare = a.status.localeCompare(b.status);
    return order === 'asc' ? compare : -compare;
  });
};

/**
 * Filters and searches resignation records based on a query string.
 * @param records - The array of records to search.
 * @param query - The search string.
 * @param fields - The fields to search against (e.g., 'employeeName', 'reason').
 * @returns The filtered array.
 */
export const searchResignations = <T extends Record<string, any>>(
  records: T[],
  query: string,
  fields: (keyof T)[]
): T[] => {
  if (!query.trim()) return records;
  const q = query.toLowerCase().trim();
  return records.filter((record) =>
    fields.some((field) => {
      const value = String(record[field] || '').toLowerCase();
      return value.includes(q);
    })
  );
};

/**
 * Filters an array of records by a specific status.
 * @param records - The array of records to filter.
 * @param status - The status to filter by.
 * @returns The filtered array.
 */
export const filterByStatus = <T extends { status: string }>(
  records: T[],
  status: string
): T[] => {
  if (!status) return records;
  return records.filter((record) => record.status === status);
};

/**
 * Filters an array of records by a specific department.
 * @param records - The array of records containing an 'employee' object with a 'department' key.
 * @param department - The department to filter by.
 * @returns The filtered array.
 */
export const filterByDepartment = <T extends { employee: { department: string } }>(
  records: T[],
  department: string
): T[] => {
  if (!department) return records;
  return records.filter((record) => record.employee.department === department);
};

/**
 * Filters an array of records by a specific manager.
 * @param records - The array of records containing a 'reportingManager' key.
 * @param manager - The manager name to filter by.
 * @returns The filtered array.
 */
export const filterByManager = <T extends { reportingManager: string }>(
  records: T[],
  manager: string
): T[] => {
  if (!manager) return records;
  return records.filter((record) => record.reportingManager === manager);
};

/**
 * Filters an array of records by a date range (submissionDate).
 * @param records - The array of records containing a 'submissionDate' key.
 * @param startDate - The start of the date range (ISO string).
 * @param endDate - The end of the date range (ISO string).
 * @returns The filtered array.
 */
export const filterByDateRange = <T extends { submissionDate: string | Date }>(
  records: T[],
  startDate?: string,
  endDate?: string
): T[] => {
  if (!startDate && !endDate) return records;
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Infinity;

  return records.filter((record) => {
    const recordDate = new Date(record.submissionDate).getTime();
    return recordDate >= start && recordDate <= end;
  });
};

/**
 * Generates a unique, sequential resignation number.
 * @param prefix - The prefix for the resignation number (e.g., 'RES').
 * @param sequence - The sequence number to append.
 * @returns The formatted resignation number.
 */
export const generateResignationNumber = (prefix: string = 'RES', sequence: number): string => {
  const padded = String(sequence).padStart(6, '0');
  return `${prefix}-${padded}`;
};

/**
 * Capitalizes the first letter of every word in a string.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Truncates a string to a specified length and appends '...' if exceeded.
 * @param text - The text to truncate.
 * @param maxLength - The maximum allowed length.
 * @returns The truncated string.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Returns the appropriate CSS color class for a given status.
 * @param status - The status string.
 * @returns The CSS class name.
 */
export const statusColor = (status: string): string => {
  const map: Record<string, string> = {
    Pending: 'status-pending',
    Approved: 'status-approved',
    Rejected: 'status-rejected',
    Cancelled: 'status-cancelled',
    Withdrawn: 'status-withdrawn',
  };
  return map[status] || 'status-default';
};

/**
 * Returns the appropriate Lucide icon name for a given status.
 * @param status - The status string.
 * @returns The icon name.
 */
export const statusIcon = (status: string): string => {
  const map: Record<string, string> = {
    Pending: 'Clock',
    Approved: 'CheckCircle',
    Rejected: 'XCircle',
    Cancelled: 'Ban',
    Withdrawn: 'Undo2',
  };
  return map[status] || 'Info';
};