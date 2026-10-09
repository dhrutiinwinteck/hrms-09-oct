// src/pages/employees/hooks/useEmployees.ts

import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import { employeesService } from '../services/employees.service';

import {
  Employee,
  EmployeeStatistics,
  EmployeeUpdatePayload,
  EmployeeFormData,
} from '../types/employees.types';


export const useEmployees = () => {
  // ============================================================
  // EXISTING:
  // Employee list state
  // ============================================================
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ============================================================
  // EXISTING:
  // Loading state
  // ============================================================
  const [loading, setLoading] = useState(false);

  // ============================================================
  // EXISTING:
  // Error state
  // ============================================================
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // EXISTING:
  // Total employee count
  // ============================================================
  const [total, setTotal] = useState(0);

  // ============================================================
  // EXISTING:
  // Employee statistics
  // ============================================================
  const [statistics, setStatistics] =
    useState<EmployeeStatistics>({
      total: 0,
      active: 0,
      newJoiners: 0,
      onLeave: 0,
    });


  // ============================================================
  // EXISTING:
  // Fetch employees
  // ============================================================
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await employeesService.getEmployees();

      setEmployees(response.data);

      setTotal(response.total);

      const stats =
        await employeesService.getEmployeeStatistics(
          response.data
        );

      setStatistics(stats);
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to fetch employees'
      );
    } finally {
      setLoading(false);
    }
  }, []);


  // ============================================================
  // EXISTING:
  // Create employee
  // ============================================================
  const createEmployee = useCallback(
  async (payload: EmployeeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const newEmployee =
        await employeesService.createEmployee(
          payload
        );

      setEmployees((previous) => [
        ...previous,
        newEmployee,
      ]);

      setTotal((previous) => previous + 1);

      return newEmployee;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to create employee';

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  },
  []
);


  // ============================================================
  // UPDATED:
  // Employee update payload.
  //
  // Previously:
  //     payload: Partial<Employee>
  //
  // Now:
  //     payload: EmployeeUpdatePayload
  //
  // EmployeeUpdatePayload supports:
  //
  // 1. Existing employee fields
  // 2. Activate Employee fields:
  //    - reason
  //    - resignation
  //    - termination
  //    - fromDate
  //    - noticePeriod
  //    - status
  // ============================================================
  const updateEmployee = useCallback(
    async (
      id: string,
      payload: EmployeeUpdatePayload
    ) => {
      setLoading(true);
      setError(null);

      try {
        // ======================================================
        // EXISTING:
        // Call employee service.
        //
        // The complete update payload is passed to the service.
        // ======================================================
        const updatedEmployee =
          await employeesService.updateEmployee(
            id,
            payload
          );

        // ======================================================
        // EXISTING:
        // Update employee in local state.
        // ======================================================
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id
              ? updatedEmployee
              : emp
          )
        );

        // ======================================================
        // EXISTING:
        // Recalculate employee statistics.
        // ======================================================
        const updatedStats =
          await employeesService.getEmployeeStatistics(
            employees.map((emp) =>
              emp.id === id
                ? updatedEmployee
                : emp
            )
          );

        setStatistics(updatedStats);

        return updatedEmployee;
      } catch (err: any) {
        // ======================================================
        // EXISTING:
        // Handle update error.
        // ======================================================
        setError(
          err?.message ||
            'Failed to update employee'
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [employees]
  );


  // ============================================================
  // EXISTING:
  // Delete employee
  // ============================================================
  const deleteEmployee = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await employeesService.deleteEmployee(id);

        const updatedEmployees =
          employees.filter(
            (emp) => emp.id !== id
          );

        setEmployees(updatedEmployees);

        setTotal((prev) => prev - 1);

        const updatedStats =
          await employeesService.getEmployeeStatistics(
            updatedEmployees
          );

        setStatistics(updatedStats);
      } catch (err: any) {
        setError(
          err?.message ||
            'Failed to delete employee'
        );

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [employees]
  );


  // ============================================================
  // EXISTING:
  // Initial employee fetch
  // ============================================================
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);


  // ============================================================
  // EXISTING:
  // Return hook API
  // ============================================================
  return {
    employees,

    loading,

    error,

    total,

    statistics,

    fetchEmployees,

    createEmployee,

    updateEmployee,

    deleteEmployee,
  };
};