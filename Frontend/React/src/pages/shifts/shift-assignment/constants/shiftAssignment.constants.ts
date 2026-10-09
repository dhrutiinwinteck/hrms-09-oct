// src/pages/shifts/shift-assignment/constants/shiftAssignment.constants.ts

import { WeekOffDays } from '../types/shiftAssignment.types';

export const DEFAULT_WEEK_OFF_DAYS: WeekOffDays = {
    sun: false,
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
};

export const LEAVE_TYPES = [
    'Comp Off',
    'Sick Leave',
    'Casual Leave',
    'Annual Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Bereavement Leave',
    'Other',
] as const;

export const DATE_FORMAT = 'dd-mm-yyyy';
export const DATE_FORMAT_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;
export const DATE_DISPLAY_FORMAT = 'DD-MM-YYYY';

export const EMPLOYEE_PLACEHOLDER = 'Select Employee';
export const SHIFT_PATTERN_PLACEHOLDER = 'Select Shift Pattern';
export const DATE_PLACEHOLDER = 'dd-mm-yyyy';
export const LEAVE_TYPE_DEFAULT = 'Comp Off';