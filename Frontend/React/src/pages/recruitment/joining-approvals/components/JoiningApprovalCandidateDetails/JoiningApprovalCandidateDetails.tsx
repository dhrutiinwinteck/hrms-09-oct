import React, { useEffect, useState } from "react";

import {
  X,
  FileText,
  MoreVertical,
  UserRound,
  UsersRound,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  Info,
  Send,
} from "lucide-react";

import type { IDesignation } from "../../../types/application.types";

import type {
  JoiningApproval,
  JoiningApprovalStatus,
} from "../../types/joiningApprovals.types";

import "./JoiningApprovalCandidateDetails.css";

import JoiningApprovalOnboardingDocuments from "../JoiningApprovalOnboardingDocuments/JoiningApprovalOnboardingDocuments";

interface JoiningApprovalCandidateDetailsProps {
  candidate: JoiningApproval;
  designations: IDesignation[];

  onClose: () => void;
  // onEdit: (candidate: JoiningApproval) => void;

  onDelete: (id: string) => void | Promise<void>;

  onAccept: (id: string) => void | Promise<void>;

  onReject: (id: string) => void | Promise<void>;

  onHold: (id: string) => void | Promise<void>;

  onSendJoiningForm: (
    id: string
  ) => void | Promise<void>;

  onUpdateCandidate: (
    id: string,
    changes: {
      designation?: string;
      joiningDate?: string;
      remark?: string;

      reportingManagerStatus?: string | null;
      reportingManagerRemark?: string | null;

      teamManagerStatus?: string | null;
      teamManagerRemark?: string | null;

      hrStatus?: string | null;
      hrRemark?: string | null;
    }
  ) => void | Promise<void>;
}

type CandidateTab =
  | "application"
  | "approval"
  | "documents"
  | "remarks"
  | "sendJoiningForm"
  | "onboardingDocuments";

/* =============================================================
   HELPERS
   ============================================================= */

const getInitials = (
  name: string
): string => {
  const normalizedName =
    name.trim();

  if (!normalizedName) {
    return "C";
  }

  const parts =
    normalizedName
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

const formatDate = (
  value: string
): string => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/* =============================================================
   RESUME URL
   ============================================================= */

const getResumeUrl = (
  resumePath:
    | string
    | null
    | undefined
): string | null => {
  if (
    !resumePath ||
    resumePath === "Not available"
  ) {
    return null;
  }

  if (
    resumePath.startsWith("http")
  ) {
    return resumePath;
  }

  const normalizedPath =
    resumePath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

  const uploadsIndex =
    normalizedPath.indexOf(
      "uploads/"
    );

  if (uploadsIndex === -1) {
    return null;
  }

  const relativePath =
    normalizedPath.substring(
      uploadsIndex
    );

  return `http://localhost:8001/${relativePath}`;
};

/* =============================================================
   STATUS
   ============================================================= */

const normalizeStatus = (
  status: JoiningApprovalStatus
): string => {
  switch (status) {
    case "Approved":
      return "Approved";

    case "Rejected":
      return "Rejected";

    case "On Hold":
      return "On Hold";

    case "Pending":
    default:
      return "Pending";
  }
};

/* =============================================================
   SAVED APPROVAL STATUS
   Backend:
     APPROVED
     REJECTED
     ON_HOLD

   Frontend:
     Accept
     Reject
     On Hold
   ============================================================= */

const mapSavedApprovalAction = (
  value: string | null
): string => {
  const normalized =
    String(value ?? "")
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, "_");

  switch (normalized) {
    case "APPROVED":
    case "ACCEPT":
      return "Accept";

    case "REJECTED":
    case "REJECT":
      return "Reject";

    case "ON_HOLD":
    case "ONHOLD":
    case "HOLD":
      return "On Hold";

    default:
      return "Select";
  }
};

/* =============================================================
   MAIN COMPONENT
   ============================================================= */

export const JoiningApprovalCandidateDetails: React.FC<
  JoiningApprovalCandidateDetailsProps
> = ({
  candidate,
  designations,
  onClose,
  // onEdit,
  onDelete,
  onAccept,
  onReject,
  onHold,
  onSendJoiningForm,
  onUpdateCandidate,
}) => {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<CandidateTab>(
      "application"
    );

  const [
    showMoreActions,
    setShowMoreActions,
  ] =
    useState(false);

  const [
    isEditMode,
    setIsEditMode,
  ] =
    useState(false);

  /* ==========================================================
     EDIT DESIGNATION
     ========================================================== */

  const [
    editDesignationId,
    setEditDesignationId,
  ] =
    useState<string>("");

  const [
    editDesignation,
    setEditDesignation,
  ] =
    useState<string>(
      candidate.designation || ""
    );

  const [
    editDepartment,
    setEditDepartment,
  ] =
    useState<string>("");

  /* ==========================================================
     EDIT JOINING DATE
     ========================================================== */

  const [
    editJoiningDate,
    setEditJoiningDate,
  ] =
    useState<string>(
      candidate.joiningDate || ""
    );

  /* ==========================================================
     DESIGNATION LOOKUP
     ========================================================== */

  const findDesignation = (
    name: string
  ): IDesignation | undefined => {
    const normalizedName =
      name.trim().toLowerCase();

    if (!normalizedName) {
      return undefined;
    }

    return designations.find(
      designation =>
        designation.name
          .trim()
          .toLowerCase() ===
        normalizedName
    );
  };

  /* ==========================================================
     HR APPROVAL
     ========================================================== */

  const [
    approvalAction,
    setApprovalAction,
  ] =
    useState<string>(
      mapSavedApprovalAction(
        candidate.hrStatus
      )
    );

  /* ==========================================================
     HR REMARK
     ========================================================== */

  const [
    hrRemark,
    setHrRemark,
  ] =
    useState<string>(
      candidate.hrRemark || ""
    );

  /* ==========================================================
     REPORTING MANAGER
     ========================================================== */

  const [
    reportingManagerAction,
    setReportingManagerAction,
  ] =
    useState<string>(
      mapSavedApprovalAction(
        candidate.reportingManagerStatus
      )
    );

  const [
    reportingManagerRemark,
    setReportingManagerRemark,
  ] =
    useState<string>(
      candidate.reportingManagerRemark ||
        ""
    );

  /* ==========================================================
     TEAM MANAGER
     ========================================================== */

  const [
    teamManagerAction,
    setTeamManagerAction,
  ] =
    useState<string>(
      mapSavedApprovalAction(
        candidate.teamManagerStatus
      )
    );

  const [
    teamManagerRemark,
    setTeamManagerRemark,
  ] =
    useState<string>(
      candidate.teamManagerRemark ||
        ""
    );

  const status =
    normalizeStatus(
      candidate.status
    );

  const initials =
    getInitials(
      candidate.candidateName
    );

  const resumeUrl =
    getResumeUrl(
      candidate.resumePath
    );

  /* ==========================================================
     BODY SCROLL LOCK / ESCAPE
     ========================================================== */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ): void => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [onClose]);

  /* ==========================================================
     IMPORTANT:
     LOAD FRESH SAVED APPROVAL / REMARK VALUES
     WHEN CANDIDATE DATA CHANGES
     ========================================================== */

  useEffect(() => {
    setApprovalAction(
      mapSavedApprovalAction(
        candidate.hrStatus
      )
    );

    setHrRemark(
      candidate.hrRemark || ""
    );

    setReportingManagerAction(
      mapSavedApprovalAction(
        candidate.reportingManagerStatus
      )
    );

    setReportingManagerRemark(
      candidate.reportingManagerRemark ||
        ""
    );

    setTeamManagerAction(
      mapSavedApprovalAction(
        candidate.teamManagerStatus
      )
    );

    setTeamManagerRemark(
      candidate.teamManagerRemark ||
        ""
    );
  }, [
    candidate.id,
    candidate.hrStatus,
    candidate.hrRemark,
    candidate.reportingManagerStatus,
    candidate.reportingManagerRemark,
    candidate.teamManagerStatus,
    candidate.teamManagerRemark,
  ]);

  /* ==========================================================
     OVERLAY
     ========================================================== */

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ): void => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };

  /* ==========================================================
     TABS
     ========================================================== */

  const handleTabChange = (
    tab: CandidateTab
  ): void => {
    setActiveTab(tab);
  };

  /* ==========================================================
     SAVE APPROVALS
     ========================================================== */
 const handleSaveApprovals =
  async (): Promise<void> => {

    const selectedAction =
      approvalAction.trim();

    if (selectedAction === "Select") {
      return;
    }

    const convertStatus = (
      value: string
    ): string | null => {

      switch (value) {

        case "Accept":
          return "APPROVED";

        case "Reject":
          return "REJECTED";

        case "On Hold":
          return "ON_HOLD";

        default:
          return null;
      }
    };

    try {

      /*
       * STEP 1
       * Update overall joining status first.
       */

      switch (selectedAction) {

        case "Accept":
          await onAccept(candidate.id);
          break;

        case "Reject":
          await onReject(candidate.id);
          break;

        case "On Hold":
          await onHold(candidate.id);
          break;

        default:
          return;
      }

      /*
       * STEP 2
       * Save all approval statuses and remarks.
       *
       * This runs after the overall status update.
       */

      await onUpdateCandidate(
        candidate.id,
        {
          reportingManagerStatus:
            convertStatus(
              reportingManagerAction
            ),

          reportingManagerRemark:
            reportingManagerRemark.trim() || null,

          teamManagerStatus:
            convertStatus(
              teamManagerAction
            ),

          teamManagerRemark:
            teamManagerRemark.trim() || null,

          hrStatus:
            convertStatus(
              approvalAction
            ),

          hrRemark:
            hrRemark.trim() || null,
        }
      );

      /*
       * STEP 3
       * Close modal only after both operations succeed.
       */

      onClose();

    } catch (error) {

      console.error(
        "Failed to save candidate approval:",
        error
      );

      window.alert(
        "Failed to save candidate approval. Please try again."
      );
    }
  };
   

  /* ==========================================================
     TODAY
     ========================================================== */

  const getTodayDate = (): string => {
    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /* ==========================================================
     SAVE EDIT
     ========================================================== */

  const handleSaveEdit =
    async (): Promise<void> => {
      if (
        !editDesignation.trim()
      ) {
        window.alert(
          "Please select a designation."
        );

        return;
      }

      if (!editJoiningDate) {
        window.alert(
          "Please select a joining date."
        );

        return;
      }

      if (
        editJoiningDate <
        getTodayDate()
      ) {
        window.alert(
          "Joining date cannot be in the past."
        );

        return;
      }

      try {
        await onUpdateCandidate(
          candidate.id,
          {
            designation:
              editDesignation.trim(),

            joiningDate:
              editJoiningDate,
          }
        );

        setIsEditMode(false);

        onClose();
      } catch (error) {
        console.error(
          "Failed to update candidate:",
          error
        );

        window.alert(
          "Failed to update candidate."
        );
      }
    };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className="candidate-details-overlay"
      role="presentation"
      onMouseDown={
        handleOverlayClick
      }
    >
      <section
        className="candidate-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-details-title"
        onMouseDown={event =>
          event.stopPropagation()
        }
      >
        {/* =====================================================
            MODAL HEADER
            ===================================================== */}

        <header className="candidate-details-header">
          <h2
            id="candidate-details-title"
            className="candidate-details-title"
          >
            Candidate Details
          </h2>

          <button
            type="button"
            className="candidate-details-close"
            onClick={onClose}
            aria-label="Close candidate details"
          >
            <X
              size={22}
              strokeWidth={1.8}
            />
          </button>
        </header>

        {/* =====================================================
            CANDIDATE SUMMARY
            ===================================================== */}

        <div className="candidate-details-summary">
          <div className="candidate-details-profile">
            <div className="candidate-details-avatar">
              {candidate.avatar ? (
                <img
                  src={
                    candidate.avatar
                  }
                  alt=""
                />
              ) : (
                <span>
                  {initials}
                </span>
              )}
            </div>

            <div className="candidate-details-identity">
              <div className="candidate-details-name-row">
                <h3>
                  {
                    candidate.candidateName
                  }
                </h3>

                <span
                  className={`candidate-details-status candidate-details-status--${candidate.status
                    .toLowerCase()
                    .replace(
                      /\s+/g,
                      "-"
                    )}`}
                >
                  {status}
                </span>
              </div>

              <p className="candidate-details-designation">
                {
                  candidate.designation
                }
              </p>

              <div className="candidate-details-contact-list">
                <span>
                  <Mail size={14} />
                  {
                    candidate.email ||
                    "-"
                  }
                </span>

                <span>
                  <Phone size={14} />
                  {
                    candidate.phoneNumber ||
                    "Not available"
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="candidate-details-summary-actions">
            <button
              type="button"
              className="candidate-details-resume-btn"
              disabled={
                !resumeUrl
              }
              onClick={() => {
                if (resumeUrl) {
                  window.open(
                    resumeUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              title={
                resumeUrl
                  ? "View Resume"
                  : "Resume not available"
              }
            >
              <FileText size={16} />
              <span>
                View Resume
              </span>
            </button>

            <div className="candidate-details-more-wrapper">
              <button
                type="button"
                className="candidate-details-more-btn"
                onClick={() =>
                  setShowMoreActions(
                    !showMoreActions
                  )
                }
              >
                <MoreVertical
                  size={18}
                />
              </button>

              {showMoreActions && (
                <div className="candidate-details-more-menu">
                  {/* EDIT */}

                  <button
                    type="button"
                    onClick={() => {
                      const currentDesignation =
                        findDesignation(
                          candidate.designation
                        );

                      if (
                        !currentDesignation
                      ) {
                        window.alert(
                          "Current designation was not found."
                        );

                        return;
                      }

                      setEditDesignationId(
                        String(
                          currentDesignation.id
                        )
                      );

                      setEditDesignation(
                        currentDesignation.name
                      );

                      setEditDepartment(
                        currentDesignation.department_name
                      );

                      setEditJoiningDate(
                        candidate.joiningDate ||
                        ""
                      );

                      setIsEditMode(
                        true
                      );

                      setShowMoreActions(
                        false
                      );
                    }}
                  >
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreActions(
                        false
                      );

                      const confirmed =
                        window.confirm(
                          "Are you sure you want to delete this candidate?"
                        );

                      if (
                        confirmed
                      ) {
                        onDelete(
                          String(
                            candidate.id
                          )
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            TABS
            ===================================================== */}

        <nav
          className="candidate-details-tabs"
          aria-label="Candidate detail sections"
        >
          <button
            type="button"
            className={
              activeTab ===
              "application"
                ? "candidate-details-tab is-active"
                : "candidate-details-tab"
            }
            onClick={() =>
              handleTabChange(
                "application"
              )
            }
          >
            Application Details
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "approval"
                ? "candidate-details-tab is-active"
                : "candidate-details-tab"
            }
            onClick={() =>
              handleTabChange(
                "approval"
              )
            }
          >
            Approval Status
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "documents"
                ? "candidate-details-tab is-active"
                : "candidate-details-tab"
            }
            onClick={() =>
              handleTabChange(
                "documents"
              )
            }
          >
            Documents
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "remarks"
                ? "candidate-details-tab is-active"
                : "candidate-details-tab"
            }
            onClick={() =>
              handleTabChange(
                "remarks"
              )
            }
          >
            Remarks
          </button>

          {candidate.status ===
            "Approved" && (
            <button
              type="button"
              className={
                activeTab ===
                "sendJoiningForm"
                  ? "candidate-details-tab is-active"
                  : "candidate-details-tab"
              }
              onClick={() =>
                handleTabChange(
                  "sendJoiningForm"
                )
              }
            >
              Send Joining Form
            </button>

            
          )}

          {candidate.status === "Approved" && (
  <button
    type="button"
    className={
      activeTab === "onboardingDocuments"
        ? "candidate-details-tab is-active"
        : "candidate-details-tab"
    }
    onClick={() =>
      handleTabChange(
        "onboardingDocuments",
      )
    }
  >
    Onboarding Documents
  </button>
)}
        </nav>

        {/* =====================================================
            BODY
            ===================================================== */}

        <div className="candidate-details-body">

          {/* ===================================================
              APPLICATION DETAILS
              =================================================== */}

          {activeTab ===
            "application" && (
            <>
              {/* =================================================
                  PERSONAL INFORMATION
                  ================================================= */}

              <section className="candidate-details-card">
                <div className="candidate-details-card-header">
                  <h3>
                    Personal Information
                  </h3>
                </div>

                <div className="candidate-details-grid">
                  <DetailItem
                    icon={
                      <UserRound
                        size={18}
                      />
                    }
                    label="Full Name"
                    value={
                      candidate.candidateName
                    }
                  />

                  <DetailItem
                    icon={
                      <UsersRound
                        size={18}
                      />
                    }
                    label="Refer By"
                    value={
                      candidate.referredBy ||
                      "-"
                    }
                  />

                  <DetailItem
                    icon={
                      <Mail
                        size={18}
                      />
                    }
                    label="Email ID"
                    value={
                      candidate.email ||
                      "-"
                    }
                  />

                  {isEditMode ? (
                    <div className="candidate-detail-item">
                      <div className="candidate-detail-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div className="candidate-detail-content">
                        <span className="candidate-detail-label">
                          Expected Joining Date
                        </span>

                        <input
                          type="date"
                          className="candidate-edit-input"
                          value={
                            editJoiningDate
                          }
                          min={
                            getTodayDate()
                          }
                          onChange={
                            event =>
                              setEditJoiningDate(
                                event
                                  .target
                                  .value
                              )
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailItem
                      icon={
                        <CalendarDays
                          size={18}
                        />
                      }
                      label="Expected Joining Date"
                      value={
                        candidate.joiningDate
                          ? formatDate(
                              candidate.joiningDate
                            )
                          : "-"
                      }
                    />
                  )}

                  <DetailItem
                    icon={
                      <Phone
                        size={18}
                      />
                    }
                    label="Contact Number"
                    value={
                      candidate.phoneNumber ||
                      "Not available"
                    }
                  />

                  <DetailItem
                    icon={
                      <CalendarDays
                        size={18}
                      />
                    }
                    label="Applied On"
                    value={
                      candidate.appliedOn
                        ? formatDate(
                            candidate.appliedOn
                          )
                        : "-"
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  EMPLOYMENT DETAILS
                  ================================================= */}

              <section className="candidate-details-card">
                <div className="candidate-details-card-header">
                  <h3>
                    Employment Details
                  </h3>
                </div>

                <div className="candidate-details-grid">

                  {/* =================================================
                      DESIGNATION
                      ================================================= */}

                  {isEditMode ? (
                    <div className="candidate-detail-item">
                      <div className="candidate-detail-icon">
                        <FileText size={18} />
                      </div>

                      <div className="candidate-detail-content">
                        <span className="candidate-detail-label">
                          Designation
                        </span>

                        <select
                          className="candidate-edit-input candidate-edit-select"
                          value={
                            editDesignationId
                          }
                          onChange={
                            event => {
                              const selectedDesignation =
                                designations.find(
                                  designation =>
                                    String(
                                      designation.id
                                    ) ===
                                    event
                                      .target
                                      .value
                                );

                              if (
                                !selectedDesignation
                              ) {
                                setEditDesignationId(
                                  ""
                                );

                                setEditDesignation(
                                  ""
                                );

                                setEditDepartment(
                                  ""
                                );

                                return;
                              }

                              setEditDesignationId(
                                String(
                                  selectedDesignation.id
                                )
                              );

                              setEditDesignation(
                                selectedDesignation.name
                              );

                              setEditDepartment(
                                selectedDesignation.department_name
                              );
                            }
                          }
                        >
                          <option value="">
                            Select designation
                          </option>

                          {designations.map(
                            designation => (
                              <option
                                key={
                                  designation.id
                                }
                                value={String(
                                  designation.id
                                )}
                              >
                                {
                                  designation.name
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <DetailItem
                      icon={
                        <FileText
                          size={18}
                        />
                      }
                      label="Designation"
                      value={
                        candidate.designation
                      }
                    />
                  )}

                  {/* =================================================
                      LOCATION
                      ================================================= */}

                  <DetailItem
                    icon={
                      <MapPin
                        size={18}
                      />
                    }
                    label="Location"
                    value={
                      candidate.location
                    }
                  />

                  {/* =================================================
                      DEPARTMENT
                      ================================================= */}

                  {isEditMode ? (
                    <div className="candidate-detail-item">
                      <div className="candidate-detail-icon">
                        <CalendarDays size={18} />
                      </div>

                      <div className="candidate-detail-content">
                        <span className="candidate-detail-label">
                          Department
                        </span>

                        <input
                          type="text"
                          className="candidate-edit-input candidate-edit-input--readonly"
                          value={
                            editDepartment
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <DetailItem
                      icon={
                        <CalendarDays
                          size={18}
                        />
                      }
                      label="Department"
                      value={
                        findDesignation(
                          candidate.designation
                        )
                          ?.department_name ||
                        "-"
                      }
                    />
                  )}

                  {/* =================================================
                      CURRENT STATUS
                      ================================================= */}

                  <DetailItem
                    icon={
                      <Info
                        size={18}
                      />
                    }
                    label="Current Status"
                    value={
                      <span
                        className={`detail-status detail-status--${candidate.status
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {status}
                      </span>
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  APPROVAL SECTION
                  ================================================= */}

              <ApprovalSection
                approvalAction={
                  approvalAction
                }
                setApprovalAction={
                  setApprovalAction
                }
                hrRemark={
                  hrRemark
                }
                setHrRemark={
                  setHrRemark
                }
                reportingManagerAction={
                  reportingManagerAction
                }
                setReportingManagerAction={
                  setReportingManagerAction
                }
                reportingManagerRemark={
                  reportingManagerRemark
                }
                setReportingManagerRemark={
                  setReportingManagerRemark
                }
                teamManagerAction={
                  teamManagerAction
                }
                setTeamManagerAction={
                  setTeamManagerAction
                }
                teamManagerRemark={
                  teamManagerRemark
                }
                setTeamManagerRemark={
                  setTeamManagerRemark
                }
              />
            </>
          )}

          {/* ===================================================
              APPROVAL TAB
              =================================================== */}

          {activeTab ===
            "approval" && (
            <ApprovalSection
              approvalAction={
                approvalAction
              }
              setApprovalAction={
                setApprovalAction
              }
              hrRemark={
                hrRemark
              }
              setHrRemark={
                setHrRemark
              }
              reportingManagerAction={
                reportingManagerAction
              }
              setReportingManagerAction={
                setReportingManagerAction
              }
              reportingManagerRemark={
                reportingManagerRemark
              }
              setReportingManagerRemark={
                setReportingManagerRemark
              }
              teamManagerAction={
                teamManagerAction
              }
              setTeamManagerAction={
                setTeamManagerAction
              }
              teamManagerRemark={
                teamManagerRemark
              }
              setTeamManagerRemark={
                setTeamManagerRemark
              }
            />
          )}

          {/* ===================================================
              DOCUMENTS TAB
              =================================================== */}

          {activeTab ===
            "documents" && (
            <section className="candidate-details-card">
              <div className="candidate-details-card-header">
                <h3>
                  Documents
                </h3>
              </div>

              {resumeUrl ? (
                <div className="candidate-detail-item">
                  <div className="candidate-detail-icon">
                    <FileText size={18} />
                  </div>

                  <div className="candidate-detail-content">
                    <span className="candidate-detail-label">
                      Resume
                    </span>

                    <span className="candidate-detail-value">
                      {
                        candidate.resumeOriginalName ||
                        "Resume"
                      }
                    </span>

                    <button
                      type="button"
                      className="candidate-details-save-btn"
                      onClick={() => {
                        window.open(
                          resumeUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      <FileText size={16} />
                      View Resume
                    </button>
                  </div>
                </div>
              ) : (
                <p>
                  Resume is not available.
                </p>
              )}
            </section>
          )}

          {/* ===================================================
              REMARKS TAB
              =================================================== */}

          {activeTab ===
            "remarks" && (
            <section className="candidate-details-card">
              <div className="candidate-details-card-header">
                <h3>
                  Remarks
                </h3>
              </div>

              <div className="candidate-details-remark">
                {candidate.hrRemark?.trim() ? (
                  <p>
                    {
                      candidate.hrRemark
                    }
                  </p>
                ) : (
                  <p className="is-empty">
                    No HR remark has been added.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* ===================================================
              SEND JOINING FORM
              =================================================== */}

          {activeTab ===
            "sendJoiningForm" && (
            <section className="candidate-details-card candidate-send-form-card">
              <div className="candidate-send-form-content">

                {/* HEADER */}

                <div className="candidate-send-form-header">
                  <h3>
                    Send Joining Form
                  </h3>

                  <p>
                    Send the joining form link to this candidate's registered
                    email address.
                  </p>
                </div>

                {/* INFORMATION CARD */}

                <div className="candidate-send-form-info-card">

                  {/* EMAIL */}

                  <div className="candidate-send-form-info-row">
                    <div className="candidate-send-form-info-icon">
                      <Mail size={21} />
                    </div>

                    <div className="candidate-send-form-info-content">
                      <span className="candidate-send-form-info-label">
                        Recipient Email
                      </span>

                      <strong className="candidate-send-form-info-value">
                        {
                          candidate.email ||
                          "-"
                        }
                      </strong>

                      <span className="candidate-send-form-success">
                        <span className="candidate-send-form-success-icon">
                          ✓
                        </span>

                        This is the candidate's registered email address.
                      </span>
                    </div>
                  </div>

                  {/* DIVIDER */}

                  <div className="candidate-send-form-divider" />

                  {/* JOINING DATE */}

                  <div className="candidate-send-form-info-row">
                    <div className="candidate-send-form-info-icon">
                      <CalendarDays size={21} />
                    </div>

                    <div className="candidate-send-form-info-content">
                      <span className="candidate-send-form-info-label">
                        Joining Date
                      </span>

                      <strong className="candidate-send-form-info-value">
                        {
                          candidate.joiningDate
                            ? formatDate(
                                candidate.joiningDate
                              )
                            : "Not specified"
                        }
                      </strong>

                      <span className="candidate-send-form-date-info">
                        <span className="candidate-send-form-date-info-icon">
                          i
                        </span>

                        This joining date will be communicated in the joining
                        form.
                      </span>
                    </div>
                  </div>
                </div>

                {/* GENERAL INFORMATION */}

                <div className="candidate-send-form-note">
                  <span className="candidate-send-form-note-icon">
                    i
                  </span>

                  <span>
                    The joining form link will be sent to the above email
                    address with the joining date mentioned. Please ensure the
                    details are correct.
                  </span>
                </div>

                {/* SEND BUTTON */}

                <button
                  type="button"
                  className="candidate-send-form-button"
                  onClick={
                    async (): Promise<void> => {
                      if (
                        !candidate.email?.trim()
                      ) {
                        window.alert(
                          "Candidate email address is unavailable."
                        );

                        return;
                      }

                      if (
                        !candidate.joiningDate
                      ) {
                        window.alert(
                          "Please select a joining date before sending the joining form."
                        );

                        return;
                      }

                      try {
                        await onSendJoiningForm(
                          candidate.id
                        );

                        window.alert(
                          "Joining form link sent successfully."
                        );
                      } catch (
                        error: unknown
                      ) {
                        console.error(
                          "Failed to send joining form:",
                          error
                        );

                        window.alert(
                          "Failed to send joining form link."
                        );
                      }
                    }
                  }
                >
                  <Send size={16} />

                  Send Joining Form
                </button>
              </div>
            </section>
          )}

          {/* ===================================================
    ONBOARDING DOCUMENTS
    =================================================== */}

{activeTab === "onboardingDocuments" && (
  <JoiningApprovalOnboardingDocuments
    candidate={candidate}
  />
)}
        </div>

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <footer className="candidate-details-footer">
          <div className="candidate-details-footer-actions">

            {isEditMode ? (
              <>
                <button
                  type="button"
                  className="candidate-details-cancel-btn"
                  onClick={() => {
                    setIsEditMode(
                      false
                    );

                    setEditDesignation(
                      candidate.designation ||
                      ""
                    );

                    setEditDesignationId(
                      ""
                    );

                    setEditDepartment(
                      ""
                    );

                    setEditJoiningDate(
                      candidate.joiningDate ||
                      ""
                    );
                  }}
                >
                  Cancel Edit
                </button>

                <button
                  type="button"
                  className="candidate-details-save-btn"
                  onClick={
                    handleSaveEdit
                  }
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                className="candidate-details-save-btn"
                onClick={
                  handleSaveApprovals
                }
                disabled={
                  approvalAction ===
                  "Select"
                }
              >
                <Send size={16} />

                Save Approvals
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

/* =============================================================
   DETAIL ITEM
   ============================================================= */

interface DetailItemProps {
  icon: React.ReactNode;

  label: string;

  value: React.ReactNode;
}

const DetailItem: React.FC<
  DetailItemProps
> = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="candidate-detail-item">
      <div className="candidate-detail-icon">
        {icon}
      </div>

      <div className="candidate-detail-content">
        <span className="candidate-detail-label">
          {label}
        </span>

        <span className="candidate-detail-value">
          {value || "-"}
        </span>
      </div>
    </div>
  );
};

/* =============================================================
   APPROVAL SECTION
   ============================================================= */

interface ApprovalSectionProps {
  approvalAction: string;

  setApprovalAction:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  hrRemark: string;

  setHrRemark:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  reportingManagerAction: string;

  setReportingManagerAction:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  reportingManagerRemark: string;

  setReportingManagerRemark:
    (
      value: string
    ) => void;

  teamManagerAction: string;

  setTeamManagerAction:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  teamManagerRemark: string;

  setTeamManagerRemark:
    (
      value: string
    ) => void;
}

const ApprovalSection: React.FC<
  ApprovalSectionProps
> = ({
  approvalAction,
  setApprovalAction,

  hrRemark,
  setHrRemark,

  reportingManagerAction,
  setReportingManagerAction,

  reportingManagerRemark,
  setReportingManagerRemark,

  teamManagerAction,
  setTeamManagerAction,

  teamManagerRemark,
  setTeamManagerRemark,
}) => {
  /*
   * These states are controlled by the
   * parent candidate-details component.
   */

  return (
    <section className="candidate-details-card candidate-approval-card">
      <div className="candidate-details-card-header">
        <div>
          <h3>
            Approval Status
          </h3>

          <p>
            Take action at each approval level.
          </p>
        </div>
      </div>

      <div className="approval-level-grid">

        {/* =====================================================
            REPORTING MANAGER
            ===================================================== */}

        <ApprovalLevel
          label="Reporting Manager"
          value={
            reportingManagerAction
          }
          status={
            reportingManagerAction ===
            "Accept"
              ? "approved"
              : reportingManagerAction ===
                  "Reject"
                ? "rejected"
                : "neutral"
          }
          onChange={
            setReportingManagerAction
          }
          saveToDatabase={true}
          remark={
            reportingManagerRemark
          }
          onRemarkChange={
            setReportingManagerRemark
          }
        />

        {/* =====================================================
            TEAM MANAGER
            ===================================================== */}

        <ApprovalLevel
          label="Team Manager"
          value={
            teamManagerAction
          }
          status={
            teamManagerAction ===
            "Accept"
              ? "approved"
              : teamManagerAction ===
                  "Reject"
                ? "rejected"
                : "neutral"
          }
          onChange={
            setTeamManagerAction
          }
          saveToDatabase={true}
          remark={
            teamManagerRemark
          }
          onRemarkChange={
            setTeamManagerRemark
          }
        />

        {/* =====================================================
            HR
            ===================================================== */}

        <ApprovalLevel
          label="HR"
          value={
            approvalAction
          }
          status={
            approvalAction ===
            "Accept"
              ? "approved"
              : approvalAction ===
                  "Reject"
                ? "rejected"
                : "neutral"
          }
          onChange={
            setApprovalAction
          }
          saveToDatabase={true}
          remark={
            hrRemark
          }
          onRemarkChange={
            setHrRemark
          }
        />
      </div>
    </section>
  );
};

/* =============================================================
   APPROVAL LEVEL
   ============================================================= */

interface ApprovalLevelProps {
  label: string;

  value: string;

  status:
    | "rejected"
    | "approved"
    | "neutral";

  onChange:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  saveToDatabase: boolean;

  remark: string;

  onRemarkChange:
    (
      value: string
    ) => void;
}

const ApprovalLevel: React.FC<
  ApprovalLevelProps
> = ({
  label,
  value,
  status,
  onChange,
  saveToDatabase,
  remark,
  onRemarkChange,
}) => {
  return (
    <div
      className="approval-level"
      data-save-to-database={
        saveToDatabase
          ? "true"
          : "false"
      }
    >
      <label>
        {label}
      </label>

      <div className="approval-select-wrapper">
        <span
          className={`approval-dot approval-dot--${status}`}
        />

        <select
          value={value}
          onChange={
            event => {
              onChange(
                event.target.value
              );
            }
          }
          aria-label={`${label} approval`}
        >
          <option value="Select">
            Select
          </option>

          <option value="Accept">
            Accept
          </option>

          <option value="Reject">
            Reject
          </option>

          <option value="On Hold">
            On Hold
          </option>
        </select>
      </div>

      <textarea
        className="approval-remark"
        placeholder="Add remark..."
        rows={2}
        value={remark}
        onChange={
          event => {
            onRemarkChange(
              event.target.value
            );
          }
        }
      />
    </div>
  );
};