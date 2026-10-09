/**
 * ======================================================
 * Attendance Module - Data Mapper
 * ======================================================
 * Enterprise-grade data mapper for transforming between different
 * data representations (API, domain, UI).
 *
 * Responsibilities:
 * - Converts API responses to domain models
 * - Converts domain models to API request payloads
 * - Validates and transforms data between layers
 * - Ensures data consistency across the application
 *
 * Principles:
 * - Single Responsibility: Each mapper function handles one transformation
 * - Immutability: Returns new objects, doesn't mutate inputs
 * - Type Safety: Fully typed transformations
 * - Validation: Applies Zod schemas for data integrity
 *
 * @module utils/attendance.mapper
 */

import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceOverviewItem,
  AttendanceFilter,
  AttendanceApiResponse,
  AttendanceStatus,
} from '../types/attendance.types';
import {
  validateAttendanceRecord,
  attendanceSummarySchema,
  attendanceOverviewItemSchema,
  validateAttendanceFilter,
  validateAttendanceApiResponse,
} from '../validations/attendance.schema';
import {
  formatDisplayDate,
  formatDisplayTime,
  formatWorkingHours,
  formatBreakTime,
  getStatusLabel,
  getStatusColor,
} from './attendance.utils';

// -----------------------------------------------------------------------------
// API to Domain Mappers
// -----------------------------------------------------------------------------

/**
 * Maps a raw API record to a domain AttendanceRecord.
 * Validates and transforms the data.
 * @param raw - Raw API record data.
 * @returns Validated AttendanceRecord.
 * @throws ZodError if validation fails.
 */
export const mapApiRecordToDomain = (raw: unknown): AttendanceRecord => {
  return validateAttendanceRecord(raw);
};

/**
 * Maps an array of API records to domain AttendanceRecord array.
 * Filters out invalid records and logs warnings.
 * @param rawRecords - Array of raw API records.
 * @returns Array of validated AttendanceRecord.
 */
export const mapApiRecordsToDomain = (rawRecords: unknown[]): AttendanceRecord[] => {
  return rawRecords
    .map(record => {
      try {
        return mapApiRecordToDomain(record);
      } catch (error) {
        console.warn('Invalid attendance record skipped:', error);
        return null;
      }
    })
    .filter((record): record is AttendanceRecord => record !== null);
};

/**
 * Maps a raw API overview item to domain AttendanceOverviewItem.
 * @param raw - Raw API overview data.
 * @returns Validated AttendanceOverviewItem.
 */
export const mapApiOverviewToDomain = (raw: unknown): AttendanceOverviewItem => {
   return attendanceOverviewItemSchema.parse(raw);
};

/**
 * Maps raw API summary to domain AttendanceSummary.
 * @param raw - Raw API summary data.
 * @returns Validated AttendanceSummary.
 */
export const mapApiSummaryToDomain = (raw: unknown): AttendanceSummary => {
    return attendanceSummarySchema.parse(raw);
};

/**
 * Maps a raw API response to domain AttendanceApiResponse.
 * Transforms the entire response, including nested objects.
 * @param raw - Raw API response.
 * @returns Validated AttendanceApiResponse.
 */
export const mapApiResponseToDomain = (raw: unknown): AttendanceApiResponse => {
  const validated = validateAttendanceApiResponse(raw);
  
  // Additional transformation logic can be added here
  // For example, formatting dates, computing derived fields, etc.
  return validated;
};

/**
 * Maps a raw filter object to domain AttendanceFilter.
 * @param raw - Raw filter data.
 * @returns Validated AttendanceFilter.
 */
export const mapApiFilterToDomain = (raw: unknown): AttendanceFilter => {
  return validateAttendanceFilter(raw);
};

// -----------------------------------------------------------------------------
// Domain to API Mappers
// -----------------------------------------------------------------------------

/**
 * Maps a domain AttendanceRecord to API payload format.
 * @param record - Domain attendance record.
 * @returns API-ready object.
 */
export const mapDomainRecordToApi = (record: AttendanceRecord): Record<string, unknown> => {
  return {
    id: record.id,
    date: record.date,
    shift: record.shift,
    punch_in: record.punchIn,
    punch_out: record.punchOut,
    working_hours: record.workingHours,
    break_time: record.breakTime,
    status: record.status,
    employee_name: record.employeeName,
  };
};

/**
 * Maps an array of domain records to API payload.
 * @param records - Array of domain records.
 * @returns Array of API-ready objects.
 */
export const mapDomainRecordsToApi = (
  records: AttendanceRecord[]
): Record<string, unknown>[] => {
  return records.map(mapDomainRecordToApi);
};

/**
 * Maps domain filters to API query parameters.
 * @param filters - Domain filter object.
 * @returns API-ready filter object.
 */
export const mapDomainFilterToApi = (filters: AttendanceFilter): Record<string, string> => {
  const apiFilters: Record<string, string> = {};
  
  if (filters.startDate) apiFilters.start_date = filters.startDate;
  if (filters.endDate) apiFilters.end_date = filters.endDate;
  if (filters.selectedDate) apiFilters.date = filters.selectedDate;
  if (filters.status) apiFilters.status = filters.status;
  if (filters.searchTerm) apiFilters.search = filters.searchTerm;
  
  return apiFilters;
};

// -----------------------------------------------------------------------------
// UI Mappers (Domain to UI-friendly formats)
// -----------------------------------------------------------------------------

/**
 * Maps a domain record to a UI-friendly table row object.
 * Includes formatted values and additional display fields.
 * @param record - Domain attendance record.
 * @returns UI-ready table row.
 */
export const mapDomainRecordToTableRow = (
  record: AttendanceRecord
): {
  id: string;
  date: string;
  dateDisplay: string;
  shift: string;
  punchIn: string;
  punchInDisplay: string;
  punchOut: string;
  punchOutDisplay: string;
  workingHours: string;
  breakTime: string;
  status: AttendanceStatus;
  statusLabel: string;
  statusColor: string;
  employeeName?: string;
} => {
  return {
    id: record.id,
    date: record.date,
    dateDisplay: formatDisplayDate(record.date),
    shift: record.shift,
    punchIn: record.punchIn,
    punchInDisplay: formatDisplayTime(record.punchIn),
    punchOut: record.punchOut,
    punchOutDisplay: formatDisplayTime(record.punchOut),
    workingHours: formatWorkingHours(record.workingHours),
    breakTime: formatBreakTime(record.breakTime),
    status: record.status,
    statusLabel: getStatusLabel(record.status),
    statusColor: getStatusColor(record.status),
    employeeName: record.employeeName,
  };
};

/**
 * Maps an array of domain records to UI-friendly table rows.
 * @param records - Array of domain records.
 * @returns Array of UI-ready table rows.
 */
export const mapDomainRecordsToTableRows = (
  records: AttendanceRecord[]
): ReturnType<typeof mapDomainRecordToTableRow>[] => {
  return records.map(mapDomainRecordToTableRow);
};

/**
 * Maps a domain overview item to a UI-friendly overview dot.
 * @param item - Domain overview item.
 * @returns UI-ready overview object.
 */
export const mapDomainOverviewToUI = (
  item: AttendanceOverviewItem
): {
  date: string;
  day: string;
  dayOfMonth: number;
  status: AttendanceStatus;
  color: string;
  label: string;
} => {
  return {
    date: item.date,
    day: item.dayOfWeek,
    dayOfMonth: item.dayOfMonth,
    status: item.status,
    color: getStatusColor(item.status),
    label: getStatusLabel(item.status),
  };
};

/**
 * Maps domain summary to UI-friendly format.
 * @param summary - Domain summary.
 * @returns UI-ready summary object.
 */
export const mapDomainSummaryToUI = (
  summary: AttendanceSummary
): {
  totalDays: number;
  presentDays: number;
  presentPercentage: string;
  absentDays: number;
  absentPercentage: string;
  lateDays: number;
  latePercentage: string;
  averageWorkingHours: string;
} => {
  return {
    totalDays: summary.totalDays,
    presentDays: summary.presentDays,
    presentPercentage: `${summary.presentPercentage}%`,
    absentDays: summary.absentDays,
    absentPercentage: `${summary.absentPercentage}%`,
    lateDays: summary.lateDays,
    latePercentage: `${summary.latePercentage}%`,
    averageWorkingHours: summary.averageWorkingHours,
  };
};

// -----------------------------------------------------------------------------
// Batch Transformation Helpers
// -----------------------------------------------------------------------------

/**
 * Transforms a raw API response into a fully processed UI-ready data object.
 * Combines multiple mappers for a complete transformation pipeline.
 * @param rawResponse - Raw API response.
 * @returns Fully processed UI-ready data.
 */
export const transformApiResponseToUI = (
  rawResponse: unknown
): {
  records: ReturnType<typeof mapDomainRecordToTableRow>[];
  overview: ReturnType<typeof mapDomainOverviewToUI>[];
  summary: ReturnType<typeof mapDomainSummaryToUI>;
  totalCount: number;
} => {
  const domain = mapApiResponseToDomain(rawResponse);
  
  return {
    records: mapDomainRecordsToTableRows(domain.records),
    overview: domain.overview.map(mapDomainOverviewToUI),
    summary: mapDomainSummaryToUI(domain.summary),
    totalCount: domain.totalCount || domain.records.length,
  };
};

// -----------------------------------------------------------------------------
// Deep Clone Utility (for immutability)
// -----------------------------------------------------------------------------

/**
 * Creates a deep clone of an attendance record.
 * Useful for state updates to maintain immutability.
 * @param record - Attendance record to clone.
 * @returns Deep cloned record.
 */
export const cloneAttendanceRecord = (record: AttendanceRecord): AttendanceRecord => {
  return JSON.parse(JSON.stringify(record));
};

/**
 * Creates a deep clone of an array of attendance records.
 * @param records - Array of records to clone.
 * @returns Deep cloned array.
 */
export const cloneAttendanceRecords = (records: AttendanceRecord[]): AttendanceRecord[] => {
  return JSON.parse(JSON.stringify(records));
};

// -----------------------------------------------------------------------------
// Filter Transformation
// -----------------------------------------------------------------------------

/**
 * Converts UI filter state to API-ready filter object.
 * @param uiFilters - UI filter state.
 * @returns API-ready filter object.
 */
export const transformUIFilterToApi = (
  uiFilters: AttendanceFilter
): Record<string, string> => {
  return mapDomainFilterToApi(uiFilters);
};

/**
 * Converts API filter object to UI filter state.
 * @param apiFilters - API filter object.
 * @returns UI filter state.
 */
export const transformApiFilterToUI = (
  apiFilters: Record<string, string>
): AttendanceFilter => {
  const filter: AttendanceFilter = {};
  
  if (apiFilters.start_date) filter.startDate = apiFilters.start_date;
  if (apiFilters.end_date) filter.endDate = apiFilters.end_date;
  if (apiFilters.date) filter.selectedDate = apiFilters.date;
  if (apiFilters.status) filter.status = apiFilters.status as AttendanceStatus;
  if (apiFilters.search) filter.searchTerm = apiFilters.search;
  
  return filter;
};