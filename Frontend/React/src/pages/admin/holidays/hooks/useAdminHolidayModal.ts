// src/pages/admin/holidays/hooks/useAdminHolidayModal.ts

import { useState, useCallback } from 'react';
import { AdminHoliday, AdminHolidayFormData } from '../types/adminHoliday.types';

export const useAdminHolidayModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<AdminHoliday | null>(null);
  const [formData, setFormData] = useState<AdminHolidayFormData>({
    title: '',
    holidayDate: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AdminHolidayFormData, string>>>({});

  const openModal = useCallback((holiday?: AdminHoliday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        title: holiday.title,
        holidayDate: holiday.holidayDate,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        title: '',
        holidayDate: null,
      });
    }
    setErrors({});
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingHoliday(null);
    setFormData({
      title: '',
      holidayDate: null,
    });
    setErrors({});
  }, []);

  const updateFormData = useCallback((field: keyof AdminHolidayFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFormErrors = useCallback((newErrors: Partial<Record<keyof AdminHolidayFormData, string>>) => {
    setErrors(newErrors);
  }, []);

  return {
    isOpen,
    editingHoliday,
    formData,
    errors,
    openModal,
    closeModal,
    updateFormData,
    setFormErrors,
  };
};