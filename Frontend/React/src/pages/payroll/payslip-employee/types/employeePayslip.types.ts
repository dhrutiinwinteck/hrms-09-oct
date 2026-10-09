export interface EmployeePayslip {
  id: number;
  emp_id?: number;
  emp_code?: string;
  employee_name?: string;
  month?: string;
  salary?: number;
  day_paid?: number;
  lop_absent?: number;
  total_earnings?: number;
  total_deduction?: number;
  net_pay?: number;
  can_view?: boolean;
}

export interface EmployeePayslipFilterState {
  search: string;
  year: string;
}