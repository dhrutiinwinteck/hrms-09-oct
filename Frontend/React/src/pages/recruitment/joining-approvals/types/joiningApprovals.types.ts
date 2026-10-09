export type JoiningApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'On Hold';

export interface JoiningApproval {
  /**
   * Real database application_id.
   */
  id: string;

  /**
   * Candidate full name.
   */
  candidateName: string;

  /**
   * Candidate email.
   */
  email: string;
  phoneNumber: string;

alternatePhoneNumber: string | null;

resumeOriginalName: string;

resumeStoredName: string;

resumePath: string;

department: string;

  

  /**
   * Backend position_applied_for.
   */
  designation: string;

  /**
   * Backend current_address.
   */
  location: string;

  /**
   * Joining date.
   *
   * Currently frontend-managed because the supplied
   * backend response does not contain joining_date.
   */
  joiningDate: string;

  /**
   * Application submission date.
   */
  appliedOn: string;

  /**
   * Current joining approval status.
   */
  status: JoiningApprovalStatus;

  /**
   * HR/Admin remark.
   *
   * Currently frontend-managed.
   */
  remark: string;

  avatar?: string;
  referredBy: string | null;
  reportingManagerStatus: string | null;
reportingManagerRemark: string | null;

teamManagerStatus: string | null;
teamManagerRemark: string | null;

hrStatus: string | null;
hrRemark: string | null;
}

export interface JoiningApprovalFilters {
  department?: string;
  designation?: string;
  location?: string;

  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface JoiningApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  onHold: number;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface JoiningApprovalActionResponse {
  success: boolean;
  message: string;
  application_id: number;
  status: string;
}

/**
 * ============================================================
 * BACKEND RESPONSE TYPES
 * ============================================================
 */

export interface JobApplicationBackend {
  application_id: number;

  full_name: string;

  email: string;
  referred_by?: string | null;

  phone_number: string;

  alternate_phone_number?: string | null;

  position_applied_for: string;
   joining_date?: string | null;

  remark?: string | null;


  date_of_application: string;

  resume_original_name?: string;

  resume_stored_name?: string;

  resume_path?: string;

  date_of_birth: string;
  department?: string | null;

  gender: string;

  marital_status: string;

  nationality: string;

  aadhar_number?: string | null;

  pan_number?: string | null;

  current_address: string;

  permanent_address: string;

  joining_status: string;

  created_date?: string;

  modified_date?: string | null;
  reporting_manager_status?: string | null;
reporting_manager_remark?: string | null;

team_manager_status?: string | null;
team_manager_remark?: string | null;

hr_status?: string | null;
hr_remark?: string | null;
}

export interface JobApplicationResponseItem {
  job_application: JobApplicationBackend;

  education: Record<string, unknown>[];

  emergency_contacts: Record<string, unknown>[];

  work_experiences: Record<string, unknown>[];

  references: Record<string, unknown>[];
}

export interface JobApplicationListResponse {
  success: boolean;

  message: string;

  data: JobApplicationResponseItem[];
}

export interface OnboardingDocumentItem {
  id: number;
  package_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  status: string;
  generated_at: string | null;
  sent_at: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface OnboardingDocumentPackage {
  id: number;
  job_application_id: number;

  designation: string;
  department: string;
  location: string;
  reporting_manager: string;

  joining_date: string;
  interview_date: string;
  salary_from_month: string;

  annual_ctc: string;

  basic_monthly: string;
  basic_annual: string;

  hra_monthly: string;
  hra_annual: string;

  conveyance_monthly: string;
  conveyance_annual: string;

  education_allowance_monthly: string;
  education_allowance_annual: string;

  special_allowance_monthly: string;
  special_allowance_annual: string;

  lta_monthly: string;
  lta_annual: string;

  medical_monthly: string;
  medical_annual: string;

  mediclaim_monthly: string;
  mediclaim_annual: string;

  professional_tax_monthly: string;
  professional_tax_annual: string;

  pf_monthly: string;
  pf_annual: string;

  gratuity_monthly: string;
  gratuity_annual: string;

  sub_total_1_monthly: string;
  sub_total_1_annual: string;

  sub_total_deduction_monthly: string;
  sub_total_deduction_annual: string;

  sub_total_monthly: string;
  sub_total_annual: string;

  gross_ctc_monthly: string;
  gross_ctc_annual: string;

  status: string;

  created_by: number | null;
  updated_by: number | null;

  created_at: string | null;
  updated_at: string | null;

  generated_at: string | null;
  sent_at: string | null;

  email_status: string | null;
  email_error: string | null;

  items: OnboardingDocumentItem[];
}