import axiosInstance from '@/services/axios/axiosInstance';
import type { EmployeePayslip } from '../types/employeePayslip.types';

const PAYSLIP_ENDPOINT = '/api/v1/payslips/payslips';

interface EmployeePayslipResponse {
  success?: boolean;
  data?: EmployeePayslip[];
}

export const getEmployeePayslips = async (
  empCode: string,
): Promise<EmployeePayslip[]> => {
  const response = await axiosInstance.get<EmployeePayslipResponse>(
    `${PAYSLIP_ENDPOINT}/employee-code/${encodeURIComponent(empCode)}`,
  );

  const result = response.data;

  if (Array.isArray(result)) {
    return result;
  }

  return result?.data ?? [];
};

export const downloadEmployeePayslipPdf = async (
  payslipId: number,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${PAYSLIP_ENDPOINT}/${payslipId}/pdf`,
    {
      responseType: 'blob',
    },
  );

  return response.data;
};