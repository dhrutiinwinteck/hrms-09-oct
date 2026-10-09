import React from 'react';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from 'lucide-react';

import './ExpensesFilters.css';

interface ExpensesFiltersProps {
  search: string;
  pageSize: number;
  page: number;
  totalPages: number;
  totalFiltered: number;
  onSearchChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  onPageChange: (value: number) => void;
  onAddExpense: () => void;
}

interface SelectProps {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}

const EntriesSelect: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
}) => {
  return (
    <div className="expenses-select">
      <select
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        aria-label="Number of entries"
      >
        {options.map((option) => (
          <option
            value={option}
            key={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="expenses-select__icon"
      />
    </div>
  );
};

export const ExpensesFilters: React.FC<
  ExpensesFiltersProps
> = ({
  search,
  pageSize,
  page,
  totalPages,
  totalFiltered,
  onSearchChange,
  onPageSizeChange,
  onPageChange,
  onAddExpense,
}) => {
  return (
    <div className="expenses-toolbar">
      <div className="expenses-toolbar__left">
        <span className="expenses-toolbar__label">
          Show
        </span>

        <EntriesSelect
          value={pageSize}
          options={[10, 25, 50, 100]}
          onChange={onPageSizeChange}
        />

        <span className="expenses-toolbar__label">
          entries
        </span>
      </div>

      <div className="expenses-toolbar__right">
        <label className="expenses-search">
          <span className="expenses-search__label">
            Search:
          </span>

          <div className="expenses-search__input">
            <Search size={13} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search expenses..."
              aria-label="Search expenses"
            />
          </div>
        </label>

        <button
          type="button"
          className="expenses-add-button"
          onClick={onAddExpense}
        >
          <Plus size={15} strokeWidth={2.2} />
          <span>Add Expenses</span>
        </button>
      </div>

      <div className="expenses-toolbar__mobile-pagination">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <span
        className="expenses-toolbar__result-count"
        aria-live="polite"
      >
        {totalFiltered} result
        {totalFiltered === 1 ? '' : 's'}
      </span>
    </div>
  );
};

export default ExpensesFilters;