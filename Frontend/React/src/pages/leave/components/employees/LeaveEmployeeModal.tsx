import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  Check,
  ClipboardList,
  FileText,
  Pencil,
  UserRound,
  X,
} from "lucide-react";

import type {
  LeaveEmployeeRecord,
  LeaveStatus,
  LeaveType,
} from "../../types/leave.types";

import "./LeaveEmployeeModal.css";

// ============================================================
// TYPES
// ============================================================

export type LeaveEmployeeModalData = LeaveEmployeeRecord;

export type LeaveEmployeeModalMode = "view" | "edit";

interface LeaveEmployeeModalProps {
  isOpen: boolean;
  employee: LeaveEmployeeModalData | null;
  mode?: LeaveEmployeeModalMode;
  onClose: () => void;
  onEdit?: (employee: LeaveEmployeeModalData) => void;
  onSave?: (employee: LeaveEmployeeModalData) => void | Promise<void>;
}

// ============================================================
// LEAVE TYPE OPTIONS
// ============================================================

const LEAVE_TYPE_OPTIONS: LeaveType[] = [
  "Paid Leave",
  "Casual Leave",
  "Comp off",
  "LOP",
];

// ============================================================
// DATE HELPERS
// ============================================================

const formatDate = (date: string): string => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date.includes("T") ? date : `${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const calculateDays = (from: string, to: string, halfDay = false): number => {
  if (!from || !to) {
    return 0;
  }

  if (halfDay) {
    return 0.5;
  }

  const startDate = new Date(`${from}T00:00:00`);

  const endDate = new Date(`${to}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  const difference = endDate.getTime() - startDate.getTime();

  if (difference < 0) {
    return 0;
  }

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
};

// ============================================================
// STATUS CLASS
// ============================================================

const getStatusClass = (status: LeaveStatus): string => {
  switch (status) {
    case "Approved":
      return "leave-employee-modal__status--approved";

    case "Rejected":
      return "leave-employee-modal__status--rejected";

    case "Pending":
      return "leave-employee-modal__status--pending";

    default:
      return "";
  }
};

// ============================================================
// COMPONENT
// ============================================================

const LeaveEmployeeModal: React.FC<LeaveEmployeeModalProps> = ({
  isOpen,
  employee,
  mode = "view",
  onClose,
  onEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState<LeaveEmployeeModalData | null>(null);

  const [saving, setSaving] = useState(false);

  const [validationError, setValidationError] = useState("");

  const modalBodyRef = useRef<HTMLDivElement | null>(null);

  // ==========================================================
  // INITIALIZE FORM
  // ==========================================================

  useEffect(() => {
    if (!employee) {
      setFormData(null);
      return;
    }

    setFormData({
      ...employee,
    });

    setValidationError("");
  }, [employee, mode, isOpen]);

  // ==========================================================
  // RESET BODY SCROLL
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [isOpen, mode, employee?.id]);

  // ==========================================================
  // BODY SCROLL LOCK
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ==========================================================
  // CALCULATED DAYS
  // ==========================================================

  const calculatedDays = useMemo(() => {
    if (!formData) {
      return 0;
    }

    return calculateDays(formData.from, formData.to, Boolean(formData.halfDay));
  }, [formData?.from, formData?.to, formData?.halfDay]);

  // ==========================================================
  // BACKDROP CLICK
  // ==========================================================

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // ==========================================================
  // FIELD CHANGE
  // ==========================================================

  const handleFieldChange = <K extends keyof LeaveEmployeeModalData>(
    field: K,
    value: LeaveEmployeeModalData[K],
  ): void => {
    setFormData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]: value,
      };
    });

    setValidationError("");
  };

  // ==========================================================
  // LEAVE TYPE CHANGE
  // ==========================================================

  const handleLeaveTypeChange = (value: string): void => {
    if (!LEAVE_TYPE_OPTIONS.includes(value as LeaveType)) {
      setValidationError("Invalid leave type selected.");
      return;
    }

    setFormData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        leaveType: value as LeaveType,
      };
    });

    setValidationError("");
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async (): Promise<void> => {
    if (!formData) {
      return;
    }

    if (!formData.leaveId) {
      setValidationError("Leave request ID is missing.");
      return;
    }

    if (!formData.from) {
      setValidationError("From date is required.");
      return;
    }

    if (!formData.to) {
      setValidationError("To date is required.");
      return;
    }

    if (formData.to < formData.from) {
      setValidationError("To date must be greater than or equal to From date.");
      return;
    }

    if (!formData.leaveType) {
      setValidationError("Leave type is required.");
      return;
    }

    if (!LEAVE_TYPE_OPTIONS.includes(formData.leaveType as LeaveType)) {
      setValidationError("Invalid leave type selected.");
      return;
    }

    if (formData.reason.trim().length === 0) {
      setValidationError("Reason is required.");
      return;
    }

    if (calculatedDays <= 0) {
      setValidationError("Number of leave days must be greater than 0.");
      return;
    }

    const updatedEmployee: LeaveEmployeeModalData = {
      ...formData,
      noOfDays: calculatedDays,
      reason: formData.reason.trim(),
    };

    try {
      setSaving(true);
      setValidationError("");

      /*
       * Do not call leaveService.updateLeave()
       * here.
       *
       * LeaveEmployees.tsx handles the API call
       * through useLeaveManagement.updateLeave().
       */

      await onSave?.(updatedEmployee);
    } catch (error) {
      console.error("Failed to update leave request:", error);

      setValidationError(
        error instanceof Error
          ? error.message
          : "Unable to save leave request. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // EDIT FROM VIEW MODE
  // ==========================================================

  const handleEdit = (): void => {
    if (!employee) {
      return;
    }

    onEdit?.(employee);
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = (): void => {
    onClose();
  };

  // ==========================================================
  // RENDER GUARD
  // ==========================================================

  if (!isOpen || !employee || !formData) {
    return null;
  }

  const isEditMode = mode === "edit";

  const displayedDays = isEditMode ? calculatedDays : formData.noOfDays;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="leave-employee-modal__backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className={`leave-employee-modal ${
          isEditMode
            ? "leave-employee-modal--edit"
            : "leave-employee-modal--view"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-employee-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="leave-employee-modal__header">
          <div className="leave-employee-modal__title-row">
            <div className="leave-employee-modal__title-icon">
              <ClipboardList size={20} strokeWidth={2} />
            </div>

            <div>
              <h2
                id="leave-employee-modal-title"
                className="leave-employee-modal__title"
              >
                {isEditMode ? "Edit Leave Request" : "Leave Details"}
              </h2>

              <p className="leave-employee-modal__subtitle">
                {isEditMode
                  ? "Update employee leave request information."
                  : "View employee leave application details."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="leave-employee-modal__close"
            onClick={onClose}
            aria-label="Close leave details"
            title="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className="leave-employee-modal__profile">
          <div className="leave-employee-modal__avatar-wrapper">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.name}
                className="leave-employee-modal__avatar"
              />
            ) : (
              <div className="leave-employee-modal__avatar" aria-hidden="true">
                {employee.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div className="leave-employee-modal__profile-content">
            <div className="leave-employee-modal__name-row">
              <div>
                <h3 className="leave-employee-modal__name">{employee.name}</h3>
                 {/* <p className="leave-employee-modal__designation">
  {employee.designation || employee.designation_name}
</p> */}
              </div>

              <span
                className={`leave-employee-modal__status ${getStatusClass(
                  employee.leaveStatus,
                )}`}
              >
                <span className="leave-employee-modal__status-dot" />
                {employee.leaveStatus}
              </span>
            </div>

            <div className="leave-employee-modal__employee-meta">
              <span>Employee ID</span>
              <strong>{employee.employeeId}</strong>

              <span className="leave-employee-modal__meta-separator">•</span>

              <span>{employee.department}</span>
            </div>
          </div>
        </div>

        <div ref={modalBodyRef} className="leave-employee-modal__body">
          <div className="leave-employee-modal__section-heading">
            <span className="leave-employee-modal__section-icon">
              <FileText size={17} strokeWidth={2} />
            </span>

            <div>
              <h4>Leave Information</h4>

              <p>
                {isEditMode
                  ? "Update the leave request details below."
                  : "Details of the employee leave application."}
              </p>
            </div>
          </div>

          <div className="leave-employee-modal__details-grid">
            <div className="leave-employee-modal__detail">
              <div className="leave-employee-modal__detail-icon">
                <UserRound size={18} />
              </div>

              <div className="leave-employee-modal__detail-content">
                <span className="leave-employee-modal__label">Employee</span>

                <span className="leave-employee-modal__value">
                  {employee.name}
                </span>

                <span className="leave-employee-modal__helper">
                  {employee.employeeId}
                </span>
              </div>
            </div>

            <div className="leave-employee-modal__field">
              <label
                htmlFor="leave-status"
                className="leave-employee-modal__field-label"
              >
                Status
              </label>

              {isEditMode ? (
                <select
                  id="leave-status"
                  value={formData.leaveStatus}
                  onChange={(event) =>
                    handleFieldChange(
                      "leaveStatus",
                      event.target.value as LeaveStatus,
                    )
                  }
                  className="leave-employee-modal__select"
                  disabled={saving}
                >
                  <option value="Pending">Pending</option>

                  <option value="Approved">Approved</option>

                  <option value="Rejected">Rejected</option>
                </select>
              ) : (
                <div
                  className={`leave-employee-modal__readonly-status ${getStatusClass(
                    formData.leaveStatus,
                  )}`}
                >
                  <span className="leave-employee-modal__status-dot" />
                  {formData.leaveStatus}
                </div>
              )}
            </div>

            <div className="leave-employee-modal__field">
              <label
                htmlFor="leave-to-date"
                className="leave-employee-modal__field-label"
              >
                To Date
              </label>

              {isEditMode ? (
                <div className="leave-employee-modal__input-wrapper">
                  <CalendarDays
                    size={17}
                    className="leave-employee-modal__input-icon"
                  />

                  <input
                    id="leave-to-date"
                    type="date"
                    value={formData.to}
                    min={formData.from || undefined}
                    onChange={(event) =>
                      handleFieldChange("to", event.target.value)
                    }
                    className="leave-employee-modal__input"
                    disabled={saving}
                  />
                </div>
              ) : (
                <div className="leave-employee-modal__readonly-box">
                  <CalendarDays size={17} />
                  <span>{formatDate(formData.to)}</span>
                </div>
              )}
            </div>

            <div className="leave-employee-modal__field">
              <label className="leave-employee-modal__field-label">
                No. of Days
              </label>

              <div className="leave-employee-modal__days-box">
                <span className="leave-employee-modal__days-number">
                  {displayedDays}
                </span>

                <span className="leave-employee-modal__days-label">
                  Day
                  {displayedDays !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="leave-employee-modal__field">
              <label
                htmlFor="leave-type"
                className="leave-employee-modal__field-label"
              >
                Leave Type
              </label>

              {isEditMode ? (
                <select
                  id="leave-type"
                  value={formData.leaveType}
                  onChange={(event) =>
                    handleLeaveTypeChange(event.target.value)
                  }
                  className="leave-employee-modal__select"
                  disabled={saving}
                >
                  <option value="">Select Leave Type</option>

                  {LEAVE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="leave-employee-modal__readonly-box">
                  <FileText size={17} />
                  <span>{formData.leaveType}</span>
                </div>
              )}
            </div>

            <div className="leave-employee-modal__field">
              <label className="leave-employee-modal__field-label">
                Status
              </label>

              <div
                className={`leave-employee-modal__readonly-status ${getStatusClass(
                  formData.leaveStatus,
                )}`}
              >
                <span className="leave-employee-modal__status-dot" />
                {formData.leaveStatus}
              </div>
            </div>

            <div className="leave-employee-modal__field leave-employee-modal__field--full">
              <label
                htmlFor="leave-reason"
                className="leave-employee-modal__field-label"
              >
                Reason
              </label>

              {isEditMode ? (
                <textarea
                  id="leave-reason"
                  value={formData.reason}
                  onChange={(event) =>
                    handleFieldChange("reason", event.target.value)
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Enter leave reason..."
                  className="leave-employee-modal__textarea"
                  disabled={saving}
                />
              ) : (
                <div className="leave-employee-modal__reason-box">
                  {formData.reason || "-"}
                </div>
              )}
            </div>
          </div>

          {validationError && (
            <div
              className="leave-employee-modal__validation-error"
              role="alert"
            >
              {validationError}
            </div>
          )}
        </div>

        <footer className="leave-employee-modal__footer">
          {isEditMode ? (
            <>
              <button
                type="button"
                className="leave-employee-modal__button leave-employee-modal__button--secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="leave-employee-modal__button leave-employee-modal__button--primary"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                <Check size={17} strokeWidth={2.5} />

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="leave-employee-modal__button leave-employee-modal__button--secondary"
                onClick={handleCancel}
              >
                Close
              </button>

              {onEdit && (
                <button
                  type="button"
                  className="leave-employee-modal__button leave-employee-modal__button--primary"
                  onClick={handleEdit}
                >
                  <Pencil size={16} strokeWidth={2} />
                  Edit Leave
                </button>
              )}
            </>
          )}
        </footer>
      </section>
    </div>
  );
};

export default LeaveEmployeeModal;