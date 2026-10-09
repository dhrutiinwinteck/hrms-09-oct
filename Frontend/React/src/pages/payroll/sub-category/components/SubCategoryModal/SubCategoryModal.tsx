import React, {
  FormEvent,
  useEffect,
  useRef,
} from 'react';

import {
  ChevronDown,
  FilePlus2,
  Folder,
  Tag,
  X,
} from 'lucide-react';

import './SubCategoryModal.css';

export interface SubCategoryCategoryOption {
  id: number;
  name: string;
}

interface SubCategoryModalProps {
  isOpen: boolean;

  categoryId: string;
  subCategoryName: string;

  categories: SubCategoryCategoryOption[];

  categoryError?: string;
  subCategoryNameError?: string;

  onCategoryChange: (value: string) => void;
  onSubCategoryNameChange: (value: string) => void;

  onClose: () => void;
  onSubmit: () => void;
}

const SubCategoryModal: React.FC<
  SubCategoryModalProps
> = ({
  isOpen,
  categoryId,
  subCategoryName,
  categories,
  categoryError,
  subCategoryNameError,
  onCategoryChange,
  onSubCategoryNameChange,
  onClose,
  onSubmit,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  const firstInputRef = useRef<HTMLSelectElement | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      firstInputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onSubmit();
  };

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="sub-category-modal-overlay"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="sub-category-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-category-modal-title"
      >
        <header className="sub-category-modal-header">
          <div className="sub-category-modal-heading">
            <div className="sub-category-modal-icon">
              <FilePlus2
                size={39}
                strokeWidth={1.8}
              />
            </div>

            <div className="sub-category-modal-title-group">
              <h2 id="sub-category-modal-title">
                Add Sub Category
              </h2>

              <p>
                Create a new sub category under a category
              </p>
            </div>
          </div>

          <div className="sub-category-modal-decoration">
            <span className="sub-category-leaf leaf-one" />
            <span className="sub-category-leaf leaf-two" />
            <span className="sub-category-leaf leaf-three" />
          </div>

          <button
            type="button"
            className="sub-category-modal-close"
            onClick={onClose}
            aria-label="Close add sub category form"
          >
            <X
              size={28}
              strokeWidth={2.2}
            />
          </button>
        </header>

        <form
          className="sub-category-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="sub-category-modal-fields">
            <div className="sub-category-form-field">
              <label htmlFor="sub-category-category">
                Category <span>*</span>
              </label>

              <div
                className={`sub-category-input-shell ${
                  categoryError
                    ? 'has-error'
                    : ''
                }`}
              >
                <div className="sub-category-input-icon">
                  <Folder
                    size={27}
                    strokeWidth={2}
                  />
                </div>

                <div className="sub-category-select-wrapper">
                  <select
                    ref={firstInputRef}
                    id="sub-category-category"
                    value={categoryId}
                    onChange={(event) =>
                      onCategoryChange(
                        event.target.value,
                      )
                    }
                    aria-invalid={Boolean(
                      categoryError,
                    )}
                    aria-describedby={
                      categoryError
                        ? 'sub-category-category-error'
                        : undefined
                    }
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    className="sub-category-select-chevron"
                    size={23}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {categoryError && (
                <p
                  id="sub-category-category-error"
                  className="sub-category-field-error"
                >
                  {categoryError}
                </p>
              )}
            </div>

            <div className="sub-category-form-field">
              <label htmlFor="sub-category-name">
                Sub Category Name <span>*</span>
              </label>

              <div
                className={`sub-category-input-shell ${
                  subCategoryNameError
                    ? 'has-error'
                    : ''
                }`}
              >
                <div className="sub-category-input-icon">
                  <Tag
                    size={28}
                    strokeWidth={2}
                  />
                </div>

                <input
                  id="sub-category-name"
                  type="text"
                  value={subCategoryName}
                  onChange={(event) =>
                    onSubCategoryNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Enter sub category name"
                  maxLength={100}
                  autoComplete="off"
                  aria-invalid={Boolean(
                    subCategoryNameError,
                  )}
                  aria-describedby={
                    subCategoryNameError
                      ? 'sub-category-name-error'
                      : undefined
                  }
                />
              </div>

              {subCategoryNameError && (
                <p
                  id="sub-category-name-error"
                  className="sub-category-field-error"
                >
                  {subCategoryNameError}
                </p>
              )}
            </div>
          </div>

          <footer className="sub-category-modal-footer">
            <button
              type="button"
              className="sub-category-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="sub-category-modal-submit"
            >
              Submit
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SubCategoryModal;