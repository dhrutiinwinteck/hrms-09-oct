/**
 * ============================================================
 * Employee Module - Type Definitions
 * ============================================================
 */

export type EmployeeStatus =
  | 'Active'
  | 'Inactive'
  | 'On Leave'
  | 'Terminated';

export type EmployeeType =
  | 'Full Time'
  | 'Part Time'
  | 'Contract'
  | 'Intern';

/**
 * Frontend employee model.
 *
 * IMPORTANT:
 *
 * id:
 *     Internal database employee ID.
 *
 * employeeCode:
 *     Business employee code received from backend emp_code.
 *
 * Example:
 *
 * id = 1
 * employeeCode = "IWT1001"
 */
export interface Employee {
  /**
   * Internal database primary key.
   *
   * Used for backend update/delete operations.
   */
  id: string;

  /**
   * Employee business code.
   *
   * Example: IWT1001
   *
   * This is what should be displayed
   * in the Employee ID column.
   */
  employeeCode: string;

  firstName: string;

  lastName: string;

  fullName: string;

  email: string;

  personalEmail?: string;

  phone?: string;

  photo?: string;

  gender: string;

  password?: string;

  noticePeriod: number;

  joiningDate: string;

  designation: string;

  department?: string;

  reportingManager: string;

  employeeType: EmployeeType;

  status: EmployeeStatus;

  createdAt: string;

  updatedAt: string;
}

/**
 * Existing Add/Edit Employee form model.
 */
export interface EmployeeFormData {
  firstName: string;

  lastName: string;

  email: string;

  personalEmail?: string;

  phone?: string;

  photo?: string;

  gender: string;

  password: string;

  noticePeriod: number;

  joiningDate: string;

  designation: string;

  reportingManager: string;

  employeeType: EmployeeType;
}

export interface EmployeeFilters {
  employeeId?: string;

  employeeName?: string;

  designation?: string;
}

export interface EmployeeStatistics {
  total: number;

  active: number;

  newJoiners: number;

  onLeave: number;
}

export interface EmployeeApiResponse {
  data: Employee[];

  total: number;

  page: number;

  limit: number;
}

/**
 * Backend POST /api/v1/employees/ request.
 */
export interface CreateEmployeeApiRequest {
  first_name: string;

  last_name: string;

  email: string;

  password: string;

  designation: number;

  reporting_manager: number;

  phone: string;

  gender: number;

  doj: string;
}

/**
 * Frontend create payload.
 */
export type CreateEmployeePayload = EmployeeFormData;

/**
 * Backend employee response model.
 *
 * The backend uses snake_case.
 */
export interface EmployeeApiModel {
  /**
   * Internal database ID.
   */
  id?: string | number;

  /**
   * Business employee code.
   *
   * Example: IWT1001
   */
  emp_code?: string;

  employee_code?: string;

  first_name?: string;

  last_name?: string;

  full_name?: string;

  email?: string;

  personal_email?: string;

  phone?: string;

  photo?: string;

  gender?: string | number;

  password?: string;

  notice_period?: number;

  designation?: string ;

  department?: string;

  reporting_manager?: string ;

  employee_type?: string;

  /**
   * Optional status if backend provides it.
   */
  status?: string;

  /**
   * Backend soft-delete/status field.
   *
   * 0 = Active
   * 1 = Inactive
   */
  is_remove?: number;

  joining_date?: string;

  doj?: string;

  created_at?: string;

  updated_at?: string;

  /**
   * Backend employee_detail fields.
   */
  createdon?: string;

  createdby?: string;

  modifiedby?: string;

  modifiedon?: string;

  emp_type?: string;

  company_name?: string;

  company_location?: string;

  company_country?: string;

  project?: string;

  contract_period?: string;

  [key: string]: unknown;
}

/**
 * Designation returned by:
 *
 * GET /api/v1/designations/
 */
export interface DesignationApiModel {
  id: number;

  name: string;

  depart_id?: number | null;

  [key: string]: unknown;
}

export interface ActivateEmployeePayload {
  reason: string;

  resignation: string;

  termination: string;

  fromDate: string;

  noticePeriod: number;

  status: EmployeeStatus;
}

export type EmployeeUpdatePayload =
  Partial<Employee> & Partial<ActivateEmployeePayload>;