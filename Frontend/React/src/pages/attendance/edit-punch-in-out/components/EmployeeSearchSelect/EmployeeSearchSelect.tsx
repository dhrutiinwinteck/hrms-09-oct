// src/pages/attendance/edit-punch-in-out/components/EmployeeSearchSelect/EmployeeSearchSelect.tsx
import React, { useRef, useEffect, forwardRef } from 'react';
import { Users, ChevronDown, X } from 'lucide-react';
import { EmployeeOption } from '../../types/editPunchInOut.types';
import { UI_LABELS } from '../../constants/editPunchInOut.constants';
import './EmployeeSearchSelect.css';

interface EmployeeSearchSelectProps {
  selectedEmployee: EmployeeOption | null;
  searchText: string;
  isDropdownOpen: boolean;
  filteredEmployees: EmployeeOption[];
  onSelect: (employee: EmployeeOption) => void;
  onSearch: (text: string) => void;
  onClear: () => void;
  onToggle: () => void;
  error?: string;
}

export const EmployeeSearchSelect = forwardRef<HTMLDivElement, EmployeeSearchSelectProps>(({
  selectedEmployee,
  searchText,
  isDropdownOpen,
  filteredEmployees,
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
    if (e.key === 'Enter' && filteredEmployees.length === 1) {
      onSelect(filteredEmployees[0]);
    }
  };

  return (
    <div className="employee-search-select" ref={ref}>
      <label className="employee-search-select__label">
        {UI_LABELS.employee}
      </label>
      <div 
        className={`employee-search-select__control ${error ? 'employee-search-select__control--error' : ''}`}
        onClick={onToggle}
      >
        <div className="employee-search-select__control-inner">
          {selectedEmployee ? (
            <>
              <span className="employee-search-select__selected-value">
                {selectedEmployee.name}
              </span>
              <button
                className="employee-search-select__clear-btn"
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
              <Users size={18} className="employee-search-select__icon" />
              <input
                ref={inputRef}
                type="text"
                className="employee-search-select__input"
                placeholder={UI_LABELS.selectEmployee}
                value={searchText}
                onChange={(e) => onSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search employees"
                aria-expanded={isDropdownOpen}
                aria-autocomplete="list"
                autoComplete="off"
              />
            </>
          )}
          <ChevronDown 
            size={18} 
            className={`employee-search-select__chevron ${isDropdownOpen ? 'employee-search-select__chevron--open' : ''}`}
          />
        </div>
      </div>
      {error && (
        <div className="employee-search-select__error">{error}</div>
      )}
      {isDropdownOpen && (
        <div className="employee-search-select__dropdown">
          {filteredEmployees.length === 0 ? (
            <div className="employee-search-select__dropdown-empty">
              No employees found
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="employee-search-select__dropdown-item"
                onClick={() => onSelect(employee)}
                role="option"
                aria-selected={selectedEmployee?.id === employee.id}
              >
                <div className="employee-search-select__dropdown-item-name">
                  {employee.name}
                </div>
                {employee.department && (
                  <div className="employee-search-select__dropdown-item-department">
                    {employee.department}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
});

EmployeeSearchSelect.displayName = 'EmployeeSearchSelect';

export default EmployeeSearchSelect;