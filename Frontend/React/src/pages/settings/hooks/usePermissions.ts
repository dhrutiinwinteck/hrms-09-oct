import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import settingsService from "../services/settings.service";

import type {
  Module,
  PermissionActionId,
  PermissionAdminOption,
  PermissionMatrixUI,
  PermissionRow,
  PermissionUserOption,
} from "../types/settings.types";

import {
  PERMISSION_ACTIONS,
} from "../constants/settings.constants";

import {
  permissionMapper,
} from "../utils/permissionMapper";

// ============================================================
// TARGET TYPE
// ============================================================

export type PermissionTargetType =
  | "admin"
  | "employee";

// ============================================================
// HOOK
// ============================================================

export function usePermissions() {
  // ==========================================================
  // CONFIGURATION
  // ==========================================================

  const [modules, setModules] =
    useState<Module[]>([]);

  const [permissionRows, setPermissionRows] =
    useState<PermissionRow[]>([]);

  const [selectedModuleId, setSelectedModuleId] =
    useState<string>("");

  // ==========================================================
  // TARGET
  // ==========================================================

  const [targetType, setTargetType] =
    useState<PermissionTargetType>(
      "employee",
    );

  const [targetId, setTargetId] =
    useState<string>("");

  const [selectedTargetName, setSelectedTargetName] =
    useState<string>("");

  // ==========================================================
  // REAL EMPLOYEES
  // ==========================================================

  const [employees, setEmployees] =
    useState<PermissionUserOption[]>([]);

  // ==========================================================
  // ADMIN
  //
  // There is currently no confirmed role-list endpoint in
  // the supplied backend contract.
  //
  // Therefore we do NOT create fake admin data.
  // ==========================================================

  const [admins] =
    useState<PermissionAdminOption[]>([]);

  // ==========================================================
  // PERMISSION MATRIX
  // ==========================================================

  const [permissionMatrix, setPermissionMatrix] =
    useState<PermissionMatrixUI>({});

  const [permissionsLoaded, setPermissionsLoaded] =
    useState<boolean>(false);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState<boolean>(false);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const [saveMessage, setSaveMessage] =
    useState<string | null>(null);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadConfiguration =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const [
            modulesData,
            rowsData,
            employeesData,
          ] = await Promise.all([
            settingsService.getModules(),
            settingsService.getPermissionRows(),
            settingsService.getEmployees(),
          ]);

          if (cancelled) {
            return;
          }

          setModules(
            modulesData,
          );

          setPermissionRows(
            rowsData,
          );

          setEmployees(
            employeesData,
          );

          if (
            modulesData.length > 0
          ) {
            setSelectedModuleId(
              modulesData[0].id,
            );
          }
        } catch (err: unknown) {
          if (cancelled) {
            return;
          }

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load permission configuration.",
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    void loadConfiguration();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // CURRENT MODULE ROWS
  // ==========================================================

  const currentRows = useMemo(
    () =>
      permissionRows.filter(
        (row) =>
          row.moduleId ===
          selectedModuleId,
      ),
    [
      permissionRows,
      selectedModuleId,
    ],
  );

  // ==========================================================
  // CURRENT MODULE
  // ==========================================================

  const currentModule = useMemo(
    () =>
      modules.find(
        (module) =>
          module.id ===
          selectedModuleId,
      ),
    [
      modules,
      selectedModuleId,
    ],
  );

  // ==========================================================
  // SELECTED EMPLOYEE
  // ==========================================================

  const selectedEmployee =
    useMemo(
      () =>
        employees.find(
          (employee) =>
            String(
              employee.id,
            ) ===
            String(
              targetId,
            ),
        ),
      [
        employees,
        targetId,
      ],
    );

  // ==========================================================
  // MODULE CHANGE
  // ==========================================================

  const handleModuleSelect =
    useCallback(
      (
        moduleId: string,
      ) => {
        setSelectedModuleId(
          moduleId,
        );

        /*
         * IMPORTANT:
         *
         * Do not clear the permission matrix.
         *
         * The matrix contains all 33 permission
         * rows. Module selection only changes
         * what is displayed.
         */

        setError(null);
        setSaveMessage(null);
      },
      [],
    );

  // ==========================================================
  // TARGET TYPE CHANGE
  // ==========================================================

  const handleTargetTypeChange =
    useCallback(
      (
        type: PermissionTargetType,
      ) => {
        setTargetType(type);

        setTargetId("");

        setSelectedTargetName("");

        setPermissionMatrix({});

        setPermissionsLoaded(false);

        setError(null);

        setSaveMessage(null);
      },
      [],
    );

  // ==========================================================
  // TARGET CHANGE
  // ==========================================================

  const handleTargetIdChange =
    useCallback(
      (
        value: string,
        name?: string,
      ) => {
        setTargetId(value);

        setSelectedTargetName(
          name || "",
        );

        /*
         * Changing the target means the previously
         * loaded matrix belongs to another target.
         */

        setPermissionMatrix({});

        setPermissionsLoaded(false);

        setError(null);

        setSaveMessage(null);
      },
      [],
    );

  // ==========================================================
  // LOAD PERMISSIONS
  // ==========================================================

  const loadPermissions =
    useCallback(
      async (): Promise<boolean> => {
        const id =
          targetId.trim();

        if (!id) {
          setError(
            `Select an ${
              targetType ===
              "admin"
                ? "Admin"
                : "Employee"
            } before loading permissions.`,
          );

          return false;
        }

        try {
          setLoading(true);

          setError(null);

          setSaveMessage(null);

          setPermissionsLoaded(
            false,
          );

          let apiMatrix;

          // --------------------------------------------------
          // ADMIN -> ROLE API
          // --------------------------------------------------

          if (
            targetType ===
            "admin"
          ) {
            apiMatrix =
              await settingsService.getRolePermissions(
                id,
              );
          }

          // --------------------------------------------------
          // EMPLOYEE -> USER API
          // --------------------------------------------------

          else {
            apiMatrix =
              await settingsService.getUserPermissions(
                id,
              );
          }

          // --------------------------------------------------
          // CREATE COMPLETE MATRIX
          // --------------------------------------------------

          const allPermissionIds =
            permissionRows.map(
              (row) =>
                row.id,
            );

          const emptyMatrix =
            permissionMapper.reset(
              allPermissionIds,
            );

          const loadedMatrix =
            permissionMapper.apiToUiMatrix(
              apiMatrix,
            );

          allPermissionIds.forEach(
            (permissionId) => {
              if (
                loadedMatrix[
                  permissionId
                ]
              ) {
                emptyMatrix[
                  permissionId
                ] =
                  loadedMatrix[
                    permissionId
                  ];
              }
            },
          );

          setPermissionMatrix(
            emptyMatrix,
          );

          setPermissionsLoaded(
            true,
          );

          return true;
        } catch (err: unknown) {
          setPermissionMatrix({});

          setPermissionsLoaded(
            false,
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load permissions.",
          );

          return false;
        } finally {
          setLoading(false);
        }
      },
      [
        targetId,
        targetType,
        permissionRows,
      ],
    );

  // ==========================================================
  // TOGGLE
  // ==========================================================

  const handlePermissionToggle =
    useCallback(
      (
        permissionId: string,
        actionId: PermissionActionId,
      ) => {
        if (
          !permissionsLoaded
        ) {
          return;
        }

        setPermissionMatrix(
          (previous) =>
            permissionMapper.togglePermission(
              previous,
              permissionId,
              actionId,
            ),
        );

        setSaveMessage(null);

        setError(null);
      },
      [permissionsLoaded],
    );

  // ==========================================================
  // SELECT ALL
  // ==========================================================

  const handleSelectAll =
    useCallback(
      () => {
        if (
          !permissionsLoaded
        ) {
          return;
        }

        const ids =
          currentRows.map(
            (row) =>
              row.id,
          );

        setPermissionMatrix(
          (previous) =>
            permissionMapper.selectAll(
              previous,
              ids,
            ),
        );

        setSaveMessage(null);
      },
      [
        currentRows,
        permissionsLoaded,
      ],
    );

  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  const handleClearAll =
    useCallback(
      () => {
        if (
          !permissionsLoaded
        ) {
          return;
        }

        const ids =
          currentRows.map(
            (row) =>
              row.id,
          );

        setPermissionMatrix(
          (previous) =>
            permissionMapper.clearAll(
              previous,
              ids,
            ),
        );

        setSaveMessage(null);
      },
      [
        currentRows,
        permissionsLoaded,
      ],
    );

  // ==========================================================
  // RESET CURRENT MODULE
  // ==========================================================

  const handleResetModule =
    useCallback(
      () => {
        if (
          !permissionsLoaded
        ) {
          return;
        }

        const ids =
          currentRows.map(
            (row) =>
              row.id,
          );

        const resetMatrix =
          permissionMapper.reset(
            ids,
          );

        setPermissionMatrix(
          (previous) => {
            const result = {
              ...previous,
            };

            ids.forEach(
              (id) => {
                result[id] =
                  resetMatrix[id];
              },
            );

            return result;
          },
        );

        setSaveMessage(null);
      },
      [
        currentRows,
        permissionsLoaded,
      ],
    );

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave =
    useCallback(
      async (): Promise<boolean> => {
        const id =
          targetId.trim();

        if (!id) {
          setError(
            `Select an ${
              targetType ===
              "admin"
                ? "Admin"
                : "Employee"
            } before saving.`,
          );

          return false;
        }

        if (
          !permissionsLoaded
        ) {
          setError(
            "Load permissions before saving.",
          );

          return false;
        }

        try {
          setSaving(true);

          setError(null);

          setSaveMessage(null);

          // --------------------------------------------------
          // ALL 33 PERMISSION IDs
          // --------------------------------------------------

          const permissionIds =
            permissionRows.map(
              (row) =>
                row.id,
            );

          // --------------------------------------------------
          // UI -> API
          //
          // import -> import_
          // --------------------------------------------------

          const apiMatrix =
            permissionMapper.uiToApiMatrix(
              permissionMatrix,
              permissionIds,
            );

          // --------------------------------------------------
          // ADMIN
          // --------------------------------------------------

          if (
            targetType ===
            "admin"
          ) {
            const response =
              await settingsService.saveRolePermissions(
                id,
                apiMatrix,
              );

            setSaveMessage(
              response?.message ||
                "Admin permissions saved successfully.",
            );
          }

          // --------------------------------------------------
          // EMPLOYEE
          // --------------------------------------------------

          else {
            const response =
              await settingsService.saveUserPermissions(
                id,
                apiMatrix,
              );

            setSaveMessage(
              response?.message ||
                "Employee permissions saved successfully.",
            );
          }

          return true;
        } catch (err: unknown) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to save permissions.",
          );

          return false;
        } finally {
          setSaving(false);
        }
      },
      [
        targetId,
        targetType,
        permissionsLoaded,
        permissionRows,
        permissionMatrix,
      ],
    );

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    modules,

    permissionRows,

    currentRows,

    currentModule,

    selectedModuleId,

    handleModuleSelect,

    targetType,

    handleTargetTypeChange,

    targetId,

    handleTargetIdChange,

    selectedTargetName,

    employees,

    admins,

    selectedEmployee,

    permissionMatrix,

    permissionsLoaded,

    handlePermissionToggle,

    handleSelectAll,

    handleClearAll,

    handleResetModule,

    loadPermissions,

    handleSave,

    loading,

    saving,

    error,

    saveMessage,

    actionIds:
      PERMISSION_ACTIONS.map(
        (action) =>
          action.id,
      ),
  };
}