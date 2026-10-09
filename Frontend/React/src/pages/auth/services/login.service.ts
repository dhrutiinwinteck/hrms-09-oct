/**
 * @file login.service.ts
 * @description Service layer for authentication.
 * @version 4.0.0
 */

import axios from "axios";

import axiosInstance from "../../../services/axios/axiosInstance";

import type {
  LoginCredentials,
  LoginResponse,
} from "../types/login.types";

import {
  LOGIN_API_ENDPOINT,
} from "../constants/login.constants";


/**
 * Backend error response structure.
 */
interface LoginErrorResponse {
  detail?: string;
  message?: string;
}


/**
 * Authentication service.
 *
 * IMPORTANT:
 * This service uses the real FastAPI backend only.
 * No mock/static login fallback is used.
 */
export const loginService = {

  async login(
    data: LoginCredentials,
  ): Promise<LoginResponse> {

    const employeeCode =
      data.emp_code.trim();

    const password =
      data.password;

    if (!employeeCode) {
      throw new Error(
        "Employee Code is required.",
      );
    }

    if (!password) {
      throw new Error(
        "Password is required.",
      );
    }

    try {

      /**
       * Backend endpoint:
       *
       * POST /api/v1/auth/login
       *
       * axiosInstance baseURL:
       *
       * http://192.168.1.7:8000
       *
       * Therefore final URL:
       *
       * http://192.168.1.7:8000/api/v1/auth/login
       */
      const response =
        await axiosInstance.post<LoginResponse>(
          LOGIN_API_ENDPOINT,
          {
            username: employeeCode,
            password: password,
          },
        );

      /**
       * Validate response.
       */
      if (!response.data) {
        throw new Error(
          "Empty response received from authentication server.",
        );
      }

      if (
        !response.data.access_token ||
        !response.data.access_token.trim()
      ) {
        throw new Error(
          "Authentication server did not return an access token.",
        );
      }

      return response.data;

    } catch (error: unknown) {

      /**
       * Axios error.
       */
      if (axios.isAxiosError(error)) {

        const responseData =
          error.response?.data as
            | LoginErrorResponse
            | undefined;

        /**
         * 401 - Invalid credentials.
         */
        if (error.response?.status === 401) {
          throw new Error(
            responseData?.detail ||
            "Invalid employee code or password.",
          );
        }

        /**
         * 403 - Inactive user.
         */
        if (error.response?.status === 403) {
          throw new Error(
            responseData?.detail ||
            "Your account is inactive. Please contact HR Administrator.",
          );
        }

        /**
         * 422 - Validation error.
         */
        if (error.response?.status === 422) {
          throw new Error(
            responseData?.detail ||
            "Invalid login data. Please check your Employee Code and password.",
          );
        }

        /**
         * 500+ - Backend error.
         */
        if (
          error.response?.status &&
          error.response.status >= 500
        ) {
          throw new Error(
            "Authentication server error. Please try again later.",
          );
        }

        /**
         * Backend returned another error.
         */
        if (
          responseData?.detail
        ) {
          throw new Error(
            responseData.detail,
          );
        }

        if (
          responseData?.message
        ) {
          throw new Error(
            responseData.message,
          );
        }

        /**
         * No response means the browser could not
         * receive a response from the API.
         *
         * This can be:
         * - CORS
         * - backend unavailable
         * - network problem
         * - wrong IP/port
         */
        if (!error.response) {
          throw new Error(
            "Unable to connect to the HRMS authentication server. Please check the backend server and network connection.",
          );
        }

        throw new Error(
          "Login failed. Please try again.",
        );
      }

      /**
       * Normal JavaScript Error.
       */
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(
        "An unexpected error occurred during login.",
      );
    }
  },
};