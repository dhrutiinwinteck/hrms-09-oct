// src/pages/shifts/shift-patterns/services/shiftPatterns.service.ts

import axiosInstance from '../../../../services/axios/axiosInstance';

import { isAxiosError } from 'axios';

import {
  ShiftPattern,
  ShiftPatternApiResponse,
  ShiftPatternDeleteApiResponse,
  ShiftPatternFormData,
} from '../types/shiftPatterns.types';

import {
  computeDuration,
  formatTimeTo12Hour,
  inferShiftType,
} from '../utils/shiftPatterns.utils';

/* ============================================================
   API ENDPOINT
============================================================ */

/**
 * Centralized Axios baseURL:
 *
 * http://192.168.1.13:8001
 *
 * Therefore this endpoint becomes:
 *
 * http://192.168.1.13:8001/api/v1/shift-patterns
 */
const SHIFT_PATTERNS_ENDPOINT =
  '/api/v1/shift-patterns';

/* ============================================================
   BACKEND ERROR TYPE
============================================================ */

interface FastApiErrorResponse {
  detail?: string;
  message?: string;
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

/**
 * Extract a readable error message from Axios/FastAPI.
 */
const getErrorMessage = (
  error: unknown,
): string => {
  if (isAxiosError(error)) {
    const responseData =
      error.response?.data as
        | FastApiErrorResponse
        | undefined;

    if (
      responseData &&
      typeof responseData.detail === 'string'
    ) {
      return responseData.detail;
    }

    if (
      responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }

    switch (error.response?.status) {
      case 400:
        return 'Invalid shift pattern data.';

      case 404:
        return 'Shift pattern API endpoint was not found.';

      case 409:
        return (
          responseData?.detail ||
          'Shift pattern already exists or is currently in use.'
        );

      case 500:
        return 'Internal server error. Please try again.';

      default:
        return (
          error.message ||
          'Something went wrong while processing the shift pattern.'
        );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while processing the shift pattern.';
};

/* ============================================================
   API → FRONTEND MAPPING
============================================================ */

/**
 * Backend response:
 *
 * {
 *   pattern_id,
 *   pattern_name,
 *   start_time,
 *   end_time,
 *   created_by,
 *   created_date,
 *   modified_by,
 *   modified_date
 * }
 *
 * Existing frontend structure:
 *
 * {
 *   id,
 *   name,
 *   startTime,
 *   endTime,
 *   duration,
 *   status,
 *   shiftType
 * }
 */
const mapApiPatternToFrontend = (
  pattern: ShiftPatternApiResponse,
): ShiftPattern => {
  const startTime =
    formatTimeTo12Hour(
      pattern.start_time,
    );

  const endTime =
    formatTimeTo12Hour(
      pattern.end_time,
    );

  return {
    id: String(
      pattern.pattern_id,
    ),

    name:
      pattern.pattern_name,

    startTime,

    endTime,

    duration:
      computeDuration(
        pattern.start_time,
        pattern.end_time,
      ),

    /**
     * Backend currently does not return
     * status.
     *
     * Existing UI requires a status,
     * therefore active is used until
     * backend provides status.
     */
    status: 'active',

    shiftType:
      inferShiftType(
        pattern.start_time,
      ),

    createdBy:
      pattern.created_by,

    createdDate:
      pattern.created_date,

    modifiedBy:
      pattern.modified_by,

    modifiedDate:
      pattern.modified_date,
  };
};

/* ============================================================
   SHIFT PATTERN SERVICE
============================================================ */

export const shiftPatternsService = {

  /* ==========================================================
     GET ALL SHIFT PATTERNS

     GET /api/v1/shift-patterns
  ========================================================== */

  getShiftPatterns:
    async (): Promise<
      ShiftPattern[]
    > => {
      try {
        console.log(
          '[Shift Patterns] GET:',
          SHIFT_PATTERNS_ENDPOINT,
        );

        const response =
          await axiosInstance.get<
            ShiftPatternApiResponse[]
          >(
            SHIFT_PATTERNS_ENDPOINT,
          );

        console.log(
          '[Shift Patterns] GET response:',
          response.data,
        );

        return response.data.map(
          mapApiPatternToFrontend,
        );
      } catch (error) {
        const message =
          getErrorMessage(error);

        console.error(
          '[Shift Patterns] GET failed:',
          message,
        );

        throw new Error(
          message,
        );
      }
    },

  /* ==========================================================
     CREATE SHIFT PATTERN

     POST /api/v1/shift-patterns
  ========================================================== */

  createShiftPattern:
    async (
      formData: ShiftPatternFormData,
    ): Promise<ShiftPattern> => {
      try {
        const payload = {
          pattern_name:
            formData.shiftName.trim(),

          start_time:
            formData.startTime,

          end_time:
            formData.endTime,
        };

        console.log(
          '[Shift Patterns] POST:',
          SHIFT_PATTERNS_ENDPOINT,
        );

        console.log(
          '[Shift Patterns] POST payload:',
          payload,
        );

        const response =
          await axiosInstance.post<
            ShiftPatternApiResponse
          >(
            SHIFT_PATTERNS_ENDPOINT,
            payload,
          );

        console.log(
          '[Shift Patterns] POST response:',
          response.data,
        );

        return mapApiPatternToFrontend(
          response.data,
        );
      } catch (error) {
        const message =
          getErrorMessage(error);

        console.error(
          '[Shift Patterns] POST failed:',
          message,
        );

        throw new Error(
          message,
        );
      }
    },

  /* ==========================================================
     UPDATE SHIFT PATTERN

     Backend currently does NOT provide:

     PUT /api/v1/shift-patterns/{pattern_id}

     Therefore we do not invent an API.
  ========================================================== */

  updateShiftPattern:
    async (
      _id: string,
      _formData: ShiftPatternFormData,
    ): Promise<ShiftPattern> => {
      throw new Error(
        'Shift pattern update is not available because the backend does not currently provide an update API.',
      );
    },

  /* ==========================================================
     DELETE SHIFT PATTERN

     DELETE /api/v1/shift-patterns/{pattern_id}
  ========================================================== */

  deleteShiftPattern:
    async (
      id: string,
    ): Promise<
      ShiftPatternDeleteApiResponse
    > => {
      try {
        const endpoint =
          `${SHIFT_PATTERNS_ENDPOINT}/${encodeURIComponent(
            id,
          )}`;

        console.log(
          '[Shift Patterns] DELETE:',
          endpoint,
        );

        const response =
          await axiosInstance.delete<
            ShiftPatternDeleteApiResponse
          >(
            endpoint,
          );

        console.log(
          '[Shift Patterns] DELETE response:',
          response.data,
        );

        return response.data;
      } catch (error) {
        const message =
          getErrorMessage(error);

        console.error(
          '[Shift Patterns] DELETE failed:',
          message,
        );

        throw new Error(
          message,
        );
      }
    },
};