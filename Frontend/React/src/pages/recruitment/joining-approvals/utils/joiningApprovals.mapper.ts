import {
  JobApplicationResponseItem,
  JoiningApproval,
  JoiningApprovalStatus,
} from '../types/joiningApprovals.types';

const normalizeString = (
  value: unknown,
  fallback = '-',
): string => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();

  return normalized.length > 0
    ? normalized
    : fallback;
};

/**
 * Convert backend approval status to the exact
 * values expected by the frontend dropdown.
 *
 * Backend:
 *   APPROVED
 *   REJECTED
 *   ON_HOLD
 *
 * Frontend:
 *   Accept
 *   Reject
 *   On Hold
 */
const mapApprovalAction = (
  value: unknown,
): string | null => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized = String(value)
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, '_');

  switch (normalized) {
    case 'APPROVED':
    case 'ACCEPT':
      return 'Accept';

    case 'REJECTED':
    case 'REJECT':
      return 'Reject';

    case 'ON_HOLD':
    case 'ONHOLD':
    case 'HOLD':
      return 'On Hold';

    default:
      return null;
  }
};

export const mapJoiningApprovalStatus = (
  status: unknown,
): JoiningApprovalStatus => {
  const normalizedStatus = normalizeString(
    status,
    'Pending',
  )
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .trim();

  switch (normalizedStatus) {
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
};

const formatAppliedDate = (
  value: unknown,
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(String(value));

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

export const mapJoiningApproval = (
  item: JobApplicationResponseItem,
): JoiningApproval => {
  const application =
    item?.job_application;

  if (!application) {
    throw new Error(
      'Invalid job application response: job_application is missing.',
    );
  }

  return {
    id: String(
      application.application_id,
    ),

    candidateName:
      normalizeString(
        application.full_name,
      ),

    email:
      normalizeString(
        application.email,
      ),

    referredBy:
      normalizeString(
        application.referred_by,
        '',
      ),

    designation:
      normalizeString(
        application.position_applied_for,
      ),

    location:
      normalizeString(
        application.current_address,
      ),

    phoneNumber:
      normalizeString(
        application.phone_number,
        'Not available',
      ),

    alternatePhoneNumber:
      application.alternate_phone_number ??
      null,

    resumeOriginalName:
      normalizeString(
        application.resume_original_name,
        'Not available',
      ),

    resumeStoredName:
      normalizeString(
        application.resume_stored_name,
        'Not available',
      ),

    resumePath:
      normalizeString(
        application.resume_path,
        'Not available',
      ),

    department:
      normalizeString(
        application.department,
        'Not available',
      ),

    joiningDate:
      normalizeString(
        application.joining_date,
        '',
      ),

    appliedOn:
      formatAppliedDate(
        application.date_of_application,
      ),

    status:
      mapJoiningApprovalStatus(
        application.joining_status,
      ),

    /**
     * General remark.
     */
    remark:
      normalizeString(
        application.remark,
        '',
      ),

    /**
     * Reporting Manager approval.
     */
    reportingManagerStatus:
      mapApprovalAction(
        application.reporting_manager_status,
      ),

    reportingManagerRemark:
      normalizeString(
        application.reporting_manager_remark,
        '',
      ) || null,

    /**
     * Team Manager approval.
     */
    teamManagerStatus:
      mapApprovalAction(
        application.team_manager_status,
      ),

    teamManagerRemark:
      normalizeString(
        application.team_manager_remark,
        '',
      ) || null,

    /**
     * HR approval.
     */
    hrStatus:
      mapApprovalAction(
        application.hr_status,
      ),

    /**
     * Only HR remark is used by the Remarks tab.
     */
    hrRemark:
      normalizeString(
        application.hr_remark,
        '',
      ) || null,

    avatar: undefined,
  };
};