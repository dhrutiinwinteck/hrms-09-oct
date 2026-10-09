import React, { useState, useCallback } from 'react';
import { Calendar, FileText, LayoutGrid, ChevronDown } from 'lucide-react';
import './FilterBar.css';

export interface FilterBarProps {
  statusOptions: { label: string; value: string }[];
  departmentOptions: { label: string; value: string }[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export interface FilterState {
  status: string;
  department: string;
  dateRange: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  statusOptions,
  departmentOptions,
  onFilterChange,
  onReset,
}) => {
  const [status, setStatus] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  // We can keep this mock string for the UI demo, while ignoring it in actual filtering
  const [dateRange, setDateRange] = useState<string>('01 May 2024 – 31 May 2024');

  const handleApply = () => {
    onFilterChange({
      status,
      department,
      dateRange,
    });
  };

  const handleReset = useCallback(() => {
    setStatus('');
    setDepartment('');
    setDateRange('01 May 2024 – 31 May 2024');
    onReset();
  }, [onReset]);

  return (
    <div className="fb-container">
      {/* Date Range Group */}
      <div className="fb-group">
        <div className="fb-icon-box">
          <Calendar size={20} className="fb-icon" />
        </div>
        <div className="fb-input-wrapper">
          <label className="fb-label">Date Range</label>
          <input 
            type="text" 
            className="fb-input" 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          />
        </div>
      </div>

      {/* Status Group */}
      <div className="fb-group">
        <div className="fb-icon-box">
          <FileText size={20} className="fb-icon" />
        </div>
        <div className="fb-input-wrapper">
          <label className="fb-label">Status</label>
          <div className="fb-select-container">
            <select
              className="fb-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="fb-select-chevron" size={16} />
          </div>
        </div>
      </div>

      {/* Department Group */}
      <div className="fb-group">
        <div className="fb-icon-box">
          <LayoutGrid size={20} className="fb-icon" />
        </div>
        <div className="fb-input-wrapper">
          <label className="fb-label">Department</label>
          <div className="fb-select-container">
            <select
              className="fb-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Department</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="fb-select-chevron" size={16} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fb-actions">
        <button type="button" className="fb-btn-reset" onClick={handleReset}>
          Reset
        </button>
        <button type="button" className="fb-btn-apply" onClick={handleApply}>
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default FilterBar;