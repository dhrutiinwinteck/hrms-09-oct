import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==============================
// Type Definitions
// ==============================

/**
 * The shape of the data expected by the parent to create a resignation.
 * This strictly defines the contract between the Modal and the Service Layer.
 */
export interface CreateResignationRequest {
  reason: string;
  reasonType: string;
  noticePeriod: string;
  lastWorkingDay: string;
  reportingManager: string;
  comments: string;
}

/**
 * Props interface for the NewResignationModal component.
 */
export interface NewResignationModalProps {
  /** Controls the visibility of the modal. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** Callback function to handle form submission. Must be async. */
  onSubmit: (data: CreateResignationRequest) => Promise<void>;
}

// ==============================
// Form State & Validation
// ==============================

/**
 * Initial state for the form fields.
 */
const INITIAL_FORM_STATE: CreateResignationRequest = {
  reason: '',
  reasonType: '',
  noticePeriod: '',
  lastWorkingDay: '',
  reportingManager: '',
  comments: '',
};

/**
 * Initial state for validation errors.
 */
const INITIAL_ERRORS: Partial<Record<keyof CreateResignationRequest, string>> = {};

/**
 * Mock dropdown options for demonstration.
 * In a real enterprise app, these would come from a constants file or API.
 */
const REASON_TYPE_OPTIONS = ['Career Growth', 'Personal Reasons', 'Higher Studies', 'Work Environment', 'Relocation'];
const NOTICE_PERIOD_OPTIONS = ['15 Days', '30 Days', '60 Days', '90 Days'];
const MANAGER_OPTIONS = ['John Doe (CTO)', 'Jane Smith (VP Eng)', 'Michael Brown (HR)'];

/**
 * NewResignationModal Component
 * 
 * A fully controlled, accessible, and animated modal for submitting a new resignation request.
 * It manages its own internal UI state, validation, and loading lifecycle.
 * All business logic and API calls are delegated to the parent via props.
 */
const NewResignationModal: React.FC<NewResignationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // ==============================
  // Refs & DOM Access
  // ==============================
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ==============================
  // Component State
  // ==============================
  const [formData, setFormData] = useState<CreateResignationRequest>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateResignationRequest, string>>>(INITIAL_ERRORS);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // ==============================
  // Effects: Open/Close & Accessibility
  // ==============================

  /**
   * Handles opening the modal.
   * - Saves the currently focused element to restore focus later.
   * - Focuses the first input element.
   * - Locks body scroll.
   */
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsClosing(false);
      
      // Focus the first input after the modal renders
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /**
   * Handles keyboard events for accessibility.
   * - ESC key triggers closeModal.
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, []);

  /**
   * Attaches/Detaches the keyboard event listener.
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // ==============================
  // UI Handlers
  // ==============================

  /**
   * Handles closing the modal with animation.
   * Restores focus to the previously active element.
   */
  const closeModal = useCallback(() => {
    if (isSubmitting) return; // Prevent closing during submission
    setIsClosing(true);
    
    // Allow CSS animation to play before unmounting
    setTimeout(() => {
      onClose();
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      // Reset form after close animation
      setFormData(INITIAL_FORM_STATE);
      setErrors(INITIAL_ERRORS);
    }, 200); // Matches CSS animation duration
  }, [onClose, isSubmitting]);

  /**
   * Handles clicks on the overlay to close the modal.
   */
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }, [closeModal]);

  /**
   * Updates the specific form field and clears its associated error.
   */
  const handleInputChange = useCallback((
    field: keyof CreateResignationRequest,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field as user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * Validates the entire form and returns a boolean indicating validity.
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CreateResignationRequest, string>> = {};

    // Required field validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required.';
    }
    if (!formData.reasonType) {
      newErrors.reasonType = 'Reason type is required.';
    }
    if (!formData.noticePeriod) {
      newErrors.noticePeriod = 'Notice period is required.';
    }
    if (!formData.lastWorkingDay) {
      newErrors.lastWorkingDay = 'Last working day is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ==============================
  // Submit Handler
  // ==============================

  /**
   * Handles form submission.
   * - Validates the form.
   * - Prevents double submission.
   * - Calls the parent onSubmit callback.
   * - Handles loading state and errors.
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // 1. Validate
    if (!validateForm()) {
      // Focus the first input with an error
      const firstErrorField = Object.keys(errors)[0] as keyof CreateResignationRequest;
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement instanceof HTMLElement) {
        errorElement.focus();
      }
      return;
    }

    // 2. Submitting
    setIsSubmitting(true);

    try {
      // 3. Delegate logic to parent
      await onSubmit(formData);
      // Success: Close modal (parent should handle data refresh)
      closeModal();
    } catch (error) {
      // 4. Handle submission errors (displayed via parent or generic handler)
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, errors, isSubmitting, onSubmit, closeModal, validateForm]);

  // ==============================
  // Render: Only if Open
  // ==============================
  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'modal-closing' : 'modal-opening'}`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      {/* 
        Dialog Container
        - aria-modal ensures screen readers treat this as a modal context.
        - role="dialog" identifies it as a popup dialog.
      */}
      <div
        ref={modalRef}
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* ==============================
            Modal Header
            ============================== */}
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            New Resignation
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closeModal}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        {/* ==============================
            Modal Body & Form
            ============================== */}
        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="modal-form-grid">
            
            {/* Field: Reason */}
            <div className="form-group full-width">
              <label htmlFor="reason" className="form-label">
                Reason <span className="required-asterisk">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="reason"
                name="reason"
                type="text"
                className={`form-input ${errors.reason ? 'form-input-error' : ''}`}
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Seeking new career opportunities"
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? 'reason-error' : undefined}
              />
              {errors.reason && (
                <span id="reason-error" className="form-error-text">
                  {errors.reason}
                </span>
              )}
            </div>

            {/* Field: Reason Type */}
            <div className="form-group">
              <label htmlFor="reasonType" className="form-label">
                Reason Type <span className="required-asterisk">*</span>
              </label>
              <select
                id="reasonType"
                name="reasonType"
                className={`form-select ${errors.reasonType ? 'form-input-error' : ''}`}
                value={formData.reasonType}
                onChange={(e) => handleInputChange('reasonType', e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.reasonType}
                aria-describedby={errors.reasonType ? 'reasonType-error' : undefined}
              >
                <option value="">Select Reason Type</option>
                {REASON_TYPE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.reasonType && (
                <span id="reasonType-error" className="form-error-text">
                  {errors.reasonType}
                </span>
              )}
            </div>

            {/* Field: Notice Period */}
            <div className="form-group">
              <label htmlFor="noticePeriod" className="form-label">
                Notice Period <span className="required-asterisk">*</span>
              </label>
              <select
                id="noticePeriod"
                name="noticePeriod"
                className={`form-select ${errors.noticePeriod ? 'form-input-error' : ''}`}
                value={formData.noticePeriod}
                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.noticePeriod}
                aria-describedby={errors.noticePeriod ? 'noticePeriod-error' : undefined}
              >
                <option value="">Select Notice Period</option>
                {NOTICE_PERIOD_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.noticePeriod && (
                <span id="noticePeriod-error" className="form-error-text">
                  {errors.noticePeriod}
                </span>
              )}
            </div>

            {/* Field: Last Working Day */}
            <div className="form-group">
              <label htmlFor="lastWorkingDay" className="form-label">
                Last Working Day <span className="required-asterisk">*</span>
              </label>
              <input
                id="lastWorkingDay"
                name="lastWorkingDay"
                type="date"
                className={`form-input ${errors.lastWorkingDay ? 'form-input-error' : ''}`}
                value={formData.lastWorkingDay}
                onChange={(e) => handleInputChange('lastWorkingDay', e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.lastWorkingDay}
                aria-describedby={errors.lastWorkingDay ? 'lastWorkingDay-error' : undefined}
              />
              {errors.lastWorkingDay && (
                <span id="lastWorkingDay-error" className="form-error-text">
                  {errors.lastWorkingDay}
                </span>
              )}
            </div>

            {/* Field: Reporting Manager */}
            <div className="form-group">
              <label htmlFor="reportingManager" className="form-label">
                Reporting Manager
              </label>
              <select
                id="reportingManager"
                name="reportingManager"
                className="form-select"
                value={formData.reportingManager}
                onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Select Manager</option>
                {MANAGER_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Field: Comments */}
            <div className="form-group full-width">
              <label htmlFor="comments" className="form-label">
                Comments / Additional Details
              </label>
              <textarea
                id="comments"
                name="comments"
                className="form-textarea"
                rows={4}
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                disabled={isSubmitting}
                placeholder="Any additional information regarding your resignation..."
              />
            </div>

          </div>

          {/* ==============================
              Modal Footer
              ============================== */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {/* <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <span className="loader-spinner">
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </button> */}
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewResignationModal;