import {
  useCallback,
  useState,
} from "react";

import {
  getMonthlySalarySheet,
  downloadMonthlySalarySheet,
} from "../services/monthlyAttendance.service";

import {
  MonthlyAttendanceEmployee,
} from "../types/monthlyAttendance.types";

import {
  mapMonthlySalaryRecord,
} from "../utils/monthlyAttendance.mapper";

import {
  downloadBlobFile,
} from "../utils/monthlyAttendance.utils";

interface UseMonthlyAttendanceReturn {
  employees: MonthlyAttendanceEmployee[];
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;
  fetchSalarySheet: (
    month: number,
    year: number,
  ) => Promise<void>;
  downloadSalarySheet: (
    month: number,
    year: number,
  ) => Promise<void>;
}

export const useMonthlyAttendance =
  (): UseMonthlyAttendanceReturn => {
    const [employees, setEmployees] = useState<
      MonthlyAttendanceEmployee[]
    >([]);

    const [isLoading, setIsLoading] =
      useState<boolean>(false);

    const [isDownloading, setIsDownloading] =
      useState<boolean>(false);

    const [error, setError] = useState<string | null>(
      null,
    );

    const fetchSalarySheet = useCallback(
      async (month: number, year: number): Promise<void> => {
        try {
          setIsLoading(true);
          setError(null);

          const response = await getMonthlySalarySheet({
            month,
            year,
          });

          const mappedEmployees =
            response.data.map(mapMonthlySalaryRecord);

          setEmployees(mappedEmployees);
        } catch (requestError) {
          console.error(
            "Failed to fetch monthly salary sheet:",
            requestError,
          );

          setEmployees([]);

          setError(
            "Unable to load monthly salary details.",
          );
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

    const downloadSalarySheet = useCallback(
      async (month: number, year: number): Promise<void> => {
        try {
          setIsDownloading(true);
          setError(null);

          const fileBlob =
            await downloadMonthlySalarySheet({
              month,
              year,
            });

          const fileName =
            `Monthly_Salary_${year}_${String(month).padStart(2, "0")}.xlsx`;

          downloadBlobFile(fileBlob, fileName);
        } catch (requestError) {
          console.error(
            "Failed to download monthly salary sheet:",
            requestError,
          );

          setError(
            "Unable to download monthly salary sheet.",
          );
        } finally {
          setIsDownloading(false);
        }
      },
      [],
    );

    return {
      employees,
      isLoading,
      isDownloading,
      error,
      fetchSalarySheet,
      downloadSalarySheet,
    };
  };