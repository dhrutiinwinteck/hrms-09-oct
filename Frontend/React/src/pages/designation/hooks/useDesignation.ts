import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import designationService from "../services/designation.service";
import departmentService from "../services/department.service";

import {
  mapDesignationFromApi,
} from "../utils/designation.mapper";

import type {
  Department,
  Designation,
  DesignationFilters,
  DesignationFormData,
  DesignationStatistics,
} from "../types/designation.types";

import {
  DEFAULT_PAGE_SIZE,
  INITIAL_FILTERS,
} from "../constants/designation.constants";

const useDesignations = () => {
  const [
    designations,
    setDesignations,
  ] = useState<Designation[]>([]);

  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [
    filters,
    setFilters,
  ] = useState<DesignationFilters>(
    INITIAL_FILTERS,
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(1);

  const [
    loading,
    setLoading,
  ] = useState<boolean>(true);

  const [
    error,
    setError,
  ] = useState<string>("");

  /**
   * Load departments and designations.
   */
  const loadData = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const [
          designationData,
          departmentData,
        ] = await Promise.all([
          designationService.getDesignations(),
          departmentService.getAll(),
        ]);

        setDepartments(
          departmentData,
        );

        const mappedDesignations =
          designationData.map(
            (designation) =>
              mapDesignationFromApi(
                designation,
                departmentData,
              ),
          );

        setDesignations(
          mappedDesignations,
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load designation data:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load designations.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Initial API call.
   */
  useEffect(() => {
    void loadData();
  }, [loadData]);

  /**
   * Filter designations.
   */
  const filteredDesignations =
    useMemo<Designation[]>(
      () => {
        const search =
          filters.search
            .trim()
            .toLowerCase();

        return designations.filter(
          (designation) => {
            const matchesSearch =
              search.length === 0 ||
              designation.name
                .toLowerCase()
                .includes(search) ||
              designation.departmentName
                .toLowerCase()
                .includes(search);

            const matchesDepartment =
              filters.departmentId === "" ||
              designation.departmentId ===
                filters.departmentId;

            const matchesStatus =
              filters.status === "All" ||
              designation.status ===
                filters.status;

            return (
              matchesSearch &&
              matchesDepartment &&
              matchesStatus
            );
          },
        );
      },
      [
        designations,
        filters,
      ],
    );

  /**
   * Pagination.
   */
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredDesignations.length /
        DEFAULT_PAGE_SIZE,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedDesignations =
    useMemo<Designation[]>(
      () => {
        const start =
          (safeCurrentPage - 1) *
          DEFAULT_PAGE_SIZE;

        return filteredDesignations.slice(
          start,
          start +
            DEFAULT_PAGE_SIZE,
        );
      },
      [
        filteredDesignations,
        safeCurrentPage,
      ],
    );

  /**
   * Statistics.
   */
  const statistics =
    useMemo<DesignationStatistics>(
      () => ({
        total:
          designations.length,

        active:
          designations.filter(
            (designation) =>
              designation.status ===
              "Active",
          ).length,

        inactive:
          designations.filter(
            (designation) =>
              designation.status ===
              "Inactive",
          ).length,

        departmentsCovered:
          new Set(
            designations.map(
              (designation) =>
                designation.departmentId,
            ),
          ).size,
      }),
      [designations],
    );

  /**
   * Update filters.
   */
  const updateFilters = (
    nextFilters: DesignationFilters,
  ): void => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  /**
   * Reset filters.
   */
  const resetFilters = (): void => {
    setFilters({
      ...INITIAL_FILTERS,
    });

    setCurrentPage(1);
  };

  /**
   * CREATE
   *
   * POST /api/v1/designations/
   */
  const createDesignation =
    async (
      data: DesignationFormData,
    ): Promise<void> => {
      await designationService.createDesignation(
        data,
      );

      await loadData();

      setCurrentPage(1);
    };

  /**
   * UPDATE
   *
   * PUT /api/v1/designations/{id}
   */
  const updateDesignation =
    async (
      id: number,
      data: DesignationFormData,
    ): Promise<void> => {
      await designationService.updateDesignation(
        id,
        data,
      );

      await loadData();
    };

  /**
   * DELETE
   *
   * DELETE /api/v1/designations/{id}
   */
  const deleteDesignation =
    async (
      id: number,
    ): Promise<void> => {
      await designationService.deleteDesignation(
        id,
      );

      await loadData();

      setCurrentPage(
        (page) => {
          const remainingItems =
            Math.max(
              0,
              filteredDesignations.length -
                1,
            );

          const newTotalPages =
            Math.max(
              1,
              Math.ceil(
                remainingItems /
                  DEFAULT_PAGE_SIZE,
              ),
            );

          return Math.min(
            page,
            newTotalPages,
          );
        },
      );
    };

  return {
    designations,
    departments,

    filteredDesignations,
    paginatedDesignations,

    statistics,

    filters,

    currentPage,
    totalPages,

    loading,
    error,

    setCurrentPage,

    updateFilters,
    resetFilters,

    createDesignation,
    updateDesignation,
    deleteDesignation,

    refresh: loadData,
  };
};

export default useDesignations;