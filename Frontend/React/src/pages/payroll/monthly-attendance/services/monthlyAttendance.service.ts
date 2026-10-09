import axiosInstance from "../../../../services/axios/axiosInstance";

import {
  MonthlySalaryApiResponse,
} from "../types/monthlyAttendance.types";

interface GetMonthlySalaryParams {
  month: number;
  year: number;
}

export const getMonthlySalarySheet = async (
  params: GetMonthlySalaryParams,
): Promise<MonthlySalaryApiResponse> => {
  const response = await axiosInstance.get<MonthlySalaryApiResponse>(
    "/api/v1/payroll/monthly-salary",
    {
      params: {
        month: params.month,
        year: params.year,
      },
    },
  );

  return response.data;
};

export const downloadMonthlySalarySheet = async (
  params: GetMonthlySalaryParams,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    "/api/v1/payroll/monthly-salary/export",
    {
      params: {
        month: params.month,
        year: params.year,
      },
      responseType: "blob",
    },
  );

  return response.data;
};