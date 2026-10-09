import React, {
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileText,
  Home,
  Layers3,
  Leaf,
  MoreHorizontal,
  Save,
  Shield,
  Star,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import {
  checkPayslip,
  getPayslipEmployees,
} from "../../services/payslipAdmin.service";

import "./AddSalaryPfModal.css";

export interface AddSalaryPfFormData {
  month: string;
  employee: string;

  availedLeave: number;
  balanceLeave: number;

  salary: number;
  daysPaid: number;
  lopAbsent: number;

  basic: number;
  hra: number;
  cityCompensatoryAllowance: number;
  specialAllowance: number;
  otherEarning: number;
  nightAllowance: number;

  providentFundEmployee: number;
  providentFundEmployer: number;
  esic: number;
  professionalTax: number;
  otherDeduction: number;
}

interface AddSalaryPfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (
    data: AddSalaryPfFormData,
  ) => void;
}

interface EmployeeOption {
  id: string;
  name: string;
  employeeId: string;
}

interface SalaryCalculation {
  Salary?: number;
  Day_Paid?: number;
  LOP_Absent?: number;

  Basic?: number;
  HRA?: number;
  Conveyance_Allowance?: number;
  Special_Allowance?: number;
  Other_Earning?: number;
  Night_Allowance?: number;

  PF?: number;
  PF_Employer?: number;
  ESIC?: number;
  PT?: number;
  Other_Deduction?: number;

  Availed_leave?: number;
  Balance_leave?: number;
}

const createInitialForm =
  (): AddSalaryPfFormData => ({
    month: "",
    employee: "",

    availedLeave: 0,
    balanceLeave: 0,

    salary: 0,
    daysPaid: 0,
    lopAbsent: 0,

    basic: 0,
    hra: 0,
    cityCompensatoryAllowance: 0,
    specialAllowance: 0,
    otherEarning: 0,
    nightAllowance: 0,

    providentFundEmployee: 0,
    providentFundEmployer: 0,
    esic: 0,
    professionalTax: 0,
    otherDeduction: 0,
  });

const numberValue = (
  value: string,
): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const formatAmount = (
  value: number,
): string => {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const AddSalaryPfModal: React.FC<
  AddSalaryPfModalProps
> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [
    form,
    setForm,
  ] = useState<AddSalaryPfFormData>(
    createInitialForm,
  );

  const [
    employees,
    setEmployees,
  ] = useState<EmployeeOption[]>([]);

  const [
    isLoadingEmployees,
    setIsLoadingEmployees,
  ] = useState(false);

  const [
    isCheckingSalary,
    setIsCheckingSalary,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    checkMessage,
    setCheckMessage,
  ] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(createInitialForm());
    setErrorMessage("");
    setCheckMessage("");

    document.body.classList.add(
      "payslip-modal-open",
    );

    return () => {
      document.body.classList.remove(
        "payslip-modal-open",
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
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
  }, [isOpen, onClose]);

  /**
   * Load employees from backend
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;

    const loadEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        setErrorMessage("");

        const response =
          await getPayslipEmployees();

        if (!isMounted) {
          return;
        }

        const employeeOptions: EmployeeOption[] =
          response.map((employee) => ({
            id: String(
              employee.emp_id ?? employee.id,
            ),

            name:
              employee.employee_name ??
              `${employee.first_name ?? ""} ${
                employee.last_name ?? ""
              }`.trim(),

            employeeId: String(
              employee.emp_code ??
                employee.emp_id ??
                employee.id,
            ),
          }));

        setEmployees(employeeOptions);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load employees.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingEmployees(false);
        }
      }
    };

    void loadEmployees();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  /**
   * Check salary when employee and month
   * are selected.
   */
  useEffect(() => {
    if (
      !isOpen ||
      !form.employee ||
      !form.month
    ) {
      return;
    }

    let isMounted = true;

    const loadSalaryCalculation = async () => {
      try {
        setIsCheckingSalary(true);
        setErrorMessage("");
        setCheckMessage("");

        const [yearValue, monthValue] =
          form.month
            .split("-")
            .map(Number);

        if (
          !yearValue ||
          !monthValue ||
          monthValue < 1 ||
          monthValue > 12
        ) {
          return;
        }

        const response =
          await checkPayslip(
            Number(form.employee),
            yearValue,
            monthValue,
          );

        if (!isMounted) {
          return;
        }

        setCheckMessage(
          response.message ?? "",
        );

        if (response.res === "Slip") {
          setErrorMessage(
            "Salary is already generated for this month.",
          );

          return;
        }

        if (
          response.res === "NoPayrollSetting"
        ) {
          setErrorMessage(
            response.message ??
              "Payroll setting not found.",
          );

          return;
        }

        if (
          response.res === "NoSalaryFound"
        ) {
          setErrorMessage(
            response.message ??
              "No salary found for this employee.",
          );

          return;
        }

        if (
          response.res !== "success" ||
          !response.ps
        ) {
          return;
        }

        const calculation =
          response.ps as SalaryCalculation;

        setForm((previous) => ({
          ...previous,

          salary: Number(
            calculation.Salary ?? 0,
          ),

          daysPaid: Number(
            calculation.Day_Paid ?? 0,
          ),

          lopAbsent: Number(
            calculation.LOP_Absent ?? 0,
          ),

          basic: Number(
            calculation.Basic ?? 0,
          ),

          hra: Number(
            calculation.HRA ?? 0,
          ),

          cityCompensatoryAllowance:
            Number(
              calculation.Conveyance_Allowance ??
                0,
            ),

          specialAllowance: Number(
            calculation.Special_Allowance ?? 0,
          ),

          otherEarning: Number(
            calculation.Other_Earning ?? 0,
          ),

          nightAllowance: Number(
            calculation.Night_Allowance ?? 0,
          ),

          providentFundEmployee: Number(
            calculation.PF ?? 0,
          ),

          providentFundEmployer: Number(
            calculation.PF_Employer ?? 0,
          ),

          esic: Number(
            calculation.ESIC ?? 0,
          ),

          professionalTax: Number(
            calculation.PT ?? 0,
          ),

          otherDeduction: Number(
            calculation.Other_Deduction ?? 0,
          ),

          availedLeave: Number(
            calculation.Availed_leave ?? 0,
          ),

          balanceLeave: Number(
            calculation.Balance_leave ?? 0,
          ),
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to check salary details.",
        );
      } finally {
        if (isMounted) {
          setIsCheckingSalary(false);
        }
      }
    };

    void loadSalaryCalculation();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    form.employee,
    form.month,
  ]);

  if (!isOpen) {
    return null;
  }

  const updateField = <
    K extends keyof AddSalaryPfFormData,
  >(
    field: K,
    value: AddSalaryPfFormData[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const totalEarnings =
    form.basic +
    form.hra +
    form.cityCompensatoryAllowance +
    form.specialAllowance +
    form.otherEarning +
    form.nightAllowance;

  const totalDeduction =
    form.providentFundEmployee +
    form.providentFundEmployer +
    form.esic +
    form.professionalTax +
    form.otherDeduction;

  const netPayable =
    totalEarnings - totalDeduction;

  const handleCreate = () => {
    onCreate?.(form);
  };

  return (
    <div
      className="add-salary-pf-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-salary-pf-title"
    >
      <div
        className="add-salary-pf-modal__backdrop"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      <div
        className="add-salary-pf-modal__dialog"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="add-salary-pf-modal__header">
          <div className="add-salary-pf-modal__header-content">
            <div className="add-salary-pf-modal__header-icon">
              <FileText
                size={35}
                strokeWidth={1.7}
              />

              <span>₹</span>
            </div>

            <div className="add-salary-pf-modal__heading">
              <span className="add-salary-pf-modal__eyebrow">
                P A Y R O L L
              </span>

              <h2 id="add-salary-pf-title">
                Add Salary (PF)
              </h2>

              <p>
                Enter salary details and generate
                payslip for the selected employee
              </p>
            </div>
          </div>

          <div className="add-salary-pf-modal__header-art">
            <span>
              Accurate Payroll
              <br />
              Happier People
            </span>

            <i />
          </div>

          <button
            type="button"
            className="add-salary-pf-modal__close"
            onClick={onClose}
            aria-label="Close Add Salary PF dialog"
          >
            <X size={19} />
          </button>
        </header>

        <form
          className="add-salary-pf-modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <section className="add-salary-pf-modal__employee-section">
            <div className="salary-pf-field salary-pf-field--month">
              <div className="salary-pf-field__icon">
                <CalendarDays size={22} />
              </div>

              <div className="salary-pf-field__body">
                <label htmlFor="salary-pf-month">
                  Month
                  <span>*</span>
                </label>

                <div className="salary-pf-input-wrapper">
                  <input
                    id="salary-pf-month"
                    type="month"
                    value={form.month}
                    onChange={(event) =>
                      updateField(
                        "month",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="salary-pf-field salary-pf-field--employee">
              <div className="salary-pf-field__icon">
                <UserRound size={22} />
              </div>

              <div className="salary-pf-field__body">
                <label htmlFor="salary-pf-employee">
                  Employee
                  <span>*</span>
                </label>

                <div className="salary-pf-select-wrapper">
                  <select
                    id="salary-pf-employee"
                    value={form.employee}
                    onChange={(event) =>
                      updateField(
                        "employee",
                        event.target.value,
                      )
                    }
                    required
                    disabled={isLoadingEmployees}
                  >
                    <option value="">
                      {isLoadingEmployees
                        ? "Loading Employees..."
                        : "Select Employee"}
                    </option>

                    {employees.map(
  (employee: EmployeeOption) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name} (
                          {employee.employeeId})
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>
            </div>
          </section>

          {isCheckingSalary && (
            <p
              role="status"
              aria-live="polite"
            >
              Checking salary details...
            </p>
          )}

          {checkMessage &&
            !errorMessage &&
            !isCheckingSalary && (
              <p
                role="status"
                aria-live="polite"
              >
                {checkMessage}
              </p>
            )}

          {errorMessage && (
            <p
              role="alert"
              aria-live="assertive"
            >
              {errorMessage}
            </p>
          )}

          <SalaryPfSection
            className="salary-pf-section--leave"
            icon={
              <CalendarDays size={27} />
            }
            title="Monthly Leave Information"
            description="Enter leave details for the selected month"
          >
            <SalaryPfNumberField
              label="Availed Leave"
              required
              value={form.availedLeave}
              onChange={(value) =>
                updateField(
                  "availedLeave",
                  value,
                )
              }
              icon={<Leaf size={17} />}
            />

            <SalaryPfNumberField
              label="Balance Leave"
              required
              value={form.balanceLeave}
              onChange={(value) =>
                updateField(
                  "balanceLeave",
                  value,
                )
              }
              icon={<Layers3 size={17} />}
            />
          </SalaryPfSection>

          <SalaryPfSection
            className="salary-pf-section--salary"
            icon={
              <WalletCards size={27} />
            }
            title="Salary Information"
            description="Enter basic salary details"
          >
            <SalaryPfNumberField
              label="Salary"
              required
              value={form.salary}
              onChange={(value) =>
                updateField(
                  "salary",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
              disabled
            />

            <SalaryPfNumberField
              label="Day's Paid"
              required
              value={form.daysPaid}
              onChange={(value) =>
                updateField(
                  "daysPaid",
                  value,
                )
              }
              icon={
                <CalendarDays size={16} />
              }
            />

            <SalaryPfNumberField
              label="LOP/Absent"
              required
              value={form.lopAbsent}
              onChange={(value) =>
                updateField(
                  "lopAbsent",
                  value,
                )
              }
              icon={
                <UserRound size={16} />
              }
            />
          </SalaryPfSection>

          <SalaryPfSection
            className="salary-pf-section--earning"
            icon={
              <BarChart3 size={27} />
            }
            title="Earning"
            description="Enter all earning components"
          >
            <SalaryPfNumberField
              label="Basic"
              required
              value={form.basic}
              onChange={(value) =>
                updateField(
                  "basic",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />

            <SalaryPfNumberField
              label="HRA"
              required
              value={form.hra}
              onChange={(value) =>
                updateField(
                  "hra",
                  value,
                )
              }
              icon={<Home size={16} />}
            />

            <SalaryPfNumberField
              label="City Compensatory Allowance(CCA)"
              required
              value={
                form.cityCompensatoryAllowance
              }
              onChange={(value) =>
                updateField(
                  "cityCompensatoryAllowance",
                  value,
                )
              }
              icon={
                <BarChart3 size={16} />
              }
            />

            <SalaryPfNumberField
              label="Special Allowance"
              required
              value={form.specialAllowance}
              onChange={(value) =>
                updateField(
                  "specialAllowance",
                  value,
                )
              }
              icon={<Star size={16} />}
            />

            <SalaryPfNumberField
              label="Other"
              value={form.otherEarning}
              onChange={(value) =>
                updateField(
                  "otherEarning",
                  value,
                )
              }
              icon={
                <MoreHorizontal size={17} />
              }
            />

            <SalaryPfNumberField
              label="Night Allowance"
              value={form.nightAllowance}
              onChange={(value) =>
                updateField(
                  "nightAllowance",
                  value,
                )
              }
              icon={
                <span className="salary-pf-moon">
                  ☽
                </span>
              }
            />
          </SalaryPfSection>

          <SalaryPfSection
            className="salary-pf-section--deduction"
            icon={<Shield size={27} />}
            title="Deduction & Recoveries"
            description="Enter applicable deductions"
          >
            <SalaryPfNumberField
              label="Provident Fund (Employee)"
              value={
                form.providentFundEmployee
              }
              onChange={(value) =>
                updateField(
                  "providentFundEmployee",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />

            <SalaryPfNumberField
              label="Provident Fund (Employer)"
              value={
                form.providentFundEmployer
              }
              onChange={(value) =>
                updateField(
                  "providentFundEmployer",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />

            <SalaryPfNumberField
              label="E.S.I.C"
              value={form.esic}
              onChange={(value) =>
                updateField(
                  "esic",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />

            <SalaryPfNumberField
              label="Professional Tax"
              value={form.professionalTax}
              onChange={(value) =>
                updateField(
                  "professionalTax",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />

            <SalaryPfNumberField
              label="Other"
              value={form.otherDeduction}
              onChange={(value) =>
                updateField(
                  "otherDeduction",
                  value,
                )
              }
              icon={
                <span className="salary-pf-currency">
                  ₹
                </span>
              }
            />
          </SalaryPfSection>

          <SalaryPfSection
            className="salary-pf-section--total"
            icon={
              <WalletCards size={27} />
            }
            title="Total"
            description="Auto calculated values"
          >
            <SalaryPfReadOnlyField
              label="Total Earnings"
              value={totalEarnings}
            />

            <SalaryPfReadOnlyField
              label="Total Deduction"
              value={totalDeduction}
            />

            <SalaryPfReadOnlyField
              label="Net Payable"
              value={netPayable}
            />
          </SalaryPfSection>

          <div className="add-salary-pf-modal__actions">
            <button
              type="button"
              className="add-salary-pf-modal__cancel"
              onClick={onClose}
            >
              <X size={17} />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="add-salary-pf-modal__create"
              disabled={
                isCheckingSalary ||
                isLoadingEmployees ||
                Boolean(errorMessage)
              }
            >
              <Save size={16} />
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface SalaryPfSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const SalaryPfSection: React.FC<
  SalaryPfSectionProps
> = ({
  title,
  description,
  icon,
  className = "",
  children,
}) => {
  return (
    <section
      className={`salary-pf-section ${className}`}
    >
      <div className="salary-pf-section__identity">
        <div className="salary-pf-section__icon">
          {icon}
        </div>

        <div className="salary-pf-section__title">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <div className="salary-pf-section__fields">
        {children}
      </div>
    </section>
  );
};

interface SalaryPfNumberFieldProps {
  label: string;
  value: number;
  required?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  onChange: (value: number) => void;
}

const SalaryPfNumberField: React.FC<
  SalaryPfNumberFieldProps
> = ({
  label,
  value,
  required = false,
  disabled = false,
  icon,
  onChange,
}) => {
  return (
    <div className="salary-pf-number-field">
      <label>
        {label}
        {required && <span>*</span>}
      </label>

      <div
        className={`salary-pf-number-input ${
          disabled
            ? "salary-pf-number-input--disabled"
            : ""
        }`}
      >
        <div className="salary-pf-number-input__icon">
          {icon}
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              numberValue(
                event.target.value,
              ),
            )
          }
        />
      </div>
    </div>
  );
};

interface SalaryPfReadOnlyFieldProps {
  label: string;
  value: number;
}

const SalaryPfReadOnlyField: React.FC<
  SalaryPfReadOnlyFieldProps
> = ({
  label,
  value,
}) => {
  return (
    <div className="salary-pf-number-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className="salary-pf-number-input salary-pf-number-input--disabled">
        <div className="salary-pf-number-input__icon">
          <span className="salary-pf-currency">
            ₹
          </span>
        </div>

        <input
          type="text"
          value={formatAmount(value)}
          readOnly
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

export default AddSalaryPfModal;