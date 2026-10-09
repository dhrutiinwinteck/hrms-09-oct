// src/pages/attendance/attendance-history/types/attendanceHistory.types.ts

export type AttendanceStatus = 'P' | 'AB' | 'WO' | 'LOP' | 'PL' | 'CO' | 'CL' | 'HD-PL' | 'HD-CL' | 'HD-CO' | 'PH' | 'HD-LOP' | 'LWP';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  lateMinutes?: number;
}

export interface EmployeeAttendance {
  id: string;
  name: string;
  designation: string;
  department: string;
  avatar?: string;
  dailyRecords: AttendanceRecord[];
  lateCount: number;
  monthlySummary: MonthlySummary;
}

export interface MonthlySummary {
  present: number;
  weekOff: number;
  paidLeave: number;
  casualLeave: number;
  compensatoryLeave: number;
  halfDayPL: number;
  halfDayCL: number;
  halfDayCO: number;
  publicHoliday: number;
  lop: number;
  halfDayLOP: number;
  lwp: number;
  paidDays: number;
  lopAbsent: number;
}

export interface AttendanceStatistics {
  totalEmployees: number;
  present: number;
  absent: number;
  weekOff: number;
  latePunchIn: number;
  lop: number;
  averageAttendance: number;
  averageLateMinutes: number;
  totalWorkingDays: number;
  absenteeismRate: number;
}

export interface AttendanceFilters {
  month: string;
  year: number;
  department?: string;
  searchTerm?: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AttendanceInsights {
  title: string;
  description: string;
  count: number;
  actionLabel: string;
}

export interface AttendanceHistoryData {
  employees: EmployeeAttendance[];
  statistics: AttendanceStatistics;
  filters: AttendanceFilters;
  pagination: PaginationInfo;
  insights: AttendanceInsights;
}

export type MonthOption = {
  label: string;
  value: string;
  year: number;
  month: number;
};