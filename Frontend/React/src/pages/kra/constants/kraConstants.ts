/* =========================================================
   KRA SHARED CONSTANTS
   Enterprise HRMS
   ========================================================= */

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/*
 * =========================================================
 * KRA YEAR OPTIONS
 * =========================================================
 *
 * Single source of truth for:
 *
 * KRA Master
 * KRA Score Filters
 * KRA Score Modal
 * KRA Management Filters
 *
 * Do not calculate these dynamically from the current year.
 */
export const YEARS = [
  2025,
  2026,
  2027,
  2028,
] as const;

export type KRAYear = (typeof YEARS)[number];

/* =========================================================
   STATUS
   ========================================================= */

export const STATUS_OPTIONS = [
  "Active",
  "Inactive",
] as const;

export type KRAStatus =
  (typeof STATUS_OPTIONS)[number];