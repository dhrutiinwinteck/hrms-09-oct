import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Eye,
  Pencil,
} from "lucide-react";

import type {
  LeaveEmployeeRecord,
  LeaveStatus,
  LeaveType,
} from "../../types/leave.types";

import "./LeaveEmployeesTable.css";

/* =========================================================
   TYPES
   ========================================================= */

export type EmployeeStatus =
  | "Active"
  | "Inactive"
  | "On Leave";

export type EmployeeGender =
  | "Male"
  | "Female"
  | "Other";

/*
 * Keep Employee as an alias for compatibility
 * with existing components such as LeaveEmployeeModal.
 */
export type Employee = LeaveEmployeeRecord;

type SortKey =
  | "name"
  | "from"
  | "to"
  | "noOfDays"
  | "leaveType"
  | "reason"
  | "leaveStatus";

type SortDirection =
  | "asc"
  | "desc";

/* =========================================================
   PROPS
   ========================================================= */

export interface LeaveEmployeesTableProps {
  employees?: Employee[];
  search?: string;
  status?: string;
  pageSize?: number;

  onView?: (
    employee: Employee,
  ) => void;

  onEdit?: (
    employee: Employee,
  ) => void;

  onApprove?: (
    employee: Employee,
  ) => void;

  onReject?: (
    employee: Employee,
  ) => void;
}

/* =========================================================
   HELPERS
   ========================================================= */

const formatDate = (
  date: string,
): string => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(
    date.includes("T")
      ? date
      : `${date}T00:00:00`,
  );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
};

const getLeaveTypeClass = (
  leaveType: LeaveType | string,
): string => {
  const normalized =
    String(leaveType ?? "")
      .trim()
      .toLowerCase();

  if (
    normalized.includes("paid")
  ) {
    return "leave-employees-table__leave-type--purple";
  }

  if (
    normalized.includes("casual")
  ) {
    return "leave-employees-table__leave-type--blue";
  }

  if (
    normalized.includes("comp")
  ) {
    return "leave-employees-table__leave-type--green";
  }

  if (
    normalized.includes("lop")
  )
    return "leave-employees-table__leave-type--orange";

  return "leave-employees-table__leave-type--gray";
};

const getLeaveStatusClass = (
  status: LeaveStatus,
): string => {
  switch (status) {
    case "Pending":
      return "leave-employees-table__status--pending";

    case "Approved":
      return "leave-employees-table__status--approved";

    case "Rejected":
      return "leave-employees-table__status--rejected";

    default:
      return "";
  }
};

/* =========================================================
   COMPONENT
   ========================================================= */

const LeaveEmployeesTable: React.FC<
  LeaveEmployeesTableProps
> = ({
  employees = [],
  search = "",
  status = "",
  pageSize = 10,
  onView,
  onEdit,
}) => {
  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(1);

  const [
    sortKey,
    setSortKey,
  ] = useState<SortKey>("from");

  const [
    sortDirection,
    setSortDirection,
  ] = useState<SortDirection>("asc");

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredEmployees =
    useMemo(() => {
      const normalizedSearch =
        String(search ?? "")
          .trim()
          .toLowerCase();

      const normalizedStatus =
        String(status ?? "")
          .trim()
          .toLowerCase();

      return employees.filter(
        (employee) => {
          const employeeLeaveStatus =
            String(
              employee.leaveStatus ??
                "",
            )
              .trim()
              .toLowerCase();

          const matchesStatus =
            normalizedStatus ===
              "" ||
            employeeLeaveStatus ===
              normalizedStatus;

          if (
            !matchesStatus
          ) {
            return false;
          }

          if (
            normalizedSearch ===
            ""
          ) {
            return true;
          }

          const searchableValues =
            [
              employee.employeeId,
              employee.name,
              employee.designation,
              employee.department,
              employee.email,
              employee.phone,
              employee.from,
              employee.to,
              formatDate(
                employee.from,
              ),
              formatDate(
                employee.to,
              ),
              employee.leaveType,
              employee.reason,
              employee.leaveStatus,
            ];

          return searchableValues.some(
            (value) =>
              String(
                value ?? "",
              )
                .trim()
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ),
          );
        },
      );
    }, [
      employees,
      search,
      status,
    ]);

  /* =======================================================
     SORT
     ======================================================= */

  const sortedEmployees =
    useMemo(() => {
      return [
        ...filteredEmployees,
      ].sort(
        (
          first,
          second,
        ) => {
          let comparison =
            0;

          switch (sortKey) {
            case "name":
              comparison =
                first.name.localeCompare(
                  second.name,
                  undefined,
                  {
                    sensitivity:
                      "base",
                  },
                );
              break;

            case "from":
              comparison =
                first.from.localeCompare(
                  second.from,
                );
              break;

            case "to":
              comparison =
                first.to.localeCompare(
                  second.to,
                );
              break;

            case "noOfDays":
              comparison =
                first.noOfDays -
                second.noOfDays;
              break;

            case "leaveType":
              comparison =
                first.leaveType.localeCompare(
                  second.leaveType,
                  undefined,
                  {
                    sensitivity:
                      "base",
                  },
                );
              break;

            case "reason":
              comparison =
                first.reason.localeCompare(
                  second.reason,
                  undefined,
                  {
                    sensitivity:
                      "base",
                  },
                );
              break;

            case "leaveStatus":
              comparison =
                first.leaveStatus.localeCompare(
                  second.leaveStatus,
                  undefined,
                  {
                    sensitivity:
                      "base",
                  },
                );
              break;

            default:
              break;
          }

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        },
      );
    }, [
      filteredEmployees,
      sortKey,
      sortDirection,
    ]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const safePageSize =
    pageSize > 0
      ? pageSize
      : 10;

  const totalEmployees =
    sortedEmployees.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalEmployees /
          safePageSize,
      ),
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    employees,
    search,
    status,
    safePageSize,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedEmployees =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        safePageSize;

      return sortedEmployees.slice(
        startIndex,
        startIndex +
          safePageSize,
      );
    }, [
      sortedEmployees,
      currentPage,
      safePageSize,
    ]);

  const showingFrom =
    totalEmployees === 0
      ? 0
      : (currentPage - 1) *
          safePageSize +
        1;

  const showingTo =
    totalEmployees === 0
      ? 0
      : Math.min(
          currentPage *
            safePageSize,
          totalEmployees,
        );

  /* =======================================================
     SORT HANDLER
     ======================================================= */

  const handleSort = (
    key: SortKey,
  ): void => {
    if (
      sortKey === key
    ) {
      setSortDirection(
        (previous) =>
          previous ===
          "asc"
            ? "desc"
            : "asc",
      );

      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortIcon = (
    key: SortKey,
  ): React.ReactNode => {
    if (
      sortKey === key
    ) {
      return sortDirection ===
        "asc" ? (
        <ChevronUp
          size={12}
        />
      ) : (
        <ChevronDown
          size={12}
        />
      );
    }

    return (
      <span className="leave-employees-table__sort-neutral">
        <ChevronUp
          size={9}
        />

        <ChevronDown
          size={9}
        />
      </span>
    );
  };

  /* =======================================================
     PAGE HANDLER
     ======================================================= */

  const goToPage = (
    page: number,
  ): void => {
    setCurrentPage(
      Math.min(
        Math.max(
          page,
          1,
        ),
        totalPages,
      ),
    );
  };

  const visiblePages =
    useMemo<number[]>(
      () => {
        if (
          totalPages <= 5
        ) {
          return Array.from(
            {
              length:
                totalPages,
            },
            (_, index) =>
              index + 1,
          );
        }

        let start =
          Math.max(
            1,
            currentPage - 1,
          );

        let end =
          Math.min(
            totalPages,
            currentPage + 1,
          );

        if (
          currentPage <= 2
        ) {
          start = 1;
          end = 3;
        }

        if (
          currentPage >=
          totalPages - 1
        ) {
          start =
            totalPages - 2;
          end =
            totalPages;
        }

        return Array.from(
          {
            length:
              end - start + 1,
          },
          (_, index) =>
            start + index,
        );
      },
      [
        currentPage,
        totalPages,
      ],
    );

  /* =======================================================
     AVATAR FALLBACK
     ======================================================= */

  const getInitials = (
    name: string,
  ): string => {
    const words =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (
      words.length === 0
    ) {
      return "?";
    }

    if (
      words.length === 1
    ) {
      return words[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section className="leave-employees-table">
      <div className="leave-employees-table__scroll">
        <table className="leave-employees-table__table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "name",
                    )
                  }
                >
                  Employee
                  {renderSortIcon(
                    "name",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "from",
                    )
                  }
                >
                  From
                  {renderSortIcon(
                    "from",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "to",
                    )
                  }
                >
                  To
                  {renderSortIcon(
                    "to",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "noOfDays",
                    )
                  }
                >
                  No of Days
                  {renderSortIcon(
                    "noOfDays",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "leaveType",
                    )
                  }
                >
                  Leave Type
                  {renderSortIcon(
                    "leaveType",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "reason",
                    )
                  }
                >
                  Reason
                  {renderSortIcon(
                    "reason",
                  )}
                </button>
              </th>

              <th>
                <button
                  type="button"
                  className="leave-employees-table__header-button"
                  onClick={() =>
                    handleSort(
                      "leaveStatus",
                    )
                  }
                >
                  Status
                  {renderSortIcon(
                    "leaveStatus",
                  )}
                </button>
              </th>

              <th className="leave-employees-table__actions-heading">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length >
            0 ? (
              paginatedEmployees.map(
                (employee) => (
                  <tr
                    key={
                      employee.leaveId ??
                      employee.id
                    }
                  >
                    <td>
                      <div className="leave-employees-table__employee">
                        {employee.avatar ? (
                          <img
                            src={
                              employee.avatar
                            }
                            alt=""
                            className="leave-employees-table__avatar"
                          />
                        ) : (
                          <div
                            className="leave-employees-table__avatar"
                            aria-hidden="true"
                          >
                            {getInitials(
                              employee.name,
                            )}
                          </div>
                        )}

                        <div className="leave-employees-table__employee-info">
                          <span className="leave-employees-table__employee-name">
                            {
                              employee.name
                            }
                          </span>

                          <span className="leave-employees-table__employee-id-text">
                            {
                              employee.employeeId
                            }
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="leave-employees-table__date">
                        {formatDate(
                          employee.from,
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="leave-employees-table__date">
                        {formatDate(
                          employee.to,
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="leave-employees-table__days">
                        {
                          employee.noOfDays
                        }
                      </span>
                    </td>

                    <td>
                      <span
                        className={`leave-employees-table__leave-type ${getLeaveTypeClass(
                          employee.leaveType,
                        )}`}
                      >
                        {
                          employee.leaveType
                        }
                      </span>
                    </td>

                    <td>
                      <span
                        className="leave-employees-table__reason"
                        title={
                          employee.reason
                        }
                      >
                        {
                          employee.reason
                        }
                      </span>
                    </td>

                    <td>
                      <span
                        className={`leave-employees-table__status ${getLeaveStatusClass(
                          employee.leaveStatus,
                        )}`}
                      >
                        <span className="leave-employees-table__status-dot" />

                        {
                          employee.leaveStatus
                        }
                      </span>
                    </td>

                    <td>
                      <div className="leave-employees-table__actions">
                        <button
                          type="button"
                          className="leave-employees-table__action-button"
                          title="View leave details"
                          aria-label={`View leave details for ${employee.name}`}
                          onClick={() =>
                            onView?.(
                              employee,
                            )
                          }
                        >
                          <Eye
                            size={17}
                            strokeWidth={
                              2
                            }
                          />
                        </button>

                        <button
                          type="button"
                          className="leave-employees-table__action-button"
                          title="Edit leave"
                          aria-label={`Edit leave for ${employee.name}`}
                          onClick={() =>
                            onEdit?.(
                              employee,
                            )
                          }
                        >
                          <Pencil
                            size={16}
                            strokeWidth={
                              2
                            }
                          />
                        </button>

                        {employee.leaveStatus ===
                          "Pending" && (
                          <>
                            {/* <button
                              type="button"
                              className="leave-employees-table__action-button"
                              title="Approve leave"
                              aria-label={`Approve leave for ${employee.name}`}
                              onClick={() =>
                                onApprove?.(
                                  employee,
                                )
                              }
                            >
                              <Check
                                size={
                                  17
                                }
                                strokeWidth={
                                  2
                                }
                              />
                            </button> */}

                            {/* <button
                              type="button"
                              className="leave-employees-table__action-button"
                              title="Reject leave"
                              aria-label={`Reject leave for ${employee.name}`}
                              onClick={() =>
                                onReject?.(
                                  employee,
                                )
                              }
                            >
                              <X
                                size={
                                  17
                                }
                                strokeWidth={
                                  2
                                }
                              />
                            </button> */}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="leave-employees-table__empty-cell"
                >
                  <div className="leave-employees-table__empty-state">
                    <strong>
                      No leave requests found
                    </strong>

                    <span>
                      Try changing your
                      search or leave
                      status filter.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="leave-employees-table__footer">
        <p className="leave-employees-table__entries">
          Showing{" "}
          {showingFrom} to{" "}
          {showingTo} of{" "}
          {totalEmployees}{" "}
          entries
        </p>

        {totalEmployees >
          0 && (
          <nav
            className="leave-employees-table__pagination"
            aria-label="Leave request pagination"
          >
            <button
              type="button"
              className="leave-employees-table__page-button"
              disabled={
                currentPage ===
                1
              }
              onClick={() =>
                goToPage(1)
              }
              aria-label="First page"
            >
              <ChevronsLeft
                size={18}
              />
            </button>

            <button
              type="button"
              className="leave-employees-table__page-button"
              disabled={
                currentPage ===
                1
              }
              onClick={() =>
                goToPage(
                  currentPage -
                    1,
                )
              }
              aria-label="Previous page"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            {visiblePages.map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={`leave-employees-table__page-button ${
                    currentPage ===
                    page
                      ? "leave-employees-table__page-button--active"
                      : ""
                  }`}
                  onClick={() =>
                    goToPage(
                      page,
                    )
                  }
                  aria-current={
                    currentPage ===
                    page
                      ? "page"
                      : undefined
                  }
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              className="leave-employees-table__page-button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                goToPage(
                  currentPage +
                    1,
                )
              }
              aria-label="Next page"
            >
              <ChevronRight
                size={18}
              />
            </button>

            <button
              type="button"
              className="leave-employees-table__page-button"
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                goToPage(
                  totalPages,
                )
              }
              aria-label="Last page"
            >
              <ChevronsRight
                size={18}
              />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

export default LeaveEmployeesTable;