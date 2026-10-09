import axiosInstance from "../../../services/axios/axiosInstance";

import { LEAVE_ENDPOINTS, getLeaveStatus } from "../constants/leave.constants";

import type {
  ApproveLeaveRequest,
  CreateLeaveRequest,
  Employee,
  LeaveBalance,
  LeaveBalanceCreateRequest,
  LeaveBalanceUpdateRequest,
  LeaveEmployeeRecord,
  LeaveLog,
  RejectLeaveRequest,
  UpdateLeaveRequest,
  LeaveSetting,
  LeaveSettingUpdateRequest,
} from "../types/leave.types";

// ============================================================
// API RESPONSE HELPERS
// ============================================================

const getResponseData = <T>(data: unknown): T => {
  /*
   * Supports:
   *
   * 1. Direct response:
   *    [...]
   *
   * 2. Wrapped response:
   *    { data: [...] }
   *
   * 3. Wrapped response:
   *    { items: [...] }
   *
   * 4. Wrapped response:
   *    { results: [...] }
   */

  if (data && typeof data === "object") {
    const objectData = data as Record<string, unknown>;

    if ("data" in objectData) {
      return objectData.data as T;
    }

    if ("items" in objectData) {
      return objectData.items as T;
    }

    if ("results" in objectData) {
      return objectData.results as T;
    }
  }

  return data as T;
};

// ============================================================
// ERROR HANDLER
// ============================================================

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      }
    ).response;

    const data = response?.data;

    if (data && typeof data === "object") {
      const apiData = data as Record<string, unknown>;

      // ----------------------------------------------
      // detail: string
      // ----------------------------------------------

      if (typeof apiData.detail === "string") {
        return apiData.detail;
      }

      // ----------------------------------------------
      // message: string
      // ----------------------------------------------

      if (typeof apiData.message === "string") {
        return apiData.message;
      }

      // ----------------------------------------------
      // detail: validation error array
      // ----------------------------------------------

      if (Array.isArray(apiData.detail)) {
        const messages = apiData.detail
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              const validationError = item as Record<string, unknown>;

              if (typeof validationError.msg === "string") {
                return validationError.msg;
              }
            }

            if (typeof item === "string") {
              return item;
            }

            return "";
          })
          .filter(Boolean);

        if (messages.length > 0) {
          return messages.join(", ");
        }
      }
    }

    if (response?.status) {
      return `${fallback} (HTTP ${response.status})`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

// ============================================================
// NORMALIZE EMPLOYEE RESPONSE
// ============================================================

const normalizeEmployee = (rawEmployee: Record<string, unknown>): Employee => {
  /*
   * IMPORTANT:
   *
   * Leave logs use:
   *     emp_code = "IWT68"
   *
   * Therefore emp_code MUST be preferred over employeeId.
   *
   * Some employee APIs use employeeId for the numeric
   * employee/database ID, while emp_code is the actual
   * employee code used by leave_log.
   */

  const employeeId = String(
    rawEmployee.emp_code ??
      rawEmployee.empCode ??
      rawEmployee.employee_code ??
      rawEmployee.employeeCode ??
      rawEmployee.employeeId ??
      rawEmployee.employee_id ??
      rawEmployee.code ??
      rawEmployee.id ??
      "",
  ).trim();

  // --------------------------------------------------------
  // NAME
  // --------------------------------------------------------

  const firstName = String(
    rawEmployee.first_name ?? rawEmployee.firstName ?? "",
  ).trim();

  const lastName = String(
    rawEmployee.last_name ?? rawEmployee.lastName ?? "",
  ).trim();

  const combinedName = `${firstName} ${lastName}`.trim();

  const name = String(
    rawEmployee.name ??
      rawEmployee.full_name ??
      rawEmployee.fullName ??
      rawEmployee.employee_name ??
      rawEmployee.employeeName ??
      combinedName ??
      "",
  ).trim();

  // --------------------------------------------------------
  // STATUS
  // --------------------------------------------------------

  const statusValue = String(rawEmployee.status ?? "Active").trim();

  const normalizedStatus = statusValue.toLowerCase();

  let status: "Active" | "Inactive" | "On Leave" = "Active";

  if (normalizedStatus.includes("inactive")) {
    status = "Inactive";
  } else if (normalizedStatus.includes("leave")) {
    status = "On Leave";
  }

  // --------------------------------------------------------
  // RETURN NORMALIZED EMPLOYEE
  // --------------------------------------------------------

  return {
    id: Number(rawEmployee.id ?? rawEmployee.employee_id ?? 0),

    employeeId,

    name,

    designation: String(
      rawEmployee.designation ?? rawEmployee.designation_name ?? "",
    ).trim(),

    department: String(
      rawEmployee.department ?? rawEmployee.department_name ?? "",
    ).trim(),

    email: String(rawEmployee.email ?? rawEmployee.email_id ?? "").trim(),

    phone: String(
      rawEmployee.phone ?? rawEmployee.mobile ?? rawEmployee.mobile_no ?? "",
    ).trim(),

    joiningDate: String(
      rawEmployee.joiningDate ?? rawEmployee.joining_date ?? "",
    ).trim(),

    status,

    gender:
      rawEmployee.gender === "Female"
        ? "Female"
        : rawEmployee.gender === "Other"
          ? "Other"
          : "Male",

    avatar: String(
      rawEmployee.avatar ??
        rawEmployee.photo ??
        rawEmployee.profile_photo ??
        "",
    ).trim(),
  };
};

// ============================================================
// NORMALIZE LEAVE LOG
// ============================================================

const normalizeLeaveLog = (rawLeave: Record<string, unknown>): LeaveLog => {
  return {
    id: Number(rawLeave.id ?? 0),

    emp_id: Number(rawLeave.emp_id ?? 0),

    emp_code:
      rawLeave.emp_code != null ? String(rawLeave.emp_code).trim() : null,

    leave_from:
      rawLeave.leave_from != null ? String(rawLeave.leave_from) : null,

    leave_to: rawLeave.leave_to != null ? String(rawLeave.leave_to) : null,

    leave_reason:
      rawLeave.leave_reason != null ? String(rawLeave.leave_reason) : null,

    status: Number(rawLeave.status ?? 0),

    approved_by:
      rawLeave.approved_by != null ? Number(rawLeave.approved_by) : null,

    approved_on:
      rawLeave.approved_on != null ? String(rawLeave.approved_on) : null,

    createdby: rawLeave.createdby != null ? String(rawLeave.createdby) : null,

    createdon: rawLeave.createdon != null ? String(rawLeave.createdon) : null,

    modifiedby:
      rawLeave.modifiedby != null ? String(rawLeave.modifiedby) : null,

    modifiedon:
      rawLeave.modifiedon != null ? String(rawLeave.modifiedon) : null,

    leave_type:
      rawLeave.leave_type != null ? String(rawLeave.leave_type) : null,

    no_of_days:
      rawLeave.no_of_days != null ? Number(rawLeave.no_of_days) : null,

    half_day_from:
      rawLeave.half_day_from != null ? String(rawLeave.half_day_from) : null,

    half_day_to:
      rawLeave.half_day_to != null ? String(rawLeave.half_day_to) : null,
  };
};

// ============================================================
// MAP LEAVE LOG TO EMPLOYEE RECORD
// ============================================================

const mapEmployeeRecord = (
  employee: Employee,
  leave: LeaveLog,
): LeaveEmployeeRecord => {
  return {
    ...employee,

    // --------------------------------------------------------
    // Leave dates
    // --------------------------------------------------------

    from: leave.leave_from ? leave.leave_from.substring(0, 10) : "",

    to: leave.leave_to ? leave.leave_to.substring(0, 10) : "",

    // --------------------------------------------------------
    // Leave details
    // --------------------------------------------------------

    noOfDays: Number(leave.no_of_days ?? 0),

    leaveType: leave.leave_type ?? "",

    reason: leave.leave_reason ?? "",

    // --------------------------------------------------------
    // Existing frontend status
    // --------------------------------------------------------

    leaveStatus: getLeaveStatus(leave.status),

    // --------------------------------------------------------
    // IMPORTANT:
    // Actual leave_log ID
    // Used when editing the leave.
    // --------------------------------------------------------

    leaveId: leave.id,

    // --------------------------------------------------------
    // Backend leave information
    // --------------------------------------------------------

    leaveEmployeeId: leave.emp_id,

    leaveEmployeeCode: leave.emp_code,

    leaveStatusCode: leave.status,

    approvedBy: leave.approved_by,

    approvedOn: leave.approved_on,

    createdBy: leave.createdby,

    createdOn: leave.createdon,

    modifiedBy: leave.modifiedby,

    modifiedOn: leave.modifiedon,

    halfDayFrom: leave.half_day_from,

    halfDayTo: leave.half_day_to,
  };
};

// ============================================================
// CREATE FALLBACK EMPLOYEE FROM LEAVE
// ============================================================

const createFallbackEmployee = (leave: LeaveLog): Employee => {
  const employeeCode = leave.emp_code?.trim() ?? "";

  return {
    id: leave.emp_id,

    /*
     * Use emp_code as employeeId because this is the
     * identifier used by leave_log.
     */
    employeeId: employeeCode,

    /*
     * We don't have employee master data if the employee
     * lookup failed.
     *
     * Do NOT discard the leave record.
     */
    name: employeeCode || `Employee ${leave.emp_id}`,

    designation: "",

    department: "",

    email: "",

    phone: "",

    joiningDate: "",

    status: "Active",

    gender: "Male",

    avatar: "",
  };
};

// ============================================================
// LEAVE SERVICE
// ============================================================

export const leaveService = {
  // ==========================================================
  // GET ALL LEAVE LOGS
  // ==========================================================

  async getLeaveLogs(params?: {
    emp_code?: string;
    status?: number;
    leave_type?: string;
  }): Promise<LeaveLog[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.logs, {
        params,
      });

      const data = getResponseData<unknown>(response.data);

      console.log("GET ALL LEAVE LOGS response:", data);

      if (!Array.isArray(data)) {
        console.warn("Leave logs API did not return an array:", data);

        return [];
      }

      return data.map((item) =>
        normalizeLeaveLog(item as Record<string, unknown>),
      );
    } catch (error) {
      console.error("Get leave logs error:", error);

      throw new Error(getErrorMessage(error, "Unable to load leave records."));
    }
  },

  // ==========================================================
  // GET LEAVE BY ID
  // ==========================================================

  async getLeaveLogById(id: number): Promise<LeaveLog> {
    try {
      const response = await axiosInstance.get(
        `${LEAVE_ENDPOINTS.leaveById}/${id}`,
      );

      const data = getResponseData<Record<string, unknown>>(response.data);

      return normalizeLeaveLog(data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load leave record."));
    }
  },

  // ==========================================================
  // APPLY LEAVE
  // ==========================================================

  async createLeave(request: CreateLeaveRequest): Promise<LeaveLog> {
    try {
      console.log("Submitting leave request:", request);

      const response = await axiosInstance.post(LEAVE_ENDPOINTS.apply, request);

      const data = getResponseData<Record<string, unknown>>(response.data);

      console.log("Create leave response:", data);

      return normalizeLeaveLog(data);
    } catch (error) {
      console.error("Create leave error:", error);

      throw new Error(
        getErrorMessage(error, "Unable to create leave request."),
      );
    }
  },

  // ==========================================================
  // UPDATE LEAVE
  // ==========================================================

  async updateLeave(
    id: number,
    request: UpdateLeaveRequest,
  ): Promise<LeaveLog> {
    try {
      const response = await axiosInstance.put(
        `${LEAVE_ENDPOINTS.leaveById}/${id}`,
        request,
      );
      return getResponseData<LeaveLog>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to update leave."));
    }
  },

  async deleteLeave(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${LEAVE_ENDPOINTS.leaveById}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to delete leave."));
    }
  },

  async getLeaveSettings(): Promise<LeaveSetting> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.settings);
      return getResponseData<LeaveSetting>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load leave settings."));
    }
  },

  async updateLeaveSettings(request: LeaveSettingUpdateRequest): Promise<LeaveSetting> {
    try {
      const response = await axiosInstance.put(LEAVE_ENDPOINTS.settings, request);
      return getResponseData<LeaveSetting>(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to update leave settings."));
    }
  },

  // ==========================================================
  // APPROVE LEAVE
  // ==========================================================

  async approveLeave(request: ApproveLeaveRequest): Promise<LeaveLog> {
    try {
      const response = await axiosInstance.post(
        LEAVE_ENDPOINTS.approve,
        request,
      );

      const data = getResponseData<Record<string, unknown>>(response.data);

      return normalizeLeaveLog(data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to approve leave request."),
      );
    }
  },

  // ==========================================================
  // REJECT LEAVE
  // ==========================================================

  async rejectLeave(request: RejectLeaveRequest): Promise<LeaveLog> {
    try {
      const response = await axiosInstance.post(
        LEAVE_ENDPOINTS.reject,
        request,
      );

      const data = getResponseData<Record<string, unknown>>(response.data);

      return normalizeLeaveLog(data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to reject leave request."),
      );
    }
  },

  // ==========================================================
  // GET ACTIVE EMPLOYEES
  // ==========================================================

  async getEmployees(): Promise<Employee[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.employees);

      const data = getResponseData<unknown>(response.data);

      console.log("GET ACTIVE EMPLOYEES response:", data);

      if (!Array.isArray(data)) {
        console.warn("Employees API did not return an array:", data);

        return [];
      }

      return data.map((item) =>
        normalizeEmployee(item as Record<string, unknown>),
      );
    } catch (error) {
      console.error("Get employees error:", error);

      throw new Error(getErrorMessage(error, "Unable to load employees."));
    }
  },

  // ============================================================
  // GET EMPLOYEE LEAVE RECORDS
  // ============================================================

  async getEmployeeLeaveRecords(
    empCode?: string,
  ): Promise<LeaveEmployeeRecord[]> {
    try {
      const employeeCode = empCode?.trim().toLowerCase() ?? "";

      // Fetch employees and all leave logs.
      // Filtering is handled below using the logged-in employee code.
      const [employees, allLeaveLogs] = await Promise.all([
        this.getEmployees(),
        this.getLeaveLogs(),
      ]);

      // ========================================================
      // FILTER LOGGED-IN EMPLOYEE LEAVE RECORDS
      // ========================================================

      // const leaveLogs = employeeCode
      //   ? allLeaveLogs.filter((leave) => {
      //       const leaveEmployeeCode =
      //         leave.emp_code?.trim().toLowerCase() ?? "";

      //       return leaveEmployeeCode === employeeCode;
      //     })
      //   : [];

      const leaveLogs = employeeCode
  ? allLeaveLogs.filter((leave) => {
      const leaveEmployeeCode =
        leave.emp_code?.trim().toLowerCase() ?? "";

      return leaveEmployeeCode === employeeCode;
    })
  : allLeaveLogs;

      console.log("Logged-in employee code:", empCode);
      console.log("All leave logs:", allLeaveLogs);
      console.log("Filtered employee leave logs:", leaveLogs);

      // ========================================================
      // CREATE EMPLOYEE MAP
      // ========================================================

      const employeeMap = new Map<string, Employee>();

      employees.forEach((employee) => {
        if (employee.employeeId) {
          const key = employee.employeeId.trim().toLowerCase();

          employeeMap.set(key, employee);
        }

        if (employee.id) {
          employeeMap.set(String(employee.id).trim().toLowerCase(), employee);
        }
      });

      // ========================================================
      // MAP LEAVE LOGS
      // ========================================================

      const records = leaveLogs.map((leave) => {
        const leaveEmployeeCode = leave.emp_code?.trim().toLowerCase() ?? "";

        const leaveEmployeeId = String(leave.emp_id ?? "")
          .trim()
          .toLowerCase();

        let employee = leaveEmployeeCode
          ? employeeMap.get(leaveEmployeeCode)
          : undefined;

        if (!employee && leaveEmployeeId) {
          employee = employeeMap.get(leaveEmployeeId);
        }

        // Create fallback employee if employee master data
        // is not found. Do not discard the leave record.
        if (!employee) {
          employee = createFallbackEmployee(leave);
        }

        return mapEmployeeRecord(employee, leave);
      });

      console.log("Final employee leave records:", records);

      return records;
    } catch (error) {
      console.error("Get employee leave records error:", error);

      throw new Error(
        getErrorMessage(error, "Unable to load employee leave records."),
      );
    }
  },

  // ==========================================================
  // GET LEAVE BALANCES
  // ==========================================================

  async getLeaveBalances(year?: string): Promise<LeaveBalance[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.balances, {
        params: year ? { year } : undefined,
      });

      const data = getResponseData<unknown>(response.data);

      if (!Array.isArray(data)) {
        return [];
      }

      return data as LeaveBalance[];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load leave balances."));
    }
  },

  // ==========================================================
  // GET BALANCE BY EMPLOYEE
  // ==========================================================

  async getLeaveBalanceByEmployee(
    empCode: string,
    year?: string,
  ): Promise<LeaveBalance> {
    try {
      const response = await axiosInstance.get(
        `${LEAVE_ENDPOINTS.balanceByEmployee}/${encodeURIComponent(empCode)}`,
        {
          params: year ? { year } : undefined,
        },
      );

      const data = getResponseData<LeaveBalance>(response.data);

      return data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to load employee leave balance."),
      );
    }
  },

  // ==========================================================
  // CREATE LEAVE BALANCE
  // ==========================================================

  async createLeaveBalance(
    request: LeaveBalanceCreateRequest,
  ): Promise<LeaveBalance> {
    try {
      const response = await axiosInstance.post(
        LEAVE_ENDPOINTS.balances,
        request,
      );

      return getResponseData<LeaveBalance>(response.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to create leave balance."),
      );
    }
  },

  // ==========================================================
  // UPDATE LEAVE BALANCE
  // ==========================================================

  async updateLeaveBalance(
    id: number,
    request: LeaveBalanceUpdateRequest,
  ): Promise<LeaveBalance> {
    try {
      const response = await axiosInstance.put(
        `${LEAVE_ENDPOINTS.balances}/${id}`,
        request,
      );

      return getResponseData<LeaveBalance>(response.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to update leave balance."),
      );
    }
  },

  // ==========================================================
  // GET PENDING LEAVES
  // ==========================================================

  async getPendingLeaves(): Promise<LeaveLog[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.pending);

      const data = getResponseData<unknown>(response.data);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item) =>
        normalizeLeaveLog(item as Record<string, unknown>),
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to load pending leaves."));
    }
  },

  // ==========================================================
  // GET APPROVED LEAVES
  // ==========================================================

  async getApprovedLeaves(): Promise<LeaveLog[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.approved);

      const data = getResponseData<unknown>(response.data);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item) =>
        normalizeLeaveLog(item as Record<string, unknown>),
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to load approved leaves."),
      );
    }
  },

  // ==========================================================
  // GET REJECTED LEAVES
  // ==========================================================

  async getRejectedLeaves(): Promise<LeaveLog[]> {
    try {
      const response = await axiosInstance.get(LEAVE_ENDPOINTS.rejected);

      const data = getResponseData<unknown>(response.data);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((item) =>
        normalizeLeaveLog(item as Record<string, unknown>),
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Unable to load rejected leaves."),
      );
    }
  },
};

export default leaveService;
