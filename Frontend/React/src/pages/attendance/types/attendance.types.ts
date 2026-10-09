/**
 * ======================================================
 * Attendance Module - Type Definitions
 * ======================================================
 * Enterprise-grade type definitions for the Attendance
 * feature including:
 *
 * - Attendance history
 * - Daily punch state
 * - Punch In / Punch Out
 * - Break In / Break Out
 * - Employee location
 * - Attendance summary
 * - Attendance export
 *
 * @module types/attendance.types
 */

import React from 'react';

// -----------------------------------------------------------------------------
// Core Domain Enums
// -----------------------------------------------------------------------------

export type AttendanceStatus =
  | 'Present'
  | 'Absent'
  | 'Late'
  | 'WeeklyOff'
  | 'Holiday';

export type AttendanceAction =
  | 'PUNCH_IN'
  | 'BREAK_IN'
  | 'BREAK_OUT'
  | 'PUNCH_OUT';

export type AttendanceActionStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'ALREADY_COMPLETED'
  | 'INVALID_STATE';

export type PunchState =
  | 'NOT_PUNCHED_IN'
  | 'WORKING'
  | 'ON_BREAK'
  | 'PUNCHED_OUT';

// -----------------------------------------------------------------------------
// Employee Location
// -----------------------------------------------------------------------------

export interface EmployeeLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string | null;
}

export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string | null;
}

// -----------------------------------------------------------------------------
// Daily Punch State
// -----------------------------------------------------------------------------

/**
 * Represents the current attendance state of the logged-in employee.
 *
 * This is the primary model used by the Dashboard PunchCard.
 */
export interface DailyPunchState {
  id: string | null;

  employeeId: string | number;

  attendanceDate: string;

  punchIn: string | null;
  punchOut: string | null;

  breakIn: string | null;
  breakOut: string | null;

  punchState: PunchState;

  isPunchedIn: boolean;
  isOnBreak: boolean;
  isPunchedOut: boolean;

  workingMinutes: number;
  breakMinutes: number;

  punchInLocation: AttendanceLocation | null;
  punchOutLocation: AttendanceLocation | null;

  lastAction: AttendanceAction | null;
  lastActionAt: string | null;
}

// -----------------------------------------------------------------------------
// Punch Action Request
// -----------------------------------------------------------------------------

/**
 * Request sent to the backend when the employee performs
 * Punch In / Break In / Break Out / Punch Out.
 */
export interface PunchActionRequest {
  action: AttendanceAction;
  // employeeId: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;

  address?: string | null;

  actionTime?: string;
}

// -----------------------------------------------------------------------------
// Punch Action Response
// -----------------------------------------------------------------------------

export interface PunchActionResponse {
  success: boolean;

  message: string;

  action: AttendanceAction;

  actionStatus: AttendanceActionStatus;

  attendance: DailyPunchState;

  timestamp: string;

  location?: AttendanceLocation | null;
}

// -----------------------------------------------------------------------------
// Daily Activity Timeline
// -----------------------------------------------------------------------------

/**
 * Represents one activity shown in the employee's daily attendance timeline.
 *
 * The activity codes come directly from the backend TimesheetLog:
 * PI = Punch In
 * BI = Break In
 * BO = Break Out
 * PO = Punch Out
 */
export type AttendanceTimelineActivityCode =
  | 'PI'
  | 'BI'
  | 'BO'
  | 'PO';

export interface AttendanceTimelineActivity {
  id: string | number;
  activity: AttendanceTimelineActivityCode;
  log: string;
  address?: string | null;
}

// -----------------------------------------------------------------------------
// Attendance Record
// -----------------------------------------------------------------------------

export interface AttendanceRecord {
  id: string;

  date: string;

  shift: string;

  punchIn: string;

  punchOut: string;

  breakIn?: string | null;

  breakOut?: string | null;

  workingHours: number;

  breakTime: number;

  status: AttendanceStatus;

  employeeName?: string;

  employeeId?: string | number;
}

// -----------------------------------------------------------------------------
// Attendance Overview
// -----------------------------------------------------------------------------

export interface AttendanceOverviewItem {
  date: string;

  dayOfWeek: string;

  dayOfMonth: number;

  status: AttendanceStatus;
}

// -----------------------------------------------------------------------------
// Attendance Summary
// -----------------------------------------------------------------------------

export interface AttendanceSummary {
  totalDays: number;

  presentDays: number;

  presentPercentage: number;

  absentDays: number;

  absentPercentage: number;

  lateDays: number;

  latePercentage: number;

  averageWorkingHours: string;
}

// -----------------------------------------------------------------------------
// Attendance Filters
// -----------------------------------------------------------------------------

export interface AttendanceFilter {
  startDate?: string;

  endDate?: string;

  selectedDate?: string;

  status?: AttendanceStatus;

  searchTerm?: string;
}

// -----------------------------------------------------------------------------
// Attendance API Response
// -----------------------------------------------------------------------------

export interface AttendanceApiResponse {
  records: AttendanceRecord[];

  summary: AttendanceSummary;

  overview: AttendanceOverviewItem[];

  totalCount?: number;

  page?: number;

  pageSize?: number;
}

// -----------------------------------------------------------------------------
// Export Response
// -----------------------------------------------------------------------------

export interface AttendanceExportResponse {
  downloadUrl: string;

  fileName: string;
}

// -----------------------------------------------------------------------------
// Statistics Card Props
// -----------------------------------------------------------------------------

export interface StatisticsCardProps {
  title: string;

  value: string | number;

  icon: React.ReactNode;

  iconBgColor: string;

  subtitle?: string;

  trendPercentage?: number;

  trendLabel?: string;
}

// -----------------------------------------------------------------------------
// Status Badge Props
// -----------------------------------------------------------------------------

export interface StatusBadgeProps {
  status: AttendanceStatus;

  size?: 'sm' | 'md' | 'lg';
}

// -----------------------------------------------------------------------------
// Attendance Table Props
// -----------------------------------------------------------------------------

export interface AttendanceTableProps {
  records: AttendanceRecord[];

  loading: boolean;

  onAction?: (
    action: 'view' | 'edit' | 'download',
    recordId: string
  ) => void;
}

// -----------------------------------------------------------------------------
// Attendance Overview Props
// -----------------------------------------------------------------------------

export interface AttendanceOverviewProps {
  data: AttendanceOverviewItem[];

  loading: boolean;
}

// -----------------------------------------------------------------------------
// Attendance Filter Bar Props
// -----------------------------------------------------------------------------

export interface AttendanceFilterBarProps {
  filters: AttendanceFilter;

  onFilterChange: (
    newFilters: Partial<AttendanceFilter>
  ) => void;

  onApply: () => void;

  onReset: () => void;
}

// -----------------------------------------------------------------------------
// Utility Types
// -----------------------------------------------------------------------------

export type ValidAttendanceStatus = AttendanceStatus;

export type StatusLabelMap = Record<
  AttendanceStatus,
  string
>;

export type StatusColorMap = Record<
  AttendanceStatus,
  string
>;

export type StatusIconMap = Record<
  AttendanceStatus,
  React.ReactNode
>;