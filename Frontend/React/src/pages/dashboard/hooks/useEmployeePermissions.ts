// import {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";

// import axiosInstance from "@/services/axios/axiosInstance";

// import {
//   getUsername,
// } from "@/pages/auth/utils/authStorage";

// // ============================================================
// // TYPES
// // ============================================================

// export interface EmployeePermissionAction {
//   view: boolean;
//   add: boolean;
//   edit: boolean;
//   delete: boolean;
//   export: boolean;
//   import: boolean;
//   settings: boolean;
// }

// export type EmployeePermissionMatrix =
//   Record<
//     string,
//     EmployeePermissionAction
//   >;

// interface EmployeeProfileResponse {
//   id?: number | null;
//   emp_id?: number | null;
//   emp_code?: string | null;
// }

// interface PermissionApiResponse {
//   permissions?: EmployeePermissionMatrix;

//   data?: {
//     permissions?: EmployeePermissionMatrix;
//   };

//   [key: string]: unknown;
// }

// // ============================================================
// // EMPTY PERMISSION
// // ============================================================

// const EMPTY_ACTION: EmployeePermissionAction = {
//   view: false,
//   add: false,
//   edit: false,
//   delete: false,
//   export: false,
//   import: false,
//   settings: false,
// };

// // ============================================================
// // NORMALIZE PERMISSION RESPONSE
// // ============================================================

// const normalizePermissionResponse = (
//   response: PermissionApiResponse,
// ): EmployeePermissionMatrix => {
//   // --------------------------------------------
//   // {
//   //   "permissions": {...}
//   // }
//   // --------------------------------------------

//   if (
//     response.permissions &&
//     typeof response.permissions === "object"
//   ) {
//     return response.permissions;
//   }

//   // --------------------------------------------
//   // {
//   //   "data": {
//   //     "permissions": {...}
//   //   }
//   // }
//   // --------------------------------------------

//   if (
//     response.data?.permissions &&
//     typeof response.data.permissions === "object"
//   ) {
//     return response.data.permissions;
//   }

//   // --------------------------------------------
//   // Direct permission matrix
//   // --------------------------------------------

//   const knownKeys = [
//     "dashboard_my",
//     "dashboard_all_employees",
//     "dashboard_department",
//     "dashboard_designation",
//     "dashboard_apply_resignation",
//     "dashboard_termination_status",

//     "send_application_form",

//     "interview_joining_schedule",

//     "attendance_history_all",
//     "attendance_edit_punch",
//     "attendance_history",

//     "shift_patterns",
//     "shift_assign",
//     "shift_swap",
//     "shift_roaster",

//     "leave_apply",
//     "leave_employee_leave",
//     "leave_settings",

//     "holiday_calendar_admin",
//     "holiday_calendar",

//     "payroll_payslip_admin",
//     "payroll_monthly_attendance",
//     "payroll_settings",
//     "payroll_expenses",
//     "payroll_category",
//     "payroll_sub_category",

//     "policies_detail",
//     "policies_detail_admin",

//     "kra_manager",
//     "kra_kra",
//     "kra_master",

//     "settings_change_password",
//     "settings_permission",
//   ];

//   const matrix: EmployeePermissionMatrix = {};

//   knownKeys.forEach(
//     (permissionId) => {
//       const value =
//         response[
//           permissionId
//         ];

//       if (
//         value &&
//         typeof value === "object"
//       ) {
//         const action =
//           value as Partial<EmployeePermissionAction>;

//         matrix[permissionId] = {
//           view: Boolean(action.view),
//           add: Boolean(action.add),
//           edit: Boolean(action.edit),
//           delete: Boolean(action.delete),
//           export: Boolean(action.export),
//           import: Boolean(
//             action.import,
//           ),
//           settings: Boolean(
//             action.settings,
//           ),
//         };
//       }
//     },
//   );

//   return matrix;
// };

// // ============================================================
// // HOOK
// // ============================================================

// const useEmployeePermissions = () => {
//   const [
//     permissions,
//     setPermissions,
//   ] =
//     useState<EmployeePermissionMatrix>(
//       {},
//     );

//   const [
//     loading,
//     setLoading,
//   ] =
//     useState<boolean>(true);

//   const [
//     error,
//     setError,
//   ] =
//     useState<string | null>(null);

//   // ==========================================================
//   // LOAD EMPLOYEE PERMISSIONS
//   // ==========================================================

//   const loadPermissions =
//     useCallback(async (): Promise<void> => {
//       try {
//         setLoading(true);
//         setError(null);

//         // ----------------------------------------------------
//         // Logged-in employee code
//         // Example: IWT68
//         // ----------------------------------------------------

//         const employeeCode =
//           getUsername()?.trim();

//         if (!employeeCode) {
//           setPermissions({});

//           setError(
//             "Logged-in employee code is not available.",
//           );

//           return;
//         }

//         // ====================================================
//         // STEP 1
//         // Get employee profile
//         // ====================================================

//         const profileResponse =
//           await axiosInstance.get<EmployeeProfileResponse>(
//             `/api/v1/employees/profile/${encodeURIComponent(
//               employeeCode,
//             )}`,
//           );

//         const profile =
//           profileResponse.data;

//         // ====================================================
//         // STEP 2
//         // Resolve employee DB ID
//         // ====================================================

//         const employeeId =
//           profile.emp_id ??
//           profile.id;

//         if (
//           employeeId === null ||
//           employeeId === undefined ||
//           !Number.isInteger(
//             employeeId,
//           ) ||
//           employeeId <= 0
//         ) {
//           setPermissions({});

//           setError(
//             "Employee database ID could not be resolved.",
//           );

//           return;
//         }

//         // ====================================================
//         // STEP 3
//         // Get employee permissions
//         // ====================================================

//         const permissionResponse =
//           await axiosInstance.get<PermissionApiResponse>(
//             `/api/v1/permissions/user/${encodeURIComponent(
//               employeeId,
//             )}`,
//           );

//         // ====================================================
//         // STEP 4
//         // Normalize response
//         // ====================================================

//         const permissionMatrix =
//           normalizePermissionResponse(
//             permissionResponse.data,
//           );

//         setPermissions(
//           permissionMatrix,
//         );
//       } catch (err: unknown) {
//         console.error(
//           "Failed to load employee permissions:",
//           err,
//         );

//         setPermissions({});

//         if (
//           typeof err === "object" &&
//           err !== null &&
//           "response" in err
//         ) {
//           const axiosError =
//             err as {
//               response?: {
//                 data?: {
//                   detail?: string;
//                   message?: string;
//                 };
//               };
//             };

//           const message =
//             axiosError.response?.data
//               ?.detail ||
//             axiosError.response?.data
//               ?.message;

//           setError(
//             message ||
//               "Failed to load employee permissions.",
//           );
//         } else if (
//           err instanceof Error
//         ) {
//           setError(err.message);
//         } else {
//           setError(
//             "Failed to load employee permissions.",
//           );
//         }
//       } finally {
//         setLoading(false);
//       }
//     }, []);

//   // ==========================================================
//   // LOAD ONCE WHEN SIDEBAR STARTS
//   // ==========================================================

//   useEffect(() => {
//     void loadPermissions();
//   }, [loadPermissions]);

//   // ==========================================================
//   // GENERIC PERMISSION CHECK
//   // ==========================================================

//   const can = useCallback(
//     (
//       permissionId: string,
//       action: keyof EmployeePermissionAction,
//     ): boolean => {
//       const permission =
//         permissions[
//           permissionId
//         ] ?? EMPTY_ACTION;

//       return Boolean(
//         permission[action],
//       );
//     },
//     [permissions],
//   );

//   // ==========================================================
//   // VIEW
//   // ==========================================================

//   const canView = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "view",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // ADD
//   // ==========================================================

//   const canAdd = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "add",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // EDIT
//   // ==========================================================

//   const canEdit = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "edit",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // DELETE
//   // ==========================================================

//   const canDelete = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "delete",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // EXPORT
//   // ==========================================================

//   const canExport = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "export",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // IMPORT
//   // ==========================================================

//   const canImport = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "import",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // SETTINGS
//   // ==========================================================

//   const canSettings = useCallback(
//     (permissionId: string): boolean =>
//       can(
//         permissionId,
//         "settings",
//       ),
//     [can],
//   );

//   // ==========================================================
//   // RETURN
//   // ==========================================================

//   return {
//     permissions,

//     loading,
//     error,

//     canView,
//     canAdd,
//     canEdit,
//     canDelete,
//     canExport,
//     canImport,
//     canSettings,

//     reloadPermissions:
//       loadPermissions,
//   };
// };

// export default useEmployeePermissions;






import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axiosInstance from "@/services/axios/axiosInstance";

import {
  getUsername,
} from "@/pages/auth/utils/authStorage";

// ============================================================
// TYPES
// ============================================================

export interface EmployeePermissionAction {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  settings: boolean;
}

export type EmployeePermissionMatrix =
  Record<
    string,
    EmployeePermissionAction
  >;

interface EmployeeProfileResponse {
  id?: number | null;
  emp_id?: number | null;
  emp_code?: string | null;
}

interface PermissionApiResponse {
  permissions?: EmployeePermissionMatrix;

  data?: {
    permissions?: EmployeePermissionMatrix;
  };

  [key: string]: unknown;
}

// ============================================================
// EMPTY PERMISSION
// ============================================================

const EMPTY_ACTION: EmployeePermissionAction = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  export: false,
  import: false,
  settings: false,
};

// ============================================================
// NORMALIZE PERMISSION RESPONSE
// ============================================================

const normalizePermissionResponse = (
  response: PermissionApiResponse,
): EmployeePermissionMatrix => {
  // --------------------------------------------
  // {
  //   "permissions": {...}
  // }
  // --------------------------------------------

  if (
    response.permissions &&
    typeof response.permissions === "object"
  ) {
    return response.permissions;
  }

  // --------------------------------------------
  // {
  //   "data": {
  //     "permissions": {...}
  //   }
  // }
  // --------------------------------------------

  if (
    response.data?.permissions &&
    typeof response.data.permissions === "object"
  ) {
    return response.data.permissions;
  }

  // --------------------------------------------
  // Direct permission matrix
  // --------------------------------------------

  const knownKeys = [
    "dashboard_my",
    "dashboard_all_employees",
    "dashboard_department",
    "dashboard_designation",
    "dashboard_apply_resignation",
    "dashboard_termination_status",

    "send_application_form",

    "interview_joining_schedule",

    "attendance_history_all",
    "attendance_edit_punch",
    "attendance_history",

    "shift_patterns",
    "shift_assign",
    "shift_swap",
    "shift_roaster",

    "leave_apply",
    "leave_employee_leave",
    "leave_settings",

    "holiday_calendar_admin",
    "holiday_calendar",

    "payroll_payslip_admin",
    "payroll_monthly_attendance",
    "payroll_settings",
    "payroll_expenses",
    "payroll_category",
    "payroll_sub_category",

    "policies_detail",
    "policies_detail_admin",

    "kra_manager",
    "kra_kra",
    "kra_master",

    "settings_change_password",
    "settings_permission",
  ];

  const matrix: EmployeePermissionMatrix = {};

  knownKeys.forEach(
    (permissionId) => {
      const value =
        response[
          permissionId
        ];

      if (
        value &&
        typeof value === "object"
      ) {
        const action =
          value as Partial<EmployeePermissionAction>;

        matrix[permissionId] = {
          view: Boolean(action.view),
          add: Boolean(action.add),
          edit: Boolean(action.edit),
          delete: Boolean(action.delete),
          export: Boolean(action.export),
          import: Boolean(
            action.import,
          ),
          settings: Boolean(
            action.settings,
          ),
        };
      }
    },
  );

  return matrix;
};

// ============================================================
// HOOK
// ============================================================

const useEmployeePermissions = () => {
  const [
    permissions,
    setPermissions,
  ] =
    useState<EmployeePermissionMatrix>(
      {},
    );

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  // ==========================================================
  // LOAD EMPLOYEE PERMISSIONS
  // ==========================================================

  const loadPermissions =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // ----------------------------------------------------
        // Logged-in employee code
        // Example: IWT68
        // ----------------------------------------------------

        const employeeCode =
          getUsername()?.trim();

        if (!employeeCode) {
          setPermissions({});

          setError(
            "Logged-in employee code is not available.",
          );

          return;
        }

        // ====================================================
        // STEP 1
        // Get employee profile
        // ====================================================

        const profileResponse =
          await axiosInstance.get<EmployeeProfileResponse>(
            `/api/v1/employees/profile/${encodeURIComponent(
              employeeCode,
            )}`,
          );

        const profile =
          profileResponse.data;

        // ====================================================
        // STEP 2
        // Resolve employee DB ID
        // ====================================================

        const employeeId =
          profile.emp_id ??
          profile.id;

        if (
          employeeId === null ||
          employeeId === undefined ||
          !Number.isInteger(
            employeeId,
          ) ||
          employeeId <= 0
        ) {
          setPermissions({});

          setError(
            "Employee database ID could not be resolved.",
          );

          return;
        }

        // ====================================================
        // STEP 3
        // Get employee permissions
        // ====================================================

        const permissionResponse =
          await axiosInstance.get<PermissionApiResponse>(
            `/api/v1/permissions/user/${encodeURIComponent(
              employeeId,
            )}`,
          );

        // ====================================================
        // STEP 4
        // Normalize response
        // ====================================================

        const permissionMatrix =
          normalizePermissionResponse(
            permissionResponse.data,
          );

        setPermissions(
          permissionMatrix,
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load employee permissions:",
          err,
        );

        setPermissions({});

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err
        ) {
          const axiosError =
            err as {
              response?: {
                data?: {
                  detail?: string;
                  message?: string;
                };
              };
            };

          const message =
            axiosError.response?.data
              ?.detail ||
            axiosError.response?.data
              ?.message;

          setError(
            message ||
              "Failed to load employee permissions.",
          );
        } else if (
          err instanceof Error
        ) {
          setError(err.message);
        } else {
          setError(
            "Failed to load employee permissions.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, []);

  // ==========================================================
  // LOAD ONCE WHEN SIDEBAR STARTS
  // ==========================================================

  useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  // ==========================================================
  // GENERIC PERMISSION CHECK
  // ==========================================================

  const can = useCallback(
    (
      permissionId: string,
      action: keyof EmployeePermissionAction,
    ): boolean => {
      const permission =
        permissions[
          permissionId
        ] ?? EMPTY_ACTION;

      return Boolean(
        permission[action],
      );
    },
    [permissions],
  );

  // ==========================================================
  // VIEW
  // ==========================================================

  const canView = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "view",
      ),
    [can],
  );

  // ==========================================================
  // ADD
  // ==========================================================

  const canAdd = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "add",
      ),
    [can],
  );

  // ==========================================================
  // EDIT
  // ==========================================================

  const canEdit = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "edit",
      ),
    [can],
  );

  // ==========================================================
  // DELETE
  // ==========================================================

  const canDelete = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "delete",
      ),
    [can],
  );

  // ==========================================================
  // EXPORT
  // ==========================================================

  const canExport = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "export",
      ),
    [can],
  );

  // ==========================================================
  // IMPORT
  // ==========================================================

  const canImport = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "import",
      ),
    [can],
  );

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const canSettings = useCallback(
    (permissionId: string): boolean =>
      can(
        permissionId,
        "settings",
      ),
    [can],
  );

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    permissions,

    loading,
    error,

    canView,
    canAdd,
    canEdit,
    canDelete,
    canExport,
    canImport,
    canSettings,

    reloadPermissions:
      loadPermissions,
  };
};

export default useEmployeePermissions;