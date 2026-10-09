/**
 * @file DesignationPage.tsx
 * @description Designation management page.
 */

import {
  useMemo,
  useState,
} from "react";

import {
  DesignationHeader,
} from "./components/DesignationHeader/DesignationHeader";

import {
  DesignationStatistics,
} from "./components/DesignationStatistics/DesignationStatistics";

import {
  DesignationFilter,
} from "./components/DesignationFilter/DesignationFilter";

import {
  DesignationTable,
  type DesignationTableItem,
} from "./components/DesignationTable/DesignationTable";

import {
  DesignationModal,
  type DesignationModalSubmitValues,
} from "./components/DesignationModal/DesignationModal";

import useDesignations from "./hooks/useDesignation";

import type {
  Designation,
} from "./types/designation.types";

import "./DesignationPage.css";

const PAGE_SIZE = 5;

const DesignationPage = (): JSX.Element => {
  const {
    designations,
    departments,
    statistics,
    loading,
    error,
    createDesignation,
    updateDesignation,
    deleteDesignation,
  } = useDesignations();

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState<boolean>(false);

  const [
    selectedDesignation,
    setSelectedDesignation,
  ] = useState<Designation | null>(
    null,
  );

  const [
    searchTerm,
    setSearchTerm,
  ] = useState<string>("");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState<string>(
    "All Departments",
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<string>(
    "All Status",
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(1);

  /**
   * ADD
   */
  const handleAddDesignation =
    (): void => {
      setSelectedDesignation(null);
      setIsModalOpen(true);
    };

  /**
   * EDIT
   */
  const handleEditDesignation = (
    designation: DesignationTableItem,
  ): void => {
    const selected =
      designations.find(
        (item) =>
          item.id ===
          designation.id,
      );

    if (!selected) {
      return;
    }

    setSelectedDesignation(
      selected,
    );

    setIsModalOpen(true);
  };

  /**
   * DELETE
   */
  const handleDeleteDesignation = async (
    designation: DesignationTableItem,
  ): Promise<void> => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${designation.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDesignation(
        designation.id,
      );

      setSelectedDesignation(null);
      setIsModalOpen(false);
      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Failed to delete designation:",
        error,
      );
    }
  };

  /**
   * CLOSE MODAL
   */
  const handleCloseModal =
    (): void => {
      setIsModalOpen(false);
      setSelectedDesignation(null);
    };

  /**
   * SEARCH
   */
  const handleSearch = (
    value: string,
  ): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  /**
   * DEPARTMENT FILTER
   */
  const handleDepartmentChange = (
    value: string,
  ): void => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  /**
   * STATUS FILTER
   */
  const handleStatusChange = (
    value: string,
  ): void => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  /**
   * RESET
   */
  const handleResetFilters =
    (): void => {
      setSearchTerm("");
      setDepartmentFilter(
        "All Departments",
      );
      setStatusFilter(
        "All Status",
      );
      setCurrentPage(1);
    };

  /**
   * FILTER
   */
  const filteredDesignations =
    useMemo(
      (): Designation[] => {
        const normalizedSearch =
          searchTerm
            .trim()
            .toLowerCase();

        return designations.filter(
          (designation) => {
            const matchesSearch =
              normalizedSearch.length ===
                0 ||
              designation.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              designation.departmentName
                .toLowerCase()
                .includes(
                  normalizedSearch,
                );

            const selectedDepartment =
              departmentFilter ===
                "All Departments"
                ? true
                : designation.departmentName ===
                  departmentFilter;

            const selectedStatus =
              statusFilter ===
                "All Status"
                ? true
                : designation.status ===
                  statusFilter;

            return (
              matchesSearch &&
              selectedDepartment &&
              selectedStatus
            );
          },
        );
      },
      [
        designations,
        searchTerm,
        departmentFilter,
        statusFilter,
      ],
    );

  /**
   * PAGINATION
   */
  const totalItems =
    filteredDesignations.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems /
        PAGE_SIZE,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedDesignations =
    useMemo(
      (): DesignationTableItem[] => {
        const startIndex =
          (safeCurrentPage - 1) *
          PAGE_SIZE;

        return filteredDesignations
          .slice(
            startIndex,
            startIndex +
              PAGE_SIZE,
          )
          .map(
            (
              designation,
            ): DesignationTableItem => ({
              id: designation.id,

              name:
                designation.name,

              department:
                designation.departmentName,

              employees:
                designation.employeeCount,

              status:
                designation.status,

              icon:
                designation.name
                  .toLowerCase()
                  .includes(
                    "software",
                  )
                  ? "monitor"
                  : designation.name
                        .toLowerCase()
                        .includes(
                          "manager",
                        )
                    ? "briefcase"
                    : "user",
            }),
          );
      },
      [
        filteredDesignations,
        safeCurrentPage,
      ],
    );

  /**
   * PAGE CHANGE
   */
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

  /**
   * CREATE / UPDATE
   *
   * The modal now returns:
   *
   * {
   *   id,
   *   name,
   *   departmentId
   * }
   *
   * which maps directly to:
   *
   * {
   *   name,
   *   depart_id
   * }
   */
  const handleDesignationSubmit =
    async ({
      id,
      name,
      departmentId,
    }: DesignationModalSubmitValues): Promise<void> => {
      try {
        const formData = {
          name,
          departmentId,
          status:
            selectedDesignation?.status ??
            "Active",
        } as const;

        if (id !== null) {
          await updateDesignation(
            id,
            formData,
          );
        } else {
          await createDesignation(
            formData,
          );
        }

        handleCloseModal();
      } catch (error) {
        console.error(
          "Failed to save designation:",
          error,
        );

        throw error;
      }
    };

  /**
   * Statistics data is already calculated
   * by useDesignations.
   *
   * The existing DesignationStatistics
   * component currently contains hardcoded
   * values, so the values are intentionally
   * not passed until that component is wired
   * to accept props.
   */
  void statistics;

  return (
    <main className="designation-page">
      {/* HEADER */}

      <DesignationHeader
        onAdd={
          handleAddDesignation
        }
      />

      {/* STATISTICS */}

      <DesignationStatistics />

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          style={{
            margin:
              "12px 0",
            padding:
              "10px 14px",
            color:
              "#b42318",
            background:
              "#fef3f2",
            border:
              "1px solid #fecdca",
            borderRadius:
              "8px",
          }}
        >
          {error}
        </div>
      )}

      {/* FILTER */}

      <section className="designation-filter-section">
        <DesignationFilter
          onSearch={
            handleSearch
          }
          onDepartmentChange={
            handleDepartmentChange
          }
          onStatusChange={
            handleStatusChange
          }
          onReset={
            handleResetFilters
          }
        />
      </section>

      {/* LOADING */}

      {loading ? (
        <section className="designation-table-section">
          <div className="designation-table__empty">
            Loading designations...
          </div>
        </section>
      ) : (
        <section className="designation-table-section">
          <DesignationTable
            designations={
              paginatedDesignations
            }
            currentPage={
              safeCurrentPage
            }
            pageSize={
              PAGE_SIZE
            }
            totalItems={
              totalItems
            }
            totalPages={
              totalPages
            }
            onPageChange={
              handlePageChange
            }
            onEdit={
              handleEditDesignation
            }
            onDelete={
              handleDeleteDesignation
            }
          />
        </section>
      )}

      {/* ADD / EDIT MODAL */}

      <DesignationModal
        open={
          isModalOpen
        }

        mode={
          selectedDesignation
            ? "edit"
            : "add"
        }

        title={
          selectedDesignation
            ? "Edit Designation"
            : "Add Designation"
        }

        description={
          selectedDesignation
            ? "Update the designation details."
            : "Fill in the details to create a new designation."
        }

        departments={
          departments
        }

        initialValues={
          selectedDesignation
            ? {
                id:
                  selectedDesignation.id,

                name:
                  selectedDesignation.name,

                departmentId:
                  selectedDesignation.departmentId,

                departmentName:
                  selectedDesignation.departmentName,
              }
            : null
        }

        onClose={
          handleCloseModal
        }

        onSubmit={
          handleDesignationSubmit
        }
      />
    </main>
  );
};

export default DesignationPage;