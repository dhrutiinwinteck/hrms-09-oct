// src/pages/shifts/hooks/useShiftPatterns.ts

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';

import {
  ShiftPattern,
  ShiftPatternFilters,
  ShiftPatternStats,
  ShiftPatternFormData,
} from '../types/shiftPatterns.types';

import { shiftPatternsService } from '../services/shiftPatterns.service';

export const useShiftPatterns = () => {
  const [allPatterns, setAllPatterns] =
    useState<ShiftPattern[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [filters, setFilters] =
    useState<ShiftPatternFilters>({
      searchTerm: '',
      status: 'all',
    });

  const [currentPage, setCurrentPage] =
    useState(1);

  const pageSize = 10;

  // ============================================================
  // FORM MODAL STATE
  // ============================================================

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [formMode, setFormMode] =
    useState<'create' | 'edit'>('create');

  const [selectedPattern, setSelectedPattern] =
    useState<ShiftPattern | null>(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data =
        await shiftPatternsService.getShiftPatterns();

      setAllPatterns(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load shift patterns.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ============================================================
  // STATS
  // ============================================================

  const stats: ShiftPatternStats =
    useMemo(() => {
      const total = allPatterns.length;

      const active =
        allPatterns.filter(
          (pattern) =>
            pattern.status === 'active'
        ).length;

      const inactive =
        allPatterns.filter(
          (pattern) =>
            pattern.status === 'inactive'
        ).length;

      /**
       * The current backend does not expose:
       *
       * - employee assignment count
       * - inactive status
       *
       * Therefore assigned remains 0 until
       * an assignment API is available.
       */
      return {
        total,
        active,
        inactive,
        assigned: 0,
      };
    }, [allPatterns]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredPatterns =
    useMemo(() => {
      const search =
        filters.searchTerm
          .trim()
          .toLowerCase();

      return allPatterns.filter(
        (pattern) => {
          const matchesSearch =
            !search ||
            pattern.name
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            filters.status === 'all' ||
            pattern.status ===
              filters.status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [allPatterns, filters]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalItems =
    filteredPatterns.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(totalItems / pageSize)
    );

  /**
   * Make sure current page never becomes
   * greater than the available pages after
   * deleting/filtering records.
   */
  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedPatterns =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        pageSize;

      const end =
        start + pageSize;

      return filteredPatterns.slice(
        start,
        end
      );
    }, [
      filteredPatterns,
      currentPage,
    ]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch =
    useCallback(
      (searchTerm: string) => {
        setFilters((previous) => ({
          ...previous,
          searchTerm,
        }));

        setCurrentPage(1);
      },
      []
    );

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusFilter =
    useCallback(
      (
        status: ShiftPatternFilters['status']
      ) => {
        setFilters((previous) => ({
          ...previous,
          status,
        }));

        setCurrentPage(1);
      },
      []
    );

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePageChange =
    useCallback(
      (page: number) => {
        if (
          page < 1 ||
          page > totalPages
        ) {
          return;
        }

        setCurrentPage(page);
      },
      [totalPages]
    );

  // ============================================================
  // CREATE FORM
  // ============================================================

  const openCreateForm =
    useCallback(() => {
      setFormMode('create');

      setSelectedPattern(null);

      setError(null);

      setIsFormOpen(true);
    }, []);

  // ============================================================
  // EDIT FORM
  // ============================================================

  const openEditForm =
    useCallback(
      (pattern: ShiftPattern) => {
        setFormMode('edit');

        setSelectedPattern(pattern);

        setError(null);

        setIsFormOpen(true);
      },
      []
    );

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const closeForm =
    useCallback(() => {
      setIsFormOpen(false);

      setSelectedPattern(null);
    }, []);

  // ============================================================
  // CREATE
  // ============================================================

  const createPattern =
    useCallback(
      async (
        formData: ShiftPatternFormData
      ) => {
        setActionLoading(true);
        setError(null);

        try {
          const newPattern =
            await shiftPatternsService.createShiftPattern(
              formData
            );

          /**
           * Backend is the source of truth.
           *
           * Add returned database record
           * to the current UI list.
           */
          setAllPatterns(
            (previous) => [
              newPattern,
              ...previous,
            ]
          );

          closeForm();

          setCurrentPage(1);
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to create shift pattern.';

          setError(message);

          throw err;
        } finally {
          setActionLoading(false);
        }
      },
      [closeForm]
    );

  // ============================================================
  // UPDATE
  // ============================================================

  const updatePattern =
    useCallback(
      async (
        id: string,
        formData: ShiftPatternFormData
      ) => {
        setActionLoading(true);
        setError(null);

        try {
          const updated =
            await shiftPatternsService.updateShiftPattern(
              id,
              formData
            );

          setAllPatterns(
            (previous) =>
              previous.map(
                (pattern) =>
                  pattern.id === id
                    ? updated
                    : pattern
              )
          );

          closeForm();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to update shift pattern.';

          setError(message);

          throw err;
        } finally {
          setActionLoading(false);
        }
      },
      [closeForm]
    );

  // ============================================================
  // DELETE
  // ============================================================

  const deletePattern =
    useCallback(
      async (id: string) => {
        setActionLoading(true);
        setError(null);

        try {
          await shiftPatternsService.deleteShiftPattern(
            id
          );

          setAllPatterns(
            (previous) =>
              previous.filter(
                (pattern) =>
                  pattern.id !== id
              )
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to delete shift pattern.';

          setError(message);

          throw err;
        } finally {
          setActionLoading(false);
        }
      },
      []
    );

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Data
    patterns: paginatedPatterns,

    allPatterns: filteredPatterns,

    loading,

    actionLoading,

    error,

    stats,

    totalItems,

    totalPages,

    currentPage,

    filters,

    // Reload
    loadData,

    // Filters
    handleSearch,

    handleStatusFilter,

    handlePageChange,

    // Form
    isFormOpen,

    formMode,

    selectedPattern,

    openCreateForm,

    openEditForm,

    closeForm,

    // CRUD
    createPattern,

    updatePattern,

    deletePattern,
  };
};