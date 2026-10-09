import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AddViewLeaveFilters from "./components/AddViewLeave/AddViewLeaveFilters";
import AddViewLeaveHeader from "./components/AddViewLeave/AddViewLeaveHeader";
import AddViewLeaveModal, {
  LeaveFormMode,
} from "./components/AddViewLeave/AddViewLeaveModal";
import AddViewLeaveSummary from "./components/AddViewLeave/AddViewLeaveSummary";
import AddViewLeaveTable, {
  LeaveEmployee,
} from "./components/AddViewLeave/AddViewLeaveTable";

import leaveService from "./services/leave.service";

import type {
  Employee,
  LeaveBalance,
} from "./types/leave.types";

import "./AddViewLeave.css";

const AddViewLeave: React.FC = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [leaveBalances, setLeaveBalances] =
    useState<LeaveBalance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchValue, setSearchValue] =
    useState("");

  const [formMode, setFormMode] =
    useState<LeaveFormMode>("add");

  const [selectedEmployee, setSelectedEmployee] =
    useState<LeaveEmployee | null>(null);

  // NEW:
  // Controls whether Add/View/Edit popup is visible.
  const [isModalOpen, setIsModalOpen] =
    useState(false);

  // ==========================================================
  // NORMALIZE VALUE
  // ==========================================================

  const normalizeValue = (
    value: unknown,
  ): string => {
    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    return String(value)
      .trim()
      .toLowerCase();
  };

  // ==========================================================
  // GET EMPLOYEE CODE
  // ==========================================================

  const getEmployeeCode = (
    employee: Employee,
  ): string => {
    const data = employee as Employee & {
      employeeId?: string | number;
      employee_id?: string | number;

      emp_id?: string | number;
      empId?: string | number;

      employeeCode?: string | number;
      employee_code?: string | number;

      empCode?: string | number;
      emp_code?: string | number;

      code?: string | number;
    };

    const possibleCodes = [
      data.employeeId,
      data.employee_id,

      data.emp_id,
      data.empId,

      data.employeeCode,
      data.employee_code,

      data.empCode,
      data.emp_code,

      data.code,
    ];

    for (const code of possibleCodes) {
      const normalized =
        normalizeValue(code);

      if (normalized) {
        return normalized;
      }
    }

    return "";
  };

  // ==========================================================
  // GET EMPLOYEE NAME
  // ==========================================================

  const getEmployeeName = (
    employee: Employee,
  ): string => {
    const data = employee as Employee & {
      name?: string;

      employeeName?: string;
      employee_name?: string;

      fullName?: string;
      full_name?: string;

      firstName?: string;
      first_name?: string;

      lastName?: string;
      last_name?: string;
    };

    // ------------------------------------------
    // Direct name fields
    // ------------------------------------------

    const directNames = [
      data.name,
      data.employeeName,
      data.employee_name,
      data.fullName,
      data.full_name,
    ];

    for (const name of directNames) {
      if (
        typeof name === "string" &&
        name.trim()
      ) {
        return name.trim();
      }
    }

    // ------------------------------------------
    // First name + last name
    // ------------------------------------------

    const firstName =
      data.firstName ??
      data.first_name ??
      "";

    const lastName =
      data.lastName ??
      data.last_name ??
      "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    if (combinedName) {
      return combinedName;
    }

    return "";
  };

  // ==========================================================
  // CHECK ACTIVE EMPLOYEE
  // ==========================================================

  const isEmployeeActive = (
    employee: Employee,
  ): boolean => {
    const data = employee as Employee & {
      active?: boolean | number | string;

      isActive?: boolean | number | string;

      is_active?: boolean | number | string;

      status?: string;

      employeeStatus?: string;

      employee_status?: string;
    };

    // --------------------------------------------------------
    // Boolean fields
    // --------------------------------------------------------

    if (data.active === true) {
      return true;
    }

    if (data.isActive === true) {
      return true;
    }

    if (data.is_active === true) {
      return true;
    }

    // --------------------------------------------------------
    // Numeric fields
    // --------------------------------------------------------

    if (data.active === 1) {
      return true;
    }

    if (data.isActive === 1) {
      return true;
    }

    if (data.is_active === 1) {
      return true;
    }

    // --------------------------------------------------------
    // String fields
    // --------------------------------------------------------

    const activeValue =
      normalizeValue(data.active);

    const isActiveValue =
      normalizeValue(data.isActive);

    const isActiveSnakeValue =
      normalizeValue(data.is_active);

    const status =
      normalizeValue(data.status);

    const employeeStatus =
      normalizeValue(
        data.employeeStatus,
      );

    const employeeStatusSnake =
      normalizeValue(
        data.employee_status,
      );

    const activeValues = [
      "active",
      "1",
      "true",
      "yes",
      "y",
    ];

    return (
      activeValues.includes(
        activeValue,
      ) ||
      activeValues.includes(
        isActiveValue,
      ) ||
      activeValues.includes(
        isActiveSnakeValue,
      ) ||
      activeValues.includes(status) ||
      activeValues.includes(
        employeeStatus,
      ) ||
      activeValues.includes(
        employeeStatusSnake,
      )
    );
  };

  // ==========================================================
  // LOAD EMPLOYEES + LEAVE BALANCES
  // ==========================================================

  const loadData = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");

        const [
          employeeData,
          balanceData,
        ] = await Promise.all([
          leaveService.getEmployees(),
          leaveService.getLeaveBalances(),
        ]);

        setEmployees(employeeData);
        setLeaveBalances(balanceData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load leave balances.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ==========================================================
  // CLOSE MODAL WITH ESC
  // ==========================================================

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ): void => {
      if (event.key === "Escape") {
        handleFormCancel();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isModalOpen]);

  // ==========================================================
  // ONLY ACTIVE EMPLOYEES
  // ==========================================================

  const activeEmployees = useMemo(
    () => {
      return employees.filter(
        isEmployeeActive,
      );
    },
    [employees],
  );

  // ==========================================================
  // EMPLOYEE MAP
  // ==========================================================

  const employeeMap = useMemo(
    () => {
      const map =
        new Map<string, Employee>();

      activeEmployees.forEach(
        (employee) => {
          const employeeCode =
            getEmployeeCode(
              employee,
            );

          if (employeeCode) {
            map.set(
              employeeCode,
              employee,
            );
          }
        },
      );

      return map;
    },
    [activeEmployees],
  );

  // ==========================================================
  // CREATE TABLE DATA
  // ==========================================================

  const employeeLeaveBalances =
    useMemo<LeaveEmployee[]>(() => {
      return leaveBalances
        .map((balance) => {
          // ----------------------------------------------
          // Get employee code from leave balance
          // ----------------------------------------------

          const employeeCode =
            normalizeValue(
              balance.emp_id,
            );

          // ----------------------------------------------
          // Find ACTIVE employee
          // ----------------------------------------------

          const employee =
            employeeMap.get(
              employeeCode,
            );

          // ----------------------------------------------
          // If employee is not active,
          // don't show this leave balance.
          // ----------------------------------------------

          if (!employee) {
            return null;
          }

          // ----------------------------------------------
          // Get employee name
          // ----------------------------------------------

          const employeeName =
            getEmployeeName(
              employee,
            );

          // ----------------------------------------------
          // Create table row
          // ----------------------------------------------

          return {
            id: balance.id,

            employeeName:
              employeeName ||
              "Unknown Employee",

            empCode:
              balance.emp_id,

            year:
              balance.year,

            casualLeave:
              Number(
                balance
                  .remained_casual_leave ??
                  0,
              ),

            paidLeave:
              Number(
                balance
                  .remained_paid_leave ??
                  0,
              ),

            compOff:
              Number(
                balance
                  .remained_comp_off ??
                  0,
              ),

            createdOn:
              balance.createddate
                ? new Intl.DateTimeFormat(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  ).format(
                    new Date(
                      balance.createddate,
                    ),
                  )
                : "-",
          };
        })
        .filter(
          (
            employee,
          ): employee is LeaveEmployee =>
            employee !== null,
        );
    }, [
      employeeMap,
      leaveBalances,
    ]);

  // ==========================================================
  // ADD NEW EMPLOYEE LEAVE BALANCE
  // ==========================================================

  const handleAddNewEmployee =
    (): void => {
      setSelectedEmployee(null);
      setFormMode("add");
      setIsModalOpen(true);
    };

  // ==========================================================
  // VIEW
  // ==========================================================

  const handleView = (
    employee: LeaveEmployee,
  ): void => {
    setSelectedEmployee(
      employee,
    );

    setFormMode("view");
    setIsModalOpen(true);
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (
    employee: LeaveEmployee,
  ): void => {
    setSelectedEmployee(
      employee,
    );

    setFormMode("edit");
    setIsModalOpen(true);
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    employee: LeaveEmployee,
  ): Promise<void> => {
    const shouldDelete =
      window.confirm(
        `Are you sure you want to delete the leave balance for ${employee.employeeName}?`,
      );

    if (!shouldDelete) {
      return;
    }

    window.alert(
      "Delete is not available because the backend does not provide a delete leave balance API.",
    );
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async (
    employee: LeaveEmployee,
  ): Promise<void> => {
    console.log(
      "Leave balance submitted:",
      employee,
    );

    setSelectedEmployee(null);
    setFormMode("add");
    setIsModalOpen(false);

    await loadData();
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleFormCancel =
    (): void => {
      setSelectedEmployee(null);
      setFormMode("add");
      setIsModalOpen(false);
    };

  // ==========================================================
  // MODAL BACKDROP CLICK
  // ==========================================================

  const handleBackdropClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target === event.currentTarget
    ) {
      handleFormCancel();
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="add-view-leave-page">
      <div className="add-view-leave-page__container">

        {/* HEADER */}
        <AddViewLeaveHeader />

        {/* ADD NEW EMPLOYEE BUTTON */}
        <div className="add-view-leave-page__actions">
          <button
            type="button"
            className="add-view-leave-page__add-button"
            onClick={
              handleAddNewEmployee
            }
          >
            <span className="add-view-leave-page__add-icon">
              +
            </span>

            Add New Employee Leave Balance
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="add-view-leave-page__error"
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <AddViewLeaveSummary
          employees={
            activeEmployees
          }
          leaveBalances={
            leaveBalances
          }
        />

        {/* TABLE */}
        <section
          className="add-view-leave-page__table-card"
          aria-label="Employee leave balances"
        >
          <AddViewLeaveFilters
            searchValue={
              searchValue
            }
            onSearchChange={
              setSearchValue
            }
            onFilterClick={() =>
              setSearchValue("")
            }
          />

          {loading ? (
            <div className="add-view-leave-page__loading">
              Loading leave balances...
            </div>
          ) : (
            <AddViewLeaveTable
              employees={
                employeeLeaveBalances
              }
              searchValue={
                searchValue
              }
              onView={
                handleView
              }
              onEdit={
                handleEdit
              }
              onDelete={
                handleDelete
              }
            />
          )}
        </section>
      </div>

      {/* ======================================================
          POPUP MODAL
          ====================================================== */}

      {isModalOpen && (
        <div
          className="add-view-leave-modal-overlay"
          role="presentation"
          onMouseDown={
            handleBackdropClick
          }
        >
          <div
            className="add-view-leave-modal-wrapper"
            role="dialog"
            aria-modal="true"
            aria-label={
              formMode === "add"
                ? "Add New Employee Leave Balance"
                : formMode === "edit"
                  ? "Edit Employee Leave Balance"
                  : "View Employee Leave Balance"
            }
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="add-view-leave-modal-close"
              aria-label="Close"
              onClick={
                handleFormCancel
              }
            >
              ×
            </button>

            {/* FORM */}
            <AddViewLeaveModal
              mode={formMode}
              selectedEmployee={
                selectedEmployee
              }
              onSave={
                handleSave
              }
              onCancel={
                handleFormCancel
              }
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default AddViewLeave;