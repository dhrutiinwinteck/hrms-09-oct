/**
 * ======================================================
 * Attendance Module - Custom Hook
 * ======================================================
 * Enterprise-grade custom hook for managing attendance data.
 *
 * @module hooks/useAttendance
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AttendanceRecord,
  AttendanceSummary,
  AttendanceOverviewItem,
  AttendanceFilter,
  AttendanceApiResponse,
} from '../types/attendance.types';
import { attendanceService, isUsingMock } from '../services/attendance.service';
import { DEFAULT_ATTENDANCE_FILTERS } from '../constants/attendance.constants';

// -----------------------------------------------------------------------------
// Hook Return Type
// -----------------------------------------------------------------------------

export interface UseAttendanceReturn {
  loading: boolean;
  error: string | null;
  records: AttendanceRecord[];
  summary: AttendanceSummary | null;
  overview: AttendanceOverviewItem[];
  filters: AttendanceFilter;
  totalCount: number;
  isMock: boolean;
  setFilters: (newFilters: Partial<AttendanceFilter>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  exportAttendance: () => Promise<void>;
  updateFilter: <K extends keyof AttendanceFilter>(key: K, value: AttendanceFilter[K]) => void;
}

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

export const useAttendance = (initialFilters?: Partial<AttendanceFilter>): UseAttendanceReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<AttendanceApiResponse | null>(null);
  const [filters, setFiltersState] = useState<AttendanceFilter>({
    ...DEFAULT_ATTENDANCE_FILTERS,
    ...initialFilters,
  });
  const isFetchingRef = useRef<boolean>(false);

  const records = useMemo(() => apiData?.records || [], [apiData]);
  const summary = useMemo(() => apiData?.summary || null, [apiData]);
  const overview = useMemo(() => apiData?.overview || [], [apiData]);
  const totalCount = useMemo(() => apiData?.totalCount || records.length, [apiData, records]);

  const fetchAttendance = useCallback(async (filterParams?: AttendanceFilter) => {
    if (isFetchingRef.current) {
      console.warn('Attendance fetch already in progress');
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceService.getAttendance(filterParams);
      setApiData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch attendance data';
      setError(errorMessage);
      setApiData(null);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const setFilters = useCallback((newFilters: Partial<AttendanceFilter>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateFilter = useCallback(<K extends keyof AttendanceFilter>(
    key: K,
    value: AttendanceFilter[K]
  ) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    fetchAttendance(filters);
  }, [fetchAttendance, filters]);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_ATTENDANCE_FILTERS, ...initialFilters });
    fetchAttendance({ ...DEFAULT_ATTENDANCE_FILTERS, ...initialFilters });
  }, [fetchAttendance, initialFilters]);

  const exportAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await attendanceService.exportAttendance(filters);
      if (response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.fileName || 'attendance.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('No download URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export attendance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(async () => {
    await fetchAttendance(filters);
  }, [fetchAttendance, filters]);

  useEffect(() => {
    fetchAttendance(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading,
    error,
    records,
    summary,
    overview,
    filters,
    totalCount,
    isMock: isUsingMock,
    setFilters,
    applyFilters,
    resetFilters,
    refresh,
    exportAttendance,
    updateFilter,
  };
};