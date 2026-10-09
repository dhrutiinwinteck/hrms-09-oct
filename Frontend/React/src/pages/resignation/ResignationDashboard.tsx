// ============================================================
// RESIGNATION DASHBOARD COMPONENT
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./ResignationDashboard.css";

import ResignationService from "./services/resignation.service";

// UI Components
import StatisticsCards from "./components/StatisticsCards/StatisticsCards";
import FilterBar, { FilterState } from "./components/FilterBar/FilterBar";
import ResignationTable from "./components/ResignationTable/ResignationTable";
import StatusBadge from "./components/StatusBadge/StatusBadge";
import ApprovalStepper from "./components/ApprovalStepper/ApprovalStepper";
import ResignationModal from "./components/ResignationModal/ResignationModal";
import ResignationForm from "./components/ResignationForm/ResignationForm";

// Constants & Types
import { CreateResignationInput } from "./validations/resignation.schema";
import { Resignation } from "./types/resignation.types";

// ============================================================
// FILTER OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Withdrawn", value: "Withdrawn" },
];

const DEPARTMENT_OPTIONS = [
  { label: "All Department", value: "" },
  { label: "Engineering", value: "Engineering" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
];

// ============================================================
// COMPONENT
// ============================================================

const ResignationDashboard: React.FC = () => {
  // ============================================================
  // 1. STATE MANAGEMENT
  // ============================================================

  const [resignations, setResignations] = useState<Resignation[]>([]);

  const [statistics, setStatistics] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: "",
    department: "",
    dateRange: "01 May 2024 – 31 May 2024",
  });

  // ============================================================
  // 2. MODAL STATE
  // ============================================================

  const [modalMode, setModalMode] = useState<
    "create" | "edit" | "view" | null
  >(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ============================================================
  // 3. FILTERED DATA
  // ============================================================

  const filteredData = useMemo(() => {
    return resignations.filter((item) => {
      // Status Filter
      const statusMatch = activeFilters.status
        ? item.status === activeFilters.status
        : true;

      // Department Filter
      const deptMatch = activeFilters.department
        ? item.employee.department === activeFilters.department
        : true;

      return statusMatch && deptMatch;
    });
  }, [resignations, activeFilters]);

  // ============================================================
  // 4. FILTER EVENT HANDLERS
  // ============================================================

  const handleFilterChange = useCallback((filters: FilterState) => {
    setActiveFilters(filters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({
      status: "",
      department: "",
      dateRange: "01 May 2024 – 31 May 2024",
    });
  }, []);

  // ============================================================
  // 5. GET CURRENT EMPLOYEE ID
  // ============================================================
  //
  // Backend requires:
  //
  //     emp_id: int
  //
  // We do not change the common authentication file.
  //
  // This checks the commonly used localStorage keys.
  //
  // If your login stores the employee ID under another key,
  // only this function needs to be adjusted.
  //
  // ============================================================

  const getCurrentEmployeeId = useCallback((): number => {
    const possibleKeys = [
      "employeeId",
      "emp_id",
      "empId",
      "employee_id",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (value && /^\d+$/.test(value)) {
        return Number(value);
      }
    }

    throw new Error(
      "Employee ID not found. Please make sure the logged-in employee ID is stored in localStorage."
    );
  }, []);

  // ============================================================
  // 6. REFRESH DATA FROM FASTAPI
  // ============================================================

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      const [resignationResponse, statisticsResponse] = await Promise.all([
        ResignationService.getResignations(),
        ResignationService.getDashboardStatistics(),
      ]);

      setResignations(resignationResponse.data);
      setStatistics(statisticsResponse);
    } catch (error) {
      console.error("Failed to load resignation data:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load resignation data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // 7. CREATE RESIGNATION
  // ============================================================

  const create = useCallback(
    async (formData: CreateResignationInput) => {
      try {
        // --------------------------------------------------------
        // Get logged-in employee ID
        // --------------------------------------------------------

        const employeeId = getCurrentEmployeeId();

        // --------------------------------------------------------
        // Convert notice period to number
        // --------------------------------------------------------

        const noticePeriod = Number(formData.noticePeriod);

        if (Number.isNaN(noticePeriod)) {
          throw new Error("Invalid notice period.");
        }

        // --------------------------------------------------------
        // Backend expects from_date.
        //
        // The form already provides fromDate.
        // --------------------------------------------------------

        const fromDate = formData.fromDate;

        if (!fromDate) {
          throw new Error("Resignation from date is required.");
        }

        // --------------------------------------------------------
        // FastAPI ResignationCreate payload
        // --------------------------------------------------------
        //
        // Backend:
        //
        // emp_id
        // reason
        // is_resignation
        // is_termination
        // from_date
        // notice_period
        //
        // --------------------------------------------------------

        const payload = {
          emp_id: employeeId,
          reason: String(formData.reason),

          is_resignation: 1,
          is_termination: 0,

          from_date: fromDate,
          notice_period: noticePeriod,
        };

        console.log("Creating resignation:", payload);

        // --------------------------------------------------------
        // Call FastAPI
        // --------------------------------------------------------

        await ResignationService.createResignation(payload);

        // --------------------------------------------------------
        // Reload actual data from backend
        // --------------------------------------------------------

        await refreshData();
      } catch (error) {
        console.error("Failed to submit resignation:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to submit the resignation form."
        );

        throw error;
      }
    },
    [getCurrentEmployeeId, refreshData]
  );

  // ============================================================
  // 8. UPDATE RESIGNATION
  // ============================================================

  const update = useCallback(
    async (id: string, formData: CreateResignationInput) => {
      try {
        const noticePeriod = Number(formData.noticePeriod);

        if (Number.isNaN(noticePeriod)) {
          throw new Error("Invalid notice period.");
        }

        const payload = {
          reason: String(formData.reason),
          from_date: formData.fromDate,
          notice_period: noticePeriod,
        };

        console.log("Updating resignation:", id, payload);

        await ResignationService.updateResignation(id, payload);

        await refreshData();
      } catch (error) {
        console.error("Failed to update resignation:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to update resignation."
        );

        throw error;
      }
    },
    [refreshData]
  );

  // ============================================================
  // 9. DELETE RESIGNATION
  // ============================================================

  const deleteResignation = useCallback(
    async (id: string) => {
      try {
        console.log("Deleting resignation:", id);

        await ResignationService.deleteResignation(id);

        await refreshData();
      } catch (error) {
        console.error("Failed to delete resignation:", error);

        alert(
          error instanceof Error
            ? error.message
            : "Failed to delete resignation."
        );

        throw error;
      }
    },
    [refreshData]
  );

  // ============================================================
  // 10. MODAL HANDLERS
  // ============================================================

  const handleOpenCreate = useCallback(() => {
    setModalMode("create");
    setSelectedId(null);
  }, []);

  const handleOpenEdit = useCallback((id: string) => {
    setModalMode("edit");
    setSelectedId(id);
  }, []);

  const handleOpenView = useCallback((id: string) => {
    setModalMode("view");
    setSelectedId(id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalMode(null);
    setSelectedId(null);
  }, []);

  // ============================================================
  // 11. DELETE HANDLER
  // ============================================================

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this resignation request?"
        )
      ) {
        await deleteResignation(id);
      }
    },
    [deleteResignation]
  );

  // ============================================================
  // 12. FORM SUBMIT
  // ============================================================

  const handleFormSubmit = useCallback(
    async (formData: CreateResignationInput) => {
      try {
        if (modalMode === "create") {
          await create(formData);
        } else if (modalMode === "edit" && selectedId) {
          await update(selectedId, formData);
        }

        handleCloseModal();
      } catch (err) {
        console.error("Submission failed:", err);
      }
    },
    [
      modalMode,
      selectedId,
      create,
      update,
      handleCloseModal,
    ]
  );

  // ============================================================
  // 13. SELECTED RESIGNATION
  // ============================================================

  const selectedResignation = useMemo(() => {
    if (!selectedId) {
      return undefined;
    }

    return resignations.find(
      (resignation) => resignation.id === selectedId
    );
  }, [resignations, selectedId]);

  // ============================================================
  // 14. MODAL TITLE
  // ============================================================

  const modalTitle = useMemo(() => {
    if (modalMode === "create") {
      return "New Resignation Request";
    }

    if (modalMode === "edit") {
      return "Edit Resignation Request";
    }

    if (modalMode === "view") {
      return "Resignation Details";
    }

    return "";
  }, [modalMode]);

  // ============================================================
  // 15. INITIAL DATA LOAD
  // ============================================================

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ============================================================
  // 16. MAIN RENDER
  // ============================================================

  return (
    <div className="resignation-dashboard">
      {/* ========================================================
          HEADER
          ======================================================== */}

      <header className="resignation-header">
        <div className="header-left">
          <h1 className="page-title">
            Resignation Management
          </h1>

          <p className="page-subtitle">
            Manage employee resignation requests and approvals.
          </p>
        </div>

        <div className="header-right">
          <button
            className="btn-primary"
            onClick={handleOpenCreate}
            disabled={loading}
          >
            + New Resignation
          </button>
        </div>
      </header>

      {/* ========================================================
          STATISTICS
          ======================================================== */}

      <section className="dashboard-section">
        <StatisticsCards
          totalRequests={statistics.totalRequests}
          pending={statistics.pending}
          approved={statistics.approved}
          rejected={statistics.rejected}
        />
      </section>

      {/* ========================================================
          FILTER BAR
          ======================================================== */}

      <section className="dashboard-section">
        <FilterBar
          statusOptions={STATUS_OPTIONS}
          departmentOptions={DEPARTMENT_OPTIONS}
          onFilterChange={handleFilterChange}
          onReset={handleClearFilters}
        />
      </section>

      {/* ========================================================
          RESIGNATION TABLE
          ======================================================== */}

      <section className="dashboard-section">
        <ResignationTable
          data={filteredData}
          loading={loading}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />

        <div className="table-footer">
          <span className="record-count">
            Showing {filteredData.length} records
          </span>
        </div>
      </section>

      {/* ========================================================
          RESIGNATION MODAL
          ======================================================== */}

      <ResignationModal
        isOpen={modalMode !== null}
        onClose={handleCloseModal}
        title={modalTitle}
        width="720px"
      >
        {/* ======================================================
            VIEW MODE
            ====================================================== */}

        {modalMode === "view" ? (
          <div className="view-mode-content">
            <div className="view-details">
              <p>
                <strong>Employee:</strong>{" "}
                {selectedResignation?.employee.fullName}
              </p>

              <p>
                <strong>Reason:</strong>{" "}
                {selectedResignation?.reason}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge
                  status={
                    selectedResignation?.status || "Pending"
                  }
                />
              </p>
            </div>

            <div className="view-approvals">
              <h4 className="section-subtitle">
                Approval Flow
              </h4>

              <ApprovalStepper
                steps={[
                  "Employee",
                  "Manager",
                  "HR",
                  "Admin",
                ]}
                currentStep={
                  selectedResignation?.status === "Approved"
                    ? 4
                    : 1
                }
                status={selectedResignation?.status}
              />
            </div>
          </div>
        ) : (
          /* ====================================================
             CREATE / EDIT FORM
             ==================================================== */

          <ResignationForm
            defaultValues={
              selectedResignation
                ? {
                    reason: selectedResignation.reason,
                    reasonType: selectedResignation.reason,
                    noticePeriod: 30,
                    fromDate:
                      selectedResignation.resignationDate,
                    lastWorkingDate:
                      selectedResignation.lastWorkingDate,
                    reportingManager: "Alice Johnson",
                    comments:
                      selectedResignation.details || "",
                  }
                : undefined
            }
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            loading={loading}
          />
        )}
      </ResignationModal>
    </div>
  );
};

export default ResignationDashboard;