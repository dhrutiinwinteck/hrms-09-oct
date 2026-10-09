import React from "react";

import {
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  LoaderCircle,
  Search,
} from "lucide-react";

import "./MonthlyAttendanceFilters.css";

interface MonthlyAttendanceFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  employeeSearch: string;
  recordsPerPage: number;
  monthOptions: string[];
  yearOptions: string[];
  isSearching: boolean;

  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSearch: () => void;
  onEmployeeSearchChange: (value: string) => void;
  onRecordsPerPageChange: (value: number) => void;

  onDownloadSalarySheet: () => void;
  onDownloadAttendance: () => void;
  onDownloadSalaryBreakdown: () => void;
}

const MonthlyAttendanceFilters: React.FC<
  MonthlyAttendanceFiltersProps
> = ({
  selectedMonth,
  selectedYear,
  employeeSearch,
  recordsPerPage,
  monthOptions,
  yearOptions,
  isSearching,
  onMonthChange,
  onYearChange,
  onSearch,
  onEmployeeSearchChange,
  onRecordsPerPageChange,
  onDownloadSalarySheet,
  onDownloadAttendance,
  onDownloadSalaryBreakdown,
}) => {
  return (
    <div className="monthly-attendance-filters">
      {/* =====================================================
          FILTER ROW
          ===================================================== */}

      <div className="monthly-attendance-filters__primary">
        <div className="monthly-attendance-filters__fields">
          <label className="monthly-attendance-filter-field">
            <span className="monthly-attendance-filter-field__label">
              Month:
            </span>

            <span className="monthly-attendance-select">
              <CalendarDays
                className="monthly-attendance-select__icon"
                size={15}
                strokeWidth={1.8}
              />

              <select
                className="monthly-attendance-select__control"
                value={selectedMonth}
                onChange={(event) =>
                  onMonthChange(event.target.value)
                }
                aria-label="Select month"
              >
                {monthOptions.map((month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="monthly-attendance-select__arrow"
                size={14}
                strokeWidth={2}
              />
            </span>
          </label>

          <label className="monthly-attendance-filter-field">
            <span className="monthly-attendance-filter-field__label">
              Year:
            </span>

            <span className="monthly-attendance-select monthly-attendance-select--year">
              <CalendarDays
                className="monthly-attendance-select__icon"
                size={15}
                strokeWidth={1.8}
              />

              <select
                className="monthly-attendance-select__control"
                value={selectedYear}
                onChange={(event) =>
                  onYearChange(event.target.value)
                }
                aria-label="Select year"
              >
                {yearOptions.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="monthly-attendance-select__arrow"
                size={14}
                strokeWidth={2}
              />
            </span>
          </label>

          <button
            type="button"
            className="monthly-attendance-search-button"
            onClick={onSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <LoaderCircle
                className="monthly-attendance-search-button__spinner"
                size={15}
              />
            ) : (
              <Search
                size={15}
                strokeWidth={2.2}
              />
            )}

            <span>
              Search
            </span>
          </button>
        </div>

        <div className="monthly-attendance-filter-helper">
          <div className="monthly-attendance-filter-helper__graphic">
            <span />
            <span />
            <span />
          </div>

          <div className="monthly-attendance-filter-helper__text">
            <strong>
              Generate and download
            </strong>

            <small>
              salary reports with ease.
            </small>
          </div>
        </div>
      </div>

      {/* =====================================================
          DOWNLOAD ACTIONS
          ===================================================== */}

      <div className="monthly-attendance-downloads">
        <button
          type="button"
          className="monthly-attendance-download-button monthly-attendance-download-button--salary"
          onClick={onDownloadSalarySheet}
        >
          <FileSpreadsheet
            size={14}
            strokeWidth={2}
          />

          <span>
            Download Salary Sheet
          </span>
        </button>

        <button
          type="button"
          className="monthly-attendance-download-button monthly-attendance-download-button--attendance"
          onClick={onDownloadAttendance}
        >
          <FileSpreadsheet
            size={14}
            strokeWidth={2}
          />

          <span>
            Download Attendance
          </span>
        </button>

        <button
          type="button"
          className="monthly-attendance-download-button monthly-attendance-download-button--breakdown"
          onClick={onDownloadSalaryBreakdown}
        >
          <FileSpreadsheet
            size={14}
            strokeWidth={2}
          />

          <span>
            Download Salary Breakdown
          </span>
        </button>
      </div>

      {/* =====================================================
          TABLE CONTROLS
          ===================================================== */}

      <div className="monthly-attendance-record-controls">
        <div className="monthly-attendance-record-length">
          <span className="monthly-attendance-record-length__label">
            Show
          </span>

          <span className="monthly-attendance-record-select">
            <select
              value={recordsPerPage}
              onChange={(event) =>
                onRecordsPerPageChange(
                  Number(event.target.value),
                )
              }
              aria-label="Records per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <ChevronDown
              size={12}
              strokeWidth={2}
            />
          </span>

          <span className="monthly-attendance-record-length__label">
            records per page
          </span>
        </div>

        <label className="monthly-attendance-employee-search">
          <Search
            size={14}
            strokeWidth={2}
          />

          <input
            type="search"
            value={employeeSearch}
            onChange={(event) =>
              onEmployeeSearchChange(
                event.target.value,
              )
            }
            placeholder="Search Employee..."
            aria-label="Search employee"
          />
        </label>
      </div>
    </div>
  );
};

export default MonthlyAttendanceFilters;