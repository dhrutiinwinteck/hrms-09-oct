// src/pages/employees/components/AddEmployeeModal/AddEmployeeModal.tsx

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AddEmployeeForm } from '../AddEmployeeForm/AddEmployeeForm';
import './AddEmployeeModal.css';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  existingEmployees: any[];
  designations: string[];
  employeeTypes: string[];
  editData?: any;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingEmployees,
  designations,
  employeeTypes,
  editData
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="add-employee-modal" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">{editData ? 'Edit Employee' : 'Add Employee'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-content">
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
    </div>
  );
};