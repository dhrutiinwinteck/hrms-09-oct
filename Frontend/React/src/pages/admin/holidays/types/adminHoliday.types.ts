/* ============================================================
   UI TYPES
============================================================ */

export type HolidayStatus =
  | 'active'
  | 'inactive';

/**
 * Holiday object used by the Admin UI.
 */
export interface AdminHoliday {
  id: string;

  title: string;

  holidayDate: Date;

  day: string;

  status: HolidayStatus;

  /**
   * Audit information returned by backend.
   */
  createdBy: string | null;

  createdOn: Date | null;
}

/**
 * Statistics displayed on Admin Holiday Calendar.
 */
export interface AdminHolidayStatistics {
  totalHolidays: number;

  upcomingHoliday: string;

  holidaysTaken: number;

  weekendDays: number;
}

/**
 * Add/Edit Holiday form.
 */
export interface AdminHolidayFormData {
  title: string;

  holidayDate: Date | null;
}


/* ============================================================
   BACKEND API TYPES
============================================================ */

/**
 * GET /api/v1/holiday/
 *
 * Backend response:
 *
 * {
 *   "id": 1,
 *   "holiday_name": "Independence Day",
 *   "holiday_date": "2026-08-15",
 *   "status": 1,
 *   "createdby": "admin",
 *   "createdon": "2026-01-01T10:30:00"
 * }
 */
export interface AdminHolidayApiResponse {
  id: number;

  holiday_name: string;

  holiday_date: string;

  status: number;

  createdby: string | null;

  createdon: string | null;
}


/**
 * POST /api/v1/holiday/
 */
export interface AdminHolidayCreateRequest {
  holiday_name: string;

  holiday_date: string;

  createdby: string;
}


/**
 * PUT /api/v1/holiday/{id}
 */
export interface AdminHolidayUpdateRequest {
  holiday_name?: string;

  holiday_date?: string;

  status?: number;

  modifiedby: string;
}


/**
 * DELETE /api/v1/holiday/{id}
 */
export interface AdminHolidayDeleteResponse {
  message: string;
}