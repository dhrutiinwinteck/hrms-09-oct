import React from "react";
import {
  RotateCcw,
  Search,
} from "lucide-react";

import "./LeaveEmployeesFilters.css";

/* =========================================================
   TYPES
   ========================================================= */

export interface LeaveEmployeesFilterValues {
  leaveStatus: string;
  search: string;
  entries: number;
}

export interface LeaveEmployeesFiltersProps {
  filters: LeaveEmployeesFilterValues;

  onLeaveStatusChange: (
    value: string,
  ) => void;

  onSearchChange: (
    value: string,
  ) => void;

  onEntriesChange: (
    value: number,
  ) => void;

  onSearch: () => void;

  onFilterClick: () => void;
}

/* =========================================================
   STATUS OPTIONS
   ========================================================= */

const STATUS_OPTIONS = [
  {
    value: "",
    label: "-- Select --",
  },
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "Approved",
    label: "Approved",
  },
  {
    value: "Rejected",
    label: "Rejected",
  },
  // {
  //   value: "Cancelled",
  //   label: "Cancelled",
  // },
];

/* =========================================================
   COMPONENT
   ========================================================= */

const LeaveEmployeesFilters: React.FC<
  LeaveEmployeesFiltersProps
> = ({
  filters,
  onLeaveStatusChange,
  onSearchChange,
  onSearch,
  onFilterClick,
}) => {

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    onSearch();
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="leave-employees-filters">

      <form
        className="leave-employees-filters__primary"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            LEAVE STATUS
            ================================================= */}

        <div className="leave-employees-filters__status-field">

          <label
            htmlFor="leave-status"
            className="leave-employees-filters__label"
          >
            Leave Status
          </label>

          <select
            id="leave-status"
            value={
              filters.leaveStatus
            }
            onChange={(
              event,
            ) => {
              onLeaveStatusChange(
                event.target.value,
              );
            }}
            className="leave-employees-filters__select"
          >

            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}

          </select>

        </div>

        {/* =================================================
            SEARCH BUTTON
            ================================================= */}

        <button
          type="submit"
          className="leave-employees-filters__search-button"
        >

          <Search
            size={17}
            strokeWidth={2.4}
          />

          <span>
            Search
          </span>

        </button>

        {/* =================================================
            TABLE SEARCH
            ================================================= */}

        <div className="leave-employees-filters__search-field">

          <label
            htmlFor="leave-table-search"
            className="leave-employees-filters__search-label"
          >
            Search:
          </label>

          <div className="leave-employees-filters__search-input-wrapper">

            <Search
              size={16}
              strokeWidth={2}
              className="leave-employees-filters__search-icon"
            />

            <input
              id="leave-table-search"
              type="search"
              value={
                filters.search
              }
              onChange={(
                event,
              ) => {
                onSearchChange(
                  event.target.value,
                );
              }}
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();
                  onSearch();
                }
              }}
              placeholder="Search..."
              className="leave-employees-filters__search-input"
              autoComplete="off"
              aria-label="Search leave records"
            />

          </div>

        </div>

        {/* =================================================
            RESET

            ALWAYS VISIBLE
            ================================================= */}

        <button
          type="button"
          className="leave-employees-filters__reset-button"
          onClick={
            onFilterClick
          }
          title="Reset filters"
          aria-label="Reset filters"
        >

          <RotateCcw
            size={15}
            strokeWidth={2}
          />

          <span>
            Reset
          </span>

        </button>

      </form>

    </div>
  );
};

export default LeaveEmployeesFilters;