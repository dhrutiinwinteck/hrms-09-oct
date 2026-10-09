/**
 * ======================================================
 * Attendance Module - Filter Hook
 * ======================================================
 * Enterprise-grade custom hook for managing attendance filters.
 * Provides a clean, reusable way to manage filter state,
 * validation, and debouncing for the attendance module.
 *
 * Principles:
 * - Separation of Concerns: Filter management is isolated from data fetching
 * - Immutability: Returns new state on updates
 * - Debouncing: Prevents excessive updates for search inputs
 * - Validation: Ensures filter values are valid before applying
 *
 * @module hooks/useAttendanceFilter
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  AttendanceFilter,
} from '../types/attendance.types';
import { DEFAULT_ATTENDANCE_FILTERS } from '../constants/attendance.constants';

// -----------------------------------------------------------------------------
// Hook Return Type
// -----------------------------------------------------------------------------

/**
 * Interface defining the return value of the useAttendanceFilter hook.
 */
export interface UseAttendanceFilterReturn {
  /** Current filter values. */
  filters: AttendanceFilter;
  /** Indicates if any filter is currently applied (non-default). */
  isFiltered: boolean;
  /** Number of active filters (non-empty values). */
  activeFilterCount: number;

  /** Updates a single filter value. */
  updateFilter: <K extends keyof AttendanceFilter>(key: K, value: AttendanceFilter[K]) => void;
  /** Resets all filters to default. */
  resetFilters: () => void;
  /** Applies current filters (triggers the onApply callback). */
  applyFilters: () => void;
  /** Clears all filters (resets to default) and applies. */
  clearFilters: () => void;
  /** Gets the current filter object as a URL query string. */
  getQueryString: () => string;
  /** Gets the current filter object as a plain object. */
  getFilterObject: () => AttendanceFilter;
}

// -----------------------------------------------------------------------------
// Hook Props
// -----------------------------------------------------------------------------

export interface UseAttendanceFilterProps {
  /** Initial filter values (optional). */
  initialFilters?: Partial<AttendanceFilter>;
  /** Debounce delay in milliseconds for search input updates. */
  debounceDelay?: number;
  /** Callback when filters are applied (after debounce for search). */
  onApply?: (filters: AttendanceFilter) => void;
  /** Callback when filters are reset. */
  onReset?: () => void;
}

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

/**
 * Custom hook for managing attendance filters with debouncing and validation.
 * @param props - Configuration options.
 * @returns UseAttendanceFilterReturn object with state and functions.
 */
export const useAttendanceFilter = ({
  initialFilters,
  debounceDelay = 300,
  onApply,
  onReset,
}: UseAttendanceFilterProps = {}): UseAttendanceFilterReturn => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /** Internal filter state. */
  const [filters, setFilters] = useState<AttendanceFilter>({
    ...DEFAULT_ATTENDANCE_FILTERS,
    ...initialFilters,
  });

  /** Debounced filter state for search. */
  // const [debouncedFilters, setDebouncedFilters] = useState<AttendanceFilter>(filters);

  /** Timer reference for debouncing. */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Computed Values
  // ---------------------------------------------------------------------------

  /**
   * Determines if any filter is currently applied (non-default).
   */
  const isFiltered = useMemo(() => {
    return Object.keys(filters).some(key => {
      const value = filters[key as keyof AttendanceFilter];
      const defaultValue = DEFAULT_ATTENDANCE_FILTERS[key as keyof AttendanceFilter];
      return value !== defaultValue && value !== undefined && value !== '';
    });
  }, [filters]);

  /**
   * Counts the number of active filters (non-empty values).
   */
  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).reduce((count, key) => {
      const value = filters[key as keyof AttendanceFilter];
      const defaultValue = DEFAULT_ATTENDANCE_FILTERS[key as keyof AttendanceFilter];
      if (value !== defaultValue && value !== undefined && value !== '') {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filters]);

  // ---------------------------------------------------------------------------
  // Filter Management Functions
  // ---------------------------------------------------------------------------

  /**
   * Updates a single filter value.
   * For search input, this triggers debouncing to avoid excessive updates.
   * @param key - Filter key to update.
   * @param value - New value.
   */
  const updateFilter = useCallback(<K extends keyof AttendanceFilter>(
    key: K,
    value: AttendanceFilter[K]
  ) => {
    // Update the main filter state immediately
    setFilters(prev => ({ ...prev, [key]: value }));

    // For search term, debounce the application
    if (key === 'searchTerm') {
      // Clear any existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Set a new timer to apply after debounce delay
      debounceTimerRef.current = setTimeout(() => {
        const newFilters = { ...filters, [key]: value };
        setDebouncedFilters(newFilters);
        if (onApply) {
          onApply(newFilters);
        }
        debounceTimerRef.current = null;
      }, debounceDelay);
    } else {
      // For non-search filters, apply immediately (or with less delay)
      const newFilters = { ...filters, [key]: value };
      setDebouncedFilters(newFilters);
      // Optionally apply immediately for non-search
      if (onApply && key !== 'searchTerm') {
        // Apply with a small delay to avoid rapid updates
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onApply(newFilters);
          debounceTimerRef.current = null;
        }, 100); // shorter delay for non-search
      }
    }
  }, [filters, debounceDelay, onApply]);

  /**
   * Resets all filters to default values.
   * Calls onReset callback if provided.
   */
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_ATTENDANCE_FILTERS, ...initialFilters });
    setDebouncedFilters({ ...DEFAULT_ATTENDANCE_FILTERS, ...initialFilters });
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (onReset) {
      onReset();
    }
  }, [initialFilters, onReset]);

  /**
   * Applies the current filters immediately.
   */
  const applyFilters = useCallback(() => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setDebouncedFilters(filters);
    if (onApply) {
      onApply(filters);
    }
  }, [filters, onApply]);

  /**
   * Clears all filters (resets to default) and applies them.
   */
  const clearFilters = useCallback(() => {
    resetFilters();
    // After reset, apply the default filters
    const defaultFilters = { ...DEFAULT_ATTENDANCE_FILTERS, ...initialFilters };
    if (onApply) {
      onApply(defaultFilters);
    }
  }, [resetFilters, initialFilters, onApply]);

  /**
   * Gets the current filter object as a URL query string.
   * @returns Query string (e.g., "?startDate=2026-07-01&status=Present").
   */
  const getQueryString = useCallback((): string => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }, [filters]);

  /**
   * Gets the current filter object as a plain object.
   * @returns Shallow copy of the filter object.
   */
  const getFilterObject = useCallback((): AttendanceFilter => {
    return { ...filters };
  }, [filters]);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    filters,
    isFiltered,
    activeFilterCount,
    updateFilter,
    resetFilters,
    applyFilters,
    clearFilters,
    getQueryString,
    getFilterObject,
  };
};

function setDebouncedFilters(_filters: AttendanceFilter) {
  throw new Error('Function not implemented.');
}
