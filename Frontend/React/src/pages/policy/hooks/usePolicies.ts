import {
  useCallback,
  useState,
} from 'react';

import {
  acceptPolicies,
  createPolicy,
  deletePolicy,
  getActivePolicies,
  getEmployeeAcceptances,
  getPolicies,
} from '../services/policy.service';

import type {
  Policy,
  PolicyAcceptanceResponse,
  PolicyCreateResponse,
  PolicyDeleteResponse,
} from '../types/policy.types';

/* ============================================================
   HOOK RESULT
   ============================================================ */

interface UsePoliciesResult {
  policies: Policy[];

  loading: boolean;

  submitting: boolean;

  error: string | null;

  loadPolicies: () => Promise<void>;

  loadActivePolicies: () => Promise<void>;

  loadEmployeeAcceptances: (
    employeeId: number,
  ) => Promise<void>;

  accept: (
    employeeId: number,
    policyIds: number[],
  ) => Promise<PolicyAcceptanceResponse>;

  create: (
    policyName: string,
    description: string,
    file: File,
  ) => Promise<PolicyCreateResponse>;

  remove: (
    policyId: number,
  ) => Promise<PolicyDeleteResponse>;
}

/* ============================================================
   ERROR MESSAGE
   ============================================================ */

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError =
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

    return (
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.message ??
      'An API error occurred.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/* ============================================================
   HOOK
   ============================================================ */

export const usePolicies =
  (): UsePoliciesResult => {
    const [
      policies,
      setPolicies,
    ] = useState<Policy[]>([]);

    const [
      loading,
      setLoading,
    ] = useState<boolean>(false);

    const [
      submitting,
      setSubmitting,
    ] = useState<boolean>(false);

    const [
      error,
      setError,
    ] = useState<string | null>(null);

    /* ========================================================
       GET ALL POLICIES
       ======================================================== */

    const loadPolicies =
      useCallback(
        async (): Promise<void> => {
          try {
            setLoading(true);
            setError(null);

            const result =
              await getPolicies();

            setPolicies(
              result.data ?? [],
            );
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            console.error(
              'Failed to load policies:',
              error,
            );
          } finally {
            setLoading(false);
          }
        },
        [],
      );

    /* ========================================================
       GET ACTIVE POLICIES
       ======================================================== */

    const loadActivePolicies =
      useCallback(
        async (): Promise<void> => {
          try {
            setLoading(true);
            setError(null);

            const result =
              await getActivePolicies();

            setPolicies(
              result.data ?? [],
            );
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            console.error(
              'Failed to load active policies:',
              error,
            );
          } finally {
            setLoading(false);
          }
        },
        [],
      );

    /* ========================================================
       GET EMPLOYEE ACCEPTANCES
       ======================================================== */

    const loadEmployeeAcceptances =
      useCallback(
        async (
          employeeId: number,
        ): Promise<void> => {
          try {
            if (
              !Number.isInteger(employeeId) ||
              employeeId <= 0
            ) {
              throw new Error(
                'Invalid employee ID.',
              );
            }

            setError(null);

            const result =
              await getEmployeeAcceptances(
                employeeId,
              );

            /*
             * Create a lookup set containing:
             *
             * policyId + version
             *
             * Example:
             *
             * "1:1"
             * "2:1"
             * "3:2"
             */
            const acceptedPolicies =
              new Set<string>(
                (result.data ?? [])
                  .filter(
                    acceptance =>
                      acceptance.accepted ===
                      true,
                  )
                  .map(
                    acceptance =>
                      `${acceptance.policyId}:${acceptance.version}`,
                  ),
              );

            /*
             * Merge employee acceptance state
             * into active policies.
             */
            setPolicies(
              previousPolicies =>
                previousPolicies.map(
                  policy => ({
                    ...policy,

                    isAccepted:
                      acceptedPolicies.has(
                        `${policy.id}:${policy.version}`,
                      ),
                  }),
                ),
            );
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            console.error(
              'Failed to load employee policy acceptances:',
              error,
            );
          }
        },
        [],
      );

    /* ========================================================
       ACCEPT POLICIES
       ======================================================== */

    const accept =
      useCallback(
        async (
          employeeId: number,
          policyIds: number[],
        ): Promise<PolicyAcceptanceResponse> => {
          try {
            setSubmitting(true);
            setError(null);

            const result =
              await acceptPolicies(
                employeeId,
                {
                  policy_ids:
                    policyIds,
                },
              );

            /*
             * Immediately update the local UI.
             *
             * No page refresh is required.
             */
            setPolicies(
              previousPolicies =>
                previousPolicies.map(
                  policy =>
                    policyIds.includes(
                      policy.id,
                    )
                      ? {
                          ...policy,
                          isAccepted: true,
                        }
                      : policy,
                ),
            );

            return result;
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            throw error;
          } finally {
            setSubmitting(false);
          }
        },
        [],
      );

    /* ========================================================
       CREATE POLICY
       ======================================================== */

    const create =
      useCallback(
        async (
          policyName: string,
          description: string,
          file: File,
        ): Promise<PolicyCreateResponse> => {
          try {
            setSubmitting(true);
            setError(null);

            const result =
              await createPolicy(
                policyName,
                description,
                file,
              );

            /*
             * Reload policies after successful
             * creation so admin table gets the
             * newly created record.
             */
            await loadPolicies();

            return result;
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            throw error;
          } finally {
            setSubmitting(false);
          }
        },
        [
          loadPolicies,
        ],
      );

    /* ========================================================
       DELETE POLICY
       ======================================================== */

    const remove =
      useCallback(
        async (
          policyId: number,
        ): Promise<PolicyDeleteResponse> => {
          try {
            setSubmitting(true);
            setError(null);

            const result =
              await deletePolicy(
                policyId,
              );

            /*
             * Remove successfully deleted policy
             * from the current UI state.
             */
            setPolicies(
              previousPolicies =>
                previousPolicies.filter(
                  policy =>
                    policy.id !==
                    policyId,
                ),
            );

            return result;
          } catch (
            error: unknown
          ) {
            const message =
              getErrorMessage(error);

            setError(message);

            throw error;
          } finally {
            setSubmitting(false);
          }
        },
        [],
      );

    /* ========================================================
       RETURN
       ======================================================== */

    return {
      policies,
      loading,
      submitting,
      error,

      loadPolicies,

      loadActivePolicies,

      loadEmployeeAcceptances,

      accept,

      create,

      remove,
    };
  };