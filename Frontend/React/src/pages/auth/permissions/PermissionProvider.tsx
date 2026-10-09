// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import axiosInstance from "@/services/axios/axiosInstance";
// import {
//   getUsername,
// } from "@/pages/auth/utils/authStorage";

// // ============================================================
// // TYPES
// // ============================================================

// export interface PermissionActionState {
//   view: boolean;
//   add: boolean;
//   edit: boolean;
//   delete: boolean;
//   export: boolean;
//   import: boolean;
//   settings: boolean;
// }

// export type PermissionMatrix =
//   Record<string, PermissionActionState>;

// interface EmployeeProfileResponse {
//   id?: number | null;
//   emp_id?: number | null;
//   emp_code?: string | null;
// }

// interface PermissionApiResponse {
//   permissions?: Record<
//     string,
//     Partial<PermissionActionState>
//   >;

//   data?: {
//     permissions?: Record<
//       string,
//       Partial<PermissionActionState>
//     >;
//   };

//   [key: string]: unknown;
// }

// interface PermissionContextValue {
//   permissions: PermissionMatrix;

//   loading: boolean;

//   error: string | null;

//   canView: (
//     permissionId: string,
//   ) => boolean;

//   canAdd: (
//     permissionId: string,
//   ) => boolean;

//   canEdit: (
//     permissionId: string,
//   ) => boolean;

//   canDelete: (
//     permissionId: string,
//   ) => boolean;

//   canExport: (
//     permissionId: string,
//   ) => boolean;

//   canImport: (
//     permissionId: string,
//   ) => boolean;

//   canSettings: (
//     permissionId: string,
//   ) => boolean;

//   reloadPermissions: () => Promise<void>;
// }

// // ============================================================
// // CONTEXT
// // ============================================================

// const PermissionContext =
//   createContext<
//     PermissionContextValue | undefined
//   >(undefined);

// // ============================================================
// // EMPTY ACTION
// // ============================================================

// const EMPTY_ACTION: PermissionActionState = {
//   view: false,
//   add: false,
//   edit: false,
//   delete: false,
//   export: false,
//   import: false,
//   settings: false,
// };

// // ============================================================
// // NORMALIZE API RESPONSE
// // ============================================================

// const normalizePermissions = (
//   response: PermissionApiResponse,
// ): PermissionMatrix => {
//   // ----------------------------------------------------------
//   // Response:
//   //
//   // {
//   //   "permissions": {
//   //      "dashboard_my": {...}
//   //   }
//   // }
//   // ----------------------------------------------------------

//   if (
//     response.permissions &&
//     typeof response.permissions ===
//       "object"
//   ) {
//     return normalizeMatrix(
//       response.permissions,
//     );
//   }

//   // ----------------------------------------------------------
//   // Response:
//   //
//   // {
//   //   "data": {
//   //      "permissions": {
//   //         ...
//   //      }
//   //   }
//   // }
//   // ----------------------------------------------------------

//   if (
//     response.data?.permissions &&
//     typeof response.data.permissions ===
//       "object"
//   ) {
//     return normalizeMatrix(
//       response.data.permissions,
//     );
//   }

//   // ----------------------------------------------------------
//   // Direct matrix:
//   //
//   // {
//   //   "dashboard_my": {...}
//   // }
//   // ----------------------------------------------------------

//   return normalizeMatrix(
//     response as Record<
//       string,
//       unknown
//     >,
//   );
// };

// // ============================================================
// // NORMALIZE MATRIX
// // ============================================================

// const normalizeMatrix = (
//   matrix: Record<
//     string,
//     unknown
//   >,
// ): PermissionMatrix => {
//   const result: PermissionMatrix = {};

//   Object.entries(matrix).forEach(
//     ([permissionId, rawValue]) => {
//       if (
//         !rawValue ||
//         typeof rawValue !== "object"
//       ) {
//         return;
//       }

//       const value =
//         rawValue as Partial<PermissionActionState>;

//       result[permissionId] = {
//         view: Boolean(value.view),
//         add: Boolean(value.add),
//         edit: Boolean(value.edit),
//         delete: Boolean(value.delete),
//         export: Boolean(value.export),
//         import: Boolean(value.import),
//         settings: Boolean(
//           value.settings,
//         ),
//       };
//     },
//   );

//   return result;
// };

// // ============================================================
// // PROVIDER
// // ============================================================

// export const PermissionProvider =
//   ({
//     children,
//   }: {
//     children: React.ReactNode;
//   }): JSX.Element => {
//     const [
//       permissions,
//       setPermissions,
//     ] =
//       useState<PermissionMatrix>({});

//     const [
//       loading,
//       setLoading,
//     ] =
//       useState<boolean>(true);

//     const [
//       error,
//       setError,
//     ] =
//       useState<string | null>(null);

//     // ========================================================
//     // LOAD PERMISSIONS
//     // ========================================================

//     const loadPermissions =
//       useCallback(async (): Promise<void> => {
//         try {
//           setLoading(true);
//           setError(null);

//           // --------------------------------------------------
//           // Get logged-in employee code
//           // --------------------------------------------------

//           const employeeCode =
//             getUsername()?.trim();

//           if (!employeeCode) {
//             setPermissions({});

//             setError(
//               "Logged-in employee code is not available.",
//             );

//             return;
//           }

//           // --------------------------------------------------
//           // Get employee profile
//           // --------------------------------------------------

//           const profileResponse =
//             await axiosInstance.get<EmployeeProfileResponse>(
//               `/api/v1/employees/profile/${encodeURIComponent(
//                 employeeCode,
//               )}`,
//             );

//           const profile =
//             profileResponse.data;

//           // --------------------------------------------------
//           // Resolve database employee/user ID
//           // --------------------------------------------------

//           const employeeId =
//             profile.emp_id ??
//             profile.id;

//           if (
//             employeeId ===
//               null ||
//             employeeId ===
//               undefined ||
//             !Number.isInteger(
//               employeeId,
//             ) ||
//             employeeId <= 0
//           ) {
//             setPermissions({});

//             setError(
//               "Employee database ID could not be resolved.",
//             );

//             return;
//           }

//           // --------------------------------------------------
//           // GET REAL USER PERMISSIONS
//           // --------------------------------------------------

//           const permissionResponse =
//             await axiosInstance.get<PermissionApiResponse>(
//               `/api/v1/permissions/user/${encodeURIComponent(
//                 employeeId,
//               )}`,
//             );

//           const matrix =
//             normalizePermissions(
//               permissionResponse.data,
//             );

//           setPermissions(matrix);
//         } catch (err: unknown) {
//           console.error(
//             "Failed to load employee permissions:",
//             err,
//           );

//           setPermissions({});

//           if (
//             typeof err ===
//               "object" &&
//             err !== null &&
//             "response" in err
//           ) {
//             const axiosError =
//               err as {
//                 response?: {
//                   data?: {
//                     detail?: string;
//                     message?: string;
//                   };
//                 };
//               };

//             setError(
//               axiosError.response
//                 ?.data?.detail ||
//                 axiosError.response
//                   ?.data?.message ||
//                 "Failed to load employee permissions.",
//             );
//           } else if (
//             err instanceof Error
//           ) {
//             setError(err.message);
//           } else {
//             setError(
//               "Failed to load employee permissions.",
//             );
//           }
//         } finally {
//           setLoading(false);
//         }
//       }, []);

//     // ========================================================
//     // LOAD ON APPLICATION LAYOUT
//     // ========================================================

//     useEffect(() => {
//       void loadPermissions();
//     }, [loadPermissions]);

//     // ========================================================
//     // GENERIC CHECK
//     // ========================================================

//     const can = useCallback(
//       (
//         permissionId: string,
//         action: keyof PermissionActionState,
//       ): boolean => {
//         const permission =
//           permissions[
//             permissionId
//           ] ?? EMPTY_ACTION;

//         return Boolean(
//           permission[action],
//         );
//       },
//       [permissions],
//     );

//     // ========================================================
//     // ACTION CHECKERS
//     // ========================================================

//     const canView =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "view",
//           ),
//         [can],
//       );

//     const canAdd =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "add",
//           ),
//         [can],
//       );

//     const canEdit =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "edit",
//           ),
//         [can],
//       );

//     const canDelete =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "delete",
//           ),
//         [can],
//       );

//     const canExport =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "export",
//           ),
//         [can],
//       );

//     const canImport =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "import",
//           ),
//         [can],
//       );

//     const canSettings =
//       useCallback(
//         (
//           permissionId: string,
//         ): boolean =>
//           can(
//             permissionId,
//             "settings",
//           ),
//         [can],
//       );

//     // ========================================================
//     // CONTEXT VALUE
//     // ========================================================

//     const contextValue =
//       useMemo(
//         () => ({
//           permissions,
//           loading,
//           error,

//           canView,
//           canAdd,
//           canEdit,
//           canDelete,
//           canExport,
//           canImport,
//           canSettings,

//           reloadPermissions:
//             loadPermissions,
//         }),
//         [
//           permissions,
//           loading,
//           error,
//           canView,
//           canAdd,
//           canEdit,
//           canDelete,
//           canExport,
//           canImport,
//           canSettings,
//           loadPermissions,
//         ],
//       );

//     return (
//       <PermissionContext.Provider
//         value={contextValue}
//       >
//         {children}
//       </PermissionContext.Provider>
//     );
//   };

// // ============================================================
// // HOOK
// // ============================================================

// export const useEmployeePermissions =
//   (): PermissionContextValue => {
//     const context =
//       useContext(
//         PermissionContext,
//       );

//     if (!context) {
//       throw new Error(
//         "useEmployeePermissions must be used inside PermissionProvider.",
//       );
//     }

//     return context;
//   };

// export default PermissionProvider;







import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import axiosInstance from "@/services/axios/axiosInstance";

import {
  getUsername,
} from "@/pages/auth/utils/authStorage";

// ============================================================
// TYPES
// ============================================================

export interface PermissionActionState {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  settings: boolean;
}

export type PermissionMatrix =
  Record<string, PermissionActionState>;

interface EmployeeProfileResponse {
  id?: number | null;
  emp_id?: number | null;
  emp_code?: string | null;
}

interface RawPermissionValue {
  moduleId?: number | string | null;
  module_id?: number | string | null;

  moduleName?: string | null;
  module_name?: string | null;

  displayName?: string | null;
  display_name?: string | null;

  view?: boolean | number | string | null;
  add?: boolean | number | string | null;
  edit?: boolean | number | string | null;
  delete?: boolean | number | string | null;
  export?: boolean | number | string | null;
  import?: boolean | number | string | null;
  import_?: boolean | number | string | null;
  settings?: boolean | number | string | null;

  [key: string]: unknown;
}

interface PermissionApiResponse {
  targetType?: string;
  targetId?: string | number;

  permissions?: Record<
    string,
    RawPermissionValue
  >;

  data?: {
    permissions?: Record<
      string,
      RawPermissionValue
    >;
  };

  [key: string]: unknown;
}

interface PermissionContextValue {
  permissions: PermissionMatrix;

  loading: boolean;

  error: string | null;

  canView: (
    permissionName: string,
  ) => boolean;

  canAdd: (
    permissionName: string,
  ) => boolean;

  canEdit: (
    permissionName: string,
  ) => boolean;

  canDelete: (
    permissionName: string,
  ) => boolean;

  canExport: (
    permissionName: string,
  ) => boolean;

  canImport: (
    permissionName: string,
  ) => boolean;

  canSettings: (
    permissionName: string,
  ) => boolean;

  reloadPermissions: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const PermissionContext =
  createContext<
    PermissionContextValue | undefined
  >(undefined);

// ============================================================
// EMPTY PERMISSION
// ============================================================

const EMPTY_ACTION: PermissionActionState = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  export: false,
  import: false,
  settings: false,
};

// ============================================================
// NORMALIZE TEXT
// ============================================================

const normalizeName = (
  value: unknown,
): string => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
};

// ============================================================
// NORMALIZE BOOLEAN
// ============================================================
//
// IMPORTANT:
//
// PostgreSQL / FastAPI can sometimes return:
//
// true
// false
// 1
// 0
// "1"
// "0"
// "true"
// "false"
// "TRUE"
// "FALSE"
//
// Boolean("false") === true in JavaScript.
//
// Therefore we MUST NOT use Boolean(value)
// directly.
// ============================================================

const normalizeBoolean = (
  value: unknown,
): boolean => {
  if (
    value === true ||
    value === 1
  ) {
    return true;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value.trim().toLowerCase();

    return (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "y" ||
      normalized === "on"
    );
  }

  return false;
};

// ============================================================
// ADD PERMISSION KEY
// ============================================================

const addPermissionKey = (
  result: PermissionMatrix,
  key: string,
  permission: PermissionActionState,
): void => {
  const normalized =
    normalizeName(key);

  if (!normalized) {
    return;
  }

  result[normalized] =
    permission;
};

// ============================================================
// NORMALIZE API RESPONSE
// ============================================================

const normalizePermissions = (
  response: PermissionApiResponse,
): PermissionMatrix => {
  const result: PermissionMatrix = {};

  let rawPermissions:
    | Record<
        string,
        RawPermissionValue
      >
    | undefined;

  // ----------------------------------------------------------
  // Normal response
  // ----------------------------------------------------------

  if (
    response.permissions &&
    typeof response.permissions ===
      "object"
  ) {
    rawPermissions =
      response.permissions;
  }

  // ----------------------------------------------------------
  // Wrapped response
  // ----------------------------------------------------------

  else if (
    response.data?.permissions &&
    typeof response.data.permissions ===
      "object"
  ) {
    rawPermissions =
      response.data.permissions;
  }

  // ----------------------------------------------------------
  // Fallback
  // ----------------------------------------------------------

  else {
    rawPermissions =
      response as Record<
        string,
        RawPermissionValue
      >;
  }

  // ----------------------------------------------------------
  // MODULE ALIASES
  // ----------------------------------------------------------

  const aliases: Record<
    string,
    string[]
  > = {
    employee: [
      "employee",
      "employees",
      "employee management",
      "employee_management",
      "employee master",
      "employee_master",
    ],

    attendance: [
      "attendance",
      "attendance management",
      "attendance_management",
    ],

    recruitment: [
      "recruitment",
      "recruitment management",
      "recruitment_management",
    ],

    leave: [
      "leave",
      "leaves",
      "leave management",
      "leave_management",
    ],

    holiday: [
      "holiday",
      "holidays",
      "holiday management",
      "holiday_management",
    ],

    payroll: [
      "payroll",
      "payroll management",
      "payroll_management",
    ],

    policy: [
      "policy",
      "policies",
      "hr policy",
      "hr policies",
      "policy management",
      "policy_management",
    ],

    kra: [
      "kra",
      "kra management",
      "kra_management",
    ],

    settings: [
      "settings",
      "setting",
      "system settings",
    ],

    permission: [
      "permission",
      "permissions",
      "role permission",
      "role permissions",
      "user permission",
      "user permissions",
    ],

    dashboard: [
      "dashboard",
      "my dashboard",
      "dashboard management",
    ],
  };

  // ----------------------------------------------------------
  // BUILD MATRIX
  // ----------------------------------------------------------

  Object.entries(
    rawPermissions ?? {},
  ).forEach(
    ([
      originalKey,
      rawValue,
    ]) => {
      if (
        !rawValue ||
        typeof rawValue !==
          "object"
      ) {
        return;
      }

      // ------------------------------------------------------
      // MODULE NAME
      // ------------------------------------------------------

      const moduleName =
        String(
          rawValue.moduleName ??
            rawValue.module_name ??
            originalKey,
        ).trim();

      // ------------------------------------------------------
      // DISPLAY NAME
      // ------------------------------------------------------

      const displayName =
        String(
          rawValue.displayName ??
            rawValue.display_name ??
            moduleName,
        ).trim();

      if (!moduleName) {
        return;
      }

      // ------------------------------------------------------
      // PERMISSION STATE
      // ------------------------------------------------------

      const permission: PermissionActionState =
        {
          view:
            normalizeBoolean(
              rawValue.view,
            ),

          add:
            normalizeBoolean(
              rawValue.add,
            ),

          edit:
            normalizeBoolean(
              rawValue.edit,
            ),

          delete:
            normalizeBoolean(
              rawValue.delete,
            ),

          export:
            normalizeBoolean(
              rawValue.export,
            ),

          import:
            normalizeBoolean(
              rawValue.import ??
                rawValue.import_,
            ),

          settings:
            normalizeBoolean(
              rawValue.settings,
            ),
        };

      // ------------------------------------------------------
      // STORE ORIGINAL KEY
      // ------------------------------------------------------

      addPermissionKey(
        result,
        originalKey,
        permission,
      );

      // ------------------------------------------------------
      // STORE MODULE NAME
      // ------------------------------------------------------

      addPermissionKey(
        result,
        moduleName,
        permission,
      );

      // ------------------------------------------------------
      // STORE DISPLAY NAME
      // ------------------------------------------------------

      addPermissionKey(
        result,
        displayName,
        permission,
      );

      // ------------------------------------------------------
      // DETERMINE CATEGORY
      // ------------------------------------------------------

      const normalizedModule =
        normalizeName(
          moduleName,
        );

      Object.entries(
        aliases,
      ).forEach(
        ([
          category,
          categoryAliases,
        ]) => {
          const matched =
            categoryAliases.some(
              (alias) =>
                normalizeName(
                  alias,
                ) ===
                normalizedModule,
            );

          if (!matched) {
            return;
          }

          // -----------------------------------------------
          // Store category
          // -----------------------------------------------

          addPermissionKey(
            result,
            category,
            permission,
          );

          // -----------------------------------------------
          // Store all aliases
          // -----------------------------------------------

          categoryAliases.forEach(
            (alias) => {
              addPermissionKey(
                result,
                alias,
                permission,
              );
            },
          );
        },
      );
    },
  );

  return result;
};

// ============================================================
// PROVIDER
// ============================================================

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const [
    permissions,
    setPermissions,
  ] =
    useState<PermissionMatrix>(
      {},
    );

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  // ==========================================================
  // LOAD PERMISSIONS
  // ==========================================================

  const loadPermissions =
    useCallback(
      async (): Promise<void> => {
        try {
          setLoading(true);
          setError(null);

          // --------------------------------------------------
          // Logged-in employee code
          // --------------------------------------------------

          const employeeCode =
            getUsername()?.trim();

          console.log(
            "[PERMISSION] Employee Code:",
            employeeCode,
          );

          if (!employeeCode) {
            setPermissions({});

            setError(
              "Logged-in employee code is not available.",
            );

            return;
          }

          // --------------------------------------------------
          // Employee profile
          // --------------------------------------------------

          const profileResponse =
            await axiosInstance.get<EmployeeProfileResponse>(
              `/api/v1/employees/profile/${encodeURIComponent(
                employeeCode,
              )}`,
            );

          const profile =
            profileResponse.data;

          console.log(
            "[PERMISSION] Employee Profile:",
            profile,
          );

          // --------------------------------------------------
          // Employee / user ID
          // --------------------------------------------------

          const employeeId =
            profile.emp_id ??
            profile.id;

          console.log(
            "[PERMISSION] Employee ID:",
            employeeId,
          );

          if (
            employeeId ===
              null ||
            employeeId ===
              undefined ||
            !Number.isInteger(
              employeeId,
            ) ||
            employeeId <= 0
          ) {
            setPermissions({});

            setError(
              "Employee database ID could not be resolved.",
            );

            console.error(
              "[PERMISSION] Invalid employee ID:",
              employeeId,
            );

            return;
          }

          // --------------------------------------------------
          // Permission API
          // --------------------------------------------------

          const permissionResponse =
            await axiosInstance.get<PermissionApiResponse>(
              `/api/v1/permissions/user/${encodeURIComponent(
                employeeId,
              )}`,
            );

          // --------------------------------------------------
          // RAW RESPONSE
          // --------------------------------------------------

          console.log(
            "[PERMISSION] API Response:",
            permissionResponse.data,
          );

          // --------------------------------------------------
          // NORMALIZE
          // --------------------------------------------------

          const matrix =
            normalizePermissions(
              permissionResponse.data,
            );

          // --------------------------------------------------
          // SAVE
          // --------------------------------------------------

          setPermissions(
            matrix,
          );

          // --------------------------------------------------
          // DEBUG
          // --------------------------------------------------

          console.log(
            "========================================",
          );

          console.log(
            "[PERMISSION] Employee Code:",
            employeeCode,
          );

          console.log(
            "[PERMISSION] Employee ID:",
            employeeId,
          );

          console.log(
            "[PERMISSION] API Response:",
            permissionResponse.data,
          );

          console.log(
            "[PERMISSION] Normalized Matrix:",
            matrix,
          );

          console.log(
            "[PERMISSION] Available Modules:",
            Object.keys(matrix),
          );

          console.log(
            "========================================",
          );
        } catch (
          err: unknown
        ) {
          console.error(
            "[PERMISSION] Failed to load permissions:",
            err,
          );

          setPermissions({});

          if (
            typeof err ===
              "object" &&
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

            setError(
              axiosError
                .response
                ?.data
                ?.detail ??
                axiosError
                  .response
                  ?.data
                  ?.message ??
                "Failed to load employee permissions.",
            );
          } else if (
            err instanceof Error
          ) {
            setError(
              err.message,
            );
          } else {
            setError(
              "Failed to load employee permissions.",
            );
          }
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadPermissions();
  }, [
    loadPermissions,
  ]);

  // ==========================================================
  // FIND PERMISSION
  // ==========================================================

  const findPermission =
    useCallback(
      (
        permissionName: string,
      ): PermissionActionState => {
        const normalized =
          normalizeName(
            permissionName,
          );

        if (!normalized) {
          return EMPTY_ACTION;
        }

        // ----------------------------------------------------
        // Exact normalized key
        // ----------------------------------------------------

        const direct =
          permissions[
            normalized
          ];

        if (direct) {
          return direct;
        }

        // ----------------------------------------------------
        // Search all normalized keys
        // ----------------------------------------------------

        const matchingKey =
          Object.keys(
            permissions,
          ).find(
            (key) =>
              normalizeName(
                key,
              ) ===
              normalized,
          );

        if (
          matchingKey
        ) {
          return permissions[
            matchingKey
          ];
        }

        return EMPTY_ACTION;
      },
      [permissions],
    );

  // ==========================================================
  // GENERIC CHECK
  // ==========================================================

  const can =
    useCallback(
      (
        permissionName: string,
        action:
          keyof PermissionActionState,
      ): boolean => {
        const permission =
          findPermission(
            permissionName,
          );

        return Boolean(
          permission[action],
        );
      },
      [findPermission],
    );

  // ==========================================================
  // ACTIONS
  // ==========================================================

  const canView =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "view",
        ),
      [can],
    );

  const canAdd =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "add",
        ),
      [can],
    );

  const canEdit =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "edit",
        ),
      [can],
    );

  const canDelete =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "delete",
        ),
      [can],
    );

  const canExport =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "export",
        ),
      [can],
    );

  const canImport =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "import",
        ),
      [can],
    );

  const canSettings =
    useCallback(
      (
        name: string,
      ) =>
        can(
          name,
          "settings",
        ),
      [can],
    );

  // ==========================================================
  // CONTEXT
  // ==========================================================

  const contextValue =
    useMemo(
      () => ({
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
      }),
      [
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
        loadPermissions,
      ],
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <PermissionContext.Provider
      value={contextValue}
    >
      {children}
    </PermissionContext.Provider>
  );
};

// ============================================================
// HOOK
// ============================================================

export const useEmployeePermissions =
  (): PermissionContextValue => {
    const context =
      useContext(
        PermissionContext,
      );

    if (!context) {
      throw new Error(
        "useEmployeePermissions must be used inside PermissionProvider.",
      );
    }

    return context;
  };

export default PermissionProvider;