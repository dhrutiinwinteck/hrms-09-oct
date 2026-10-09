import React, {
  useState,
  useMemo,
  useEffect,
} from "react";



import { X } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useEmployees } from "./hooks/useEmployees";

import { useEmployeeFilters } from "./hooks/useEmployeeFilters";

import { EmployeeHeader } from "./components/EmployeeHeader/EmployeeHeader";

import { EmployeeStatistics } from "./components/EmployeeStatistics/EmployeeStatistics";

import { EmployeeToolbar } from "./components/EmployeeToolbar/EmployeeToolbar";

import { EmployeeTable } from "./components/EmployeeTable/EmployeeTable";

import { EmployeePagination } from "./components/EmployeePagination/EmployeePagination";

import { AddEmployeeModal } from "./components/AddEmployeeModal/AddEmployeeModal";

import { EMPLOYEE_PAGE_SIZE } from "./constants/employees.constants";

import { useToast } from "@/hooks/useToast";

import "./AllEmployeesPage.css";

interface ActivateEmployeeFormData {
  reason: string;
  resignation: string;
  termination: string;
  fromDate: string;
  noticePeriod: string;
}

const AllEmployeesPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  // Add/Edit Employee modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<any>(null);

  // Activate Employee modal state
  const [isActivateModalOpen, setIsActivateModalOpen] =
    useState(false);

  const [employeeToActivate, setEmployeeToActivate] =
    useState<any>(null);

  // Activate Employee form state
  const [activateForm, setActivateForm] =
    useState<ActivateEmployeeFormData>({
      reason: "",
      resignation: "",
      termination: "",
      fromDate: "",
      noticePeriod: "",
    });

  // Activation submit loading state
  const [isActivating, setIsActivating] = useState(false);

  const {
    employees,
    loading,
    statistics,
    fetchEmployees,
    createEmployee,
    deleteEmployee,
    updateEmployee,
  } = useEmployees();

  const {
    filters,
    filteredEmployees,
    updateFilter,
    resetFilters,
  } = useEmployeeFilters(employees);

  const toast = useToast();

  // Get unique designations
  const designations = useMemo(() => {
    const designationSet = new Set(
      employees.map((employee) => employee.designation),
    );

    return Array.from(designationSet)
      .filter(Boolean)
      .sort();
  }, [employees]);

  // Get unique employee types
  const employeeTypes = useMemo(() => {
    const employeeTypeSet = new Set(
      employees.map((employee) => employee.employeeType),
    );

    return Array.from(employeeTypeSet)
      .filter(Boolean)
      .sort();
  }, [employees]);

  // Pagination
  const totalFiltered = filteredEmployees.length;

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * EMPLOYEE_PAGE_SIZE,
    currentPage * EMPLOYEE_PAGE_SIZE,
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Add Employee
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  // Close Add/Edit Employee modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Create Employee
  const handleCreateEmployee = async (data: any) => {
    try {
      await createEmployee(data);

      toast.success("Employee created successfully!");

      await fetchEmployees();

      return data;
    } catch (error: any) {
      toast.error(
        error.message || "Failed to create employee",
      );

      throw error;
    }
  };

  // Update Employee
  const handleUpdateEmployee = async (data: any) => {
    if (!selectedEmployee) {
      return;
    }

    try {
      await updateEmployee(
        selectedEmployee.id,
        data,
      );

      toast.success("Employee updated successfully!");

      await fetchEmployees();

      return data;
    } catch (error: any) {
      toast.error(
        error.message || "Failed to update employee",
      );

      throw error;
    }
  };

  // ============================================================
// View Employee Profile
// Opens the selected employee's profile, not logged-in user's profile
// ============================================================
const handleViewEmployee = (employee: any) => {
  const employeeCode = employee.employeeCode?.trim();

  if (!employeeCode) {
    toast.error("Employee code is not available.");
    return;
  }

  navigate(
    `/dashboard/profile?empCode=${encodeURIComponent(employeeCode)}`,
  );
};

  // Edit Employee
  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  // Delete Employee
  const handleDeleteEmployee = async (employee: any) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${employee.fullName}?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteEmployee(employee.id);

      toast.success(
        "Employee deleted successfully!",
      );

      await fetchEmployees();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to delete employee",
      );
    }
  };

  // Activate Employee
  const handleActivateEmployee = (employee: any) => {
    setEmployeeToActivate(employee);

    setActivateForm({
      reason: "",
      resignation: "",
      termination: "",
      fromDate: "",
      noticePeriod: "",
    });

    setIsActivateModalOpen(true);
  };

  // Close Activate Employee modal
  const handleCloseActivateModal = () => {
    if (isActivating) {
      return;
    }

    setIsActivateModalOpen(false);

    setEmployeeToActivate(null);

    setActivateForm({
      reason: "",
      resignation: "",
      termination: "",
      fromDate: "",
      noticePeriod: "",
    });
  };

  // Activate Employee input handler
  const handleActivateInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setActivateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit Activate Employee form
  const handleSubmitActivation = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!employeeToActivate) {
      return;
    }

    if (
      !activateForm.reason.trim() ||
      !activateForm.resignation ||
      !activateForm.termination ||
      !activateForm.fromDate ||
      !activateForm.noticePeriod.trim()
    ) {
      toast.error(
        "Please fill all required fields.",
      );

      return;
    }

    const noticePeriod = Number(
      activateForm.noticePeriod,
    );

    if (
      !Number.isFinite(noticePeriod) ||
      noticePeriod < 0
    ) {
      toast.error(
        "Please enter a valid notice period.",
      );

      return;
    }

    try {
      setIsActivating(true);

      await updateEmployee(
        employeeToActivate.id,
        {
          reason: activateForm.reason.trim(),

          resignation: activateForm.resignation,

          termination: activateForm.termination,

          fromDate: activateForm.fromDate,

          noticePeriod,

          status: "Active",
        },
      );

      toast.success(
        "Employee activation details saved successfully!",
      );

      await fetchEmployees();

      setIsActivateModalOpen(false);

      setEmployeeToActivate(null);

      setActivateForm({
        reason: "",
        resignation: "",
        termination: "",
        fromDate: "",
        noticePeriod: "",
      });
    } catch (error: any) {
      toast.error(
        error.message ||
          "Failed to save activation details",
      );
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="all-employees-page">
      <EmployeeHeader
        onAddEmployee={handleAddEmployee}
      />

      <EmployeeStatistics
        statistics={statistics}
      />

      <EmployeeToolbar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={() => {
          resetFilters();
          setCurrentPage(1);
        }}
        designations={designations}
      />

      <EmployeeTable
        employees={paginatedEmployees}
        loading={loading}
        onView={handleViewEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onActivate={handleActivateEmployee}
      />

      <EmployeePagination
        currentPage={currentPage}
        totalItems={totalFiltered}
        pageSize={EMPLOYEE_PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={
          selectedEmployee
            ? handleUpdateEmployee
            : handleCreateEmployee
        }
        existingEmployees={employees}
        designations={designations}
        employeeTypes={
          employeeTypes.length > 0
            ? employeeTypes
            : [
                "Full Time",
                "Part Time",
                "Contract",
                "Intern",
              ]
        }
        editData={selectedEmployee}
      />

      {isActivateModalOpen &&
        employeeToActivate && (
          <div
            className="activate-employee-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activate-employee-title"
          >
            <div className="activate-employee-modal">
              <div className="activate-employee-header">
                <h2 id="activate-employee-title">
                  Activate Employee
                </h2>

                <button
                  type="button"
                  className="activate-employee-close"
                  onClick={handleCloseActivateModal}
                  disabled={isActivating}
                  aria-label="Close Activate Employee modal"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="activate-employee-form"
                onSubmit={handleSubmitActivation}
              >
                <div className="activate-employee-body">
                  <div className="activate-form-grid">
                    <div className="activate-form-field">
                      <label htmlFor="activate-reason">
                        Reason <span>*</span>
                      </label>

                      <textarea
                        id="activate-reason"
                        name="reason"
                        value={activateForm.reason}
                        onChange={
                          handleActivateInputChange
                        }
                      />
                    </div>

                    <div className="activate-form-field">
                      <label htmlFor="activate-resignation">
                        Resignation <span>*</span>
                      </label>

                      <select
                        id="activate-resignation"
                        name="resignation"
                        value={activateForm.resignation}
                        onChange={
                          handleActivateInputChange
                        }
                      >
                        <option value="">
                          Select Type
                        </option>

                        <option value="Voluntary">
                          Voluntary
                        </option>

                        <option value="Involuntary">
                          Involuntary
                        </option>

                        <option value="Not Applicable">
                          Not Applicable
                        </option>
                      </select>
                    </div>

                    <div className="activate-form-field">
                      <label htmlFor="activate-termination">
                        Termination <span>*</span>
                      </label>

                      <select
                        id="activate-termination"
                        name="termination"
                        value={activateForm.termination}
                        onChange={
                          handleActivateInputChange
                        }
                      >
                        <option value="">
                          Select Type
                        </option>

                        <option value="Voluntary">
                          Voluntary
                        </option>

                        <option value="Involuntary">
                          Involuntary
                        </option>

                        <option value="Not Applicable">
                          Not Applicable
                        </option>
                      </select>
                    </div>

                    <div className="activate-form-field">
                      <label htmlFor="activate-from-date">
                        From Date <span>*</span>
                      </label>

                      <input
                        id="activate-from-date"
                        type="date"
                        name="fromDate"
                        value={activateForm.fromDate}
                        onChange={
                          handleActivateInputChange
                        }
                      />
                    </div>

                    <div className="activate-form-field activate-notice-field">
                      <label htmlFor="activate-notice-period">
                        Notice Period (Days){" "}
                        <span>*</span>
                      </label>

                      <input
                        id="activate-notice-period"
                        type="number"
                        name="noticePeriod"
                        min="0"
                        value={activateForm.noticePeriod}
                        onChange={
                          handleActivateInputChange
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="activate-employee-footer">
                  <button
                    type="button"
                    className="activate-close-button"
                    onClick={
                      handleCloseActivateModal
                    }
                    disabled={isActivating}
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="activate-submit-button"
                    disabled={isActivating}
                  >
                    {isActivating
                      ? "Saving..."
                      : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default AllEmployeesPage;