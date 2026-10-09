import React, { useEffect, useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import "./DepartmentModal.css";

export type DepartmentModalMode = "add" | "edit" | "delete";

export type DepartmentStatus = "Active" | "Inactive";

export interface Department {
  id: number | string;
  name: string;
  employeeCount?: number;
  status: DepartmentStatus;
}

export interface DepartmentFormData {
  id?: number | string;
  name: string;
  status: DepartmentStatus;
}

export interface DepartmentModalProps {
  isOpen: boolean;
  mode: DepartmentModalMode;

  department?: Department | null;

  isLoading?: boolean;

  onClose: () => void;

  onSubmit?: (
    data: DepartmentFormData
  ) => void | Promise<void>;

  onDelete?: (
    department: Department
  ) => void | Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  mode,
  department = null,
  isLoading = false,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [departmentName, setDepartmentName] =
    useState<string>("");

  const [status, setStatus] =
    useState<DepartmentStatus>("Active");

  const [error, setError] = useState<string>("");

  /*
   * ----------------------------------------------------------
   * INITIALIZE FORM
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError("");

    if (mode === "add") {
      setDepartmentName("");
      setStatus("Active");
      return;
    }

    if (department) {
      setDepartmentName(department.name);
      setStatus(department.status);
    }
  }, [isOpen, mode, department]);

  /*
   * ----------------------------------------------------------
   * ESCAPE KEY
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, isLoading, onClose]);

  /*
   * ----------------------------------------------------------
   * BODY SCROLL LOCK
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  /*
   * ----------------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------------
   */

  const validateDepartmentName = (): boolean => {
    const value = departmentName.trim();

    if (!value) {
      setError("Department name is required.");
      return false;
    }

    if (value.length < 2) {
      setError(
        "Department name must contain at least 2 characters."
      );
      return false;
    }

    if (value.length > 100) {
      setError(
        "Department name cannot exceed 100 characters."
      );
      return false;
    }

    setError("");

    return true;
  };

  /*
   * ----------------------------------------------------------
   * SUBMIT ADD / EDIT
   * ----------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isLoading || !onSubmit) {
      return;
    }

    if (!validateDepartmentName()) {
      return;
    }

    const formData: DepartmentFormData = {
      ...(department
        ? {
            id: department.id,
          }
        : {}),
      name: departmentName.trim(),
      status,
    };

    await onSubmit(formData);
  };

  /*
   * ----------------------------------------------------------
   * DELETE
   * ----------------------------------------------------------
   */

  const handleDelete = async (): Promise<void> => {
    if (
      isLoading ||
      !department ||
      !onDelete
    ) {
      return;
    }

    await onDelete(department);
  };

  /*
   * ----------------------------------------------------------
   * BACKDROP CLICK
   * ----------------------------------------------------------
   */

  const handleOverlayMouseDown = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (
      event.target === event.currentTarget &&
      !isLoading
    ) {
      onClose();
    }
  };

  /*
   * ----------------------------------------------------------
   * ICON
   * ----------------------------------------------------------
   */

  const renderIcon = (): React.ReactNode => {
    if (isDeleteMode) {
      return (
        <div className="department-modal-icon department-modal-icon-danger">
          <Trash2
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      );
    }

    if (isEditMode) {
      return (
        <div className="department-modal-icon">
          <Pencil
            size={22}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      );
    }

    return (
      <div className="department-modal-icon">
        <Building2
          size={22}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
    );
  };

  /*
   * ----------------------------------------------------------
   * MODAL TITLE
   * ----------------------------------------------------------
   */

  const getModalTitle = (): string => {
    if (isAddMode) {
      return "Add Department";
    }

    if (isEditMode) {
      return "Edit Department";
    }

    return "Delete Department";
  };

  return (
    <div
      className="department-modal-overlay"
      onMouseDown={handleOverlayMouseDown}
      role="presentation"
    >
      <div
        className={`department-modal ${
          isDeleteMode
            ? "department-modal-delete"
            : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="department-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="department-modal-header">
          <h2
            id="department-modal-title"
            className="department-modal-title"
          >
            {getModalTitle()}
          </h2>

          <button
            type="button"
            className="department-modal-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X
              size={17}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ==================================================
            ADD / EDIT
        ================================================== */}

        {(isAddMode || isEditMode) && (
          <form
            className="department-modal-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="department-modal-intro">
              {renderIcon()}

              <h3 className="department-modal-heading">
                {getModalTitle()}
              </h3>

              <p className="department-modal-description">
                {isAddMode
                  ? "Create a new department in your organization."
                  : "Update the department information."}
              </p>
            </div>

            {/* Department Name */}

            <div className="department-modal-field">
              <label
                htmlFor="department-modal-name"
                className="department-modal-label"
              >
                Department Name
                <span className="department-modal-required">
                  *
                </span>
              </label>

              <input
                id="department-modal-name"
                type="text"
                value={departmentName}
                onChange={(event) => {
                  setDepartmentName(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter department name"
                className={`department-modal-input ${
                  error
                    ? "department-modal-input-error"
                    : ""
                }`}
                maxLength={100}
                autoComplete="off"
                autoFocus
                disabled={isLoading}
                aria-invalid={Boolean(error)}
              />

              {error && (
                <span
                  className="department-modal-error"
                  role="alert"
                >
                  {error}
                </span>
              )}
            </div>

            {/* Status only for Edit */}

            {isEditMode && (
              <div className="department-modal-field">
                <label
                  htmlFor="department-modal-status"
                  className="department-modal-label"
                >
                  Status
                </label>

                <select
                  id="department-modal-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as DepartmentStatus
                    )
                  }
                  className="department-modal-input department-modal-select"
                  disabled={isLoading}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            )}

            {/* Buttons */}

            <div className="department-modal-actions">
              <button
                type="button"
                className="department-modal-button department-modal-button-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="department-modal-button department-modal-button-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="department-modal-spinner"
                      size={15}
                      strokeWidth={2}
                    />

                    {isAddMode
                      ? "Adding..."
                      : "Saving..."}
                  </>
                ) : isAddMode ? (
                  "Submit"
                ) : (
                  <>
                    <Check
                      size={15}
                      strokeWidth={2}
                    />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ==================================================
            DELETE
        ================================================== */}

        {isDeleteMode && (
          <div className="department-modal-delete-content">
            <div className="department-modal-intro">
              {renderIcon()}

              <h3 className="department-modal-heading">
                Delete Department?
              </h3>

              <p className="department-modal-description">
                Are you sure you want to delete this
                department?
              </p>
            </div>

            {department && (
              <div className="department-delete-preview">
                <div className="department-delete-preview-icon">
                  <Building2
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="department-delete-preview-content">
                  <span className="department-delete-preview-name">
                    {department.name}
                  </span>

                  <span className="department-delete-preview-status">
                    {department.employeeCount ?? 0}{" "}
                    {department.employeeCount === 1
                      ? "Employee"
                      : "Employees"}
                  </span>
                </div>
              </div>
            )}

            <p className="department-delete-warning">
              Deleting this department may affect its
              associated records.
            </p>

            <div className="department-modal-actions">
              <button
                type="button"
                className="department-modal-button department-modal-button-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="department-modal-button department-modal-button-danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="department-modal-spinner"
                      size={15}
                      strokeWidth={2}
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                      strokeWidth={1.9}
                    />

                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentModal;