// src/pages/employees/components/AddEmployeeForm/AddEmployeeForm.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useEmployeeForm } from '../../hooks/useEmployeeForm';
import { EmployeeFormData } from '../../types/employees.types';
import './AddEmployeeForm.css';

// Simple Select component
const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, options, error, placeholder, className }) => {
  return (
    <div className="form-select-wrapper">
      <select
        className={`form-select ${error ? 'form-select-error' : ''} ${className || ''}`}
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
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};

// File upload component
const FileUpload: React.FC<{
  accept?: string;
  onChange: (file: File | null) => void;
  placeholder?: string;
}> = ({ accept, onChange, placeholder }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFileName(file.name);
      onChange(file);
    } else {
      setFileName('');
      onChange(null);
    }
  };

  return (
    <div className="file-upload-wrapper">
      <div className="file-upload-input-wrapper">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="file-upload-input"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="file-upload-label">
          {fileName || placeholder || 'Choose file'}
        </label>
      </div>
    </div>
  );
};

interface AddEmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => Promise<any>;
  onCancel: () => void;
  existingEmployees: any[];
  designations: string[];
  employeeTypes: string[];
  editData?: any;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onSubmit: submitEmployee,
  onCancel,
  existingEmployees,
  designations,
  employeeTypes,
  editData
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    resetForm,
    submit,
    setFormData
  } = useEmployeeForm();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const genders = ['Male', 'Female', 'Other'];

  // Set form data when editData changes - FIXED to properly load data
  useEffect(() => {
    if (editData) {
      setFormData({
        firstName: editData.firstName || '',
        lastName: editData.lastName || '',
        email: editData.email || '',
        personalEmail: editData.personalEmail || '',
        phone: editData.phone || '',
        photo: editData.photo || '',
        gender: editData.gender || '',
        password: '', // Don't populate password for security
        noticePeriod: editData.noticePeriod || 30,
        joiningDate: editData.joiningDate || '',
        designation: editData.designation || '',
        reportingManager: editData.reportingManager || '',
        employeeType: editData.employeeType || 'Full Time'
      });
    }
  }, [editData, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const result = await submit((data) => {
      return submitEmployee(data);
    });

    if (!result.success) {
      if (result.error) {
        setSubmitError(result.error);
      }
    } else {
      resetForm();
      onCancel();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <form className="add-employee-form" onSubmit={handleSubmit}>
      <div className="form-scroll-content">
        <div className="form-section">
          <h3 className="form-section-title">Personal Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter first name"
                error={errors.firstName}
                size={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter last name"
                error={errors.lastName}
                size={1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Photo</label>
              <FileUpload
                accept="image/*"
                onChange={(file) => {
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      handleChange('photo', e.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                placeholder="Upload photo"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <Select
                value={formData.gender}
                onChange={(value) => handleChange('gender', value)}
                options={[
                  { value: '', label: 'Select Gender' },
                  ...genders.map(g => ({ value: g, label: g }))
                ]}
                error={errors.gender}
                placeholder="Select Gender"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email"
                error={errors.email}
                size={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Personal Email</label>
              <Input
                type="email"
                value={formData.personalEmail || ''}
                onChange={(e) => handleChange('personalEmail', e.target.value)}
                placeholder="Enter personal email"
                error={errors.personalEmail}
                size={1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Enter password"
                error={errors.password}
                size={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <Input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                error={errors.phone}
                size={1}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Employment Details</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Notice Period (in Days) *</label>
              <Input
                type="number"
                value={formData.noticePeriod}
                onChange={(e) => handleChange('noticePeriod', parseInt(e.target.value) || 0)}
                placeholder="Enter notice period"
                error={errors.noticePeriod}
                min={0}
               size={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date *</label>
              <Input
                type="date"
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
                error={errors.joiningDate}
                size={1}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Designation *</label>
              <Select
                value={formData.designation}
                onChange={(value) => handleChange('designation', value)}
                options={[
                  { value: '', label: 'Select Designation' },
                  ...designations.map(d => ({ value: d, label: d }))
                ]}
                error={errors.designation}
                placeholder="Select Designation"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reporting Manager *</label>
              <Select
                value={formData.reportingManager}
                onChange={(value) => handleChange('reportingManager', value)}
                options={[
                  { value: '', label: 'Select Manager' },
                  ...existingEmployees.map(emp => ({
                    value: emp.fullName,
                    label: emp.fullName
                  }))
                ]}
                error={errors.reportingManager}
                placeholder="Select Manager"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee Type *</label>
              <Select
                value={formData.employeeType}
                onChange={(value) => handleChange('employeeType', value)}
                options={[
                  { value: '', label: 'Select Employee Type' },
                  ...employeeTypes.map(t => ({ value: t, label: t }))
                ]}
                error={errors.employeeType}
                placeholder="Select Employee Type"
              />
            </div>
            <div className="form-group">
              {/* Empty for layout balance */}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="form-submit-error">{submitError}</div>
        )}
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          size="small"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          size="small"
        >
          {editData ? 'Update Employee' : 'Save Employee'}
        </Button>
      </div>
    </form>
  );
};