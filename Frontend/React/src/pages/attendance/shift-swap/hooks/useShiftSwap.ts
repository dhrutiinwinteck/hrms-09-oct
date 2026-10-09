import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  acceptShiftSwapRequest,
  approveShiftSwapRequest,
  createShiftSwapRequest,
  getShiftSwapEmployees,
  getShiftSwapRequests,
  managerRejectShiftSwapRequest,
  rejectShiftSwapRequest,
} from '../services/shiftSwap.service';

import type {
  CreateShiftSwapRequest,
  Employee,
  ShiftSwapRequest,
  ShiftSwapStatus,
} from '../types/shiftSwap.types';

interface ShiftSwapSummary {
  Pending: number;
  Approved: number;
  Rejected: number;
  'On Hold': number;
}

interface UseShiftSwapReturn {
  requests: ShiftSwapRequest[];

  employees: Employee[];

  summary: ShiftSwapSummary;

  loading: boolean;

  submitting: boolean;

  error: string | null;

  employeeLoading: boolean;

  refresh: () => Promise<void>;

  loadEligibleEmployees: (
    swapDate: string,
  ) => Promise<void>;

  createRequest: (
    payload: CreateShiftSwapRequest,
  ) => Promise<void>;

  acceptRequest: (
    requestId: string,
  ) => Promise<void>;

  rejectRequest: (
    requestId: string,
  ) => Promise<void>;

  approveRequest: (
    requestId: string,
  ) => Promise<void>;

  managerRejectRequest: (
    requestId: string,
  ) => Promise<void>;
}

const INITIAL_SUMMARY: ShiftSwapSummary = {
  Pending: 0,

  Approved: 0,

  Rejected: 0,

  'On Hold': 0,
};

const isPendingStatus = (
  status: ShiftSwapStatus,
): boolean => {
  return (
    status ===
      'PendingTargetAcceptance' ||
    status ===
      'PendingManagerApproval'
  );
};

export const useShiftSwap =
  (): UseShiftSwapReturn => {
    const [requests, setRequests] =
      useState<ShiftSwapRequest[]>([]);

    const [employees, setEmployees] =
      useState<Employee[]>([]);

    const [loading, setLoading] =
      useState<boolean>(true);

    const [employeeLoading, setEmployeeLoading] =
      useState<boolean>(false);

    const [submitting, setSubmitting] =
      useState<boolean>(false);

    const [error, setError] =
      useState<string | null>(null);

    /* ========================================================
       LOAD REQUESTS
    ======================================================== */

    const loadRequests =
      useCallback(async () => {
        try {
          setLoading(true);

          setError(null);

          const data =
            await getShiftSwapRequests();

          setRequests(data);
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load shift swap requests.';

          setError(message);
        } finally {
          setLoading(false);
        }
      }, []);

    /* ========================================================
       INITIAL LOAD
    ======================================================== */

    useEffect(() => {
      void loadRequests();
    }, [loadRequests]);

    /* ========================================================
       LOAD ELIGIBLE EMPLOYEES
    ======================================================== */

    const loadEligibleEmployees =
      useCallback(
        async (swapDate: string) => {
          if (!swapDate) {
            setEmployees([]);

            return;
          }

          try {
            setEmployeeLoading(true);

            setError(null);

            const data =
              await getShiftSwapEmployees(
                swapDate,
              );

            setEmployees(data);
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to load eligible employees.';

            setEmployees([]);

            setError(message);

            throw err;
          } finally {
            setEmployeeLoading(false);
          }
        },
        [],
      );

    /* ========================================================
       REFRESH
    ======================================================== */

    const refresh =
      useCallback(async () => {
        await loadRequests();
      }, [loadRequests]);

    /* ========================================================
       SUMMARY
    ======================================================== */

    const summary =
      useMemo<ShiftSwapSummary>(() => {
        return requests.reduce(
          (result, request) => {
            if (
              isPendingStatus(
                request.status,
              )
            ) {
              result.Pending += 1;
            } else if (
              request.status ===
              'Approved'
            ) {
              result.Approved += 1;
            } else if (
              request.status ===
              'Rejected'
            ) {
              result.Rejected += 1;
            }

            return result;
          },
          {
            ...INITIAL_SUMMARY,
          },
        );
      }, [requests]);

    /* ========================================================
       CREATE
    ======================================================== */

    const createRequest =
      useCallback(
        async (
          payload: CreateShiftSwapRequest,
        ) => {
          try {
            setSubmitting(true);

            setError(null);

            await createShiftSwapRequest(
              payload,
            );

            await loadRequests();
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to create shift swap request.';

            setError(message);

            throw err;
          } finally {
            setSubmitting(false);
          }
        },
        [loadRequests],
      );

    /* ========================================================
       ACCEPT
    ======================================================== */

    const acceptRequest =
      useCallback(
        async (
          requestId: string,
        ) => {
          try {
            setSubmitting(true);

            setError(null);

            await acceptShiftSwapRequest(
              requestId,
            );

            await loadRequests();
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to accept shift swap request.';

            setError(message);

            throw err;
          } finally {
            setSubmitting(false);
          }
        },
        [loadRequests],
      );

    /* ========================================================
       TARGET REJECT
    ======================================================== */

    const rejectRequest =
      useCallback(
        async (
          requestId: string,
        ) => {
          try {
            setSubmitting(true);

            setError(null);

            await rejectShiftSwapRequest(
              requestId,
            );

            await loadRequests();
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to reject shift swap request.';

            setError(message);

            throw err;
          } finally {
            setSubmitting(false);
          }
        },
        [loadRequests],
      );

    /* ========================================================
       MANAGER APPROVE
    ======================================================== */

    const approveRequest =
      useCallback(
        async (
          requestId: string,
        ) => {
          try {
            setSubmitting(true);

            setError(null);

            await approveShiftSwapRequest(
              requestId,
            );

            await loadRequests();
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to approve shift swap request.';

            setError(message);

            throw err;
          } finally {
            setSubmitting(false);
          }
        },
        [loadRequests],
      );

    /* ========================================================
       MANAGER REJECT
    ======================================================== */

    const managerRejectRequest =
      useCallback(
        async (
          requestId: string,
        ) => {
          try {
            setSubmitting(true);

            setError(null);

            await managerRejectShiftSwapRequest(
              requestId,
            );

            await loadRequests();
          } catch (err) {
            const message =
              err instanceof Error
                ? err.message
                : 'Unable to reject shift swap request.';

            setError(message);

            throw err;
          } finally {
            setSubmitting(false);
          }
        },
        [loadRequests],
      );

    return {
      requests,

      employees,

      summary,

      loading,

      submitting,

      error,

      employeeLoading,

      refresh,

      loadEligibleEmployees,

      createRequest,

      acceptRequest,

      rejectRequest,

      approveRequest,

      managerRejectRequest,
    };
  };