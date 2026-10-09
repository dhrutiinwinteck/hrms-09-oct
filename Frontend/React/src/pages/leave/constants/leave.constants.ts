import type {
  LeaveStatus,
  LeaveType,
} from "../types/leave.types";

/**
 * ============================================================
 * LEAVE API ENDPOINTS
 * ============================================================
 *
 * Base URL is already configured in:
 *
 * src/services/axios/axiosInstance.ts
 *
 * through:
 *
 * VITE_API_BASE_URL=http://192.168.48.1:8001
 *
 * Therefore, only API paths are kept here.
 */
export const LEAVE_ENDPOINTS = {
  /**
   * Leave Logs
   */
  logs: "/api/v1/leaves/leave/all",

  logById: "/api/v1/leaves/leave",

  /**
   * Apply Leave
   */
  apply: "/api/v1/leaves/leave/apply",

  /**
   * Active Employees
   */
  employees:
    "/api/v1/leaves/leave/employees",

  /**
   * Leave Balances
   */
  balances:
    "/api/v1/leaves/leave/balances",

  balanceByEmployee:
    "/api/v1/leaves/leave/balance",

  /**
   * Leave Status Lists
   */
  pending:
    "/api/v1/leaves/leave/pending",

  approved:
    "/api/v1/leaves/leave/approved",

  rejected:
    "/api/v1/leaves/leave/rejected",

  /**
   * Approve / Reject
   */
  approve:
    "/api/v1/leaves/leave/approve",

  reject:
    "/api/v1/leaves/leave/reject",

  /**
   * Single Leave
   */
  leaveById:
    "/api/v1/leaves/leave",

  settings:
    "/api/v1/leaves/leave/settings",
} as const;

/**
 * ============================================================
 * LEAVE STATUS
 * ============================================================
 *
 * Backend:
 *
 * 0 = Pending
 * 1 = Approved
 * 2 = Rejected
 */
export const LEAVE_STATUS_MAP: Record<
  number,
  LeaveStatus
> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
};

export const LEAVE_STATUS_TO_DB: Record<
  LeaveStatus,
  number
> = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
};

/**
 * ============================================================
 * LEAVE TYPES
 * ============================================================
 *
 * These are the leave types supported by the
 * FastAPI backend.
 */
export const LEAVE_TYPE_OPTIONS: LeaveType[] = [
  "Paid Leave",
  "Casual Leave",
  "Comp off",
  "LOP",
];

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 *
 * Used for frontend table pagination.
 * Backend currently does not expose pagination parameters.
 */
export const LEAVE_PAGE_SIZE = 10;

/**
 * ============================================================
 * STATUS HELPERS
 * ============================================================
 */

export const getLeaveStatus = (
  status: number,
): LeaveStatus => {
  return (
    LEAVE_STATUS_MAP[status] ??
    "Pending"
  );
};

export const getLeaveStatusCode = (
  status: LeaveStatus,
): number => {
  return (
    LEAVE_STATUS_TO_DB[status] ??
    0
  );
};

/**
 * ============================================================
 * DATE FORMATTER
 * ============================================================
 */

export const formatLeaveDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
};

/**
 * ============================================================
 * LEAVE DAYS CALCULATOR
 * ============================================================
 */

export const calculateLeaveDays = (
  fromDate: string,
  toDate: string,
  halfDay = false,
): number => {
  if (!fromDate || !toDate) {
    return 0;
  }

  if (halfDay) {
    return 0.5;
  }

  const from = new Date(
    `${fromDate}T00:00:00`,
  );

  const to = new Date(
    `${toDate}T00:00:00`,
  );

  if (
    Number.isNaN(from.getTime()) ||
    Number.isNaN(to.getTime()) ||
    to < from
  ) {
    return 0;
  }

  return (
    Math.floor(
      (to.getTime() -
        from.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1
  );
};