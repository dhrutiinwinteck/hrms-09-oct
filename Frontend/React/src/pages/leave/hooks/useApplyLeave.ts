import {
  useCallback,
  useEffect,
  useState,
} from "react";

import leaveService from "../services/leave.service";

import type {
  LeaveEmployeeRecord,
  LeaveLog,
} from "../types/leave.types";

import { getUsername } from "@/pages/auth/utils/authStorage";

// ============================================================
// TYPES
// ============================================================

interface UseApplyLeaveResult {
  leaveRecords: LeaveEmployeeRecord[];
  loading: boolean;
  submitting: boolean;
  error: string;
  refresh: () => Promise<void>;

  applyLeave: (
    request: Parameters<typeof leaveService.createLeave>[0],
  ) => Promise<LeaveLog>;
}

// ============================================================
// HOOK
// ============================================================

const useApplyLeave = (): UseApplyLeaveResult => {
  const [leaveRecords, setLeaveRecords] = useState<
    LeaveEmployeeRecord[]
  >([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  // ============================================================
  // GET LOGGED-IN EMPLOYEE CODE
  // ============================================================

  const getLoggedInEmployeeCode = useCallback((): string => {
    const employeeCode =
      localStorage.getItem("employeeCode")?.trim() || "";

    const username = getUsername()?.trim() || "";

    return employeeCode || username;
  }, []);

  // ============================================================
  // LOAD EMPLOYEE LEAVE RECORDS
  // ============================================================

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError("");

      const employeeCode = getLoggedInEmployeeCode();

      if (!employeeCode) {
        throw new Error(
          "Employee code is not available for the logged-in user.",
        );
      }

      const records =
        await leaveService.getEmployeeLeaveRecords(employeeCode);

      setLeaveRecords(records);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load leave records.";

      setError(message);
      setLeaveRecords([]);
    } finally {
      setLoading(false);
    }
  }, [getLoggedInEmployeeCode]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ============================================================
  // APPLY LEAVE
  // ============================================================

  const applyLeave = useCallback(
    async (
      request: Parameters<typeof leaveService.createLeave>[0],
    ): Promise<LeaveLog> => {
      try {
        setSubmitting(true);
        setError("");

        const created =
          await leaveService.createLeave(request);

        // Reload records after successful creation.
        await refresh();

        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to apply leave.";

        setError(message);

        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [refresh],
  );

  // ============================================================
  // RETURN
  // ============================================================

  return {
    leaveRecords,
    loading,
    submitting,
    error,
    refresh,
    applyLeave,
  };
};

export default useApplyLeave;