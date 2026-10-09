import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";

import "./DepartmentFilter.css";

export type DepartmentStatus =
  | "All Status"
  | "Active"
  | "Inactive";

export interface DepartmentFilterProps {
  searchValue?: string;
  statusValue?: DepartmentStatus;

  onSearch?: (value: string) => void;
  onStatusChange?: (value: DepartmentStatus) => void;

  placeholder?: string;
  disabled?: boolean;
}

const DepartmentFilter: React.FC<
  DepartmentFilterProps
> = ({
  searchValue = "",
  statusValue = "All Status",
  onSearch,
  onStatusChange,
  placeholder = "Search department...",
  disabled = false,
}) => {
  const [search, setSearch] = useState<string>(
    searchValue,
  );

  useEffect(() => {
    setSearch(searchValue);
  }, [searchValue]);

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = event.target.value;

    setSearch(value);

    onSearch?.(value);
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value =
      event.target.value as DepartmentStatus;

    onStatusChange?.(value);
  };

  const handleReset = (): void => {
    setSearch("");

    onSearch?.("");

    onStatusChange?.("All Status");
  };

  return (
    <section
      className="department-filter"
      aria-label="Department filters"
    >
      <div className="department-filter-controls">

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="department-search-wrapper">
          <label
            htmlFor="department-search"
            className="department-filter-label"
          >
            Search department
          </label>

          <input
            id="department-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="department-search-input"
            autoComplete="off"
            disabled={disabled}
          />

          <Search
            className="department-search-icon"
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        {/* ==================================================
            STATUS
        ================================================== */}

        <div className="department-status-wrapper">
          <label
            htmlFor="department-status"
            className="department-filter-label"
          >
            Department status
          </label>

          <select
            id="department-status"
            value={statusValue}
            onChange={handleStatusChange}
            className="department-status-select"
            disabled={disabled}
          >
            <option value="All Status">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <ChevronDown
            className="department-status-icon"
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        {/* ==================================================
            RESET
        ================================================== */}

        <button
          type="button"
          className="department-reset-button"
          onClick={handleReset}
          disabled={disabled}
          aria-label="Reset department filters"
          title="Reset filters"
         >
          <RotateCcw
            className="department-reset-icon"
            size={14}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span>Reset</span>
        </button>
      </div>
    </section>
  );
};

export default DepartmentFilter;