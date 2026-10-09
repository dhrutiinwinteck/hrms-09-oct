import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import MonthlyAttendanceHeader from "./components/MonthlyAttendanceHeader/MonthlyAttendanceHeader";
import MonthlyAttendanceFilters from "./components/MonthlyAttendanceFilters/MonthlyAttendanceFilters";
import MonthlyAttendanceTable from "./components/MonthlyAttendanceTable/MonthlyAttendanceTable";

import {
  useMonthlyAttendance,
} from "./hooks/useMonthlyAttendance";

import {
  MONTH_OPTIONS,
  YEAR_OPTIONS,
  MONTH_NUMBER_MAP,
} from "./constants/monthlyAttendance.constants";

import "./MonthlyAttendancePage.css";

const MonthlyAttendancePage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] =
    useState<string>("September");

  const [selectedYear, setSelectedYear] =
    useState<string>("2026");

  const [employeeSearch, setEmployeeSearch] =
    useState<string>("");

  const [recordsPerPage, setRecordsPerPage] =
    useState<number>(10);

  const [isSearching, setIsSearching] =
    useState<boolean>(false);

  const {
    employees,
    isLoading,
    isDownloading,
    error,
    fetchSalarySheet,
    downloadSalarySheet,
  } = useMonthlyAttendance();

  const selectedMonthNumber =
    MONTH_NUMBER_MAP[selectedMonth];

  const selectedYearNumber =
    Number(selectedYear);

  const loadSalarySheet = useCallback(
    async (): Promise<void> => {
      setIsSearching(true);

      try {
        await fetchSalarySheet(
          selectedMonthNumber,
          selectedYearNumber,
        );
      } finally {
        setIsSearching(false);
      }
    },
    [
      fetchSalarySheet,
      selectedMonthNumber,
      selectedYearNumber,
    ],
  );

  useEffect(() => {
    void loadSalarySheet();
  }, [loadSalarySheet]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch =
      employeeSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.employeeName
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.uan
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.bankName
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.accountNo
          .toLowerCase()
          .includes(normalizedSearch) ||
        employee.ifsc
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [
    employeeSearch,
    employees,
  ]);

  const handleDownloadSalarySheet =
    useCallback(async (): Promise<void> => {
      await downloadSalarySheet(
        selectedMonthNumber,
        selectedYearNumber,
      );
    }, [
      downloadSalarySheet,
      selectedMonthNumber,
      selectedYearNumber,
    ]);

  const handleDownloadAttendance =
    useCallback((): void => {
      console.info(
        "Attendance API is not available yet.",
      );
    }, []);

  const handleDownloadSalaryBreakdown =
    useCallback((): void => {
      console.info(
        "Salary breakdown API is not available yet.",
      );
    }, []);

  return (
    <main className="monthly-attendance-page">
      <div className="monthly-attendance-page__breadcrumb">
        <span>Dashboard</span>

        <span className="monthly-attendance-page__breadcrumb-separator">
          &gt;
        </span>

        <span>Payroll</span>

        <span className="monthly-attendance-page__breadcrumb-separator">
          &gt;
        </span>

        <strong>Monthly Salary Sheet</strong>
      </div>

      <MonthlyAttendanceHeader />

      <section
        className="monthly-attendance-content-card"
        aria-label="Monthly salary sheet controls and records"
      >
        <MonthlyAttendanceFilters
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          employeeSearch={employeeSearch}
          recordsPerPage={recordsPerPage}
          monthOptions={MONTH_OPTIONS}
          yearOptions={YEAR_OPTIONS}
          isSearching={isSearching || isLoading}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onSearch={loadSalarySheet}
          onEmployeeSearchChange={setEmployeeSearch}
          onRecordsPerPageChange={setRecordsPerPage}
          onDownloadSalarySheet={
            handleDownloadSalarySheet
          }
          onDownloadAttendance={
            handleDownloadAttendance
          }
          onDownloadSalaryBreakdown={
            handleDownloadSalaryBreakdown
          }
        />

        {error && (
          <div
            className="monthly-attendance-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {isDownloading && (
          <div
            className="monthly-attendance-loading"
            role="status"
          >
            Preparing salary sheet download...
          </div>
        )}

        <MonthlyAttendanceTable
          employees={filteredEmployees}
          recordsPerPage={recordsPerPage}
        />
      </section>
    </main>
  );
};

export default MonthlyAttendancePage;