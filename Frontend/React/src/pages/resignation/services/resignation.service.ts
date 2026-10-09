// ============================================================
// RESIGNATION SERVICE
// ============================================================

import axios from "axios";

import axiosInstance from "../../../services/axios/axiosInstance";

import { RESIGNATION_API_ENDPOINTS } from "../constants/resignation.constants";

import {
  Resignation,
  ResignationReason,
  ResignationStatus,
} from "../types/resignation.types";

// ============================================================
// BACKEND EMPLOYEE RESPONSE
// ============================================================

interface BackendResignationEmployee {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  emp_code?: string | null;
}

// ============================================================
// BACKEND RESPONSE
// ============================================================

interface BackendResignation {
  id: number;
  emp_id: number;

  employee?: BackendResignationEmployee | null;

  reason?: string | null;
  is_resignation?: number | null;
  is_termination?: number | null;
  from_date?: string | null;
  notice_period?: number | null;
  hr_status?: number | null;
  promoter_status?: number | null;
  createdon?: string | null;
}

// ============================================================
// CREATE PAYLOAD
// ============================================================

interface CreateResignationPayload {
  emp_id: number;
  reason: string;
  is_resignation: number;
  is_termination: number;
  from_date: string;
  notice_period: number;
}

// ============================================================
// UPDATE PAYLOAD
// ============================================================

interface UpdateResignationPayload {
  reason?: string;
  from_date?: string;
  notice_period?: number;
  hr_status?: number;
  promoter_status?: number;
}

// ============================================================
// LIST RESPONSE
// ============================================================

interface ResignationListResponse {
  data: Resignation[];
  total: number;
}

// ============================================================
// API BASE URL
// ============================================================

const RESIGNATION_API_BASE_URL =
  import.meta.env.VITE_RESIGNATION_API_BASE_URL ||
  "http://192.168.1.5:8001/api/v1/resignation";

// ============================================================
// BUILD API URL
// ============================================================

const buildUrl = (endpoint: string): string => {
  const baseUrl =
    RESIGNATION_API_BASE_URL.replace(/\/$/, "");

  const cleanEndpoint =
    endpoint.replace(/^\//, "");

  return `${baseUrl}/${cleanEndpoint}`;
};

// ============================================================
// GET CURRENT EMPLOYEE ID
// ============================================================

// const getEmployeeId = (): number => {
//   const possibleKeys = [
//     "employeeId",
//     "employee_id",
//     "empId",
//     "emp_id",
//   ];

//   for (const key of possibleKeys) {
//     const value =
//       localStorage.getItem(key);

//     if (!value) {
//       continue;
//     }

//     const employeeId = Number(value);

//     if (
//       Number.isInteger(employeeId) &&
//       employeeId > 0
//     ) {
//       return employeeId;
//     }
//   }

//   const possibleUserKeys = [
//     "user",
//     "currentUser",
//     "userData",
//     "authUser",
//   ];

//   for (const key of possibleUserKeys) {
//     const rawValue =
//       localStorage.getItem(key);

//     if (!rawValue) {
//       continue;
//     }

//     try {
//       const parsed =
//         JSON.parse(rawValue);

//       const possibleIds = [
//         parsed?.emp_id,
//         parsed?.employee_id,
//         parsed?.employeeId,
//         parsed?.empId,
//         parsed?.user?.emp_id,
//         parsed?.user?.employee_id,
//         parsed?.user?.employeeId,
//         parsed?.user?.empId,
//       ];

//       for (const id of possibleIds) {
//         const employeeId = Number(id);

//         if (
//           Number.isInteger(employeeId) &&
//           employeeId > 0
//         ) {
//           return employeeId;
//         }
//       }
//     } catch {
//       // Continue checking other keys.
//     }
//   }

//   throw new Error(
//     "Employee ID was not found. Please login again."
//   );
// };

// ============================================================
// STATUS MAPPING
// ============================================================

const getStatus = (
  hrStatus: number | null | undefined,
  promoterStatus: number | null | undefined
): ResignationStatus => {
  if (
    hrStatus === 2 ||
    promoterStatus === 2
  ) {
    return "Rejected";
  }

  if (
    hrStatus === 1 &&
    promoterStatus === 1
  ) {
    return "Approved";
  }

  if (promoterStatus === 1) {
    return "Pending HR Approval";
  }

  if (hrStatus === 1) {
    return "Pending RM Approval";
  }

  return "Pending";
};

// ============================================================
// REASON MAPPING
// ============================================================

const getReason = (
  reason: string | null | undefined
): ResignationReason => {
  const actualReason =
    reason?.trim();

  if (!actualReason) {
    return "Other";
  }

  return actualReason as ResignationReason;
};

// ============================================================
// CALCULATE LAST WORKING DATE
// ============================================================

const calculateLastWorkingDate = (
  fromDate: string | null | undefined,
  noticePeriod: number
): string => {
  if (!fromDate) {
    return "";
  }

  const date =
    new Date(fromDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  date.setDate(
    date.getDate() + noticePeriod
  );

  return date
    .toISOString()
    .split("T")[0];
};

// ============================================================
// GET EMPLOYEE FULL NAME
// ============================================================

const getEmployeeFullName = (
  employee: BackendResignationEmployee | null | undefined,
  empId: number
): string => {
  // ----------------------------------------------------------
  // Use backend full_name first
  // ----------------------------------------------------------

  if (
    employee?.full_name &&
    employee.full_name.trim()
  ) {
    return employee.full_name.trim();
  }

  // ----------------------------------------------------------
  // Fallback: first_name + last_name
  // ----------------------------------------------------------

  const fullName = [
    employee?.first_name,
    employee?.last_name,
  ]
    .filter(
      (name) =>
        name &&
        name.trim()
    )
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  // ----------------------------------------------------------
  // Final fallback
  // ----------------------------------------------------------

  return `Employee ${empId}`;
};

// ============================================================
// MAP BACKEND RESPONSE TO FRONTEND MODEL
// ============================================================

const mapBackendResignation = (
  item: BackendResignation
): Resignation => {
  // ----------------------------------------------------------
  // Resignation Date
  // ----------------------------------------------------------

  const resignationDate =
    item.from_date
      ? item.from_date.split("T")[0]
      : "";

  // ----------------------------------------------------------
  // Notice Period
  // ----------------------------------------------------------

  const noticePeriod =
    item.notice_period ?? 0;

  // ----------------------------------------------------------
  // Last Working Date
  // ----------------------------------------------------------

  const lastWorkingDate =
    calculateLastWorkingDate(
      item.from_date,
      noticePeriod
    );

  // ----------------------------------------------------------
  // Status
  // ----------------------------------------------------------

  const status =
    getStatus(
      item.hr_status,
      item.promoter_status
    );

  // ----------------------------------------------------------
  // Actual Reason
  // ----------------------------------------------------------

  const actualReason =
    item.reason?.trim() || "Other";

  // ----------------------------------------------------------
  // Created Date
  // ----------------------------------------------------------

  const createdAt =
    item.createdon ??
    item.from_date ??
    "";

  // ----------------------------------------------------------
  // Employee Name
  // ----------------------------------------------------------

  const employeeName =
    getEmployeeFullName(
      item.employee,
      item.emp_id
    );

  // ----------------------------------------------------------
  // Return frontend object
  // ----------------------------------------------------------

  return {
    // --------------------------------------------------------
    // Resignation ID
    // --------------------------------------------------------

    id: String(item.id),

    // --------------------------------------------------------
    // Employee
    // --------------------------------------------------------

    employee: {
      id: String(item.emp_id),

      fullName: employeeName,

      designation: "",

      department: "",

      avatarUrl: "",
    },

    // --------------------------------------------------------
    // Dates
    // --------------------------------------------------------

    resignationDate,

    lastWorkingDate,

    // --------------------------------------------------------
    // Reason
    // --------------------------------------------------------

    reason:
      getReason(item.reason),

    details:
      actualReason,

    // --------------------------------------------------------
    // Status
    // --------------------------------------------------------

    status,

    // --------------------------------------------------------
    // Approval Information
    // --------------------------------------------------------

    approvals: [
      {
        approverId: "hr",

        approverName: "HR",

        status:
          item.hr_status === 1
            ? "Approved"
            : item.hr_status === 2
              ? "Rejected"
              : "Pending",

        timestamp:
          item.createdon ??
          undefined,
      },

      {
        approverId: "promoter",

        approverName: "Promoter",

        status:
          item.promoter_status === 1
            ? "Approved"
            : item.promoter_status === 2
              ? "Rejected"
              : "Pending",

        timestamp:
          item.createdon ??
          undefined,
      },
    ],

    // --------------------------------------------------------
    // Attachment
    // --------------------------------------------------------

    attachmentUrl:
      undefined,

    // --------------------------------------------------------
    // Created / Updated
    // --------------------------------------------------------

    createdAt,

    updatedAt:
      createdAt,
  };
};

// ============================================================
// API ERROR HANDLER
// ============================================================

const handleApiError = (
  error: unknown,
  defaultMessage: string
): never => {
  // ----------------------------------------------------------
  // Axios error
  // ----------------------------------------------------------

  if (
    axios.isAxiosError(error)
  ) {
    // --------------------------------------------------------
    // Server responded
    // --------------------------------------------------------

    if (error.response) {
      const responseData =
        error.response.data;

      let detail =
        defaultMessage;

      if (
        typeof responseData?.detail ===
        "string"
      ) {
        detail =
          responseData.detail;
      } else if (
        typeof responseData ===
        "string"
      ) {
        detail =
          responseData;
      }

      throw new Error(detail);
    }

    // --------------------------------------------------------
    // Request was sent but no response
    // --------------------------------------------------------

    if (error.request) {
      throw new Error(
        "Unable to connect to the resignation server. Please check that the backend is running at http://192.168.1.5:8001."
      );
    }
  }

  // ----------------------------------------------------------
  // Normal Error
  // ----------------------------------------------------------

  if (
    error instanceof Error
  ) {
    throw error;
  }

  throw new Error(
    defaultMessage
  );
};

// ============================================================
// RESIGNATION SERVICE
// ============================================================

const ResignationService = {

  // ==========================================================
  // GET ALL RESIGNATIONS
  // ==========================================================

  async getResignations(
    _page = 1,
    _pageSize = 10,
    _filters?: unknown,
    _sortBy = "createdAt",
    _sortDirection = "desc"
  ): Promise<ResignationListResponse> {

    try {
      const endpoint =
        RESIGNATION_API_ENDPOINTS.GET_ALL;

      const url =
        buildUrl(endpoint);

      console.log(
        "GET Resignations:",
        url
      );

      const response =
        await axiosInstance.get<
          BackendResignation[]
        >(url);

      console.log(
        "Resignation API Response:",
        response.data
      );

      const backendData =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      const data =
        backendData.map(
          mapBackendResignation
        );

      return {
        data,
        total:
          data.length,
      };

    } catch (error) {

      return handleApiError(
        error,
        "Failed to load resignation requests."
      );
    }
  },

  // ==========================================================
  // GET RESIGNATION BY ID
  // ==========================================================

  async getResignationById(
    id: string
  ): Promise<Resignation> {

    try {
      const endpoint =
        RESIGNATION_API_ENDPOINTS.GET_BY_ID.replace(
          ":id",
          id
        );

      const url =
        buildUrl(endpoint);

      console.log(
        "GET Resignation:",
        url
      );

      const response =
        await axiosInstance.get<
          BackendResignation
        >(url);

      return mapBackendResignation(
        response.data
      );

    } catch (error) {

      return handleApiError(
        error,
        "Failed to load resignation request."
      );
    }
  },

  // ==========================================================
  // CREATE RESIGNATION
  // ==========================================================

  async createResignation(
    payload: CreateResignationPayload
  ): Promise<Resignation> {

    try {

      // ------------------------------------------------------
      // Employee ID
      // ------------------------------------------------------

      const employeeId =
        Number(
          payload.emp_id
        );

      if (
        !Number.isInteger(
          employeeId
        ) ||
        employeeId <= 0
      ) {
        throw new Error(
          "Invalid employee ID."
        );
      }

      // ------------------------------------------------------
      // Reason
      // ------------------------------------------------------

      if (
        !payload.reason ||
        !payload.reason.trim()
      ) {
        throw new Error(
          "Resignation reason is required."
        );
      }

      // ------------------------------------------------------
      // From Date
      // ------------------------------------------------------

      if (
        !payload.from_date
      ) {
        throw new Error(
          "Resignation from date is required."
        );
      }

      const fromDate =
        new Date(
          payload.from_date
        );

      if (
        Number.isNaN(
          fromDate.getTime()
        )
      ) {
        throw new Error(
          "Invalid resignation from date."
        );
      }

      // ------------------------------------------------------
      // Notice Period
      // ------------------------------------------------------

      const noticePeriod =
        Number(
          payload.notice_period
        );

      if (
        !Number.isInteger(
          noticePeriod
        ) ||
        noticePeriod < 0
      ) {
        throw new Error(
          "Invalid notice period."
        );
      }

      // ------------------------------------------------------
      // Final Backend Payload
      // ------------------------------------------------------

      const requestData:
        CreateResignationPayload =
        {
          emp_id:
            employeeId,

          reason:
            payload.reason.trim(),

          is_resignation:
            payload.is_resignation ??
            1,

          is_termination:
            payload.is_termination ??
            0,

          from_date:
            fromDate.toISOString(),

          notice_period:
            noticePeriod,
        };

      console.log(
        "POST Resignation:",
        requestData
      );

      // ------------------------------------------------------
      // POST
      // ------------------------------------------------------

      const response =
        await axiosInstance.post<
          BackendResignation
        >(
          buildUrl(
            RESIGNATION_API_ENDPOINTS.CREATE
          ),
          requestData
        );

      return mapBackendResignation(
        response.data
      );

    } catch (error) {

      return handleApiError(
        error,
        "Failed to submit resignation request."
      );
    }
  },

  // ==========================================================
  // UPDATE RESIGNATION
  // ==========================================================

  async updateResignation(
    id: string,
    payload: {
      reason?: string;

      fromDate?: string;

      from_date?: string;

      resignationDate?: string;

      noticePeriod?: number | string;

      notice_period?: number | string;

      hr_status?: number;

      promoter_status?: number;

      hrStatus?: number;

      promoterStatus?: number;
    }
  ): Promise<Resignation> {

    try {

      const endpoint =
        RESIGNATION_API_ENDPOINTS.UPDATE.replace(
          ":id",
          id
        );

      const requestData:
        UpdateResignationPayload =
        {};

      // ------------------------------------------------------
      // Reason
      // ------------------------------------------------------

      if (
        payload.reason !==
        undefined
      ) {
        requestData.reason =
          payload.reason.trim();
      }

      // ------------------------------------------------------
      // From Date
      // ------------------------------------------------------

      const fromDate =
        payload.from_date ??
        payload.fromDate ??
        payload.resignationDate;

      if (
        fromDate !==
        undefined
      ) {

        const parsedDate =
          new Date(
            fromDate
          );

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          throw new Error(
            "Invalid resignation from date."
          );
        }

        requestData.from_date =
          parsedDate.toISOString();
      }

      // ------------------------------------------------------
      // Notice Period
      // ------------------------------------------------------

      const noticePeriodValue =
        payload.notice_period ??
        payload.noticePeriod;

      if (
        noticePeriodValue !==
        undefined
      ) {

        const noticePeriod =
          Number(
            noticePeriodValue
          );

        if (
          !Number.isInteger(
            noticePeriod
          ) ||
          noticePeriod < 0
        ) {
          throw new Error(
            "Invalid notice period."
          );
        }

        requestData.notice_period =
          noticePeriod;
      }

      // ------------------------------------------------------
      // HR Status
      // ------------------------------------------------------

      if (
        payload.hr_status !==
        undefined
      ) {

        requestData.hr_status =
          payload.hr_status;

      } else if (
        payload.hrStatus !==
        undefined
      ) {

        requestData.hr_status =
          payload.hrStatus;
      }

      // ------------------------------------------------------
      // Promoter Status
      // ------------------------------------------------------

      if (
        payload.promoter_status !==
        undefined
      ) {

        requestData.promoter_status =
          payload.promoter_status;

      } else if (
        payload.promoterStatus !==
        undefined
      ) {

        requestData.promoter_status =
          payload.promoterStatus;
      }

      console.log(
        `PUT Resignation ${id}:`,
        requestData
      );

      // ------------------------------------------------------
      // PUT
      // ------------------------------------------------------

      const response =
        await axiosInstance.put<
          BackendResignation
        >(
          buildUrl(endpoint),
          requestData
        );

      return mapBackendResignation(
        response.data
      );

    } catch (error) {

      return handleApiError(
        error,
        "Failed to update resignation request."
      );
    }
  },

  // ==========================================================
  // DELETE RESIGNATION
  // ==========================================================

  async deleteResignation(
    id: string
  ): Promise<void> {

    try {

      const endpoint =
        RESIGNATION_API_ENDPOINTS.DELETE.replace(
          ":id",
          id
        );

      console.log(
        `DELETE Resignation ${id}`
      );

      await axiosInstance.delete(
        buildUrl(endpoint)
      );

    } catch (error) {

      return handleApiError(
        error,
        "Failed to delete resignation request."
      );
    }
  },

  // ==========================================================
  // APPROVE RESIGNATION
  // ==========================================================

  async approveResignation(
    id: string,
    approverId?: string,
    notes?: string
  ): Promise<Resignation> {

    void approverId;
    void notes;

    return this.updateResignation(
      id,
      {
        hr_status: 1,
      }
    );
  },

  // ==========================================================
  // REJECT RESIGNATION
  // ==========================================================

  async rejectResignation(
    id: string,
    approverId?: string,
    reason?: string
  ): Promise<Resignation> {

    void approverId;
    void reason;

    return this.updateResignation(
      id,
      {
        hr_status: 2,
      }
    );
  },

  // ==========================================================
  // WITHDRAW RESIGNATION
  // ==========================================================

  async withdrawResignation(
    _id: string
  ): Promise<Resignation> {

    throw new Error(
      "Withdraw resignation API is not available in the current backend."
    );
  },

  // ==========================================================
  // DASHBOARD STATISTICS
  // ==========================================================

  async getDashboardStatistics() {

    try {

      const response =
        await axiosInstance.get<
          BackendResignation[]
        >(
          buildUrl(
            RESIGNATION_API_ENDPOINTS.GET_ALL
          )
        );

      const data =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      // ------------------------------------------------------
      // Rejected
      // ------------------------------------------------------

      const rejected =
        data.filter(
          (item) =>
            item.hr_status === 2 ||
            item.promoter_status === 2
        ).length;

      // ------------------------------------------------------
      // Approved
      // ------------------------------------------------------

      const approved =
        data.filter(
          (item) =>
            item.hr_status === 1 &&
            item.promoter_status === 1
        ).length;

      // ------------------------------------------------------
      // Pending
      // ------------------------------------------------------

      const pending =
        data.filter(
          (item) =>
            !(
              item.hr_status === 2 ||
              item.promoter_status === 2
            ) &&
            !(
              item.hr_status === 1 &&
              item.promoter_status === 1
            )
        ).length;

      return {
        totalRequests:
          data.length,

        pending,

        approved,

        rejected,
      };

    } catch (error) {

      return handleApiError(
        error,
        "Failed to load resignation statistics."
      );
    }
  },

  // ==========================================================
  // GET DEPARTMENTS
  // ==========================================================

  async getDepartments(): Promise<
    string[]
  > {

    return [];
  },

  // ==========================================================
  // DOWNLOAD ATTACHMENT
  // ==========================================================

  async downloadAttachment(
    _id: string
  ): Promise<Blob> {

    throw new Error(
      "Attachment download API is not available in the current backend."
    );
  },

  // ==========================================================
  // UPLOAD ATTACHMENT
  // ==========================================================

  async uploadAttachment(
    _id: string,
    _file: File
  ): Promise<unknown> {

    throw new Error(
      "Attachment upload API is not available in the current backend."
    );
  },
};

export default ResignationService;