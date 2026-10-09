// src/pages/shifts/components/ShiftPatternForm/ShiftPatternForm.tsx

import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  CalendarClock,
  Badge,
  Save,
  X,
} from 'lucide-react';

import {
  ShiftPatternFormData,
  ShiftPattern,
} from '../../types/shiftPatterns.types';

import {
  parseTime12To24,
} from '../../utils/shiftPatterns.utils';

import './ShiftPatternForm.css';

interface ShiftPatternFormProps {
  isOpen: boolean;

  mode: 'create' | 'edit';

  initialData?: ShiftPattern | null;

  onClose: () => void;

  onSubmit: (
    data: ShiftPatternFormData
  ) => void | Promise<void>;

  isSubmitting?: boolean;
}

const ShiftPatternForm: React.FC<
  ShiftPatternFormProps
> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [shiftName, setShiftName] =
    useState('');

  const [startTime, setStartTime] =
    useState('');

  const [endTime, setEndTime] =
    useState('');

  const [errors, setErrors] =
    useState<{
      shiftName?: string;
      startTime?: string;
      endTime?: string;
    }>({});

  const modalRef =
    useRef<HTMLDivElement>(null);

  // ============================================================
  // POPULATE FORM
  // ============================================================

  useEffect(() => {
    if (
      mode === 'edit' &&
      initialData
    ) {
      setShiftName(
        initialData.name
      );

      setStartTime(
        parseTime12To24(
          initialData.startTime
        )
      );

      setEndTime(
        parseTime12To24(
          initialData.endTime
        )
      );
    } else {
      setShiftName('');
      setStartTime('');
      setEndTime('');
    }

    setErrors({});
  }, [
    mode,
    initialData,
  ]);

  // ============================================================
  // OVERLAY
  // ============================================================

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      e.target === e.currentTarget &&
      !isSubmitting
    ) {
      onClose();
    }
  };

  // ============================================================
  // ESCAPE
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        e.key === 'Escape' &&
        isOpen &&
        !isSubmitting
      ) {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [
    isOpen,
    isSubmitting,
    onClose,
  ]);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = (): boolean => {
    const newErrors: {
      shiftName?: string;
      startTime?: string;
      endTime?: string;
    } = {};

    if (!shiftName.trim()) {
      newErrors.shiftName =
        'Shift name is required.';
    }

    if (!startTime) {
      newErrors.startTime =
        'Shift start time is required.';
    }

    if (!endTime) {
      newErrors.endTime =
        'Shift end time is required.';
    }

    if (
      startTime &&
      endTime &&
      startTime === endTime
    ) {
      newErrors.endTime =
        'End time must be different from start time.';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    await onSubmit({
      shiftName:
        shiftName.trim(),

      startTime,

      endTime,
    });
  };

  if (!isOpen) {
    return null;
  }

  const isEdit =
    mode === 'edit';

  const title = isEdit
    ? 'Edit Shift Pattern'
    : 'Create Shift Pattern';

  const subtitle = isEdit
    ? 'Update shift pattern details for scheduling and employee management.'
    : 'Add a new shift pattern for scheduling and employee management.';

  const buttonLabel = isEdit
    ? 'Update'
    : 'Create';

  return (
    <div
      className="sp-form-overlay"
      onClick={handleOverlayClick}
    >
      <div
        className="sp-form-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="sp-form-close"
          onClick={onClose}
          aria-label="Close form"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <div className="sp-form-header">
          <div className="sp-form-header-icon">
            <CalendarClock size={28} />
          </div>

          <div className="sp-form-header-text">
            <h2 className="sp-form-title">
              {title}
            </h2>

            <p className="sp-form-subtitle">
              {subtitle}
            </p>
          </div>
        </div>

        <hr className="sp-form-divider" />

        <form
          onSubmit={handleSubmit}
        >
          <div className="sp-form-body">

            {/* Shift Name */}

            <div className="sp-form-field">
              <div className="sp-form-field-label">
                <span className="sp-field-label-text">
                  Shift Name
                </span>

                <span className="sp-field-required">
                  *
                </span>
              </div>

              <div className="sp-form-input-wrapper">
                <div className="sp-input-icon-left">
                  <Badge size={18} />
                </div>

                <input
                  type="text"
                  placeholder="Enter shift name"
                  value={shiftName}
                  onChange={(e) =>
                    setShiftName(
                      e.target.value
                    )
                  }
                  className="sp-form-input"
                  disabled={
                    isSubmitting
                  }
                  maxLength={255}
                />
              </div>

              {errors.shiftName && (
                <div className="sp-form-error">
                  {errors.shiftName}
                </div>
              )}
            </div>

            {/* Start Time */}

            <div className="sp-form-field">
              <div className="sp-form-field-label">
                <span className="sp-field-label-text">
                  Shift Start Time
                </span>

                <span className="sp-field-required">
                  *
                </span>
              </div>

              <div className="sp-form-input-wrapper">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(
                      e.target.value
                    )
                  }
                  className="sp-form-input sp-time-input"
                  disabled={
                    isSubmitting
                  }
                />
              </div>

              {errors.startTime && (
                <div className="sp-form-error">
                  {errors.startTime}
                </div>
              )}
            </div>

            {/* End Time */}

            <div className="sp-form-field">
              <div className="sp-form-field-label">
                <span className="sp-field-label-text">
                  Shift End Time
                </span>

                <span className="sp-field-required">
                  *
                </span>
              </div>

              <div className="sp-form-input-wrapper">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(
                      e.target.value
                    )
                  }
                  className="sp-form-input sp-time-input"
                  disabled={
                    isSubmitting
                  }
                />
              </div>

              {errors.endTime && (
                <div className="sp-form-error">
                  {errors.endTime}
                </div>
              )}
            </div>

          </div>

          <hr className="sp-form-divider" />

          <div className="sp-form-footer">
            <button
              type="submit"
              className="sp-form-submit-btn"
              disabled={isSubmitting}
            >
              <Save size={18} />

              {isSubmitting
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : buttonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftPatternForm;