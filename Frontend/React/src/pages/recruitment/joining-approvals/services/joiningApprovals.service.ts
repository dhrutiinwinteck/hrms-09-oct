import axiosInstance from '@/services/axios/axiosInstance';

import {
  JobApplicationListResponse,
  JoiningApproval,
  JoiningApprovalActionResponse,
  JoiningApprovalFilters,
  JoiningApprovalStats,
  JoiningApprovalStatus,
} from '../types/joiningApprovals.types';

import type {
  IDesignation,
} from '../../../recruitment/types/application.types';

import {
  mapJoiningApproval,
} from '../utils/joiningApprovals.mapper';

import {
  DEFAULT_PAGE_SIZE,
} from '../constants/joiningApprovals.constants';

import type {
  OnboardingDocumentPackage,
} from "../types/joiningApprovals.types";

/**
 * ============================================================
 * JOINING APPROVAL SERVICE
 * ============================================================
 *
 * Responsibilities:
 *
 * - Get all job applications
 * - Map backend response to frontend model
 * - Search
 * - Filters
 * - Client-side pagination
 * - Calculate statistics
 * - Accept / Reject / On Hold
 *
 * No backend changes are performed here.
 */
class JoiningApprovalService {

  /**
   * ============================================================
   * API URLS
   * ============================================================
   *
   * Keep these URLs exactly as configured for the
   * currently working FastAPI backend.
   */
  private readonly JOB_APPLICATIONS_URL =
    '/api/v1/job-applications';

  private readonly JOINING_APPROVALS_URL =
    '/api/v1/joining-approvals';

    private readonly JOINING_FORMS_URL =
  '/api/v1/joining-forms';

  private readonly ONBOARDING_DOCUMENTS_URL =
  "/api/v1/onboarding/documents";

  /**
   * ============================================================
   * GET JOINING APPROVALS
   * ============================================================
   */
async getJoiningApprovals(
  filters: JoiningApprovalFilters,
  searchTerm: string,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  designations: IDesignation[] = [],
): Promise<{
    items: JoiningApproval[];
    total: number;
  }> {

    const response =
      await axiosInstance.get<JobApplicationListResponse>(
        this.JOB_APPLICATIONS_URL,
      );

    const responseData =
      response.data;

    /**
     * ----------------------------------------------------------
     * Validate response
     * ----------------------------------------------------------
     */
    if (!responseData) {
      throw new Error(
        'Empty response received from job applications API.',
      );
    }

    if (responseData.success === false) {
      throw new Error(
        responseData.message ||
        'Failed to fetch job applications.',
      );
    }

    /**
     * ----------------------------------------------------------
     * Extract applications
     * ----------------------------------------------------------
     */
    const applications =
      Array.isArray(responseData.data)
        ? responseData.data
        : [];

    /**
     * ----------------------------------------------------------
     * Map backend data
     * ----------------------------------------------------------
     */
    const mappedApplications: JoiningApproval[] = [];

    for (const application of applications) {
      try {
        mappedApplications.push(
          mapJoiningApproval(application),
        );
      } catch (error) {
        console.error(
          'Invalid job application record:',
          application,
          error,
        );
      }
    }

    /**
     * ----------------------------------------------------------
     * Apply filters
     * ----------------------------------------------------------
     */
    const enrichedApplications =
  mappedApplications.map(
    application => {
      const designation =
        designations.find(
          item =>
            item.name
              .trim()
              .toLowerCase() ===
            application.designation
              .trim()
              .toLowerCase(),
        );

      return {
        ...application,
        department:
          designation?.department_name ||
          application.department ||
          '-',
      };
    },
  );

const filteredApplications =
  this.applyFilters(
    enrichedApplications,
    filters,
  );

    /**
     * ----------------------------------------------------------
     * Apply search
     * ----------------------------------------------------------
     */
    const searchedApplications =
      this.applySearch(
        filteredApplications,
        searchTerm,
      );

    /**
     * ----------------------------------------------------------
     * Total
     * ----------------------------------------------------------
     */
    const total =
      searchedApplications.length;

    /**
     * ----------------------------------------------------------
     * Safe pagination
     * ----------------------------------------------------------
     */
    const safePage =
      Number.isInteger(page) && page > 0
        ? page
        : 1;

    const safePageSize =
      Number.isInteger(pageSize) && pageSize > 0
        ? pageSize
        : DEFAULT_PAGE_SIZE;

    const start =
      (safePage - 1) * safePageSize;

    const end =
      start + safePageSize;

    const paginatedApplications =
      searchedApplications.slice(
        start,
        end,
      );

    return {
      items: paginatedApplications,
      total,
    };
  }

  /**
   * ============================================================
   * FILTERS
   * ============================================================
   */
  private applyFilters(
    data: JoiningApproval[],
    filters: JoiningApprovalFilters,
  ): JoiningApproval[] {

    return data.filter((item) => {

      /**
       * Department
       */
     

      /**
       * Designation
       */
      if (
        filters.designation &&
        filters.designation !== 'All Designations' &&
        item.designation !== filters.designation
      ) {
        return false;
      }

      /**
       * Location
       */
      if (
        filters.location &&
        filters.location !== 'All Locations' &&
        item.location !== filters.location
      ) {
        return false;
      }

      /**
       * Date range
       *
       * Joining date is frontend-managed.
       *
       * If no joining date exists, keep the record.
       */
      if (filters.dateRange) {

        if (
          !item.joiningDate ||
          item.joiningDate === '-'
        ) {
          return true;
        }

        const joiningDate =
          new Date(item.joiningDate);

        if (
          Number.isNaN(
            joiningDate.getTime(),
          )
        ) {
          return true;
        }

        if (
          joiningDate <
            filters.dateRange.start ||
          joiningDate >
            filters.dateRange.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * ============================================================
   * SEARCH
   * ============================================================
   */
  private applySearch(
    data: JoiningApproval[],
    term: string,
  ): JoiningApproval[] {

    const normalizedTerm =
      term
        .trim()
        .toLowerCase();

    if (!normalizedTerm) {
      return data;
    }

    return data.filter((item) => {

      return (
        item.candidateName
          .toLowerCase()
          .includes(normalizedTerm) ||

        item.email
          .toLowerCase()
          .includes(normalizedTerm) ||

       

        item.designation
          .toLowerCase()
          .includes(normalizedTerm) ||

        item.location
          .toLowerCase()
          .includes(normalizedTerm) ||

        item.remark
          .toLowerCase()
          .includes(normalizedTerm)
      );
    });
  }

  /**
   * ============================================================
   * BACKEND STATUS MAPPING
   * ============================================================
   */
  private mapBackendStatus(
    status: unknown,
  ): JoiningApprovalStatus {

    if (
      typeof status !== 'string'
    ) {
      return 'Pending';
    }

    const normalized =
      status
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, ' ');

    switch (normalized) {

      case 'approved':
        return 'Approved';
      
      case 'rejected':
        return 'Rejected';

      case 'on hold':
      case 'onhold':
      case 'hold':
        return 'On Hold';

      case 'pending':
      default:
        return 'Pending';
    }
  }

  /**
   * ============================================================
   * ACCEPT APPLICATION
   * ============================================================
   */
  async acceptApplication(
    applicationId: string,
  ): Promise<JoiningApprovalActionResponse> {

    return this.performApprovalAction(
      applicationId,
      'accept',
    );
  }

  /**
   * ============================================================
   * REJECT APPLICATION
   * ============================================================
   */
  async rejectApplication(
    applicationId: string,
  ): Promise<JoiningApprovalActionResponse> {

    return this.performApprovalAction(
      applicationId,
      'reject',
    );
  }

  /**
   * ============================================================
   * PUT APPLICATION ON HOLD
   * ============================================================
   */
  async holdApplication(
    applicationId: string,
  ): Promise<JoiningApprovalActionResponse> {

    return this.performApprovalAction(
      applicationId,
      'on-hold',
    );
  }

  /**
 * ============================================================
 * SEND JOINING FORM LINK
 * ============================================================
 */
async sendJoiningForm(
  applicationId: string,
): Promise<void> {

  const numericId =
    Number(applicationId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      'Invalid job application ID.',
    );
  }

  await axiosInstance.put(
    `${this.JOINING_FORMS_URL}/send`,
    {
      application_id: numericId,
    },
  );
}

  /**
 * ============================================================
 * UPDATE JOB APPLICATION
 * ============================================================
 */
async updateApplication(
  applicationId: string,
  data: {
  position_applied_for: string;
  joining_date: string | null;
  remark: string | null;

  reporting_manager_status: string | null;
  reporting_manager_remark: string | null;

  team_manager_status: string | null;
  team_manager_remark: string | null;

  hr_status: string | null;
  hr_remark: string | null;
},
): Promise<void> {
  const numericId = Number(applicationId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      'Invalid job application ID.',
    );
  }

  await axiosInstance.put(
    `${this.JOB_APPLICATIONS_URL}/${numericId}`,
    data,
  );
}
  

   /**
 * ============================================================
 * DELETE JOB APPLICATION
 * ============================================================
 */
async deleteApplication(
  applicationId: string,
): Promise<void> {
  const numericId = Number(applicationId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      'Invalid job application ID.',
    );
  }

  await axiosInstance.delete(
    `${this.JOB_APPLICATIONS_URL}/${numericId}`,
  );
}
  /**
   * ============================================================
   * COMMON APPROVAL ACTION
   * ============================================================
   */
  private async performApprovalAction(
    applicationId: string,
    action:
      | 'accept'
      | 'reject'
      | 'on-hold',
  ): Promise<JoiningApprovalActionResponse> {

    const numericId =
      Number(applicationId);

    if (
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      throw new Error(
        'Invalid job application ID.',
      );
    }

    const url =
      `${this.JOINING_APPROVALS_URL}/` +
      `${numericId}/${action}`;

    const response =
      await axiosInstance.put<JoiningApprovalActionResponse>(
        url,
      );

    return response.data;
  }

  /**
 * ============================================================
 * GET ONBOARDING DOCUMENT PACKAGE
 * ============================================================
 */
async getOnboardingDocumentPackage(
  applicationId: string,
): Promise<OnboardingDocumentPackage> {
  const numericId = Number(applicationId);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      "Invalid job application ID.",
    );
  }

  const response =
    await axiosInstance.get<OnboardingDocumentPackage>(
      `${this.ONBOARDING_DOCUMENTS_URL}/application/${numericId}`,
    );

  return response.data;
}

/**
 * ============================================================
 * CREATE ONBOARDING DOCUMENT PACKAGE
 * ============================================================
 */
async createOnboardingDocumentPackage(
  data: {
    job_application_id: number;

    designation: string;
    department: string;
    location: string;
    reporting_manager: string;

    joining_date: string;
    interview_date: string;
    salary_from_month: string;

    annual_ctc: number;

    basic_monthly: number;
    basic_annual: number;

    hra_monthly: number;
    hra_annual: number;

    conveyance_monthly: number;
    conveyance_annual: number;

    education_allowance_monthly: number;
    education_allowance_annual: number;

    special_allowance_monthly: number;
    special_allowance_annual: number;

    lta_monthly: number;
    lta_annual: number;

    medical_monthly: number;
    medical_annual: number;

    mediclaim_monthly: number;
    mediclaim_annual: number;

    professional_tax_monthly: number;
    professional_tax_annual: number;

    pf_monthly: number;
    pf_annual: number;

    gratuity_monthly: number;
    gratuity_annual: number;

    sub_total_1_monthly: number;
    sub_total_1_annual: number;

    sub_total_deduction_monthly: number;
    sub_total_deduction_annual: number;

    sub_total_monthly: number;
    sub_total_annual: number;

    gross_ctc_monthly: number;
    gross_ctc_annual: number;
  },
): Promise<OnboardingDocumentPackage> {

  const response =
    await axiosInstance.post<OnboardingDocumentPackage>(
      this.ONBOARDING_DOCUMENTS_URL,
      data,
      {
        // Backend generates documents and sends email.
        // This can take longer than the normal API timeout.
        timeout: 300000,
      },
    );

  return response.data;
}
  /**
   * ============================================================
   * STATISTICS
   * ============================================================
   */
  async getStats(): Promise<JoiningApprovalStats> {

    const response =
      await axiosInstance.get<JobApplicationListResponse>(
        this.JOB_APPLICATIONS_URL,
      );

    const responseData =
      response.data;

    if (!responseData) {
      throw new Error(
        'Empty response received while fetching statistics.',
      );
    }

    if (responseData.success === false) {
      throw new Error(
        responseData.message ||
        'Failed to fetch statistics.',
      );
    }

    const applications =
      Array.isArray(responseData.data)
        ? responseData.data
        : [];

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let onHold = 0;

    for (const item of applications) {

      const backendStatus =
        item?.job_application
          ?.joining_status;

      const status =
        this.mapBackendStatus(
          backendStatus,
        );

      switch (status) {

        case 'Approved':
          approved++;
          break;

        case 'Rejected':
          rejected++;
          break;

        case 'On Hold':
          onHold++;
          break;

        case 'Pending':
        default:
          pending++;
          break;
      }
    }

    return {
      pending,
      approved,
      rejected,
      onHold,
    };
  }
}

/**
 * ============================================================
 * SINGLETON SERVICE INSTANCE
 * ============================================================
 *
 * This is the export that the hook should consume.
 */
export const joiningApprovalService =
  new JoiningApprovalService();