export type ShiftSwapStatus =
  | 'PendingTargetAcceptance'
  | 'PendingManagerApproval'
  | 'Approved'
  | 'Rejected';

export type ShiftSwapRequestType =
  | 'Specific Day';

export interface Employee {
  id: string;
  name: string;
  designation: string;
  avatar?: string;

  employeeCode?: string;

  swapDate?: string;

  dayOfWeek?: string;

  isWeekOff?: boolean;

  isLeave?: boolean;

  hasShiftDateRecord?: boolean;
}

export interface CreateShiftSwapRequest {
  requestType: ShiftSwapRequestType;

  swapDate: string;

  requestedToId: string;
}

export interface ShiftState {
  employeeId: string;

  swapDate: string;

  patternId: string | null;

  isWeekOff: boolean;

  isLeave: boolean;

  dayOfWeek?: string;
}

export interface ShiftSwapRequest {
  id: string;

  requestedBy: Employee;

  requestedTo: Employee;

  requestType: ShiftSwapRequestType;

  requestedOn: string;

  swapDate: string;

  status: ShiftSwapStatus;

  reportingManagerId?: string | null;

  reportingManagerName?: string | null;

  approvedBy?: string | null;

  approvedOn?: string | null;

  requesterShift?: ShiftState | null;

  targetShift?: ShiftState | null;
}

export interface EligibleEmployeeApiResponse {
  employee_id: number;

  employee_code?: string | null;

  employee_name: string;

  swap_date: string;

  day_of_week: string;

  is_week_off: boolean;

  is_leave: boolean;

  has_shift_date_record: boolean;
}

export interface EligibleEmployeesResponse {
  success: boolean;

  swap_date: string;

  employees: EligibleEmployeeApiResponse[];
}

export interface ShiftStateApiResponse {
  employee_id: number;

  swap_date: string;

  pattern_id?: number | null;

  is_week_off: boolean;

  is_leave: boolean;

  day_of_week?: string | null;
}

export interface ShiftSwapApiResponse {
  swap_requested_id: number;

  requested_by_emp_id: number;

  requested_to_emp_id: number;

  requested_by_name: string;

  requested_to_name: string;

  request_type: string;

  swap_date: string;

  status: string;

  created_date: string;

  reporting_manager_id?: number | null;

  reporting_manager_name?: string | null;

  approved_by?: string | null;

  approved_on?: string | null;

  requester_shift?: ShiftStateApiResponse | null;

  target_shift?: ShiftStateApiResponse | null;
}

export interface ShiftSwapActionApiResponse {
  success: boolean;

  message: string;

  swap_requested_id: number;

  status: string;
}