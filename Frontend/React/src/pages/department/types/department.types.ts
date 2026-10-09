/**
 * @file department.types.ts
 * @description Type definitions for Department module.
 */

export type DepartmentStatus =
  | "active"
  | "inactive";

export interface Department {
  id: number | string;
  name: string;

  /**
   * UI-only fields.
   *
   * The current Department API does not expose
   * status and employeeCount.
   */
  status: DepartmentStatus;
  employeeCount: number;
}

/**
 * Raw Department response returned by the API.
 */
export interface DepartmentApiResponse {
  id: number | string;
  name: string;
}

export interface CreateDepartmentRequest {
  name: string;
}

export interface UpdateDepartmentRequest {
  name: string;
}

export interface DepartmentFormData {
  id?: number | string;
  name: string;
  status: "Active" | "Inactive";
}

export interface DepartmentFilters {
  search?: string;
  status?: DepartmentStatus | "";
  page?: number;
  limit?: number;
}