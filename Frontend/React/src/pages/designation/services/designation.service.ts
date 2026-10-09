/**
 * @file designation.service.ts
 * @description REST service for Designation APIs.
 */

import axiosInstance from "../../../services/axios/axiosInstance";

import type {
  DesignationApiRequest,
  DesignationApiResponse,
  DesignationFormData,
} from "../types/designation.types";

import {
  mapDesignationToApiRequest,
} from "../utils/designation.mapper";

const DESIGNATION_ENDPOINT =
  "/api/v1/designations/";

const getErrorMessage = (
  error: unknown,
  fallback: string,
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

    if (
      typeof responseData === "string"
    ) {
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

      if (
        typeof data.detail ===
        "string"
      ) {
        return data.detail;
      }

      if (
        typeof data.message ===
        "string"
      ) {
        return data.message;
      }

      if (
        typeof data.error ===
        "string"
      ) {
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

  return fallback;
};

/**
 * Normalizes API response.
 *
 * Supports:
 *
 * [
 *   {
 *     "id": 1022,
 *     "name": "Software Developer",
 *     "depart_id": 5
 *   }
 * ]
 *
 * and:
 *
 * {
 *   "data": [...]
 * }
 */
const normalizeDesignationList = (
  responseData: unknown,
): DesignationApiResponse[] => {
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
        object.designations,
      )
    ) {
      data = object.designations;
    }
  }

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid designation response received from server.",
    );
  }

  return data.map(
    (item): DesignationApiResponse => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        throw new Error(
          "Invalid designation item received from server.",
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
          "string" ||
        typeof object.depart_id !==
          "number"
      ) {
        throw new Error(
          "Invalid designation data received from server.",
        );
      }

      return {
        id: object.id,
        name: object.name,
        depart_id:
          object.depart_id,
      };
    },
  );
};

export const designationService = {
  /**
   * GET
   * /api/v1/designations/
   */
  async getDesignations(): Promise<
    DesignationApiResponse[]
  > {
    try {
      const response =
        await axiosInstance.get<unknown>(
          DESIGNATION_ENDPOINT,
        );

      console.log(
        "GET Designations API Response:",
        response.data,
      );

      return normalizeDesignationList(
        response.data,
      );
    } catch (error) {
      console.error(
        "Failed to fetch designations:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to load designations.",
        ),
      );
    }
  },

  /**
   * POST
   * /api/v1/designations/
   *
   * Request:
   *
   * {
   *   "name": "Software Developer",
   *   "depart_id": 5
   * }
   */
  async createDesignation(
    data: DesignationFormData,
  ): Promise<void> {
    try {
      const request: DesignationApiRequest =
        mapDesignationToApiRequest(
          data,
        );

      console.log(
        "POST Designation Request:",
        request,
      );

      const response =
        await axiosInstance.post(
          DESIGNATION_ENDPOINT,
          request,
        );

      console.log(
        "POST Designation Response:",
        response.data,
      );
    } catch (error) {
      console.error(
        "Failed to create designation:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to create designation.",
        ),
      );
    }
  },

  /**
   * PUT
   * /api/v1/designations/{id}
   *
   * Request:
   *
   * {
   *   "name": "Senior Software Developer",
   *   "depart_id": 5
   * }
   */
  async updateDesignation(
    id: number,
    data: DesignationFormData,
  ): Promise<void> {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Valid designation ID is required.",
      );
    }

    try {
      const request: DesignationApiRequest =
        mapDesignationToApiRequest(
          data,
        );

      console.log(
        "PUT Designation Request:",
        {
          id,
          ...request,
        },
      );

      const response =
        await axiosInstance.put(
          `${DESIGNATION_ENDPOINT}${id}`,
          request,
        );

      console.log(
        "PUT Designation Response:",
        response.data,
      );
    } catch (error) {
      console.error(
        "Failed to update designation:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to update designation.",
        ),
      );
    }
  },

  /**
   * DELETE
   * /api/v1/designations/{id}
   */
  async deleteDesignation(
    id: number,
  ): Promise<void> {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      throw new Error(
        "Valid designation ID is required.",
      );
    }

    try {
      const response =
        await axiosInstance.delete(
          `${DESIGNATION_ENDPOINT}${id}`,
        );

      console.log(
        "DELETE Designation Response:",
        response.data,
      );
    } catch (error) {
      console.error(
        "Failed to delete designation:",
        error,
      );

      throw new Error(
        getErrorMessage(
          error,
          "Failed to delete designation.",
        ),
      );
    }
  },
};

export default designationService;