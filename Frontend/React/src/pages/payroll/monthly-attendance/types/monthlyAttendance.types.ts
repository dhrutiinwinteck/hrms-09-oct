export interface MonthlyAttendanceEmployee {
  employeeId: number;
  employeeName: string;
  uan: string;
  esic: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  netSalary: number;
}

export interface MonthlySalaryApiRecord {
  employee_id: number;
  employee_name: string | null;
  uan: string | null;
  esic: string | null;
  bank_name: string | null;
  account_no: string | null;
  ifsc: string | null;
  net_salary: number | string | null;
}

export interface MonthlySalaryApiResponse {
  month: number;
  year: number;
  total_records: number;
  data: MonthlySalaryApiRecord[];
}