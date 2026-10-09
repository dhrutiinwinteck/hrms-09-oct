// src/pages/attendance/attendance-history/components/AttendanceHistoryFilters/AttendanceHistoryFilters.tsx

import React from 'react';
import { SlidersHorizontal, CalendarDays, ChevronDown, Clock3, FileSpreadsheet } from 'lucide-react';
import { MonthOption, AVAILABLE_MONTHS } from '../../constants/attendanceHistory.constants';
import './AttendanceHistoryFilters.css';

interface AttendanceHistoryFiltersProps {
  selectedMonth: MonthOption;
  onMonthChange: (month: MonthOption) => void;
  onCalculateLateMarks: () => void;
  onExport: () => void;
  loading?: boolean;
}

export const AttendanceHistoryFilters: React.FC<AttendanceHistoryFiltersProps> = ({
  selectedMonth,
  onMonthChange,
  onCalculateLateMarks,
  onExport,
  loading = false
}) => {
  return (
    <div className="attendance-history-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <SlidersHorizontal size={16} className="filters-icon" />
      </div>
      
      <div className="filters-group">
        <label className="filter-label">Select Month</label>
        <div className="month-selector-wrapper">
          <CalendarDays size={16} className="selector-icon" />
          <select 
            value={selectedMonth.value}
            onChange={(e) => {
              const selected = AVAILABLE_MONTHS.find(m => m.value === e.target.value);
              if (selected) onMonthChange(selected);
            }}
            className="filter-select"
          >
            {AVAILABLE_MONTHS.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="selector-chevron" />
        </div>
      </div>
      
      <div className="filters-actions">
        <button 
          className="filter-btn-calculate"
          onClick={onCalculateLateMarks}
          disabled={loading}
        >
          <Clock3 size={16} />
          Calculate Late Marks
        </button>
        
        <button 
          className="filter-btn-export"
          onClick={onExport}
          disabled={loading}
        >
          <FileSpreadsheet size={16} />
          Export to Excel
        </button>
      </div>
    </div>
  );
};