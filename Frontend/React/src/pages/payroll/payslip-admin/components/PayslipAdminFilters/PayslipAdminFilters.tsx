import React from 'react';

import {
  ChevronDown,
  Search,
} from 'lucide-react';

import {
  PAYSLIP_PAGE_SIZE_OPTIONS,
} from '../../constants/payslipAdmin.constants';

import './PayslipAdminFilters.css';

interface PayslipAdminFiltersProps {
  pageSize: number;
  search: string;
  onPageSizeChange: (value: number) => void;
  onSearchChange: (value: string) => void;
}

export const PayslipAdminFilters: React.FC<
  PayslipAdminFiltersProps
> = ({
  pageSize,
  search,
  onPageSizeChange,
  onSearchChange,
}) => {
  return (
    <div className="payslip-admin-filters">
      <div className="payslip-admin-filters__entries">
        <span className="payslip-admin-filters__label">
          Show
        </span>

        <div className="payslip-admin-filters__select-wrapper">
          <select
            className="payslip-admin-filters__select"
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(
                Number(event.target.value),
              )
            }
            aria-label="Entries per page"
          >
            {PAYSLIP_PAGE_SIZE_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ),
            )}
          </select>

          <ChevronDown
            size={15}
            className="payslip-admin-filters__select-icon"
          />
        </div>

        <span className="payslip-admin-filters__label">
          entries
        </span>
      </div>

      <label className="payslip-admin-filters__search">
        <Search
          size={17}
          className="payslip-admin-filters__search-icon"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search..."
          aria-label="Search payslips"
        />
      </label>
    </div>
  );
};