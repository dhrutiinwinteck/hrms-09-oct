import { z } from "zod";

/* ============================================================
   SHIFT
============================================================ */

export const ShiftSchema =
  z.object({
    type: z.enum([
      "day",
      "night",
      "off",
      "leave",
      "unknown",
    ]),

    startTime:
      z.string().optional(),

    endTime:
      z.string().optional(),

    label:
      z.string().optional(),

    date:
      z.string().optional(),

    day:
      z.string().optional(),

    patternId:
      z.number().nullable().optional(),

    patternName:
      z.string().nullable().optional(),

    isWeekOff:
      z.boolean().optional(),

    isLeave:
      z.boolean().optional(),
  });

/* ============================================================
   EMPLOYEE
============================================================ */

export const EmployeeSchema =
  z.object({
    id: z.number(),

    employeeCode:
      z.string().nullable().optional(),

    name: z.string(),

    initials: z.string(),

    shifts:
      z.array(
        ShiftSchema,
      ),
  });

/* ============================================================
   WEEK
============================================================ */

export const WeekSchema =
  z.object({
    startDate:
      z.date(),

    endDate:
      z.date(),
  });

/* ============================================================
   STATISTICS
============================================================ */

export const StatisticsSchema =
  z.object({
    totalEmployees:
      z.number(),

    activeThisWeek:
      z.number(),

    totalShifts:
      z.number(),

    scheduled:
      z.number(),

    coverage:
      z.number(),

    totalHours:
      z.number(),
  });

/* ============================================================
   ROSTER DATA
============================================================ */

export const RosterDataSchema =
  z.object({
    week:
      WeekSchema,

    days:
      z.array(
        z.object({
          day: z.string(),
          date: z.string(),
          fullDate: z.string(),
        }),
      ),

    employees:
      z.array(
        EmployeeSchema,
      ),

    statistics:
      StatisticsSchema,
  });