/**
 * @file useDepartment.ts
 * @description Department data and CRUD state management hook.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import departmentService from "../services/department.service";

import {
  Department,
  DepartmentFilters,
  DepartmentFormData,
} from "../types/department.types";

export const useDepartment = () => {
  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState<boolean>(false);

  const [filters, setFilters] =
    useState<DepartmentFilters>({
      search: "",
      status: "",
      page: 1,
      limit: 4,
    });

  /**
   * GET departments.
   */
  const fetchDepartments =
    useCallback(async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await departmentService.getDepartments();

        setDepartments(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch departments:",
          err,
        );

        setDepartments([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load departments. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  /**
   * Search filter.
   */
  const setSearch = useCallback(
    (search: string): void => {
      setFilters((previous) => ({
        ...previous,
        search,
        page: 1,
      }));
    },
    [],
  );

  /**
   * Status filter.
   *
   * Status is currently UI-only because the Department
   * API does not expose a status field.
   */
  const setStatusFilter = useCallback(
    (status: string): void => {
      setFilters((previous) => ({
        ...previous,
        status:
          status as DepartmentFilters["status"],
        page: 1,
      }));
    },
    [],
  );

  /**
   * Pagination.
   */
  const setPage = useCallback(
    (page: number): void => {
      setFilters((previous) => ({
        ...previous,
        page,
      }));
    },
    [],
  );

  /**
   * Client-side filtering.
   */
  const filteredDepartments = useMemo(() => {
    const normalizedSearch =
      filters.search
        ?.trim()
        .toLowerCase() ?? "";

    return departments.filter(
      (department) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          department.name
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          !filters.status ||
          department.status ===
            filters.status;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [
    departments,
    filters.search,
    filters.status,
  ]);

  /**
   * CREATE
   */
  const createDepartment = useCallback(
    async (
      data: DepartmentFormData,
    ): Promise<Department> => {
      setIsSaving(true);
      setError(null);

      try {
        const created =
          await departmentService.createDepartment(
            data,
          );

        setDepartments((previous) => [
          ...previous,
          created,
        ]);

        setFilters((previous) => ({
          ...previous,
          page: 1,
        }));

        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create department.";

        setError(message);

        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  /**
   * UPDATE
   */
  const updateDepartment = useCallback(
    async (
      data: DepartmentFormData,
    ): Promise<Department> => {
      if (data.id === undefined) {
        throw new Error(
          "Department ID is required for update.",
        );
      }

      setIsSaving(true);
      setError(null);

      try {
        const updated =
          await departmentService.updateDepartment(
            data.id,
            data,
          );

        setDepartments((previous) =>
          previous.map((department) =>
            String(department.id) ===
            String(data.id)
              ? {
                  ...department,
                  ...updated,

                  /**
                   * Preserve UI-only fields because
                   * backend does not return them.
                   */
                  status:
                    department.status,

                  employeeCount:
                    department.employeeCount,
                }
              : department,
          ),
        );

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update department.";

        setError(message);

        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  /**
   * DELETE
   */
  const deleteDepartment = useCallback(
    async (
      department: Department,
    ): Promise<void> => {
      setIsSaving(true);
      setError(null);

      try {
        await departmentService.deleteDepartment(
          department.id,
        );

        setDepartments((previous) =>
          previous.filter(
            (item) =>
              String(item.id) !==
              String(department.id),
          ),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete department.";

        setError(message);

        throw new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const refresh = useCallback(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments: filteredDepartments,

    allDepartments: departments,

    total: filteredDepartments.length,

    loading,

    isSaving,

    error,

    filters,

    setSearch,

    setStatusFilter,

    setPage,

    createDepartment,

    updateDepartment,

    deleteDepartment,

    refresh,
  };
};

export default useDepartment;