/**
 * @file designation.types.ts
 * @description Types used by the Designation module.
 */

/**
 * UI status.
 *
 * IMPORTANT:
 * The current Designation API shown in Swagger does NOT expose
 * a status field.
 *
 * Therefore this remains a UI/display property only.
 */
export type DesignationStatus =
  | "Active"
  | "Inactive";

/**
 * Department returned by Department API.
 */
export interface Department {
  id: number;
  name: string;
}

/**
 * Raw designation object returned by API.
 *
 * Based on the Swagger contract:
 *
 * {
 *   "id": 1022,
 *   "name": "Software Developer",
 *   "depart_id": 5
 * }
 */
export interface DesignationApiResponse {
  id: number;
  name: string;
  depart_id: number;
}

/**
 * Request body expected by:
 *
 * POST /api/v1/designations/
 *
 * and:
 *
 * PUT /api/v1/designations/{id}
 */
export interface DesignationApiRequest {
  name: string;
  depart_id: number;
}

/**
 * Frontend/UI designation model.
 *
 * This model intentionally preserves the existing UI structure.
 */
export interface Designation {
  id: number;
  name: string;

  /**
   * API field:
   * depart_id
   */
  departmentId: number;

  /**
   * Resolved from Department API.
   */
  departmentName: string;

  /**
   * UI-only because current API does not expose status.
   */
  status: DesignationStatus;

  /**
   * UI-only because current API does not expose employee count.
   */
  employeeCount: number;
}

/**
 * Form data used by the frontend.
 */
export interface DesignationFormData {
  name: string;
  departmentId: number | "";
  status: DesignationStatus;
}

/**
 * Existing filter model.
 */
export interface DesignationFilters {
  search: string;
  departmentId: number | "";
  status: "All" | DesignationStatus;
}

/**
 * Statistics shown in the existing UI.
 */
export interface DesignationStatistics {
  total: number;
  active: number;
  inactive: number;
  departmentsCovered: number;
}

/**
 * Pagination state.
 */
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}