import axiosInstance from '../../../../services/axios/axiosInstance';

import {
  AdminHoliday,
  AdminHolidayFormData,
  AdminHolidayApiResponse,
  AdminHolidayUpdateRequest,
  AdminHolidayDeleteResponse,
} from '../types/adminHoliday.types';

import {
  mapApiHolidayToAdminHoliday,
  mapFormDataToCreateRequest,
  mapFormDataToUpdateRequest,
} from '../utils/adminHoliday.mapper';


/* ============================================================
   API ENDPOINT
============================================================ */

/*
 * IMPORTANT:
 *
 * Backend router is registered as:
 *
 * /api/v1/holidays
 *
 * NOT:
 *
 * /api/v1/holiday
 */

const HOLIDAY_API_ENDPOINT =
  '/api/v1/holidays';


/* ============================================================
   CURRENT ACTOR
============================================================ */

const getCurrentActor = (): string => {

  const possibleKeys = [
    'username',
    'userName',
    'user',
    'currentUser',
    'loggedInUser',
    'employee',
  ];


  /* ==========================================================
     LOCAL STORAGE
  ========================================================== */

  for (
    const key of possibleKeys
  ) {

    const value =
      localStorage.getItem(
        key,
      );

    if (!value) {
      continue;
    }

    try {

      const parsed =
        JSON.parse(value);

      if (
        typeof parsed ===
        'string'
      ) {
        return parsed;
      }

      if (parsed?.username) {
        return String(
          parsed.username,
        );
      }

      if (parsed?.userName) {
        return String(
          parsed.userName,
        );
      }

      if (parsed?.name) {
        return String(
          parsed.name,
        );
      }

      if (parsed?.email) {
        return String(
          parsed.email,
        );
      }

      if (parsed?.emp_code) {
        return String(
          parsed.emp_code,
        );
      }

    } catch {

      /*
       * Stored value is plain text.
       */

      return value;
    }
  }


  /* ==========================================================
     JWT FALLBACK
  ========================================================== */

  const token =
    localStorage.getItem(
      'accessToken',
    );

  if (token) {

    try {

      const parts =
        token.split('.');

      if (
        parts.length === 3
      ) {

        let base64 =
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        while (
          base64.length % 4 !==
          0
        ) {

          base64 += '=';
        }

        const binary =
          atob(base64);

        const bytes =
          Uint8Array.from(
            binary,
            (
              character,
            ) =>
              character.charCodeAt(
                0,
              ),
          );

        const payload =
          JSON.parse(
            new TextDecoder().decode(
              bytes,
            ),
          );

        const actor =
          payload?.username ||
          payload?.userName ||
          payload?.preferred_username ||
          payload?.name ||
          payload?.email ||
          payload?.sub;

        if (actor) {

          return String(
            actor,
          );
        }
      }

    } catch {

      /*
       * Ignore invalid JWT.
       */
    }
  }


  return 'admin';
};


/* ============================================================
   SERVICE
============================================================ */

class AdminHolidayService {


  /* ==========================================================
     GET ALL HOLIDAYS
     
     GET /api/v1/holidays/
  ========================================================== */

  async getHolidays(): Promise<
    AdminHoliday[]
  > {

    const response =
      await axiosInstance.get<
        AdminHolidayApiResponse[]
      >(
        `${HOLIDAY_API_ENDPOINT}/`,
      );

    return response.data.map(
      mapApiHolidayToAdminHoliday,
    );
  }


  /* ==========================================================
     GET HOLIDAY BY ID

     GET /api/v1/holidays/{id}
  ========================================================== */

  async getHolidayById(
    id: string,
  ): Promise<AdminHoliday> {

    const response =
      await axiosInstance.get<
        AdminHolidayApiResponse
      >(
        `${HOLIDAY_API_ENDPOINT}/${id}`,
      );

    return mapApiHolidayToAdminHoliday(
      response.data,
    );
  }


  /* ==========================================================
     CREATE HOLIDAY

     POST /api/v1/holidays/
  ========================================================== */

  async addHoliday(
    data: AdminHolidayFormData,
  ): Promise<AdminHoliday> {

    const createdBy =
      getCurrentActor();

    const payload =
      mapFormDataToCreateRequest(
        data,
        createdBy,
      );

    const response =
      await axiosInstance.post<
        AdminHolidayApiResponse
      >(
        `${HOLIDAY_API_ENDPOINT}/`,
        payload,
      );

    return mapApiHolidayToAdminHoliday(
      response.data,
    );
  }


  /* ==========================================================
     UPDATE HOLIDAY

     PUT /api/v1/holidays/{id}
  ========================================================== */

  async updateHoliday(
    id: string,
    data: AdminHolidayFormData,
  ): Promise<AdminHoliday> {

    const modifiedBy =
      getCurrentActor();

    const payload =
      mapFormDataToUpdateRequest(
        data,
        modifiedBy,
      );

    const response =
      await axiosInstance.put<
        AdminHolidayApiResponse
      >(
        `${HOLIDAY_API_ENDPOINT}/${id}`,
        payload,
      );

    return mapApiHolidayToAdminHoliday(
      response.data,
    );
  }


  /* ==========================================================
     TOGGLE STATUS

     PUT /api/v1/holidays/{id}
  ========================================================== */

  async toggleHolidayStatus(
    holiday: AdminHoliday,
  ): Promise<AdminHoliday> {

    const modifiedBy =
      getCurrentActor();

    const newStatus =
      holiday.status === 'active'
        ? 0
        : 1;

    const payload:
      AdminHolidayUpdateRequest = {

      status:
        newStatus,

      modifiedby:
        modifiedBy,
    };

    const response =
      await axiosInstance.put<
        AdminHolidayApiResponse
      >(
        `${HOLIDAY_API_ENDPOINT}/${holiday.id}`,
        payload,
      );

    return mapApiHolidayToAdminHoliday(
      response.data,
    );
  }


  /* ==========================================================
     DELETE HOLIDAY

     DELETE /api/v1/holidays/{id}
  ========================================================== */

  async deleteHoliday(
    id: string,
  ): Promise<
    AdminHolidayDeleteResponse
  > {

    const response =
      await axiosInstance.delete<
        AdminHolidayDeleteResponse
      >(
        `${HOLIDAY_API_ENDPOINT}/${id}`,
      );

    return response.data;
  }
}


/* ============================================================
   SERVICE INSTANCE
============================================================ */

export const adminHolidayService =
  new AdminHolidayService();


export default AdminHolidayService;