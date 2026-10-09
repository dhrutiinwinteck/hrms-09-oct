import type {
  PayslipRecord,
} from '../types/payslipAdmin.types';

export const mapPayslipRecord = (
  value: unknown,
): PayslipRecord => {
  const record =
    value as Partial<PayslipRecord>;

  return {
    id: Number(record.id ?? 0),
    name: String(record.name ?? ''),
    employeeId: String(
      record.employeeId ?? '',
    ),
    month: String(record.month ?? ''),
    salary: Number(record.salary ?? 0),
    payslip:
      typeof record.payslip === 'string'
        ? record.payslip
        : null,
    status:
      record.status === 'Generated' ||
      record.status === 'Pending' ||
      record.status === 'Not Generated'
        ? record.status
        : 'Not Generated',
  };
};