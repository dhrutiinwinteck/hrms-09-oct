// src/pages/attendance/attendance-history/services/attendanceHistory.service.ts

import axiosInstance from "@/services/axios/axiosInstance";

import type {
  EmployeeAttendance,
  AttendanceStatistics,
  AttendanceFilters,
  PaginationInfo,
  AttendanceInsights,
  AttendanceRecord,
  MonthlySummary,
} from "../types/attendanceHistory.types";

// ============================================================
// BACKEND TYPES
// ============================================================

interface BackendAttendanceRecord {
  id: number;
  emp_id: number;
  date: string;
  punch_in?: string | null;
  punch_out?: string | null;
  working_hrs?: number | null;
  total_break?: number | null;
  last_break_in?: string | null;
  last_break_out?: string | null;
}

interface AttendancePagination {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

interface AttendanceListResponse {
  success?: boolean;
  data?: BackendAttendanceRecord[];
  pagination?: AttendancePagination;
}

interface BackendEmployee {
  id?: number | string;
  emp_code?: string | number;

  first_name?: string | null;
  last_name?: string | null;

  designation?: string | { name?: string };
  department?: string | { name?: string };

  photo?: string | null;
  avatar?: string | null;
  profile_image?: string | null;
}

interface ActiveEmployee {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  emp_code?: string | number;
  email?: string | null;
  phone?: string | null;
  designation?: number | string | null;
}

interface EmployeeListResponse {
  success?: boolean;
  data?:
    | BackendEmployee[]
    | {
        items?: BackendEmployee[];
        results?: BackendEmployee[];
      };
  employees?: BackendEmployee[];
  items?: BackendEmployee[];
}

interface AttendanceHistoryResponse {
  employees: EmployeeAttendance[];
  statistics: AttendanceStatistics;
  pagination: PaginationInfo;
}

// ============================================================
// CONSTANTS
// ============================================================

// const ATTENDANCE_ENDPOINT = "/api/v1/attendance";
// const EMPLOYEE_ENDPOINT = "/api/v1/employees";

const ATTENDANCE_ENDPOINT = "/api/v1/attendance";
const EMPLOYEE_ENDPOINT = "/api/v1/employees";
const ACTIVE_EMPLOYEES_ENDPOINT =
  "/api/v1/shift-assignments/employees";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EMPTY_MONTHLY_SUMMARY: MonthlySummary = {
  present: 0,
  weekOff: 0,
  paidLeave: 0,
  casualLeave: 0,
  compensatoryLeave: 0,
  halfDayPL: 0,
  halfDayCL: 0,
  halfDayCO: 0,
  publicHoliday: 0,
  lop: 0,
  halfDayLOP: 0,
  lwp: 0,
  paidDays: 0,
  lopAbsent: 0,
};

// ============================================================
// ERROR HANDLING
// ============================================================

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.detail ||
      response?.data?.message ||
      "Unable to fetch attendance history."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

// ============================================================
// EMPLOYEE HELPERS
// ============================================================

/**
 * Returns the employee database ID.
 *
 * Attendance API:
 * emp_id = employee_detail.id
 *
 * Employee API:
 * id = employee_detail.id
 */
const getEmployeeId = (
  employee: BackendEmployee,
): string | null => {
  if (employee.id === undefined || employee.id === null) {
    return null;
  }

  return String(employee.id);
};

/**
 * Creates the employee's full name using first_name and last_name.
 */
const getEmployeeName = (
  employee: BackendEmployee,
  employeeKey: string,
): string => {
  const firstName = employee.first_name?.trim() ?? "";
  const lastName = employee.last_name?.trim() ?? "";

  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return `Employee ${employeeKey}`;
};

/**
 * Converts designation or department value into a string.
 */
const getDisplayValue = (
  value?: string | { name?: string },
): string => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    value.name?.trim()
  ) {
    return value.name.trim();
  }

  return "N/A";
};

/**
 * Returns existing photo or generated avatar.
 */
const getAvatarUrl = (
  employee: BackendEmployee,
  employeeName: string,
): string => {
  const existingPhoto =
    employee.photo ||
    employee.avatar ||
    employee.profile_image;

  if (existingPhoto) {
    return existingPhoto;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    employeeName,
  )}&background=random`;
};

// ============================================================
// ATTENDANCE HELPERS
// ============================================================

const formatTime = (
  value?: string | null,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStatus = (
  record: BackendAttendanceRecord,
): AttendanceRecord["status"] => {
  return record.punch_in ? "P" : "AB";
};

/**
 * Creates the initial attendance grid for a month.
 */
const createDefaultDailyRecords = (
  month: number,
  year: number,
): AttendanceRecord[] => {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from(
    { length: daysInMonth },
    (_, index) => {
      const day = index + 1;
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();

      const isWeekend =
        dayOfWeek === 0 || dayOfWeek === 6;

      return {
        date: `${String(day).padStart(2, "0")} ${
          MONTH_NAMES[month - 1]
        } ${year}`,
        status: isWeekend ? "WO" : "AB",
      };
    },
  );
};

// ============================================================
// MONTHLY SUMMARY
// ============================================================

const calculateMonthlySummary = (
  dailyRecords: AttendanceRecord[],
): MonthlySummary => {
  const summary: MonthlySummary = {
    ...EMPTY_MONTHLY_SUMMARY,
  };

  dailyRecords.forEach((record) => {
    switch (record.status) {
      case "P":
        summary.present++;
        break;

      case "WO":
        summary.weekOff++;
        break;

      case "PL":
        summary.paidLeave++;
        break;

      case "CL":
        summary.casualLeave++;
        break;

      case "CO":
        summary.compensatoryLeave++;
        break;

      case "HD-PL":
        summary.halfDayPL++;
        break;

      case "HD-CL":
        summary.halfDayCL++;
        break;

      case "HD-CO":
        summary.halfDayCO++;
        break;

      case "PH":
        summary.publicHoliday++;
        break;

      case "LOP":
        summary.lop++;
        break;

      case "HD-LOP":
        summary.halfDayLOP++;
        break;

      case "LWP":
        summary.lwp++;
        break;

      case "AB":
        summary.lopAbsent++;
        break;

      default:
        break;
    }
  });

  summary.paidDays =
    summary.present +
    summary.weekOff +
    summary.paidLeave +
    summary.casualLeave +
    summary.compensatoryLeave +
    summary.halfDayPL +
    summary.halfDayCL +
    summary.halfDayCO +
    summary.publicHoliday;

  return summary;
};

// ============================================================
// STATISTICS
// ============================================================

const calculateStatistics = (
  employees: EmployeeAttendance[],
): AttendanceStatistics => {
  let present = 0;
  let absent = 0;
  let weekOff = 0;
  let latePunchIn = 0;
  let lop = 0;
  let totalLateMinutes = 0;

  employees.forEach((employee) => {
    employee.dailyRecords.forEach((record) => {
      switch (record.status) {
        case "P":
          present++;

          if (
            record.lateMinutes !== undefined &&
            record.lateMinutes > 0
          ) {
            latePunchIn++;
            totalLateMinutes += record.lateMinutes;
          }

          break;

        case "AB":
          absent++;
          break;

        case "WO":
          weekOff++;
          break;

        case "LOP":
          lop++;
          break;

        default:
          break;
      }
    });
  });

  const totalRecords = employees.reduce(
    (total, employee) =>
      total + employee.dailyRecords.length,
    0,
  );

  const totalWorkingDays = totalRecords - weekOff;

  return {
    totalEmployees: employees.length,
    present,
    absent,
    weekOff,
    latePunchIn,
    lop,

    averageAttendance:
      totalWorkingDays > 0
        ? (present / totalWorkingDays) * 100
        : 0,

    averageLateMinutes:
      latePunchIn > 0
        ? totalLateMinutes / latePunchIn
        : 0,

    totalWorkingDays,

    absenteeismRate:
      totalWorkingDays > 0
        ? (absent / totalWorkingDays) * 100
        : 0,
  };
};

// ============================================================
// CREATE EMPLOYEE ATTENDANCE
// ============================================================

const createEmployeeAttendance = (
  empId: number,
  records: BackendAttendanceRecord[],
  month: number,
  year: number,
  employee?: BackendEmployee,
): EmployeeAttendance => {
  const employeeKey = String(empId);

  const employeeName = employee
    ? getEmployeeName(employee, employeeKey)
    : `Employee ${employeeKey}`;

  const dailyRecords = createDefaultDailyRecords(
    month,
    year,
  );

  let lateCount = 0;

  records.forEach((record) => {
    const recordDate = record.date.substring(0, 10);

    const day = Number(
      recordDate.substring(8, 10),
    );

    if (
      !Number.isInteger(day) ||
      day < 1 ||
      day > dailyRecords.length
    ) {
      return;
    }

    const attendanceRecord: AttendanceRecord = {
      date: `${String(day).padStart(2, "0")} ${
        MONTH_NAMES[month - 1]
      } ${year}`,

      status: getStatus(record),

      checkIn: formatTime(record.punch_in),

      checkOut: formatTime(record.punch_out),
    };

    dailyRecords[day - 1] = attendanceRecord;

    if (
      attendanceRecord.status === "P" &&
      attendanceRecord.lateMinutes !== undefined &&
      attendanceRecord.lateMinutes > 0
    ) {
      lateCount++;
    }
  });

  const monthlySummary =
    calculateMonthlySummary(dailyRecords);

  return {
    id: employeeKey,

    name: employeeName,

    designation: employee
      ? getDisplayValue(employee.designation)
      : "N/A",

    department: employee
      ? getDisplayValue(employee.department)
      : "N/A",

    avatar: employee
      ? getAvatarUrl(employee, employeeName)
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          employeeName,
        )}&background=random`,

    dailyRecords,

    lateCount,

    monthlySummary,
  };
};

// ============================================================
// SERVICE
// ============================================================

export class AttendanceHistoryService {
  private static instance: AttendanceHistoryService;

  private constructor() {}

  public static getInstance(): AttendanceHistoryService {
    if (!AttendanceHistoryService.instance) {
      AttendanceHistoryService.instance =
        new AttendanceHistoryService();
    }

    return AttendanceHistoryService.instance;
  }

  // ==========================================================
  // GET ALL ATTENDANCE RECORDS
  // ==========================================================

  private async getAllAttendanceRecords(): Promise<
    BackendAttendanceRecord[]
  > {
    const allRecords: BackendAttendanceRecord[] = [];

    let currentPage = 1;

    const pageSize = 100;

    const maximumPages = 100;

    while (currentPage <= maximumPages) {
      const response =
        await axiosInstance.get<AttendanceListResponse>(
          `${ATTENDANCE_ENDPOINT}/`,
          {
            params: {
              page: currentPage,
              page_size: pageSize,
            },
          },
        );

      const responseData = response.data;

      if (Array.isArray(responseData.data)) {
        allRecords.push(...responseData.data);
      }

      const pagination = responseData.pagination;

      if (!pagination || !pagination.has_next) {
        break;
      }

      currentPage++;
    }

    return allRecords;
  }

  // ==========================================================
  // GET EMPLOYEE MAP
  // ==========================================================

  private async getEmployeeMap(): Promise<
    Map<string, BackendEmployee>
  > {
    const employeeMap = new Map<
      string,
      BackendEmployee
    >();

    const response =
      await axiosInstance.get<EmployeeListResponse>(
        `${EMPLOYEE_ENDPOINT}/`,
      );

    const responseData = response.data;

    let employees: BackendEmployee[] = [];

    if (Array.isArray(responseData)) {
      employees = responseData as unknown as BackendEmployee[];
    } else if (Array.isArray(responseData.data)) {
      employees = responseData.data;
    } else if (
      responseData.data &&
      !Array.isArray(responseData.data) &&
      Array.isArray(responseData.data.items)
    ) {
      employees = responseData.data.items;
    } else if (
      responseData.data &&
      !Array.isArray(responseData.data) &&
      Array.isArray(responseData.data.results)
    ) {
      employees = responseData.data.results;
    } else if (Array.isArray(responseData.employees)) {
      employees = responseData.employees;
    } else if (Array.isArray(responseData.items)) {
      employees = responseData.items;
    }

    console.log(
      "Employee API response:",
      responseData,
    );

    console.log(
      "Employees received:",
      employees,
    );

    employees.forEach((employee) => {
      /**
       * Main mapping:
       *
       * attendance.emp_id = employee_detail.id
       */
      const employeeId = getEmployeeId(employee);

      if (employeeId) {
        employeeMap.set(employeeId, employee);
      }

      /**
       * Additional mapping:
       *
       * attendance.emp_id may sometimes contain emp_code.
       */
      if (
        employee.emp_code !== undefined &&
        employee.emp_code !== null
      ) {
        employeeMap.set(
          String(employee.emp_code),
          employee,
        );
      }
    });

    console.log(
      "Employee map:",
      Array.from(employeeMap.entries()),
    );

    return employeeMap;
  }

  // ==========================================================
// GET ACTIVE EMPLOYEE IDS
// ==========================================================

private async getActiveEmployeeIds(): Promise<Set<string>> {
  const response = await axiosInstance.get<ActiveEmployee[]>(
    ACTIVE_EMPLOYEES_ENDPOINT,
  );

  const activeEmployees = Array.isArray(response.data)
    ? response.data
    : [];

  return new Set(
    activeEmployees
      .map((employee) => employee.id)
      .filter(
        (id): id is number =>
          typeof id === "number" && Number.isFinite(id),
      )
      .map(String),
  );
}

  // ==========================================================
  // GET ATTENDANCE HISTORY
  // ==========================================================

  async getAttendanceHistory(
    filters: AttendanceFilters,
    page: number = 1,
    pageSize: number = 5,
  ): Promise<AttendanceHistoryResponse> {
    try {
      const [
        allRecords,
        employeeMap,
        activeEmployeeIds,
      ] = await Promise.all([
        this.getAllAttendanceRecords(),
        this.getEmployeeMap(),
        this.getActiveEmployeeIds(),
      ]);

      const filteredRecords = allRecords.filter(
        (record) => {
          const recordDate = record.date.substring(0, 7);

          return recordDate === filters.month;
        },
      );

      const employeeRecordsMap = new Map<
        number,
        BackendAttendanceRecord[]
      >();

      // filteredRecords.forEach((record) => {
      //   const existingRecords =
      //     employeeRecordsMap.get(record.emp_id) ?? [];

      //   existingRecords.push(record);

      //   employeeRecordsMap.set(
      //     record.emp_id,
      //     existingRecords,
      //   );
      // });

      filteredRecords.forEach((record) => {
  const employeeId = String(record.emp_id);

  // Only keep attendance records belonging to active employees.
  if (!activeEmployeeIds.has(employeeId)) {
    return;
  }

  const existingRecords =
    employeeRecordsMap.get(record.emp_id) ?? [];

  existingRecords.push(record);

  employeeRecordsMap.set(
    record.emp_id,
    existingRecords,
  );
});
      let employees = Array.from(
        employeeRecordsMap.entries(),
      ).map(([empId, records]) => {
        /**
         * Find employee using employee_detail.id.
         */
        const employee = employeeMap.get(
          String(empId),
        );

        if (!employee) {
          console.warn(
            `Employee not found for emp_id: ${empId}`,
          );
        }

        return createEmployeeAttendance(
          empId,
          records,
          Number(filters.month.substring(5, 7)),
          filters.year,
          employee,
        );
      });

      // ========================================================
      // SEARCH FILTER
      // ========================================================

      if (filters.searchTerm) {
        const searchTerm =
          filters.searchTerm.toLowerCase().trim();

        employees = employees.filter((employee) => {
          return (
            employee.name
              .toLowerCase()
              .includes(searchTerm) ||
            employee.id
              .toLowerCase()
              .includes(searchTerm) ||
            employee.designation
              .toLowerCase()
              .includes(searchTerm) ||
            employee.department
              .toLowerCase()
              .includes(searchTerm)
          );
        });
      }

      // ========================================================
      // DEPARTMENT FILTER
      // ========================================================

      if (filters.department) {
        employees = employees.filter(
          (employee) =>
            employee.department === filters.department,
        );
      }

      // ========================================================
      // SORT BY EMPLOYEE NAME
      // ========================================================

      employees.sort((first, second) =>
        first.name.localeCompare(second.name),
      );

      // ========================================================
      // PAGINATION
      // ========================================================

      const totalItems = employees.length;

      const totalPages =
        totalItems > 0
          ? Math.ceil(totalItems / pageSize)
          : 1;

      const validPage = Math.min(
        Math.max(page, 1),
        totalPages,
      );

      const startIndex =
        (validPage - 1) * pageSize;

      const endIndex = startIndex + pageSize;

      const paginatedEmployees = employees.slice(
        startIndex,
        endIndex,
      );

      return {
        employees: paginatedEmployees,

        statistics: calculateStatistics(employees),

        pagination: {
          currentPage: validPage,
          pageSize,
          totalItems,
          totalPages,
        },
      };
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      console.error(
        "Attendance history API error:",
        errorMessage,
      );

      throw new Error(errorMessage);
    }
  }

  // ==========================================================
  // MONTHLY SUMMARY
  // ==========================================================

  async getMonthlySummary(
    filters: AttendanceFilters,
  ): Promise<EmployeeAttendance[]> {
    const response =
      await this.getAttendanceHistory(
        filters,
        1,
        10000,
      );

    return response.employees;
  }

  // ==========================================================
  // LATE MARK CALCULATION
  // ==========================================================

  async calculateLateMarks(
    _filters: AttendanceFilters,
  ): Promise<{
    success: boolean;
    message: string;
    updated: number;
  }> {
    return {
      success: false,
      message:
        "Late-mark calculation API is not available in the backend.",
      updated: 0,
    };
  }

  // ==========================================================
  // EXPORT CSV
  // ==========================================================

  async exportAttendanceHistory(
    filters: AttendanceFilters,
  ): Promise<Blob> {
    const response =
      await this.getAttendanceHistory(
        filters,
        1,
        10000,
      );

    const headers = [
      "Employee",
      "ID",
      "Present",
      "WO",
      "PL",
      "CO",
      "CL",
      "HD-PL",
      "HD-CL",
      "HD-CO",
      "PH",
      "LOP",
      "HD-LOP",
      "LWP",
      "Paid Days",
      "LOP/Absent",
    ];

    const escapeCsvValue = (
      value: unknown,
    ): string => {
      const stringValue = String(value ?? "");

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(
          /"/g,
          '""',
        )}"`;
      }

      return stringValue;
    };

    const rows = response.employees.map(
      (employee) => {
        const summary = employee.monthlySummary;

        return [
          employee.name,
          employee.id,
          summary.present,
          summary.weekOff,
          summary.paidLeave,
          summary.compensatoryLeave,
          summary.casualLeave,
          summary.halfDayPL,
          summary.halfDayCL,
          summary.halfDayCO,
          summary.publicHoliday,
          summary.lop,
          summary.halfDayLOP,
          summary.lwp,
          summary.paidDays,
          summary.lopAbsent,
        ]
          .map(escapeCsvValue)
          .join(",");
      },
    );

    const csvContent = [
      headers.join(","),
      ...rows,
    ].join("\n");

    return new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  }

  // ==========================================================
  // INSIGHTS
  // ==========================================================

  async getInsights(): Promise<AttendanceInsights> {
    return {
      title: "Attendance Insights",

      description:
        "Late-mark insights are unavailable because the backend does not currently provide late-mark information.",

      count: 0,

      actionLabel: "No Details Available",
    };
  }

  // ==========================================================
  // DEFAULT FILTERS
  // ==========================================================

  async getFilters(): Promise<AttendanceFilters> {
    return {
      month: "2026-05",
      year: 2026,
    };
  }
}

// ============================================================
// SERVICE INSTANCE
// ============================================================

export const attendanceHistoryService =
  AttendanceHistoryService.getInstance();