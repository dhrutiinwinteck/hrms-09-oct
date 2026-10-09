// src/pages/attendance/attendance-history/hooks/useAttendanceHistory.ts

import { useState, useEffect, useCallback } from "react";

import { attendanceHistoryService } from "../services/attendanceHistory.service";

import type {
  EmployeeAttendance,
  AttendanceStatistics,
  AttendanceFilters,
  PaginationInfo,
  AttendanceInsights,
  MonthOption,
} from "../types/attendanceHistory.types";

import {
  DEFAULT_MONTH,
  PAGINATION_DEFAULTS,
} from "../constants/attendanceHistory.constants";

interface UseAttendanceHistoryReturn {
  employees: EmployeeAttendance[];
  statistics: AttendanceStatistics | null;
  filters: AttendanceFilters | null;
  pagination: PaginationInfo | null;
  insights: AttendanceInsights | null;
  loading: boolean;
  selectedMonth: MonthOption;
  currentPage: number;

  setCurrentPage: (page: number) => void;
  setSelectedMonth: (month: MonthOption) => void;
  setSearchTerm: (term: string) => void;
  setDepartmentFilter: (department: string) => void;

  calculateLateMarks: () => Promise<void>;
  exportData: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useAttendanceHistory =
  (): UseAttendanceHistoryReturn => {
    const [employees, setEmployees] = useState<EmployeeAttendance[]>(
      [],
    );

    const [statistics, setStatistics] =
      useState<AttendanceStatistics | null>(null);

    const [filters, setFilters] =
      useState<AttendanceFilters | null>(null);

    const [pagination, setPagination] =
      useState<PaginationInfo | null>(null);

    const [insights, setInsights] =
      useState<AttendanceInsights | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    const [selectedMonth, setSelectedMonthState] =
      useState<MonthOption>(DEFAULT_MONTH);

    const [currentPage, setCurrentPageState] = useState<number>(
      PAGINATION_DEFAULTS.currentPage,
    );

    const [searchTerm, setSearchTermState] =
      useState<string>("");

    const [departmentFilter, setDepartmentFilterState] =
      useState<string>("");

    /**
     * Fetch attendance history and insights.
     */
    const fetchData = useCallback(async (): Promise<void> => {
      setLoading(true);

      try {
        const filtersData: AttendanceFilters = {
          month: selectedMonth.value,
          year: selectedMonth.year,
          searchTerm: searchTerm.trim() || undefined,
          department: departmentFilter || undefined,
        };

        const [historyData, insightsData] = await Promise.all([
          attendanceHistoryService.getAttendanceHistory(
            filtersData,
            currentPage,
            PAGINATION_DEFAULTS.pageSize,
          ),

          attendanceHistoryService.getInsights(),
        ]);

        setEmployees(historyData.employees);
        setStatistics(historyData.statistics);
        setPagination(historyData.pagination);
        setFilters(filtersData);
        setInsights(insightsData);
      } catch (error) {
        console.error(
          "Error fetching attendance history:",
          error,
        );

        setEmployees([]);
        setStatistics(null);
        setPagination(null);
        setInsights(null);
      } finally {
        setLoading(false);
      }
    }, [
      selectedMonth,
      currentPage,
      searchTerm,
      departmentFilter,
    ]);

    /**
     * Fetch data whenever filters or page changes.
     */
    useEffect(() => {
      void fetchData();
    }, [fetchData]);

    /**
     * Change page.
     */
    const setCurrentPage = useCallback((page: number): void => {
      const validPage = Math.max(1, Math.floor(page));

      setCurrentPageState(validPage);
    }, []);

    /**
     * Change selected month and reset pagination.
     */
    const setSelectedMonth = useCallback(
      (month: MonthOption): void => {
        setSelectedMonthState(month);
        setCurrentPageState(
          PAGINATION_DEFAULTS.currentPage,
        );
      },
      [],
    );

    /**
     * Change search term and reset pagination.
     */
    const setSearchTerm = useCallback((term: string): void => {
      setSearchTermState(term);
      setCurrentPageState(
        PAGINATION_DEFAULTS.currentPage,
      );
    }, []);

    /**
     * Change department filter and reset pagination.
     */
    const setDepartmentFilter = useCallback(
      (department: string): void => {
        setDepartmentFilterState(department);
        setCurrentPageState(
          PAGINATION_DEFAULTS.currentPage,
        );
      },
      [],
    );

    /**
     * Calculate late marks.
     */
    const calculateLateMarks = useCallback(async (): Promise<void> => {
      if (!filters) {
        return;
      }

      setLoading(true);

      try {
        const result =
          await attendanceHistoryService.calculateLateMarks(
            filters,
          );

        console.info(result.message);

        await fetchData();
      } catch (error) {
        console.error(
          "Error calculating late marks:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }, [filters, fetchData]);

    /**
     * Export attendance history as CSV.
     */
    const exportData = useCallback(async (): Promise<void> => {
      if (!filters) {
        return;
      }

      try {
        const blob =
          await attendanceHistoryService.exportAttendanceHistory(
            filters,
          );

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");

        anchor.href = url;
        anchor.download = `attendance_history_${filters.month}.csv`;

        document.body.appendChild(anchor);
        anchor.click();

        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(
          "Error exporting attendance history:",
          error,
        );
      }
    }, [filters]);

    /**
     * Manually refresh attendance history.
     */
    const refetch = useCallback(async (): Promise<void> => {
      await fetchData();
    }, [fetchData]);

    return {
      employees,
      statistics,
      filters,
      pagination,
      insights,
      loading,
      selectedMonth,
      currentPage,

      setCurrentPage,
      setSelectedMonth,
      setSearchTerm,
      setDepartmentFilter,

      calculateLateMarks,
      exportData,
      refetch,
    };
  };