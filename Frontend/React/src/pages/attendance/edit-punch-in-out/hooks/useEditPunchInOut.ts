import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import type {
  EmployeeOption,
  MonthOption,
  AttendanceRecord,
} from "../types/editPunchInOut.types";

import { editPunchInOutService } from "../services/editPunchInOut.service";

import { validateEditPunchInOut } from "../validations/editPunchInOut.schema";

import { MONTHS } from "../constants/editPunchInOut.constants";

import {
  filterEmployees,
  filterMonths,
} from "../utils/editPunchInOut.utils";

export const useEditPunchInOut = () => {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeOption | null>(null);

  const [selectedMonth, setSelectedMonth] =
    useState<MonthOption | null>(null);

  const [employeeSearchText, setEmployeeSearchText] =
    useState<string>("");

  const [monthSearchText, setMonthSearchText] =
    useState<string>("");

  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] =
    useState<boolean>(false);

  const [isMonthDropdownOpen, setIsMonthDropdownOpen] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] =
    useState<boolean>(false);

  const [searchPerformed, setSearchPerformed] =
    useState<boolean>(false);

  const [attendanceData, setAttendanceData] =
    useState<AttendanceRecord[] | null>(null);

  const [employees, setEmployees] =
    useState<EmployeeOption[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [validationErrors, setValidationErrors] =
    useState<Record<string, string>>({});

  // --------------------------------------------------
  // Refs
  // --------------------------------------------------

  const employeeRef = useRef<HTMLDivElement>(null);

  const monthRef = useRef<HTMLDivElement>(null);

  // --------------------------------------------------
  // Filtered dropdown data
  // --------------------------------------------------

  const filteredEmployees = filterEmployees(
    employees,
    employeeSearchText
  );

  const filteredMonths = filterMonths(
    MONTHS,
    monthSearchText
  );

  // --------------------------------------------------
  // Load employees from API
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const loadEmployees = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const employeeData =
          await editPunchInOutService.getEmployees();

        if (isMounted) {
          setEmployees(employeeData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Failed to load employees";

          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------
  // Click outside handling
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (
        employeeRef.current &&
        !employeeRef.current.contains(target)
      ) {
        setIsEmployeeDropdownOpen(false);
      }

      if (
        monthRef.current &&
        !monthRef.current.contains(target)
      ) {
        setIsMonthDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // Employee handlers
  // --------------------------------------------------

  const handleEmployeeSelect = useCallback(
    (employee: EmployeeOption): void => {
      setSelectedEmployee(employee);
      setEmployeeSearchText("");
      setIsEmployeeDropdownOpen(false);

      setAttendanceData(null);
      setSearchPerformed(false);
      setError(null);

      setValidationErrors((previous) => ({
        ...previous,
        employee: "",
      }));
    },
    []
  );

  const handleEmployeeSearch = useCallback(
    (text: string): void => {
      setEmployeeSearchText(text);
      setIsEmployeeDropdownOpen(true);
    },
    []
  );

  const handleEmployeeClear = useCallback((): void => {
    setSelectedEmployee(null);
    setEmployeeSearchText("");
    setIsEmployeeDropdownOpen(false);

    setAttendanceData(null);
    setSearchPerformed(false);
    setError(null);
  }, []);

  const handleEmployeeToggle = useCallback((): void => {
    setIsEmployeeDropdownOpen((previous) => !previous);

    if (!isEmployeeDropdownOpen) {
      setEmployeeSearchText("");
    }
  }, [isEmployeeDropdownOpen]);

  // --------------------------------------------------
  // Month handlers
  // --------------------------------------------------

  const handleMonthSelect = useCallback(
    (month: MonthOption): void => {
      setSelectedMonth(month);
      setMonthSearchText("");
      setIsMonthDropdownOpen(false);

      setAttendanceData(null);
      setSearchPerformed(false);
      setError(null);

      setValidationErrors((previous) => ({
        ...previous,
        month: "",
      }));
    },
    []
  );

  const handleMonthSearch = useCallback(
    (text: string): void => {
      setMonthSearchText(text);
      setIsMonthDropdownOpen(true);
    },
    []
  );

  const handleMonthClear = useCallback((): void => {
    setSelectedMonth(null);
    setMonthSearchText("");
    setIsMonthDropdownOpen(false);

    setAttendanceData(null);
    setSearchPerformed(false);
    setError(null);
  }, []);

  const handleMonthToggle = useCallback((): void => {
    setIsMonthDropdownOpen((previous) => !previous);

    if (!isMonthDropdownOpen) {
      setMonthSearchText("");
    }
  }, [isMonthDropdownOpen]);

  // --------------------------------------------------
  // Search attendance
  // --------------------------------------------------

  const handleSearch = useCallback(async (): Promise<void> => {
    const validation = validateEditPunchInOut(
      selectedEmployee?.id ?? null,
      selectedMonth?.value ?? null
    );

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (!selectedEmployee || !selectedMonth) {
      return;
    }

    setValidationErrors({});
    setError(null);
    setAttendanceData(null);
    setSearchPerformed(false);
    setIsLoading(true);

    try {
      const data =
        await editPunchInOutService.searchAttendance(
          selectedEmployee.id,
          selectedMonth.value
        );

      setAttendanceData(data);
      setSearchPerformed(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch attendance data";

      setError(errorMessage);
      setAttendanceData(null);
      setSearchPerformed(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedEmployee, selectedMonth]);

  // --------------------------------------------------
  // Return hook data
  // --------------------------------------------------

  return {
    // State
    selectedEmployee,
    selectedMonth,
    employeeSearchText,
    monthSearchText,
    isEmployeeDropdownOpen,
    isMonthDropdownOpen,
    isLoading,
    searchPerformed,
    attendanceData,
    setAttendanceData,
    error,
    validationErrors,

    // Dropdown data
    filteredEmployees,
    filteredMonths,

    // Refs
    employeeRef,
    monthRef,

    // Employee handlers
    handleEmployeeSelect,
    handleEmployeeSearch,
    handleEmployeeClear,
    handleEmployeeToggle,

    // Month handlers
    handleMonthSelect,
    handleMonthSearch,
    handleMonthClear,
    handleMonthToggle,

    // Search handler
    handleSearch,
  };
};