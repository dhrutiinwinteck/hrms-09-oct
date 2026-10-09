// ============================================================
// LEAVE TYPES
// ============================================================

export type LeaveStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export type LeaveType =
  | "Paid Leave"
  | "Casual Leave"
  | "Comp off"
  | "LOP";

// ============================================================
// LEAVE LOG
// ============================================================

export interface LeaveLog {
  id: number;

  emp_id: number;

  emp_code: string | null;

  leave_from: string | null;

  leave_to: string | null;

  leave_reason: string | null;

  status: number;

  approved_by: number | null;

  approved_on: string | null;

  createdby: string | null;

  createdon: string | null;

  modifiedby: string | null;

  modifiedon: string | null;

  leave_type: string | null;

  no_of_days: number | null;

  half_day_from: string | null;

  half_day_to: string | null;
}

// ============================================================
// EMPLOYEE
// ============================================================

export interface Employee {
  id: number;

  employeeId: string;

  name: string;

   designation: string ;

designation_name?: string;

  department: string;

  email: string;

  phone: string;

  joiningDate: string;

  status:
    | "Active"
    | "Inactive"
    | "On Leave";

  gender:
    | "Male"
    | "Female"
    | "Other";

  avatar: string;
}

// ============================================================
// LEAVE BALANCE
// ============================================================
//
// Backend model:
// employee_leave_balance
//
// Important:
// Backend `emp_id` stores the employee CODE as a string.
// Example: IWT68
// ============================================================

export interface LeaveBalance {
  id: number;

  emp_id: string;

  year: string;

  remained_casual_leave: number;

  remained_paid_leave: number;

  remained_comp_off: number;

  leave_type: string | null;

  createdby: string | null;

  createddate: string | null;

  modifiedby: string | null;

  modifieddate: string | null;
}

// ============================================================
// APPLY LEAVE REQUEST
// ============================================================
//
// POST /api/v1/leaves/leave/apply
//
// Backend accepts only these fields.
// Do NOT send status, emp_id, createdby,
// half_day_from or half_day_to.
// ============================================================

export interface CreateLeaveRequest {
  emp_code: string;

  leave_from: string;

  leave_to: string;

  no_of_days: number;

  leave_type: LeaveType | string;

  leave_reason?: string | null;
}

// ============================================================
// UPDATE LEAVE REQUEST
// ============================================================
//
// PUT /api/v1/leaves/leave/{leave_id}
// ============================================================

export interface UpdateLeaveRequest {
  leave_reason: string;
}

// ============================================================
// APPROVE LEAVE REQUEST
// ============================================================
//
// POST /api/v1/leaves/leave/approve
// ============================================================

export interface ApproveLeaveRequest {
  leave_id: number;

  status: number;

  approved_by?: number | null;
}

// ============================================================
// REJECT LEAVE REQUEST
// ============================================================
//
// POST /api/v1/leaves/leave/reject
// ============================================================

export interface RejectLeaveRequest {
  leave_id: number;

   status: number;

  approved_by?: number | null;
}

// ============================================================
// CREATE LEAVE BALANCE REQUEST
// ============================================================
//
// POST /api/v1/leaves/leave/balances
// ============================================================

export interface LeaveBalanceCreateRequest {
  emp_id: string;

  year: string;

  remained_casual_leave?: number;

  remained_paid_leave?: number;

  remained_comp_off?: number;

  leave_type?: string | null;
}

// ============================================================
// UPDATE LEAVE BALANCE REQUEST
// ============================================================
//
// PUT /api/v1/leaves/leave/balances/{balance_id}
// ============================================================

export interface LeaveBalanceUpdateRequest {
  remained_comp_off: number;
}

export interface LeaveSetting {
  id: number;
  leave_type: number;
  leave_number: number;
  createdon: string;
  createdby: string;
  modifiedon: string | null;
  modifiedby: string | null;
}

export interface LeaveSettingUpdateRequest {
  leave_type: number;
  leave_number: number;
}

// ============================================================
// LEAVE EMPLOYEE RECORD
// ============================================================
//
// Used by the employee leave list/table and modal.
//
// This combines employee information with the complete
// backend leave_log information.
//
// IMPORTANT:
// `leaveId` is the backend leave_log.id, NOT employee.id.
// ============================================================

export interface LeaveEmployeeRecord
  extends Employee {
  // ----------------------------------------------------------
  // Frontend display fields
  // ----------------------------------------------------------

  from: string;

  to: string;

  noOfDays: number;

  leaveType: LeaveType | string;

  reason: string;

  leaveStatus: LeaveStatus;

  // ----------------------------------------------------------
  // Backend leave_log fields
  // ----------------------------------------------------------

  /**
   * Backend leave_log.id
   *
   * Used for:
   * - View
   * - Edit
   * - Approve
   * - Reject
   */
  leaveId: number;

  /**
   * Backend leave_log.emp_id
   */
  leaveEmployeeId: number;

  /**
   * Backend leave_log.emp_code
   */
  leaveEmployeeCode: string | null;

  /**
   * Backend leave_log.status
   *
   * 0 = Pending
   * 1 = Approved
   * 2 = Rejected
   */
  leaveStatusCode: number;

  /**
   * Backend leave_log.approved_by
   */
  approvedBy: number | null;

  /**
   * Backend leave_log.approved_on
   */
  approvedOn: string | null;

  /**
   * Backend leave_log.createdby
   */
  createdBy: string | null;

  /**
   * Backend leave_log.createdon
   */
  createdOn: string | null;

  /**
   * Backend leave_log.modifiedby
   */
  modifiedBy: string | null;

  /**
   * Backend leave_log.modifiedon
   */
  modifiedOn: string | null;

  /**
   * Backend leave_log.half_day_from
   */
  halfDayFrom: string | null;

  /**
   * Backend leave_log.half_day_to
   */
  halfDayTo: string | null;

  /**
   * Convenience flag for frontend.
   */
  halfDay?: boolean;
}

// ============================================================
// LEAVE BALANCE VIEW
// ============================================================
//
// Frontend-friendly structure used by
// Add / View Leaves table.
// ============================================================

export interface LeaveBalanceView {
  id: number;

  employeeName: string;

  empCode: string;

  year: string;

  casualLeave: number;

  paidLeave: number;

  compOff: number;

  createdOn: string;
}