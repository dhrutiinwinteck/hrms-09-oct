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

interface UseLeaveManagementResult {
  leaveLogs: LeaveLog[];

  employeeLeaveRecords: LeaveEmployeeRecord[];

  loading: boolean;

  error: string;

  refresh: () => Promise<void>;

  createLeave: (
    request: Parameters<
      typeof leaveService.createLeave
    >[0],
  ) => Promise<LeaveLog>;

  updateLeave: (
    id: number,
    request: Parameters<
      typeof leaveService.updateLeave
    >[1],
  ) => Promise<LeaveLog>;

  approveLeave: (
    request: Parameters<
      typeof leaveService.approveLeave
    >[0],
  ) => Promise<LeaveLog>;

  rejectLeave: (
    request: Parameters<
      typeof leaveService.rejectLeave
    >[0],
  ) => Promise<LeaveLog>;
}

export const useLeaveManagement =
  (): UseLeaveManagementResult => {
    const [
      leaveLogs,
      setLeaveLogs,
    ] = useState<LeaveLog[]>([]);

    const [
      employeeLeaveRecords,
      setEmployeeLeaveRecords,
    ] = useState<LeaveEmployeeRecord[]>(
      [],
    );

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    // ========================================================
    // LOAD LEAVE DATA
    // ========================================================

    const refresh = useCallback(
      async (): Promise<void> => {
        try {
          setLoading(true);
          setError("");

          const [
            logs,
            records,
          ] = await Promise.all([
            leaveService.getLeaveLogs(),
            leaveService.getEmployeeLeaveRecords(),
          ]);

          setLeaveLogs(logs);

          setEmployeeLeaveRecords(
            records,
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load leave data.",
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
    // CREATE LEAVE
    // ========================================================

    const createLeave = useCallback(
      async (
        request: Parameters<
          typeof leaveService.createLeave
        >[0],
      ): Promise<LeaveLog> => {
        const created =
          await leaveService.createLeave(
            request,
          );

        await refresh();

        return created;
      },
      [refresh],
    );

    // ========================================================
    // UPDATE LEAVE
    // ========================================================

    const updateLeave = useCallback(
      async (
        id: number,
        request: Parameters<
          typeof leaveService.updateLeave
        >[1],
      ): Promise<LeaveLog> => {
        const updated =
          await leaveService.updateLeave(
            id,
            request,
          );

        await refresh();

        return updated;
      },
      [refresh],
    );

    // ========================================================
    // APPROVE LEAVE
    // ========================================================

    const approveLeave = useCallback(
      async (
        request: Parameters<
          typeof leaveService.approveLeave
        >[0],
      ): Promise<LeaveLog> => {
        const approved =
          await leaveService.approveLeave(
            request,
          );

        await refresh();

        return approved;
      },
      [refresh],
    );

    // ========================================================
    // REJECT LEAVE
    // ========================================================

    const rejectLeave = useCallback(
      async (
        request: Parameters<
          typeof leaveService.rejectLeave
        >[0],
      ): Promise<LeaveLog> => {
        const rejected =
          await leaveService.rejectLeave(
            request,
          );

        await refresh();

        return rejected;
      },
      [refresh],
    );

    // ========================================================
    // RETURN
    // ========================================================

    return {
      leaveLogs,
      employeeLeaveRecords,
      loading,
      error,
      refresh,
      createLeave,
      updateLeave,
      approveLeave,
      rejectLeave,
    };
  };

export default useLeaveManagement;