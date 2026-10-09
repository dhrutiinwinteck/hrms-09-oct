// src/pages/employees/hooks/useEmployeeFilters.ts

import { useState, useMemo, useCallback } from 'react';
import { Employee, EmployeeFilters } from '../types/employees.types';
import { DEFAULT_FILTERS } from '../constants/employees.constants';

export const useEmployeeFilters = (employees: Employee[]) => {
  const [filters, setFilters] = useState<EmployeeFilters>(DEFAULT_FILTERS);

  const filteredEmployees = useMemo(() => {
    let result = employees;

    if (filters.employeeId) {
      const searchTerm = filters.employeeId.toLowerCase().trim();
      result = result.filter(emp => 
        emp.id.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.employeeName) {
      const searchTerm = filters.employeeName.toLowerCase().trim();
      result = result.filter(emp => 
        emp.fullName.toLowerCase().includes(searchTerm) ||
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.designation) {
      result = result.filter(emp => 
        emp.designation === filters.designation
      );
    }

    return result;
  }, [employees, filters]);

  const updateFilter = useCallback((key: keyof EmployeeFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    filteredEmployees,
    updateFilter,
    resetFilters
  };
};