import {
  RosterEmployee,
  RosterShift,
  Statistics,
  Week,
} from "../types/roster.types";

/* ============================================================
   INITIALS
============================================================ */

export const generateInitials = (
  name: string,
): string => {
  const normalizedName =
    name.trim();

  if (!normalizedName) {
    return "?";
  }

  const parts =
    normalizedName.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[
      parts.length - 1
    ].charAt(0)
  ).toUpperCase();
};

/* ============================================================
   NORMALIZE TIME
============================================================ */

export const normalizeTime = (
  value:
    | string
    | null
    | undefined,
): string => {
  if (!value) {
    return "";
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return "";
  }

  const match =
    normalized.match(
      /^(\d{2}):(\d{2})/,
    );

  if (!match) {
    return normalized;
  }

  return `${match[1]}:${match[2]}`;
};

/* ============================================================
   API DATE FORMAT
============================================================ */

export const formatApiDate = (
  value: Date,
): string => {
  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      value.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* ============================================================
   START OF WEEK - MONDAY
============================================================ */

export const startOfWeekMonday = (
  value: Date,
): Date => {
  const result =
    new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
    );

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference,
  );

  return result;
};

/* ============================================================
   ADD DAYS
============================================================ */

export const addDays = (
  value: Date,
  amount: number,
): Date => {
  const result =
    new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
    );

  result.setDate(
    result.getDate() +
      amount,
  );

  return result;
};

/* ============================================================
   ADD WEEKS
============================================================ */

export const addWeeks = (
  value: Date,
  amount: number,
): Date => {
  return addDays(
    value,
    amount * 7,
  );
};

/* ============================================================
   SHIFT DURATION
============================================================ */

export const calculateShiftMinutes = (
  shift: RosterShift,
): number => {
  if (
    shift.isWeekOff ||
    shift.isLeave ||
    !shift.startTime ||
    !shift.endTime
  ) {
    return 0;
  }

  const start =
    normalizeTime(
      shift.startTime,
    );

  const end =
    normalizeTime(
      shift.endTime,
    );

  if (!start || !end) {
    return 0;
  }

  const [
    startHour,
    startMinute,
  ] = start
    .split(":")
    .map(Number);

  const [
    endHour,
    endMinute,
  ] = end
    .split(":")
    .map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return 0;
  }

  const startTotal =
    startHour * 60 +
    startMinute;

  let endTotal =
    endHour * 60 +
    endMinute;

  /*
   * Supports overnight shifts.
   *
   * Example:
   * 22:00 -> 06:00
   */

  if (
    endTotal <=
    startTotal
  ) {
    endTotal +=
      24 * 60;
  }

  return (
    endTotal -
    startTotal
  );
};

/* ============================================================
   STATISTICS
============================================================ */

export const calculateStatistics = (
  employees: RosterEmployee[],
): Statistics => {
  let totalShiftDays = 0;

  let scheduled = 0;

  let totalMinutes = 0;

  employees.forEach(
    (employee) => {
      employee.shifts.forEach(
        (shift) => {
          totalShiftDays++;

          if (
            !shift.isWeekOff &&
            !shift.isLeave &&
            shift.startTime &&
            shift.endTime
          ) {
            scheduled++;

            totalMinutes +=
              calculateShiftMinutes(
                shift,
              );
          }
        },
      );
    },
  );

  const activeThisWeek =
    employees.filter(
      (employee) =>
        employee.shifts.some(
          (shift) =>
            !shift.isWeekOff &&
            !shift.isLeave &&
            Boolean(
              shift.startTime &&
              shift.endTime,
            ),
        ),
    ).length;

  const coverage =
    totalShiftDays > 0
      ? (scheduled /
          totalShiftDays) *
        100
      : 0;

  return {
    totalEmployees:
      employees.length,

    activeThisWeek,

    totalShifts:
      totalShiftDays,

    scheduled,

    coverage:
      Math.round(
        coverage * 10,
      ) / 10,

    totalHours:
      totalMinutes,
  };
};

/* ============================================================
   FORMAT HOURS
============================================================ */

export const formatHours = (
  minutes: number,
): string => {
  const safeMinutes =
    Math.max(
      0,
      Math.round(minutes),
    );

  const hours =
    Math.floor(
      safeMinutes / 60,
    );

  const remaining =
    safeMinutes % 60;

  if (
    remaining === 0
  ) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
};

/* ============================================================
   FORMAT WEEK
============================================================ */

export const formatWeek = (
  week: Week,
): string => {
  const start =
    week.startDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  const end =
    week.endDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  return `${start} - ${end}`;
};

/* ============================================================
   SHIFT DISPLAY
============================================================ */

export const getShiftDisplayLabel = (
  shift: RosterShift,
): string => {
  if (shift.isWeekOff) {
    return "WO";
  }

  if (shift.isLeave) {
    return "Leave";
  }

  if (
    shift.startTime &&
    shift.endTime
  ) {
    return `${shift.startTime} - ${shift.endTime}`;
  }

  if (shift.label) {
    return shift.label;
  }

  return "—";
};

/* ============================================================
   WEEKEND
============================================================ */

export const isWeekend = (
  day: string,
): boolean => {
  const normalized =
    day.toLowerCase();

  return (
    normalized ===
      "saturday" ||
    normalized ===
      "sunday"
  );
};

/* ============================================================
   GROUP SHIFTS
============================================================ */

export const groupShifts = (
  employees: RosterEmployee[],
): RosterEmployee[] => {
  return employees;
};