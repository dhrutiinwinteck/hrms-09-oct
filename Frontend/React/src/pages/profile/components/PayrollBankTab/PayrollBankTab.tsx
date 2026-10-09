import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileText,
  IndianRupee,
  Link2,
  Lock,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  getUsername,
} from "@/pages/auth/utils/authStorage";

import type {
  EmployeeBankApi,
  EmployeeSalaryApi,
  EmployeeSalaryUpdate,
  EmployeeBankUpdate,
  EmployeeProfileApi,
} from "../../types/profile.types";

import {
  getEmployeeBank,
  getEmployeeSalary,
  updateEmployeeBank,
  updateEmployeeSalary,
} from "../../services/profile.service";

import "./PayrollBankTab.css";

interface PayrollBankTabProps {
  employeeCode?: string;
}

interface EditState {
  salary: string;
  mode_pay: string;
  uan: string;
  esic: string;
  bank_name: string;
  account_no: string;
  ifsc_code: string;
}

const EMPTY_EDIT_STATE: EditState = {
  salary: "",
  mode_pay: "",
  uan: "",
  esic: "",
  bank_name: "",
  account_no: "",
  ifsc_code: "",
};

const getDisplayValue = (
  value: unknown,
  fallback = "Not Set",
): string => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
};

const toArray = <T,>(
  value: T | T[] | null | undefined,
): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};

const getInitials = (name: string): string => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const formatDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "Not Set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSalary = (
  value: number | string | null | undefined,
): string => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "Not Set";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  return `₹ ${numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const maskAccountNumber = (
  accountNumber: string | null | undefined,
): string => {
  if (!accountNumber) {
    return "Not Set";
  }

  const value = String(accountNumber).trim();

  if (value.length <= 4) {
    return value;
  }

  return `**** **** ${value.slice(-4)}`;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
};

export const PayrollBankTab = ({
  employeeCode,
}: PayrollBankTabProps) => {
  const [searchParams] = useSearchParams();

  const [profile, setProfile] =
    useState<EmployeeProfileApi | null>(null);

  const [salary, setSalary] =
    useState<EmployeeSalaryApi | null>(null);

  const [bank, setBank] =
    useState<EmployeeBankApi | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [editMode, setEditMode] =
    useState<boolean>(false);

  const [editState, setEditState] =
    useState<EditState>(EMPTY_EDIT_STATE);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  const loadData = useCallback(async () => {
    const code =
      employeeCode?.trim() ||
      searchParams.get("empCode")?.trim() ||
      getUsername()?.trim();

    if (!code) {
      setError("Employee code is not available.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error(
          "API base URL is not configured.",
        );
      }

      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, "")}/api/v1/employees/profile/${encodeURIComponent(code)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(localStorage.getItem("accessToken")
              ? {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                }
              : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch employee profile.",
        );
      }

      const employeeProfile: EmployeeProfileApi =
        await response.json();

      const employeeId =
        employeeProfile.emp_id ??
        employeeProfile.id;

      if (
        employeeId === null ||
        employeeId === undefined ||
        !Number.isInteger(employeeId) ||
        employeeId <= 0
      ) {
        throw new Error(
          "Employee database ID is missing.",
        );
      }

      const [
        salaryResult,
        bankResult,
      ] = await Promise.all([
        getEmployeeSalary(employeeId),
        getEmployeeBank(employeeId),
      ]);

      const salaryDetails = toArray(salaryResult);
      const bankDetails = toArray(bankResult);

      setProfile(employeeProfile);
      setSalary(salaryDetails[0] ?? null);
      setBank(bankDetails[0] ?? null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [employeeCode, searchParams]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const startEditing = () => {
  setEditState({
    salary:
      salary?.salary !== null &&
      salary?.salary !== undefined
        ? String(salary.salary)
        : "",

    mode_pay:
      salary?.mode_pay !== null &&
      salary?.mode_pay !== undefined
        ? String(salary.mode_pay)
        : "",

    uan: salary?.uan ?? "",

    esic: salary?.esic ?? "",

    bank_name: bank?.bank_name ?? "",

    account_no: bank?.account_no ?? "",

    ifsc_code: bank?.ifsc_code ?? "",
  });

  setValidationError(null);
  setSuccessMessage(null);
  setEditMode(true);
};

  const cancelEditing = () => {
    if (saving) {
      return;
    }

    setEditMode(false);
    setValidationError(null);
  };

  const handleInputChange = (
    field: keyof EditState,
    value: string,
  ) => {
    setEditState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (
      editState.salary.trim() !== "" &&
      !Number.isFinite(Number(editState.salary))
    ) {
      return "Please enter a valid salary amount.";
    }

    if (
      editState.salary.trim() !== "" &&
      Number(editState.salary) < 0
    ) {
      return "Salary cannot be negative.";
    }

    if (
      editState.ifsc_code.trim() !== "" &&
      !/^[A-Za-z0-9]{4,20}$/.test(
        editState.ifsc_code.trim(),
      )
    ) {
      return "Please enter a valid IFSC code.";
    }

    return null;
  };

  const handleSave = async () => {
    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    if (!salary?.id && !bank?.id) {
      setValidationError(
        "No salary or bank record is available for editing.",
      );
      return;
    }

    try {
      setSaving(true);
      setValidationError(null);
      setSuccessMessage(null);

      if (salary?.id) {
        const salaryPayload: EmployeeSalaryUpdate = {
          salary:
            editState.salary.trim() === ""
              ? null
              : Number(editState.salary),

          mode_pay:
            editState.mode_pay.trim() || null,

          uan:
            editState.uan.trim() || null,

          esic:
            editState.esic.trim() || null,
        };

        const updatedSalary =
          await updateEmployeeSalary(
            salary.id,
            salaryPayload,
          );

        setSalary(updatedSalary);
      }

      if (bank?.id) {
        const bankPayload: EmployeeBankUpdate = {
          bank_name:
            editState.bank_name.trim() || null,

          account_no:
            editState.account_no.trim() || null,

          ifsc_code:
            editState.ifsc_code.trim() || null,
        };

        const updatedBank =
          await updateEmployeeBank(
            bank.id,
            bankPayload,
          );

        setBank(updatedBank);
      }

      setSuccessMessage(
        "Payroll and bank information updated successfully.",
      );

      setEditMode(false);
    } catch (err: unknown) {
      setValidationError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="payroll-bank-page">
        <div className="payroll-bank-loading">
          Loading payroll and bank information...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="payroll-bank-page">
        <div className="payroll-bank-error">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadData()}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const fullName =
    profile?.full_name?.trim() ||
    "Unknown Employee";

  const initials = getInitials(fullName);

  return (
    <section className="payroll-bank-page">
      <div className="payroll-bank-heading">
        <div>
          <h1>Payroll & Bank Information</h1>

          <div className="payroll-bank-breadcrumb">
            <span>Dashboard</span>
            <span>›</span>
            <span>My Profile</span>
            <span>›</span>
            <strong>Payroll & Bank</strong>
          </div>
        </div>

        <button
          type="button"
          className="payroll-edit-button"
          onClick={startEditing}
          disabled={editMode}
        >
          <Edit3 size={16} />
          Edit Information
        </button>
      </div>

      <div className="payroll-profile-header">
        <div className="payroll-profile-avatar">
          {profile?.photo ? (
            <img
              src={profile.photo}
              alt={fullName}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="payroll-profile-content">
          <div className="payroll-profile-title">
            <h2>{fullName}</h2>

            <span className="payroll-status-badge">
              <CheckCircle2 size={13} />
              Active
            </span>
          </div>

          <p className="payroll-designation">
            {getDisplayValue(
              profile?.designation,
            )}
          </p>

          <div className="payroll-profile-meta">
            <div className="payroll-meta-item">
              <UserRound size={17} />

              <div>
                <span>Employee ID</span>
                <strong>
                  {getDisplayValue(
                    profile?.emp_code,
                  )}
                </strong>
              </div>
            </div>

            <div className="payroll-meta-item">
              <CalendarDays size={17} />

              <div>
                <span>Date of Joining</span>
                <strong>
                  {formatDate(profile?.doj)}
                </strong>
              </div>
            </div>

            <div className="payroll-meta-item">
              <Building2 size={17} />

              <div>
                <span>Work Location</span>
                <strong>
                  {getDisplayValue(
                    profile?.company_location,
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="payroll-success-message">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {validationError && (
        <div className="payroll-validation-message">
          {validationError}
        </div>
      )}

      <div className="payroll-bank-grid">
        <section className="payroll-info-card">
          <div className="payroll-card-header">
            <div className="payroll-card-title">
              <div className="payroll-card-icon">
                <IndianRupee size={21} />
              </div>

              <h3>Salary Information</h3>
            </div>

            <span className="payroll-readonly-badge">
              <Lock size={13} />
              {editMode ? "Edit Mode" : "Read Only"}
            </span>
          </div>

          <div className="payroll-card-body">
            {editMode ? (
              <>
                <EditableField
                  label="Salary"
                  value={editState.salary}
                  onChange={(value) =>
                    handleInputChange("salary", value)
                  }
                  type="number"
                  icon={<IndianRupee size={17} />}
                />

                <EditableField
                  label="Payment Mode"
                  value={editState.mode_pay}
                  onChange={(value) =>
                    handleInputChange("mode_pay", value)
                  }
                  icon={<CreditCard size={17} />}
                />

                <EditableField
                  label="UAN"
                  value={editState.uan}
                  onChange={(value) =>
                    handleInputChange("uan", value)
                  }
                  icon={<ShieldCheck size={17} />}
                />

                <EditableField
                  label="ESIC"
                  value={editState.esic}
                  onChange={(value) =>
                    handleInputChange("esic", value)
                  }
                  icon={<FileText size={17} />}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="Salary"
                  value={formatSalary(salary?.salary)}
                  icon={<IndianRupee size={17} />}
                  highlighted
                />

                <InfoRow
                  label="Payment Mode"
                  value={getDisplayValue(
                    salary?.mode_pay,
                  )}
                  icon={<CreditCard size={17} />}
                />

                <InfoRow
                  label="UAN"
                  value={getDisplayValue(salary?.uan)}
                  icon={<ShieldCheck size={17} />}
                />

                <InfoRow
                  label="ESIC"
                  value={getDisplayValue(salary?.esic)}
                  icon={<FileText size={17} />}
                />
              </>
            )}
          </div>
        </section>

        <section className="payroll-info-card">
          <div className="payroll-card-header">
            <div className="payroll-card-title">
              <div className="payroll-card-icon">
                <Building2 size={21} />
              </div>

              <h3>Bank Information</h3>
            </div>

            <span className="payroll-readonly-badge">
              <Lock size={13} />
              {editMode ? "Edit Mode" : "Read Only"}
            </span>
          </div>

          <div className="payroll-card-body">
            {editMode ? (
              <>
                <EditableField
                  label="Bank Name"
                  value={editState.bank_name}
                  onChange={(value) =>
                    handleInputChange("bank_name", value)
                  }
                  icon={<Building2 size={17} />}
                />

                <EditableField
                  label="Account Number"
                  value={editState.account_no}
                  onChange={(value) =>
                    handleInputChange("account_no", value)
                  }
                  icon={<CreditCard size={17} />}
                />

                <EditableField
                  label="IFSC Code"
                  value={editState.ifsc_code}
                  onChange={(value) =>
                    handleInputChange("ifsc_code", value)
                  }
                  icon={<Link2 size={17} />}
                />
              </>
            ) : (
              <>
                <InfoRow
                  label="Bank Name"
                  value={getDisplayValue(
                    bank?.bank_name,
                  )}
                  icon={<Building2 size={17} />}
                />

                <InfoRow
                  label="Account Number"
                  value={maskAccountNumber(
                    bank?.account_no,
                  )}
                  icon={<CreditCard size={17} />}
                />

                <InfoRow
                  label="IFSC Code"
                  value={getDisplayValue(
                    bank?.ifsc_code,
                  )}
                  icon={<Link2 size={17} />}
                />
              </>
            )}
          </div>
        </section>
      </div>

      <div className="payroll-information-notice">
        <ShieldCheck size={20} />

        <div>
          <strong>Payroll & Bank Security</strong>

          <p>
            This information is retrieved from the HRMS
            database. Please ensure all changes are
            accurate before saving.
          </p>
        </div>
      </div>

      {editMode && (
        <div className="payroll-edit-actions">
          <button
            type="button"
            className="payroll-cancel-button"
            onClick={cancelEditing}
            disabled={saving}
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="button"
            className="payroll-save-button"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <Save size={17} />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </section>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlighted?: boolean;
}

const InfoRow = ({
  label,
  value,
  icon,
  highlighted = false,
}: InfoRowProps) => {
  return (
    <div className="payroll-info-row">
      <div className="payroll-row-label">
        <span className="payroll-row-icon">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <strong
        className={
          highlighted
            ? "payroll-row-value payroll-highlight-value"
            : "payroll-row-value"
        }
      >
        {value}
      </strong>
    </div>
  );
};

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: "text" | "number";
}

const EditableField = ({
  label,
  value,
  onChange,
  icon,
  type = "text",
}: EditableFieldProps) => {
  return (
    <div className="payroll-edit-field">
      <label htmlFor={`payroll-${label}`}>
        {label}
      </label>

      <div className="payroll-input-wrapper">
        <span className="payroll-input-icon">
          {icon}
        </span>

        <input
          id={`payroll-${label}`}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={`Enter ${label}`}
        />
      </div>
    </div>
  );
};

export default PayrollBankTab;