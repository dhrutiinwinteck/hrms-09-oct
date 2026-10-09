/**
 * @file department.service.ts
 * @description Department API service.
 */

import axiosInstance from "../../../services/axios/axiosInstance";

import {
  Department,
  DepartmentApiResponse,
  DepartmentFormData,
} from "../types/department.types";

import {
  mapDepartmentFromApi,
  mapCreateDepartmentRequest,
  mapUpdateDepartmentRequest,
} from "../utils/department.mapper";

const DEPARTMENT_ENDPOINT =
  "/api/v1/departments/";

const getErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

    const responseData =
      axiosError.response?.data;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (
      responseData &&
      typeof responseData === "object"
    ) {
      const data =
        responseData as Record<
          string,
          unknown
        >;

      if (typeof data.detail === "string") {
        return data.detail;
      }

      if (typeof data.message === "string") {
        return data.message;
      }

      if (typeof data.error === "string") {
        return data.error;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

/**
 * Converts an unknown ID into a supported
 * frontend ID type.
 */
const normalizeDepartmentId = (
  value: unknown,
): number | string => {
  if (
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }

  throw new Error(
    "Invalid department ID received from server.",
  );
};

/**
 * Normalizes a single department response.
 *
 * Supported:
 *
 * {
 *   "id": 1,
 *   "name": "IT"
 * }
 *
 * OR:
 *
 * {
 *   "data": {
 *     "id": 1,
 *     "name": "IT"
 *   }
 * }
 */
const normalizeDepartmentResponse = (
  responseData: unknown,
): DepartmentApiResponse => {
  if (
    responseData &&
    typeof responseData === "object" &&
    !Array.isArray(responseData)
  ) {
    const data =
      responseData as Record<
        string,
        unknown
      >;

    if (
      (typeof data.id === "number" ||
        typeof data.id === "string") &&
      typeof data.name === "string"
    ) {
      return {
        id: normalizeDepartmentId(
          data.id,
        ),
        name: data.name,
      };
    }

    if (
      data.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      const nested =
        data.data as Record<
          string,
          unknown
        >;

      if (
        (typeof nested.id === "number" ||
          typeof nested.id === "string") &&
        typeof nested.name === "string"
      ) {
        return {
          id: normalizeDepartmentId(
            nested.id,
          ),
          name: nested.name,
        };
      }
    }
  }

  throw new Error(
    "Invalid department response received from server.",
  );
};

/**
 * Normalizes GET departments response.
 *
 * Supported:
 *
 * 1. [
 *      {
 *        "id": 1,
 *        "name": "IT"
 *      }
 *    ]
 *
 * 2. {
 *      "data": [
 *        {
 *          "id": 1,
 *          "name": "IT"
 *        }
 *      ]
 *    }
 *
 * 3. {
 *      "items": [...]
 *    }
 *
 * 4. {
 *      "departments": [...]
 *    }
 */
const normalizeDepartmentsResponse = (
  responseData: unknown,
): DepartmentApiResponse[] => {
  if (Array.isArray(responseData)) {
    return responseData.map(
      (item): DepartmentApiResponse => {
        if (
          !item ||
          typeof item !== "object" ||
          Array.isArray(item)
        ) {
          throw new Error(
            "Invalid department item received from server.",
          );
        }

        const department =
          item as Record<
            string,
            unknown
          >;

        if (
          (typeof department.id !==
            "number" &&
            typeof department.id !==
              "string") ||
          typeof department.name !==
            "string"
        ) {
          throw new Error(
            "Invalid department data received from server.",
          );
        }

        return {
          id: normalizeDepartmentId(
            department.id,
          ),
          name: department.name,
        };
      },
    );
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    !Array.isArray(responseData)
  ) {
    const data =
      responseData as Record<
        string,
        unknown
      >;

    if (Array.isArray(data.data)) {
      return normalizeDepartmentsResponse(
        data.data,
      );
    }

    if (Array.isArray(data.items)) {
      return normalizeDepartmentsResponse(
        data.items,
      );
    }

    if (Array.isArray(data.departments)) {
      return normalizeDepartmentsResponse(
        data.departments,
      );
    }
  }

  throw new Error(
    "Invalid departments response received from server.",
  );
};

export const departmentService = {
  // ============================================================
  // GET ALL DEPARTMENTS
  // ============================================================

  async getDepartments(): Promise<{
    data: Department[];
    total: number;
  }> {
    try {
      const response =
        await axiosInstance.get<unknown>(
          DEPARTMENT_ENDPOINT,
        );

      console.log(
        "GET Departments API Response:",
        response.data,
      );

      const apiDepartments =
        normalizeDepartmentsResponse(
          response.data,
        );

      const departments =
        apiDepartments.map(
          mapDepartmentFromApi,
        );

      return {
        data: departments,
        total: departments.length,
      };
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to load departments.",
        ),
      );
    }
  },

  // ============================================================
  // CREATE DEPARTMENT
  // ============================================================

  async createDepartment(
    data: DepartmentFormData,
  ): Promise<Department> {
    try {
      const request =
        mapCreateDepartmentRequest(data);

      const response =
        await axiosInstance.post<unknown>(
          DEPARTMENT_ENDPOINT,
          request,
        );

      console.log(
        "POST Department API Response:",
        response.data,
      );

      const createdDepartment =
        normalizeDepartmentResponse(
          response.data,
        );

      return mapDepartmentFromApi(
        createdDepartment,
      );
    } catch (error) {
      console.error(
        "Failed to create department:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to create department.",
        ),
      );
    }
  },

  // ============================================================
  // UPDATE DEPARTMENT
  // ============================================================

  async updateDepartment(
    id: number | string,
    data: DepartmentFormData,
  ): Promise<Department> {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Department ID is required for update.",
      );
    }

    try {
      const request =
        mapUpdateDepartmentRequest(data);

      const response =
        await axiosInstance.put<unknown>(
          `${DEPARTMENT_ENDPOINT}${encodeURIComponent(
            String(id),
          )}`,
          request,
        );

      console.log(
        "PUT Department API Response:",
        response.data,
      );

      const updatedDepartment =
        normalizeDepartmentResponse(
          response.data,
        );

      return mapDepartmentFromApi(
        updatedDepartment,
      );
    } catch (error) {
      console.error(
        "Failed to update department:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to update department.",
        ),
      );
    }
  },

  // ============================================================
  // DELETE DEPARTMENT
  // ============================================================

  async deleteDepartment(
    id: number | string,
  ): Promise<void> {
    if (
      id === undefined ||
      id === null ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Department ID is required for deletion.",
      );
    }

    try {
      await axiosInstance.delete(
        `${DEPARTMENT_ENDPOINT}${encodeURIComponent(
          String(id),
        )}`,
      );

      console.log(
        `Department ${id} deleted successfully.`,
      );
    } catch (error) {
      console.error(
        "Failed to delete department:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to delete department.",
        ),
      );
    }
  },
};

export default departmentService;