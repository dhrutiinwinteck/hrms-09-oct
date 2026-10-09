/**
 * @file department.mapper.ts
 * @description Maps Department API models to frontend models.
 */

import {
  Department,
  DepartmentApiResponse,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentFormData,
} from "../types/department.types";

/**
 * Maps API Department → UI Department.
 *
 * Current API response:
 *
 * {
 *   "id": 1,
 *   "name": "IT"
 * }
 *
 * Status and employeeCount are not currently
 * provided by the Department API.
 */
export const mapDepartmentFromApi = (
  data: DepartmentApiResponse,
): Department => ({
  id: data.id,
  name: data.name,

  /**
   * Current backend does not return status.
   */
  status: "active",

  /**
   * Current backend does not return employee count.
   */
  employeeCount: 0,
});

/**
 * Maps Add form → POST request.
 */
export const mapCreateDepartmentRequest = (
  data: DepartmentFormData,
): CreateDepartmentRequest => ({
  name: data.name.trim(),
});

/**
 * Maps Edit form → PUT request.
 */
export const mapUpdateDepartmentRequest = (
  data: DepartmentFormData,
): UpdateDepartmentRequest => ({
  name: data.name.trim(),
});