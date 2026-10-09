// src/pages/attendance/edit-punch-in-out/components/MonthSearchSelect/MonthSearchSelect.tsx
import React, { useRef, useEffect, forwardRef } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { MonthOption } from '../../types/editPunchInOut.types';
import { UI_LABELS } from '../../constants/editPunchInOut.constants';
import './MonthSearchSelect.css';

interface MonthSearchSelectProps {
  selectedMonth: MonthOption | null;
  searchText: string;
  isDropdownOpen: boolean;
  filteredMonths: MonthOption[];
  onSelect: (month: MonthOption) => void;
  onSearch: (text: string) => void;
  onClear: () => void;
  onToggle: () => void;
  error?: string;
}

export const MonthSearchSelect = forwardRef<HTMLDivElement, MonthSearchSelectProps>(({
  selectedMonth,
  searchText,
  isDropdownOpen,
  filteredMonths,
  onSelect,
  onSearch,
  onClear,
  onToggle,
  error,
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isDropdownOpen) {
      onToggle();
    }
    if (e.key === 'Enter' && filteredMonths.length === 1) {
      onSelect(filteredMonths[0]);
    }
  };

  return (
    <div className="month-search-select" ref={ref}>
      <label className="month-search-select__label">
        {UI_LABELS.month}
      </label>
      <div 
        className={`month-search-select__control ${error ? 'month-search-select__control--error' : ''}`}
        onClick={onToggle}
      >
        <div className="month-search-select__control-inner">
          {selectedMonth ? (
            <>
              <span className="month-search-select__selected-value">
                {selectedMonth.label}
              </span>
              <button
                className="month-search-select__clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <Calendar size={18} className="month-search-select__icon" />
              <input
                ref={inputRef}
                type="text"
                className="month-search-select__input"
                placeholder={UI_LABELS.selectMonth}
                value={searchText}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search months"
                aria-expanded={isDropdownOpen}
                aria-autocomplete="list"
                autoComplete="off"
              />
            </>
          )}
          <ChevronDown 
            size={18} 
            className={`month-search-select__chevron ${isDropdownOpen ? 'month-search-select__chevron--open' : ''}`}
          />
        </div>
      </div>
      {error && (
        <div className="month-search-select__error">{error}</div>
      )}
      {isDropdownOpen && (
        <div className="month-search-select__dropdown">
          {filteredMonths.length === 0 ? (
            <div className="month-search-select__dropdown-empty">
              No months found
            </div>
          ) : (
            filteredMonths.map((month) => (
              <div
                key={month.value}
                className="month-search-select__dropdown-item"
                onClick={() => onSelect(month)}
                role="option"
                aria-selected={selectedMonth?.value === month.value}
              >
                {month.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

MonthSearchSelect.displayName = 'MonthSearchSelect';

export default MonthSearchSelect;