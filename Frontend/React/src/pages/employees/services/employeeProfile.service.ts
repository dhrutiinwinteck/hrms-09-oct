import axiosInstance from '../../../services/axios/axiosInstance';
import { getUsername } from '../../auth/utils/authStorage';

export interface CurrentEmployeeProfile {
  id: number;
  emp_code: string;

  first_name: string | null;
  last_name: string | null;
  full_name: string;

  email: string | null;
  phone: string | null;

  designation: string | null;
  department: string | null;

  reporting_manager: string | null;

  doj: string | null;
  photo: string | null;
  gender: string | null;

  is_remove: number;

  emp_type: string | null;
  company_name: string | null;
  company_location: string | null;
  company_country: string | null;
  project: string | null;

  contract_period: string | null;
  notice_period: string | null;

  personal_email: string | null;

  createdon: string | null;
  createdby: number | string | null;

  modifiedby: number | string | null;
  modifiedon: string | null;
}

/* ============================================================
   EMPLOYEE PROFILE ENDPOINT
============================================================ */

const EMPLOYEE_PROFILE_ENDPOINT =
  '/api/v1/employees/profile';

/* ============================================================
   EMPLOYEE PROFILE SERVICE
============================================================ */

const employeeProfileService = {
  /**
   * ==========================================================
   * GET CURRENT LOGGED-IN EMPLOYEE PROFILE
   * ==========================================================
   *
   * Employee code is taken from the authenticated user's
   * stored username.
   *
   * Example:
   *
   * username = IWT67
   *
   * Request:
   *
   * GET /api/v1/employees/profile/IWT67
   *
   * ==========================================================
   */
  async getCurrentProfile(): Promise<CurrentEmployeeProfile> {
    const empCode =
      getUsername()?.trim();

    if (!empCode) {
      throw new Error(
        'Logged-in employee code was not found.',
      );
    }

    const response =
      await axiosInstance.get<CurrentEmployeeProfile>(
        `${EMPLOYEE_PROFILE_ENDPOINT}/${encodeURIComponent(
          empCode,
        )}`,
      );

    return response.data;
  },
};

export default employeeProfileService;