import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Save,
  Umbrella,
  UserRoundPlus,
} from "lucide-react";

import leaveBalanceCalendarIllustration from "../../../../assets/images/leave/leave-balance-calendar-illustration.png";

import { LeaveEmployee } from "./AddViewLeaveTable";

import leaveService from "../../services/leave.service";

import type {
  Employee,
  LeaveBalanceCreateRequest,
  LeaveBalanceUpdateRequest,
} from "../../types/leave.types";

import "./AddViewLeaveModal.css";

// ============================================================
// FORM MODE
// ============================================================

export type LeaveFormMode =
  | "add"
  | "edit"
  | "view";

// ============================================================
// FORM DATA
// ============================================================

interface LeaveBalanceFormData {
  employeeId: string;
  year: string;
  casualLeave: string;
  paidLeave: string;
  compOff: string;
}

// ============================================================
// PROPS
// ============================================================

interface AddViewLeaveModalProps {
  mode: LeaveFormMode;
  selectedEmployee: LeaveEmployee | null;
  onSave: (
    employee: LeaveEmployee,
  ) => void;
  onCancel: () => void;
}

// ============================================================
// INITIAL FORM
// ============================================================

const initialFormData: LeaveBalanceFormData = {
  employeeId: "",
  year: "",
  casualLeave: "",
  paidLeave: "",
  compOff: "",
};

// ============================================================
// COMPONENT
// ============================================================

const AddViewLeaveModal: React.FC<
  AddViewLeaveModalProps
> = ({
  mode,
  selectedEmployee,
  onSave,
  onCancel,
}) => {
  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] =
    useState<LeaveBalanceFormData>(
      initialFormData,
    );

  // ==========================================================
  // EMPLOYEE STATE
  // ==========================================================

  const [
    employees,
    setEmployees,
  ] = useState<Employee[]>([]);

  const [
    loadingEmployees,
    setLoadingEmployees,
  ] = useState(false);

  // ==========================================================
  // SUBMIT STATE
  // ==========================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // LOAD ACTIVE EMPLOYEES
  // ==========================================================

  useEffect(() => {
    const loadEmployees =
      async (): Promise<void> => {
        try {
          setLoadingEmployees(true);
          setError("");

          const data =
            await leaveService.getEmployees();

          setEmployees(data);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load employees.",
          );
        } finally {
          setLoadingEmployees(false);
        }
      };

    void loadEmployees();
  }, []);

  // ==========================================================
  // AVAILABLE YEARS
  // ==========================================================

  const years = useMemo<
    string[]
  >(() => {
    const currentYear =
      new Date().getFullYear();

    const availableYears =
      Array.from(
        { length: 5 },
        (_, index) =>
          String(
            currentYear -
              1 +
              index,
          ),
      );

    if (
      selectedEmployee &&
      !availableYears.includes(
        selectedEmployee.year,
      )
    ) {
      return [
        selectedEmployee.year,
        ...availableYears,
      ].sort();
    }

    return availableYears;
  }, [selectedEmployee]);

  // ==========================================================
  // POPULATE FORM FOR EDIT / VIEW
  // ==========================================================

  useEffect(() => {
    if (
      (mode === "edit" ||
        mode === "view") &&
      selectedEmployee
    ) {
      setFormData({
        employeeId:
          selectedEmployee.empCode,

        year:
          selectedEmployee.year,

        casualLeave:
          String(
            selectedEmployee.casualLeave,
          ),

        paidLeave:
          String(
            selectedEmployee.paidLeave,
          ),

        compOff:
          String(
            selectedEmployee.compOff,
          ),
      });

      setError("");

      return;
    }

    setFormData(
      initialFormData,
    );
    setError("");
  }, [
    mode,
    selectedEmployee,
  ]);

  // ==========================================================
  // MODE FLAGS
  // ==========================================================

  const isViewMode =
    mode === "view";

  const isEditMode =
    mode === "edit";

  // ==========================================================
  // HANDLE FORM CHANGE
  // ==========================================================

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      }),
    );

    setError("");
  };

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm =
    (): void => {
      setFormData(
        initialFormData,
      );

      setError("");
    };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel =
    (): void => {
      if (submitting) {
        return;
      }

      resetForm();

      onCancel();
    };

  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  const validateForm =
    (): boolean => {
      if (
        !formData.employeeId
      ) {
        setError(
          "Please select an employee.",
        );

        return false;
      }

      if (!formData.year) {
        setError(
          "Please select a year.",
        );

        return false;
      }

      if (
        formData.casualLeave ===
          "" ||
        formData.paidLeave ===
          "" ||
        formData.compOff ===
          ""
      ) {
        setError(
          "Please enter all leave balances.",
        );

        return false;
      }

      const casualLeave =
        Number(
          formData.casualLeave,
        );

      const paidLeave =
        Number(
          formData.paidLeave,
        );

      const compOff =
        Number(
          formData.compOff,
        );

      if (
        Number.isNaN(
          casualLeave,
        ) ||
        Number.isNaN(
          paidLeave,
        ) ||
        Number.isNaN(
          compOff,
        ) ||
        casualLeave < 0 ||
        paidLeave < 0 ||
        compOff < 0
      ) {
        setError(
          "Leave balances must be valid non-negative numbers.",
        );

        return false;
      }

      return true;
    };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    const employee =
      employees.find(
        (item) =>
          item.employeeId ===
          formData.employeeId,
      );

    /*
     * When editing, the selected employee may not be present
     * in the currently loaded employee list for some edge case.
     *
     * In that situation we can still use the employee code
     * already stored in the selected record.
     */

    const employeeName =
      employee?.name ??
      selectedEmployee?.employeeName ??
      formData.employeeId;

    const casualLeave =
      Number(
        formData.casualLeave,
      );

    const paidLeave =
      Number(
        formData.paidLeave,
      );

    const compOff =
      Number(
        formData.compOff,
      );

    try {
      setSubmitting(true);
      setError("");

      // ======================================================
      // EDIT EXISTING BALANCE
      // ======================================================

      if (
        isEditMode &&
        selectedEmployee
      ) {
        const request: LeaveBalanceUpdateRequest =
          {
            remained_comp_off: compOff,
          };

        const updated =
          await leaveService.updateLeaveBalance(
            selectedEmployee.id,
            request,
          );

        const updatedEmployee: LeaveEmployee =
          {
            id:
              updated.id,

            employeeName:
              employeeName,

            empCode:
              updated.emp_id,

            year:
              updated.year,

            casualLeave:
              Number(
                updated.remained_casual_leave ??
                  0,
              ),

            paidLeave:
              Number(
                updated.remained_paid_leave ??
                  0,
              ),

            compOff:
              Number(
                updated.remained_comp_off ??
                  0,
              ),

            createdOn:
              selectedEmployee.createdOn,
          };

        onSave(
          updatedEmployee,
        );

        resetForm();

        return;
      }

      // ======================================================
      // CREATE NEW BALANCE
      // ======================================================

      const request: LeaveBalanceCreateRequest =
        {
          emp_id:
            formData.employeeId,

          year:
            formData.year,

          remained_casual_leave:
            casualLeave,

          remained_paid_leave:
            paidLeave,

          remained_comp_off:
            compOff,

          leave_type:
            null,
        };

      const created =
        await leaveService.createLeaveBalance(
          request,
        );

      const createdEmployee: LeaveEmployee =
        {
          id:
            created.id,

          employeeName:
            employeeName,

          empCode:
            created.emp_id,

          year:
            created.year,

          casualLeave:
            Number(
              created.remained_casual_leave ??
                0,
            ),

          paidLeave:
            Number(
              created.remained_paid_leave ??
                0,
            ),

          compOff:
            Number(
              created.remained_comp_off ??
                0,
            ),

          createdOn:
            created.createddate
              ? new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                ).format(
                  new Date(
                    created.createddate,
                  ),
                )
              : "-",
        };

      onSave(
        createdEmployee,
      );

      resetForm();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to save leave balance.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // TITLE
  // ==========================================================

  const getTitle =
    (): string => {
      if (mode === "edit") {
        return "Edit Employee Leave Balance";
      }

      if (mode === "view") {
        return "View Employee Leave Balance";
      }

      return "Add New Employee Leave Balance";
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="add-view-leave-form-card">

      {/* ====================================================
          ILLUSTRATION
          ==================================================== */}

      <img
        src={
          leaveBalanceCalendarIllustration
        }
        alt=""
        className="add-view-leave-form-card__illustration"
        aria-hidden="true"
      />

      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="add-view-leave-form-card__header">

        <div
          className="add-view-leave-form-card__header-icon"
          aria-hidden="true"
        >
          <UserRoundPlus
            size={21}
            strokeWidth={2}
          />
        </div>

        <h2 className="add-view-leave-form-card__title">
          {getTitle()}
        </h2>

      </div>

      {/* ====================================================
          ERROR
          ==================================================== */}

      {error && (
        <div
          role="alert"
          style={{
            marginBottom:
              "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================================
          FORM
          ==================================================== */}

      <form
        className="add-view-leave-form"
        onSubmit={
          handleSubmit
        }
        noValidate
      >

        {/* ==================================================
            EMPLOYEE + YEAR
            ================================================== */}

        <div className="add-view-leave-form__top-grid">

          {/* ================================================
              EMPLOYEE
              ================================================ */}

          <div className="add-view-leave-form__field">

            <label htmlFor="employeeId">
              Employee Name
            </label>

            <div className="add-view-leave-form__control">

              <select
                id="employeeId"
                name="employeeId"
                value={
                  formData.employeeId
                }
                onChange={
                  handleChange
                }
                disabled={
                  isViewMode ||
                  isEditMode ||
                  loadingEmployees ||
                  submitting
                }
              >
                <option value="">
                  {loadingEmployees
                    ? "Loading Employees..."
                    : "Select Employee"}
                </option>

                {employees.map(
                  (
                    employee,
                  ) => (
                    <option
                      key={
                        employee.employeeId
                      }
                      value={
                        employee.employeeId
                      }
                    >
                      {
                        employee.name
                      }{" "}
                      (
                      {
                        employee.employeeId
                      }
                      )
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                className="add-view-leave-form__select-icon"
                size={15}
                strokeWidth={2}
              />

            </div>
          </div>

          {/* ================================================
              YEAR
              ================================================ */}

          <div className="add-view-leave-form__field">

            <label htmlFor="year">
              Year
            </label>

            <div className="add-view-leave-form__control add-view-leave-form__control--with-icon">

              <CalendarDays
                className="add-view-leave-form__leading-icon"
                size={16}
                strokeWidth={1.9}
              />

              <select
                id="year"
                name="year"
                value={
                  formData.year
                }
                onChange={
                  handleChange
                }
                disabled={
                  isViewMode ||
                  isEditMode ||
                  submitting
                }
              >
                <option value="">
                  Select Year
                </option>

                {years.map(
                  (year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ),
                )}
              </select>

              <ChevronDown
                className="add-view-leave-form__select-icon"
                size={15}
                strokeWidth={2}
              />

            </div>
          </div>

        </div>

        {/* ==================================================
            LEAVE BALANCES
            ================================================== */}

        <div className="add-view-leave-form__leave-grid">

          {/* ================================================
              CASUAL LEAVE
              ================================================ */}

          <div className="add-view-leave-form__field">

            <label htmlFor="casualLeave">
              Casual Leave
            </label>

            <div className="add-view-leave-form__control add-view-leave-form__control--with-icon">

              <Umbrella
                className="add-view-leave-form__leading-icon"
                size={17}
                strokeWidth={1.8}
              />

              <input
                id="casualLeave"
                name="casualLeave"
                type="number"
                min="0"
                step="0.5"
                value={
                  formData.casualLeave
                }
                onChange={
                  handleChange
                }
                placeholder="Enter Casual Leave"
                disabled={
                  isViewMode ||
                  isEditMode ||
                  submitting
                }
              />

            </div>
          </div>

          {/* ================================================
              PAID LEAVE
              ================================================ */}

          <div className="add-view-leave-form__field">

            <label htmlFor="paidLeave">
              Paid Leave
            </label>

            <div className="add-view-leave-form__control add-view-leave-form__control--with-icon">

              <Umbrella
                className="add-view-leave-form__leading-icon"
                size={17}
                strokeWidth={1.8}
              />

              <input
                id="paidLeave"
                name="paidLeave"
                type="number"
                min="0"
                step="0.5"
                value={
                  formData.paidLeave
                }
                onChange={
                  handleChange
                }
                placeholder="Enter Paid Leave"
                disabled={
                  isViewMode ||
                   isEditMode ||
                  submitting
                }
              />

            </div>
          </div>

          {/* ================================================
              COMP OFF
              ================================================ */}

          <div className="add-view-leave-form__field">

            <label htmlFor="compOff">
              Comp Off
            </label>

            <div className="add-view-leave-form__control add-view-leave-form__control--with-icon">

              <Clock3
                className="add-view-leave-form__leading-icon"
                size={17}
                strokeWidth={1.8}
              />

              <input
                id="compOff"
                name="compOff"
                type="number"
                min="0"
                step="0.5"
                value={
                  formData.compOff
                }
                onChange={
                  handleChange
                }
                placeholder="Enter Comp Off"
                disabled={
                  isViewMode ||
                  submitting
                }
              />

            </div>
          </div>

        </div>

        {/* ==================================================
            ACTIONS
            ================================================== */}

        <div className="add-view-leave-form__actions">

          <button
            type="button"
            className="add-view-leave-form__cancel-button"
            onClick={
              handleCancel
            }
            disabled={
              submitting
            }
          >
            {isViewMode
              ? "Close"
              : "Cancel"}
          </button>

          {!isViewMode && (
            <button
              type="submit"
              className="add-view-leave-form__save-button"
              disabled={
                submitting
              }
            >
              <Save
                size={15}
                strokeWidth={2}
              />

              <span>
                {submitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update"
                    : "Save"}
              </span>
            </button>
          )}

        </div>

      </form>
    </section>
  );
};

export default AddViewLeaveModal;