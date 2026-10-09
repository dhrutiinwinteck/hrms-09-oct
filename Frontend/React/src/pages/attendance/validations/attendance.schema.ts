/**
 * ======================================================
 * Attendance Module - Validation Schemas
 * ======================================================
 * Enterprise-grade Zod schemas for validating attendance data.
 * Ensures data integrity at runtime, especially when switching to real API.
 * Provides type safety and validation for all attendance-related data structures.
 *
 * Principles:
 * - Comprehensive Validation: All fields are validated with appropriate rules
 * - Type Safety: Extracted types match the schemas
 * - Error Messages: Clear, user-friendly error messages
 * - Reusability: Schemas can be composed for different use cases
 *
 * @module validations/attendance.schema
 */

import { z } from 'zod';
import {
  AttendanceStatus,
} from '../types/attendance.types';
import {
  ATTENDANCE_STATUS_LABELS,
} from '../constants/attendance.constants';

// -----------------------------------------------------------------------------
// Primitives
// -----------------------------------------------------------------------------

/**
 * Valid attendance status values.
 */
const attendanceStatusValues = Object.keys(ATTENDANCE_STATUS_LABELS) as [AttendanceStatus, ...AttendanceStatus[]];
const attendanceStatusSchema = z.enum(attendanceStatusValues);

/**
 * Date string in YYYY-MM-DD format.
 */
const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

/**
 * Time string in HH:MM format (24-hour or AM/PM).
 * For simplicity, we allow HH:MM in 24-hour format.
 */
const timeStringSchema = z.string().regex(
  /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
);

/**
 * Positive integer for IDs and counts.
 */
// const positiveIntegerSchema = z.number().int().positive();

// -----------------------------------------------------------------------------
// Domain Schemas
// -----------------------------------------------------------------------------

/**
 * Schema for Attendance Record.
 * Validates all fields of an attendance record.
 */
export const attendanceRecordSchema = z.object({
  id: z.string().min(1, 'Record ID is required'),
  date: dateStringSchema,
  shift: z.string().min(1, 'Shift is required'),
  punchIn: timeStringSchema.or(z.literal('--:--')).or(z.literal('No Punch')),
  punchOut: timeStringSchema.or(z.literal('--:--')).or(z.literal('No Punch')),
  workingHours: z.number().min(0, 'Working hours cannot be negative').max(24, 'Working hours cannot exceed 24'),
  breakTime: z.number().min(0, 'Break time cannot be negative'),
  status: attendanceStatusSchema,
  employeeName: z.string().optional(),
});

/**
 * Schema for Attendance Overview Item.
 */
export const attendanceOverviewItemSchema = z.object({
  date: dateStringSchema,
  dayOfWeek: z.string().min(1, 'Day of week is required'),
  dayOfMonth: z.number().int().min(1).max(31, 'Day of month must be between 1 and 31'),
  status: attendanceStatusSchema,
});

/**
 * Schema for Attendance Summary.
 */
export const attendanceSummarySchema = z.object({
  totalDays: z.number().int().nonnegative('Total days cannot be negative'),
  presentDays: z.number().int().nonnegative('Present days cannot be negative'),
  presentPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  absentDays: z.number().int().nonnegative('Absent days cannot be negative'),
  absentPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  lateDays: z.number().int().nonnegative('Late days cannot be negative'),
  latePercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  averageWorkingHours: z.string().regex(
    /^\d{2}:\d{2}$/,
    'Average working hours must be in HH:MM format'
  ),
});

/**
 * Schema for Attendance Filter.
 * All fields are optional; validates format when present.
 */
export const attendanceFilterSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  selectedDate: dateStringSchema.optional(),
  status: attendanceStatusSchema.optional(),
  searchTerm: z.string().optional(),
}).refine(
  (data) => {
    // Ensure startDate <= endDate if both present
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

/**
 * Schema for Attendance API Response.
 */
export const attendanceApiResponseSchema = z.object({
  records: z.array(attendanceRecordSchema),
  summary: attendanceSummarySchema,
  overview: z.array(attendanceOverviewItemSchema),
  totalCount: z.number().int().nonnegative().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

/**
 * Schema for Attendance Export Response.
 */
export const attendanceExportResponseSchema = z.object({
  downloadUrl: z.string().url('Invalid download URL'),
  fileName: z.string().min(1, 'File name is required'),
});

// -----------------------------------------------------------------------------
// Partial Schemas (for updates, etc.)
// -----------------------------------------------------------------------------

/**
 * Schema for creating a new attendance record (without ID).
 */
export const createAttendanceRecordSchema = attendanceRecordSchema.omit({ id: true });

/**
 * Schema for updating an existing attendance record (partial update).
 */
export const updateAttendanceRecordSchema = attendanceRecordSchema.partial();

// -----------------------------------------------------------------------------
// Type Exports (derived from schemas)
// -----------------------------------------------------------------------------

/** Type derived from attendanceRecordSchema. */
export type ValidatedAttendanceRecord = z.infer<typeof attendanceRecordSchema>;

/** Type derived from attendanceOverviewItemSchema. */
export type ValidatedAttendanceOverviewItem = z.infer<typeof attendanceOverviewItemSchema>;

/** Type derived from attendanceSummarySchema. */
export type ValidatedAttendanceSummary = z.infer<typeof attendanceSummarySchema>;

/** Type derived from attendanceFilterSchema. */
export type ValidatedAttendanceFilter = z.infer<typeof attendanceFilterSchema>;

/** Type derived from attendanceApiResponseSchema. */
export type ValidatedAttendanceApiResponse = z.infer<typeof attendanceApiResponseSchema>;

/** Type derived from attendanceExportResponseSchema. */
export type ValidatedAttendanceExportResponse = z.infer<typeof attendanceExportResponseSchema>;

// -----------------------------------------------------------------------------
// Validation Helper Functions
// -----------------------------------------------------------------------------

/**
 * Validates an attendance record and returns the parsed object or throws.
 * @param data - Raw attendance record data.
 * @returns Validated attendance record.
 * @throws ZodError if validation fails.
 */
export const validateAttendanceRecord = (data: unknown): ValidatedAttendanceRecord => {
  return attendanceRecordSchema.parse(data);
};

/**
 * Validates an attendance record and returns the parsed object or null if invalid.
 * @param data - Raw attendance record data.
 * @returns Validated attendance record or null.
 */
export const safeValidateAttendanceRecord = (data: unknown): ValidatedAttendanceRecord | null => {
  const result = attendanceRecordSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Validates attendance filters and returns the parsed object or throws.
 * @param data - Raw filter data.
 * @returns Validated attendance filter.
 * @throws ZodError if validation fails.
 */
export const validateAttendanceFilter = (data: unknown): ValidatedAttendanceFilter => {
  return attendanceFilterSchema.parse(data);
};

/**
 * Validates attendance filters and returns the parsed object or null if invalid.
 * @param data - Raw filter data.
 * @returns Validated attendance filter or null.
 */
export const safeValidateAttendanceFilter = (data: unknown): ValidatedAttendanceFilter | null => {
  const result = attendanceFilterSchema.safeParse(data);
  return result.success ? result.data : null;
};

/**
 * Validates an API response and returns the parsed object or throws.
 * @param data - Raw API response data.
 * @returns Validated API response.
 * @throws ZodError if validation fails.
 */
export const validateAttendanceApiResponse = (data: unknown): ValidatedAttendanceApiResponse => {
  return attendanceApiResponseSchema.parse(data);
};

// -----------------------------------------------------------------------------
// Utility: Check if a date string is valid
// -----------------------------------------------------------------------------

/**
 * Checks if a string is a valid date in YYYY-MM-DD format.
 * @param dateStr - Date string to check.
 * @returns True if valid.
 */
export const isValidDateString = (dateStr: string): boolean => {
  return dateStringSchema.safeParse(dateStr).success;
};

/**
 * Checks if a string is a valid time in HH:MM format.
 * @param timeStr - Time string to check.
 * @returns True if valid.
 */
export const isValidTimeString = (timeStr: string): boolean => {
  return timeStringSchema.safeParse(timeStr).success;
};