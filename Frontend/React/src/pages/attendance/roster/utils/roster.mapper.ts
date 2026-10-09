import {
  BackendRosterEmployee,
  BackendRosterShift,
  BackendWeeklyRosterResponse,
  RosterData,
  RosterDay,
  RosterEmployee,
  RosterShift,
  ShiftType,
} from "../types/roster.types";

import {
  calculateStatistics,
  generateInitials,
  normalizeTime,
} from "./roster.utils";

/* ============================================================
   DATE PARSER
============================================================ */

const parseApiDate = (
  value: string,
): Date => {
  const datePart =
    value.substring(
      0,
      10,
    );

  const [
    year,
    month,
    day,
  ] = datePart
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
};

/* ============================================================
   SHORT DATE
============================================================ */

const formatShortDate = (
  value: Date,
): string => {
  const day =
    String(
      value.getDate(),
    ).padStart(2, "0");

  const month =
    value.toLocaleDateString(
      "en-US",
      {
        month: "short",
      },
    );

  const year =
    String(
      value.getFullYear(),
    ).slice(-2);

  return `${day}-${month}-${year}`;
};

/* ============================================================
   SHIFT TYPE
============================================================ */

const resolveShiftType = (
  shift: BackendRosterShift,
): ShiftType => {
  if (shift.is_leave) {
    return "leave";
  }

  if (shift.is_week_off) {
    return "off";
  }

  if (
    shift.start_time &&
    shift.end_time
  ) {
    /*
     * The backend does not return a separate
     * day/night enum.
     *
     * Determine the visual type from the
     * start time so the existing design
     * can continue to display Sun/Moon.
     */

    const normalized =
      normalizeTime(
        shift.start_time,
      );

    const hour =
      Number(
        normalized
          .split(":")[0],
      );

    if (
      !Number.isNaN(hour) &&
      (hour >= 18 ||
        hour < 6)
    ) {
      return "night";
    }

    return "day";
  }

  return "unknown";
};

/* ============================================================
   SHIFT MAPPER
============================================================ */

const mapShift = (
  shift: BackendRosterShift,
): RosterShift => {
  const type =
    resolveShiftType(
      shift,
    );

  let label =
    shift.shift ??
    "";

  if (shift.is_week_off) {
    label = "WO";
  } else if (shift.is_leave) {
    label = "Leave";
  } else if (!label) {
    const start =
      normalizeTime(
        shift.start_time,
      );

    const end =
      normalizeTime(
        shift.end_time,
      );

    if (start && end) {
      label = `${start} - ${end}`;
    }
  }

  return {
    type,

    startTime:
      normalizeTime(
        shift.start_time,
      ) || undefined,

    endTime:
      normalizeTime(
        shift.end_time,
      ) || undefined,

    label,

    date: shift.date,

    day: shift.day,

    patternId:
      shift.pattern_id,

    patternName:
      shift.pattern_name,

    isWeekOff:
      shift.is_week_off,

    isLeave:
      shift.is_leave,
  };
};

/* ============================================================
   EMPLOYEE MAPPER
============================================================ */

const mapEmployee = (
  employee: BackendRosterEmployee,
): RosterEmployee => {
  return {
    id: employee.employee_id,

    employeeCode:
      employee.employee_code,

    name:
      employee.employee_name,

    initials:
      generateInitials(
        employee.employee_name,
      ),

    shifts:
      employee.shifts.map(
        mapShift,
      ),
  };
};

/* ============================================================
   DAY MAPPER
============================================================ */

const mapDay = (
  day: {
    date: string;
    day: string;
  },
): RosterDay => {
  return {
    day: day.day,

    date: formatShortDate(
      parseApiDate(
        day.date,
      ),
    ),

    fullDate:
      day.date,
  };
};

/* ============================================================
   API → UI
============================================================ */

export const mapRosterResponse = (
  raw: BackendWeeklyRosterResponse,
): RosterData => {
  const employees =
    raw.employees.map(
      mapEmployee,
    );

  const days =
    raw.days.map(
      mapDay,
    );

  const startDate =
    parseApiDate(
      raw.week_start,
    );

  const endDate =
    parseApiDate(
      raw.week_end,
    );

  const statistics =
    calculateStatistics(
      employees,
    );

  return {
    week: {
      startDate,
      endDate,
    },

    days,

    employees,

    statistics,
  };
};