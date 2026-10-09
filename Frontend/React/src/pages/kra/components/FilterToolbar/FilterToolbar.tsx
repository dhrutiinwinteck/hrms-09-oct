import React, {
  useMemo,
  useState,
} from "react";

import {
  Search,
  Plus,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

import "./FilterToolbar.css";

/* =========================================================
   TYPES
   ========================================================= */

export interface KraFilterParams {
  department: string;
  designation: string;
}

export interface DepartmentFilterOption {
  id: number;
  name: string;
}

export interface DesignationFilterOption {
  id: number;
  name: string;
  depart_id: number;
  department_name?: string | null;
}

export interface FilterToolbarProps {
  onAddClick: () => void;
  onSearch: (params: KraFilterParams) => void;
  onReset: () => void;

  departmentOptions: DepartmentFilterOption[];
  designationOptions: DesignationFilterOption[];
}

interface FilterState {
  department: string;
  designation: string;
}

const INITIAL_FILTERS: FilterState = {
  department: "",
  designation: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeText = (
  value: unknown,
): string => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const createUniqueDepartments = (
  options: DepartmentFilterOption[],
): DepartmentFilterOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  const unique = new Map<
    string,
    DepartmentFilterOption
  >();

  options.forEach((option) => {
    const name = String(
      option?.name ?? "",
    ).trim();

    if (!name) {
      return;
    }

    const id = Number(option.id);

    if (!Number.isFinite(id)) {
      return;
    }

    const key = name.toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, {
        id,
        name,
      });
    }
  });

  return Array.from(unique.values());
};

const createUniqueDesignations = (
  options: DesignationFilterOption[],
): DesignationFilterOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  const unique = new Map<
    string,
    DesignationFilterOption
  >();

  options.forEach((option) => {
    const name = String(
      option?.name ?? "",
    ).trim();

    if (!name) {
      return;
    }

    const id = Number(option.id);
    const departId = Number(
      option.depart_id,
    );

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(departId)
    ) {
      return;
    }

    const key =
      `${departId}-${name.toLowerCase()}`;

    if (!unique.has(key)) {
      unique.set(key, {
        id,
        name,
        depart_id: departId,
        department_name:
          option.department_name ?? null,
      });
    }
  });

  return Array.from(unique.values());
};

/* =========================================================
   COMPONENT
   ========================================================= */

const FilterToolbar: React.FC<
  FilterToolbarProps
> = ({
  onAddClick,
  onSearch,
  onReset,
  departmentOptions,
  designationOptions,
}) => {
  const [filters, setFilters] =
    useState<FilterState>(
      INITIAL_FILTERS,
    );

  /* =======================================================
     DEPARTMENT OPTIONS
     ======================================================= */

  const safeDepartmentOptions =
    useMemo(
      () =>
        createUniqueDepartments(
          departmentOptions,
        ),
      [departmentOptions],
    );

  /* =======================================================
     DESIGNATION OPTIONS
     ======================================================= */

  const safeDesignationOptions =
    useMemo(
      () =>
        createUniqueDesignations(
          designationOptions,
        ),
      [designationOptions],
    );

  /* =======================================================
     FILTER DESIGNATIONS BY DEPARTMENT
     ======================================================= */

  const filteredDesignationOptions =
    useMemo(() => {
      const selectedDepartment =
        safeDepartmentOptions.find(
          (department) =>
            normalizeText(
              department.name,
            ) ===
            normalizeText(
              filters.department,
            ),
        );

      if (!selectedDepartment) {
        return safeDesignationOptions;
      }

      return safeDesignationOptions.filter(
        (designation) =>
          Number(
            designation.depart_id,
          ) ===
          Number(
            selectedDepartment.id,
          ),
      );
    }, [
      filters.department,
      safeDepartmentOptions,
      safeDesignationOptions,
    ]);

  /* =======================================================
     FILTER CHANGE
     ======================================================= */

  const handleFilterChange = (
    field: keyof FilterState,
    value: string,
  ): void => {
    const normalizedValue =
      value.trim();

    setFilters((previous) => {
      if (field === "department") {
        return {
          department: normalizedValue,
          designation: "",
        };
      }

      return {
        ...previous,
        designation:
          normalizedValue,
      };
    });
  };

  /* =======================================================
     SEARCH
     ======================================================= */

  const handleSearch = (): void => {
    onSearch({
      department:
        filters.department.trim(),
      designation:
        filters.designation.trim(),
    });
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset = (): void => {
    setFilters(
      INITIAL_FILTERS,
    );

    onReset();
  };

  /* =======================================================
     KEYBOARD SEARCH
     ======================================================= */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ): void => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    handleSearch();
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      className="filter-toolbar"
      aria-label="KRA filters"
      onKeyDown={handleKeyDown}
    >
      <div className="filter-left">

        {/* =================================================
            DEPARTMENT
            ================================================= */}

        <div className="filter-group">
          <label
            htmlFor="kra-department-filter"
          >
            Department
          </label>

          <div className="filter-select-wrapper">
            <select
              id="kra-department-filter"
              name="department"
              className="filter-select"
              value={
                filters.department
              }
              onChange={(event) =>
                handleFilterChange(
                  "department",
                  event.target.value,
                )
              }
            >
              <option value="">
                All Departments
              </option>

              {safeDepartmentOptions.map(
                (department) => (
                  <option
                    key={department.id}
                    value={department.name}
                  >
                    {department.name}
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              className="filter-select-icon"
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* =================================================
            DESIGNATION
            ================================================= */}

        <div className="filter-group">
          <label
            htmlFor="kra-designation-filter"
          >
            Designation
          </label>

          <div className="filter-select-wrapper">
            <select
              id="kra-designation-filter"
              name="designation"
              className="filter-select"
              value={
                filters.designation
              }
              onChange={(event) =>
                handleFilterChange(
                  "designation",
                  event.target.value,
                )
              }
            >
              <option value="">
                All Designations
              </option>

              {filteredDesignationOptions.map(
                (designation) => (
                  <option
                    key={`${designation.depart_id}-${designation.id}`}
                    value={designation.name}
                  >
                    {designation.name}
                  </option>
                ),
              )}
            </select>

            <ChevronDown
              className="filter-select-icon"
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* =================================================
            SEARCH / RESET
            ================================================= */}

        <div className="filter-actions">
          <button
            type="button"
            className="filter-btn filter-btn-search"
            onClick={handleSearch}
            aria-label="Search KRA records"
          >
            <Search
              size={14}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>
              Search
            </span>
          </button>

          <button
            type="button"
            className="filter-btn filter-btn-reset"
            onClick={handleReset}
            aria-label="Reset KRA filters"
          >
            <RotateCcw
              size={13}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>
              Reset
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================
          ADD KRA
          =================================================== */}

      <div className="filter-right">
        <button
          type="button"
          className="filter-btn-add"
          onClick={onAddClick}
          aria-label="Add KRA"
        >
          <Plus
            size={15}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>
            Add KRA
          </span>
        </button>
      </div>
    </section>
  );
};

export default FilterToolbar;

