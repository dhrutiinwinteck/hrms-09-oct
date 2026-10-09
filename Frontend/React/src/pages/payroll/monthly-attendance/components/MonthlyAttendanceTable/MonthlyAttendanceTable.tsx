import React from "react";

import {
  ArrowDownUp,
  FileX2,
} from "lucide-react";

import "./MonthlyAttendanceTable.css";

interface MonthlyAttendanceEmployee {
  employeeName: string;
  uan: string;
  esic: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  netSalary: number;
}

interface MonthlyAttendanceTableProps {
  employees: MonthlyAttendanceEmployee[];
  recordsPerPage: number;
}

interface MonthlyAttendanceColumn {
  key: keyof MonthlyAttendanceEmployee;
  label: string;
  className: string;
  numeric?: boolean;
}

const MONTHLY_ATTENDANCE_COLUMNS: MonthlyAttendanceColumn[] =
  [
    {
      key: "employeeName",
      label: "Employee Name",
      className:
        "monthly-attendance-table__column--employee",
    },
    {
      key: "uan",
      label: "UAN",
      className:
        "monthly-attendance-table__column--uan",
    },
    {
      key: "esic",
      label: "ESIC",
      className:
        "monthly-attendance-table__column--esic",
    },
    {
      key: "bankName",
      label: "Bank Name",
      className:
        "monthly-attendance-table__column--bank",
    },
    {
      key: "accountNo",
      label: "Account No",
      className:
        "monthly-attendance-table__column--account",
    },
    {
      key: "ifsc",
      label: "IFSC",
      className:
        "monthly-attendance-table__column--ifsc",
    },
    {
      key: "netSalary",
      label: "Net Salary (₹)",
      className:
        "monthly-attendance-table__column--salary",
      numeric: true,
    },
  ];

const formatSalary = (
  salary: number,
): string => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(salary);
};

const MonthlyAttendanceTable: React.FC<
  MonthlyAttendanceTableProps
> = ({
  employees,
  recordsPerPage,
}) => {
  const visibleEmployees =
    employees.slice(
      0,
      recordsPerPage,
    );

  const hasEmployees =
    visibleEmployees.length > 0;

  return (
    <div className="monthly-attendance-table-wrapper">
      <div className="monthly-attendance-table-scroll">
        <table className="monthly-attendance-table">
          <thead className="monthly-attendance-table__head">
            <tr>
              {MONTHLY_ATTENDANCE_COLUMNS.map(
                (column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`monthly-attendance-table__heading ${column.className}`}
                  >
                    <span className="monthly-attendance-table__heading-content">
                      <span>
                        {column.label}
                      </span>

                      <ArrowDownUp
                        size={9}
                        strokeWidth={2}
                        className="monthly-attendance-table__sort-icon"
                        aria-hidden="true"
                      />
                    </span>
                  </th>
                ),
              )}
            </tr>
          </thead>

          {hasEmployees && (
            <tbody className="monthly-attendance-table__body">
              {visibleEmployees.map(
                (employee, index) => (
                  <tr
                    className="monthly-attendance-table__row"
                    key={`${employee.employeeName}-${employee.accountNo}-${index}`}
                  >
                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--employee">
                      {employee.employeeName}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--uan">
                      {employee.uan}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--esic">
                      {employee.esic}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--bank">
                      {employee.bankName}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--account">
                      {employee.accountNo}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--ifsc">
                      {employee.ifsc}
                    </td>

                    <td className="monthly-attendance-table__cell monthly-attendance-table__column--salary">
                      ₹{" "}
                      {formatSalary(
                        employee.netSalary,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          )}
        </table>

        {!hasEmployees && (
          <div
            className="monthly-attendance-table__empty"
            role="status"
            aria-live="polite"
          >
            <div className="monthly-attendance-table__empty-icon">
              <FileX2
                size={34}
                strokeWidth={1.35}
              />

              <span className="monthly-attendance-table__empty-accent monthly-attendance-table__empty-accent--one" />
              <span className="monthly-attendance-table__empty-accent monthly-attendance-table__empty-accent--two" />
            </div>

            <h2 className="monthly-attendance-table__empty-title">
              No data available
            </h2>

            <p className="monthly-attendance-table__empty-description">
              Try selecting a month and year to view salary details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyAttendanceTable;