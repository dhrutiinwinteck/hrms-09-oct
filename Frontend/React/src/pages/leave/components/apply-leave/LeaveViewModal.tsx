import React from "react";

import {
  CalendarDays,
  Clock3,
  FileText,
  User,
  X,
} from "lucide-react";

import type {
  LeaveEmployeeRecord,
} from "../../types/leave.types";

import "./LeaveViewModal.css";

interface LeaveViewModalProps {
  isOpen: boolean;
  leave: LeaveEmployeeRecord | null;
  onClose: () => void;
}

// ==========================================================
// FORMAT DATE
// ==========================================================

const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return "-";
  }

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

// ==========================================================
// STATUS CLASS
// ==========================================================

const getStatusClass = (
  status: string
): string => {
  const normalized =
    status.trim().toLowerCase();

  if (
    normalized === "approved"
  ) {
    return "leave-view-status leave-view-status--approved";
  }

  if (
    normalized === "rejected"
  ) {
    return "leave-view-status leave-view-status--rejected";
  }

  return "leave-view-status leave-view-status--pending";
};

// ==========================================================
// COMPONENT
// ==========================================================

const LeaveViewModal: React.FC<
  LeaveViewModalProps
> = ({
  isOpen,
  leave,
  onClose,
}) => {
  // --------------------------------------------------------
  // Do not render when closed
  // --------------------------------------------------------

  if (!isOpen || !leave) {
    return null;
  }

  // --------------------------------------------------------
  // Employee information
  // --------------------------------------------------------

  const employeeName =
    leave.name?.trim() || "-";

//   const designation =
//     leave.designation_name?.trim() ||
//     (
//       typeof leave.designation ===
//       "string"
//         ? leave.designation.trim()
//         : ""
//     ) ||
//     "-";

//   const department =
//     leave.department?.trim() ||
//     "-";

  const employeeId =
    leave.employeeId?.trim() ||
    "-";

  const email =
    leave.email?.trim() ||
    "-";

  // --------------------------------------------------------
  // Leave information
  // --------------------------------------------------------

  const leaveType =
    String(
      leave.leaveType ?? ""
    ).trim() || "-";

  const status =
    String(
      leave.leaveStatus ?? ""
    ).trim() || "Pending";

  const reason =
    leave.reason?.trim() ||
    "No reason provided";

  const numberOfDays =
    Number(
      leave.noOfDays ?? 0
    );

  // --------------------------------------------------------
  // ESC key
  // --------------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="leave-view-modal-overlay"
      onMouseDown={onClose}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="leave-view-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-view-modal-title"
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="leave-view-modal__header">

          <div className="leave-view-modal__employee">

            <div className="leave-view-modal__avatar">

              {leave.avatar ? (
                <img
                  src={leave.avatar}
                  alt={employeeName}
                />
              ) : (
                <User size={24} />
              )}

            </div>

            <div>
              <h2
                id="leave-view-modal-title"
              >
                Leave Details
              </h2>

              <p>
                {employeeName}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="leave-view-modal__close"
            onClick={onClose}
            aria-label="Close leave details"
            title="Close"
          >
            <X size={20} />
          </button>

        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="leave-view-modal__body">

          {/* ==================================================
              EMPLOYEE INFORMATION
          ================================================== */}

          <section className="leave-view-modal__section">

            <div className="leave-view-modal__section-title">
              <User size={17} />
              <span>
                Employee Information
              </span>
            </div>

            <div className="leave-view-modal__grid">

              <div className="leave-view-modal__item">
                <span>
                  Employee ID
                </span>

                <strong>
                  {employeeId}
                </strong>
              </div>

              <div className="leave-view-modal__item">
                <span>
                  Employee Name
                </span>

                <strong>
                  {employeeName}
                </strong>
              </div>

              {/* <div className="leave-view-modal__item">
                <span>
                  Department
                </span>

                <strong>
                  {department}
                </strong>
              </div> */}

              {/* <div className="leave-view-modal__item">
                <span>
                  Designation
                </span>

                <strong>
                  {designation}
                </strong>
              </div> */}

              <div className="leave-view-modal__item">
                <span>
                  Email
                </span>

                <strong>
                  {email}
                </strong>
              </div>

            </div>

          </section>

          {/* ==================================================
              LEAVE INFORMATION
          ================================================== */}

          <section className="leave-view-modal__section">

            <div className="leave-view-modal__section-title">
              <CalendarDays size={17} />
              <span>
                Leave Information
              </span>
            </div>

            <div className="leave-view-modal__grid">

              <div className="leave-view-modal__item">
                <span>
                  Leave Type
                </span>

                <strong>
                  {leaveType}
                </strong>
              </div>

              <div className="leave-view-modal__item">
                <span>
                  Number of Days
                </span>

                <strong>
                  {numberOfDays}{" "}
                  {numberOfDays === 1
                    ? "Day"
                    : "Days"}
                </strong>
              </div>

              <div className="leave-view-modal__item">
                <span>
                  From Date
                </span>

                <strong>
                  {formatDate(
                    leave.from
                  )}
                </strong>
              </div>

              <div className="leave-view-modal__item">
                <span>
                  To Date
                </span>

                <strong>
                  {formatDate(
                    leave.to
                  )}
                </strong>
              </div>

              <div className="leave-view-modal__item">
                <span>
                  Half Day
                </span>

                <strong>
                  {leave.halfDay
                    ? "Yes"
                    : "No"}
                </strong>
              </div>

            </div>

          </section>

          {/* ==================================================
              STATUS
          ================================================== */}

          <section className="leave-view-modal__section">

            <div className="leave-view-modal__section-title">
              <Clock3 size={17} />
              <span>
                Leave Status
              </span>
            </div>

            <div className="leave-view-modal__status-row">

              <span
                className={getStatusClass(
                  status
                )}
              >
                {status}
              </span>

            </div>

          </section>

          {/* ==================================================
              REASON
          ================================================== */}

          <section className="leave-view-modal__section">

            <div className="leave-view-modal__section-title">
              <FileText size={17} />
              <span>
                Reason
              </span>
            </div>

            <div className="leave-view-modal__reason">
              {reason}
            </div>

          </section>

          {/* ==================================================
              APPROVAL INFORMATION
          ================================================== */}

          {(
            leave.approvedBy !==
              null ||
            leave.approvedOn
          ) && (
            <section className="leave-view-modal__section">

              <div className="leave-view-modal__section-title">
                <Clock3 size={17} />
                <span>
                  Approval Information
                </span>
              </div>

              <div className="leave-view-modal__grid">

                <div className="leave-view-modal__item">
                  <span>
                    Approved By
                  </span>

                  <strong>
                    {leave.approvedBy ??
                      "-"}
                  </strong>
                </div>

                <div className="leave-view-modal__item">
                  <span>
                    Approved On
                  </span>

                  <strong>
                    {leave.approvedOn
                      ? formatDate(
                          leave.approvedOn
                        )
                      : "-"}
                  </strong>
                </div>

              </div>

            </section>
          )}

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="leave-view-modal__footer">

          <button
            type="button"
            className="leave-view-modal__close-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default LeaveViewModal;