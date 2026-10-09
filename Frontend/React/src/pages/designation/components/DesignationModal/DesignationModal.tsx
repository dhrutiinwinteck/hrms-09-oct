import React, {
  useEffect,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import "./DesignationModal.css";

/* =========================================
   TYPES
========================================= */

export type DesignationModalMode =
  | "add"
  | "edit"
  | "delete";

export interface DesignationModalDepartment {
  id: number;
  name: string;
}

export interface DesignationModalValues {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
}

export interface DesignationModalSubmitValues {
  id: number | null;
  name: string;
  departmentId: number;
}

export interface DesignationModalProps {
  open?: boolean;

  mode?: DesignationModalMode;

  initialValues?: DesignationModalValues | null;

  departments: DesignationModalDepartment[];

  title?: string;

  description?: string;

  onClose?: () => void;

  onSubmit?: (
    values: DesignationModalSubmitValues,
  ) => void | Promise<void>;

  onDelete?: (
    designation: DesignationModalValues,
  ) => void | Promise<void>;
}

/* =========================================
   COMPONENT
========================================= */

export const DesignationModal: React.FC<
  DesignationModalProps
> = ({
  open = false,
  mode = "add",
  initialValues = null,
  departments,
  title,
  description,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [
    designationName,
    setDesignationName,
  ] = useState<string>("");

  const [
    departmentId,
    setDepartmentId,
  ] = useState<number | "">("");

  const [
    error,
    setError,
  ] = useState<string>("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState<boolean>(false);

  /* =========================================
     MODE
  ========================================= */

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  /* =========================================
     INITIALIZE FORM
  ========================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    /*
     * EDIT / DELETE MODE
     *
     * Populate the form from the selected
     * designation.
     */
    if (
      (mode === "edit" ||
        mode === "delete") &&
      initialValues
    ) {
      setDesignationName(
        initialValues.name ?? "",
      );

      setDepartmentId(
        initialValues.departmentId,
      );

      return;
    }

    /*
     * ADD MODE
     *
     * Always start with an empty form.
     */
    setDesignationName("");
    setDepartmentId("");
  }, [
    open,
    mode,
    initialValues,
  ]);

  /* =========================================
     ESCAPE KEY
  ========================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ): void => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    open,
    isSubmitting,
    onClose,
  ]);

  /* =========================================
     BODY SCROLL LOCK
  ========================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* =========================================
     CLOSE WHEN NOT OPEN
  ========================================= */

  if (!open) {
    return null;
  }

  /* =========================================
     TITLES
  ========================================= */

  const modalTitle =
    title ??
    (isAddMode
      ? "Add Designation"
      : isEditMode
        ? "Edit Designation"
        : "Delete Designation");

  const modalDescription =
    description ??
    (isAddMode
      ? "Fill in the details to create a new designation."
      : isEditMode
        ? "Update the designation details."
        : "This action cannot be undone.");

  /* =========================================
     VALIDATION
  ========================================= */

  const validateForm = (): boolean => {
    const trimmedName =
      designationName.trim();

    if (!trimmedName) {
      setError(
        "Designation name is required.",
      );

      return false;
    }

    if (trimmedName.length < 2) {
      setError(
        "Designation name must contain at least 2 characters.",
      );

      return false;
    }

    if (trimmedName.length > 100) {
      setError(
        "Designation name cannot exceed 100 characters.",
      );

      return false;
    }

    if (departmentId === "") {
      setError(
        "Please select a department.",
      );

      return false;
    }

    setError("");

    return true;
  };

  /* =========================================
     SUBMIT
  ========================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (
      isSubmitting ||
      !onSubmit
    ) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        id:
          initialValues?.id ??
          null,

        name:
          designationName.trim(),

        departmentId:
          departmentId as number,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = async (): Promise<void> => {
    if (
      isSubmitting ||
      !onDelete ||
      !initialValues
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onDelete(
        initialValues,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     BACKDROP
  ========================================= */

  const handleBackdropMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target ===
        event.currentTarget &&
      !isSubmitting
    ) {
      onClose?.();
    }
  };

  /* =========================================
     ICON
  ========================================= */

  const renderIcon =
    (): React.ReactNode => {
      if (isDeleteMode) {
        return (
          <div className="designation-modal__icon designation-modal__icon--danger">
            <Trash2
              size={21}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        );
      }

      if (isEditMode) {
        return (
          <div className="designation-modal__icon">
            <Pencil
              size={21}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        );
      }

      return (
        <div className="designation-modal__icon">
          <BriefcaseBusiness
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      );
    };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
      className="designation-modal-overlay"
      role="presentation"
      onMouseDown={
        handleBackdropMouseDown
      }
    >
      <div
        className={`designation-modal ${
          isDeleteMode
            ? "designation-modal--delete"
            : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="designation-modal-title"
        aria-describedby="designation-modal-description"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* =====================================
            HEADER
        ===================================== */}

        <header className="designation-modal__header">
          <div>
            <h2
              id="designation-modal-title"
              className="designation-modal__title"
            >
              {modalTitle}
            </h2>

            <p
              id="designation-modal-description"
              className="designation-modal__description"
            >
              {modalDescription}
            </p>
          </div>

          <button
            type="button"
            className="designation-modal__close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X
              size={18}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </button>
        </header>

        {/* =====================================
            ADD / EDIT
        ===================================== */}

        {(isAddMode || isEditMode) && (
          <form
            className="designation-modal__form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* =================================
                INTRO
            ================================= */}

            <div className="designation-modal__intro">
              {renderIcon()}

              <div className="designation-modal__intro-content">
                <span className="designation-modal__mode">
                  {isAddMode
                    ? "New Designation"
                    : "Edit Details"}
                </span>

                <span className="designation-modal__intro-text">
                  {isAddMode
                    ? "Add a designation to your organization."
                    : "Modify the existing designation information."}
                </span>
              </div>
            </div>

            {/* =================================
                DESIGNATION NAME
            ================================= */}

            <div className="designation-modal__field">
              <label
                htmlFor="designation-name"
                className="designation-modal__label"
              >
                Designation Name

                <span aria-hidden="true">
                  *
                </span>
              </label>

              <input
                id="designation-name"
                type="text"
                className={`designation-modal__input ${
                  error
                    ? "designation-modal__input--error"
                    : ""
                }`}
                value={designationName}
                onChange={(event) => {
                  setDesignationName(
                    event.target.value,
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter designation name"
                maxLength={100}
                autoComplete="off"
                autoFocus
                disabled={isSubmitting}
                aria-invalid={Boolean(
                  error,
                )}
              />
            </div>

            {/* =================================
                DEPARTMENT
            ================================= */}

            <div className="designation-modal__field">
              <label
                htmlFor="designation-department"
                className="designation-modal__label"
              >
                Department

                <span aria-hidden="true">
                  *
                </span>
              </label>

              <div className="designation-modal__select-wrapper">
                <select
                  id="designation-department"
                  className={`designation-modal__select ${
                    error
                      ? "designation-modal__input--error"
                      : ""
                  }`}
                  value={departmentId}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setDepartmentId(
                      value === ""
                        ? ""
                        : Number(value),
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(
                    error,
                  )}
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map(
                    (
                      department,
                    ) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {department.name}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  className="designation-modal__select-icon"
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              {error && (
                <p
                  className="designation-modal__error"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>

            {/* =================================
                ACTIONS
            ================================= */}

            <div className="designation-modal__actions">
              <button
                type="button"
                className="designation-modal__button designation-modal__button--secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="designation-modal__button designation-modal__button--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="designation-modal__spinner"
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    {isAddMode
                      ? "Adding..."
                      : "Saving..."}
                  </>
                ) : (
                  <>
                    {!isAddMode && (
                      <Check
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    )}

                    {isAddMode
                      ? "Submit"
                      : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* =====================================
            DELETE
        ===================================== */}

        {isDeleteMode && (
          <div className="designation-modal__delete-content">
            <div className="designation-modal__delete-intro">
              {renderIcon()}

              <div>
                <h3 className="designation-modal__delete-title">
                  Delete Designation?
                </h3>

                <p className="designation-modal__delete-description">
                  Are you sure you want to
                  delete this designation?
                </p>
              </div>
            </div>

            {/* PREVIEW */}

            {initialValues && (
              <div className="designation-modal__preview">
                <div className="designation-modal__preview-icon">
                  <BriefcaseBusiness
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </div>

                <div className="designation-modal__preview-content">
                  <strong>
                    {initialValues.name}
                  </strong>

                  <span>
                    {
                      initialValues.departmentName
                    }
                  </span>
                </div>
              </div>
            )}

            <p className="designation-modal__warning">
              This action cannot be undone.
            </p>

            {/* DELETE ACTIONS */}

            <div className="designation-modal__actions">
              <button
                type="button"
                className="designation-modal__button designation-modal__button--secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="designation-modal__button designation-modal__button--danger"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="designation-modal__spinner"
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                      strokeWidth={1.9}
                      aria-hidden="true"
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

export default DesignationModal;