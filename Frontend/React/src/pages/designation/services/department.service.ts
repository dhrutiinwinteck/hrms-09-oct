/**
 * @file department.service.ts
 * @description REST service for Department API.
 */

import axiosInstance from "../../../services/axios/axiosInstance";

import type {
  Department,
} from "../types/designation.types";

const DEPARTMENT_ENDPOINT =
  "/api/v1/departments/";

const normalizeDepartments = (
  responseData: unknown,
): Department[] => {
  let data: unknown = responseData;

  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    const object =
      data as Record<
        string,
        unknown
      >;

    if (Array.isArray(object.data)) {
      data = object.data;
    } else if (
      Array.isArray(object.items)
    ) {
      data = object.items;
    } else if (
      Array.isArray(
        object.departments,
      )
    ) {
      data = object.departments;
    }
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid departments response received from server.",
    );
  }

  return data.map(
    (item): Department => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        throw new Error(
          "Invalid department item received from server.",
        );
      }

      const object =
        item as Record<
          string,
          unknown
        >;

      if (
        typeof object.id !==
          "number" ||
        typeof object.name !==
          "string"
      ) {
        throw new Error(
          "Invalid department data received from server.",
        );
      }

      return {
        id: object.id,
        name: object.name,
      };
    },
  );
};

export const departmentService = {
  /**
   * GET
   * /api/v1/departments/
   */
  async getAll(): Promise<
    Department[]
  > {
    try {
      const response =
        await axiosInstance.get<unknown>(
          DEPARTMENT_ENDPOINT,
        );

      console.log(
        "GET Departments API Response:",
        response.data,
      );

      return normalizeDepartments(
        response.data,
      );
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error,
      );

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "Failed to load departments.",
      );
    }
  },
};

export default departmentService;