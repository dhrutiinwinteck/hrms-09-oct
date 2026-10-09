import axiosInstance from "@/services/axios/axiosInstance";

import type {
  GeneratePayslipRequest,
  GeneratePayslipResponse,
  PayslipRecord,
  PayslipDetail,
} from "../types/payslipAdmin.types";

interface BackendPayslip {
  id?: number;
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

interface PayslipDetailResponse {
  success?: boolean;
  data?: PayslipDetail;
  message?: string;
}

interface PayslipEmployee {
  id: number;
  emp_id?: number;
  emp_code?: string;
  first_name?: string;
  last_name?: string;
  employee_name?: string;
}

interface PayslipEmployeesResponse {
  success?: boolean;
  data?: PayslipEmployee[];
  message?: string;
}

interface CheckPayslipResponse {
  res?: string;
  message?: string;
  payslip?: PayslipDetail;
  ps?: Record<string, unknown>;
}

/**
 * Backend actual route:
 * /api/v1/payslips
 */
const PAYSLIP_ENDPOINT = "/api/v1/payslips/payslips";

/**
 * Map backend payslip
 */
const mapBackendPayslip = (
  item: BackendPayslip,
): PayslipRecord => {
  const isGenerated = Boolean(item.id);

  return {
    id: Number(item.id ?? 0),

    empId: item.emp_id,

    name: item.employee_name ?? "",

    employeeId: String(
      item.emp_code ?? item.emp_id ?? "",
    ),

    month: item.month
      ? new Date(item.month).toLocaleDateString(
          "en-IN",
          {
            month: "long",
            year: "numeric",
          },
        )
      : "",

    salary: Number(
      item.salary ??
        item.total_earnings ??
        0,
    ),

    payslip: item.id
      ? `${PAYSLIP_ENDPOINT}/${item.id}/pdf`
      : null,

    status: isGenerated
      ? "Generated"
      : "Not Generated",

    dayPaid: item.day_paid,

    lopAbsent: item.lop_absent,

    totalEarnings: item.total_earnings,

    totalDeduction: item.total_deduction,

    netPay: item.net_pay,

    canView: item.can_view,
  };
};

/**
 * Get all payslips
 */
export const getPayslips = async (): Promise<
  PayslipRecord[]
> => {
  const response = await axiosInstance.get<
    BackendPayslip[] | {
      data: BackendPayslip[];
    }
  >(PAYSLIP_ENDPOINT);

  const result = Array.isArray(response.data)
    ? response.data
    : response.data.data;

  return result.map(mapBackendPayslip);
};

/**
 * Get payslip details by ID
 *
 * Supports:
 * 1. { success: true, data: {...} }
 * 2. { id: 1, employee_name: "..." }
 */
export const getPayslipById = async (
  id: number,
): Promise<PayslipDetail> => {
  const response =
    await axiosInstance.get<
      PayslipDetailResponse | PayslipDetail
    >(`${PAYSLIP_ENDPOINT}/${id}`);

  const result = response.data;

  if (
    typeof result === "object" &&
    result !== null &&
    "data" in result &&
    result.data
  ) {
    return result.data;
  }

  return result as PayslipDetail;
};

/**
 * Get employees for Salary PF modal
 */
export const getPayslipEmployees = async (): Promise<
  PayslipEmployee[]
> => {
  const response =
    await axiosInstance.get<
      PayslipEmployee[] | PayslipEmployeesResponse
    >(`${PAYSLIP_ENDPOINT}/employees`);

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.data ?? [];
};

/**
 * Check payslip before generation
 *
 * Backend:
 * GET /api/v1/payslips/check
 */
export const checkPayslip = async (
  empId: number,
  year: number,
  month: number,
): Promise<CheckPayslipResponse> => {
  if (!empId) {
    throw new Error("Employee is required");
  }

  if (!year || !month) {
    throw new Error(
      "Valid payroll year and month are required",
    );
  }

  const response =
    await axiosInstance.get<CheckPayslipResponse>(
      `${PAYSLIP_ENDPOINT}/check`,
      {
        params: {
          emp_id: empId,
          year,
          month,
        },
      },
    );

  return response.data;
};

/**
 * Generate payslip
 *
 * Backend expects query parameters:
 * emp_id
 * year
 * month
 */
export const generatePayslip = async (
  payload: GeneratePayslipRequest,
): Promise<GeneratePayslipResponse> => {
  if (!payload.emp_id) {
    throw new Error("Employee is required");
  }

  if (!payload.month) {
    throw new Error("Payroll month is required");
  }

  const monthValue = String(
    payload.month,
  ).trim();

  let year: number;
  let month: number;

  /**
   * Supported formats:
   * YYYY-MM
   * YYYY-MM-DD
   */
  if (/^\d{4}-\d{2}$/.test(monthValue)) {
    const [
      yearValue,
      monthValueNumber,
    ] = monthValue
      .split("-")
      .map(Number);

    year = yearValue;
    month = monthValueNumber;
  } else if (
    /^\d{4}-\d{2}-\d{2}$/.test(monthValue)
  ) {
    const dateValue = new Date(monthValue);

    if (Number.isNaN(dateValue.getTime())) {
      throw new Error("Invalid payroll month");
    }

    year = dateValue.getUTCFullYear();

    month = dateValue.getUTCMonth() + 1;
  } else {
    throw new Error(
      "Invalid month format. Expected YYYY-MM",
    );
  }

  if (month < 1 || month > 12) {
    throw new Error("Invalid payroll month");
  }

  if (year < 2000 || year > 2100) {
    throw new Error("Invalid payroll year");
  }

  const response =
    await axiosInstance.post<GeneratePayslipResponse>(
      `${PAYSLIP_ENDPOINT}/generate`,
      null,
      {
        params: {
          emp_id: payload.emp_id,
          year,
          month,
        },
      },
    );

  return response.data;
};

/**
 * Delete payslip
 */
export const deletePayslip = async (
  id: number,
): Promise<void> => {
  await axiosInstance.delete(
    `${PAYSLIP_ENDPOINT}/${id}`,
  );
};

/**
 * Download payslip PDF
 */
export const downloadPayslipPdf = async (
  id: number,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `${PAYSLIP_ENDPOINT}/${id}/pdf`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

/**
 * Send payslip through email
 */
export const sendPayslipEmail = async (
  id: number,
): Promise<void> => {
  if (!id) {
    throw new Error("Payslip ID is required.");
  }

  await axiosInstance.post(
    `${PAYSLIP_ENDPOINT}/${id}/send-email`,
  );
};