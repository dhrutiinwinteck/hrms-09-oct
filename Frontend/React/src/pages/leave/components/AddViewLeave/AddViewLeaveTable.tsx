import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import "./AddViewLeaveTable.css";

// ============================================================
// LEAVE EMPLOYEE
// ============================================================

export interface LeaveEmployee {
  id: number;
  employeeName: string;
  empCode: string;
  year: string;
  casualLeave: number;
  paidLeave: number;
  compOff: number;
  createdOn: string;
}

// ============================================================
// PROPS
// ============================================================

interface AddViewLeaveTableProps {
  employees?: LeaveEmployee[];
  searchValue?: string;
  onView?: (
    employee: LeaveEmployee,
  ) => void;
  onEdit?: (
    employee: LeaveEmployee,
  ) => void;
  onDelete?: (
    employee: LeaveEmployee,
  ) => void;
}

// ============================================================
// CONSTANTS
// ============================================================

const ITEMS_PER_PAGE = 5;

// ============================================================
// HELPERS
// ============================================================

const getInitials = (
  name: string,
): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "NA";
  }

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
};

// ============================================================
// COMPONENT
// ============================================================

const AddViewLeaveTable: React.FC<
  AddViewLeaveTableProps
> = ({
  employees = [],
  searchValue = "",
  onView,
  onEdit,
  onDelete,
}) => {
  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  // ==========================================================
  // FILTER EMPLOYEES
  // ==========================================================

  const filteredEmployees =
    useMemo(() => {
      const normalizedSearch =
        searchValue
          .trim()
          .toLowerCase();

      if (!normalizedSearch) {
        return employees;
      }

      return employees.filter(
        (employee) =>
          employee.employeeName
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          employee.empCode
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      employees,
      searchValue,
    ]);

  // ==========================================================
  // RESET PAGE WHEN SEARCH / DATA CHANGES
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchValue,
    employees,
  ]);

  // ==========================================================
  // PAGINATION CALCULATIONS
  // ==========================================================

  const totalEntries =
    filteredEmployees.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalEntries /
        ITEMS_PER_PAGE,
    ),
  );

  const visibleEmployees =
    filteredEmployees.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE,
    );

  const firstEntry =
    visibleEmployees.length === 0
      ? 0
      : (currentPage - 1) *
          ITEMS_PER_PAGE +
        1;

  const lastEntry =
    visibleEmployees.length === 0
      ? 0
      : Math.min(
          currentPage *
            ITEMS_PER_PAGE,
          totalEntries,
        );

  // ==========================================================
  // PAGINATION HANDLERS
  // ==========================================================

  const handlePreviousPage =
    (): void => {
      setCurrentPage(
        (previous) =>
          Math.max(
            1,
            previous - 1,
          ),
      );
    };

  const handleNextPage =
    (): void => {
      setCurrentPage(
        (previous) =>
          Math.min(
            totalPages,
            previous + 1,
          ),
      );
    };

  const handlePageChange = (
    page: number,
  ): void => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="add-view-leave-table">

      {/* ==================================================
          TABLE
          ================================================== */}

      <div className="add-view-leave-table__scroll">
        <table>
          <thead>
            <tr>
              <th className="add-view-leave-table__number-column">
                #
              </th>

              <th>
                Employee Name
              </th>

              <th>
                Employee Code
              </th>

              <th>
                Year
              </th>

              <th>
                Casual Leave
              </th>

              <th>
                Paid Leave
              </th>

              <th>
                Comp Off
              </th>

              <th>
                Created On
              </th>

              <th className="add-view-leave-table__action-heading">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleEmployees.length >
            0 ? (
              visibleEmployees.map(
                (
                  employee,
                  index,
                ) => (
                  <tr
                    key={
                      employee.id
                    }
                  >
                    {/* ==================================
                        NUMBER
                        ================================== */}

                    <td className="add-view-leave-table__row-number">
                      {(currentPage -
                        1) *
                        ITEMS_PER_PAGE +
                        index +
                        1}
                    </td>

                    {/* ==================================
                        EMPLOYEE
                        ================================== */}

                    <td>
                      <div className="add-view-leave-table__employee">

                        <div
                          className={`add-view-leave-table__avatar add-view-leave-table__avatar--${
                            index % 5
                          }`}
                          aria-hidden="true"
                        >
                          {getInitials(
                            employee.employeeName,
                          )}
                        </div>

                        <span className="add-view-leave-table__employee-name">
                          {
                            employee.employeeName
                          }
                        </span>

                      </div>
                    </td>

                    {/* ==================================
                        EMPLOYEE CODE
                        ================================== */}

                    <td>
                      {
                        employee.empCode
                      }
                    </td>

                    {/* ==================================
                        YEAR
                        ================================== */}

                    <td>
                      {
                        employee.year
                      }
                    </td>

                    {/* ==================================
                        CASUAL LEAVE
                        ================================== */}

                    <td>
                      {
                        employee.casualLeave
                      }
                    </td>

                    {/* ==================================
                        PAID LEAVE
                        ================================== */}

                    <td>
                      {
                        employee.paidLeave
                      }
                    </td>

                    {/* ==================================
                        COMP OFF
                        ================================== */}

                    <td>
                      {
                        employee.compOff
                      }
                    </td>

                    {/* ==================================
                        CREATED ON
                        ================================== */}

                    <td>
                      {
                        employee.createdOn
                      }
                    </td>

                    {/* ==================================
                        ACTIONS
                        ================================== */}

                    <td>
                      <div className="add-view-leave-table__actions">

                        <button
                          type="button"
                          className="
                            add-view-leave-table__action-button
                            add-view-leave-table__action-button--edit
                          "
                          aria-label={`Edit ${employee.employeeName}`}
                          title="Edit"
                          onClick={() =>
                            onEdit?.(
                              employee,
                            )
                          }
                        >
                          <Pencil
                            size={15}
                            strokeWidth={
                              2
                            }
                          />
                        </button>

                        <button
                          type="button"
                          className="
                            add-view-leave-table__action-button
                            add-view-leave-table__action-button--view
                          "
                          aria-label={`View ${employee.employeeName}`}
                          title="View"
                          onClick={() =>
                            onView?.(
                              employee,
                            )
                          }
                        >
                          <Eye
                            size={16}
                            strokeWidth={
                              1.9
                            }
                          />
                        </button>

                        <button
                          type="button"
                          className="
                            add-view-leave-table__action-button
                            add-view-leave-table__action-button--delete
                          "
                          aria-label={`Delete ${employee.employeeName}`}
                          title="Delete"
                          onClick={() =>
                            onDelete?.(
                              employee,
                            )
                          }
                        >
                          <Trash2
                            size={15}
                            strokeWidth={
                              2
                            }
                          />
                        </button>

                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="add-view-leave-table__empty"
                >
                  No employee leave
                  balances found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ==================================================
          FOOTER
          ================================================== */}

      <div className="add-view-leave-table__footer">

        <p className="add-view-leave-table__entries">
          Showing{" "}
          {firstEntry} to{" "}
          {lastEntry} of{" "}
          <strong>
            {totalEntries}
          </strong>{" "}
          entries
        </p>

        {totalEntries > 0 && (
          <nav
            className="add-view-leave-table__pagination"
            aria-label="Employee leave balance pagination"
          >
            {/* ==========================================
                PREVIOUS
                ========================================== */}

            <button
              type="button"
              className="add-view-leave-table__page-button"
              aria-label="Previous page"
              disabled={
                currentPage ===
                1
              }
              onClick={
                handlePreviousPage
              }
            >
              <ChevronLeft
                size={17}
                strokeWidth={2}
              />
            </button>

            {/* ==========================================
                PAGE 1
                ========================================== */}

            <button
              type="button"
              className={`add-view-leave-table__page-button ${
                currentPage ===
                1
                  ? "add-view-leave-table__page-button--active"
                  : ""
              }`}
              onClick={() =>
                handlePageChange(
                  1,
                )
              }
            >
              1
            </button>

            {/* ==========================================
                PAGE 2
                ========================================== */}

            {totalPages >=
              2 && (
              <button
                type="button"
                className={`add-view-leave-table__page-button ${
                  currentPage ===
                  2
                    ? "add-view-leave-table__page-button--active"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    2,
                  )
                }
              >
                2
              </button>
            )}

            {/* ==========================================
                PAGE 3
                ========================================== */}

            {totalPages >=
              3 && (
              <button
                type="button"
                className={`add-view-leave-table__page-button ${
                  currentPage ===
                  3
                    ? "add-view-leave-table__page-button--active"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    3,
                  )
                }
              >
                3
              </button>
            )}

            {/* ==========================================
                ELLIPSIS
                ========================================== */}

            {totalPages >
              4 && (
              <span
                className="add-view-leave-table__ellipsis"
                aria-hidden="true"
              >
                ...
              </span>
            )}

            {/* ==========================================
                LAST PAGE
                ========================================== */}

            {totalPages >
              3 && (
              <button
                type="button"
                className={`add-view-leave-table__page-button ${
                  currentPage ===
                  totalPages
                    ? "add-view-leave-table__page-button--active"
                    : ""
                }`}
                onClick={() =>
                  handlePageChange(
                    totalPages,
                  )
                }
              >
                {
                  totalPages
                }
              </button>
            )}

            {/* ==========================================
                NEXT
                ========================================== */}

            <button
              type="button"
              className="add-view-leave-table__page-button"
              aria-label="Next page"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={
                handleNextPage
              }
            >
              <ChevronRight
                size={17}
                strokeWidth={2}
              />
            </button>
          </nav>
        )}

      </div>
    </div>
  );
};

export default AddViewLeaveTable;