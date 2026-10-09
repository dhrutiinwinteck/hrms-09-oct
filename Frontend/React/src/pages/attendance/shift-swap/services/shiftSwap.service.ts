import axiosInstance from '../../../../services/axios/axiosInstance';

import type {
  CreateShiftSwapRequest,
  EligibleEmployeeApiResponse,
  EligibleEmployeesResponse,
  Employee,
  ShiftState,
  ShiftStateApiResponse,
  ShiftSwapActionApiResponse,
  ShiftSwapApiResponse,
  ShiftSwapRequest,
  ShiftSwapRequestType,
  ShiftSwapStatus,
} from '../types/shiftSwap.types';

const SHIFT_SWAP_ENDPOINT =
  '/api/v1/shift-swaps';

/* ============================================================
   ERROR HANDLER
============================================================ */

const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      }
    ).response;

    const detail =
      response?.data?.detail ??
      response?.data?.message;

    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

/* ============================================================
   DATE FORMAT
============================================================ */

const formatDisplayDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return '';
  }

  const directIsoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );

  if (directIsoMatch) {
    return `${directIsoMatch[3]}-${directIsoMatch[2]}-${directIsoMatch[1]}`;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  const day = String(
    parsedDate.getDate(),
  ).padStart(2, '0');

  const month = parsedDate.toLocaleString(
    'en-US',
    {
      month: 'short',
    },
  );

  const year = parsedDate.getFullYear();

  return `${day} ${month} ${year}`;
};

/* ============================================================
   REQUEST TYPE
============================================================ */

const mapRequestType = (
  value: string,
): ShiftSwapRequestType => {
  if (value === 'SpecificDay') {
    return 'Specific Day';
  }

  return 'Specific Day';
};

/* ============================================================
   STATUS
============================================================ */

const mapStatus = (
  value: string,
): ShiftSwapStatus => {
  switch (value) {
    case 'PendingTargetAcceptance':
      return 'PendingTargetAcceptance';

    case 'PendingManagerApproval':
      return 'PendingManagerApproval';

    case 'Approved':
      return 'Approved';

    case 'Rejected':
      return 'Rejected';

    default:
      return 'Rejected';
  }
};

/* ============================================================
   EMPLOYEE MAPPER
============================================================ */

const mapEmployee = (
  employee: EligibleEmployeeApiResponse,
): Employee => {
  return {
    id: String(employee.employee_id),

    name:
      employee.employee_name ||
      'Unknown Employee',

    designation:
      employee.employee_code
        ? employee.employee_code
        : 'Employee',

    employeeCode:
      employee.employee_code ??
      undefined,

    swapDate:
      employee.swap_date,

    dayOfWeek:
      employee.day_of_week,

    isWeekOff:
      employee.is_week_off,

    isLeave:
      employee.is_leave,

    hasShiftDateRecord:
      employee.has_shift_date_record,
  };
};

/* ============================================================
   SHIFT STATE MAPPER
============================================================ */

const mapShiftState = (
  value:
    | ShiftStateApiResponse
    | null
    | undefined,
): ShiftState | null => {
  if (!value) {
    return null;
  }

  return {
    employeeId:
      String(value.employee_id),

    swapDate:
      value.swap_date,

    patternId:
      value.pattern_id !== null &&
      value.pattern_id !== undefined
        ? String(value.pattern_id)
        : null,

    isWeekOff:
      value.is_week_off,

    isLeave:
      value.is_leave,

    dayOfWeek:
      value.day_of_week ??
      undefined,
  };
};

/* ============================================================
   REQUEST MAPPER
============================================================ */

const mapRequest = (
  value: ShiftSwapApiResponse,
): ShiftSwapRequest => {
  const requestedBy: Employee = {
    id: String(
      value.requested_by_emp_id,
    ),

    name:
      value.requested_by_name ||
      'Unknown Employee',

    designation:
      'Employee',
  };

  const requestedTo: Employee = {
    id: String(
      value.requested_to_emp_id,
    ),

    name:
      value.requested_to_name ||
      'Unknown Employee',

    designation:
      'Employee',
  };

  return {
    id: String(
      value.swap_requested_id,
    ),

    requestedBy,

    requestedTo,

    requestType:
      mapRequestType(
        value.request_type,
      ),

    requestedOn:
      formatDisplayDate(
        value.created_date,
      ),

    swapDate:
      formatDisplayDate(
        value.swap_date,
      ),

    status:
      mapStatus(value.status),

    reportingManagerId:
      value.reporting_manager_id !==
        null &&
      value.reporting_manager_id !==
        undefined
        ? String(
            value.reporting_manager_id,
          )
        : null,

    reportingManagerName:
      value.reporting_manager_name ??
      null,

    approvedBy:
      value.approved_by ??
      null,

    approvedOn:
      value.approved_on
        ? formatDisplayDate(
            value.approved_on,
          )
        : null,

    requesterShift:
      mapShiftState(
        value.requester_shift,
      ),

    targetShift:
      mapShiftState(
        value.target_shift,
      ),
  };
};

/* ============================================================
   GET ELIGIBLE EMPLOYEES
============================================================ */

export const getShiftSwapEmployees =
  async (
    swapDate: string,
  ): Promise<Employee[]> => {
    if (!swapDate) {
      return [];
    }

    try {
      const response =
        await axiosInstance.get<EligibleEmployeesResponse>(
          `${SHIFT_SWAP_ENDPOINT}/eligible-employees`,
          {
            params: {
              swap_date: swapDate,
            },
          },
        );

      return (
        response.data?.employees ??
        []
      ).map(mapEmployee);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to load eligible employees.',
        ),
      );
    }
  };

/* ============================================================
   GET ALL REQUESTS
============================================================ */

export const getShiftSwapRequests =
  async (): Promise<ShiftSwapRequest[]> => {
    try {
      const response =
        await axiosInstance.get<
          ShiftSwapApiResponse[]
        >(SHIFT_SWAP_ENDPOINT);

      return (
        response.data ?? []
      ).map(mapRequest);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to load shift swap requests.',
        ),
      );
    }
  };

/* ============================================================
   GET MY REQUESTS
============================================================ */

export const getMyShiftSwapRequests =
  async (): Promise<ShiftSwapRequest[]> => {
    try {
      const response =
        await axiosInstance.get<
          ShiftSwapApiResponse[]
        >(
          `${SHIFT_SWAP_ENDPOINT}/my`,
        );

      return (
        response.data ?? []
      ).map(mapRequest);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to load your shift swap requests.',
        ),
      );
    }
  };

/* ============================================================
   GET REQUEST DETAILS
============================================================ */

export const getShiftSwapRequest =
  async (
    requestId: string,
  ): Promise<ShiftSwapRequest> => {
    try {
      const response =
        await axiosInstance.get<ShiftSwapApiResponse>(
          `${SHIFT_SWAP_ENDPOINT}/${requestId}`,
        );

      return mapRequest(
        response.data,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to load shift swap request details.',
        ),
      );
    }
  };

/* ============================================================
   CREATE REQUEST
============================================================ */

export const createShiftSwapRequest =
  async (
    payload: CreateShiftSwapRequest,
  ): Promise<ShiftSwapRequest> => {
    try {
      const response =
        await axiosInstance.post<ShiftSwapApiResponse>(
          SHIFT_SWAP_ENDPOINT,
          {
            requested_to_emp_id:
              Number(
                payload.requestedToId,
              ),

            request_type:
              'SpecificDay',

            swap_date:
              payload.swapDate,
          },
        );

      return mapRequest(
        response.data,
      );
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to create shift swap request.',
        ),
      );
    }
  };

/* ============================================================
   ACCEPT REQUEST
============================================================ */

export const acceptShiftSwapRequest =
  async (
    requestId: string,
  ): Promise<ShiftSwapActionApiResponse> => {
    try {
      const response =
        await axiosInstance.post<ShiftSwapActionApiResponse>(
          `${SHIFT_SWAP_ENDPOINT}/${requestId}/accept`,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to accept shift swap request.',
        ),
      );
    }
  };

/* ============================================================
   TARGET REJECT
============================================================ */

export const rejectShiftSwapRequest =
  async (
    requestId: string,
  ): Promise<ShiftSwapActionApiResponse> => {
    try {
      const response =
        await axiosInstance.post<ShiftSwapActionApiResponse>(
          `${SHIFT_SWAP_ENDPOINT}/${requestId}/reject`,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to reject shift swap request.',
        ),
      );
    }
  };

/* ============================================================
   MANAGER APPROVE
============================================================ */

export const approveShiftSwapRequest =
  async (
    requestId: string,
  ): Promise<ShiftSwapActionApiResponse> => {
    try {
      const response =
        await axiosInstance.post<ShiftSwapActionApiResponse>(
          `${SHIFT_SWAP_ENDPOINT}/${requestId}/approve`,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to approve shift swap request.',
        ),
      );
    }
  };

/* ============================================================
   MANAGER REJECT
============================================================ */

export const managerRejectShiftSwapRequest =
  async (
    requestId: string,
  ): Promise<ShiftSwapActionApiResponse> => {
    try {
      const response =
        await axiosInstance.post<ShiftSwapActionApiResponse>(
          `${SHIFT_SWAP_ENDPOINT}/${requestId}/manager-reject`,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to reject shift swap request as manager.',
        ),
      );
    }
  };