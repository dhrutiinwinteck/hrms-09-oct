import { useState } from 'react';

import ShiftSwapHeader from './components/ShiftSwapHeader/ShiftSwapHeader';

import ShiftSwapModal from './components/ShiftSwapModal/ShiftSwapModal';

import ShiftSwapSummary from './components/ShiftSwapSummary/ShiftSwapSummary';

import ShiftSwapTable from './components/ShiftSwapTable/ShiftSwapTable';

import { useShiftSwap } from './hooks/useShiftSwap';

import type {
  CreateShiftSwapRequest,
} from './types/shiftSwap.types';

import './ShiftSwap.css';

const ShiftSwap = () => {
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const {
    requests,

    employees,

    summary,

    loading,

    submitting,

    error,

    employeeLoading,

    loadEligibleEmployees,

    createRequest,

    acceptRequest,

    rejectRequest,

    approveRequest,

    managerRejectRequest,
  } = useShiftSwap();

  /* ========================================================
     CREATE
  ======================================================== */

  const handleCreateRequest =
    async (
      payload: CreateShiftSwapRequest,
    ) => {
      await createRequest(
        payload,
      );
    };

  /* ========================================================
     CLOSE MODAL
  ======================================================== */

  const handleCloseModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
  };

  return (
    <main className="shift-swap-page">
      <div className="shift-swap-page-container">
        <ShiftSwapHeader
          onRequestShiftChange={() => {
            setIsModalOpen(true);
          }}
        />

        {error && (
          <div className="shift-swap-page__error">
            {error}
          </div>
        )}

        <ShiftSwapSummary
          summary={summary}
        />

        <ShiftSwapTable
          requests={requests}
          loading={loading}
          submitting={submitting}
          onAccept={
            acceptRequest
          }
          onReject={
            rejectRequest
          }
          onApprove={
            approveRequest
          }
          onManagerReject={
            managerRejectRequest
          }
        />
      </div>

      <ShiftSwapModal
        isOpen={isModalOpen}
        employees={employees}
        submitting={submitting}
        employeeLoading={
          employeeLoading
        }
        onLoadEligibleEmployees={
          loadEligibleEmployees
        }
        onClose={
          handleCloseModal
        }
        onSubmit={
          handleCreateRequest
        }
      />
    </main>
  );
};

export default ShiftSwap;