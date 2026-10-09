import React, { useMemo, useState } from "react";

import {
  Building2,
  ShieldCheck,
  ShieldOff,
  UsersRound,
} from "lucide-react";

import DepartmentSummaryCard from "./components/DepartmentSummaryCard/DepartmentSummaryCard";

import DepartmentFilter, {
  type DepartmentStatus as DepartmentFilterStatus,
} from "./components/DepartmentFilter/DepartmentFilter";

import DepartmentTable, {
  type Department as DepartmentTableDepartment,
} from "./components/DepartmentTable/DepartmentTable";

import DepartmentModal, {
  type Department as ModalDepartment,
  type DepartmentFormData,
  type DepartmentModalMode,
} from "./components/DepartmentModal/DepartmentModal";

import { useDepartment } from "./hooks/useDepartment";

import "./DepartmentPage.css";

const ITEMS_PER_PAGE = 4;

/**
 * Converts API/UI status to the status format
 * used by DepartmentTable and DepartmentModal.
 */
const getDisplayStatus = (
  status: string,
): "Active" | "Inactive" => {
  return status.toLowerCase() === "inactive"
    ? "Inactive"
    : "Active";
};

const DepartmentPage: React.FC = () => {
  // ============================================================
  // DEPARTMENT API / STATE
  // ============================================================

  const {
    departments,
    allDepartments,
    loading,
    isSaving,
    error,

    setSearch,
    setStatusFilter,

    createDepartment,
    updateDepartment,
    deleteDepartment,

    refresh,
  } = useDepartment();

  // ============================================================
  // FILTER STATE
  // ============================================================

  const [searchValue, setSearchValue] =
    useState<string>("");

  const [statusValue, setStatusValue] =
    useState<DepartmentFilterStatus>("All Status");

  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  // ============================================================
  // MODAL STATE
  // ============================================================

  const [isModalOpen, setIsModalOpen] =
    useState<boolean>(false);

  const [modalMode, setModalMode] =
    useState<DepartmentModalMode>("add");

  const [selectedDepartment, setSelectedDepartment] =
    useState<ModalDepartment | null>(null);

  // ============================================================
  // CONVERT API MODEL → TABLE MODEL
  // ============================================================

  const tableDepartments =
    useMemo<DepartmentTableDepartment[]>(() => {
      return departments.map((department) => ({
        id: department.id,
        name: department.name,

        /*
         * Current API does not return employee count.
         * Therefore 0 is used until an employee-count API
         * is available.
         */
        employeeCount:
          department.employeeCount ?? 0,

        /*
         * Convert lowercase API/UI status to the
         * existing table's display format.
         */
        status: getDisplayStatus(
          department.status,
        ),

        icon: "building",
      }));
    }, [departments]);

  // ============================================================
  // SUMMARY DATA
  // ============================================================

  const totalDepartments =
    allDepartments.length;

  const totalEmployees =
    allDepartments.reduce(
      (total, department) =>
        total +
        (department.employeeCount ?? 0),
      0,
    );

  const activeDepartments =
    allDepartments.filter(
      (department) =>
        department.status === "active",
    ).length;

  const inactiveDepartments =
    allDepartments.filter(
      (department) =>
        department.status === "inactive",
    ).length;

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalItems = tableDepartments.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedDepartments =
    useMemo(() => {
      const startIndex =
        (safeCurrentPage - 1) *
        ITEMS_PER_PAGE;

      const endIndex =
        startIndex + ITEMS_PER_PAGE;

      return tableDepartments.slice(
        startIndex,
        endIndex,
      );
    }, [
      tableDepartments,
      safeCurrentPage,
    ]);

  // ============================================================
  // ADD DEPARTMENT
  // ============================================================

  const handleAddDepartment = (): void => {
    setSelectedDepartment(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  // ============================================================
  // EDIT DEPARTMENT
  // ============================================================

  const handleEditDepartment = (
    department: DepartmentTableDepartment,
  ): void => {
    const selected: ModalDepartment = {
      id: department.id,
      name: department.name,
      employeeCount:
        department.employeeCount,

      status: getDisplayStatus(
        department.status,
      ),
    };

    setSelectedDepartment(selected);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // ============================================================
  // DELETE DEPARTMENT
  // ============================================================

  const handleDeleteDepartment = (
    department: DepartmentTableDepartment,
  ): void => {
    const selected: ModalDepartment = {
      id: department.id,
      name: department.name,
      employeeCount:
        department.employeeCount,

      status: getDisplayStatus(
        department.status,
      ),
    };

    setSelectedDepartment(selected);
    setModalMode("delete");
    setIsModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseModal = (): void => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setSelectedDepartment(null);
  };

  // ============================================================
  // ADD / EDIT SUBMIT
  // ============================================================

  const handleDepartmentSubmit = async (
    data: DepartmentFormData,
  ): Promise<void> => {
    try {
      // --------------------------------------------------------
      // ADD
      // --------------------------------------------------------

      if (modalMode === "add") {
        await createDepartment(data);

        setCurrentPage(1);

        setIsModalOpen(false);
        setSelectedDepartment(null);

        return;
      }

      // --------------------------------------------------------
      // EDIT
      // --------------------------------------------------------

      if (
        modalMode === "edit" &&
        data.id !== undefined
      ) {
        await updateDepartment(data);

        setIsModalOpen(false);
        setSelectedDepartment(null);
      }
    } catch (error) {
      console.error(
        "Department save failed:",
        error,
      );
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDepartmentDelete = async (
    department: ModalDepartment,
  ): Promise<void> => {
    try {
      await deleteDepartment(department.id);

      setIsModalOpen(false);
      setSelectedDepartment(null);

      /*
       * Recalculate the page after deletion.
       */
      setCurrentPage((previousPage) => {
        const remainingItems =
          Math.max(
            0,
            totalItems - 1,
          );

        const remainingPages =
          Math.max(
            1,
            Math.ceil(
              remainingItems /
                ITEMS_PER_PAGE,
            ),
          );

        return Math.min(
          previousPage,
          remainingPages,
        );
      });
    } catch (error) {
      console.error(
        "Department delete failed:",
        error,
      );
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (
    value: string,
  ): void => {
    setSearchValue(value);
    setCurrentPage(1);

    setSearch(value);
  };

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusChange = (
    value: DepartmentFilterStatus,
  ): void => {
    setStatusValue(value);
    setCurrentPage(1);

    /*
     * Department hook uses:
     *
     * active
     * inactive
     * ""
     *
     * DepartmentFilter uses:
     *
     * Active
     * Inactive
     * All Status
     */

    if (value === "Active") {
      setStatusFilter("active");
      return;
    }

    if (value === "Inactive") {
      setStatusFilter("inactive");
      return;
    }

    setStatusFilter("");
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePageChange = (
    page: number,
  ): void => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = (): void => {
    setCurrentPage(1);
    refresh();
  };

  // ============================================================
  // SUMMARY CARDS
  // ============================================================

  const summaryItems = [
    {
      title: "Total Departments",
      value: totalDepartments,
      description:
        "All Active Departments",
      icon: Building2,
    },
    {
      title: "Active Departments",
      value: activeDepartments,
      description:
        "Currently Active",
      icon: ShieldCheck,
    },
    {
      title: "Inactive Departments",
      value: inactiveDepartments,
      description:
        "Currently Inactive",
      icon: ShieldOff,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="department-page">
      <div className="department-page-container">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <header className="department-page-header">
          <div className="department-page-heading">
            <h1 className="department-page-title">
              Departments
            </h1>

            <p className="department-page-subtitle">
              Manage departments and
              organizational structure.
            </p>
          </div>

          <button
            type="button"
            className="department-add-button"
            onClick={handleAddDepartment}
            disabled={loading || isSaving}
          >
            <span
              className="department-add-icon"
              aria-hidden="true"
            >
              +
            </span>

            <span>Add Department</span>
          </button>
        </header>

        {/* ======================================================
            API ERROR
        ====================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "1px solid #fca5a5",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            role="status"
            aria-live="polite"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            Loading departments...
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <section className="department-page-section">
          <DepartmentSummaryCard
            items={summaryItems}
          />
        </section>

        {/* ======================================================
            FILTER
        ====================================================== */}

        <section className="department-page-filter-section">
          <DepartmentFilter
            searchValue={searchValue}
            statusValue={statusValue}
            onSearch={handleSearch}
            onStatusChange={
              handleStatusChange
            }
            disabled={loading || isSaving}
          />
        </section>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <section className="department-page-table-section">
          <DepartmentTable
            departments={
              paginatedDepartments
            }
            currentPage={
              safeCurrentPage
            }
            totalPages={totalPages}
            totalDepartments={
              totalItems
            }
            pageSize={
              ITEMS_PER_PAGE
            }
            onEdit={
              handleEditDepartment
            }
            onDelete={
              handleDeleteDepartment
            }
            onPageChange={
              handlePageChange
            }
          />
        </section>
      </div>

      {/* ========================================================
          DEPARTMENT MODAL
      ======================================================== */}

      <DepartmentModal
        isOpen={isModalOpen}
        mode={modalMode}
        department={
          selectedDepartment
        }
        isLoading={isSaving}
        onClose={handleCloseModal}
        onSubmit={
          handleDepartmentSubmit
        }
        onDelete={
          handleDepartmentDelete
        }
      />
    </main>
  );
};

export default DepartmentPage;