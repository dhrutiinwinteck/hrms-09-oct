// src/pages/attendance/edit-punch-in-out/components/EditPunchInOutFilters/EditPunchInOutFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { EmployeeSearchSelect } from '../EmployeeSearchSelect/EmployeeSearchSelect';
import { MonthSearchSelect } from '../MonthSearchSelect/MonthSearchSelect';
import { UI_LABELS } from '../../constants/editPunchInOut.constants';
import './EditPunchInOutFilters.css';

interface EditPunchInOutFiltersProps {
  // Employee props
  selectedEmployee: any;
  employeeSearchText: string;
  isEmployeeDropdownOpen: boolean;
  filteredEmployees: any[];
  onEmployeeSelect: (employee: any) => void;
  onEmployeeSearch: (text: string) => void;
  onEmployeeClear: () => void;
  onEmployeeToggle: () => void;
  employeeRef: React.RefObject<HTMLDivElement>;
  employeeError?: string;
  
  // Month props
  selectedMonth: any;
  monthSearchText: string;
  isMonthDropdownOpen: boolean;
  filteredMonths: any[];
  onMonthSelect: (month: any) => void;
  onMonthSearch: (text: string) => void;
  onMonthClear: () => void;
  onMonthToggle: () => void;
  monthRef: React.RefObject<HTMLDivElement>;
  monthError?: string;
  
  // Search props
  onSearch: () => void;
  isLoading: boolean;
}

export const EditPunchInOutFilters: React.FC<EditPunchInOutFiltersProps> = ({
  selectedEmployee,
  employeeSearchText,
  isEmployeeDropdownOpen,
  filteredEmployees,
  onEmployeeSelect,
  onEmployeeSearch,
  onEmployeeClear,
  onEmployeeToggle,
  employeeRef,
  employeeError,
  selectedMonth,
  monthSearchText,
  isMonthDropdownOpen,
  filteredMonths,
  onMonthSelect,
  onMonthSearch,
  onMonthClear,
  onMonthToggle,
  monthRef,
  monthError,
  onSearch,
  isLoading,
}) => {
  return (
    <div className="edit-punch-in-out-filters">
      <div className="edit-punch-in-out-filters__grid">
        <div className="edit-punch-in-out-filters__field">
          <EmployeeSearchSelect
            ref={employeeRef}
            selectedEmployee={selectedEmployee}
            searchText={employeeSearchText}
            isDropdownOpen={isEmployeeDropdownOpen}
            filteredEmployees={filteredEmployees}
            onSelect={onEmployeeSelect}
            onSearch={onEmployeeSearch}
            onClear={onEmployeeClear}
            onToggle={onEmployeeToggle}
            error={employeeError}
          />
        </div>
        
        <div className="edit-punch-in-out-filters__field">
          <MonthSearchSelect
            ref={monthRef}
            selectedMonth={selectedMonth}
            searchText={monthSearchText}
            isDropdownOpen={isMonthDropdownOpen}
            filteredMonths={filteredMonths}
            onSelect={onMonthSelect}
            onSearch={onMonthSearch}
            onClear={onMonthClear}
            onToggle={onMonthToggle}
            error={monthError}
          />
        </div>
        
        <div className="edit-punch-in-out-filters__action">
          <button
            className="edit-punch-in-out-filters__search-btn"
            onClick={onSearch}
            disabled={isLoading}
          >
            <Search size={18} className="edit-punch-in-out-filters__search-icon" />
            {UI_LABELS.search}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPunchInOutFilters;