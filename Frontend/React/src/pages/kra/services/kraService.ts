/* ============================================================
   KRA MASTER SERVICE
   ============================================================ */

import axios from "axios";

import axiosInstance from "../../../services/axios/axiosInstance";

/* ============================================================
   TYPES
   ============================================================ */

export interface KRAMasterApiRecord {
  id: number;

  department_id: number;

  designation_id: number;

  focused_area: string | null;

  weightage: number | null;

  frommonth: number | null;

  tomonth: number | null;

  year: number | null;

  status: number | null;

  createdby: string | null;

  createdon: string | null;

  modifiedby: string | null;

  modifiedon: string | null;
}

export interface KRAMasterApiPayload {
  department_id: number;

  designation_id: number;

  focused_area?: string | null;

  weightage?: number | null;

  frommonth?: number | null;

  tomonth?: number | null;

  year?: number | null;

  status?: number | null;

  createdby?: string | null;

  modifiedby?: string | null;

  modifiedon?: string | null;
}

/* ============================================================
   API CONFIGURATION
   ============================================================ */

const API_URL = "/api/v1/performance/master";

/* ============================================================
   ERROR RESPONSE TYPE
   ============================================================ */

interface ApiErrorResponse {
  detail?: string;

  message?: string;
}

/* ============================================================
   ERROR HANDLER
   ============================================================ */

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    /* ========================================================
       SERVER RESPONSE RECEIVED
       ======================================================== */

    if (error.response) {
      const status = error.response.status;

      const responseData =
        error.response.data as
          | ApiErrorResponse
          | undefined;

      const detail =
        responseData?.detail ??
        responseData?.message;

      if (detail) {
        return detail;
      }

      return `${fallback} Server returned ${status}.`;
    }

    /* ========================================================
       REQUEST SENT BUT SERVER DID NOT RESPOND
       ======================================================== */

    if (error.request) {
      return `${fallback} Backend server is not responding.`;
    }

    /* ========================================================
       AXIOS ERROR
       ======================================================== */

    return error.message || fallback;
  }

  /* ==========================================================
     STANDARD JAVASCRIPT ERROR
     ========================================================== */

  if (error instanceof Error) {
    return error.message;
  }

  /* ==========================================================
     FALLBACK
     ========================================================== */

  return fallback;
};

/* ============================================================
   GET ALL KRA MASTER RECORDS
   GET /api/v1/performance/master
   ============================================================ */

const getAll = async (): Promise<KRAMasterApiRecord[]> => {
  try {
    const response =
      await axiosInstance.get<KRAMasterApiRecord[]>(
        API_URL,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load KRA Master records.",
      ),
    );
  }
};

/* ============================================================
   GET KRA MASTER BY ID
   GET /api/v1/performance/master/{kra_id}
   ============================================================ */

const getById = async (
  kraId: number,
): Promise<KRAMasterApiRecord> => {
  try {
    const response =
      await axiosInstance.get<KRAMasterApiRecord>(
        `${API_URL}/${kraId}`,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load the KRA Master record.",
      ),
    );
  }
};

/* ============================================================
   CREATE KRA MASTER
   POST /api/v1/performance/master
   ============================================================ */

const create = async (
  data: KRAMasterApiPayload,
): Promise<KRAMasterApiRecord> => {
  try {
    const response =
      await axiosInstance.post<KRAMasterApiRecord>(
        API_URL,
        data,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to create the KRA Master record.",
      ),
    );
  }
};

/* ============================================================
   UPDATE KRA MASTER
   PUT /api/v1/performance/master/{kra_id}
   ============================================================ */

const update = async (
  kraId: number,
  data: KRAMasterApiPayload,
): Promise<KRAMasterApiRecord> => {
  try {
    const response =
      await axiosInstance.put<KRAMasterApiRecord>(
        `${API_URL}/${kraId}`,
        data,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update the KRA Master record.",
      ),
    );
  }
};

/* ============================================================
   DELETE KRA MASTER
   DELETE /api/v1/performance/master/{kra_id}
   ============================================================ */

const remove = async (
  kraId: number,
): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${API_URL}/${kraId}`,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete the KRA Master record.",
      ),
    );
  }
};

/* ============================================================
   EXPORT SERVICE
   ============================================================ */

export const kraService = {
  getAll,

  getById,

  create,

  update,

  delete: remove,
};

export default kraService;