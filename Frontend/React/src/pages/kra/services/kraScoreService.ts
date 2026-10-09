/* ============================================================
   KRA SCORE SERVICE
   Employee → Logged-in Employee → Applicable KRA → Self Score
   ============================================================ */

import axios, {
  AxiosError,
  AxiosInstance,
} from "axios";

/* ============================================================
   KRA SCORE PARAMETER
   ============================================================ */

export interface KRAScoreParameter {
  master_id: number;

  focused_area: string | null;

  weightage: number | null;

  self_score: number | null;

  key_improvement_area: string | null;
}

/* ============================================================
   KRA SCORE RESPONSE
   ============================================================ */

export interface KRAScoreEntry {
  id: number;

  emp_id: number;

  kra_date: string | null;

  total_self_score: number | null;

  total_rm_score: number | null;

  total_tl_score: number | null;

  total_tp_score: number | null;

  rm_remark: string | null;

  tl_remark: string | null;

  top_management_remark: string | null;

  frommonth: number;

  tomonth: number;

  year: number;

  createdon: string | null;

  createdby: string | null;

  modifiedon: string | null;

  modifiedby: string | null;

  parameters?: KRAScoreParameter[];
}

/* ============================================================
   APPLICABLE KRA MASTER
   ============================================================ */

export interface ApplicableKRA {
  id: number;

  department_id: number;

  designation_id: number;

  focused_area: string | null;

  weightage: number | null;

  frommonth: number | null;

  tomonth: number | null;

  year: number | null;

  status: number | string | null;
}

/* ============================================================
   KRA SCORE LOG
   ============================================================ */

export interface KRAScoreLogEntry {
  id: number;

  master_id: number;

  kra_score_id: number;

  isedited: boolean;

  self_score: number | null;

  key_improvement_area: string | null;

  reporting_manager: number | null;

  rm_score: number | null;

  rm_remark: string | null;

  tl_score: number | null;

  tl_remark: string | null;

  tp_score: number | null;

  tp_remark: string | null;

  createdon: string | null;

  createdby: string | null;

  modifiedon: string | null;

  modifiedby: string | null;
}

/* ============================================================
   EMPLOYEE SELF SCORE ITEM
   ============================================================ */

export interface EmployeeKRAScoreItem {
  master_id: number;

  self_score: number;

  key_improvement_area?: string | null;
}

/* ============================================================
   EMPLOYEE SELF SCORE REQUEST
   ============================================================ */

export interface EmployeeKRAScoreRequest {
  frommonth: number;

  tomonth: number;

  year: number;

  kra_date?: string | null;

  items: EmployeeKRAScoreItem[];
}

/* ============================================================
   ADMIN CREATE / UPDATE REQUEST
   ============================================================ */

export interface KRAScoreFormData {
  emp_id: number;

  kra_date: string | null;

  total_self_score: number | null;

  total_rm_score: number | null;

  total_tl_score: number | null;

  total_tp_score: number | null;

  rm_remark: string | null;

  tl_remark: string | null;

  top_management_remark: string | null;

  frommonth: number;

  tomonth: number;

  year: number;

  createdby: string | null;

  modifiedby: string | null;
}

/* ============================================================
   API CONFIGURATION
   ============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8001";

/* ============================================================
   API ROUTE
   ============================================================ */

const API_URL =
  "/api/v1/performance/score";

/* ============================================================
   AXIOS INSTANCE
   ============================================================ */

const api: AxiosInstance =
  axios.create({
    baseURL: API_BASE_URL,

    timeout: 30000,

    headers: {
      "Content-Type": "application/json",

      Accept: "application/json",
    },
  });

/* ============================================================
   AUTH INTERCEPTOR
   ============================================================ */

api.interceptors.request.use(
  (config) => {
    /*
     * IMPORTANT
     *
     * The employee ID is NOT taken from localStorage.
     *
     * Authentication is completely controlled by JWT.
     */

    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (
      token &&
      config.headers
    ) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/* ============================================================
   ERROR RESPONSE
   ============================================================ */

interface ApiErrorResponse {
  detail?: unknown;

  message?: unknown;

  error?: unknown;
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
       SERVER RESPONSE
       ======================================================== */

    if (error.response) {
      const status =
        error.response.status;

      const responseData =
        error.response.data as
          | ApiErrorResponse
          | undefined;

      const detail =
        responseData?.detail ??
        responseData?.message ??
        responseData?.error;

      /*
       * Backend FastAPI normally sends:
       *
       * {
       *   "detail": "..."
       * }
       */

      if (
        typeof detail === "string" &&
        detail.trim()
      ) {
        return detail;
      }

      /*
       * Handle structured FastAPI
       * validation errors.
       */

      if (
        detail !== undefined &&
        detail !== null
      ) {
        try {
          return JSON.stringify(
            detail,
          );
        } catch {
          // Continue to status handling.
        }
      }

      /* ======================================================
         HTTP STATUS
         ====================================================== */

      if (status === 401) {
        return (
          "Authentication failed. " +
          "Please login again."
        );
      }

      if (status === 403) {
        return (
          "You are not authorized " +
          "to access KRA scores."
        );
      }

      if (status === 404) {
        return (
          "No applicable KRA data was found " +
          "for the selected employee and period."
        );
      }

      if (status >= 500) {
        return (
          "KRA backend server error. " +
          "Please check the backend logs."
        );
      }

      return (
        `${fallback} Server returned ${status}.`
      );
    }

    /* ========================================================
       REQUEST SENT BUT NO RESPONSE
       ======================================================== */

    if (error.request) {
      return (
        `${fallback} ` +
        "Backend server is not responding."
      );
    }

    return (
      error.message ||
      fallback
    );
  }

  /* ==========================================================
     STANDARD ERROR
     ========================================================== */

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
};

/* ============================================================
   VALIDATE PERIOD
   ============================================================ */

const validatePeriod = (
  year: number,
  frommonth: number,
  tomonth: number,
): void => {
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error(
      "Invalid KRA year.",
    );
  }

  if (
    !Number.isInteger(frommonth) ||
    frommonth < 1 ||
    frommonth > 12
  ) {
    throw new Error(
      "Invalid From Month.",
    );
  }

  if (
    !Number.isInteger(tomonth) ||
    tomonth < 1 ||
    tomonth > 12
  ) {
    throw new Error(
      "Invalid To Month.",
    );
  }

  if (frommonth > tomonth) {
    throw new Error(
      "From Month cannot be greater than To Month.",
    );
  }
};

/* ============================================================
   VALIDATE SELF SCORE REQUEST
   ============================================================ */

const validateSelfScoreRequest = (
  data: EmployeeKRAScoreRequest,
): void => {
  validatePeriod(
    data.year,
    data.frommonth,
    data.tomonth,
  );

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error(
      "At least one KRA score is required.",
    );
  }

  const invalidItem =
    data.items.some(
      (item) => {
        const masterId =
          Number(
            item.master_id,
          );

        const selfScore =
          Number(
            item.self_score,
          );

        return (
          !Number.isInteger(
            masterId,
          ) ||
          masterId <= 0 ||
          !Number.isFinite(
            selfScore,
          ) ||
          selfScore < 1 ||
          selfScore > 100
        );
      },
    );

  if (invalidItem) {
    throw new Error(
      "One or more KRA self ratings are invalid.",
    );
  }
};

/* ============================================================
   GET MY KRA SCORES
   ============================================================

   IMPORTANT:

   OLD:
       /employee/{employeeId}

   NEW:
       /employee/me

   Employee identity comes from JWT.
   ============================================================ */

const getMyScores =
  async (
    skip = 0,
    limit = 100,
  ): Promise<KRAScoreEntry[]> => {
    try {
      const response =
        await api.get<
          KRAScoreEntry[]
        >(
          `${API_URL}/employee/me`,
          {
            params: {
              skip,
              limit,
            },
          },
        );

      return Array.isArray(
        response.data,
      )
        ? response.data
        : [];
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load your KRA scores.",
        ),
      );
    }
  };

/* ============================================================
   GET APPLICABLE KRA MASTER
   ============================================================

   IMPORTANT:

   OLD:
       /employee/{employeeId}/applicable

   NEW:
       /employee/me/applicable

   Backend determines employee from JWT.
   ============================================================ */

const getApplicableKras =
  async (
    year: number,
    frommonth: number,
    tomonth: number,
  ): Promise<ApplicableKRA[]> => {
    try {
      validatePeriod(
        year,
        frommonth,
        tomonth,
      );

      const response =
        await api.get<
          ApplicableKRA[]
        >(
          `${API_URL}/employee/me/applicable`,
          {
            params: {
              year,
              frommonth,
              tomonth,
            },
          },
        );

      return Array.isArray(
        response.data,
      )
        ? response.data
        : [];
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load applicable KRAs.",
        ),
      );
    }
  };

/* ============================================================
   SUBMIT EMPLOYEE SELF SCORE
   ============================================================

   IMPORTANT:

   OLD:
       POST /employee/{employeeId}

   NEW:
       POST /employee/me

   The backend determines the employee from JWT.

   ============================================================ */

const submitSelfScore =
  async (
    data: EmployeeKRAScoreRequest,
  ): Promise<KRAScoreEntry> => {
    try {
      validateSelfScoreRequest(
        data,
      );

      const payload: EmployeeKRAScoreRequest =
        {
          frommonth:
            Number(
              data.frommonth,
            ),

          tomonth:
            Number(
              data.tomonth,
            ),

          year:
            Number(
              data.year,
            ),

          kra_date:
            data.kra_date ??
            null,

          items:
            data.items.map(
              (item) => ({
                master_id:
                  Number(
                    item.master_id,
                  ),

                self_score:
                  Number(
                    item.self_score,
                  ),

                key_improvement_area:
                  item.key_improvement_area ??
                  null,
              }),
            ),
        };

      const response =
        await api.post<
          KRAScoreEntry
        >(
          `${API_URL}/employee/me`,
          payload,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to submit KRA self score.",
        ),
      );
    }
  };

/* ============================================================
   ADMIN GET ALL
   ============================================================ */

const getAll =
  async (
    skip = 0,
    limit = 100,
  ): Promise<KRAScoreEntry[]> => {
    try {
      const response =
        await api.get<
          KRAScoreEntry[]
        >(
          API_URL,
          {
            params: {
              skip,
              limit,
            },
          },
        );

      return Array.isArray(
        response.data,
      )
        ? response.data
        : [];
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load KRA Score records.",
        ),
      );
    }
  };

/* ============================================================
   GET SCORE BY ID
   ============================================================ */

const getById =
  async (
    scoreId: number,
  ): Promise<KRAScoreEntry> => {
    if (
      !Number.isInteger(
        scoreId,
      ) ||
      scoreId <= 0
    ) {
      throw new Error(
        "Invalid KRA Score ID.",
      );
    }

    try {
      const response =
        await api.get<
          KRAScoreEntry
        >(
          `${API_URL}/${scoreId}`,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load the KRA Score record.",
        ),
      );
    }
  };

/* ============================================================
   GET KRA SCORE LOGS
   ============================================================ */

const getScoreLogs =
  async (
    scoreId: number,
  ): Promise<KRAScoreLogEntry[]> => {
    if (
      !Number.isInteger(
        scoreId,
      ) ||
      scoreId <= 0
    ) {
      throw new Error(
        "Invalid KRA Score ID.",
      );
    }

    try {
      const response =
        await api.get<
          KRAScoreLogEntry[]
        >(
          `${API_URL}/${scoreId}/logs`,
        );

      return Array.isArray(
        response.data,
      )
        ? response.data
        : [];
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load KRA parameter scores.",
        ),
      );
    }
  };

/* ============================================================
   ADMIN CREATE
   ============================================================ */

const create =
  async (
    data: KRAScoreFormData,
  ): Promise<KRAScoreEntry> => {
    try {
      const response =
        await api.post<
          KRAScoreEntry
        >(
          API_URL,
          data,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to create KRA Score.",
        ),
      );
    }
  };

/* ============================================================
   ADMIN UPDATE
   ============================================================ */

const update =
  async (
    scoreId: number,
    data: KRAScoreFormData,
  ): Promise<KRAScoreEntry> => {
    if (
      !Number.isInteger(
        scoreId,
      ) ||
      scoreId <= 0
    ) {
      throw new Error(
        "Invalid KRA Score ID.",
      );
    }

    try {
      const response =
        await api.put<
          KRAScoreEntry
        >(
          `${API_URL}/${scoreId}`,
          data,
        );

      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to update KRA Score.",
        ),
      );
    }
  };

/* ============================================================
   DELETE
   ============================================================ */

const remove =
  async (
    scoreId: number,
  ): Promise<void> => {
    if (
      !Number.isInteger(
        scoreId,
      ) ||
      scoreId <= 0
    ) {
      throw new Error(
        "Invalid KRA Score ID.",
      );
    }

    try {
      await api.delete(
        `${API_URL}/${scoreId}`,
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to delete KRA Score.",
        ),
      );
    }
  };

/* ============================================================
   EXPORT
   ============================================================ */

export const kraScoreService = {
  getAll,

  getMyScores,

  getApplicableKras,

  submitSelfScore,

  getById,

  getScoreLogs,

  create,

  update,

  delete: remove,
};

export default kraScoreService;