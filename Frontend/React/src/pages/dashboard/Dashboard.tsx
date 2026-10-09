import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  LogIn,
  LogOut,
  Coffee,
  Clock,
  Cake,
  Trophy,
  AlertCircle,
} from "lucide-react";

import WelcomeBanner from "./components/WelcomeBanner/WelcomeBanner";
import PunchCard from "./components/PunchCard/PunchCard";
import HighlightsCard from "./components/HighlightsCard/HighlightsCard";
import TimelineCard from "./components/TimelineCard/TimelineCard";
import AnnouncementCard from "./components/AnnouncementCard/AnnouncementCard";

import { useProfile } from "../profile/hooks/useProfile";
import { attendanceService } from "../attendance/services/attendance.service";

import type {
  AttendanceTimelineActivity,
} from "../attendance/types/attendance.types";

import "./Dashboard.css";

/* =========================================================
   CONSTANTS
========================================================= */

const UPCOMING_DAYS = 90;

/* =========================================================
   TYPES
========================================================= */

interface HighlightItem {
  id: string;
  title: string;
  subtitle: string;
  status: "success" | "warning" | "info" | "neutral";
  icon: React.ReactNode;
  color?: string;
}

interface PolicyRecord {
  id?: string | number;

  title?: string;
  policy_name?: string;
  policyName?: string;
  name?: string;

  description?: string;
  details?: string;
  content?: string;

  category?: string;
  policy_type?: string;
  policyType?: string;

  priority?: string;
  importance?: string;

  created_at?: string;
  createdAt?: string;

  updated_at?: string;
  updatedAt?: string;

  effective_date?: string;
  effectiveDate?: string;

  date?: string;

  published_date?: string;
  publishedDate?: string;

  status?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: "high" | "medium" | "low";
}

interface EmployeeBirthdayRecord {
  id: string;
  name: string;
  dateOfBirth: string;
  dateOfJoining: string;
}

interface EmployeeTimelineEvent {
  id: string;

  type:
    | "PUNCH_IN"
    | "BREAK_IN"
    | "BREAK_OUT"
    | "PUNCH_OUT";

  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  timestamp: number;
}

/* =========================================================
   GENERIC HELPERS
========================================================= */

const getDisplayValue = (
  value: unknown,
  fallback = "",
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const result = String(value).trim();

  return result || fallback;
};

const isObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

/* =========================================================
   AUTH HEADERS
========================================================= */

const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const possibleTokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "auth_token",
    "jwt",
    "jwtToken",
  ];

  for (const key of possibleTokenKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      const cleanToken = token
        .replace(/^Bearer\s+/i, "")
        .trim();

      if (cleanToken) {
        return {
          ...headers,
          Authorization: `Bearer ${cleanToken}`,
        };
      }
    }
  }

  return headers;
};

/* =========================================================
   DATE PARSER
========================================================= */

const parseDate = (
  value: string,
): Date | null => {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return null;
  }

  /*
   * YYYY-MM-DD
   */
  const isoMatch = cleaned.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/,
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);

    const date = new Date(
      year,
      month,
      day,
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  /*
   * DD-MM-YYYY / DD/MM/YYYY
   *
   * Only use this when the first number is
   * greater than 12, because otherwise the
   * value can also be MM-DD-YYYY.
   */
  const dmyMatch = cleaned.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/,
  );

  if (dmyMatch) {
    const first = Number(dmyMatch[1]);
    const second = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);

    if (first > 12) {
      const date = new Date(
        year,
        second - 1,
        first,
      );

      if (
        date.getFullYear() === year &&
        date.getMonth() === second - 1 &&
        date.getDate() === first
      ) {
        return date;
      }
    }

    /*
     * If first number can be a month,
     * also support MM-DD-YYYY.
     */
    if (first <= 12) {
      const date = new Date(
        year,
        first - 1,
        second,
      );

      if (
        date.getFullYear() === year &&
        date.getMonth() === first - 1 &&
        date.getDate() === second
      ) {
        return date;
      }
    }
  }

  /*
   * DD Mon YYYY
   *
   * Example:
   * 6 Oct 2026
   */
  const textMatch = cleaned.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
  );

  if (textMatch) {
    const day = Number(textMatch[1]);
    const monthName = textMatch[2];
    const year = Number(textMatch[3]);

    const date = new Date(
      `${monthName} ${day}, ${year}`,
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /*
   * Mon DD, YYYY
   *
   * Example:
   * Oct 6, 2026
   */
  const monthFirstMatch = cleaned.match(
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/,
  );

  if (monthFirstMatch) {
    const monthName = monthFirstMatch[1];

    const day = Number(
      monthFirstMatch[2],
    );

    const year = Number(
      monthFirstMatch[3],
    );

    const date = new Date(
      `${monthName} ${day}, ${year}`,
    );

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /*
   * Final fallback.
   */
  const fallbackDate = new Date(cleaned);

  if (
    !Number.isNaN(
      fallbackDate.getTime(),
    )
  ) {
    return fallbackDate;
  }

  return null;
};

/* =========================================================
   DATE NORMALIZATION
========================================================= */

const startOfToday = (): Date => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
};

const getNextOccurrence = (
  dateValue: string,
): Date | null => {
  const sourceDate =
    parseDate(dateValue);

  if (!sourceDate) {
    return null;
  }

  const today = startOfToday();

  let occurrence = new Date(
    today.getFullYear(),
    sourceDate.getMonth(),
    sourceDate.getDate(),
  );

  /*
   * If this year's occurrence has already
   * passed, use next year.
   */
  if (
    occurrence.getTime() < today.getTime()
  ) {
    occurrence = new Date(
      today.getFullYear() + 1,
      sourceDate.getMonth(),
      sourceDate.getDate(),
    );
  }

  return occurrence;
};

const getUpcomingDays = (
  dateValue: string,
): number | null => {
  const occurrence =
    getNextOccurrence(dateValue);

  if (!occurrence) {
    return null;
  }

  const today = startOfToday();

  const difference =
    occurrence.getTime() -
    today.getTime();

  return Math.round(
    difference /
      (1000 * 60 * 60 * 24),
  );
};

const formatMonthDay = (
  dateValue: string,
): string => {
  const date =
    parseDate(dateValue);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    },
  );
};

/* =========================================================
   BIRTHDAY HELPERS
========================================================= */

const isBirthdayToday = (
  birthdayValue: string,
): boolean => {
  const birthday =
    parseDate(birthdayValue);

  if (!birthday) {
    return false;
  }

  const today = new Date();

  return (
    birthday.getMonth() ===
      today.getMonth() &&
    birthday.getDate() ===
      today.getDate()
  );
};

const getBirthdayDaysFromToday = (
  birthdayValue: string,
): number | null => {
  return getUpcomingDays(
    birthdayValue,
  );
};

/* =========================================================
   ANNIVERSARY HELPERS
========================================================= */

const isJoiningAnniversaryToday = (
  joiningValue: string,
): boolean => {
  const joiningDate =
    parseDate(joiningValue);

  if (!joiningDate) {
    return false;
  }

  const today = new Date();

  /*
   * Joining date itself should not count as
   * an anniversary. Employee must have completed
   * at least one year.
   */
  return (
    joiningDate.getMonth() ===
      today.getMonth() &&
    joiningDate.getDate() ===
      today.getDate() &&
    joiningDate.getFullYear() <
      today.getFullYear()
  );
};

const getCompletedYears = (
  joiningValue: string,
): number => {
  const joiningDate =
    parseDate(joiningValue);

  if (!joiningDate) {
    return 0;
  }

  const today = new Date();

  let years =
    today.getFullYear() -
    joiningDate.getFullYear();

  const anniversaryThisYear =
    new Date(
      today.getFullYear(),
      joiningDate.getMonth(),
      joiningDate.getDate(),
    );

  if (
    today <
    anniversaryThisYear
  ) {
    years -= 1;
  }

  return Math.max(years, 0);
};

/* =========================================================
   NESTED OBJECT SEARCH
========================================================= */

const findNestedValue = (
  value: unknown,
  keys: string[],
  depth = 0,
): unknown => {
  if (
    value === null ||
    value === undefined ||
    depth > 8
  ) {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found =
        findNestedValue(
          item,
          keys,
          depth + 1,
        );

      if (
        found !== undefined &&
        found !== null &&
        String(found).trim() !== ""
      ) {
        return found;
      }
    }

    return undefined;
  }

  if (!isObject(value)) {
    return undefined;
  }

  /*
   * First check exact property names.
   */
  for (const key of keys) {
    if (
      value[key] !== undefined &&
      value[key] !== null &&
      String(value[key]).trim() !== ""
    ) {
      return value[key];
    }
  }

  /*
   * Case-insensitive property check.
   */
  const objectKeys =
    Object.keys(value);

  for (const requestedKey of keys) {
    const matchingKey =
      objectKeys.find(
        (existingKey) =>
          existingKey.toLowerCase() ===
          requestedKey.toLowerCase(),
      );

    if (
      matchingKey &&
      value[matchingKey] !== undefined &&
      value[matchingKey] !== null &&
      String(
        value[matchingKey],
      ).trim() !== ""
    ) {
      return value[matchingKey];
    }
  }

  /*
   * Search nested objects.
   */
  for (const nestedValue of Object.values(
    value,
  )) {
    if (
      typeof nestedValue ===
        "object" &&
      nestedValue !== null
    ) {
      const found =
        findNestedValue(
          nestedValue,
          keys,
          depth + 1,
        );

      if (
        found !== undefined &&
        found !== null &&
        String(found).trim() !== ""
      ) {
        return found;
      }
    }
  }

  return undefined;
};

/* =========================================================
   EMPLOYEE HELPERS
========================================================= */

const getEmployeeId = (
  employee: Record<string, unknown>,
  index: number,
): string => {
  const id =
    findNestedValue(employee, [
      "emp_id",
      "empId",
      "employee_id",
      "employeeId",
      "id",
      "user_id",
      "userId",
    ]);

  return getDisplayValue(
    id,
    `employee-${index}`,
  );
};

const getEmployeeName = (
  employee: Record<string, unknown>,
): string => {
  const directName =
    getDisplayValue(
      employee.name ??
        employee.full_name ??
        employee.fullName ??
        employee.employee_name ??
        employee.employeeName ??
        employee.display_name ??
        employee.displayName ??
        employee.employee,
    );

  if (directName) {
    return directName;
  }

  const nestedName =
    findNestedValue(employee, [
      "name",
      "full_name",
      "fullName",
      "employee_name",
      "employeeName",
      "display_name",
      "displayName",
    ]);

  if (nestedName) {
    return getDisplayValue(
      nestedName,
    );
  }

  const firstName =
    getDisplayValue(
      employee.first_name ??
        employee.firstName,
    );

  const lastName =
    getDisplayValue(
      employee.last_name ??
        employee.lastName,
    );

  const fullName =
    `${firstName} ${lastName}`.trim();

  return (
    fullName || "Employee"
  );
};

const getEmployeeBirthday = (
  employee: Record<string, unknown>,
): string => {
  const birthday =
    findNestedValue(employee, [
      "date_of_birth",
      "dateOfBirth",
      "dob",
      "birth_date",
      "birthDate",
      "birthday",
      "birthDay",
      "dateofbirth",
      "DateOfBirth",
      "DateOfbirth",
    ]);

  return getDisplayValue(
    birthday,
  );
};

const getEmployeeJoiningDate = (
  employee: Record<string, unknown>,
): string => {
  const joiningDate =
    findNestedValue(employee, [
      "date_of_joining",
      "dateOfJoining",
      "joining_date",
      "joiningDate",
      "doj",
      "dateofjoining",
      "DateOfJoining",
      "DateOfjoining",
      "employment_start_date",
      "employmentStartDate",
      "start_date",
      "startDate",
    ]);

  return getDisplayValue(
    joiningDate,
  );
};

/* =========================================================
   EXTRACT EMPLOYEE RECORDS
========================================================= */

const extractEmployeeRecords = (
  data: unknown,
): unknown[] => {
  /*
   * API directly returns array.
   */
  if (Array.isArray(data)) {
    return data;
  }

  if (!isObject(data)) {
    return [];
  }

  /*
   * Common response structures.
   */
  const directKeys = [
    "data",
    "employees",
    "employee",
    "results",
    "records",
    "items",
    "users",
    "content",
  ];

  for (const key of directKeys) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value;
    }

    if (isObject(value)) {
      const nested =
        extractEmployeeRecords(
          value,
        );

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  /*
   * Deep fallback.
   */
  for (const value of Object.values(
    data,
  )) {
    if (Array.isArray(value)) {
      const objects = value.filter(
        (item) =>
          isObject(item),
      );

      if (objects.length > 0) {
        return objects;
      }
    }

    if (isObject(value)) {
      const nested =
        extractEmployeeRecords(
          value,
        );

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

/* =========================================================
   POLICY HELPERS
========================================================= */

const getPolicyTitle = (
  policy: PolicyRecord,
): string => {
  return getDisplayValue(
    policy.title ??
      policy.policy_name ??
      policy.policyName ??
      policy.name,
    "Policy Update",
  );
};

const getPolicyDescription = (
  policy: PolicyRecord,
): string => {
  return getDisplayValue(
    policy.description ??
      policy.details ??
      policy.content,
    "Please review the latest company policy.",
  );
};

const getPolicyDate = (
  policy: PolicyRecord,
): string => {
  return getDisplayValue(
    policy.effective_date ??
      policy.effectiveDate ??
      policy.published_date ??
      policy.publishedDate ??
      policy.created_at ??
      policy.createdAt ??
      policy.date,
  );
};

const getPolicyPriority = (
  policy: PolicyRecord,
): "high" | "medium" | "low" => {
  const priority =
    getDisplayValue(
      policy.priority ??
        policy.importance ??
        policy.category,
    ).toLowerCase();

  if (
    priority === "high" ||
    priority === "urgent" ||
    priority === "critical"
  ) {
    return "high";
  }

  if (
    priority === "medium" ||
    priority === "important"
  ) {
    return "medium";
  }

  return "low";
};

const formatPolicyDate = (
  value: string,
): string => {
  if (!value) {
    return "";
  }

  const date =
    parseDate(value);

  if (!date) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard =
  (): JSX.Element => {
    const { profile } =
      useProfile();

    const [
      currentTime,
      setCurrentTime,
    ] = useState(
      new Date(),
    );

    const [
      policies,
      setPolicies,
    ] = useState<
      PolicyRecord[]
    >([]);

    const [
      policyLoading,
      setPolicyLoading,
    ] = useState(false);

    const [
      employees,
      setEmployees,
    ] = useState<
      EmployeeBirthdayRecord[]
    >([]);

    const [
      employeeLoading,
      setEmployeeLoading,
    ] = useState(false);

    const [
      timelineEvents,
      setTimelineEvents,
    ] = useState<
      EmployeeTimelineEvent[]
    >([]);

    const [
      timelineLoading,
      setTimelineLoading,
    ] = useState(false);

    /* =====================================================
       CLOCK
    ===================================================== */

    useEffect(() => {
      const timer =
        window.setInterval(
          () => {
            setCurrentTime(
              new Date(),
            );
          },
          60000,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    }, []);

    /* =====================================================
       EMPLOYEE NAME
    ===================================================== */

    const employeeName =
      profile?.name ||
      "Employee";

    /* =====================================================
       GREETING
    ===================================================== */

    const greeting =
      useMemo(() => {
        const hour =
          currentTime.getHours();

        if (hour < 12) {
          return "Good Morning";
        }

        if (hour < 17) {
          return "Good Afternoon";
        }

        if (hour < 21) {
          return "Good Evening";
        }

        return "Good Night";
      }, [currentTime]);

    /* =====================================================
       LOAD EMPLOYEE + PERSONAL DETAILS
    ===================================================== */

    const loadEmployees =
      useCallback(
        async () => {
          setEmployeeLoading(true);

          try {
            const apiBaseUrl =
              import.meta.env
                .VITE_API_BASE_URL as
                | string
                | undefined;

            if (!apiBaseUrl) {
              throw new Error(
                "VITE_API_BASE_URL is not configured.",
              );
            }

            const cleanBaseUrl =
              apiBaseUrl.replace(
                /\/+$/,
                "",
              );

            const headers =
              getAuthHeaders();

            const requestOptions:
              RequestInit = {
                method: "GET",
                headers,
                credentials: "include",
              };

            /*
             * Birthday:
             *   /api/v1/personal-details/
             *
             * Employee name + joining date:
             *   /api/v1/employees
             *
             * Both responses are matched using emp_id /
             * employee id.
             */

            const [
              personalDetailsResponse,
              employeesResponse,
            ] = await Promise.all([
              fetch(
                `${cleanBaseUrl}/api/v1/personal-details/`,
                requestOptions,
              ),

              fetch(
                `${cleanBaseUrl}/api/v1/employees`,
                requestOptions,
              ),
            ]);

            /*
             * Personal details is required for birthdays.
             */
            if (!personalDetailsResponse.ok) {
              throw new Error(
                `Personal details API failed with status ${personalDetailsResponse.status}`,
              );
            }

            const personalDetailsData =
              await personalDetailsResponse.json();

            /*
             * Employees API is needed for names and
             * work anniversaries. We don't throw here,
             * because birthdays can still be displayed
             * when this API is unavailable.
             */
            let employeesData: unknown = [];

            if (employeesResponse.ok) {
              employeesData =
                await employeesResponse.json();
            } else {
              console.warn(
                `Employees API failed with status ${employeesResponse.status}. Birthday data will still be loaded.`,
              );
            }

            console.log(
              "PERSONAL DETAILS API RESPONSE:",
              personalDetailsData,
            );

            console.log(
              "EMPLOYEES API RESPONSE:",
              employeesData,
            );

            const personalRecords =
              extractEmployeeRecords(
                personalDetailsData,
              );

            const employeeRecords =
              extractEmployeeRecords(
                employeesData,
              );

            console.log(
              "EXTRACTED PERSONAL DETAILS:",
              personalRecords,
            );

            console.log(
              "EXTRACTED EMPLOYEES:",
              employeeRecords,
            );

            /*
             * Create a lookup table from the employees
             * API so that personal-details.emp_id can
             * be matched with employee.id / emp_id.
             */
            const employeeMap =
              new Map<
                string,
                Record<string, unknown>
              >();

            employeeRecords
              .filter(
                (
                  item,
                ): item is Record<
                  string,
                  unknown
                > =>
                  isObject(item),
              )
              .forEach(
                (
                  employee,
                  index,
                ) => {
                  const employeeId =
                    getEmployeeId(
                      employee,
                      index,
                    );

                  if (
                    employeeId &&
                    !employeeId.startsWith(
                      "employee-",
                    )
                  ) {
                    employeeMap.set(
                      employeeId,
                      employee,
                    );
                  }
                },
              );

            /*
             * Merge personal-details with employees.
             *
             * IMPORTANT:
             * personal-details contains:
             *   emp_id
             *   date_of_birth
             *
             * employees contains:
             *   name / first_name / last_name
             *   date_of_joining / joining_date / doj
             */
            const mergedRecords =
              personalRecords
                .filter(
                  (
                    item,
                  ): item is Record<
                    string,
                    unknown
                  > =>
                    isObject(item),
                )
                .map(
                  (
                    personal,
                    index,
                  ) => {
                    const personalId =
                      getEmployeeId(
                        personal,
                        index,
                      );

                    const employee =
                      employeeMap.get(
                        personalId,
                      );

                    const dateOfBirth =
                      getEmployeeBirthday(
                        personal,
                      );

                    const name =
                      employee
                        ? getEmployeeName(
                            employee,
                          )
                        : `Employee ${personalId || index + 1}`;

                    const dateOfJoining =
                      employee
                        ? getEmployeeJoiningDate(
                            employee,
                          )
                        : "";

                    const result: EmployeeBirthdayRecord =
                      {
                        id:
                          personalId ||
                          `employee-${index}`,
                        name,
                        dateOfBirth,
                        dateOfJoining,
                      };

                    console.log(
                      "MERGED EMPLOYEE HIGHLIGHT RECORD:",
                      result,
                    );

                    return result;
                  },
                );

            console.log(
              "FINAL EMPLOYEE HIGHLIGHT RECORDS:",
              mergedRecords,
            );

            setEmployees(
              mergedRecords,
            );
          } catch (error) {
            console.error(
              "Employee highlights loading failed:",
              error,
            );

            setEmployees([]);
          } finally {
            setEmployeeLoading(
              false,
            );
          }
        },
        [],
      );

    useEffect(() => {
      void loadEmployees();
    }, [loadEmployees]);

    /* =====================================================
       HIGHLIGHTS
    ===================================================== */

    const highlights =
      useMemo<
        HighlightItem[]
      >(() => {
        const result: HighlightItem[] =
          [];

        /*
         * =================================================
         * TODAY'S BIRTHDAYS
         * =================================================
         */

        const todayBirthdays =
          employees.filter(
            (employee) =>
              Boolean(
                employee.dateOfBirth,
              ) &&
              isBirthdayToday(
                employee.dateOfBirth,
              ),
          );

        /*
         * Remove duplicate employee IDs.
         */
        const uniqueTodayBirthdays =
          Array.from(
            new Map(
              todayBirthdays.map(
                (employee) => [
                  employee.id,
                  employee,
                ],
              ),
            ).values(),
          );

        if (
          uniqueTodayBirthdays.length >
          0
        ) {
          const names =
            uniqueTodayBirthdays.map(
              (employee) =>
                employee.name,
            );

          let subtitle = "";

          if (
            names.length === 1
          ) {
            subtitle =
              `${names[0]}'s birthday is today`;
          } else if (
            names.length === 2
          ) {
            subtitle =
              `${names[0]} and ${names[1]} have birthdays today`;
          } else {
            subtitle =
              `${names.slice(0, -1).join(", ")} and ${
                names[names.length - 1]
              } have birthdays today`;
          }

          result.push({
            id: "employee-birthdays-today",

            title:
              names.length === 1
                ? "Happy Birthday!"
                : "Today's Birthdays",

            subtitle,

            status: "success",

            icon: (
              <Cake size={20} />
            ),

            color: "#E91E63",
          });
        }

        /*
         * =================================================
         * UPCOMING BIRTHDAYS - NEXT 90 DAYS
         * =================================================
         */

        const upcomingBirthdays =
          employees
            .map(
              (employee) => ({
                employee,
                days:
                  getBirthdayDaysFromToday(
                    employee.dateOfBirth,
                  ),
              }),
            )
            .filter(
              ({
                employee,
                days,
              }) =>
                Boolean(
                  employee.dateOfBirth,
                ) &&
                days !== null &&
                days > 0 &&
                days <=
                  UPCOMING_DAYS,
            )
            .sort(
              (a, b) =>
                (a.days ?? 9999) -
                (b.days ?? 9999),
            );

        if (
          upcomingBirthdays.length >
          0
        ) {
          const names =
            upcomingBirthdays
              .slice(0, 5)
              .map(
                ({
                  employee,
                  days,
                }) => {
                  const date =
                    formatMonthDay(
                      employee.dateOfBirth,
                    );

                  if (
                    days === 1
                  ) {
                    return `${employee.name} (${date}, tomorrow)`;
                  }

                  return `${employee.name} (${date})`;
                },
              );

          let subtitle =
            names.join(", ");

          if (
            upcomingBirthdays.length >
            5
          ) {
            subtitle += ` +${
              upcomingBirthdays.length -
              5
            } more`;
          }

          result.push({
            id: "upcoming-birthdays",

            title:
              "Upcoming Birthdays",

            subtitle,

            status: "info",

            icon: (
              <Cake size={20} />
            ),

            color: "#9C27B0",
          });
        }

        /*
         * =================================================
         * TODAY'S WORK ANNIVERSARIES
         * =================================================
         */

        const todayAnniversaries =
          employees.filter(
            (employee) =>
              Boolean(
                employee.dateOfJoining,
              ) &&
              isJoiningAnniversaryToday(
                employee.dateOfJoining,
              ),
          );

        const uniqueTodayAnniversaries =
          Array.from(
            new Map(
              todayAnniversaries.map(
                (employee) => [
                  employee.id,
                  employee,
                ],
              ),
            ).values(),
          );

        if (
          uniqueTodayAnniversaries.length >
          0
        ) {
          const anniversaryNames =
            uniqueTodayAnniversaries.map(
              (employee) => {
                const years =
                  getCompletedYears(
                    employee.dateOfJoining,
                  );

                return `${employee.name} (${years} ${
                  years === 1
                    ? "year"
                    : "years"
                })`;
              },
            );

          result.push({
            id: "today-work-anniversaries",

            title:
              uniqueTodayAnniversaries.length ===
              1
                ? "Work Anniversary"
                : "Today's Work Anniversaries",

            subtitle:
              anniversaryNames.join(
                ", ",
              ),

            status: "warning",

            icon: (
              <Trophy size={20} />
            ),

            color: "#F57C00",
          });
        }

        /*
         * =================================================
         * UPCOMING WORK ANNIVERSARIES - NEXT 90 DAYS
         * =================================================
         */

        const upcomingAnniversaries =
          employees
            .map(
              (employee) => ({
                employee,
                days:
                  getUpcomingDays(
                    employee.dateOfJoining,
                  ),
              }),
            )
            .filter(
              ({
                employee,
                days,
              }) => {
                if (
                  !employee.dateOfJoining
                ) {
                  return false;
                }

                const joiningDate =
                  parseDate(
                    employee.dateOfJoining,
                  );

                if (!joiningDate) {
                  return false;
                }

                /*
                 * The employee must already have
                 * completed at least one year by
                 * the upcoming anniversary.
                 */
                const today =
                  startOfToday();

                let anniversaryYear =
                  today.getFullYear();

                const anniversaryThisYear =
                  new Date(
                    anniversaryYear,
                    joiningDate.getMonth(),
                    joiningDate.getDate(),
                  );

                if (
                  anniversaryThisYear.getTime() <
                  today.getTime()
                ) {
                  anniversaryYear += 1;
                }

                const upcomingYears =
                  anniversaryYear -
                  joiningDate.getFullYear();

                if (
                  upcomingYears < 1
                ) {
                  return false;
                }

                return (
                  days !== null &&
                  days > 0 &&
                  days <=
                    UPCOMING_DAYS
                );
              },
            )
            .sort(
              (a, b) =>
                (a.days ?? 9999) -
                (b.days ?? 9999),
            );

        if (
          upcomingAnniversaries.length >
          0
        ) {
          const anniversaryNames =
            upcomingAnniversaries
              .slice(0, 5)
              .map(
                ({
                  employee,
                }) => {
                  const years =
                    getCompletedYears(
                      employee.dateOfJoining,
                    ) + 1;

                  return `${employee.name} (${years} ${
                    years === 1
                      ? "year"
                      : "years"
                  })`;
                },
              );

          let subtitle =
            anniversaryNames.join(
              ", ",
            );

          if (
            upcomingAnniversaries.length >
            5
          ) {
            subtitle += ` +${
              upcomingAnniversaries.length -
              5
            } more`;
          }

          result.push({
            id: "upcoming-work-anniversaries",

            title:
              "Upcoming Work Anniversaries",

            subtitle,

            status: "info",

            icon: (
              <Trophy size={20} />
            ),

            color: "#FF9800",
          });
        }

        return result;
      }, [employees]);

    /* =====================================================
       LOAD POLICIES
    ===================================================== */

    const loadPolicies =
      useCallback(
        async () => {
          setPolicyLoading(
            true,
          );

          try {
            const apiBaseUrl =
              import.meta.env
                .VITE_API_BASE_URL as
                | string
                | undefined;

            if (!apiBaseUrl) {
              throw new Error(
                "API base URL is not configured.",
              );
            }

            const cleanBaseUrl =
              apiBaseUrl.replace(
                /\/+$/,
                "",
              );

            const requestOptions:
              RequestInit = {
                method: "GET",
                headers:
                  getAuthHeaders(),
                credentials:
                  "include",
              };

            let response =
              await fetch(
                `${cleanBaseUrl}/api/v1/policies`,
                requestOptions,
              );

            if (!response.ok) {
              response =
                await fetch(
                  `${cleanBaseUrl}/api/v1/policy`,
                  requestOptions,
                );
            }

            if (!response.ok) {
              throw new Error(
                `Policy API failed with status ${response.status}`,
              );
            }

            const data =
              await response.json();

            let records: unknown[] =
              [];

            if (
              Array.isArray(data)
            ) {
              records = data;
            } else if (
              Array.isArray(
                data?.data,
              )
            ) {
              records =
                data.data;
            } else if (
              Array.isArray(
                data?.policies,
              )
            ) {
              records =
                data.policies;
            } else if (
              Array.isArray(
                data?.results,
              )
            ) {
              records =
                data.results;
            }

            setPolicies(
              records.filter(
                (item) =>
                  isObject(item),
              ) as PolicyRecord[],
            );
          } catch (error) {
            console.error(
              "Policy loading failed:",
              error,
            );

            setPolicies([]);
          } finally {
            setPolicyLoading(
              false,
            );
          }
        },
        [],
      );

    useEffect(() => {
      void loadPolicies();
    }, [loadPolicies]);

    /* =====================================================
       ANNOUNCEMENTS
    ===================================================== */

    const announcements =
      useMemo<
        AnnouncementItem[]
      >(() => {
        return policies
          .map(
            (
              policy,
              index,
            ) => ({
              id: String(
                policy.id ??
                  `policy-${index}`,
              ),

              title:
                getPolicyTitle(
                  policy,
                ),

              description:
                getPolicyDescription(
                  policy,
                ),

              date:
                formatPolicyDate(
                  getPolicyDate(
                    policy,
                  ),
                ),

              priority:
                getPolicyPriority(
                  policy,
                ),
            }),
          )
          .slice(0, 10);
      }, [policies]);

    /* =====================================================
       TIMELINE MAPPER
    ===================================================== */

    const mapTimelineActivity =
      useCallback(
        (
          activity: AttendanceTimelineActivity,
        ): EmployeeTimelineEvent => {
          const parsedTime =
            new Date(
              activity.log,
            ).getTime();

          const timestamp =
            Number.isNaN(
              parsedTime,
            )
              ? Date.now()
              : parsedTime;

          const time =
            new Date(
              timestamp,
            ).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              },
            );

          if (
            activity.activity ===
            "PI"
          ) {
            return {
              id: String(
                activity.id,
              ),

              type: "PUNCH_IN",

              title: "Punch In",

              description:
                activity.address
                  ? `Work started at ${activity.address}`
                  : "Work started",

              time,

              icon: (
                <LogIn size={16} />
              ),

              color: "#2E7D32",

              timestamp,
            };
          }

          if (
            activity.activity ===
            "BI"
          ) {
            return {
              id: String(
                activity.id,
              ),

              type: "BREAK_IN",

              title: "Break In",

              description:
                "Lunch break started",

              time,

              icon: (
                <Coffee size={16} />
              ),

              color: "#F57C00",

              timestamp,
            };
          }

          if (
            activity.activity ===
            "BO"
          ) {
            return {
              id: String(
                activity.id,
              ),

              type: "BREAK_OUT",

              title: "Break Out",

              description:
                "Lunch break ended",

              time,

              icon: (
                <Coffee size={16} />
              ),

              color: "#1976D2",

              timestamp,
            };
          }

          if (
            activity.activity ===
            "PO"
          ) {
            return {
              id: String(
                activity.id,
              ),

              type: "PUNCH_OUT",

              title: "Punch Out",

              description:
                activity.address
                  ? `Work ended at ${activity.address}`
                  : "Work ended",

              time,

              icon: (
                <LogOut size={16} />
              ),

              color: "#D32F2F",

              timestamp,
            };
          }

          return {
            id: String(
              activity.id,
            ),

            type: "PUNCH_IN",

            title:
              "Attendance Activity",

            description: "",

            time,

            icon: (
              <Clock size={16} />
            ),

            color: "#1976D2",

            timestamp,
          };
        },
        [],
      );

    /* =====================================================
       LOAD TIMELINE
    ===================================================== */

    const loadTimeline =
      useCallback(
        async () => {
          try {
            setTimelineLoading(
              true,
            );

            const activities =
              await attendanceService.getTodayTimeline();

            const events =
              activities
                .map(
                  mapTimelineActivity,
                )
                .sort(
                  (a, b) =>
                    a.timestamp -
                    b.timestamp,
                );

            setTimelineEvents(
              events,
            );
          } catch (error) {
            console.error(
              "Timeline loading failed:",
              error,
            );

            setTimelineEvents([]);
          } finally {
            setTimelineLoading(
              false,
            );
          }
        },
        [mapTimelineActivity],
      );

    useEffect(() => {
      void loadTimeline();
    }, [loadTimeline]);

    /* =====================================================
       PUNCH ACTION
    ===================================================== */

    const handlePunchActionLogged =
      useCallback(
        (
          title: string,
          description: string,
        ) => {
          const now =
            new Date();

          const timestamp =
            now.getTime();

          let type:
            | EmployeeTimelineEvent["type"]
            | null = null;

          let icon:
            | React.ReactNode;

          let color =
            "#1976D2";

          if (
            title ===
            "Punch In"
          ) {
            type =
              "PUNCH_IN";

            icon = (
              <LogIn size={16} />
            );

            color =
              "#2E7D32";
          } else if (
            title ===
            "Break In"
          ) {
            type =
              "BREAK_IN";

            icon = (
              <Coffee size={16} />
            );

            color =
              "#F57C00";
          } else if (
            title ===
            "Break Out"
          ) {
            type =
              "BREAK_OUT";

            icon = (
              <Coffee size={16} />
            );

            color =
              "#1976D2";
          } else if (
            title ===
            "Punch Out"
          ) {
            type =
              "PUNCH_OUT";

            icon = (
              <LogOut size={16} />
            );

            color =
              "#D32F2F";
          } else {
            return;
          }

          const event:
            EmployeeTimelineEvent =
            {
              id: `${type}-${timestamp}`,

              type,

              title,

              description,

              time:
                now.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  },
                ),

              icon,

              color,

              timestamp,
            };

          setTimelineEvents(
            (previous) =>
              [
                ...previous,
                event,
              ].sort(
                (a, b) =>
                  a.timestamp -
                  b.timestamp,
              ),
          );
        },
        [],
      );

    /* =====================================================
       RENDER
    ===================================================== */

    return (
      <main className="dashboard">
        <div className="dashboard-content">

          {/* =================================================
              WELCOME
          ================================================= */}

          <WelcomeBanner
            greeting={greeting}
            employeeName={
              employeeName
            }
          />

          {/* =================================================
              PUNCH CARD
          ================================================= */}

          <section
            className="dashboard-punch-section"
            aria-label="Time Punch In"
          >
            <PunchCard
              onActionLogged={
                handlePunchActionLogged
              }
            />
          </section>

          {/* =================================================
              DASHBOARD CARDS
          ================================================= */}

          <section
            className="dashboard-bottom-grid"
            aria-label="Dashboard Widgets"
          >

            {/* ===============================================
                TODAY'S HIGHLIGHTS
            =============================================== */}

            <div className="dashboard-col-highlights">
              <HighlightsCard
                title="Today's Highlights"
                items={
                  highlights
                }
              />

              {employeeLoading && (
                <div
                  style={{
                    fontSize:
                      "12px",
                    marginTop:
                      "6px",
                    opacity: 0.6,
                  }}
                >
                  Loading birthdays and work anniversaries...
                </div>
              )}

              {!employeeLoading &&
                highlights.length ===
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "6px",
                      fontSize:
                        "12px",
                      marginTop:
                        "6px",
                      opacity: 0.7,
                    }}
                  >
                    <AlertCircle
                      size={14}
                    />

                    No birthdays or work anniversaries in the selected period.
                  </div>
                )}
            </div>

            {/* ===============================================
                DAILY TIMELINE
            =============================================== */}

            <div className="dashboard-col-timeline">
              <TimelineCard
                title="Daily Activity Timeline"
                activities={
                  timelineEvents
                }
              />

              {timelineLoading && (
                <div
                  style={{
                    fontSize:
                      "12px",
                    marginTop:
                      "6px",
                    opacity: 0.6,
                  }}
                >
                  Updating timeline...
                </div>
              )}
            </div>

            {/* ===============================================
                ANNOUNCEMENTS
            =============================================== */}

            <div className="dashboard-col-announcements">
              <AnnouncementCard
                title="Recent Announcements"
                announcements={
                  announcements
                }
              />

              {policyLoading && (
                <div
                  style={{
                    fontSize:
                      "12px",
                    marginTop:
                      "6px",
                    opacity: 0.6,
                  }}
                >
                  Loading policies...
                </div>
              )}

              {!policyLoading &&
                policies.length ===
                  0 && (
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "6px",
                      fontSize:
                        "12px",
                      marginTop:
                        "6px",
                      opacity: 0.7,
                    }}
                  >
                    <AlertCircle
                      size={14}
                    />

                    No recent announcements.
                  </div>
                )}
            </div>
          </section>
        </div>
      </main>
    );
  };

export default Dashboard;