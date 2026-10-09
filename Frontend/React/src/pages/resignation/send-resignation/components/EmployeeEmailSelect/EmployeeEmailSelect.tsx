import {
  ChevronDown,
  Mail,
} from "lucide-react";

import type {
  ActiveEmployee,
} from "../../types/sendResignation.types";

import "./EmployeeEmailSelect.css";

interface EmployeeEmailSelectProps {
  employees: ActiveEmployee[];
  value: string;
  error?: string;
  loading: boolean;
  onChange: (
    employeeId: number | null,
    email: string,
  ) => void;
}

export const EmployeeEmailSelect =
  ({
    employees,
    value,
    error,
    loading,
    onChange,
  }: EmployeeEmailSelectProps): JSX.Element => {
    const selectedEmployee =
      employees.find(
        (employee) =>
          employee.email.toLowerCase() ===
          value.trim().toLowerCase(),
      );

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
      const email =
        event.target.value.trim();

      const employee =
        employees.find(
          (item) =>
            item.email.toLowerCase() ===
            email.toLowerCase(),
        );

      onChange(
        employee?.employee_id ?? null,
        email,
      );
    };

    return (
      <div className="employee-email-field">
        <label htmlFor="employee-email">
          Employee Email <span>*</span>
        </label>

        <div
          className={`employee-email-control ${
            error
              ? "employee-email-control--error"
              : ""
          }`}
        >
          <Mail
            size={18}
            className="employee-email-icon"
          />

          <input
            id="employee-email"
            name="employeeEmail"
            type="email"
            list="active-employees-list"
            value={value}
            onChange={handleChange}
            placeholder={
              loading
                ? "Loading active employees..."
                : "Select or enter employee email"
            }
            disabled={loading}
            autoComplete="off"
          />

          <ChevronDown
            size={18}
            className="employee-email-chevron"
          />

          <datalist id="active-employees-list">
            {employees.map(
              (employee) => (
                <option
                  key={employee.employee_id}
                  value={employee.email}
                  label={`${employee.employee_name} — ${employee.email}`}
                />
              ),
            )}
          </datalist>
        </div>

        {selectedEmployee && (
          <div className="employee-email-selected">
            <span>
              {selectedEmployee.employee_name}
            </span>
            <span>
              {selectedEmployee.email}
            </span>
          </div>
        )}

        <small>
          Select an active employee or enter
          their email address
        </small>

        {error && (
          <div className="employee-email-error">
            {error}
          </div>
        )}
      </div>
    );
  };