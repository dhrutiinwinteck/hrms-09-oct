import {
  MonthlyAttendanceEmployee,
  MonthlySalaryApiRecord,
} from "../types/monthlyAttendance.types";

const safeText = (value: string | null | undefined): string => {
  return value?.trim() || "-";
};

const safeNumber = (
  value: number | string | null | undefined,
): number => {
  const parsedValue = Number(value ?? 0);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

export const mapMonthlySalaryRecord = (
  record: MonthlySalaryApiRecord,
): MonthlyAttendanceEmployee => {
  return {
    employeeId: record.employee_id,
    employeeName: safeText(record.employee_name),
    uan: safeText(record.uan),
    esic: safeText(record.esic),
    bankName: safeText(record.bank_name),
    accountNo: safeText(record.account_no),
    ifsc: safeText(record.ifsc),
    netSalary: safeNumber(record.net_salary),
  };
};