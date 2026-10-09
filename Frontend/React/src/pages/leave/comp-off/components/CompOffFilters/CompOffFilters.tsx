import {
  CalendarDays,
  Search,
  RotateCcw,
} from 'lucide-react';

import type {
  CompOffFilters as Filters,
} from '../../types/compOff.types';

interface CompOffFiltersProps {
  filters: Filters;
  onChange: (
    values: Partial<Filters>,
  ) => void;
  onReset: () => void;
}

const CompOffFilters = ({
  filters,
  onChange,
  onReset,
}: CompOffFiltersProps) => {
  return (
    <div className="comp-off-filter-panel">
      <div className="comp-off-tabs">
        {[
          ['ALL', 'All Requests'],
          ['PENDING', 'Pending'],
          ['APPROVED', 'Approved'],
          ['REJECTED', 'Rejected'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={
              filters.status === value ||
              (value === 'ALL' &&
                filters.status === 'ALL')
                ? 'active'
                : ''
            }
            onClick={() =>
              onChange({
                status:
                  value as Filters['status'],
              })
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="comp-off-filter-fields">
        <label>
          <span>Day Type</span>

          <select
            value={filters.dayType}
            onChange={(event) =>
              onChange({
                dayType:
                  event.target
                    .value as Filters['dayType'],
              })
            }
          >
            <option value="ALL">All</option>
            <option value="PUBLIC_HOLIDAY">
              Public Holiday
            </option>
            <option value="WEEK_OFF">
              Week Off
            </option>
          </select>
        </label>

        <label>
          <span>Status</span>

          <select
            value={filters.status}
            onChange={(event) =>
              onChange({
                status:
                  event.target
                    .value as Filters['status'],
              })
            }
          >
            <option value="ALL">All</option>
            <option value="PENDING">
              Pending
            </option>
            <option value="APPROVED">
              Approved
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </label>

        <label>
          <span>From Date</span>

          <div className="filter-date-input">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                onChange({
                  fromDate:
                    event.target.value,
                })
              }
            />
            <CalendarDays size={16} />
          </div>
        </label>

        <label>
          <span>To Date</span>

          <div className="filter-date-input">
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                onChange({
                  toDate:
                    event.target.value,
                })
              }
            />
            <CalendarDays size={16} />
          </div>
        </label>

        <label className="filter-search-field">
          <span>Search</span>

          <div className="filter-search-input">
            <Search size={16} />

            <input
              type="text"
              placeholder="Search by reason or date..."
              value={filters.search}
              onChange={(event) =>
                onChange({
                  search:
                    event.target.value,
                })
              }
            />
          </div>
        </label>

        <button
          type="button"
          className="comp-off-search-button"
          onClick={() =>
            onChange({
              search: filters.search,
            })
          }
        >
          Search
        </button>

        <button
          type="button"
          className="comp-off-reset-button"
          onClick={onReset}
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </div>
  );
};

export default CompOffFilters;