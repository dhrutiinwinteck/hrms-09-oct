/**
 * @file useDepartments.ts
 * @description Loads departments used by Designation module.
 */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Department,
} from "../types/designation.types";

import departmentService from "../services/department.service";

export const useDepartments = () => {
  const [
    departments,
    setDepartments,
  ] = useState<Department[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const fetchDepartments =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const data =
          await departmentService.getAll();

        setDepartments(data);
      } catch (error) {
        console.error(
          "Failed to fetch departments:",
          error,
        );

        setDepartments([]);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load departments.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
  };
};

export default useDepartments;