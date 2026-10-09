// ============================================================
// BACKEND HOLIDAY
// ============================================================

export interface HolidayApiResponse {
  id: number;
  holiday_name: string;
  holiday_date: string;
  status: number;
  createdby: string | null;
  createdon: string | null;
}


// ============================================================
// FRONTEND HOLIDAY
// ============================================================

export interface Holiday {
  id: string;

  title: string;

  date: string;

  day: string;

  icon: string;

  dayVariant:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

  status: number;
}


// ============================================================
// HOLIDAY STATISTICS
// ============================================================

export interface HolidayStatistics {
  totalHolidays: number;

  upcomingHolidays: number;

   nextUpcomingHoliday: Holiday | null;

  longWeekends: number;

  observedHolidays: number;
}


// ============================================================
// PAGINATION
// ============================================================

export interface PaginationData {
  currentPage: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;
}