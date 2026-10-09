/**
 * ======================================================
 * Attendance Module - Service Layer
 * ======================================================
 */

import axios, { AxiosResponse } from "axios";

import axiosInstance from "../../../services/axios/axiosInstance";

import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceOverviewItem,
  AttendanceFilter,
  AttendanceApiResponse,
  AttendanceExportResponse,
  DailyPunchState,
  PunchActionRequest,
  PunchActionResponse,
  AttendanceAction,
  AttendanceTimelineActivity,
} from "../types/attendance.types";

import { API_ENDPOINTS } from "../constants/attendance.constants";
import { attendanceMockData } from "../components/mocks/attendance.mock";

// =============================================================================
// Configuration
// =============================================================================

/**
 * false = use real HRMS API
 * true  = use frontend mock data
 */
const USE_MOCK = false;

// =============================================================================
// Punch Action Endpoints
// =============================================================================

const ATTENDANCE_ACTION_ENDPOINTS: Record<
  AttendanceAction,
  string
> = {
  PUNCH_IN: "api/v1/attendance/punch-in",
  BREAK_IN: "api/v1/attendance/break-in",
  BREAK_OUT: "api/v1/attendance/break-out",
  PUNCH_OUT: "api/v1/attendance/punch-out",
};

// =============================================================================
// Service Interface
// =============================================================================

export interface IAttendanceService {
  getAttendance(
    filters?: AttendanceFilter,
  ): Promise<AttendanceApiResponse>;

  getAttendanceSummary(
    filters?: AttendanceFilter,
  ): Promise<AttendanceSummary>;

  getAttendanceOverview(
    year: number,
    month: number,
  ): Promise<AttendanceOverviewItem[]>;

  exportAttendance(
    filters?: AttendanceFilter,
  ): Promise<AttendanceExportResponse>;

  filterAttendance(
    filters: AttendanceFilter,
  ): Promise<AttendanceApiResponse>;

  getTodayAttendance(): Promise<DailyPunchState>;

  getTodayTimeline(): Promise<AttendanceTimelineActivity[]>;

  executePunchAction(
    request: PunchActionRequest,
  ): Promise<PunchActionResponse>;
}

// =============================================================================
// Mock Service
// =============================================================================

class MockAttendanceService implements IAttendanceService {
  private delay(
    milliseconds: number = 500,
  ): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(resolve, milliseconds),
    );
  }

  private dailyState: DailyPunchState = {
    id: null,
    employeeId: "CURRENT_USER",
    attendanceDate: new Date()
      .toISOString()
      .split("T")[0],

    punchIn: null,
    punchOut: null,

    breakIn: null,
    breakOut: null,

    punchState: "NOT_PUNCHED_IN",

    isPunchedIn: false,
    isOnBreak: false,
    isPunchedOut: false,

    workingMinutes: 0,
    breakMinutes: 0,

    punchInLocation: null,
    punchOutLocation: null,

    lastAction: null,
    lastActionAt: null,
  };

  // ===========================================================================
  // Attendance History
  // ===========================================================================

  async getAttendance(
    filters?: AttendanceFilter,
  ): Promise<AttendanceApiResponse> {
    await this.delay(600);

    let records: AttendanceRecord[] = [
      ...attendanceMockData.records,
    ];

    if (filters) {
      if (filters.selectedDate) {
        records = records.filter(
          (record) =>
            record.date === filters.selectedDate,
        );
      }

      if (filters.startDate) {
        records = records.filter(
          (record) =>
            record.date >= filters.startDate!,
        );
      }

      if (filters.endDate) {
        records = records.filter(
          (record) =>
            record.date <= filters.endDate!,
        );
      }

      if (filters.status) {
        records = records.filter(
          (record) =>
            record.status === filters.status,
        );
      }

      if (filters.searchTerm) {
        const search =
          filters.searchTerm
            .trim()
            .toLowerCase();

        records = records.filter(
          (record) =>
            record.employeeName
              ?.toLowerCase()
              .includes(search) ||
            record.id
              .toLowerCase()
              .includes(search),
        );
      }
    }

    return {
      records,

      summary: this.calculateSummary(
        records,
        filters,
      ),

      overview: attendanceMockData.overview,

      totalCount: records.length,

      page: 1,

      pageSize: 10,
    };
  }

  // ===========================================================================
  // Summary
  // ===========================================================================

  async getAttendanceSummary(
    filters?: AttendanceFilter,
  ): Promise<AttendanceSummary> {
    await this.delay(400);

    const response =
      await this.getAttendance(filters);

    return response.summary;
  }

  // ===========================================================================
  // Overview
  // ===========================================================================

  async getAttendanceOverview(
    year: number,
    month: number,
  ): Promise<AttendanceOverviewItem[]> {
    await this.delay(300);

    const datePrefix =
      `${year}-${String(month).padStart(2, "0")}`;

    return attendanceMockData.overview.filter(
      (item) =>
        item.date.startsWith(datePrefix),
    );
  }

  // ===========================================================================
  // Export
  // ===========================================================================

  async exportAttendance(
    _filters?: AttendanceFilter,
  ): Promise<AttendanceExportResponse> {
    await this.delay(800);

    return {
      downloadUrl:
        "/mock/attendance-export.xlsx",

      fileName: `attendance-${
        new Date()
          .toISOString()
          .split("T")[0]
      }.xlsx`,
    };
  }

  // ===========================================================================
  // Filter
  // ===========================================================================

  async filterAttendance(
    filters: AttendanceFilter,
  ): Promise<AttendanceApiResponse> {
    return this.getAttendance(filters);
  }

  // ===========================================================================
  // Today's Attendance
  // ===========================================================================

  async getTodayAttendance(): Promise<DailyPunchState> {
    await this.delay(250);

    return {
      ...this.dailyState,
    };
  }

  // ===========================================================================
  // Today's Activity Timeline
  // ===========================================================================

  async getTodayTimeline(): Promise<
    AttendanceTimelineActivity[]
  > {
    await this.delay(250);

    const activities: AttendanceTimelineActivity[] =
      [];

    if (this.dailyState.punchIn) {
      activities.push({
        id: "mock-punch-in",
        activity: "PI",
        log: this.dailyState.punchIn,
        address:
          this.dailyState.punchInLocation
            ?.address ?? null,
      });
    }

    if (this.dailyState.breakIn) {
      activities.push({
        id: "mock-break-in",
        activity: "BI",
        log: this.dailyState.breakIn,
        address: null,
      });
    }

    if (this.dailyState.breakOut) {
      activities.push({
        id: "mock-break-out",
        activity: "BO",
        log: this.dailyState.breakOut,
        address: null,
      });
    }

    if (this.dailyState.punchOut) {
      activities.push({
        id: "mock-punch-out",
        activity: "PO",
        log: this.dailyState.punchOut,
        address:
          this.dailyState.punchOutLocation
            ?.address ?? null,
      });
    }

    activities.sort(
      (a, b) =>
        new Date(a.log).getTime() -
        new Date(b.log).getTime(),
    );

    return activities;
  }

  // ===========================================================================
  // Punch Action
  // ===========================================================================

 // ===========================================================================
// Punch Action
// ===========================================================================

async executePunchAction(
  request: PunchActionRequest,
): Promise<PunchActionResponse> {
  await this.delay(300);

  const now = new Date();
  const timestamp = now.toISOString();

  switch (request.action) {
    case "PUNCH_IN":
      if (this.dailyState.isPunchedIn) {
        return {
          success: false,
          message: "Already punched in.",
          action: request.action,
          actionStatus: "ALREADY_COMPLETED",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      this.dailyState = {
        ...this.dailyState,
        punchIn: timestamp,
        punchOut: null,
        breakIn: null,
        breakOut: null,
        punchState: "WORKING",
        isPunchedIn: true,
        isOnBreak: false,
        isPunchedOut: false,
        punchInLocation: request.latitude != null && request.longitude != null
          ? {
              latitude: request.latitude,
              longitude: request.longitude,
              accuracy: request.accuracy ?? 0,
              address: request.address ?? null,
            }
          : null,
        lastAction: "PUNCH_IN",
        lastActionAt: timestamp,
      };

      return {
        success: true,
        message: "Punch In successful.",
        action: request.action,
        actionStatus: "SUCCESS",
        attendance: { ...this.dailyState },
        timestamp,
      };

    case "BREAK_IN":
      if (!this.dailyState.isPunchedIn) {
        return {
          success: false,
          message: "Please Punch In first.",
          action: request.action,
          actionStatus: "INVALID_STATE",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      if (this.dailyState.isOnBreak) {
        return {
          success: false,
          message: "Already on break.",
          action: request.action,
          actionStatus: "ALREADY_COMPLETED",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      this.dailyState = {
        ...this.dailyState,
        breakIn: timestamp,
        breakOut: null,
        punchState: "ON_BREAK",
        isOnBreak: true,
        lastAction: "BREAK_IN",
        lastActionAt: timestamp,
      };

      return {
        success: true,
        message: "Break In successful.",
        action: request.action,
        actionStatus: "SUCCESS",
        attendance: { ...this.dailyState },
        timestamp,
      };

    case "BREAK_OUT":
      if (!this.dailyState.isPunchedIn) {
        return {
          success: false,
          message: "Please Punch In first.",
          action: request.action,
          actionStatus: "INVALID_STATE",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      if (!this.dailyState.isOnBreak) {
        return {
          success: false,
          message: "You are not currently on break.",
          action: request.action,
          actionStatus: "INVALID_STATE",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      this.dailyState = {
        ...this.dailyState,
        breakOut: timestamp,
        punchState: "WORKING",
        isOnBreak: false,
        lastAction: "BREAK_OUT",
        lastActionAt: timestamp,
      };

      return {
        success: true,
        message: "Break Out successful.",
        action: request.action,
        actionStatus: "SUCCESS",
        attendance: { ...this.dailyState },
        timestamp,
      };

    case "PUNCH_OUT":
      if (!this.dailyState.isPunchedIn) {
        return {
          success: false,
          message: "Please Punch In first.",
          action: request.action,
          actionStatus: "INVALID_STATE",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      if (this.dailyState.isOnBreak) {
        return {
          success: false,
          message: "Please Break Out before Punch Out.",
          action: request.action,
          actionStatus: "INVALID_STATE",
          attendance: { ...this.dailyState },
          timestamp,
        };
      }

      this.dailyState = {
        ...this.dailyState,
        punchOut: timestamp,
        punchState: "PUNCHED_OUT",
        isPunchedIn: false,
        isOnBreak: false,
        isPunchedOut: true,
        punchOutLocation:
          request.latitude != null && request.longitude != null
            ? {
                latitude: request.latitude,
                longitude: request.longitude,
                accuracy: request.accuracy ?? 0,
                address: request.address ?? null,
              }
            : null,
        lastAction: "PUNCH_OUT",
        lastActionAt: timestamp,
      };

      return {
        success: true,
        message: "Punch Out successful.",
        action: request.action,
        actionStatus: "SUCCESS",
        attendance: { ...this.dailyState },
        timestamp,
      };

    default:
      return {
        success: false,
        message: `Unsupported attendance action: ${request.action}`,
        action: request.action,
        actionStatus: "FAILED",
        attendance: { ...this.dailyState },
        timestamp,
      };
  }
}
  // ===========================================================================
  // Summary Calculation
  // ===========================================================================

  private calculateSummary(
    records: AttendanceRecord[],
    filters?: AttendanceFilter,
  ): AttendanceSummary {
    const total = records.length;

    const present = records.filter(
      (record) =>
        record.status === "Present",
    ).length;

    const absent = records.filter(
      (record) =>
        record.status === "Absent",
    ).length;

    const late = records.filter(
      (record) =>
        record.status === "Late",
    ).length;

    const weeklyOff = records.filter(
      (record) =>
        record.status === "WeeklyOff",
    ).length;

    const holiday = records.filter(
      (record) =>
        record.status === "Holiday",
    ).length;

    const workingDays = Math.max(
      total - weeklyOff - holiday,
      0,
    );

    const presentPercentage =
      workingDays > 0
        ? Math.round(
            (present / workingDays) * 100,
          )
        : 0;

    const absentPercentage =
      workingDays > 0
        ? Math.round(
            (absent / workingDays) * 100,
          )
        : 0;

    const latePercentage =
      workingDays > 0
        ? Math.round(
            (late / workingDays) * 100,
          )
        : 0;

    const workRecords = records.filter(
      (record) =>
        record.status === "Present" ||
        record.status === "Late",
    );

    const totalHours =
      workRecords.reduce(
        (sum, record) =>
          sum + record.workingHours,
        0,
      );

    const averageHours =
      workRecords.length > 0
        ? totalHours / workRecords.length
        : 0;

    const hours =
      Math.floor(averageHours);

    const minutes =
      Math.round(
        (averageHours - hours) * 60,
      );

    const averageWorkingHours =
      `${String(hours).padStart(2, "0")}:${String(
        minutes,
      ).padStart(2, "0")}`;

    let totalDays = total;

    if (
      filters?.startDate &&
      filters?.endDate
    ) {
      const start = new Date(
        filters.startDate,
      );

      const end = new Date(
        filters.endDate,
      );

      const diffTime =
        Math.abs(
          end.getTime() -
            start.getTime(),
        );

      totalDays =
        Math.ceil(
          diffTime /
            (1000 * 60 * 60 * 24),
        ) + 1;
    }

    return {
      totalDays,

      presentDays: present,
      presentPercentage,

      absentDays: absent,
      absentPercentage,

      lateDays: late,
      latePercentage,

      averageWorkingHours,
    };
  }
}

// =============================================================================
// Real API Service
// =============================================================================

class ApiAttendanceService
  implements IAttendanceService {

  // ===========================================================================
  // Query Parameters
  // ===========================================================================

  private buildQueryParams(
    filters?: AttendanceFilter,
  ): URLSearchParams {
    const params =
      new URLSearchParams();

    if (!filters) {
      return params;
    }

    if (filters.startDate) {
      params.append(
        "start_date",
        filters.startDate,
      );
    }

    if (filters.endDate) {
      params.append(
        "end_date",
        filters.endDate,
      );
    }

    if (filters.selectedDate) {
      params.append(
        "date",
        filters.selectedDate,
      );
    }

    if (filters.status) {
      params.append(
        "status",
        filters.status,
      );
    }

    if (filters.searchTerm) {
      params.append(
        "search",
        filters.searchTerm,
      );
    }

    return params;
  }

  // ===========================================================================
  // Get Today's Local Date
  // ===========================================================================

  /**
   * IMPORTANT:
   *
   * Do not use toISOString() for today's date here.
   *
   * toISOString() uses UTC and can return the previous/next
   * date around midnight for an Indian user.
   *
   * The HRMS attendance date is based on local/IST date.
   */
  private getTodayDate(): string {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1,
      ).padStart(2, "0");

    const day =
      String(
        now.getDate(),
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // ===========================================================================
  // Response Handler
  // ===========================================================================

  private handleResponse<T>(
    response: AxiosResponse,
  ): T {
    const responseData =
      response.data;

    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData &&
      responseData.data !== undefined
    ) {
      return responseData.data as T;
    }

    return responseData as T;
  }

  // ===========================================================================
  // Empty Daily State
  // ===========================================================================

  private createEmptyDailyState(
    date: string,
  ): DailyPunchState {
    return {
      id: null,

      employeeId: "",

      attendanceDate: date,

      punchIn: null,
      punchOut: null,

      breakIn: null,
      breakOut: null,

      punchState:
        "NOT_PUNCHED_IN",

      isPunchedIn: false,
      isOnBreak: false,
      isPunchedOut: false,

      workingMinutes: 0,
      breakMinutes: 0,

      punchInLocation: null,
      punchOutLocation: null,

      lastAction: null,
      lastActionAt: null,
    };
  }

  // ===========================================================================
  // Backend Attendance -> Frontend Daily Punch State
  // ===========================================================================

  private mapBackendAttendanceToDailyPunchState(
    attendance: any,
  ): DailyPunchState {
    const attendanceDate =
      attendance?.attendance_date ??
      attendance?.attendanceDate ??
      attendance?.date ??
      this.getTodayDate();

    const punchIn =
      attendance?.punch_in ??
      attendance?.punchIn ??
      null;

    const punchOut =
      attendance?.punch_out ??
      attendance?.punchOut ??
      null;

    const breakIn =
      attendance?.break_in ??
      attendance?.breakIn ??
      attendance?.last_break_in ??
      null;

    const breakOut =
      attendance?.break_out ??
      attendance?.breakOut ??
      attendance?.last_break_out ??
      null;

    const punchInLocation =
      attendance?.punch_in_location ??
      attendance?.punchInLocation ??
      null;

    const punchOutLocation =
      attendance?.punch_out_location ??
      attendance?.punchOutLocation ??
      null;

    const isPunchedIn =
      Boolean(punchIn);

    const isPunchedOut =
      Boolean(punchOut);

    const isOnBreak =
      Boolean(breakIn) &&
      !Boolean(breakOut);

    let punchState:
      DailyPunchState["punchState"];

    if (isPunchedOut) {
      punchState =
        "PUNCHED_OUT";
    } else if (isOnBreak) {
      punchState =
        "ON_BREAK";
    } else if (isPunchedIn) {
      punchState =
        "WORKING";
    } else {
      punchState =
        "NOT_PUNCHED_IN";
    }

    let lastAction:
      DailyPunchState["lastAction"];

    if (isPunchedOut) {
      lastAction =
        "PUNCH_OUT";
    } else if (breakOut) {
      lastAction =
        "BREAK_OUT";
    } else if (breakIn) {
      lastAction =
        "BREAK_IN";
    } else if (punchIn) {
      lastAction =
        "PUNCH_IN";
    } else {
      lastAction = null;
    }

    return {
      id:
        attendance?.id != null
          ? String(attendance.id)
          : null,

      employeeId:
        attendance?.employee_id ??
        attendance?.employeeId ??
        attendance?.emp_id ??
        "",

      attendanceDate,

      punchIn,
      punchOut,

      breakIn,
      breakOut,

      punchState,

      isPunchedIn,
      isOnBreak,
      isPunchedOut,

      workingMinutes: Number(
        attendance?.working_minutes ??
          attendance?.workingMinutes ??
          attendance?.working_hrs ??
          0,
      ),

      breakMinutes: Number(
        attendance?.break_minutes ??
          attendance?.breakMinutes ??
          attendance?.total_break ??
          0,
      ),

      punchInLocation,
      punchOutLocation,

      lastAction,

      lastActionAt:
        attendance?.last_action_at ??
        attendance?.lastActionAt ??
        null,
    };
  }

  // ===========================================================================
  // Normalize Attendance History Response
  // ===========================================================================

  private normalizeAttendanceResponse(
    response: any,
  ): AttendanceApiResponse {
    const data =
      response?.data !== undefined
        ? response.data
        : response;

    if (Array.isArray(data)) {
      return {
        records:
          data as AttendanceRecord[],

        summary:
          {} as AttendanceSummary,

        overview: [],

        totalCount:
          data.length,

        page: 1,

        pageSize:
          data.length,
      };
    }

    return {
      records:
        Array.isArray(data?.records)
          ? data.records
          : [],

      summary:
        data?.summary ??
        ({} as AttendanceSummary),

      overview:
        Array.isArray(data?.overview)
          ? data.overview
          : [],

      totalCount: Number(
        data?.totalCount ??
          data?.total_count ??
          data?.records?.length ??
          0,
      ),

      page: Number(
        data?.page ?? 1,
      ),

      pageSize: Number(
        data?.pageSize ??
          data?.page_size ??
          10,
      ),
    };
  }

  // ===========================================================================
  // Error Handler
  // ===========================================================================

  private handleError(
    error: unknown,
  ): never {
    if (axios.isAxiosError(error)) {
      const responseData =
        error.response?.data;

      let message =
        error.message ||
        "Attendance API request failed.";

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        if (
          "message" in responseData &&
          typeof responseData.message ===
            "string"
        ) {
          message =
            responseData.message;
        } else if (
          "detail" in responseData &&
          typeof responseData.detail ===
            "string"
        ) {
          message =
            responseData.detail;
        }
      }

      throw new Error(
        `Attendance API Error: ${message}`,
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "An unexpected attendance error occurred.",
    );
  }

  // ===========================================================================
  // Attendance History
  // ===========================================================================

  async getAttendance(
    filters?: AttendanceFilter,
  ): Promise<AttendanceApiResponse> {
    try {
      const params =
        this.buildQueryParams(filters);

      const query =
        params.toString();

      const url =
        query.length > 0
          ? `${API_ENDPOINTS.attendance}?${query}`
          : API_ENDPOINTS.attendance;

      const response =
        await axiosInstance.get(url);

      return this.normalizeAttendanceResponse(
        response.data,
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Summary
  // ===========================================================================

  async getAttendanceSummary(
    filters?: AttendanceFilter,
  ): Promise<AttendanceSummary> {
    try {
      const params =
        this.buildQueryParams(filters);

      const query =
        params.toString();

      const url =
        query.length > 0
          ? `${API_ENDPOINTS.summary}?${query}`
          : API_ENDPOINTS.summary;

      const response =
        await axiosInstance.get<AttendanceSummary>(
          url,
        );

      return this.handleResponse<AttendanceSummary>(
        response,
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Monthly Overview
  // ===========================================================================

  async getAttendanceOverview(
    year: number,
    month: number,
  ): Promise<AttendanceOverviewItem[]> {
    try {
      const params =
        new URLSearchParams();

      params.append(
        "year",
        year.toString(),
      );

      params.append(
        "month",
        month.toString(),
      );

      const response =
        await axiosInstance.get<
          AttendanceOverviewItem[]
        >(
          `${API_ENDPOINTS.overview}?${params.toString()}`,
        );

      return this.handleResponse<
        AttendanceOverviewItem[]
      >(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Export
  // ===========================================================================

  async exportAttendance(
    filters?: AttendanceFilter,
  ): Promise<AttendanceExportResponse> {
    try {
      const params =
        this.buildQueryParams(filters);

      const query =
        params.toString();

      const url =
        query.length > 0
          ? `${API_ENDPOINTS.export}?${query}`
          : API_ENDPOINTS.export;

      const response =
        await axiosInstance.get<Blob>(
          url,
          {
            responseType: "blob",
          },
        );

      const blob =
        response.data;

      const downloadUrl =
        URL.createObjectURL(blob);

      const fileName =
        `attendance-${this.getTodayDate()}.xlsx`;

      return {
        downloadUrl,
        fileName,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Filter
  // ===========================================================================

  async filterAttendance(
    filters: AttendanceFilter,
  ): Promise<AttendanceApiResponse> {
    return this.getAttendance(filters);
  }

  // ===========================================================================
  // Today's Attendance
  // ===========================================================================

  async getTodayAttendance(): Promise<DailyPunchState> {
    try {
      /**
       * Today's date is generated using the browser's
       * local date, not UTC.
       */
      const today =
        this.getTodayDate();

      /**
       * Get today's attendance from backend.
       *
       * Backend identifies the logged-in employee
       * using JWT.
       */
      const response =
        await this.getAttendance({
          selectedDate: today,
        });

      const records =
        Array.isArray(
          response?.records,
        )
          ? response.records
          : [];

      /**
       * Find today's record.
       */
      const todayRecord =
        records.find(
          (record: any) => {
            const recordDate =
              record?.date ??
              record?.attendance_date ??
              record?.attendanceDate;

            if (!recordDate) {
              return false;
            }

            return (
              String(recordDate)
                .substring(0, 10) ===
              today
            );
          },
        );

      /**
       * No record means the employee
       * has not punched in today.
       */
      if (!todayRecord) {
        return this.createEmptyDailyState(
          today,
        );
      }

      /**
       * Convert backend state into frontend state.
       */
      return this.mapBackendAttendanceToDailyPunchState(
        todayRecord,
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Today's Activity Timeline
  // ===========================================================================

  async getTodayTimeline(): Promise<
    AttendanceTimelineActivity[]
  > {
    try {
      const today =
        this.getTodayDate();

      /**
       * Use the existing attendance API.
       *
       * No new backend timeline API is required.
       */
      const response =
        await axiosInstance.get(
          `${API_ENDPOINTS.attendance}?date=${today}`,
        );

      const responseData =
        response.data;

      /**
       * Backend may return:
       *
       * 1. A single attendance object
       * 2. An array
       * 3. { records: [...] }
       * 4. { data: [...] }
       * 5. { data: { records: [...] } }
       */
      let records: any[] = [];

      if (Array.isArray(responseData)) {
        records = responseData;
      } else if (
        responseData &&
        Array.isArray(
          responseData.records,
        )
      ) {
        records =
          responseData.records;
      } else if (
        responseData &&
        responseData.data &&
        Array.isArray(
          responseData.data,
        )
      ) {
        records =
          responseData.data;
      } else if (
        responseData &&
        responseData.data &&
        Array.isArray(
          responseData.data.records,
        )
      ) {
        records =
          responseData.data.records;
      } else if (
        responseData &&
        typeof responseData ===
          "object" &&
        responseData.id != null
      ) {
        records = [
          responseData,
        ];
      } else if (
        responseData &&
        responseData.data &&
        typeof responseData.data ===
          "object" &&
        responseData.data.id != null
      ) {
        records = [
          responseData.data,
        ];
      }

      /**
       * Find today's attendance record.
       */
      const todayRecord =
        records.find(
          (record: any) => {
            const recordDate =
              record?.date ??
              record?.attendance_date ??
              record?.attendanceDate;

            return (
              recordDate &&
              String(recordDate)
                .substring(0, 10) ===
                today
            );
          },
        );

      if (!todayRecord) {
        return [];
      }

      const activities: AttendanceTimelineActivity[] =
        [];

      // -----------------------------------------------------------------------
      // Punch In
      // -----------------------------------------------------------------------

      if (todayRecord.punch_in) {
        activities.push({
          id: `${todayRecord.id}-PI`,
          activity: "PI",
          log: todayRecord.punch_in,
          address:
            todayRecord.punch_in_address ??
            null,
        });
      }

      // -----------------------------------------------------------------------
      // Break In
      // -----------------------------------------------------------------------

      if (todayRecord.last_break_in) {
        activities.push({
          id: `${todayRecord.id}-BI`,
          activity: "BI",
          log: todayRecord.last_break_in,
          address: null,
        });
      }

      // -----------------------------------------------------------------------
      // Break Out
      // -----------------------------------------------------------------------

      if (todayRecord.last_break_out) {
        activities.push({
          id: `${todayRecord.id}-BO`,
          activity: "BO",
          log: todayRecord.last_break_out,
          address: null,
        });
      }

      // -----------------------------------------------------------------------
      // Punch Out
      // -----------------------------------------------------------------------

      if (todayRecord.punch_out) {
        activities.push({
          id: `${todayRecord.id}-PO`,
          activity: "PO",
          log: todayRecord.punch_out,
          address:
            todayRecord.punch_out_address ??
            null,
        });
      }

      // -----------------------------------------------------------------------
      // Always display activities chronologically.
      // -----------------------------------------------------------------------

      activities.sort(
        (a, b) =>
          new Date(a.log).getTime() -
          new Date(b.log).getTime(),
      );

      return activities;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ===========================================================================
  // Punch Action
  // ===========================================================================

  async executePunchAction(
    request: PunchActionRequest,
  ): Promise<PunchActionResponse> {
    try {
      const endpoint =
        ATTENDANCE_ACTION_ENDPOINTS[
          request.action
        ];

      if (!endpoint) {
        throw new Error(
          `Unsupported attendance action: ${request.action}`,
        );
      }

      // -----------------------------------------------------------------------
      // Prepare backend payload
      // -----------------------------------------------------------------------

      const payload = {
        latitude:
          request.latitude,

        longitude:
          request.longitude,

        accuracy:
          request.accuracy ?? null,

        address:
          request.address ?? null,

        action_time:
          request.actionTime ?? null,
      };

      // -----------------------------------------------------------------------
      // Execute attendance action
      // -----------------------------------------------------------------------

      const response =
        await axiosInstance.post(
          endpoint,
          payload,
        );

      const responseData =
        this.handleResponse<any>(
          response,
        );

      // -----------------------------------------------------------------------
      // Backend rejected action
      // -----------------------------------------------------------------------

      if (!responseData?.success) {
        const attendance =
          this.mapBackendAttendanceToDailyPunchState(
            responseData?.attendance,
          );

        return {
          ...responseData,

          action:
            request.action,

          attendance,
        } as PunchActionResponse;
      }

      // // -----------------------------------------------------------------------
      // // IMPORTANT:
      // //
      // // After every successful action,
      // // get the state again from DB.
      // // -----------------------------------------------------------------------

      // let latestAttendance:
      //   | DailyPunchState
      //   | null = null;

      // try {
      //   latestAttendance =
      //     await this.getTodayAttendance();
      // } catch (refreshError) {
      //   console.warn(
      //     "Attendance action succeeded, but latest attendance state could not be refreshed:",
      //     refreshError,
      //   );
      // }

      // // -----------------------------------------------------------------------
      // // Use database state.
      // // If refresh fails, use action response.
      // // -----------------------------------------------------------------------

      // const attendance =
      //   latestAttendance ??
      //   this.mapBackendAttendanceToDailyPunchState(
      //     responseData?.attendance,
      //   );

      // -----------------------------------------------------------------------
// Use the attendance state returned by the successful action itself.
//
// Do not immediately call getTodayAttendance() here because the
// existing GET /attendance/ endpoint can return attendance records
// belonging to other employees.
// -----------------------------------------------------------------------
const attendance =
  this.mapBackendAttendanceToDailyPunchState(
    responseData?.attendance,
  );

      return {
        ...responseData,

        action:
          request.action,

        attendance,
      } as PunchActionResponse;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// =============================================================================
// Service Factory
// =============================================================================

export const attendanceService: IAttendanceService =
  USE_MOCK
    ? new MockAttendanceService()
    : new ApiAttendanceService();

// =============================================================================
// Mock Mode Helper
// =============================================================================

export const isUsingMock =
  USE_MOCK;

// =============================================================================
// Testing Exports
// =============================================================================

export {
  MockAttendanceService,
  ApiAttendanceService,
};