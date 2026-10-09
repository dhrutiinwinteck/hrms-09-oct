import axiosInstance from '@/services/axios/axiosInstance';

import {
  AttendanceRecord,
  AttendanceStatus,
  EmployeeOption,
} from '../types/editPunchInOut.types';

/* ============================================================
   API CONSTANTS
============================================================ */

const ATTENDANCE_ENDPOINT = '/api/v1/attendance';

/* ============================================================
   BACKEND TYPES
============================================================ */

interface BackendAttendanceRecord {
  id: number;
  emp_id: number;
  date: string;

  punch_in: string | null;
  punch_out: string | null;

  working_hrs: number | null;
  total_break: number;

  last_break_in: string | null;
  last_break_out: string | null;
}

interface AttendanceListResponse {
  success: boolean;
  data: BackendAttendanceRecord[];
  pagination: {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

interface AttendanceUpdatePayload {
  punch_in?: string;
  punch_out?: string;
  total_break?: number;
}

interface BackendEmployee {
  id: number;
  emp_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  department?: string | null;
  is_remove: number;
}

/* ============================================================
   SERVICE
============================================================ */

export class EditPunchInOutService {

  private normalizeMonth(month: string): string {
  const trimmedMonth = month.trim();

  // Format: 2026-06
  if (/^\d{4}-\d{2}$/.test(trimmedMonth)) {
    return trimmedMonth;
  }

  // Format: 2026-06-01
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedMonth)) {
    return trimmedMonth.substring(0, 7);
  }

  // Format: June 2026
  const parsedDate = new Date(
    `${trimmedMonth} 1`
  );

  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const monthNumber = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${monthNumber}`;
  }

  throw new Error(
    `Invalid month format: ${month}`
  );
}

  // ==========================================================
// GET ACTIVE EMPLOYEES
// ==========================================================

async getEmployees(): Promise<EmployeeOption[]> {
  try {
    const response =
      await axiosInstance.get<BackendEmployee[]>(
        "/api/v1/employees/"
      );

    return response.data
      .filter((employee) => employee.is_remove === 0)
      .map((employee): EmployeeOption => {
        const fullName =
          employee.full_name?.trim() ||
          `${employee.first_name ?? ""} ${
            employee.last_name ?? ""
          }`.trim();

        return {
          id: String(employee.id),
          name:
            fullName ||
            employee.emp_code ||
            `Employee ${employee.id}`,
          department:
            employee.department ?? undefined,
        };
      });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to load employees: ${error.message}`
      );
    }

    throw new Error("Failed to load employees");
  }
}
  /* ==========================================================
     GET ATTENDANCE RECORDS
  ========================================================== */

  async getAttendanceRecords(
    page: number = 1,
    pageSize: number = 100
  ): Promise<AttendanceListResponse> {
    const response =
      await axiosInstance.get<AttendanceListResponse>(
        ATTENDANCE_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
          },
        }
      );

    return response.data;
  }

  /* ==========================================================
     SEARCH ATTENDANCE BY EMPLOYEE AND MONTH

     Existing backend endpoint returns paginated attendance.
     Filtering is performed after retrieving the records.
  ========================================================== */

 async searchAttendance(
  employeeId: string,
  month: string
): Promise<AttendanceRecord[]> {
  const employeeIdNumber = Number(employeeId);

  if (!Number.isInteger(employeeIdNumber) || employeeIdNumber <= 0) {
    throw new Error("Invalid employee ID");
  }

  const normalizedMonth = this.normalizeMonth(month);

  console.log("Selected Employee ID:", employeeIdNumber);
  console.log("Selected Month:", normalizedMonth);

  const allRecords: BackendAttendanceRecord[] = [];

  let page = 1;
  const pageSize = 100;
  let hasNext = true;

  // Fetch all attendance pages
  while (hasNext) {
    const response = await this.getAttendanceRecords(
      page,
      pageSize
    );

    if (!response || !Array.isArray(response.data)) {
      throw new Error(
        "Invalid attendance API response"
      );
    }

    allRecords.push(...response.data);

    hasNext =
      response.pagination?.has_next === true;

    page++;
  }

  console.log(
    "Total Attendance Records:",
    allRecords.length
  );

  const filteredRecords = allRecords.filter(
    (record) => {
      const recordEmployeeId = Number(record.emp_id);

      const recordMonth = String(record.date)
        .substring(0, 7);

      const employeeMatches =
        recordEmployeeId === employeeIdNumber;

      const monthMatches =
        recordMonth === normalizedMonth;

      console.log({
        recordId: record.id,
        recordEmployeeId,
        selectedEmployeeId: employeeIdNumber,
        recordMonth,
        selectedMonth: normalizedMonth,
        employeeMatches,
        monthMatches,
      });

      return employeeMatches && monthMatches;
    }
  );

  console.log(
    "Filtered Attendance Records:",
    filteredRecords
  );

  return filteredRecords.map((record) =>
    this.mapBackendRecord(record)
  );
}

  /* ==========================================================
     GET ATTENDANCE BY ID
  ========================================================== */

  async getAttendanceById(
    recordId: string
  ): Promise<AttendanceRecord> {
    const response =
      await axiosInstance.get<BackendAttendanceRecord>(
        `${ATTENDANCE_ENDPOINT}/${recordId}`
      );

    return this.mapBackendRecord(response.data);
  }

  /* ==========================================================
     UPDATE ATTENDANCE
  ========================================================== */

  /* ==========================================================
   UPDATE ATTENDANCE
========================================================== */

async updateAttendance(
  recordId: string,
  data: Partial<AttendanceRecord>,
  recordDate: string
): Promise<AttendanceRecord> {
  const payload: AttendanceUpdatePayload = {};

  const normalizedDate = this.normalizeDate(recordDate);

  console.log("Update Record ID:", recordId);
  console.log("Original Record Date:", recordDate);
  console.log("Normalized Date:", normalizedDate);
  console.log("Frontend Update Data:", data);

  if (data.checkIn !== undefined) {
    if (!data.checkIn) {
      throw new Error(
        "Clearing punch-in is not supported by the current API"
      );
    }

    payload.punch_in = this.convertTimeToDateTime(
      normalizedDate,
      data.checkIn
    );
  }

  if (data.checkOut !== undefined) {
    if (!data.checkOut) {
      throw new Error(
        "Clearing punch-out is not supported by the current API"
      );
    }

    payload.punch_out = this.convertTimeToDateTime(
      normalizedDate,
      data.checkOut
    );
  }

  if (data.breakTime !== undefined) {
    const breakTime = Number(data.breakTime);

    if (!Number.isFinite(breakTime) || breakTime < 0) {
      throw new Error(
        "Break time must be a valid non-negative number"
      );
    }

    payload.total_break = Number((breakTime * 60).toFixed(2));
  }

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "No supported attendance fields to update"
    );
  }

  console.log("PATCH URL:", `${ATTENDANCE_ENDPOINT}/${recordId}`);
  console.log("PATCH Payload:", payload);

  try {
    const response =
      await axiosInstance.patch<BackendAttendanceRecord>(
        `${ATTENDANCE_ENDPOINT}/${recordId}`,
        payload
      );

    console.log("Update API Response:", response.data);

    return this.mapBackendRecord(response.data);
  } catch (error: any) {
    console.error(
      "Update API Error Response:",
      error.response?.data
    );

    const backendMessage =
      error.response?.data?.detail;

    if (Array.isArray(backendMessage)) {
      const validationMessage = backendMessage
        .map((item: any) => {
          const location = item.loc?.join(".") ?? "field";
          return `${location}: ${item.msg}`;
        })
        .join(", ");

      throw new Error(validationMessage);
    }

    if (typeof backendMessage === "string") {
      throw new Error(backendMessage);
    }

    throw new Error(
      error.message || "Failed to update attendance"
    );
  }
}

  /* ==========================================================
     DELETE ATTENDANCE
  ========================================================== */

  async deleteAttendance(
    recordId: string
  ): Promise<void> {
    await axiosInstance.delete(
      `${ATTENDANCE_ENDPOINT}/${recordId}`
    );
  }

  /* ==========================================================
     MAP BACKEND RECORD TO FRONTEND RECORD
  ========================================================== */

  private mapBackendRecord(
    record: BackendAttendanceRecord
  ): AttendanceRecord {
    return {
      id: String(record.id),

      employeeId: String(record.emp_id),

      employeeName: '',

      date: record.date,

      checkIn: this.formatTime(record.punch_in),

      checkOut: this.formatTime(record.punch_out),

      status: this.getAttendanceStatus(record),

      lateMark: null,

      overtime: 0,

      breakTime: Number(
        ((record.total_break ?? 0) / 60).toFixed(2)
      ),
    };
  }

  /* ==========================================================
     CONVERT BACKEND DATETIME TO HH:mm
  ========================================================== */

  private formatTime(
    value: string | null
  ): string | null {
    if (!value) {
      return null;
    }

    const timePart = value.includes('T')
      ? value.split('T')[1]
      : value;

    return timePart.substring(0, 5);
  }

  /* ==========================================================
   NORMALIZE DATE
========================================================== */

private normalizeDate(value: string): string {
  const trimmedValue = value.trim();

  // Already in YYYY-MM-DD format
  const isoDateMatch = trimmedValue.match(
    /^\d{4}-\d{2}-\d{2}/
  );

  if (isoDateMatch) {
    return isoDateMatch[0];
  }

  // Convert formats such as:
  // Jun 26, 2026
  // June 26, 2026
  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error(
      `Invalid attendance date: ${value}`
    );
  }

  const year = parsedDate.getFullYear();
  const month = String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    parsedDate.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
  /* ==========================================================
     CONVERT HH:mm TO BACKEND DATETIME
  ========================================================== */

  private convertTimeToDateTime(
    date: string,
    time: string
  ): string {
    if (!/^\d{2}:\d{2}$/.test(time)) {
      throw new Error(
        'Invalid time format. Expected HH:mm'
      );
    }

    const [hours, minutes] = time
      .split(':')
      .map(Number);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new Error(
        'Invalid time value'
      );
    }

    return `${date}T${time}:00`;
  }

  /* ==========================================================
     DERIVE DISPLAY STATUS

     Current backend does not return attendance status.
  ========================================================== */

  private getAttendanceStatus(
    record: BackendAttendanceRecord
  ): AttendanceStatus {
    if (!record.punch_in) {
      return 'absent';
    }

    if (
      record.punch_in &&
      record.punch_out
    ) {
      return 'present';
    }

    return 'present';
  }
}

export const editPunchInOutService =
  new EditPunchInOutService();