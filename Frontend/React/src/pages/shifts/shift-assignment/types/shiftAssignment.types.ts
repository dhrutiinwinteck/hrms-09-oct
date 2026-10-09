// src/pages/shifts/shift-assignment/types/shiftAssignment.types.ts

/* ============================================================
   EMPLOYEE
============================================================ */

export interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
}

/* ============================================================
   SHIFT PATTERN
============================================================ */

export interface ShiftPattern {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    description?: string;
}

/* ============================================================
   LEAVE
============================================================ */

export interface LeaveRecord {
    id: string;
    date: string;
    dayOfWeek: string;
    leaveType: string;
}

export interface LeaveEntry {
    date: string;
    dayOfWeek: string;
    leaveType: string;
}

/* ============================================================
   WEEK OFF
============================================================ */

export interface WeekOffDays {
    sun: boolean;
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
}

export type WeekDayKey =
    | 'sun'
    | 'mon'
    | 'tue'
    | 'wed'
    | 'thu'
    | 'fri'
    | 'sat';

export const WEEK_DAYS: WeekDayKey[] = [
    'sun',
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
];

export const WEEK_DAY_LABELS: Record<
    WeekDayKey,
    string
> = {
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
};

export const WEEK_DAY_FULL: Record<
    WeekDayKey,
    string
> = {
    sun: 'Sunday',
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
};

/* ============================================================
   GENERATED DATE
============================================================ */

export interface GeneratedShiftDate {
    shiftDate: string;
    dayOfWeek: string;

    patternId: string;

    patternName?: string;

    startTime?: string;

    endTime?: string;

    isWeekOff: boolean;

    isLeave: boolean;
}

/* ============================================================
   FORM DATA
============================================================ */

export interface ShiftAssignmentFormData {
    /**
     * Comma-separated employee IDs.
     *
     * Example:
     * "12"
     *
     * Multiple:
     * "12,15,18"
     */
    employeeId: string;

    startDate: string;

    endDate: string;

    /**
     * Default pattern.
     *
     * Generated dates can override this
     * date-by-date.
     */
    shiftPatternId: string;

    leaves: LeaveRecord[];

    weekOffDays: WeekOffDays;

    /**
     * Complete date-wise configuration
     * sent to the backend.
     */
    generatedPatterns: GeneratedShiftDate[];
}

/* ============================================================
   VALIDATION ERRORS
============================================================ */

export interface ShiftAssignmentValidationErrors {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    shiftPatternId?: string;
    leaves?: string;
    generatedPatterns?: string;
}

/* ============================================================
   PERSISTED ASSIGNMENT
============================================================ */

export interface ShiftAssignment {
    id: string | number;

    employeeId: string;

    employeeName?: string;

    startDate: string;

    endDate: string;

    shiftPatternId?: string;

    shiftPatternName?: string;

    leaveEntries: LeaveEntry[];

    weekOffDays: string[];

    generatedDates: GeneratedShiftDate[];

    createdAt: string;
}

/* ============================================================
   API GENERATED DATE RESPONSE
============================================================ */

export interface ShiftAssignmentDateApiResponse {
    date: string;

    day_of_week: string;

    is_week_off: boolean;

    is_leave: boolean;

    pattern_id?: number | null;

    pattern_name?: string | null;

    start_time?: string | null;

    end_time?: string | null;
}

/* ============================================================
   API SHIFT ASSIGNMENT RESPONSE
============================================================ */

export interface ShiftAssignmentApiResponse {
    id: number;

    employee_id: number;

    employee_name: string;

    employee_code?: string | null;

    start_date: string;

    end_date: string;

    week_off_days: string[];

    leave_days: LeaveEntry[];

    generated_dates: ShiftAssignmentDateApiResponse[];
}