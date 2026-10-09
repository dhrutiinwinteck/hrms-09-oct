import React, {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import "./AdminPolicyFilters.css";

/* =========================================================
   TYPES
   ========================================================= */

export interface PolicyFilterState {
  search: string;
  status: string;
  createdBy: string;
  sortBy: string;
}

interface AdminPolicyFiltersProps {
  filters: PolicyFilterState;
  creators: string[];
  onChange: (
    filters: PolicyFilterState
  ) => void;
  onApply: () => void;
  onReset: () => void;
}

/* =========================================================
   COMPONENT
   ========================================================= */

const AdminPolicyFilters: React.FC<
  AdminPolicyFiltersProps
> = ({
  filters,
  creators,
  onChange,
  onApply,
  onReset,
}) => {
  /* =======================================================
     UPDATE SINGLE FILTER
     ======================================================= */

  const updateFilter = (
    field: keyof PolicyFilterState,
    value: string
  ): void => {
    const updatedFilters: PolicyFilterState = {
      ...filters,
      [field]: value,
    };

    onChange(updatedFilters);
  };

  /* =======================================================
     SEARCH CHANGE
     ======================================================= */

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    updateFilter(
      "search",
      event.target.value
    );
  };

  /* =======================================================
     STATUS CHANGE
     ======================================================= */

  const handleStatusChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    updateFilter(
      "status",
      event.target.value
    );
  };

  /* =======================================================
     CREATED BY CHANGE
     ======================================================= */

  const handleCreatedByChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    updateFilter(
      "createdBy",
      event.target.value
    );
  };

  /* =======================================================
     SORT CHANGE
     ======================================================= */

  const handleSortChange = (
    event: ChangeEvent<HTMLSelectElement>
  ): void => {
    updateFilter(
      "sortBy",
      event.target.value
    );
  };

  /* =======================================================
     APPLY FILTER
     ======================================================= */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {
    event.preventDefault();

    onApply();
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = (): void => {
    onReset();
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <form
      className="admin-policy-filters"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* ===============================================
          TOP BAR
          =============================================== */}

      <div className="admin-policy-filters__top">
        <div className="admin-policy-filters__section-title">
          Policy List
        </div>

        <div
          className="admin-policy-filters__advanced"
          aria-label="Policy filters"
        >
          <Filter
            size={16}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Advanced Filters
          </span>
        </div>
      </div>

      {/* ===============================================
          FILTER CONTROLS
          =============================================== */}

      <div className="admin-policy-filters__controls">
        {/* =============================================
            SEARCH
            ============================================= */}

        <div className="admin-policy-filters__search">
          <Search
            size={18}
            strokeWidth={1.8}
            className="admin-policy-filters__search-icon"
            aria-hidden="true"
          />

          <input
            id="admin-policy-search"
            name="search"
            type="search"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search policy name or description..."
            autoComplete="off"
            aria-label="Search policies"
          />
        </div>

        {/* =============================================
            STATUS
            ============================================= */}

        <div className="admin-policy-filters__field">
          <label htmlFor="policy-status">
            Status
          </label>

          <select
            id="policy-status"
            name="status"
            value={filters.status}
            onChange={handleStatusChange}
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>

        {/* =============================================
            CREATED BY
            ============================================= */}

        <div className="admin-policy-filters__field">
          <label htmlFor="policy-created-by">
            Created By
          </label>

          <select
            id="policy-created-by"
            name="createdBy"
            value={filters.createdBy}
            onChange={handleCreatedByChange}
          >
            <option value="all">
              All Users
            </option>

            {creators.map(
              (creator) => (
                <option
                  key={creator}
                  value={creator}
                >
                  {creator}
                </option>
              )
            )}
          </select>
        </div>

        {/* =============================================
            SORT BY
            ============================================= */}

        <div className="admin-policy-filters__field">
          <label htmlFor="policy-sort">
            Sort By
          </label>

          <select
            id="policy-sort"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            <option value="recent">
              Recently Updated
            </option>

            <option value="oldest">
              Oldest Updated
            </option>

            <option value="name-asc">
              Policy Name A-Z
            </option>

            <option value="name-desc">
              Policy Name Z-A
            </option>
          </select>
        </div>

        {/* =============================================
            ACTIONS
            ============================================= */}

        <div className="admin-policy-filters__actions">
          <button
            type="button"
            className="admin-policy-filters__reset"
            onClick={handleReset}
          >
            <RotateCcw
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Reset
            </span>
          </button>

          <button
            type="submit"
            className="admin-policy-filters__apply"
          >
            <Filter
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Apply Filter
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminPolicyFilters;