import React from 'react';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { STATUS_OPTIONS } from '../../constants/shiftPatterns.constants';
import { ShiftPatternFilters } from '../../types/shiftPatterns.types';
import './ShiftPatternToolbar.css';

interface ShiftPatternToolbarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  statusFilter: ShiftPatternFilters['status'];
  onStatusFilter: (status: ShiftPatternFilters['status']) => void;
}

const ShiftPatternToolbar: React.FC<ShiftPatternToolbarProps> = ({
  searchTerm,
  onSearch,
  statusFilter,
  onStatusFilter,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusFilter(e.target.value as ShiftPatternFilters['status']);
  };

  return (
    <div className="shift-pattern-toolbar">
      <div className="toolbar-left">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search shift pattern..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="status-filter-wrapper">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="status-select"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="select-chevron" />
        </div>
      </div>
      <div className="toolbar-right">
        <button className="filter-btn" aria-label="Filter">
          <Filter size={18} />
        </button>
      </div>
    </div>
  );
};

export default ShiftPatternToolbar;