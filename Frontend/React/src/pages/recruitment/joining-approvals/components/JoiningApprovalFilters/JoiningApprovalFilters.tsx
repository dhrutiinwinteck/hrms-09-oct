import React, { useState } from 'react';

import {
  Filter,
  RotateCcw,
  Calendar,
  ChevronDown,
} from 'lucide-react';

import {
  LOCATIONS,
} from '../../constants/joiningApprovals.constants';

import {
  JoiningApprovalFilters as FiltersType,
} from '../../types/joiningApprovals.types';

import type {
  IDesignation,
} from '../../../types/application.types';

import './JoiningApprovalFilters.css';

interface FiltersProps {
  filters: FiltersType;

  departments: string[];

  designations: IDesignation[];

  onApply: (
    filters: FiltersType
  ) => void;

  onReset: () => void;
}

export const JoiningApprovalFilters: React.FC<
  FiltersProps
> = ({
  filters,
  departments,
  designations,
  onApply,
  onReset,
}) => {
  const [
    department,
    setDepartment,
  ] = useState<string>(
    filters.department ||
      'All Departments'
  );

  const [
    designation,
    setDesignation,
  ] = useState<string>(
    filters.designation ||
      'All Designations'
  );

  const [
    location,
    setLocation,
  ] = useState<string>(
    filters.location ||
      'All Locations'
  );

  const [
    dateRange,
    setDateRange,
  ] = useState<string>(
    '01 May 2025 - 31 May 2025'
  );

  const handleApply = (): void => {
    onApply({
      department:
        department !==
        'All Departments'
          ? department
          : undefined,

      designation:
        designation !==
        'All Designations'
          ? designation
          : undefined,

      location:
        location !==
        'All Locations'
          ? location
          : undefined,
    });
  };

  const handleReset = (): void => {
    setDepartment(
      'All Departments'
    );

    setDesignation(
      'All Designations'
    );

    setLocation(
      'All Locations'
    );

    setDateRange(
      '01 May 2025 - 31 May 2025'
    );

    onReset();
  };

  return (
    <section
      className="joining-approval-filters"
      aria-label="Joining approval filters"
    >
      <div className="joining-approval-filters__fields">
        {/* Department */}
        <div className="joining-approval-filter-group">
          <label
            htmlFor="joining-approval-department"
            className="joining-approval-filter-label"
          >
            Department
          </label>

          <div className="joining-approval-select-wrapper">
            <select
              id="joining-approval-department"
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value
                )
              }
              aria-label="Department"
            >
              <option>
                All Departments
              </option>

             {departments.map(
  department => (
    <option
      key={department}
      value={department}
    >
      {department}
    </option>
  ),
)}
            </select>

            <ChevronDown
              className="joining-approval-select-icon"
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Designation */}
        <div className="joining-approval-filter-group">
          <label
            htmlFor="joining-approval-designation"
            className="joining-approval-filter-label"
          >
            Designation
          </label>

          <div className="joining-approval-select-wrapper">
            <select
              id="joining-approval-designation"
              value={designation}
              onChange={(event) =>
                setDesignation(
                  event.target.value
                )
              }
              aria-label="Designation"
            >
              <option>
                All Designations
              </option>

              {designations.map(
  designation => (
    <option
      key={designation.id}
      value={designation.name}
    >
      {designation.name}
    </option>
  ),
)}
            </select>

            <ChevronDown
              className="joining-approval-select-icon"
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Location */}
        <div className="joining-approval-filter-group">
          <label
            htmlFor="joining-approval-location"
            className="joining-approval-filter-label"
          >
            Location
          </label>

          <div className="joining-approval-select-wrapper">
            <select
              id="joining-approval-location"
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              aria-label="Location"
            >
              <option>
                All Locations
              </option>

              {LOCATIONS.map(
                (loc) => (
                  <option
                    key={loc}
                    value={loc}
                  >
                    {loc}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              className="joining-approval-select-icon"
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="joining-approval-filter-group joining-approval-filter-group--date">
          <label
            htmlFor="joining-approval-date-range"
            className="joining-approval-filter-label"
          >
            Date Range
          </label>

          <div className="joining-approval-date-input">
            <Calendar
              size={15}
              strokeWidth={2}
              className="joining-approval-calendar-icon"
              aria-hidden="true"
            />

            <input
              id="joining-approval-date-range"
              type="text"
              value={dateRange}
              onChange={(event) =>
                setDateRange(
                  event.target.value
                )
              }
              placeholder="Select date range"
              aria-label="Date range"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="joining-approval-filter-actions">
        <button
          type="button"
          className="joining-approval-filter-button joining-approval-filter-button--primary"
          onClick={handleApply}
        >
          <Filter
            size={16}
            strokeWidth={2.3}
            aria-hidden="true"
          />

          <span>Filter</span>
        </button>

        <button
          type="button"
          className="joining-approval-filter-button joining-approval-filter-button--secondary"
          onClick={handleReset}
        >
          <RotateCcw
            size={15}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>Reset</span>
        </button>
      </div>
    </section>
  );
};