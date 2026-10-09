// src/pages/employees/components/EmployeeHeader/EmployeeHeader.tsx

import React from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Plus } from 'lucide-react';
import './EmployeeHeader.css';

interface EmployeeHeaderProps {
  onAddEmployee: () => void;
}

export const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ onAddEmployee }) => {
  return (
    <div className="employee-header">
      <div className="employee-header-left">
        <h1 className="employee-header-title">All Employees</h1>
        <div className="employee-header-breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-separator">•</span>
          <span>Employees</span>
        </div>
      </div>
      <div className="employee-header-right">
        <Button variant="primary" size="small" onClick={onAddEmployee}>
          <Plus size={14} />
          Add Employee
        </Button>
      </div>
    </div>
  );
};