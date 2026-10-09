import {
  useCallback,
  useEffect,
  useState,
} from "react";

import leaveService from "../services/leave.service";

import type {
  LeaveEmployeeRecord,
} from "../types/leave.types";

interface UseLeaveEmployeesResult {
  employees: LeaveEmployeeRecord[];

  loading: boolean;

  error: string;

  refresh: () => Promise<void>;
}

const useLeaveEmployees =
  (): UseLeaveEmployeesResult => {
    const [
      employees,
      setEmployees,
    ] = useState<LeaveEmployeeRecord[]>(
      [],
    );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    // ========================================================
    // LOAD EMPLOYEE LEAVE RECORDS
    // ========================================================

    const refresh = useCallback(
      async (): Promise<void> => {
        try {
          setLoading(true);
          setError("");

          const data =
            await leaveService.getEmployeeLeaveRecords();

          setEmployees(data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load employees.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
      void refresh();
    }, [refresh]);

    // ========================================================
    // RETURN
    // ========================================================

    return {
      employees,
      loading,
      error,
      refresh,
    };
  };

export default useLeaveEmployees;