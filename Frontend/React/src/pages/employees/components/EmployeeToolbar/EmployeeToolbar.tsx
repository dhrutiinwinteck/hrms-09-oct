// src/pages/employees/components/EmployeeToolbar/EmployeeToolbar.tsx

import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { EmployeeFilters } from '../../types/employees.types';
import './EmployeeToolbar.css';

// Simple Select component
const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className }) => {
  return (
    <select
      className={`toolbar-select ${className || ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface EmployeeToolbarProps {
  filters: EmployeeFilters;
  onFilterChange: (key: keyof EmployeeFilters, value: string) => void;
  onReset: () => void;
  designations: string[];
}

export const EmployeeToolbar: React.FC<EmployeeToolbarProps> = ({
  filters,
  onFilterChange,
  onReset,
  designations
}) => {
  const [searchId, setSearchId] = useState(filters.employeeId || '');
  const [searchName, setSearchName] = useState(filters.employeeName || '');
  const [selectedDesignation, setSelectedDesignation] = useState(filters.designation || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchId !== filters.employeeId) {
        onFilterChange('employeeId', searchId);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchId, filters.employeeId, onFilterChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchName !== filters.employeeName) {
        onFilterChange('employeeName', searchName);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchName, filters.employeeName, onFilterChange]);

  const handleDesignationChange = (value: string) => {
    setSelectedDesignation(value);
    onFilterChange('designation', value);
  };

  const handleReset = () => {
    setSearchId('');
    setSearchName('');
    setSelectedDesignation('');
    onReset();
  };

  return (
    <div className="employee-toolbar">
      <div className="employee-toolbar-row">
        <div className="employee-toolbar-search">
          <Input
            placeholder="Search by Employee ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="toolbar-search-input"
          />
        </div>
        <div className="employee-toolbar-search">
          <Input
            placeholder="Search by Employee Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="toolbar-search-input"
          />
        </div>
        <div className="employee-toolbar-designation">
          <Select
            value={selectedDesignation}
            onChange={handleDesignationChange}
            placeholder="All Designations"
            options={designations.map(d => ({ value: d, label: d }))}
            className="toolbar-designation-select"
          />
        </div>
        <div className="employee-toolbar-actions">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="toolbar-filter-btn"
          >
            <Filter size={16} />
            Filters
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            className="toolbar-reset-btn"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};