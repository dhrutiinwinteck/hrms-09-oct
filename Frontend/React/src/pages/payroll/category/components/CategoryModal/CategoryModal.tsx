import React, {
  useEffect,
  useState,
} from 'react';

import {
  Folder,
  X,
} from 'lucide-react';

import categoryImage from '../../../../../assets/images/payslip/category.png';

import type {
  Category,
  CategoryFormValues,
} from '../..//types/category.types';

import {
  mapCategoryToForm,
} from '../../utils/category.mapper';

import {
  validateCategory,
  type CategoryValidationErrors,
} from '../../validations/category.schema';

import './CategoryModal.css';

interface CategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

const INITIAL_VALUES: CategoryFormValues = {
  categoryName: '',
  status: 'Active',
};

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  category,
  saving,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] =
    useState<CategoryFormValues>(INITIAL_VALUES);

  const [errors, setErrors] =
    useState<CategoryValidationErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (category) {
      setValues(mapCategoryToForm(category));
    } else {
      setValues(INITIAL_VALUES);
    }

    setErrors({});
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [
    isOpen,
    saving,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  const isEditMode = Boolean(category);

  const handleCategoryNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    setValues((current) => ({
      ...current,
      categoryName: value,
    }));

    setErrors((current) => ({
      ...current,
      categoryName: undefined,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateCategory(values);

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      return;
    }

    await onSubmit({
      categoryName: values.categoryName.trim(),
      status: values.status,
    });
  };

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (
      event.target === event.currentTarget &&
      !saving
    ) {
      onClose();
    }
  };

  return (
    <div
      className="category-modal-overlay"
      onMouseDown={handleBackdropMouseDown}
      role="presentation"
    >
      <div
        className="category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
      >
        {/* Decorative artwork */}
        <div className="category-modal-decoration">
          <img
            src={categoryImage}
            alt=""
          />
        </div>

        {/* Header */}
        <div className="category-modal-header">
          <h2 id="category-modal-title">
            {isEditMode
              ? 'Edit Category'
              : 'Add Category'}
          </h2>

          <button
            type="button"
            className="category-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close category modal"
          >
            <X
              size={17}
              strokeWidth={1.8}
            />
          </button>
        </div>

        {/* Form */}
        <form
          className="category-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <p className="category-modal-description">
            {isEditMode
              ? 'Update the category name for your expense category.'
              : 'Enter the category name to add a new expense category.'}
          </p>

          <div className="category-form-field">
            <label
              htmlFor="categoryName"
              className="category-form-label"
            >
              Category Name
              <span className="category-required">
                *
              </span>
            </label>

            <div
              className={`category-input-wrapper ${
                errors.categoryName
                  ? 'has-error'
                  : ''
              }`}
            >
              <Folder
                size={17}
                strokeWidth={1.7}
                className="category-input-icon"
              />

              <input
                id="categoryName"
                name="categoryName"
                type="text"
                value={values.categoryName}
                onChange={
                  handleCategoryNameChange
                }
                placeholder="Enter category name..."
                maxLength={100}
                autoComplete="off"
                autoFocus
                disabled={saving}
              />
            </div>

            {errors.categoryName && (
              <span className="category-field-error">
                {errors.categoryName}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="category-modal-actions">
            <button
              type="button"
              className="category-modal-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="category-modal-submit"
              disabled={saving}
            >
              {saving
                ? 'Submitting...'
                : isEditMode
                  ? 'Update'
                  : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;