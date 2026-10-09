import {
  useCallback,
  useState,
} from 'react';

import {
  acceptPolicies,
  getEmployeeAcceptances,
} from '../services/policy.service';

import type {
  EmployeePolicyAcceptanceResponse,
  PolicyAcceptanceResponse,
} from '../types/policy.types';

interface UsePolicyAcceptanceResult {
  accept: (
    employeeId: number,
    policyIds: number[]
  ) => Promise<PolicyAcceptanceResponse>;

  loadAcceptances: (
    employeeId: number
  ) => Promise<EmployeePolicyAcceptanceResponse>;

  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const getErrorMessage = (
  error: unknown
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as {
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

export const usePolicyAcceptance =
  (): UsePolicyAcceptanceResult => {
    const [loading, setLoading] =
      useState(false);

    const [submitting, setSubmitting] =
      useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const loadAcceptances =
      useCallback(
        async (
          employeeId: number
        ): Promise<EmployeePolicyAcceptanceResponse> => {
          try {
            setLoading(true);
            setError(null);

            return await getEmployeeAcceptances(
              employeeId
            );
          } catch (error: unknown) {
            const message =
              getErrorMessage(error);

            setError(message);

            throw error;
          } finally {
            setLoading(false);
          }
        },
        []
      );

    const accept =
      useCallback(
        async (
          employeeId: number,
          policyIds: number[]
        ): Promise<PolicyAcceptanceResponse> => {
          try {
            setSubmitting(true);
            setError(null);

            return await acceptPolicies(
              employeeId,
              {
                policy_ids:
                  policyIds,
              }
            );
          } catch (error: unknown) {
            const message =
              getErrorMessage(error);

            setError(message);

            throw error;
          } finally {
            setSubmitting(false);
          }
        },
        []
      );

    return {
      accept,
      loadAcceptances,
      loading,
      submitting,
      error,
    };
  };