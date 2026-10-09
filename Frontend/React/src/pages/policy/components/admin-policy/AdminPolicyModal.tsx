import React, {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

import "./AdminPolicyModal.css";

export interface AddPolicyFormData {
  policyName: string;
  description: string;
  file: File;
}

interface AdminPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: AddPolicyFormData,
  ) => Promise<void> | void;
}

interface FormErrors {
  policyName?: string;
  file?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/* =========================================================
   PDF ONLY
========================================================= */

const ALLOWED_FILE_TYPES = [
  "application/pdf",
] as const;

const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
] as const;

const AdminPolicyModal: React.FC<
  AdminPolicyModalProps
> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [policyName, setPolicyName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = (): void => {
    setPolicyName("");
    setDescription("");
    setSelectedFile(null);
    setErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     MODAL EFFECT
  ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ): void => {
      if (
        event.key === "Escape" &&
        !isSubmitting
      ) {
        resetForm();
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    isSubmitting,
    onClose,
  ]);

  if (!isOpen) {
    return null;
  }

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const validateFile = (
    file: File,
  ): string | undefined => {
    const extension = file.name
      .split(".")
      .pop()
      ?.toLowerCase();

    /*
     * Give a more specific and polite message
     * when DOC/DOCX is selected.
     */
    if (extension === "doc") {
      return "Please upload the policy document in PDF format. DOC files are not supported.";
    }

    if (extension === "docx") {
      return "Please upload the policy document in PDF format. DOCX files are not supported.";
    }

    /*
     * Check file extension.
     */
    if (
      !extension ||
      !ALLOWED_FILE_EXTENSIONS.includes(
        extension as "pdf",
      )
    ) {
      return "Please upload a valid PDF document.";
    }

    /*
     * Empty file check.
     */
    if (file.size === 0) {
      return "The selected PDF document appears to be empty. Please choose another PDF file.";
    }

    /*
     * Maximum file size.
     */
    if (file.size > MAX_FILE_SIZE) {
      return "Please choose a PDF document smaller than 10 MB.";
    }

    /*
     * MIME type validation.
     *
     * Some browsers may return an empty MIME type,
     * therefore only validate it when available.
     */
    if (
      file.type &&
      !ALLOWED_FILE_TYPES.includes(
        file.type as "application/pdf",
      )
    ) {
      return "Please upload the policy document in PDF format.";
    }

    return undefined;
  };

  /* =========================================================
     FORM VALIDATION
  ========================================================= */

  const validateForm =
    (): boolean => {
      const newErrors: FormErrors = {};

      /*
       * Policy name validation.
       */
      if (!policyName.trim()) {
        newErrors.policyName =
          "Policy name is required.";
      } else if (
        policyName.trim().length < 3
      ) {
        newErrors.policyName =
          "Policy name must contain at least 3 characters.";
      } else if (
        policyName.trim().length > 150
      ) {
        newErrors.policyName =
          "Policy name cannot exceed 150 characters.";
      }

      /*
       * File validation.
       */
      if (!selectedFile) {
        newErrors.file =
          "Please select a PDF policy document.";
      } else {
        const fileError =
          validateFile(selectedFile);

        if (fileError) {
          newErrors.file = fileError;
        }
      }

      setErrors(newErrors);

      return (
        Object.keys(newErrors).length === 0
      );
    };

  /* =========================================================
     FILE CHANGE
  ========================================================= */

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileError =
      validateFile(file);

    /*
     * Invalid file.
     */
    if (fileError) {
      setSelectedFile(null);

      setErrors((current) => ({
        ...current,
        file: fileError,
      }));

      /*
       * Clear the native file input so the
       * same invalid file can be selected again.
       */
      event.target.value = "";

      return;
    }

    /*
     * Valid PDF.
     */
    setSelectedFile(file);

    setErrors((current) => ({
      ...current,
      file: undefined,
    }));
  };

  /* =========================================================
     BROWSE
  ========================================================= */

  const handleBrowse = (): void => {
    fileInputRef.current?.click();
  };

  /* =========================================================
     REMOVE FILE
  ========================================================= */

  const handleRemoveFile = (): void => {
    setSelectedFile(null);

    setErrors((current) => ({
      ...current,
      file: undefined,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const handleClose = (): void => {
    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };

  /* =========================================================
     BACKDROP CLICK
  ========================================================= */

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target ===
      event.currentTarget
    ) {
      handleClose();
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const isValid =
      validateForm();

    if (!isValid || !selectedFile) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        policyName: policyName.trim(),
        description: description.trim(),
        file: selectedFile,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error(
        "Failed to add policy:",
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="admin-policy-modal__backdrop"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className="admin-policy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-policy-modal-title"
      >
        {/* =========================
            HEADER
        ========================== */}

        <div className="admin-policy-modal__header">
          <div>
            <h2
              id="add-policy-modal-title"
              className="admin-policy-modal__title"
            >
              Add Policy
            </h2>

            <p className="admin-policy-modal__header-description">
              Add a new company policy and
              upload its document.
            </p>
          </div>

          <button
            type="button"
            className="admin-policy-modal__close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close add policy modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* =========================
            FORM
        ========================== */}

        <form
          className="admin-policy-modal__form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* =========================
              POLICY NAME
          ========================== */}

          <div className="admin-policy-modal__field">
            <label
              htmlFor="policy-name"
              className="admin-policy-modal__label"
            >
              Policy Name

              <span
                className="admin-policy-modal__required"
                aria-hidden="true"
              >
                *
              </span>
            </label>

            <input
              id="policy-name"
              type="text"
              className={`admin-policy-modal__input ${
                errors.policyName
                  ? "admin-policy-modal__input--error"
                  : ""
              }`}
              value={policyName}
              onChange={(event) => {
                setPolicyName(
                  event.target.value,
                );

                if (errors.policyName) {
                  setErrors((current) => ({
                    ...current,
                    policyName: undefined,
                  }));
                }
              }}
              placeholder="Enter policy name"
              maxLength={150}
              autoComplete="off"
              disabled={isSubmitting}
              aria-invalid={Boolean(
                errors.policyName,
              )}
              aria-describedby={
                errors.policyName
                  ? "policy-name-error"
                  : undefined
              }
            />

            {errors.policyName && (
              <span
                id="policy-name-error"
                className="admin-policy-modal__error"
              >
                {errors.policyName}
              </span>
            )}
          </div>

          {/* =========================
              DESCRIPTION
          ========================== */}

          <div className="admin-policy-modal__field">
            <label
              htmlFor="policy-description"
              className="admin-policy-modal__label"
            >
              Description
            </label>

            <textarea
              id="policy-description"
              className="admin-policy-modal__textarea"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Enter a short policy description"
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />

            <span className="admin-policy-modal__character-count">
              {description.length}/1000
            </span>
          </div>

          {/* =========================
              DOCUMENT UPLOAD
          ========================== */}

          <div className="admin-policy-modal__field">
            <label
              htmlFor="policy-document"
              className="admin-policy-modal__label"
            >
              Upload Policy

              <span
                className="admin-policy-modal__required"
                aria-hidden="true"
              >
                *
              </span>
            </label>

            <input
              ref={fileInputRef}
              id="policy-document"
              type="file"
              className="admin-policy-modal__hidden-file"

              /*
               * PDF ONLY
               */
              accept=".pdf,application/pdf"

              onChange={handleFileChange}
              disabled={isSubmitting}
            />

            <div
              className={`admin-policy-modal__file-control ${
                errors.file
                  ? "admin-policy-modal__file-control--error"
                  : ""
              }`}
            >
              <div className="admin-policy-modal__file-name">
                {selectedFile ? (
                  <>
                    <FileText
                      size={18}
                      className="admin-policy-modal__selected-icon"
                    />

                    <span
                      title={
                        selectedFile.name
                      }
                    >
                      {selectedFile.name}
                    </span>

                    <button
                      type="button"
                      className="admin-policy-modal__remove-file"
                      onClick={
                        handleRemoveFile
                      }
                      disabled={
                        isSubmitting
                      }
                      aria-label="Remove selected file"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <span>
                    Choose PDF file
                  </span>
                )}
              </div>

              <button
                type="button"
                className="admin-policy-modal__browse"
                onClick={handleBrowse}
                disabled={isSubmitting}
              >
                <UploadCloud size={17} />
                Browse
              </button>
            </div>

            <div className="admin-policy-modal__file-info">
              PDF format only. Maximum size 10 MB.
            </div>

            {errors.file && (
              <span
                className="admin-policy-modal__error"
                role="alert"
              >
                {errors.file}
              </span>
            )}
          </div>

          {/* =========================
              ACTIONS
          ========================== */}

          <div className="admin-policy-modal__actions">
            <button
              type="button"
              className="admin-policy-modal__cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-policy-modal__submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPolicyModal;