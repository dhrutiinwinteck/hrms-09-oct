import axiosInstance from '@/services/axios/axiosInstance';
import type {
  //ApproveCompOffRequest,
  CompOffDayType,
  CompOffRequest,
  CompOffStatus,
  CreateCompOffRequest,
  RejectCompOffRequest,
} from '../types/compOff.types';
const COMP_OFF_BASE_URL = '/api/v1/leaves/comp-off';
interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
}
interface RawCompOffRequest {
  id?: number | string;
  request_id?: number | string;
  requestId?: number | string;
  emp_id?: number | string;
  employee_id?: number | string;
  employeeId?: number | string;
  emp_code?: string | null;
  employee_code?: string | null;
  employeeCode?: string | null;
  employee_name?: string | null;
  employeeName?: string | null;
  worked_date?: string | null;
  workedDate?: string | null;
  day_type?: string | null;
  dayType?: string | null;
  comp_off_date?: string | null;
  compOffDate?: string | null;
  requested_on?: string | null;
  requestedOn?: string | null;
  requested_date?: string | null;
  requestedDate?: string | null;
  createdon?: string | null;
  created_on?: string | null;
  createdAt?: string | null;
  status?: string | null;
  reason?: string | null;
  remarks?: string | null;
  attachment_path?: string | null;
  attachmentPath?: string | null;
  attachment_url?: string | null;
  attachmentUrl?: string | null;
  approved_by?: string | number | null;
  approvedBy?: string | number | null;
  approved_by_name?: string | null;
  approvedByName?: string | null;
  approved_on?: string | null;
  approvedOn?: string | null;
  rejected_by?: string | number | null;
  rejectedBy?: string | number | null;
  rejected_by_name?: string | null;
  rejectedByName?: string | null;
  rejected_on?: string | null;
  rejectedOn?: string | null;
  rejection_reason?: string | null;
  rejectionReason?: string | null;
  quantity?: number | null;
  balance_after?: number | null;
  balanceAfter?: number | null;
}
const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === 'object' &&
    error !== null
  ) {
    const axiosError = error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };
      message?: string;
    };
    return (
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.message ??
      axiosError.message ??
      fallback
    );
  }
  return fallback;
};
/**
 * Converts backend day type values into the frontend enum.
 *
 * Supported backend values:
 * - PublicHoliday
 * - PUBLIC_HOLIDAY
 * - Public Holiday
 * - WeekOff
 * - WEEK_OFF
 * - Week Off
 */
const normalizeDayType = (
  value: unknown,
): CompOffDayType => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[_\-\s]/g, '');
  if (normalized === 'PUBLICHOLIDAY') {
    return 'PUBLIC_HOLIDAY';
  }
  if (normalized === 'WEEKOFF') {
    return 'WEEK_OFF';
  }
  throw new Error(
    `Invalid Comp Off day type received from server: ${String(
      value,
    )}`,
  );
};
const normalizeStatus = (
  value: unknown,
): CompOffStatus => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  if (normalized === 'APPROVED') {
    return 'APPROVED';
  }
  if (normalized === 'REJECTED') {
    return 'REJECTED';
  }
  if (normalized === 'PENDING') {
    return 'PENDING';
  }
  if (normalized === 'APPLIED') {
    return 'APPLIED';
  }
  throw new Error(
    `Invalid Comp Off status received from server: ${String(
      value,
    )}`,
  );
};
const getRequestId = (
  raw: RawCompOffRequest,
): number => {
  const value =
    raw.requestId ??
    raw.request_id ??
    raw.id;
  if (
    value === undefined ||
    value === null
  ) {
    throw new Error(
      'Comp Off request ID is missing from the server response.',
    );
  }
  const requestId =
    typeof value === 'number'
      ? value
      : Number(value);
  if (
    !Number.isInteger(requestId) ||
    requestId <= 0
  ) {
    throw new Error(
      'Comp Off request ID received from the server is invalid.',
    );
  }
  return requestId;
};
const getWorkedDate = (
  raw: RawCompOffRequest,
): string => {
  const value =
    raw.workedDate ??
    raw.worked_date;
  if (!value) {
    throw new Error(
      'Worked date is missing from the Comp Off response.',
    );
  }
  return value;
};
const getRequestedOn = (
  raw: RawCompOffRequest,
): string => {
  const value =
    raw.requestedOn ??
    raw.requested_on ??
    raw.requestedDate ??
    raw.requested_date ??
    raw.createdon ??
    raw.created_on ??
    raw.createdAt;
  if (!value) {
    throw new Error(
      'Requested On date is missing from the Comp Off response.',
    );
  }
  return value;
};
/**
 * Converts backend numeric/string employee IDs
 * into a frontend-safe string representation.
 *
 * null stays null.
 * undefined stays undefined.
 */
const normalizeStringValue = (
  value: string | number | null | undefined,
): string | null | undefined => {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return undefined;
  }
  return String(value);
};
const mapCompOffRequest = (
  raw: RawCompOffRequest,
): CompOffRequest => {
  const requestId = getRequestId(raw);
  const workedDate = getWorkedDate(raw);
  const requestedOn = getRequestedOn(raw);
  const dayType = normalizeDayType(
    raw.dayType ??
      raw.day_type,
  );
  const status = normalizeStatus(
    raw.status,
  );
  return {
    requestId,
    employeeId:
      raw.employeeId ?? raw.employee_id ?? raw.emp_id,
    employeeCode:
      raw.employeeCode ?? raw.employee_code ?? raw.emp_code ?? undefined,
    employeeName:
      raw.employeeName ?? raw.employee_name ?? undefined,
    workedDate,
    dayType,
    reason: raw.reason?.trim() ?? '',
    requestedOn,
    compOffDate:
      raw.compOffDate ?? raw.comp_off_date ?? null,
    status,
    approvedBy: normalizeStringValue(
      raw.approvedBy ?? raw.approved_by,
    ),
    approvedByName:
      raw.approvedByName ?? raw.approved_by_name ?? null,
    approvedOn:
      raw.approvedOn ?? raw.approved_on ?? null,
    rejectedBy: normalizeStringValue(
      raw.rejectedBy ?? raw.rejected_by,
    ),
    rejectedByName:
      raw.rejectedByName ?? raw.rejected_by_name ?? null,
    rejectedOn:
      raw.rejectedOn ?? raw.rejected_on ?? null,
    remarks: raw.remarks ?? null,
    rejectionReason:
      raw.rejectionReason ?? raw.rejection_reason ?? null,
    attachmentUrl:
      raw.attachmentUrl ??
      raw.attachment_url ??
      raw.attachmentPath ??
      raw.attachment_path ??
      null,
    quantity: raw.quantity ?? undefined,
    balanceAfter:
      raw.balanceAfter ?? raw.balance_after ?? null,
  };
};
const extractRawRequests = (
  responseData: unknown,
): RawCompOffRequest[] => {
  if (Array.isArray(responseData)) {
    return responseData as RawCompOffRequest[];
  }
  if (
    typeof responseData !== 'object' ||
    responseData === null
  ) {
    return [];
  }
  const response =
    responseData as {
      data?: unknown;
      items?: unknown;
      requests?: unknown;
      results?: unknown;
    };
  if (Array.isArray(response.requests)) {
    return response.requests as RawCompOffRequest[];
  }
  if (Array.isArray(response.items)) {
    return response.items as RawCompOffRequest[];
  }
  if (Array.isArray(response.results)) {
    return response.results as RawCompOffRequest[];
  }
  if (Array.isArray(response.data)) {
    return response.data as RawCompOffRequest[];
  }
  return [];
};
const extractSingleRequest = (
  responseData: unknown,
): RawCompOffRequest => {
  if (
    typeof responseData === 'object' &&
    responseData !== null
  ) {
    const response =
      responseData as ApiResponse<unknown>;
    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data)
    ) {
      return response.data as RawCompOffRequest;
    }
  }
  return responseData as RawCompOffRequest;
};
export const compOffService = {
  async getMyRequests(): Promise<
    CompOffRequest[]
  > {
    try {
      const response =
        await axiosInstance.get<unknown>(
          `${COMP_OFF_BASE_URL}/my`,
        );
      const rawRequests =
        extractRawRequests(
          response.data,
        );
      return rawRequests.map(
        mapCompOffRequest,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Unable to load your Comp Off requests.',
        ),
      );
    }
  },
  async getAllRequests(): Promise<CompOffRequest[]> {
  try {
    const response =
      await axiosInstance.get<unknown>(
        `${COMP_OFF_BASE_URL}/all`,
      );
    const rawRequests =
      extractRawRequests(
        response.data,
      );
    return rawRequests.map(
      mapCompOffRequest,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Unable to load all Comp Off requests.',
      ),
    );
  }
},
  async getRequest(
    requestId: number,
  ): Promise<CompOffRequest> {
    try {
      const response =
        await axiosInstance.get<unknown>(
          `${COMP_OFF_BASE_URL}/${requestId}`,
        );
      const rawRequest =
        extractSingleRequest(
          response.data,
        );
      return mapCompOffRequest(
        rawRequest,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Unable to load the Comp Off request.',
        ),
      );
    }
  },
  // async approveRequest(
  //   requestId: number,
  //   values: ApproveCompOffRequest,
  // ): Promise<CompOffRequest> {
  //   try {
  //     const response =
  //       await axiosInstance.post<unknown>(
  //         `${COMP_OFF_BASE_URL}/${requestId}/approve`,
  //         {
  //           comp_off_date: values.compOffDate,
  //           remarks: values.remarks?.trim() || null,
  //         },
  //       );
  //     const rawRequest = extractSingleRequest(response.data);
  //     return mapCompOffRequest(rawRequest);
  //   } catch (error) {
  //     throw new Error(
  //       getErrorMessage(error, 'Unable to approve Comp Off request.'),
  //     );
  //   }
  // },
  async approveRequest(
  requestId: number,
): Promise<CompOffRequest> {
  try {
    const response =
      await axiosInstance.put<unknown>(
        `${COMP_OFF_BASE_URL}/${requestId}/approve`,
      );

    const rawRequest =
      extractSingleRequest(response.data);

    return mapCompOffRequest(rawRequest);
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        'Unable to approve Comp Off request.',
      ),
    );
  }
},
  async rejectRequest(
    requestId: number,
    values: RejectCompOffRequest,
  ): Promise<CompOffRequest> {
    try {
      const response =
        await axiosInstance.put<unknown>(
          `${COMP_OFF_BASE_URL}/${requestId}/reject`,
          {
            rejection_reason: values.rejectionReason.trim(),
          },
        );
      const rawRequest = extractSingleRequest(response.data);
      return mapCompOffRequest(rawRequest);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, 'Unable to reject Comp Off request.'),
      );
    }
  },
  async createRequest(
    values: CreateCompOffRequest,
  ): Promise<CompOffRequest> {
    try {
      const formData = new FormData();
      /*
       * Backend DTO uses:
       *
       * worked_date
       * day_type
       * reason
       *
       * Keep the multipart names aligned
       * with the FastAPI contract.
       */
      formData.append(
        'worked_date',
        values.workedDate,
      );
      formData.append(
        'day_type',
        values.dayType,
      );
      formData.append(
        'reason',
        values.reason.trim(),
      );
      if (values.attachment) {
        formData.append(
          'attachment',
          values.attachment,
        );
      }
      const response =
        await axiosInstance.post<unknown>(
          COMP_OFF_BASE_URL,
          formData,
        );
      const rawRequest =
        extractSingleRequest(
          response.data,
        );
      return mapCompOffRequest(
        rawRequest,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          'Unable to submit Comp Off request.',
        ),
      );
    }
  },
};
export default compOffService;
