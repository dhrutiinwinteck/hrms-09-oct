// src/pages/employees/components/AddEmployeeDrawer/AddEmployeeDrawer.tsx

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AddEmployeeForm } from '../AddEmployeeForm/AddEmployeeForm';
import './AddEmployeeDrawer.css';

interface AddEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  existingEmployees: any[];
  designations: string[];
  employeeTypes: string[];
  editData?: any;
}

export const AddEmployeeDrawer: React.FC<AddEmployeeDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingEmployees,
  designations,
  employeeTypes,
  editData
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="add-employee-drawer" ref={drawerRef}>
        <div className="drawer-header">
          <h2 className="drawer-title">{editData ? 'Edit Employee' : 'Add Employee'}</h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>
        <div className="drawer-content">
          <AddEmployeeForm
            onSubmit={onSubmit}
            onCancel={onClose}
            existingEmployees={existingEmployees}
            designations={designations}
            employeeTypes={employeeTypes}
            editData={editData}
          />
        </div>
      </div>
    </>
  );
};