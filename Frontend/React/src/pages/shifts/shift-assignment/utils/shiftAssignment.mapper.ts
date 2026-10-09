// src/pages/shifts/shift-assignment/utils/shiftAssignment.utils.ts

import {
    WeekDayKey,
    WEEK_DAY_FULL,
    LeaveRecord,
    WeekOffDays,
} from '../types/shiftAssignment.types';

/* ============================================================
   DATE FORMATTING
============================================================ */

export const formatDate = (
    date: Date,
): string => {

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            '0',
        );

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(
            2,
            '0',
        );

    const year =
        date.getFullYear();

    return `${day}-${month}-${year}`;
};

/* ============================================================
   DATE INPUT FORMAT
============================================================ */

export const formatDateForInput = (
    date: Date,
): string => {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(
            2,
            '0',
        );

    const day =
        String(
            date.getDate(),
        ).padStart(
            2,
            '0',
        );

    return `${year}-${month}-${day}`;
};

/* ============================================================
   DISPLAY DATE
============================================================ */

export const formatDateForDisplay = (
    dateStr: string,
): string => {

    const date =
        parseDate(
            dateStr,
        );

    if (!date) {
        return dateStr;
    }

    return formatDate(
        date,
    );
};

/* ============================================================
   PARSE DATE
============================================================ */

export const parseDate = (
    dateStr: string,
): Date | null => {

    if (
        !dateStr ||
        dateStr.trim() === ''
    ) {
        return null;
    }

    const parts =
        dateStr.split('-');

    /* --------------------------------------------------------
       dd-mm-yyyy
    -------------------------------------------------------- */

    if (
        parts.length === 3
    ) {

        const day =
            parseInt(
                parts[0],
                10,
            );

        const month =
            parseInt(
                parts[1],
                10,
            ) - 1;

        const year =
            parseInt(
                parts[2],
                10,
            );

        if (
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year)
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day,
                );

            if (
                date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day
            ) {
                return date;
            }
        }
    }

    /* --------------------------------------------------------
       yyyy-mm-dd
    -------------------------------------------------------- */

    if (
        parts.length === 3
    ) {

        const year =
            parseInt(
                parts[0],
                10,
            );

        const month =
            parseInt(
                parts[1],
                10,
            ) - 1;

        const day =
            parseInt(
                parts[2],
                10,
            );

        if (
            !isNaN(year) &&
            !isNaN(month) &&
            !isNaN(day)
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day,
                );

            if (
                date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day
            ) {
                return date;
            }
        }
    }

    return null;
};

/* ============================================================
   DAY OF WEEK
============================================================ */

export const getDayOfWeek = (
    dateStr: string,
): string => {

    const date =
        parseDate(
            dateStr,
        );

    if (!date) {
        return '';
    }

    const dayIndex =
        date.getDay();

    const keys: WeekDayKey[] = [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
    ];

    return (
        WEEK_DAY_FULL[
            keys[dayIndex]
        ] || ''
    );
};

/* ============================================================
   SHORT DAY
============================================================ */

export const getDayOfWeekShort = (
    dateStr: string,
): string => {

    const date =
        parseDate(
            dateStr,
        );

    if (!date) {
        return '';
    }

    const dayIndex =
        date.getDay();

    const keys: WeekDayKey[] = [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
    ];

    const labels: Record<
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

    return labels[
        keys[dayIndex]
    ];
};

/* ============================================================
   VALID DATE
============================================================ */

export const isValidDate = (
    dateStr: string,
): boolean => {

    return (
        parseDate(
            dateStr,
        ) !== null
    );
};

/* ============================================================
   DATE RANGE
============================================================ */

export const isDateInRange = (
    dateStr: string,
    startDateStr: string,
    endDateStr: string,
): boolean => {

    const date =
        parseDate(
            dateStr,
        );

    const start =
        parseDate(
            startDateStr,
        );

    const end =
        parseDate(
            endDateStr,
        );

    if (
        !date ||
        !start ||
        !end
    ) {
        return false;
    }

    return (
        date >= start &&
        date <= end
    );
};

/* ============================================================
   DATE COMPARISON
============================================================ */

export const isDateAfter = (
    dateStr: string,
    compareDateStr: string,
): boolean => {

    const date =
        parseDate(
            dateStr,
        );

    const compare =
        parseDate(
            compareDateStr,
        );

    if (
        !date ||
        !compare
    ) {
        return false;
    }

    return date > compare;
};

export const isDateSameOrAfter = (
    dateStr: string,
    compareDateStr: string,
): boolean => {

    const date =
        parseDate(
            dateStr,
        );

    const compare =
        parseDate(
            compareDateStr,
        );

    if (
        !date ||
        !compare
    ) {
        return false;
    }

    return date >= compare;
};

/* ============================================================
   LEAVE DUPLICATE
============================================================ */

export const isDuplicateLeave = (
    leaves: LeaveRecord[],
    dateStr: string,
): boolean => {

    return leaves.some(
        leave =>
            leave.date === dateStr,
    );
};

/* ============================================================
   ID
============================================================ */

export const generateId = (): string => {

    return `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}`;
};

/* ============================================================
   WEEK OFF ARRAY
============================================================ */

export const getWeekOffDaysArray = (
    weekOffDays: WeekOffDays,
): WeekDayKey[] => {

    return (
        Object.keys(
            weekOffDays,
        ).filter(
            key =>
                weekOffDays[
                    key as WeekDayKey
                ],
        ) as WeekDayKey[]
    );
};

/* ============================================================
   GENERATE DATE RANGE
============================================================ */

export const generateDateRange = (
    startDateStr: string,
    endDateStr: string,
): string[] => {

    const start =
        parseDate(
            startDateStr,
        );

    const end =
        parseDate(
            endDateStr,
        );

    if (
        !start ||
        !end ||
        end < start
    ) {
        return [];
    }

    const dates: string[] = [];

    const current =
        new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
        );

    const last =
        new Date(
            end.getFullYear(),
            end.getMonth(),
            end.getDate(),
        );

    while (
        current <= last
    ) {

        dates.push(
            formatDateForInput(
                current,
            ),
        );

        current.setDate(
            current.getDate() + 1,
        );
    }

    return dates;
};