// ============================================================
// PASSWORD STRENGTH
// ============================================================

export enum PasswordStrengthLevel {
  NONE = "none",
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

export interface PasswordStrengthMeta {
  label: string;
  colorClass: string;
  colorHex: string;
  minScore: number;
}

// ============================================================
// PERMISSION ACTION
// ============================================================

export type PermissionActionId =
  | "view"
  | "add"
  | "edit"
  | "delete"
  | "export"
  | "import"
  | "settings";

// ============================================================
// PERMISSION COLUMN
// ============================================================

export interface PermissionColumn {
  id: PermissionActionId;
  label: string;
  description?: string;
}

// ============================================================
// PERMISSION ACTION
// ============================================================

export interface PermissionAction {
  id: PermissionActionId;
  label: string;
}

// ============================================================
// API GET ACTION STATE
// ============================================================

export interface PermissionApiActionState {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  settings: boolean;
}

// ============================================================
// API SAVE ACTION STATE
//
// IMPORTANT:
//
// Frontend:
// import
//
// FastAPI:
// import_
// ============================================================

export interface PermissionApiSaveActionState {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
  settings: boolean;
}

// ============================================================
// API MATRIX
// ============================================================

export type PermissionApiMatrix =
  Record<
    string,
    PermissionApiActionState
  >;

// ============================================================
// API SAVE MATRIX
// ============================================================

export type PermissionApiSaveMatrix =
  Record<
    string,
    PermissionApiSaveActionState
  >;

// ============================================================
// UI MATRIX
// ============================================================

export type PermissionMatrixUI =
  Record<
    string,
    PermissionApiActionState
  >;

// ============================================================
// PERMISSION ENTRY
// ============================================================

export interface PermissionEntry {
  permission_id: string;
  action: PermissionActionId;
  enabled: boolean;
}

// ============================================================
// API RESPONSE
// ============================================================

export interface PermissionApiResponse {
  permissions?: PermissionApiMatrix;

  data?: {
    permissions?: PermissionApiMatrix;
  };
}

// ============================================================
// MODULE
// ============================================================

export interface Module {
  id: string;
  name: string;
}

// ============================================================
// PERMISSION ROW
// ============================================================

export interface PermissionRow {
  id: string;
  label: string;
  moduleId: string;
}

// ============================================================
// REAL EMPLOYEE
// ============================================================

export interface PermissionUserOption {
  id: string | number;

  emp_id?:
    | string
    | number;

  emp_code?: string;

  first_name?: string;

  last_name?: string;

  employee_name: string;
}

// ============================================================
// ADMIN OPTION
//
// Currently kept as a type only.
// We are NOT creating fake admin data.
// ============================================================

export interface PermissionAdminOption {
  id: string | number;

  name: string;

  code?: string;

  description?: string;
}

// ============================================================
// SAVE RESPONSE
// ============================================================

export interface SavePermissionResponse {
  success?: boolean;
  message?: string;
  detail?: string;
}

// ============================================================
// EXISTING PASSWORD TYPES
// ============================================================

export interface ChangePasswordRequest {
  email: string;
  password: string;
}

export interface ChangePasswordResponse {
  success?: boolean;
  message?: string;
  detail?: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export interface ChangePasswordByEmployeeCodeRequest {
  emp_code: string;
  password: string;
}

export interface ChangePasswordByEmployeeCodeResponse {
  success?: boolean;
  message?: string;
  detail?: string;
}