import {
  useState,
  type ChangeEvent,
  type FC,
} from "react";

import {
  ChevronDown,
  RotateCcw,
  Search,
} from "lucide-react";

import "./DesignationFilter.css";

export interface DesignationFilterProps {
  onSearch?: (value: string) => void;
  onDepartmentChange?: (
    value: string,
  ) => void;
  onStatusChange?: (
    value: string,
  ) => void;
  onReset?: () => void;
}

const departments = [
  "All Departments",
  "Human Resource",
  "Operations",
  "Top Management",
  "Finance",
  "IT",
];

const statuses = [
  "All Status",
  "Active",
  "Inactive",
];

export const DesignationFilter: FC<
  DesignationFilterProps
> = ({
  onSearch,
  onDepartmentChange,
  onStatusChange,
  onReset,
}) => {
  const [search, setSearch] =
    useState<string>("");

  const [department, setDepartment] =
    useState<string>("All Departments");

  const [status, setStatus] =
    useState<string>("All Status");

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = event.target.value;

    setSearch(value);
    onSearch?.(value);
  };

  const handleDepartmentChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value = event.target.value;

    setDepartment(value);
    onDepartmentChange?.(value);
  };

  const handleStatusChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value = event.target.value;

    setStatus(value);
    onStatusChange?.(value);
  };

  const handleReset = (): void => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");

    onReset?.();
  };

  return (
    <section
      className="designation-filter"
      aria-label="Designation filters"
    >
      {/* SEARCH */}

      <div className="designation-filter__search">
        <Search
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <input
          type="text"
          value={search}
          placeholder="Search designation..."
          onChange={handleSearchChange}
          aria-label="Search designation"
        />
      </div>

      {/* DEPARTMENT */}

      <div className="designation-filter__select">
        <select
          value={department}
          onChange={handleDepartmentChange}
          aria-label="Filter by department"
        >
          {departments.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          className="designation-filter__select-icon"
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      {/* STATUS */}

      <div className="designation-filter__select">
        <select
          value={status}
          onChange={handleStatusChange}
          aria-label="Filter by status"
        >
          {statuses.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <ChevronDown
          className="designation-filter__select-icon"
          size={16}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      {/* RESET */}

      <button
        type="button"
        className="designation-filter__reset"
        onClick={handleReset}
      >
        <RotateCcw
          size={15}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span>Reset</span>
      </button>
    </section>
  );
};

export default DesignationFilter;