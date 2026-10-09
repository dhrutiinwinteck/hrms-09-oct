import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import {
  AdminHoliday,
  AdminHolidayFormData,
} from '../../types/adminHoliday.types';

import {
  validateHolidayForm,
} from '../../validations/adminHoliday.schema';

import './AdminAddHolidayModal.css';

interface AdminAddHolidayModalProps {
  isOpen: boolean;
  editingHoliday: AdminHoliday | null;
  formData: AdminHolidayFormData;
  errors: Partial<
    Record<
      keyof AdminHolidayFormData,
      string
    >
  >;

  onClose: () => void;

  onSubmit: (
    data: AdminHolidayFormData,
  ) => void | Promise<void>;

  onUpdateField: (
    field: keyof AdminHolidayFormData,
    value: unknown,
  ) => void;

  onSetErrors: (
    errors: Partial<
      Record<
        keyof AdminHolidayFormData,
        string
      >
    >,
  ) => void;

  submitting?: boolean;
}

export const AdminAddHolidayModal: React.FC<
  AdminAddHolidayModalProps
> = ({
  isOpen,
  editingHoliday,
  formData,
  errors,
  onClose,
  onSubmit,
  onUpdateField,
  onSetErrors,
  submitting = false,
}) => {
  const [
    touched,
    setTouched,
  ] = useState<
    Partial<
      Record<
        keyof AdminHolidayFormData,
        boolean
      >
    >
  >({});

  useEffect(() => {
    if (!isOpen) {
      setTouched({});
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent,
  ): Promise<void> => {
    event.preventDefault();

    const allTouched: Record<
      keyof AdminHolidayFormData,
      boolean
    > = {
      title: true,
      holidayDate: true,
    };

    setTouched(allTouched);

    const validation =
      validateHolidayForm(formData);

    onSetErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    await onSubmit(formData);
  };

  const handleFieldChange = (
    field: keyof AdminHolidayFormData,
    value: unknown,
  ): void => {
    onUpdateField(field, value);

    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));
  };

  const handleClose = (): void => {
    if (submitting) {
      return;
    }

    setTouched({});
    onClose();
  };

  const title = editingHoliday
    ? 'Edit Holiday'
    : 'Add Holiday';

  const formattedDate =
    formData.holidayDate
      ? [
          formData.holidayDate.getFullYear(),
          String(
            formData.holidayDate.getMonth() + 1,
          ).padStart(2, '0'),
          String(
            formData.holidayDate.getDate(),
          ).padStart(2, '0'),
        ].join('-')
      : '';

  return (
    <>
      <div
        className="admin-holiday-modal-overlay"
        onClick={handleClose}
      />

      <div
        className="admin-holiday-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-holiday-modal-title"
      >
        <div className="admin-holiday-modal-header">
          <h2
            id="admin-holiday-modal-title"
            className="admin-holiday-modal-title"
          >
            {title}
          </h2>

          <button
            type="button"
            className="admin-holiday-modal-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-holiday-modal-form"
        >
          <div className="admin-holiday-form-group">
            <label className="admin-holiday-form-label">
              Holiday Name{' '}
              <span className="admin-holiday-form-required">
                *
              </span>
            </label>

            <input
              type="text"
              className={`admin-holiday-form-input ${
                errors.title &&
                touched.title
                  ? 'admin-holiday-form-input-error'
                  : ''
              }`}
              placeholder="Enter holiday name"
              value={formData.title}
              onChange={(event) =>
                handleFieldChange(
                  'title',
                  event.target.value,
                )
              }
              disabled={submitting}
              maxLength={255}
              autoComplete="off"
            />

            {errors.title &&
              touched.title && (
                <span className="admin-holiday-form-error">
                  {errors.title}
                </span>
              )}
          </div>

          <div className="admin-holiday-form-group">
            <label className="admin-holiday-form-label">
              Holiday Date{' '}
              <span className="admin-holiday-form-required">
                *
              </span>
            </label>

            <input
              type="date"
              className={`admin-holiday-form-input ${
                errors.holidayDate &&
                touched.holidayDate
                  ? 'admin-holiday-form-input-error'
                  : ''
              }`}
              value={formattedDate}
              onChange={(event) => {
                const value =
                  event.target.value;

                if (!value) {
                  handleFieldChange(
                    'holidayDate',
                    null,
                  );
                  return;
                }

                const [
                  year,
                  month,
                  day,
                ] = value
                  .split('-')
                  .map(Number);

                const date = new Date(
                  year,
                  month - 1,
                  day,
                );

                handleFieldChange(
                  'holidayDate',
                  date,
                );
              }}
              disabled={submitting}
            />

            {errors.holidayDate &&
              touched.holidayDate && (
                <span className="admin-holiday-form-error">
                  {errors.holidayDate}
                </span>
              )}
          </div>

          <div className="admin-holiday-modal-actions">
            <button
              type="button"
              className="admin-holiday-btn-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-holiday-btn-submit"
              disabled={submitting}
            >
              {submitting
                ? 'Saving...'
                : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};