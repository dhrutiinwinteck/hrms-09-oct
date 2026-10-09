// ============================================================
// SETTINGS SERVICE
// ============================================================

import axios from "axios";

import axiosInstance from "../../../services/axios/axiosInstance";

import type {
  Module,
  PermissionRow,
  PermissionApiMatrix,
  PermissionUserOption,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ChangePasswordResult,
  ChangePasswordByEmployeeCodeRequest,
  ChangePasswordByEmployeeCodeResponse,
  SavePermissionResponse,
} from "../types/settings.types";

import {
  SETTINGS_API_ENDPOINTS,
} from "../constants/settings.constants";

// ============================================================
// API ERROR TYPES
// ============================================================

interface ApiValidationError {
  loc?: unknown[];
  msg?: string;
  type?: string;
}

interface ApiErrorResponse {
  detail?:
    | string
    | ApiValidationError[]
    | unknown;

  message?:
    | string
    | unknown;

  error?:
    | string
    | unknown;
}

// ============================================================
// PERMISSION MODULES
// ============================================================

const PERMISSION_MODULES: Module[] = [
  {
    id: "dashboard",
    name: "Dashboard",
  },
  {
    id: "send_application_form",
    name: "Send Application Form",
  },
  {
    id: "interview_process",
    name: "Interview Process",
  },
  {
    id: "attendance",
    name: "Attendance",
  },
  {
    id: "shift",
    name: "Shift",
  },
  {
    id: "leave",
    name: "Leave",
  },
  {
    id: "holiday",
    name: "Holiday",
  },
  {
    id: "payroll",
    name: "Payroll",
  },
  {
    id: "policies",
    name: "Policies",
  },
  {
    id: "kra",
    name: "KRA",
  },
  {
    id: "settings",
    name: "Settings",
  },
];

// ============================================================
// PERMISSION ROWS
// ============================================================

const PERMISSION_ROWS: PermissionRow[] = [
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    id: "dashboard_my",
    label: "My Dashboard",
    moduleId: "dashboard",
  },
  {
    id: "dashboard_all_employees",
    label: "All Employees",
    moduleId: "dashboard",
  },
  {
    id: "dashboard_department",
    label: "Department",
    moduleId: "dashboard",
  },
  {
    id: "dashboard_designation",
    label: "Designation",
    moduleId: "dashboard",
  },
  {
    id: "dashboard_apply_resignation",
    label: "Apply for Resignation",
    moduleId: "dashboard",
  },
  {
    id: "dashboard_termination_status",
    label: "Termination Status",
    moduleId: "dashboard",
  },

  // ==========================================================
  // SEND APPLICATION FORM
  // ==========================================================

  {
    id: "send_application_form",
    label: "Send Application Form",
    moduleId: "send_application_form",
  },

  // ==========================================================
  // INTERVIEW PROCESS
  // ==========================================================

  {
    id: "interview_joining_schedule",
    label: "Joining Schedule",
    moduleId: "interview_process",
  },

  // ==========================================================
  // ATTENDANCE
  // ==========================================================

  {
    id: "attendance_history_all",
    label: "Attendance History (All Employees)",
    moduleId: "attendance",
  },
  {
    id: "attendance_edit_punch",
    label: "Edit Punch In/Out",
    moduleId: "attendance",
  },
  {
    id: "attendance_history",
    label: "Attendance History",
    moduleId: "attendance",
  },

  // ==========================================================
  // SHIFT
  // ==========================================================

  {
    id: "shift_patterns",
    label: "Shift Patterns",
    moduleId: "shift",
  },
  {
    id: "shift_assign",
    label: "Assign Shift",
    moduleId: "shift",
  },
  {
    id: "shift_swap",
    label: "Shift Swap",
    moduleId: "shift",
  },
  {
    id: "shift_roaster",
    label: "Roaster",
    moduleId: "shift",
  },

  // ==========================================================
  // LEAVE
  // ==========================================================

  {
    id: "leave_apply",
    label: "Apply for Leave",
    moduleId: "leave",
  },
  {
    id: "leave_employee_leave",
    label: "Employee Leave",
    moduleId: "leave",
  },
  {
    id: "leave_settings",
    label: "Leave Settings",
    moduleId: "leave",
  },

  // ==========================================================
  // HOLIDAY
  // ==========================================================

  {
    id: "holiday_calendar_admin",
    label: "Holiday Calendar (Admin)",
    moduleId: "holiday",
  },
  {
    id: "holiday_calendar",
    label: "Holiday Calendar (User)",
    moduleId: "holiday",
  },

  // ==========================================================
  // PAYROLL
  // ==========================================================

  {
    id: "payroll_payslip_admin",
    label: "Payslip (Admin)",
    moduleId: "payroll",
  },
  {
    id: "payroll_monthly_attendance",
    label: "Monthly Attendance",
    moduleId: "payroll",
  },
  {
    id: "payroll_settings",
    label: "Payroll Settings",
    moduleId: "payroll",
  },
  {
    id: "payroll_expenses",
    label: "Expenses",
    moduleId: "payroll",
  },
  {
    id: "payroll_category",
    label: "Category",
    moduleId: "payroll",
  },
  {
    id: "payroll_sub_category",
    label: "Sub Category",
    moduleId: "payroll",
  },

  // ==========================================================
  // POLICIES
  // ==========================================================

  {
    id: "policies_detail",
    label: "Policy Detail",
    moduleId: "policies",
  },
  {
    id: "policies_detail_admin",
    label: "Policy Details (Admin)",
    moduleId: "policies",
  },

  // ==========================================================
  // KRA
  // ==========================================================

  {
    id: "kra_manager",
    label: "KRA (Manager)",
    moduleId: "kra",
  },
  {
    id: "kra_kra",
    label: "KRA",
    moduleId: "kra",
  },
  {
    id: "kra_master",
    label: "KRA Master",
    moduleId: "kra",
  },

  // ==========================================================
  // SETTINGS
  // ==========================================================

  {
    id: "settings_change_password",
    label: "Change Password",
    moduleId: "settings",
  },
  {
    id: "settings_permission",
    label: "Permission",
    moduleId: "settings",
  },
];

// ============================================================
// API ERROR MESSAGE
// ============================================================

const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  // ==========================================================
  // AXIOS ERROR
  // ==========================================================

  if (
    axios.isAxiosError<ApiErrorResponse>(
      error,
    )
  ) {
    const responseData =
      error.response?.data;

    if (responseData) {
      // ========================================================
      // DETAIL
      // ========================================================

      const detail =
        responseData.detail;

      // Simple string:
      //
      // {
      //   "detail": "User not found"
      // }

      if (
        typeof detail ===
        "string"
      ) {
        return detail;
      }

      // ========================================================
      // FASTAPI VALIDATION ARRAY
      // ========================================================

      if (
        Array.isArray(detail)
      ) {
        const messages =
          detail
            .map((item) => {
              // -----------------------------------------------
              // String
              // -----------------------------------------------

              if (
                typeof item ===
                "string"
              ) {
                return item;
              }

              // -----------------------------------------------
              // Validation object
              // -----------------------------------------------

              if (
                item &&
                typeof item ===
                  "object"
              ) {
                const validationError =
                  item as ApiValidationError;

                if (
                  validationError.msg
                ) {
                  return validationError.msg;
                }

                try {
                  return JSON.stringify(
                    item,
                  );
                } catch {
                  return "Validation error";
                }
              }

              return String(item);
            })
            .filter(
              (
                message,
              ) =>
                Boolean(message),
            );

        if (
          messages.length > 0
        ) {
          return messages.join(
            " | ",
          );
        }
      }

      // ========================================================
      // MESSAGE
      // ========================================================

      if (
        typeof responseData.message ===
        "string"
      ) {
        return responseData.message;
      }

      // ========================================================
      // ERROR
      // ========================================================

      if (
        typeof responseData.error ===
        "string"
      ) {
        return responseData.error;
      }
    }

    // ==========================================================
    // AXIOS DEFAULT MESSAGE
    // ==========================================================

    if (
      error.message
    ) {
      return error.message;
    }
  }

  // ==========================================================
  // NORMAL JAVASCRIPT ERROR
  // ==========================================================

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  // ==========================================================
  // STRING ERROR
  // ==========================================================

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  // ==========================================================
  // UNKNOWN OBJECT
  // ==========================================================

  if (
    error &&
    typeof error ===
      "object"
  ) {
    try {
      return JSON.stringify(
        error,
      );
    } catch {
      return fallback;
    }
  }

  return fallback;
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

export const changePassword =
  async (
    request: ChangePasswordRequest,
  ): Promise<ChangePasswordResult> => {
    try {
      const response =
        await axiosInstance.post<ChangePasswordResponse>(
          SETTINGS_API_ENDPOINTS.CHANGE_PASSWORD,
          {
            email:
              request.email.trim(),

            password:
              request.password,
          },
        );

      return {
        success: true,

        message:
          response.data.message ||
          "Password changed successfully.",
      };
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to change password.",
        ),
      );
    }
  };

// ============================================================
// CHANGE PASSWORD BY EMPLOYEE CODE
// ============================================================

export const changePasswordByEmployeeCode =
  async (
    request: ChangePasswordByEmployeeCodeRequest,
  ): Promise<ChangePasswordByEmployeeCodeResponse> => {
    try {
      const response =
        await axiosInstance.post<ChangePasswordByEmployeeCodeResponse>(
          SETTINGS_API_ENDPOINTS.CHANGE_PASSWORD_BY_EMPLOYEE_CODE,
          {
            emp_code:
              request.emp_code.trim(),

            password:
              request.password,
          },
        );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to change password.",
        ),
      );
    }
  };

// ============================================================
// NORMALIZE PERMISSION RESPONSE
// ============================================================

const normalizePermissionResponse = (
  response: unknown,
): PermissionApiMatrix => {
  // ==========================================================
  // INVALID RESPONSE
  // ==========================================================

  if (
    !response ||
    typeof response !==
      "object"
  ) {
    return {};
  }

  const value =
    response as Record<
      string,
      unknown
    >;

  // ==========================================================
  // DIRECT:
  //
  // {
  //   "permissions": {
  //      ...
  //   }
  // }
  // ==========================================================

  if (
    value.permissions &&
    typeof value.permissions ===
      "object"
  ) {
    return value.permissions as PermissionApiMatrix;
  }

  // ==========================================================
  // NESTED:
  //
  // {
  //   "data": {
  //      "permissions": {
  //         ...
  //      }
  //   }
  // }
  // ==========================================================

  if (
    value.data &&
    typeof value.data ===
      "object"
  ) {
    const data =
      value.data as Record<
        string,
        unknown
      >;

    if (
      data.permissions &&
      typeof data.permissions ===
        "object"
    ) {
      return data.permissions as PermissionApiMatrix;
    }

    // --------------------------------------------------------
    // If data itself is the matrix
    // --------------------------------------------------------

    return data as PermissionApiMatrix;
  }

  // ==========================================================
  // DIRECT MATRIX
  // ==========================================================

  return value as PermissionApiMatrix;
};

// ============================================================
// SETTINGS SERVICE
// ============================================================

const settingsService = {
  // ==========================================================
  // PASSWORD
  // ==========================================================

  changePassword,

  changePasswordByEmployeeCode,

  // ==========================================================
  // GET MODULES
  // ==========================================================

  async getModules(): Promise<
    Module[]
  > {
    return PERMISSION_MODULES;
  },

  // ==========================================================
  // GET PERMISSION ROWS
  // ==========================================================

  async getPermissionRows(): Promise<
    PermissionRow[]
  > {
    return PERMISSION_ROWS;
  },

  // ==========================================================
  // GET EMPLOYEES
  //
  // GET:
  // /api/v1/employees/
  // ==========================================================

  async getEmployees(): Promise<
    PermissionUserOption[]
  > {
    try {
      const response =
        await axiosInstance.get(
          "/api/v1/employees/",
        );

      const responseData =
        response.data;

      let employeesData: unknown =
        responseData;

      if (
        responseData &&
        typeof responseData ===
          "object" &&
        !Array.isArray(
          responseData,
        ) &&
        "data" in
          responseData
      ) {
        employeesData = (
          responseData as {
            data?: unknown;
          }
        ).data;
      }

      if (
        !Array.isArray(
          employeesData,
        )
      ) {
        throw new Error(
          "Employee API returned an invalid response.",
        );
      }

      return employeesData.map(
        (
          employee: any,
        ): PermissionUserOption => {
          const firstName =
            employee.first_name ??
            "";

          const lastName =
            employee.last_name ??
            "";

          const generatedName =
            `${firstName} ${lastName}`.trim();

          return {
            id: employee.id,
            emp_id:
              employee.emp_id,
            emp_code:
              employee.emp_code,
            first_name:
              employee.first_name,
            last_name:
              employee.last_name,
            employee_name:
              employee.employee_name ||
              generatedName ||
              employee.emp_code ||
              String(
                employee.id,
              ),
          };
        },
      );
    } catch (
      error: unknown
    ) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to load employees.",
        ),
      );
    }
  },

  // ==========================================================
  // GET ROLE PERMISSIONS
  //
  // GET:
  // /api/v1/permissions/role/{role_id}
  // ==========================================================

  async getRolePermissions(
    roleId: string,
  ): Promise<PermissionApiMatrix> {
    try {
      const cleanRoleId =
        roleId.trim();

      if (
        !cleanRoleId
      ) {
        throw new Error(
          "Role ID is required.",
        );
      }

      const response =
        await axiosInstance.get(
          `/api/v1/permissions/role/${encodeURIComponent(
            cleanRoleId,
          )}`,
        );

      return normalizePermissionResponse(
        response.data,
      );
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to load role permissions.",
        ),
      );
    }
  },

  // ==========================================================
  // GET USER PERMISSIONS
  //
  // GET:
  // /api/v1/permissions/user/{user_id}
  // ==========================================================

  async getUserPermissions(
    userId: string,
  ): Promise<PermissionApiMatrix> {
    try {
      const cleanUserId =
        userId.trim();

      if (
        !cleanUserId
      ) {
        throw new Error(
          "User ID is required.",
        );
      }

      const response =
        await axiosInstance.get(
          `/api/v1/permissions/user/${encodeURIComponent(
            cleanUserId,
          )}`,
        );

      return normalizePermissionResponse(
        response.data,
      );
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to load user permissions.",
        ),
      );
    }
  },

  // ==========================================================
  // SAVE ROLE PERMISSIONS
  //
  // PUT:
  // /api/v1/permissions/role/{role_id}
  // ==========================================================

  async saveRolePermissions(
    roleId: string,
    permissions: PermissionApiMatrix,
  ): Promise<SavePermissionResponse> {
    try {
      const cleanRoleId =
        roleId.trim();

      if (
        !cleanRoleId
      ) {
        throw new Error(
          "Role ID is required.",
        );
      }

      const response =
        await axiosInstance.put<SavePermissionResponse>(
          `/api/v1/permissions/role/${encodeURIComponent(
            cleanRoleId,
          )}`,
          {
            target_type:
              "role",
            target_id:
              cleanRoleId,
            permissions,
          },
        );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to save role permissions.",
        ),
      );
    }
  },

  // ==========================================================
  // SAVE USER PERMISSIONS
  //
  // PUT:
  // /api/v1/permissions/user/{user_id}
  // ==========================================================

  async saveUserPermissions(
    userId: string,
    permissions: PermissionApiMatrix,
  ): Promise<SavePermissionResponse> {
    try {
      const cleanUserId =
        userId.trim();

      if (
        !cleanUserId
      ) {
        throw new Error(
          "User ID is required.",
        );
      }

      const response =
        await axiosInstance.put<SavePermissionResponse>(
          `/api/v1/permissions/user/${encodeURIComponent(
            cleanUserId,
          )}`,
          {
            target_type:
              "user",
            target_id:
              cleanUserId,
            permissions,
          },
        );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getApiErrorMessage(
          error,
          "Failed to save user permissions.",
        ),
      );
    }
  },
};

export default settingsService;