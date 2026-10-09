// ============================================================
// USE RESIGNATION FORM HOOK
// Enterprise-grade custom hook managing the Resignation Modal lifecycle.
// Implements Clean Architecture and decouples UI from business logic.
// ============================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Resignation,
  CreateResignationPayload,
  ResignationReason,
} from '../types/resignation.types';
import {
  MAX_REASON_LENGTH,
  MIN_REASON_LENGTH,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  VALIDATION_MESSAGES,
} from '../constants/resignation.constants';
import ResignationService from '../services/resignation.service';

// ============================================================
// TYPES: FORM STATE AND DATA
// ============================================================

/**
 * Interface defining the shape of the form data.
 */
export interface ResignationFormData {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  reportingManager: string;
  resignationOption: 'yes' | 'no';
  fromDate: string; // ISO Date string
  noticePeriod: string; // e.g., "30"
  lastWorkingDate: string; // Auto-calculated ISO Date string
  reason: ResignationReason | '';
  details: string;
  attachment: File | null;
}

/**
 * Interface for form validation errors.
 */
export interface FormErrors {
  fromDate?: string;
  noticePeriod?: string;
  reason?: string;
  details?: string;
  attachment?: string;
}

/**
 * Types for the Modal mode.
 */
export type FormMode = 'create' | 'edit' | 'view';

// ============================================================
// DEFAULT VALUES
// ============================================================

/**
 * Default initial state for a new resignation form.
 */
const getDefaultFormData = (): ResignationFormData => ({
  employeeId: '',
  employeeName: '',
  department: '',
  designation: '',
  reportingManager: '',
  resignationOption: 'yes',
  fromDate: '',
  noticePeriod: '',
  lastWorkingDate: '',
  reason: '',
  details: '',
  attachment: null,
});

// ============================================================
// HELPER: DATE CALCULATION
// ============================================================

/**
 * Calculates the Last Working Date based on From Date + Notice Period (in days).
 * @param fromDate - The start date as an ISO string.
 * @param noticePeriodDays - The number of days as a string.
 * @returns The calculated future date as an ISO string, or an empty string if inputs are invalid.
 */
const calculateLastWorkingDate = (fromDate: string, noticePeriodDays: string): string => {
  if (!fromDate || !noticePeriodDays) return '';
  
  const days = parseInt(noticePeriodDays, 10);
  if (isNaN(days) || days <= 0) return '';

  const date = new Date(fromDate);
  if (isNaN(date.getTime())) return '';

  // Add the notice period in days
  date.setDate(date.getDate() + days);
  
  // Return YYYY-MM-DD format
  return date.toISOString().split('T')[0];
};

// ============================================================
// HELPER: INTERNAL VALIDATION (Placeholder for external Schema)
// ============================================================

/**
 * Validates the form data and returns an errors object.
 * Note: In a real production environment, this would be replaced by
 * `resignation.schema.ts` using a library like Zod or Yup.
 */
const validateFormData = (data: ResignationFormData): FormErrors => {
  const errors: FormErrors = {};

  // 1. From Date Validation
  if (!data.fromDate) {
    errors.fromDate = VALIDATION_MESSAGES.DATE_VALID;
  }

  // 2. Notice Period Validation
  if (!data.noticePeriod) {
    errors.noticePeriod = VALIDATION_MESSAGES.NOTICE_REQUIRED;
  }

  // 3. Reason Validation
  if (!data.reason) {
    errors.reason = VALIDATION_MESSAGES.REASON_REQUIRED;
  }

  // 4. Details Length Validation
  if (data.details && data.details.length > MAX_REASON_LENGTH) {
    errors.details = VALIDATION_MESSAGES.REASON_MAX_LENGTH;
  } else if (data.details && data.details.length < MIN_REASON_LENGTH && data.details.length > 0) {
    // Note: Only enforce min length if they actually type something
    errors.details = VALIDATION_MESSAGES.REASON_MIN_LENGTH;
  }

  return errors;
};

// ============================================================
// CUSTOM HOOK IMPLEMENTATION
// ============================================================

/**
 * useResignationForm Hook
 * 
 * Manages the complete state, validation, and submission lifecycle
 * of the Resignation Modal. Handles Create, Edit, and View modes.
 * 
 * @returns {Object} State and functions for the resignation form.
 */
const useResignationForm = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [formData, setFormData] = useState<ResignationFormData>(getDefaultFormData());
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<FormMode>('create');
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  // Ref to prevent infinite loops during date calculations
  const isCalculatingDate = useRef<boolean>(false);

  // ============================================================
  // DERIVED STATE
  // ============================================================
  const isValid = useMemo(() => {
    // Form is valid if there are no errors and all required fields are filled
    return Object.keys(errors).length === 0 && formData.reason !== '' && formData.fromDate !== '' && formData.noticePeriod !== '';
  }, [errors, formData.reason, formData.fromDate, formData.noticePeriod]);

  const isViewMode = useMemo(() => mode === 'view', [mode]);
  const isEditMode = useMemo(() => mode === 'edit', [mode]);
  const isCreateMode = useMemo(() => mode === 'create', [mode]);

  // ============================================================
  // EFFECTS: DATE CALCULATION
  // ============================================================

  /**
   * Automatically calculates and updates the Last Working Date
   * whenever From Date or Notice Period changes.
   */
  useEffect(() => {
    // Prevent recursive updates
    if (isCalculatingDate.current) return;
    isCalculatingDate.current = true;

    const { fromDate, noticePeriod } = formData;
    if (fromDate && noticePeriod) {
      const calculatedDate = calculateLastWorkingDate(fromDate, noticePeriod);
      if (calculatedDate !== formData.lastWorkingDate) {
        setFormData(prev => ({ ...prev, lastWorkingDate: calculatedDate }));
        setIsDirty(true);
      }
    }

    isCalculatingDate.current = false;
  }, [formData.fromDate, formData.noticePeriod, formData.lastWorkingDate]);

  // ============================================================
  // EFFECTS: VALIDATION
  // ============================================================

  /**
   * Runs validation whenever form data changes.
   */
  useEffect(() => {
    if (!isDirty) return; // Don't validate pristine forms
    const newErrors = validateFormData(formData);
    setErrors(newErrors);
  }, [formData, isDirty]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleInputChange = useCallback((field: keyof ResignationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleSelectChange = useCallback((field: keyof ResignationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleDateChange = useCallback((field: 'fromDate', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleReasonChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, reason: value as ResignationReason }));
    setIsDirty(true);
  }, []);

  // ============================================================
  // FILE UPLOAD HANDLING
  // ============================================================

  const handleFileUpload = useCallback(async (file: File) => {
    // 1. Client-side Validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, attachment: VALIDATION_MESSAGES.FILE_TYPE }));
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, attachment: VALIDATION_MESSAGES.FILE_SIZE }));
      return false;
    }

    // 2. Clear previous errors and set uploading state
    setErrors(prev => ({ ...prev, attachment: undefined }));
    setIsUploading(true);
    setUploadedFile(file);
    setFormData(prev => ({ ...prev, attachment: file }));
    setIsDirty(true);

    try {
      // 3. Prepare for upload. If we have an ID, we upload immediately.
      // If creating, we save the file and upload during submission.
      if (selectedResignation?.id) {
        await ResignationService.uploadAttachment(file, selectedResignation.id);
      }
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload file.';
      setErrors(prev => ({ ...prev, attachment: message }));
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [selectedResignation]);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, attachment: null }));
    setErrors(prev => ({ ...prev, attachment: undefined }));
    setIsDirty(true);
  }, []);

  // ============================================================
  // MODAL STATE HANDLERS
  // ============================================================

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setErrors({});
    setUploadedFile(null);
    setIsDirty(false);
    setSelectedResignation(null);
    setMode('create');
  }, []);

  const populateForm = useCallback((resignation: Resignation) => {
    setFormData({
      employeeId: resignation.employee.id,
      employeeName: resignation.employee.fullName,
      department: resignation.employee.department,
      designation: resignation.employee.designation,
      reportingManager: '', // This would come from a nested object if available
      resignationOption: 'yes', // Default mapping
      fromDate: resignation.resignationDate,
      noticePeriod: '30', // Mock mapping, actual data would ideally be stored
      lastWorkingDate: resignation.lastWorkingDate,
      reason: resignation.reason as ResignationReason,
      details: resignation.details || '',
      attachment: null,
    });
    setSelectedResignation(resignation);
    setIsDirty(false);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setMode('create');
  }, [resetForm]);

  const openEdit = useCallback((resignation: Resignation) => {
    populateForm(resignation);
    setMode('edit');
  }, [populateForm]);

  const openView = useCallback((resignation: Resignation) => {
    populateForm(resignation);
    setMode('view');
  }, [populateForm]);

  const closeForm = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // ============================================================
  // SUBMIT HANDLERS
  // ============================================================

  const submitForm = useCallback(async () => {
    // 1. Final Client-side Validation
    const finalErrors = validateFormData(formData);
    setErrors(finalErrors);
    if (Object.keys(finalErrors).length > 0) {
      throw new Error('Please fix validation errors before submitting.');
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      if (isCreateMode) {
        // 2a. Construct Payload for Create
        const payload: CreateResignationPayload = {
          employeeId: 'emp-001', // In a real app, pulled from auth context
          resignationDate: formData.fromDate,
          lastWorkingDate: formData.lastWorkingDate,
          reason: formData.reason as ResignationReason,
          details: formData.details || '',
          attachment: formData.attachment || undefined,
        };
        await ResignationService.createResignation(payload);
      } else if (isEditMode && selectedResignation) {
        // 2b. Construct Payload for Edit
        await ResignationService.updateResignation(selectedResignation.id, {
          resignationDate: formData.fromDate,
          lastWorkingDate: formData.lastWorkingDate,
          reason: formData.reason as ResignationReason,
          details: formData.details || '',
          attachment: formData.attachment || undefined,
        });
      }
      
      // 3. Reset state on success
      resetForm();
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setErrors(prev => ({ ...prev, submit: message }));
      throw error;
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [formData, isCreateMode, isEditMode, selectedResignation, resetForm]);

  // ============================================================
  // RETURN VALUES
  // ============================================================

  return useMemo(() => ({
    // State
    formData,
    errors,
    loading,
    isSubmitting,
    isUploading,
    uploadedFile,
    isDirty,
    isValid,
    editMode: isEditMode,
    viewMode: isViewMode,
    selectedResignation,

    // Form Handlers
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleReasonChange,
    handleFileUpload,
    removeFile,

    // Form Actions
    submitForm,
    resetForm,
    populateForm,
    openCreate,
    openEdit,
    openView,
    closeForm,
  }), [
    formData,
    errors,
    loading,
    isSubmitting,
    isUploading,
    uploadedFile,
    isDirty,
    isValid,
    isEditMode,
    isViewMode,
    selectedResignation,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleReasonChange,
    handleFileUpload,
    removeFile,
    submitForm,
    resetForm,
    populateForm,
    openCreate,
    openEdit,
    openView,
    closeForm,
  ]);
};

export default useResignationForm;