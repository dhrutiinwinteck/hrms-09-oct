import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Hourglass,
  List,
  XCircle,
} from "lucide-react";

import type { LeaveStatus, LeaveType } from "../../types/leave.types";
import "./LeaveTableCards.css";

export type LeaveTab =
  | "All Leaves"
  | "Upcoming"
  | "Pending"
  | "Approved"
  | "Rejected";

export interface LeaveTableRecord {
  id: number;
  fromDate: string;
  fromDay: string;
  toDate: string;
  toDay: string;
  numberOfDays: number;
  leaveType: LeaveType | string;
  reason: string;
  status: LeaveStatus;
  halfDay?: boolean;
}

interface LeaveTableCardsProps {
  data?: LeaveTableRecord[];
  onView?: (record: LeaveTableRecord) => void;
  onMore?: (record: LeaveTableRecord) => void;
}

const TABS: LeaveTab[] = [
  "All Leaves",
  "Upcoming",
  "Pending",
  "Approved",
  "Rejected",
];

const parseDate = (date: string): Date | null => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const LeaveTableCards: React.FC<LeaveTableCardsProps> = ({
  data = [],
  onView,
}) => {
  const [activeTab, setActiveTab] = useState<LeaveTab>("All Leaves");
  const [pageSize, setPageSize] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const leaveData = Array.isArray(data) ? data : [];

  const filteredData = useMemo(() => {
    switch (activeTab) {
      case "Pending":
        return leaveData.filter((record) => record.status === "Pending");

      case "Approved":
        return leaveData.filter((record) => record.status === "Approved");

      case "Rejected":
        return leaveData.filter((record) => record.status === "Rejected");

      case "Upcoming": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return leaveData.filter((record) => {
          const date = parseDate(record.fromDate);
          return date !== null && date >= today;
        });
      }

      case "All Leaves":
      default:
        return leaveData;
    }
  }, [activeTab, leaveData]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(
    startIndex + pageSize,
    filteredData.length
  );

  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleTabChange = (tab: LeaveTab): void => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = Number(event.target.value);

    setPageSize(value > 0 ? value : 5);
    setCurrentPage(1);
  };

  const goToPage = (page: number): void => {
    const validPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(validPage);
  };

  const getTabIcon = (tab: LeaveTab): React.ReactNode => {
    switch (tab) {
      case "All Leaves":
        return <List size={15} strokeWidth={1.8} />;

      case "Upcoming":
        return <CalendarDays size={15} strokeWidth={1.8} />;

      case "Pending":
        return <Hourglass size={14} strokeWidth={1.8} />;

      case "Approved":
        return <CheckCircle2 size={15} strokeWidth={1.8} />;

      case "Rejected":
        return <XCircle size={15} strokeWidth={1.8} />;

      default:
        return null;
    }
  };

  const getLeaveTypeClass = (leaveType: string): string => {
    const normalized = String(leaveType ?? "")
      .trim()
      .toLowerCase();

    if (normalized.includes("paid")) {
      return "leave-type-badge--paid";
    }

    if (normalized.includes("casual")) {
      return "leave-type-badge--casual";
    }

    if (normalized.includes("comp")) {
      return "leave-type-badge--comp";
    }

    if (normalized === "lop") {
      return "leave-type-badge--casual";
    }

    return "leave-type-badge--casual";
  };

  return (
    <section className="leave-table-card">
      <div className="leave-table-toolbar">
        <div
          className="leave-table-tabs"
          role="tablist"
          aria-label="Leave filters"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`leave-table-tab ${
                activeTab === tab
                  ? "leave-table-tab--active"
                  : ""
              }`}
              onClick={() => handleTabChange(tab)}
            >
              <span
                className="leave-table-tab-icon"
                aria-hidden="true"
              >
                {getTabIcon(tab)}
              </span>

              <span>{tab}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="leave-table-filter-button"
          aria-label="Open leave filters"
        >
          <Filter
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>Filter</span>

          <ChevronDown
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="leave-table-content">
        <div className="leave-table-scroll">
          <table className="leave-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>No of Days</th>
                <th>Leave Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="leave-table-actions-heading">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="leave-table-date">
                        <CalendarDays
                          size={15}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />

                        <div>
                          <strong>{record.fromDate}</strong>
                          <span>{record.fromDay}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="leave-table-date">
                        <CalendarDays
                          size={15}
                          strokeWidth={1.7}
                          aria-hidden="true"
                        />

                        <div>
                          <strong>{record.toDate}</strong>
                          <span>{record.toDay}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="leave-table-days">
                        {record.numberOfDays}{" "}
                        {record.numberOfDays === 1
                          ? "Day"
                          : "Days"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`leave-type-badge ${getLeaveTypeClass(
                          record.leaveType
                        )}`}
                      >
                        {record.leaveType}
                      </span>
                    </td>

                    <td>
                      <span className="leave-table-reason">
                        {record.reason}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`leave-status-badge leave-status-badge--${String(
                          record.status
                        ).toLowerCase()}`}
                      >
                        <span
                          className="leave-status-dot"
                          aria-hidden="true"
                        />

                        {record.status}
                      </span>
                    </td>

                    <td>
                      <div className="leave-table-actions">
                        <button
                          type="button"
                          className="leave-table-action-button leave-table-view-button"
                          aria-label={`View leave request ${record.id}`}
                          title="View leave request"
                          onClick={() => onView?.(record)}
                        >
                          <Eye
                            size={16}
                            strokeWidth={1.8}
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
                    colSpan={7}
                    className="leave-table-empty"
                  >
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="leave-table-footer">
          <div className="leave-table-page-size">
            <span>Show</span>

            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Rows per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

            <span>entries</span>
          </div>

          <div className="leave-table-entry-info">
            Showing{" "}
            <strong>
              {filteredData.length === 0
                ? 0
                : startIndex + 1}
            </strong>{" "}
            to <strong>{endIndex}</strong> of{" "}
            <strong>{filteredData.length}</strong> entries
          </div>

          <div
            className="leave-table-pagination"
            aria-label="Leave table pagination"
          >
            <button
              type="button"
              className="leave-pagination-button"
              disabled={safeCurrentPage === 1}
              onClick={() => goToPage(safeCurrentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft
                size={15}
                strokeWidth={1.8}
              />
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 5)
              .map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`leave-pagination-button ${
                    safeCurrentPage === page
                      ? "leave-pagination-button--active"
                      : ""
                  }`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

            <button
              type="button"
              className="leave-pagination-button"
              disabled={safeCurrentPage === totalPages}
              onClick={() => goToPage(safeCurrentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight
                size={15}
                strokeWidth={1.8}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaveTableCards;