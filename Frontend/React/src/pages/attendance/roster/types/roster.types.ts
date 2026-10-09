/* ============================================================
   BACKEND API TYPES
============================================================ */

export interface BackendRosterDay {
  date: string;
  day: string;
}

export interface BackendRosterShift {
  date: string;
  day: string;

  pattern_id: number | null;
  pattern_name: string | null;

  start_time: string | null;
  end_time: string | null;

  shift: string | null;

  is_week_off: boolean;
  is_leave: boolean;
}

export interface BackendRosterEmployee {
  employee_id: number;
  employee_code: string | null;
  employee_name: string;

  shifts: BackendRosterShift[];
}

export interface BackendWeeklyRosterResponse {
  week_start: string;
  week_end: string;

  days: BackendRosterDay[];

  employees: BackendRosterEmployee[];
}

/* ============================================================
   FRONTEND ROSTER TYPES
============================================================ */

export type ShiftType =
  | "day"
  | "night"
  | "off"
  | "leave"
  | "unknown";

export interface RosterShift {
  type: ShiftType;

  startTime?: string;
  endTime?: string;

  label?: string;

  date?: string;
  day?: string;

  patternId?: number | null;
  patternName?: string | null;

  isWeekOff?: boolean;
  isLeave?: boolean;
}

export interface RosterEmployee {
  id: number;

  employeeCode?: string | null;

  initials: string;

  name: string;

  shifts: RosterShift[];
}

export interface RosterDay {
  day: string;

  date: string;

  fullDate: string;
}

export interface Week {
  startDate: Date;

  endDate: Date;
}

export interface Statistics {
  totalEmployees: number;

  activeThisWeek: number;

  totalShifts: number;

  scheduled: number;

  coverage: number;

  totalHours: number;
}

export interface RosterData {
  week: Week;

  days: RosterDay[];

  employees: RosterEmployee[];

  statistics: Statistics;
}

/* ============================================================
   SUMMARY CARD TYPES
============================================================ */

export type RosterSummaryCardType =
  | "employees"
  | "shifts"
  | "coverage"
  | "hours";

export interface RosterSummaryItem {
  id: string | number;

  type: RosterSummaryCardType;

  title: string;

  value: string | number;

  description: string;

  progress?: number;
}

/* ============================================================
   EXPORT TYPES
============================================================ */

export interface ExportPayload {
  weekLabel: string;

  data: Array<{
    employee: string;

    monday: string;

    tuesday: string;

    wednesday: string;

    thursday: string;

    friday: string;

    saturday: string;

    sunday: string;
  }>;
}