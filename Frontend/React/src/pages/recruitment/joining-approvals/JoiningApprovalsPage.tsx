import React from "react";

import type { JoiningApproval } from "./types/joiningApprovals.types";

import { JoiningApprovalsHeader } from "./components/JoiningApprovalsHeader/JoiningApprovalsHeader";

import { JoiningApprovalStats } from "./components/JoiningApprovalStats/JoiningApprovalStats";

import { JoiningApprovalFilters } from "./components/JoiningApprovalFilters/JoiningApprovalFilters";

import { JoiningApprovalTable } from "./components/JoiningApprovalTable/JoiningApprovalTable";

import { JoiningApprovalCandidateDetails } from "./components/JoiningApprovalCandidateDetails/JoiningApprovalCandidateDetails";

import { useJoiningApprovals } from "./hooks/useJoiningApprovals";

import "./JoiningApprovalsPage.css";

export const JoiningApprovalsPage: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] =
    React.useState<JoiningApproval | null>(null);

  const [acceptedApplications, setAcceptedApplications] = React.useState<
    Set<string>
  >(new Set());

  const [candidateDetailsOpen, setCandidateDetailsOpen] =
    React.useState<boolean>(false);

  const handleCandidateClick = (candidate: JoiningApproval): void => {
    setSelectedCandidate(candidate);
    setCandidateDetailsOpen(true);
  };

  const handleCloseCandidateDetails = (): void => {
    setCandidateDetailsOpen(false);
    setSelectedCandidate(null);
  };

  const {
    actionLoading,

    candidates,
    total,

    stats,

    filters,
    searchTerm,

    pagination,

    designations,
    departments,

    applyFilters,
    resetFilters,
    handleSearch,
    goToPage,

    acceptApplication,
    rejectApplication,
    holdApplication,
    sendJoiningForm,

    updateCandidate,
    deleteCandidate,
  } = useJoiningApprovals();

  /* ==========================================================
     ACCEPT
     ========================================================== */

  const handleAccept = async (id: string): Promise<void> => {
    try {
      await acceptApplication(id);

      setAcceptedApplications((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } catch (error) {
      console.error("Accept application failed:", error);
    }
  };

  /* ==========================================================
     REJECT
     ========================================================== */

  const handleReject = async (id: string): Promise<void> => {
    try {
      await rejectApplication(id);
    } catch (error) {
      console.error("Reject application failed:", error);
    }
  };

  /* ==========================================================
     HOLD
     ========================================================== */

  const handleHold = async (id: string): Promise<void> => {
    try {
      await holdApplication(id);
    } catch (error) {
      console.error("Hold application failed:", error);
    }
  };

  //  const handleSendJoiningForm = async (
  //   id: string
  // ): Promise<void> => {
  //   try {
  //     await sendJoiningForm(id);
  //   } catch (error) {
  //     console.error(
  //       "Send joining form failed:",
  //       error
  //     );

  //     throw error;
  //   }
  // };
  /* ==========================================================
     UPDATE CANDIDATE
     ========================================================== */
  const handleUpdateCandidate = async (
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
    },
  ): Promise<void> => {
    await updateCandidate(id, changes);
  };

  /* ==========================================================
     DELETE CANDIDATE
     ========================================================== */

  const handleDeleteCandidate = (id: string): void => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this candidate from the table?",
    );

    if (!confirmed) {
      return;
    }

    deleteCandidate(id);
  };
  /* ==========================================================
   EDIT CANDIDATE
========================================================== */

  // const handleEditCandidate = (
  //   candidate: JoiningApproval
  // ): void => {
  //   console.log("Edit candidate:", candidate);

  //   // Add your existing edit modal logic here
  // };

  /* ==========================================================
     SEND
     ========================================================== */

  /* ==========================================================
   SEND JOINING FORM
   ========================================================== */

  // const handleSend = async (
  //   id: string
  // ): Promise<void> => {

  //   try {

  //     await sendJoiningForm(id);

  //     window.alert(
  //       'Joining form link sent successfully.'
  //     );

  //   } catch (error) {

  //     console.error(
  //       'Send joining form failed:',
  //       error
  //     );

  //     window.alert(
  //       'Failed to send joining form link.'
  //     );

  //   }
  // };

  return (
    <main className="joining-approvals-page">
      <div className="page-content">
        {/* ==================================================
            PAGE HEADER
            ================================================== */}

        <div className="joining-approvals-section joining-approvals-section--header">
          <JoiningApprovalsHeader />
        </div>

        {/* ==================================================
            STATISTICS
            ================================================== */}

        <div className="joining-approvals-section joining-approvals-section--stats">
          <JoiningApprovalStats stats={stats} />
        </div>

        {/* ==================================================
            FILTERS
            ================================================== */}

        <div className="joining-approvals-section joining-approvals-section--filters">
          <JoiningApprovalFilters
            filters={filters}
            departments={departments}
            designations={designations}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        </div>

        {/* ==================================================
            TABLE
            ================================================== */}

        <div className="joining-approvals-section joining-approvals-section--table">
          <JoiningApprovalTable
            candidates={candidates}
            designations={designations}
            total={total}
            onCandidateClick={handleCandidateClick}
            page={pagination.currentPage}
            pageSize={pagination.pageSize}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onPageChange={goToPage}
            acceptedApplications={acceptedApplications}
            onDeleteCandidate={handleDeleteCandidate}
            onUpdateCandidate={handleUpdateCandidate}
          />
        </div>

        {/* ==================================================
            ACTION LOADING
            ================================================== */}

        {actionLoading && (
          <div
            className="joining-approval-action-loading"
            aria-live="polite"
            role="status"
          >
            Processing application...
          </div>
        )}

        {candidateDetailsOpen && selectedCandidate && (
          <JoiningApprovalCandidateDetails
            candidate={selectedCandidate}
            designations={designations}
            onClose={handleCloseCandidateDetails}
            onDelete={handleDeleteCandidate}
            onAccept={handleAccept}
            onReject={handleReject}
            onHold={handleHold}
            onSendJoiningForm={sendJoiningForm}
            onUpdateCandidate={handleUpdateCandidate}
          />
        )}
      </div>
    </main>
  );
};
