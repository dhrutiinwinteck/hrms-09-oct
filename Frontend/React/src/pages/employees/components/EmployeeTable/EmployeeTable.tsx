import React from 'react';
import { Employee } from '../../types/employees.types';
import { EmployeeRow } from '../EmployeeRow/EmployeeRow';
import { EMPLOYEE_TABLE_COLUMNS } from '../../constants/employees.constants';
import './EmployeeTable.css';

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;

  // ============================================================
  // ADDED:
  // Active status badge click handler.
  // ============================================================
  onActivate: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onView,
  onEdit,
  onDelete,
  onActivate,
}) => {
  // ============================================================
  // EXISTING:
  // Loading state
  // ============================================================
  // if (loading) {
  //   return (
  //     <div className="employee-table-loading">
  //       <div className="loading-spinner"></div>

  //       <p>Loading employees...</p>
  //     </div>
  //   );
  // }

  // ============================================================
  // EXISTING:
  // Empty state
  // ============================================================
  if (employees.length === 0) {
    return (
      <div className="employee-table-empty">
        <p>No employees found</p>

        <p className="employee-table-empty-sub">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="employee-table-wrapper">
      <table className="employee-table">
        <thead>
          <tr>
            {EMPLOYEE_TABLE_COLUMNS.map((column) => (
              <th
                key={column.key}
                className="employee-table-header"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onActivate={onActivate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};