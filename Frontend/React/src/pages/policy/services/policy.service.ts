import axiosInstance from '../../../services/axios/axiosInstance';

import type {
  EmployeePolicyAcceptanceResponse,
  Policy,
  PolicyAcceptanceRequest,
  PolicyAcceptanceResponse,
  PolicyContentResponse,
  PolicyCreateResponse,
  PolicyDeleteResponse,
  PolicyLanguage,
  PolicyListResponse,
} from '../types/policy.types';


/* ============================================================
   SUPPORTED POLICY LANGUAGES
============================================================ */

const SUPPORTED_POLICY_LANGUAGES: PolicyLanguage[] = [
  'en',
  'hi',
  'bn',
];


/* ============================================================
   VALIDATE POLICY ID
============================================================ */

const validatePolicyId = (
  policyId: number,
): void => {
  if (
    !Number.isInteger(policyId) ||
    policyId <= 0
  ) {
    throw new Error(
      'Invalid policy ID.',
    );
  }
};


/* ============================================================
   GET ALL POLICIES
============================================================ */

export const getPolicies =
  async (): Promise<PolicyListResponse> => {
    const response =
      await axiosInstance.get<PolicyListResponse>(
        '/api/v1/policies/',
      );

    return response.data;
  };


/* ============================================================
   GET ACTIVE POLICIES
============================================================ */

export const getActivePolicies =
  async (): Promise<PolicyListResponse> => {
    const response =
      await axiosInstance.get<PolicyListResponse>(
        '/api/v1/policies/active',
      );

    return response.data;
  };


/* ============================================================
   GET POLICY BY ID
============================================================ */

export const getPolicyById =
  async (
    policyId: number,
  ): Promise<Policy> => {
    validatePolicyId(policyId);

    const response =
      await axiosInstance.get<Policy>(
        `/api/v1/policies/${policyId}`,
      );

    return response.data;
  };


/* ============================================================
   GET POLICY READABLE CONTENT
============================================================ */

/**
 * Loads extracted PDF text from the backend.
 *
 * English:
 *   GET /api/v1/policies/{policyId}/content?language=en
 *
 * Hindi:
 *   GET /api/v1/policies/{policyId}/content?language=hi
 *
 * Bengali:
 *   GET /api/v1/policies/{policyId}/content?language=bn
 *
 * The backend is responsible for:
 * - PDF text extraction
 * - Translation
 * - Returning readable content
 */
export const getPolicyContent =
  async (
    policyId: number,
    language: PolicyLanguage = 'en',
  ): Promise<PolicyContentResponse> => {
    validatePolicyId(policyId);

    if (
      !SUPPORTED_POLICY_LANGUAGES.includes(
        language,
      )
    ) {
      throw new Error(
        'Unsupported policy language.',
      );
    }

    try {
      const response =
        await axiosInstance.get<PolicyContentResponse>(
          `/api/v1/policies/${policyId}/content`,
          {
            params: {
              language,
            },
          },
        );

      if (
        !response.data
      ) {
        throw new Error(
          'Policy content was not returned by the server.',
        );
      }

      if (
        response.data.success === false
      ) {
        throw new Error(
          response.data.message ||
            'Unable to load policy content.',
        );
      }

      return response.data;
    } catch (
      error: unknown
    ) {
      if (
        error instanceof Error
      ) {
        throw error;
      }

      throw new Error(
        'Unable to load policy content.',
      );
    }
  };


/* ============================================================
   GET EMPLOYEE POLICY ACCEPTANCES
============================================================ */

export const getEmployeeAcceptances =
  async (
    employeeId: number,
  ): Promise<EmployeePolicyAcceptanceResponse> => {
    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      throw new Error(
        'Invalid employee ID.',
      );
    }

    const response =
      await axiosInstance.get<EmployeePolicyAcceptanceResponse>(
        `/api/v1/policies/employee/${employeeId}/acceptances`,
      );

    return response.data;
  };


/* ============================================================
   ACCEPT POLICIES
============================================================ */

export const acceptPolicies =
  async (
    employeeId: number,
    request: PolicyAcceptanceRequest,
  ): Promise<PolicyAcceptanceResponse> => {
    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      throw new Error(
        'Invalid employee ID.',
      );
    }

    if (
      !request.policy_ids ||
      request.policy_ids.length === 0
    ) {
      throw new Error(
        'At least one policy must be selected.',
      );
    }

    const response =
      await axiosInstance.post<PolicyAcceptanceResponse>(
        '/api/v1/policies/accept',
        request,
        {
          params: {
            employee_id:
              employeeId,
          },
        },
      );

    return response.data;
  };


/* ============================================================
   CREATE POLICY
============================================================ */

export const createPolicy =
  async (
    policyName: string,
    description: string,
    file: File,
  ): Promise<PolicyCreateResponse> => {
    const normalizedPolicyName =
      policyName.trim();

    const normalizedDescription =
      description.trim();

    if (
      !normalizedPolicyName
    ) {
      throw new Error(
        'Policy name is required.',
      );
    }

    if (
      !(file instanceof File)
    ) {
      throw new Error(
        'Policy document is required.',
      );
    }

    const formData =
      new FormData();

    formData.append(
      'policy_name',
      normalizedPolicyName,
    );

    formData.append(
      'description',
      normalizedDescription,
    );

    formData.append(
      'file',
      file,
      file.name,
    );

    const response =
      await axiosInstance.post<PolicyCreateResponse>(
        '/api/v1/policies/',
        formData,
      );

    return response.data;
  };


/* ============================================================
   DELETE POLICY
============================================================ */

export const deletePolicy =
  async (
    policyId: number,
  ): Promise<PolicyDeleteResponse> => {
    validatePolicyId(policyId);

    const response =
      await axiosInstance.delete<PolicyDeleteResponse>(
        `/api/v1/policies/${policyId}`,
      );

    return response.data;
  };