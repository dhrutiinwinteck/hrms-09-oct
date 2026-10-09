import React, {
  useCallback,
  useState,
} from 'react';

import {
  MONTHS,
  YEARS,
} from "../../constants/kraConstants";

import {
  Download,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import './KraManagementFilters.css';

export interface KraManagementFilterValues {
  search: string;
  year: string;
  selectedYear: string;
  fromMonth: string;
  toMonth: string;
}

interface KraManagementFiltersProps {
  onFilterChange?: (
    filters: KraManagementFilterValues,
  ) => void;

  onDownloadExcel?: () => void;
}







export const INITIAL_KRA_MANAGEMENT_FILTERS:
  KraManagementFilterValues = {
    search: '',
    year: '',
    selectedYear: '',
    fromMonth: '',
    toMonth: '',
  };

const KraManagementFilters: React.FC<
  KraManagementFiltersProps
> = ({
  onFilterChange,
  onDownloadExcel,
}) => {
  const [filters, setFilters] =
    useState<KraManagementFilterValues>(
      INITIAL_KRA_MANAGEMENT_FILTERS,
    );

  const updateFilter = useCallback(
    (
      field: keyof KraManagementFilterValues,
      value: string,
    ): void => {
      setFilters((previousFilters) => {
        const updatedFilters: KraManagementFilterValues = {
          ...previousFilters,
          [field]: value,
        };

        onFilterChange?.(updatedFilters);

        return updatedFilters;
      });
    },
    [onFilterChange],
  );

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    updateFilter(
      'search',
      event.target.value,
    );
  };

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const { name, value } =
      event.target;

    if (
      name !== 'year' &&
      name !== 'selectedYear' &&
      name !== 'fromMonth' &&
      name !== 'toMonth'
    ) {
      return;
    }

    updateFilter(
      name,
      value,
    );
  };

  const handleDownload = (): void => {
    onDownloadExcel?.();
  };

  return (
    <section
      className="kra-management-filters"
      aria-labelledby="kra-management-filter-title"
    >
      <div
        className="kra-management-filter-decoration"
        aria-hidden="true"
      >
        {Array.from({ length: 20 }).map(
          (_, index) => (
            <span key={index} />
          ),
        )}
      </div>

      <div className="kra-management-filter-heading">
        <div className="kra-management-filter-heading-icon">
          <SlidersHorizontal
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <h2 id="kra-management-filter-title">
          Search &amp; Filters
        </h2>
      </div>

      <div className="kra-management-filter-grid">
        <div className="kra-management-filter-field kra-management-filter-search">
          <label htmlFor="kra-management-search">
            Search
          </label>

          <div className="kra-management-search-wrapper">
            <input
              id="kra-management-search"
              type="search"
              name="search"
              value={filters.search}
              placeholder="Search by name, designation, month, year..."
              autoComplete="off"
              onChange={handleSearchChange}
            />

            <Search
              className="kra-management-search-icon"
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="kra-management-filter-field kra-management-filter-year">
          <label htmlFor="kra-management-year">
            Year
          </label>

          <select
  id="kra-management-year"
  name="year"
  value={filters.year}
  onChange={(event) =>
    updateFilter(
      "year",
      event.target.value,
    )
  }
>
  <option value="">
    All Years
  </option>

  {YEARS.map(
    (year) => (
      <option
        key={year}
        value={year}
      >
        {year}
      </option>
    ),
  )}
</select>
        </div>

        <div className="kra-management-filter-field kra-management-filter-select-year">
          <label htmlFor="kra-management-selected-year">
            Select Year
          </label>

         <select
  id="kra-management-selected-year"
  name="selectedYear"
  value={filters.selectedYear}
  onChange={(event) =>
    updateFilter(
      "selectedYear",
      event.target.value,
    )
  }
>
  <option value="">
    Select Year
  </option>

  {YEARS.map(
    (year) => (
      <option
        key={year}
        value={year}
      >
        {year}
      </option>
    ),
  )}
</select>
        </div>

        <div className="kra-management-filter-field kra-management-filter-from">
          <label htmlFor="kra-management-from-month">
            From Month
          </label>

          <select
            id="kra-management-from-month"
            name="fromMonth"
            value={filters.fromMonth}
            onChange={handleSelectChange}
          >
            <option value="">
              From Month
            </option>

           {MONTHS.map(
  (month) => (
    <option
      key={month}
      value={month}
    >
      {month}
    </option>
  ),
)}
          </select>
        </div>

        <div className="kra-management-filter-field kra-management-filter-to">
          <label htmlFor="kra-management-to-month">
            To Month
          </label>

          <select
            id="kra-management-to-month"
            name="toMonth"
            value={filters.toMonth}
            onChange={handleSelectChange}
          >
            <option value="">
              To Month
            </option>

           {MONTHS.map(
  (month) => (
    <option
      key={month}
      value={month}
    >
      {month}
    </option>
  ),
)}
          </select>
        </div>

        <div className="kra-management-filter-download">
          <button
            type="button"
            className="kra-management-download-button"
            onClick={handleDownload}
          >
            <Download
              size={17}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>
              Download Excel
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default KraManagementFilters;