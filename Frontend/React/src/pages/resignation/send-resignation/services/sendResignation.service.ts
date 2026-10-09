import axiosInstance from "../../../../services/axios/axiosInstance";

import {
  SEND_RESIGNATION_CONSTANTS,
} from "../constants/sendResignation.constants";

import type {
  ActiveEmployee,
  ResignationEmailResponse,
  SendResignationRequest,
} from "../types/sendResignation.types";

import {
  extractApiErrorMessage,
} from "../utils/sendResignation.utils";

const getApiPrefix = (): string => {
  const configuredBaseUrl =
    axiosInstance.defaults.baseURL ?? "";

  const normalizedBaseUrl =
    configuredBaseUrl.replace(/\/+$/, "");

  return normalizedBaseUrl.endsWith(
    "/api/v1",
  )
    ? ""
    : "/api/v1";
};

const buildEndpoint = (
  endpoint: string,
): string => {
  return `${getApiPrefix()}${endpoint}`;
};

export const getActiveEmployees =
  async (): Promise<ActiveEmployee[]> => {
    try {
      const response =
        await axiosInstance.get<
          ActiveEmployee[]
        >(
          buildEndpoint(
            `${SEND_RESIGNATION_CONSTANTS.API.BASE_ROUTE}${SEND_RESIGNATION_CONSTANTS.API.ACTIVE_EMPLOYEES}`,
          ),
        );

      return Array.isArray(response.data)
        ? response.data
        : [];
    } catch (error: unknown) {
      throw new Error(
        extractApiErrorMessage(
          error,
          SEND_RESIGNATION_CONSTANTS.MESSAGES
            .ACTIVE_EMPLOYEES_ERROR,
        ),
      );
    }
  };

export const sendResignationEmail =
  async (
    request: SendResignationRequest,
  ): Promise<ResignationEmailResponse> => {
    try {
      const formData = new FormData();

      if (request.employeeId !== null) {
        formData.append(
          "employee_id",
          String(request.employeeId),
        );
      }

      formData.append(
        "employee_email",
        request.employeeEmail.trim(),
      );

      formData.append(
        "subject",
        request.subject.trim(),
      );

      formData.append(
        "body",
        request.body.trim(),
      );

      request.attachments.forEach(
        (file) => {
          formData.append(
            "attachments",
            file,
            file.name,
          );
        },
      );

      const response =
        await axiosInstance.post<ResignationEmailResponse>(
          buildEndpoint(
            `${SEND_RESIGNATION_CONSTANTS.API.BASE_ROUTE}${SEND_RESIGNATION_CONSTANTS.API.SEND_EMAIL}`,
          ),
          formData,
        );

      return response.data;
    } catch (error: unknown) {
      throw new Error(
        extractApiErrorMessage(
          error,
          SEND_RESIGNATION_CONSTANTS.MESSAGES
            .SEND_ERROR,
        ),
      );
    }
  };