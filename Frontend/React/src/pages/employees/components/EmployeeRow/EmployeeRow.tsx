import React from "react";
import {
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";

import { Employee } from "../../types/employees.types";

import { EmployeeAvatar } from "../EmployeeAvatar/EmployeeAvatar";

import { EmployeeStatusBadge } from "../EmployeeStatusBadge/EmployeeStatusBadge";

import { formatDate } from "../../utils/employees.utils";

import "./EmployeeRow.css";

interface EmployeeRowProps {
  employee: Employee;

  onView: (
    employee: Employee,
  ) => void;

  onEdit: (
    employee: Employee,
  ) => void;

  onDelete: (
    employee: Employee,
  ) => void;

  onActivate: (
    employee: Employee,
  ) => void;
}

export const EmployeeRow: React.FC<
  EmployeeRowProps
> = ({
  employee,
  onView,
  onEdit,
  onDelete,
  onActivate,
}) => {
  /**
   * Opens the selected employee profile.
   * The employee code is passed through the parent onView handler.
   */
  const handleViewEmployee = () => {
    onView(employee);
  };

  return (
    <tr className="employee-row">

      {/* ========================================================
          Employee
      ======================================================== */}
      <td className="employee-row-cell employee-cell">
        <div className="employee-cell-content">

          <EmployeeAvatar
            photo={employee.photo}
            fullName={employee.fullName}
          />

          {/* ====================================================
              Clickable Employee Name

              Opens the selected employee's profile page.
              It does not open the logged-in user's profile.
          ==================================================== */}
          <span
            className="employee-name"
            role="button"
            tabIndex={0}
            onClick={handleViewEmployee}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                handleViewEmployee();
              }
            }}
            aria-label={`View profile of ${employee.fullName}`}
            title="View Employee Profile"
          >
            {employee.fullName}
          </span>

        </div>
      </td>

      {/* ========================================================
          Employee ID
      ======================================================== */}
      <td className="employee-row-cell">
        {employee.employeeCode || "-"}
      </td>

      {/* ========================================================
          Designation
      ======================================================== */}
      <td className="employee-row-cell">
        {employee.designation || "-"}
      </td>

      {/* ========================================================
          Joining Date
      ======================================================== */}
      <td className="employee-row-cell">
        {employee.joiningDate
          ? formatDate(employee.joiningDate)
          : "-"}
      </td>

      {/* ========================================================
          Reporting Manager
      ======================================================== */}
      <td className="employee-row-cell">
        {employee.reportingManager || "-"}
      </td>

      {/* ========================================================
          Status
      ======================================================== */}
      <td className="employee-row-cell">
        <EmployeeStatusBadge
          status={employee.status}
          onActivate={() => onActivate(employee)}
        />
      </td>

      {/* ========================================================
          Actions
      ======================================================== */}
      <td className="employee-row-cell employee-actions-cell">
        <div className="employee-actions">

          {/* View Button */}
          <button
            type="button"
            onClick={handleViewEmployee}
            className="employee-action-btn"
            aria-label={`View profile of ${employee.fullName}`}
            title="View"
          >
            <Eye size={16} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(employee)}
            className="employee-action-btn"
            aria-label={`Edit ${employee.fullName}`}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(employee)}
            className="employee-action-btn employee-action-delete"
            aria-label={`Delete ${employee.fullName}`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>

        </div>
      </td>

    </tr>
  );
};