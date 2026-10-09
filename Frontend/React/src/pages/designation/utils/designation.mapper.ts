/**
 * @file designation.mapper.ts
 * @description Maps Designation API models to frontend models.
 */

import type {
  Department,
  Designation,
  DesignationApiRequest,
  DesignationApiResponse,
  DesignationFormData,
} from "../types/designation.types";

/**
 * Maps API response to existing UI model.
 *
 * The API gives:
 *
 * id
 * name
 * depart_id
 *
 * The existing UI requires:
 *
 * id
 * name
 * departmentId
 * departmentName
 * status
 * employeeCount
 */
export const mapDesignationFromApi = (
  designation: DesignationApiResponse,
  departments: Department[],
): Designation => {
  const department = departments.find(
    (item) =>
      item.id === designation.depart_id,
  );

  return {
    id: designation.id,
    name: designation.name,
    departmentId: designation.depart_id,
    departmentName:
      department?.name ??
      `Department #${designation.depart_id}`,

    /**
     * Current API does not provide status.
     *
     * Preserve the existing UI without changing
     * the design or table structure.
     */
    status: "Active",

    /**
     * Current API does not provide employee count.
     */
    employeeCount: 0,
  };
};

/**
 * Maps frontend form to the exact API request.
 *
 * IMPORTANT:
 *
 * Frontend:
 * departmentId
 *
 * API:
 * depart_id
 */
export const mapDesignationToApiRequest = (
  data: DesignationFormData,
): DesignationApiRequest => {
  if (data.departmentId === "") {
    throw new Error(
      "Department is required.",
    );
  }

  const name = data.name.trim();

  if (!name) {
    throw new Error(
      "Designation name is required.",
    );
  }

  return {
    name,
    depart_id: data.departmentId,
  };
};