import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import LeaveApplyHeader from "./components/apply-leave/LeaveApplyHeader";

import LeaveBalanceCards from "./components/apply-leave/LeaveBalanceCards";

import LeaveTableCards, {
  LeaveTableRecord,
} from "./components/apply-leave/LeaveTableCards";

import LeaveApplyForm, {
  LeaveApplicationFormValues,
} from "./components/apply-leave/LeaveApplyForm";



import useApplyLeave from "./hooks/useApplyLeave";

import leaveService from "./services/leave.service";

import { getUsername } from "@/pages/auth/utils/authStorage";

import type {
  LeaveBalance,
  LeaveEmployeeRecord,
} from "./types/leave.types";

import "./ApplyLeave.css";
import LeaveViewModal from "./components/apply-leave/LeaveViewModal";

const ApplyLeave: React.FC = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [
    isLeaveModalOpen,
    setIsLeaveModalOpen,
  ] = useState<boolean>(false);

  const [
    isViewLeaveModalOpen,
    setIsViewLeaveModalOpen,
  ] = useState<boolean>(false);

  const [
    selectedLeave,
    setSelectedLeave,
  ] = useState<LeaveEmployeeRecord | null>(null);

  const [
    leaveBalances,
    setLeaveBalances,
  ] = useState<LeaveBalance[]>([]);

  const [
    balanceLoading,
    setBalanceLoading,
  ] = useState<boolean>(true);

  const [
    balanceError,
    setBalanceError,
  ] = useState<string>("");

  // ==========================================================
  // APPLY LEAVE HOOK
  // ==========================================================

  const {
    leaveRecords,
    loading,
    submitting,
    error,
    applyLeave,
  } = useApplyLeave();

  // ==========================================================
  // LOGGED-IN EMPLOYEE
  // ==========================================================

  const currentEmployeeCode = useMemo(() => {
    return getUsername()?.trim() ?? "";
  }, []);

  // ==========================================================
  // LOAD LEAVE BALANCES
  // ==========================================================

  const loadLeaveBalances =
    useCallback(async (): Promise<void> => {
      try {
        setBalanceLoading(true);
        setBalanceError("");

        const data =
          await leaveService.getLeaveBalances();

        setLeaveBalances(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load leave balances:",
          err
        );

        setBalanceError(
          err instanceof Error
            ? err.message
            : "Unable to load leave balance."
        );

        setLeaveBalances([]);
      } finally {
        setBalanceLoading(false);
      }
    }, []);

  // ==========================================================
  // INITIAL BALANCE LOAD
  // ==========================================================

  useEffect(() => {
    void loadLeaveBalances();
  }, [loadLeaveBalances]);

  // ==========================================================
  // CURRENT EMPLOYEE BALANCE
  // ==========================================================

  const currentEmployeeBalance =
    useMemo(() => {
      if (!currentEmployeeCode) {
        return null;
      }

      const loggedInEmployee =
        currentEmployeeCode
          .trim()
          .toLowerCase();

      const currentYear =
        new Date().getFullYear();

      const employeeBalances =
        leaveBalances.filter(
          (balance) =>
            String(balance.emp_id ?? "")
              .trim()
              .toLowerCase() ===
            loggedInEmployee
        );

      if (
        employeeBalances.length === 0
      ) {
        return null;
      }

      return (
        employeeBalances.find(
          (balance) =>
            Number(balance.year) ===
            currentYear
        ) ??
        employeeBalances[0]
      );
    }, [
      currentEmployeeCode,
      leaveBalances,
    ]);

  // ==========================================================
  // CURRENT EMPLOYEE LEAVES
  // ==========================================================

  const currentEmployeeLeaves =
    useMemo(() => {
      return leaveRecords;
    }, [leaveRecords]);

  // ==========================================================
  // CALCULATE USED LEAVE
  // ==========================================================

  const leaveUsage = useMemo(() => {
    let paidUsed = 0;
    let casualUsed = 0;
    let compOffUsed = 0;

    currentEmployeeLeaves.forEach(
      (record) => {
        const leaveType = String(
          record.leaveType ?? ""
        )
          .trim()
          .toLowerCase();

        const status = String(
          record.leaveStatus ?? ""
        )
          .trim()
          .toLowerCase();

        const days = Number(
          record.noOfDays ?? 0
        );

        if (
          !Number.isFinite(days) ||
          days <= 0
        ) {
          return;
        }

        // Only approved leaves count as used
        if (status !== "approved") {
          return;
        }

        // Paid Leave
        if (
          leaveType === "pl" ||
          leaveType === "paid" ||
          leaveType === "paid leave"
        ) {
          paidUsed += days;
          return;
        }

        // Casual Leave
        if (
          leaveType === "cl" ||
          leaveType === "casual" ||
          leaveType === "casual leave"
        ) {
          casualUsed += days;
          return;
        }

        // Comp Off
        if (
          leaveType === "co" ||
          leaveType === "comp off" ||
          leaveType === "comp-off" ||
          leaveType === "compoff" ||
          leaveType === "comp_off"
        ) {
          compOffUsed += days;
        }
      }
    );

    return {
      paidUsed,
      casualUsed,
      compOffUsed,
    };
  }, [currentEmployeeLeaves]);

  // ==========================================================
  // REMAINING LEAVE BALANCE
  // ==========================================================

  const leaveBalanceData =
    useMemo(() => {
      if (!currentEmployeeBalance) {
        return {
          paidRemaining: 0,
          casualRemaining: 0,
          compOffRemaining: 0,

          paidYearly:
            leaveUsage.paidUsed,

          casualYearly:
            leaveUsage.casualUsed,
        };
      }

      const paidRemaining = Number(
        currentEmployeeBalance
          .remained_paid_leave ?? 0
      );

      const casualRemaining = Number(
        currentEmployeeBalance
          .remained_casual_leave ?? 0
      );

      const compOffRemaining = Number(
        currentEmployeeBalance
          .remained_comp_off ?? 0
      );

      const paidYearly =
        leaveUsage.paidUsed +
        paidRemaining;

      const casualYearly =
        leaveUsage.casualUsed +
        casualRemaining;

      return {
        paidRemaining:
          Number.isFinite(
            paidRemaining
          )
            ? paidRemaining
            : 0,

        casualRemaining:
          Number.isFinite(
            casualRemaining
          )
            ? casualRemaining
            : 0,

        compOffRemaining:
          Number.isFinite(
            compOffRemaining
          )
            ? compOffRemaining
            : 0,

        paidYearly:
          Number.isFinite(
            paidYearly
          )
            ? paidYearly
            : 0,

        casualYearly:
          Number.isFinite(
            casualYearly
          )
            ? casualYearly
            : 0,
      };
    }, [
      currentEmployeeBalance,
      leaveUsage,
    ]);

  // ==========================================================
  // OPEN APPLY LEAVE MODAL
  // ==========================================================

  const handleOpenLeaveModal =
    useCallback((): void => {
      setIsLeaveModalOpen(true);
    }, []);

  // ==========================================================
  // CLOSE APPLY LEAVE MODAL
  // ==========================================================

  const handleCloseLeaveModal =
    useCallback((): void => {
      if (!submitting) {
        setIsLeaveModalOpen(false);
      }
    }, [submitting]);

  // ==========================================================
  // SUBMIT LEAVE
  // ==========================================================

  const handleLeaveSubmit =
    useCallback(
      async (
        values: LeaveApplicationFormValues
      ): Promise<void> => {
        const empCode =
          getUsername()?.trim();

        if (!empCode) {
          throw new Error(
            "Employee code is not available for the logged-in user."
          );
        }

        try {
          await applyLeave({
            emp_code: empCode,

            leave_from:
              values.fromDate,

            leave_to:
              values.toDate,

            no_of_days:
              values.numberOfDays,

            leave_type:
              values.leaveType,

            leave_reason:
              values.reason.trim() ||
              null,
          });

          // Close Apply Leave modal
          setIsLeaveModalOpen(false);

          // Reload balance
          await loadLeaveBalances();
        } catch (submitError) {
          console.error(
            "Failed to submit leave:",
            submitError
          );

          throw submitError;
        }
      },
      [
        applyLeave,
        loadLeaveBalances,
      ]
    );

  // ==========================================================
  // VIEW LEAVE
  // ==========================================================

  const handleViewLeave =
    useCallback(
      (
        record: LeaveTableRecord
      ): void => {
        const selectedRecord =
          currentEmployeeLeaves.find(
            (leave) =>
              Number(
                leave.leaveId ??
                  leave.id ??
                  0
              ) === Number(record.id)
          ) ?? null;

        if (!selectedRecord) {
          console.error(
            "Leave record not found:",
            record
          );
          return;
        }

        setSelectedLeave(
          selectedRecord
        );

        setIsViewLeaveModalOpen(true);
      },
      [currentEmployeeLeaves]
    );

  // ==========================================================
  // CLOSE VIEW LEAVE MODAL
  // ==========================================================

  const handleCloseViewLeave =
    useCallback((): void => {
      setIsViewLeaveModalOpen(false);
      setSelectedLeave(null);
    }, []);

  // ==========================================================
  // TABLE DATA
  // ==========================================================

  const tableData =
    useMemo<LeaveTableRecord[]>(() => {
      return currentEmployeeLeaves.map(
        (record) => {
          const fromDate =
            record.from ?? "";

          const toDate =
            record.to ?? "";

          const numberOfDays =
            Number(
              record.noOfDays ?? 0
            );

          const leaveType =
            String(
              record.leaveType ?? ""
            );

          const reason =
            record.reason ?? "";

          const leaveStatus =
            String(
              record.leaveStatus ?? ""
            );

          const recordId = Number(
            record.leaveId ??
              record.id ??
              0
          );

          const getWeekday = (
            dateValue: string
          ): string => {
            if (!dateValue) {
              return "-";
            }

            const date = new Date(
              `${dateValue}T00:00:00`
            );

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return "-";
            }

            return new Intl.DateTimeFormat(
              "en-US",
              {
                weekday: "long",
              }
            ).format(date);
          };

          return {
            id: Number.isFinite(
              recordId
            )
              ? recordId
              : 0,

            fromDate,

            fromDay:
              getWeekday(fromDate),

            toDate,

            toDay:
              getWeekday(toDate),

            numberOfDays,

            leaveType,

            reason,

            status:
              leaveStatus as LeaveTableRecord["status"],
          };
        }
      );
    }, [currentEmployeeLeaves]);

  // ==========================================================
  // PAGE LOADING
  // ==========================================================

  const pageLoading =
    loading || balanceLoading;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="apply-leave-page">
      <div className="apply-leave-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="apply-leave-section apply-leave-header-section">
          <LeaveApplyHeader
            onAddLeaveClick={
              handleOpenLeaveModal
            }
          />
        </section>

        {/* ==================================================
            LEAVE BALANCE
        ================================================== */}

        <section className="apply-leave-section apply-leave-balance-section">

          {balanceError ? (
            <div
              role="alert"
              style={{
                marginBottom: "16px",
                color: "#c62828",
              }}
            >
              {balanceError}
            </div>
          ) : null}

          {pageLoading ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Loading leave balance...
            </div>
          ) : (
            <LeaveBalanceCards
              paidYearly={
                leaveBalanceData.paidYearly
              }

              paidUsed={
                leaveUsage.paidUsed
              }

              paidRemaining={
                leaveBalanceData.paidRemaining
              }

              casualYearly={
                leaveBalanceData.casualYearly
              }

              casualUsed={
                leaveUsage.casualUsed
              }

              casualRemaining={
                leaveBalanceData.casualRemaining
              }

              compOffUsed={
                leaveUsage.compOffUsed
              }

              compOffRemaining={
                leaveBalanceData.compOffRemaining
              }
            />
          )}
        </section>

        {/* ==================================================
            LEAVE TABLE
        ================================================== */}

        <section className="apply-leave-section apply-leave-table-section">

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
              }}
            >
              Loading leave records...
            </div>
          ) : (
            <LeaveTableCards
              data={tableData}
              onView={handleViewLeave}
            />
          )}
        </section>
      </div>

      {/* ====================================================
          APPLY LEAVE FORM
      ==================================================== */}

      <LeaveApplyForm
        isOpen={isLeaveModalOpen}
        onClose={
          handleCloseLeaveModal
        }
        onSubmit={
          handleLeaveSubmit
        }
      />

      {/* ====================================================
          VIEW LEAVE DETAILS MODAL
      ==================================================== */}

      <LeaveViewModal
        isOpen={
          isViewLeaveModalOpen
        }
        leave={selectedLeave}
        onClose={
          handleCloseViewLeave
        }
      />
    </main>
  );
};

export default ApplyLeave;