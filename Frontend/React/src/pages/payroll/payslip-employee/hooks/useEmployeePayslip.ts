import { useCallback, useEffect, useState } from 'react';

import {
  getEmployeePayslips,
  downloadEmployeePayslipPdf,
} from '../services/employeePayslip.service';

import type { EmployeePayslip } from '../types/employeePayslip.types';

interface UseEmployeePayslipResult {
  payslips: EmployeePayslip[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  downloadPdf: (payslipId: number) => Promise<void>;
}

export const useEmployeePayslip = (
  empCode: string | null,
): UseEmployeePayslipResult => {
  const [payslips, setPayslips] = useState<EmployeePayslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPayslips = useCallback(async () => {
    if (!empCode) {
      setPayslips([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getEmployeePayslips(empCode);
      setPayslips(result);
    } catch (err) {
      console.error('Failed to load employee payslips:', err);
      setError('Failed to load payslips.');
    } finally {
      setLoading(false);
    }
  }, [empCode]);

  const downloadPdf = useCallback(async (payslipId: number) => {
    try {
      const blob = await downloadEmployeePayslipPdf(payslipId);

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `Payslip_${payslipId}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download payslip:', err);
      alert('Failed to download payslip.');
    }
  }, []);

  useEffect(() => {
    void loadPayslips();
  }, [loadPayslips]);

  return {
    payslips,
    loading,
    error,
    reload: loadPayslips,
    downloadPdf,
  };
};