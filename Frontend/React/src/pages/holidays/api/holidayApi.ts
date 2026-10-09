// ============================================================
// HOLIDAY API
// ============================================================

/*
 * Backend API contract:
 *
 * /api/v1/holidays/
 *
 * The environment variable may be configured as either:
 *
 *   http://192.168.1.8:8001
 *
 * OR:
 *
 *   http://192.168.1.8:8001/api/v1
 *
 * This file normalizes both cases so the frontend always
 * calls the correct backend endpoint.
 */

const RAW_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";


// ============================================================
// NORMALIZE API BASE URL
// ============================================================

const normalizeApiBaseUrl = (
  baseUrl: string,
): string => {

  let normalized =
    baseUrl.trim();

  /*
   * Remove trailing slash.
   */
  normalized =
    normalized.replace(
      /\/+$/,
      "",
    );

  /*
   * If /api/v1 is already present,
   * keep it.
   */
  if (
    normalized.endsWith(
      "/api/v1",
    )
  ) {
    return normalized;
  }

  /*
   * Otherwise append /api/v1.
   */
  return `${normalized}/api/v1`;
};


const API_BASE_URL =
  normalizeApiBaseUrl(
    RAW_API_BASE_URL,
  );


// ============================================================
// TYPES
// ============================================================

export interface HolidayApiResponse {
  id: number;

  holiday_name: string;

  holiday_date: string;

  status: number;

  createdby: string | null;

  createdon: string | null;
}


export interface HolidayCreateRequest {
  holiday_name: string;

  holiday_date: string;

  createdby: string;
}


export interface HolidayUpdateRequest {
  holiday_name?: string;

  holiday_date?: string;

  status?: number;

  modifiedby: string;
}


// ============================================================
// DELETE RESPONSE
// ============================================================

export interface HolidayDeleteResponse {
  message: string;
}


// ============================================================
// API ERROR
// ============================================================

export class HolidayApiError
  extends Error {

  public readonly status: number;

  public readonly details: unknown;


  constructor(
    message: string,
    status: number,
    details?: unknown,
  ) {

    super(message);

    this.name =
      "HolidayApiError";

    this.status =
      status;

    this.details =
      details;

    Object.setPrototypeOf(
      this,
      HolidayApiError.prototype,
    );
  }
}


// ============================================================
// AUTH HEADER
// ============================================================

const getAuthorizationHeader =
  (): Record<string, string> => {

    const token =
      localStorage.getItem(
        "token",
      ) ||
      localStorage.getItem(
        "access_token",
      ) ||
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      return {};
    }

    return {
      Authorization:
        `Bearer ${token}`,
    };
  };


// ============================================================
// COMMON REQUEST
// ============================================================

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {

  /*
   * Ensure endpoint starts with /.
   */
  const normalizedEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;


  const url =
    `${API_BASE_URL}${normalizedEndpoint}`;


  console.log(
    "[Holiday API]",
    options.method || "GET",
    url,
  );


  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          ...getAuthorizationHeader(),

          ...(options.headers || {}),
        },
      },
    );


  /* ==========================================================
     RESPONSE BODY
  ========================================================== */

  const contentType =
    response.headers.get(
      "content-type",
    );


  let responseBody:
    unknown = null;


  if (
    contentType?.includes(
      "application/json",
    )
  ) {

    responseBody =
      await response.json();

  } else {

    const text =
      await response.text();

    responseBody =
      text || null;
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (!response.ok) {

    let message =
      `Holiday API request failed with status ${response.status}.`;


    if (
      typeof responseBody ===
        "object" &&
      responseBody !== null &&
      "detail" in responseBody
    ) {

      const detail =
        (
          responseBody as {
            detail?: unknown;
          }
        ).detail;


      if (
        typeof detail ===
        "string"
      ) {

        message =
          detail;
      }
    }


    throw new HolidayApiError(
      message,
      response.status,
      responseBody,
    );
  }


  /* ==========================================================
     SUCCESS
  ========================================================== */

  return responseBody as T;
};


// ============================================================
// GET ALL HOLIDAYS
// GET /api/v1/holidays/
// ============================================================

export const getAllHolidays =
  async (): Promise<
    HolidayApiResponse[]
  > => {

    return request<
      HolidayApiResponse[]
    >(
      "/holidays/",
      {
        method: "GET",
      },
    );
  };


// ============================================================
// GET HOLIDAY BY ID
// GET /api/v1/holidays/{id}
// ============================================================

export const getHolidayById =
  async (
    id: number,
  ): Promise<
    HolidayApiResponse
  > => {

    return request<
      HolidayApiResponse
    >(
      `/holidays/${id}`,
      {
        method: "GET",
      },
    );
  };


// ============================================================
// CREATE HOLIDAY
// POST /api/v1/holidays/
// ============================================================

export const createHoliday =
  async (
    data: HolidayCreateRequest,
  ): Promise<
    HolidayApiResponse
  > => {

    return request<
      HolidayApiResponse
    >(
      "/holidays/",
      {
        method: "POST",

        body:
          JSON.stringify(
            data,
          ),
      },
    );
  };


// ============================================================
// UPDATE HOLIDAY
// PUT /api/v1/holidays/{id}
// ============================================================

export const updateHoliday =
  async (
    id: number,
    data: HolidayUpdateRequest,
  ): Promise<
    HolidayApiResponse
  > => {

    return request<
      HolidayApiResponse
    >(
      `/holidays/${id}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            data,
          ),
      },
    );
  };


// ============================================================
// DELETE HOLIDAY
// DELETE /api/v1/holidays/{id}
// ============================================================

export const deleteHoliday =
  async (
    id: number,
  ): Promise<
    HolidayDeleteResponse
  > => {

    return request<
      HolidayDeleteResponse
    >(
      `/holidays/${id}`,
      {
        method: "DELETE",
      },
    );
  };