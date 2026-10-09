import { EmployeeOption, MonthOption } from '../types/editPunchInOut.types';

export const filterEmployees = (
  employees: EmployeeOption[],
  searchText: string
): EmployeeOption[] => {
  if (!searchText.trim()) return employees;
  
  const lowercasedSearch = searchText.toLowerCase().trim();
  return employees.filter(employee =>
    employee.name.toLowerCase().includes(lowercasedSearch) ||
    employee.email?.toLowerCase().includes(lowercasedSearch) ||
    employee.department?.toLowerCase().includes(lowercasedSearch)
  );
};

export const filterMonths = (
  months: MonthOption[],
  searchText: string
): MonthOption[] => {
  if (!searchText.trim()) return months;
  
  const lowercasedSearch = searchText.toLowerCase().trim();
  return months.filter(month =>
    month.label.toLowerCase().includes(lowercasedSearch)
  );
};

export const formatMonthDisplay = (monthOption: MonthOption | null): string => {
  if (!monthOption) return '';
  return monthOption.label;
};

export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};