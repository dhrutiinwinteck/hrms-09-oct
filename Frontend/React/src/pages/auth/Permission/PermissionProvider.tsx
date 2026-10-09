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

interface PermissionApiResponse {
  permissions?: Record<
    string,
    Partial<PermissionActionState>
  >;

  data?: {
    permissions?: Record<
      string,
      Partial<PermissionActionState>
    >;
  };

  [key: string]: unknown;
}

interface PermissionContextValue {
  permissions: PermissionMatrix;

  loading: boolean;

  error: string | null;

  canView: (
    permissionId: string,
  ) => boolean;

  canAdd: (
    permissionId: string,
  ) => boolean;

  canEdit: (
    permissionId: string,
  ) => boolean;

  canDelete: (
    permissionId: string,
  ) => boolean;

  canExport: (
    permissionId: string,
  ) => boolean;

  canImport: (
    permissionId: string,
  ) => boolean;

  canSettings: (
    permissionId: string,
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
// EMPTY ACTION
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
// NORMALIZE API RESPONSE
// ============================================================

const normalizePermissions = (
  response: PermissionApiResponse,
): PermissionMatrix => {
  // ----------------------------------------------------------
  // Response:
  //
  // {
  //   "permissions": {
  //      "dashboard_my": {...}
  //   }
  // }
  // ----------------------------------------------------------

  if (
    response.permissions &&
    typeof response.permissions ===
      "object"
  ) {
    return normalizeMatrix(
      response.permissions,
    );
  }

  // ----------------------------------------------------------
  // Response:
  //
  // {
  //   "data": {
  //      "permissions": {
  //         ...
  //      }
  //   }
  // }
  // ----------------------------------------------------------

  if (
    response.data?.permissions &&
    typeof response.data.permissions ===
      "object"
  ) {
    return normalizeMatrix(
      response.data.permissions,
    );
  }

  // ----------------------------------------------------------
  // Direct matrix:
  //
  // {
  //   "dashboard_my": {...}
  // }
  // ----------------------------------------------------------

  return normalizeMatrix(
    response as Record<
      string,
      unknown
    >,
  );
};

// ============================================================
// NORMALIZE MATRIX
// ============================================================

const normalizeMatrix = (
  matrix: Record<
    string,
    unknown
  >,
): PermissionMatrix => {
  const result: PermissionMatrix = {};

  Object.entries(matrix).forEach(
    ([permissionId, rawValue]) => {
      if (
        !rawValue ||
        typeof rawValue !== "object"
      ) {
        return;
      }

      const value =
        rawValue as Partial<PermissionActionState>;

      result[permissionId] = {
        view: Boolean(value.view),
        add: Boolean(value.add),
        edit: Boolean(value.edit),
        delete: Boolean(value.delete),
        export: Boolean(value.export),
        import: Boolean(value.import),
        settings: Boolean(
          value.settings,
        ),
      };
    },
  );

  return result;
};

// ============================================================
// PROVIDER
// ============================================================

export const PermissionProvider =
  ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => {
    const [
      permissions,
      setPermissions,
    ] =
      useState<PermissionMatrix>({});

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

    // ========================================================
    // LOAD PERMISSIONS
    // ========================================================

    const loadPermissions =
      useCallback(async (): Promise<void> => {
        try {
          setLoading(true);
          setError(null);

          // --------------------------------------------------
          // Get logged-in employee code
          // --------------------------------------------------

          const employeeCode =
            getUsername()?.trim();

          if (!employeeCode) {
            setPermissions({});

            setError(
              "Logged-in employee code is not available.",
            );

            return;
          }

          // --------------------------------------------------
          // Get employee profile
          // --------------------------------------------------

          const profileResponse =
            await axiosInstance.get<EmployeeProfileResponse>(
              `/api/v1/employees/profile/${encodeURIComponent(
                employeeCode,
              )}`,
            );

          const profile =
            profileResponse.data;

          // --------------------------------------------------
          // Resolve database employee/user ID
          // --------------------------------------------------

          const employeeId =
            profile.emp_id ??
            profile.id;

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

            return;
          }

          // --------------------------------------------------
          // GET REAL USER PERMISSIONS
          // --------------------------------------------------

          const permissionResponse =
            await axiosInstance.get<PermissionApiResponse>(
              `/api/v1/permissions/user/${encodeURIComponent(
                employeeId,
              )}`,
            );

          const matrix =
            normalizePermissions(
              permissionResponse.data,
            );

          setPermissions(matrix);
        } catch (err: unknown) {
          console.error(
            "Failed to load employee permissions:",
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
              axiosError.response
                ?.data?.detail ||
                axiosError.response
                  ?.data?.message ||
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

    // ========================================================
    // LOAD ON APPLICATION LAYOUT
    // ========================================================

    useEffect(() => {
      void loadPermissions();
    }, [loadPermissions]);

    // ========================================================
    // GENERIC CHECK
    // ========================================================

    const can = useCallback(
      (
        permissionId: string,
        action: keyof PermissionActionState,
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

    // ========================================================
    // ACTION CHECKERS
    // ========================================================

    const canView =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "view",
          ),
        [can],
      );

    const canAdd =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "add",
          ),
        [can],
      );

    const canEdit =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "edit",
          ),
        [can],
      );

    const canDelete =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "delete",
          ),
        [can],
      );

    const canExport =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "export",
          ),
        [can],
      );

    const canImport =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "import",
          ),
        [can],
      );

    const canSettings =
      useCallback(
        (
          permissionId: string,
        ): boolean =>
          can(
            permissionId,
            "settings",
          ),
        [can],
      );

    // ========================================================
    // CONTEXT VALUE
    // ========================================================

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