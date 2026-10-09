import type {
  PermissionActionId,
  PermissionApiActionState,
  PermissionApiMatrix,
  PermissionApiSaveMatrix,
  PermissionMatrixUI,
} from "../types/settings.types";

// ============================================================
// DEFAULT ACTIONS
// ============================================================

const createEmptyActions =
  (): PermissionApiActionState => ({
    view: false,
    add: false,
    edit: false,
    delete: false,
    export: false,
    import: false,
    settings: false,
  });

// ============================================================
// NORMALIZE ACTIONS
// ============================================================

const normalizePermissionActions =
  (
    value:
      | PermissionApiActionState
      | undefined,
  ): PermissionApiActionState => {

    if (!value) {
      return createEmptyActions();
    }

    return {
      view:
        Boolean(value.view),

      add:
        Boolean(value.add),

      edit:
        Boolean(value.edit),

      delete:
        Boolean(value.delete),

      export:
        Boolean(value.export),

      import:
        Boolean(value.import),

      settings:
        Boolean(value.settings),
    };
  };

// ============================================================
// API -> UI
//
// FastAPI:
// import_
//
// UI:
// import
// ============================================================

const apiToUiMatrix = (
  apiMatrix:
    | PermissionApiMatrix
    | undefined,
): PermissionMatrixUI => {

  const result:
    PermissionMatrixUI = {};

  if (!apiMatrix) {
    return result;
  }

  Object.entries(
    apiMatrix,
  ).forEach(
    ([
      permissionId,
      actions,
    ]) => {

      result[
        permissionId
      ] = {
        view:
          Boolean(
            actions?.view,
          ),

        add:
          Boolean(
            actions?.add,
          ),

        edit:
          Boolean(
            actions?.edit,
          ),

        delete:
          Boolean(
            actions?.delete,
          ),

        export:
          Boolean(
            actions?.export,
          ),

        import:
          Boolean(
            actions?.import ??
              (
                actions as any
              )?.import_,
          ),

        settings:
          Boolean(
            actions?.settings,
          ),
      };
    },
  );

  return result;
};

// ============================================================
// UI -> API
//
// UI:
// import
//
// FastAPI:
// import_
// ============================================================

const uiToApiMatrix = (
  uiMatrix:
    PermissionMatrixUI,

  permissionIds:
    string[],
): PermissionApiSaveMatrix => {

  const result:
    PermissionApiSaveMatrix = {};

  permissionIds.forEach(
    (
      permissionId,
    ) => {

      const actions =
        normalizePermissionActions(
          uiMatrix[
            permissionId
          ],
        );

      result[
        permissionId
      ] = {

        view:
          actions.view,

        add:
          actions.add,

        edit:
          actions.edit,

        delete:
          actions.delete,

        export:
          actions.export,

        import:
          actions.import,

        settings:
          actions.settings,
      };
    },
  );

  return result;
};

// ============================================================
// TOGGLE
// ============================================================

const togglePermission = (
  matrix:
    PermissionMatrixUI,

  permissionId:
    string,

  actionId:
    PermissionActionId,
): PermissionMatrixUI => {

  const current =
    normalizePermissionActions(
      matrix[
        permissionId
      ],
    );

  return {
    ...matrix,

    [permissionId]: {
      ...current,

      [actionId]:
        !current[
          actionId
        ],
    },
  };
};

// ============================================================
// SELECT ALL
// ============================================================

const selectAll = (
  matrix:
    PermissionMatrixUI,

  permissionIds:
    string[],
): PermissionMatrixUI => {

  const result = {
    ...matrix,
  };

  permissionIds.forEach(
    (
      permissionId,
    ) => {

      result[
        permissionId
      ] = {
        view: true,
        add: true,
        edit: true,
        delete: true,
        export: true,
        import: true,
        settings: true,
      };
    },
  );

  return result;
};

// ============================================================
// CLEAR ALL
// ============================================================

const clearAll = (
  matrix:
    PermissionMatrixUI,

  permissionIds:
    string[],
): PermissionMatrixUI => {

  const result = {
    ...matrix,
  };

  permissionIds.forEach(
    (
      permissionId,
    ) => {

      result[
        permissionId
      ] =
        createEmptyActions();
    },
  );

  return result;
};

// ============================================================
// RESET
// ============================================================

const reset = (
  permissionIds:
    string[],
): PermissionMatrixUI => {

  const result:
    PermissionMatrixUI = {};

  permissionIds.forEach(
    (
      permissionId,
    ) => {

      result[
        permissionId
      ] =
        createEmptyActions();
    },
  );

  return result;
};

// ============================================================
// MATRIX -> ENTRIES
// ============================================================

const matrixToEntries = (
  matrix:
    PermissionMatrixUI,
): Array<{
  permission_id: string;
  action: PermissionActionId;
  enabled: boolean;
}> => {

  const entries:
    Array<{
      permission_id: string;
      action: PermissionActionId;
      enabled: boolean;
    }> = [];

  Object.entries(
    matrix,
  ).forEach(
    ([
      permissionId,
      actions,
    ]) => {

      (
        Object.keys(
          actions,
        ) as PermissionActionId[]
      ).forEach(
        (
          action,
        ) => {

          entries.push({
            permission_id:
              permissionId,

            action,

            enabled:
              Boolean(
                actions[
                  action
                ],
              ),
          });
        },
      );
    },
  );

  return entries;
};

// ============================================================
// EXPORT
// ============================================================

export const permissionMapper = {
  apiToUiMatrix,

  uiToApiMatrix,

  togglePermission,

  selectAll,

  clearAll,

  reset,

  matrixToEntries,
};

export {
  apiToUiMatrix,
  uiToApiMatrix,
  togglePermission,
  selectAll,
  clearAll,
  reset,
  matrixToEntries,
};