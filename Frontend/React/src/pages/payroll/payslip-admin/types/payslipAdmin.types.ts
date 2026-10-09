// export interface PayslipRecord {
//   id: number;
//   name: string;
//   employeeId: string;
//   month: string;
//   salary: number;
//   payslip: string | null;
//   status: PayslipStatus;
// }

// export type PayslipStatus =
//   | 'Generated'
//   | 'Pending'
//   | 'Not Generated';

// export interface PayslipFilterState {
//   search: string;
//   page: number;
//   pageSize: number;
// }

// export interface PayslipApiResponse {
//   data: PayslipRecord[];
//   total: number;
// }

// export interface CreatePayslipRequest {
//   name: string;
//   employeeId: string;
//   month: string;
//   salary: number;
//   payslip?: string | null;
//   status?: PayslipStatus;
// }

export interface PayslipRecord {
  id: number;
  name: string;
  employeeId: string;
  month: string;
  salary: number;
  payslip: string | null;
  status: PayslipStatus;

  empId?: number;
  dayPaid?: number;
  lopAbsent?: number;
  totalEarnings?: number;
  totalDeduction?: number;
  netPay?: number;
  canView?: boolean;
}

export type PayslipStatus =
  | 'Generated'
  | 'Pending'
  | 'Not Generated';

export interface PayslipFilterState {
  search: string;
  page: number;
  pageSize: number;
}

export interface GeneratePayslipRequest {
  emp_id: number;
  month: string;
}

export interface GeneratePayslipResponse {
  id: number;
  calculation?: Record<string, unknown>;
  message?: string;
  success?: boolean;
}

export interface PayslipDetail {
  id: number;

  // Company details
  company_logo?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  company_contact?: string | null;

  // Employee details
  emp_id: number;
  emp_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  employee_name?: string | null;
  doj?: string | null;
  department?: string | null;
  department_name?: string | null;
  designation?: string | null;
  designation_name?: string | null;
  location?: string | null;

  // Personal details
  pan_no?: string | null;
  aadhar_no?: string | null;
  passport_no?: string | null;
  permanent_address?: string | null;
  current_address?: string | null;
  email?: string | null;
  phone?: string | null;

  // Bank details
  bank_name?: string | null;
  account_no?: string | null;
  ifsc_code?: string | null;

  // Salary details
  uan?: string | null;
  esic_no?: string | null;
  mode_pay?: string | null;
  pay_mode?: string | null;

  // Payslip details
  month: string;
  salary?: number | null;
  day_paid?: number | null;
  lop_absent?: number | null;
  availed_leave?: number | null;
  balance_leave?: number | null;

  // Earnings
  basic?: number | null;
  hra?: number | null;
  conveyance_allowance?: number | null;
  city_compensatory_allowance?: number | null;
  special_allowance?: number | null;
  other_earning?: number | null;
  night_allowance?: number | null;
  total_earnings?: number | null;

  // Deductions
  pf?: number | null;
  pf_employer?: number | null;
  esic?: number | null;
  pt?: number | null;
  other_deduction?: number | null;
  total_deduction?: number | null;

  net_pay?: number | null;
  amount_in_words?: string | null;
}