// src/pages/employees/hooks/useEmployeeForm.ts

import { useState, useCallback } from 'react';
import { EmployeeFormData } from '../types/employees.types';
import { employeeSchema } from '../validations/employee.schema';
import { ZodError } from 'zod';

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  personalEmail: '',
  phone: '',
  photo: '',
  gender: '',
  password: '',
  noticePeriod: 30,
  joiningDate: '',
  designation: '',
  reportingManager: '',
  employeeType: 'Full Time'
};

export const useEmployeeForm = () => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    field: keyof EmployeeFormData,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validate = useCallback((): Record<string, string> => {
    try {
      employeeSchema.parse(formData);
      return {};
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        return fieldErrors;
      }
      return {};
    }
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  const submit = useCallback(async (
    submitFn: (data: EmployeeFormData) => Promise<any>
  ) => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return { success: false, errors: validationErrors };
    }

    setIsSubmitting(true);
    try {
      const result = await submitFn(formData);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    setFormData,
    validate,
    resetForm,
    submit
  };
};