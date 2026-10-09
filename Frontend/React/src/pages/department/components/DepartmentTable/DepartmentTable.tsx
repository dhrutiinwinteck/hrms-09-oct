import React from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Pencil,
  Settings,
  Trash2,
  UsersRound,
} from "lucide-react";

import "./DepartmentTable.css";

export type DepartmentIconType =
  | "building"
  | "users"
  | "monitor"
  | "settings";

export interface Department {
  id: number | string;
  name: string;
  employeeCount: number;
  status: string;
  icon?: DepartmentIconType;
}

export interface DepartmentTableProps {
  departments: Department[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalDepartments?: number;
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
  onPageChange?: (page: number) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalDepartments,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const calculatedTotal =
    totalDepartments ?? departments.length;

  const startEntry =
    calculatedTotal === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endEntry =
    calculatedTotal === 0
      ? 0
      : Math.min(
          currentPage * pageSize,
          calculatedTotal,
        );

  const getDepartmentIcon = (
    iconType: DepartmentIconType = "building",
  ): JSX.Element => {
    switch (iconType) {
      case "users":
        return (
          <UsersRound
            className="department-table__department-icon"
            aria-hidden="true"
          />
        );

      case "monitor":
        return (
          <Monitor
            className="department-table__department-icon"
            aria-hidden="true"
          />
        );

      case "settings":
        return (
          <Settings
            className="department-table__department-icon"
            aria-hidden="true"
          />
        );

      case "building":
      default:
        return (
          <Building2
            className="department-table__department-icon"
            aria-hidden="true"
          />
        );
    }
  };

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1);
    }
  };

  const handlePageClick = (page: number): void => {
    if (page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const renderPageNumbers = (): JSX.Element[] => {
    const pages: JSX.Element[] = [];

    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let page = 1; page <= totalPages; page += 1) {
        pages.push(
          <button
            key={page}
            type="button"
            className={`department-table__page-button ${
              page === currentPage
                ? "department-table__page-button--active"
                : ""
            }`}
            onClick={() => handlePageClick(page)}
            aria-label={`Go to page ${page}`}
            aria-current={
              page === currentPage ? "page" : undefined
            }
          >
            {page}
          </button>,
        );
      }

      return pages;
    }

    const startPage = Math.max(
      1,
      Math.min(
        currentPage - 1,
        totalPages - maxVisiblePages + 1,
      ),
    );

    const endPage = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1,
    );

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(
        <button
          key={page}
          type="button"
          className={`department-table__page-button ${
            page === currentPage
              ? "department-table__page-button--active"
              : ""
          }`}
          onClick={() => handlePageClick(page)}
          aria-label={`Go to page ${page}`}
          aria-current={
            page === currentPage ? "page" : undefined
          }
        >
          {page}
        </button>,
      );
    }

    return pages;
  };

  return (
    <section
      className="department-table"
      aria-label="Department list"
    >
      {/* Desktop / Tablet Table */}
      <div className="department-table__scroll">
        <table className="department-table__table">
          <thead>
            <tr>
              <th scope="col">DEPARTMENT NAME</th>
              <th scope="col">STATUS</th>
              <th
                scope="col"
                className="department-table__action-header"
              >
                ACTION
              </th>
            </tr>
          </thead>

          <tbody>
            {departments.length > 0 ? (
              departments.map((department) => (
                <tr key={department.id}>
                  <td>
                    <div className="department-table__department">
                      <div className="department-table__icon-wrapper">
                        {getDepartmentIcon(department.icon)}
                      </div>

                      <div className="department-table__department-info">
                        <span className="department-table__department-name">
                          {department.name}
                        </span>

                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`department-table__status ${
                        department.status.toLowerCase() ===
                        "active"
                          ? "department-table__status--active"
                          : "department-table__status--inactive"
                      }`}
                    >
                      {department.status}
                    </span>
                  </td>

                  <td>
                    <div className="department-table__actions">
                      <button
                        type="button"
                        className="department-table__action-button department-table__action-button--edit"
                        onClick={() => onEdit?.(department)}
                        aria-label={`Edit ${department.name}`}
                        title={`Edit ${department.name}`}
                      >
                        <Pencil
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        className="department-table__action-button department-table__action-button--delete"
                        onClick={() => onDelete?.(department)}
                        aria-label={`Delete ${department.name}`}
                        title={`Delete ${department.name}`}
                      >
                        <Trash2
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="department-table__empty-cell"
                >
                  <div className="department-table__empty">
                    <div className="department-table__empty-icon">
                      <Building2 aria-hidden="true" />
                    </div>

                    <span>
                      No departments found
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="department-table__footer">
        <p className="department-table__summary">
          Showing {startEntry} to {endEntry} of{" "}
          {calculatedTotal}{" "}
          {calculatedTotal === 1
            ? "department"
            : "departments"}
        </p>

        {totalPages > 0 && (
          <div
            className="department-table__pagination"
            aria-label="Department pagination"
          >
            <button
              type="button"
              className="department-table__page-button department-table__page-button--navigation"
              onClick={handlePreviousPage}
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft aria-hidden="true" />
            </button>

            {renderPageNumbers()}

            <button
              type="button"
              className="department-table__page-button department-table__page-button--navigation"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DepartmentTable;