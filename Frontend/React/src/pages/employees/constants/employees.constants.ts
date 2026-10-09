// src/pages/employees/constants/employees.constants.ts

import { EmployeeStatus, EmployeeType } from '../types/employees.types';

export const EMPLOYEE_PAGE_SIZE = 10;

export const EMPLOYEE_STATUSES: EmployeeStatus[] = [
  'Active',
  'Inactive',
  'On Leave',
  'Terminated'
];

export const EMPLOYEE_TYPES: EmployeeType[] = [
  'Full Time',
  'Part Time',
  'Contract',
  'Intern'
];

export const EMPLOYEE_TABLE_COLUMNS = [
  { key: 'employee', label: 'Employee' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'designation', label: 'Designation' },
  { key: 'joinDate', label: 'Join Date' },
  { key: 'reportingManager', label: 'Reporting Manager' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Action' }
];

export const DEFAULT_FILTERS = {
  employeeId: '',
  employeeName: '',
  designation: ''
};

export const STATISTICS_LABELS = {
  total: 'Total Employees',
  active: 'Active Employees',
  newJoiners: 'New Joiners',
  onLeave: 'On Leave'
};