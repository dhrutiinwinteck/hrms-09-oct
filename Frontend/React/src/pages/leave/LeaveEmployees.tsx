import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  Building2,
} from "lucide-react";

import LeaveEmployeesHeader from "./components/employees/LeaveEmployeesHeader";
import LeaveEmployeeSummaryCard from "./components/employees/LeaveEmployeeSummaryCard";
import LeaveEmployeesFilters, {
  LeaveEmployeesFilterValues,
} from "./components/employees/LeaveEmployeesFilters";
import LeaveEmployeesTable from "./components/employees/LeaveEmployeesTable";
import LeaveEmployeeModal, {
  LeaveEmployeeModalData,
  LeaveEmployeeModalMode,
} from "./components/employees/LeaveEmployeeModal";

import useLeaveEmployees from "./hooks/useLeaveEmployees";
import useLeaveManagement from "./hooks/useLeaveManagement";

import "./LeaveEmployees.css";

// ============================================================
// DEFAULT FILTERS
// ============================================================

const DEFAULT_FILTERS: LeaveEmployeesFilterValues = {
  leaveStatus: "",
  search: "",
  entries: 10,
};

// ============================================================
// COMPONENT
// ============================================================

const LeaveEmployees: React.FC = () => {
  // ==========================================================
  // EMPLOYEE LEAVE DATA
  // ==========================================================

  const {
    employees,
    loading,
    error,
    refresh,
  } = useLeaveEmployees();

  // ==========================================================
  // LEAVE MANAGEMENT
  // ==========================================================

  const {
    updateLeave,
    approveLeave,
    rejectLeave,
  } = useLeaveManagement();

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const [filters, setFilters] =
    useState<LeaveEmployeesFilterValues>({
      ...DEFAULT_FILTERS,
    });

  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState<LeaveEmployeesFilterValues>({
    ...DEFAULT_FILTERS,
  });

  // ==========================================================
  // MODAL STATE
  // ==========================================================

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] =
    useState<LeaveEmployeeModalData | null>(
      null,
    );

  const [
    modalMode,
    setModalMode,
  ] =
    useState<LeaveEmployeeModalMode>(
      "view",
    );

  // ==========================================================
  // NORMALIZE SEARCH VALUE
  // ==========================================================

  const normalizeValue = (
    value: unknown,
  ): string => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  // ==========================================================
  // FILTER EMPLOYEE LEAVE RECORDS
  // ==========================================================

  const filteredEmployeeRecords =
    useMemo(() => {
      const searchTerm =
        normalizeValue(
          appliedFilters.search,
        );

      const selectedStatus =
        normalizeValue(
          appliedFilters.leaveStatus,
        );

      return employees.filter(
        (employee) => {
          const matchesStatus =
            selectedStatus === "" ||
            normalizeValue(
              employee.leaveStatus,
            ) === selectedStatus;

          if (!matchesStatus) {
            return false;
          }

          if (!searchTerm) {
            return true;
          }

          return [
            employee.name,
            employee.employeeId,
            employee.email,
            employee.phone,
            employee.department,
            employee.designation,
            employee.from,
            employee.to,
            employee.leaveType,
            employee.reason,
            employee.leaveStatus,
            employee.status,
          ].some((value) =>
            normalizeValue(
              value,
            ).includes(searchTerm),
          );
        },
      );
    }, [
      employees,
      appliedFilters,
    ]);

  // ==========================================================
  // SEARCH CHANGE
  // ==========================================================

  const handleSearchChange =
    (value: string): void => {
      setFilters(
        (previous) => ({
          ...previous,
          search: value,
        }),
      );

      setAppliedFilters(
        (previous) => ({
          ...previous,
          search: value.trim(),
        }),
      );
    };

  // ==========================================================
  // STATUS CHANGE
  // ==========================================================

  const handleLeaveStatusChange =
    (value: string): void => {
      setFilters(
        (previous) => ({
          ...previous,
          leaveStatus: value,
        }),
      );
    };

  // ==========================================================
  // ENTRIES CHANGE
  // ==========================================================

  const handleEntriesChange =
    (value: number): void => {
      setFilters(
        (previous) => ({
          ...previous,
          entries: value,
        }),
      );

      setAppliedFilters(
        (previous) => ({
          ...previous,
          entries: value,
        }),
      );
    };

  // ==========================================================
  // APPLY FILTERS
  // ==========================================================

  const handleApplyFilters =
    (): void => {
      setAppliedFilters({
        ...filters,
      });
    };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleResetFilters =
    (): void => {
      setFilters({
        ...DEFAULT_FILTERS,
      });

      setAppliedFilters({
        ...DEFAULT_FILTERS,
      });
    };

  // ==========================================================
  // VIEW EMPLOYEE LEAVE
  // ==========================================================

  const handleViewEmployee =
    useCallback(
      (
        employee: LeaveEmployeeModalData,
      ): void => {
        setSelectedEmployee({
          ...employee,
        });

        setModalMode("view");
      },
      [],
    );

  // ==========================================================
  // EDIT EMPLOYEE LEAVE
  // ==========================================================

  const handleEditEmployee =
    useCallback(
      (
        employee: LeaveEmployeeModalData,
      ): void => {
        setSelectedEmployee({
          ...employee,
        });

        setModalMode("edit");
      },
      [],
    );

  // ==========================================================
  // SAVE EMPLOYEE LEAVE
  // ==========================================================
  //
  // Backend PUT request accepts only:
  //
  // leave_from
  // leave_to
  // no_of_days
  // leave_type
  // leave_reason
  //
  // Status is updated through separate APIs.
  //
  // IMPORTANT:
  // useLeaveManagement() refreshes its own state after the
  // API call, but this page displays employees from
  // useLeaveEmployees().
  //
  // Therefore we explicitly call the refresh() from
  // useLeaveEmployees() so the table immediately receives
  // the latest backend data.
  // ==========================================================

  const handleSaveEmployee =
    useCallback(
      async (
        updatedEmployee: LeaveEmployeeModalData,
      ): Promise<void> => {
        if (!updatedEmployee.leaveId) {
          window.alert(
            "Leave request ID is missing.",
          );
          return;
        }

        try {
          // ===================================================
          // STATUS CHANGED TO APPROVED
          // ===================================================

          if (
            updatedEmployee.leaveStatus ===
            "Approved"
          ) {
            await approveLeave({
              leave_id:
                updatedEmployee.leaveId,
              status: 1,
            });

            // Refresh the exact data source used by the table.
            await refresh();

            setModalMode("view");

            return;
          }

          // ===================================================
          // STATUS CHANGED TO REJECTED
          // ===================================================

          if (
            updatedEmployee.leaveStatus ===
            "Rejected"
          ) {
            await rejectLeave({
              leave_id:
                updatedEmployee.leaveId,
              status: 2,
            });

            // Refresh the exact data source used by the table.
            await refresh();

            setModalMode("view");

            return;
          }

          // ===================================================
          // NORMAL PENDING LEAVE EDIT
          // ===================================================

          await updateLeave(
            updatedEmployee.leaveId,
            {
              leave_from:
                updatedEmployee.from,

              leave_to:
                updatedEmployee.to,

              no_of_days:
                updatedEmployee.noOfDays,

              leave_type:
                updatedEmployee.leaveType,

              leave_reason:
                updatedEmployee.reason.trim() ||
                null,
            },
          );

          // Refresh the table data after editing.
          await refresh();

          setModalMode("view");
        } catch (err) {
          window.alert(
            err instanceof Error
              ? err.message
              : "Unable to update leave.",
          );
        }
      },
      [
        updateLeave,
        approveLeave,
        rejectLeave,
        refresh,
      ],
    );

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleCloseModal =
    useCallback((): void => {
      setSelectedEmployee(null);

      setModalMode("view");
    }, []);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="leave-employees-page">

      <LeaveEmployeesHeader />

      <div className="leave-employees-page__container">

        {/* ==================================================
            SUMMARY
            ================================================== */}

        <section
          className="leave-employees-page__summary"
          aria-label="Leave summary"
        >
          <LeaveEmployeeSummaryCard
            employees={
              filteredEmployeeRecords
            }
          />
        </section>

        {/* ==================================================
            CONTENT
            ================================================== */}

        <section className="leave-employees-page__content-card">

          <div className="leave-employees-page__content-header">

            <div className="leave-employees-page__section-title-row">

              <div className="leave-employees-page__section-icon">
                <Building2
                  size={18}
                  strokeWidth={2}
                />
              </div>

              <div>
                <h2 className="leave-employees-page__section-title">
                  Leave Records
                </h2>

                <p className="leave-employees-page__section-subtitle">
                  View and manage employee leave
                  applications and requests.
                </p>
              </div>

            </div>

            <div className="leave-employees-page__employee-count">
              {
                filteredEmployeeRecords.length
              }{" "}
              Leave Records
            </div>

          </div>

          {/* ==================================================
              ERROR
              ================================================== */}

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

          {/* ==================================================
              FILTERS
              ================================================== */}

          <div className="leave-employees-page__filter-section">
            <LeaveEmployeesFilters
              filters={filters}
              onLeaveStatusChange={
                handleLeaveStatusChange
              }
              onSearchChange={
                handleSearchChange
              }
              onEntriesChange={
                handleEntriesChange
              }
              onSearch={
                handleApplyFilters
              }
              onFilterClick={
                handleResetFilters
              }
            />
          </div>

          {/* ==================================================
              TABLE
              ================================================== */}

          <div className="leave-employees-page__table-wrapper">

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
              <LeaveEmployeesTable
                employees={
                  filteredEmployeeRecords
                }
                search=""
                status=""
                pageSize={
                  appliedFilters.entries
                }
                onView={
                  handleViewEmployee
                }
                onEdit={
                  handleEditEmployee
                }
                onApprove={
                  handleSaveEmployee
                }
                onReject={
                  handleSaveEmployee
                }
              />
            )}

          </div>

        </section>
      </div>

      {/* ====================================================
          EMPLOYEE LEAVE MODAL
          ==================================================== */}

      <LeaveEmployeeModal
        isOpen={
          selectedEmployee !== null
        }
        employee={
          selectedEmployee
        }
        mode={modalMode}
        onClose={
          handleCloseModal
        }
        onEdit={
          handleEditEmployee
        }
        onSave={
          handleSaveEmployee
        }
      />

    </main>
  );
};

export default LeaveEmployees;