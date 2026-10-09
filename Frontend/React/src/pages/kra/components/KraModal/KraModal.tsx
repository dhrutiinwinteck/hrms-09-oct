import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  KRAMasterEntry,
  KRAStatus,
} from "../../types/kra.types";

import {
  MONTHS,
  YEARS,
  STATUS_OPTIONS,
} from "../../constants/kraConstants";

import "./KraModal.css";

/* ============================================================
   API MASTER TYPES
   ============================================================ */

export interface DepartmentOption {
  id: number;
  name: string;
}

export interface DesignationOption {
  id: number;
  name: string;
  depart_id: number;
  department_name?: string | null;
}

/* ============================================================
   PROPS
   ============================================================ */

interface KraModalProps {
  isOpen: boolean;

  onClose: () => void;

  onSave: (entry: KRAMasterEntry) => void;

  editData?: KRAMasterEntry | null;

  departments: DepartmentOption[];

  designations: DesignationOption[];

  /*
   * Kept optional for backward compatibility.
   *
   * IMPORTANT:
   * This data is NO LONGER used for monthly
   * weightage validation.
   *
   * Multiple KRA records are allowed for the
   * same Department + Designation + Year + Month.
   */
  existingEntries?: KRAMasterEntry[];
}

/* ============================================================
   FORM STATE
   ============================================================ */

interface KraFormData {
  department: string;
  designation: string;
  focusedArea: string;
  weightage: number;
  fromMonth: string;
  toMonth: string;
  year: number;
  status: KRAStatus;
}

/* ============================================================
   INITIAL FORM DATA
   ============================================================ */

const getInitialFormData = (): KraFormData => ({
  department: "",
  designation: "",
  focusedArea: "",
  weightage: 0,
  fromMonth: "",
  toMonth: "",
  year: new Date().getFullYear(),
  status: "Active",
});

/* ============================================================
   TEXT HELPERS
   ============================================================ */

const normalizeText = (
  value: string | null | undefined,
): string => {
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

/* ============================================================
   COMPONENT
   ============================================================ */

const KraModal: React.FC<KraModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
  departments = [],
  designations = [],
  existingEntries: _existingEntries = [],
}) => {
  /* ==========================================================
     FORM STATE
     ========================================================== */

  const [formData, setFormData] =
    useState<KraFormData>(
      getInitialFormData,
    );

  /* ==========================================================
     INITIALIZE FORM
     ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (editData) {
      setFormData({
        department:
          editData.department ?? "",

        designation:
          editData.designation ?? "",

        focusedArea:
          editData.focusedArea ?? "",

        weightage:
          Number(
            editData.weightage ?? 0,
          ),

        fromMonth:
          String(
            editData.fromMonth ?? "",
          ),

        toMonth:
          String(
            editData.toMonth ?? "",
          ),

        year:
          Number(
            editData.year ??
              new Date().getFullYear(),
          ),

        status:
          editData.status ?? "Active",
      });

      return;
    }

    setFormData(
      getInitialFormData(),
    );
  }, [
    editData,
    isOpen,
  ]);

  /* ==========================================================
     ESCAPE KEY + BODY SCROLL LOCK
     ========================================================== */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    isOpen,
    onClose,
  ]);

  /* ==========================================================
     FORM CHANGE
     ========================================================== */

  const handleChange = <
    T extends keyof KraFormData,
  >(
    field: T,
    value: KraFormData[T],
  ): void => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );
  };

  /* ==========================================================
     SELECTED DEPARTMENT
     ========================================================== */

  const selectedDepartment =
    useMemo(() => {
      const departmentName =
        normalizeText(
          formData.department,
        );

      if (!departmentName) {
        return undefined;
      }

      return departments.find(
        (department) =>
          normalizeText(
            department.name,
          ) === departmentName,
      );
    }, [
      departments,
      formData.department,
    ]);

  /* ==========================================================
     SELECTED DEPARTMENT ID
     ========================================================== */

  const selectedDepartmentId =
    selectedDepartment?.id ?? null;

  /* ==========================================================
     FILTER DESIGNATIONS
     ========================================================== */

  const filteredDesignations =
    useMemo(() => {
      if (
        selectedDepartmentId === null
      ) {
        return [];
      }

      return designations.filter(
        (designation) =>
          Number(
            designation.depart_id,
          ) ===
          Number(
            selectedDepartmentId,
          ),
      );
    }, [
      designations,
      selectedDepartmentId,
    ]);

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    /* ========================================================
       NORMALIZE VALUES
       ======================================================== */

    const department =
      formData.department.trim();

    const designation =
      formData.designation.trim();

    const focusedArea =
      formData.focusedArea.trim();

    const weightage =
      Number(formData.weightage);

    const selectedYear =
      Number(formData.year);

    /* ========================================================
       REQUIRED FIELD VALIDATION
       ======================================================== */

    if (
      !department ||
      !designation ||
      !focusedArea ||
      !formData.fromMonth ||
      !formData.toMonth
    ) {
      window.alert(
        "Please fill all required fields correctly.",
      );

      return;
    }

    /* ========================================================
       INDIVIDUAL WEIGHTAGE VALIDATION
       
       IMPORTANT:
       This validates ONLY the current KRA.
       
       It DOES NOT:
       - calculate monthly total
       - check existing KRAs
       - block duplicate months
       - limit number of KRAs
       - compare weightage with existing records
       ======================================================== */

    if (
      !Number.isInteger(weightage) ||
      weightage < 1 ||
      weightage > 100
    ) {
      window.alert(
        "Weightage must be a whole number between 1 and 100.",
      );

      return;
    }

    /* ========================================================
       DEPARTMENT VALIDATION
       ======================================================== */

    if (!selectedDepartment) {
      window.alert(
        "Please select a valid Department.",
      );

      return;
    }

    /* ========================================================
       DESIGNATION VALIDATION
       ======================================================== */

    const selectedDesignation =
      filteredDesignations.find(
        (item) =>
          normalizeText(
            item.name,
          ) ===
          normalizeText(
            designation,
          ),
      );

    if (!selectedDesignation) {
      window.alert(
        "Please select a valid Designation for the selected Department.",
      );

      return;
    }

    /* ========================================================
       MONTH VALIDATION
       
       IMPORTANT:
       We ONLY verify that both dropdowns contain a value.
       
       There is NO:
       - monthly 100% validation
       - duplicate month validation
       - overlapping KRA validation
       - existing KRA validation
       - monthly weightage calculation
       
       Therefore unlimited KRA records can be created
       for the same month.
       ======================================================== */

    if (
      !formData.fromMonth ||
      !formData.toMonth
    ) {
      window.alert(
        "Please select From Month and To Month.",
      );

      return;
    }

    /* ========================================================
       YEAR VALIDATION
       ======================================================== */

    if (
      !Number.isInteger(
        selectedYear,
      ) ||
      selectedYear < 2000
    ) {
      window.alert(
        "Please select a valid Year.",
      );

      return;
    }

    /* ========================================================
       BUILD SAVE PAYLOAD
       ======================================================== */

    const payload = {
      ...(editData ?? {}),

      department:
        selectedDepartment.name,

      designation:
        selectedDesignation.name,

      focusedArea,

      weightage,

      fromMonth:
        formData.fromMonth as KRAMasterEntry["fromMonth"],

      toMonth:
        formData.toMonth as KRAMasterEntry["toMonth"],

      year:
        selectedYear,

      status:
        formData.status,
    } as KRAMasterEntry;

    /* ========================================================
       SAVE
       ======================================================== */

    onSave(payload);
  };

  /* ==========================================================
     CLOSED STATE
     ========================================================== */

  if (!isOpen) {
    return null;
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className="kra-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="kra-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kra-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* ==================================================
            HEADER
            ================================================== */}

        <div className="kra-modal-header">
          <h2 id="kra-modal-title">
            {editData
              ? "Edit KRA Master"
              : "Add KRA Master"}
          </h2>

          <button
            type="button"
            className="kra-modal-close"
            onClick={onClose}
            aria-label="Close KRA modal"
          >
            <X
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ==================================================
            FORM
            ================================================== */}

        <form
          className="kra-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="kra-modal-body">
            <div className="kra-modal-grid">

              {/* ==================================================
                  DEPARTMENT
                  ================================================== */}

              <div className="kra-modal-field">
                <label
                  htmlFor="kra-department"
                >
                  Department
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <select
                  id="kra-department"
                  className="kra-modal-control"
                  value={
                    formData.department
                  }
                  onChange={(event) => {
                    const departmentName =
                      event.target.value;

                    handleChange(
                      "department",
                      departmentName,
                    );

                    handleChange(
                      "designation",
                      "",
                    );
                  }}
                  required
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.name
                        }
                      >
                        {
                          department.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* ==================================================
                  DESIGNATION
                  ================================================== */}

              <div className="kra-modal-field">
                <label
                  htmlFor="kra-designation"
                >
                  Designation
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <select
                  id="kra-designation"
                  className="kra-modal-control"
                  value={
                    formData.designation
                  }
                  onChange={(event) =>
                    handleChange(
                      "designation",
                      event.target.value,
                    )
                  }
                  disabled={
                    !formData.department
                  }
                  required
                >
                  <option value="">
                    {formData.department
                      ? "Select Designation"
                      : "Select Department First"}
                  </option>

                  {filteredDesignations.map(
                    (designation) => (
                      <option
                        key={
                          designation.id
                        }
                        value={
                          designation.name
                        }
                      >
                        {
                          designation.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* ==================================================
                  FOCUSED AREA
                  ================================================== */}

              <div className="kra-modal-field kra-modal-full-width">
                <label
                  htmlFor="kra-focused-area"
                >
                  Focused Area
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <textarea
                  id="kra-focused-area"
                  className="kra-modal-control kra-modal-textarea"
                  value={
                    formData.focusedArea
                  }
                  onChange={(event) =>
                    handleChange(
                      "focusedArea",
                      event.target.value,
                    )
                  }
                  placeholder="Describe the focused area in detail..."
                  rows={3}
                  required
                />
              </div>

              {/* ==================================================
                  WEIGHTAGE
                  ================================================== */}

              <div className="kra-modal-field">
                <label
                  htmlFor="kra-weightage"
                >
                  Weightage
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <input
                  id="kra-weightage"
                  type="number"
                  className="kra-modal-control"
                  value={
                    formData.weightage ===
                    0
                      ? ""
                      : formData.weightage
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    handleChange(
                      "weightage",
                      value === ""
                        ? 0
                        : Number(value),
                    );
                  }}
                  placeholder="e.g. 20"
                  min={1}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  required
                />

                <small className="kra-weightage-help">
                  Weightage for this KRA
                </small>
              </div>

              {/* ==================================================
                  YEAR
                  ================================================== */}

              <div className="kra-modal-field">
                <label htmlFor="kra-year">
                  Year
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <select
                  id="kra-year"
                  className="kra-modal-control"
                  value={
                    formData.year
                  }
                  onChange={(event) =>
                    handleChange(
                      "year",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  required
                >
                  {YEARS.map(
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
              </div>

              {/* ==================================================
                  FROM MONTH
                  ================================================== */}

              <div className="kra-modal-field">
                <label
                  htmlFor="kra-from-month"
                >
                  From Month
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <select
                  id="kra-from-month"
                  className="kra-modal-control"
                  value={
                    formData.fromMonth
                  }
                  onChange={(event) =>
                    handleChange(
                      "fromMonth",
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value="">
                    Select Month
                  </option>

                  {MONTHS.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* ==================================================
                  TO MONTH
                  ================================================== */}

              <div className="kra-modal-field">
                <label
                  htmlFor="kra-to-month"
                >
                  To Month
                  <span className="kra-required">
                    *
                  </span>
                </label>

                <select
                  id="kra-to-month"
                  className="kra-modal-control"
                  value={
                    formData.toMonth
                  }
                  onChange={(event) =>
                    handleChange(
                      "toMonth",
                      event.target.value,
                    )
                  }
                  required
                >
                  <option value="">
                    Select Month
                  </option>

                  {MONTHS.map(
                    (month) => (
                      <option
                        key={month}
                        value={month}
                      >
                        {month}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* ==================================================
                  STATUS
                  ================================================== */}

              <div className="kra-modal-field">
                <label htmlFor="kra-status">
                  Status
                </label>

                <select
                  id="kra-status"
                  className="kra-modal-control"
                  value={
                    formData.status
                  }
                  onChange={(event) => {
                    const selectedStatus =
                      STATUS_OPTIONS.find(
                        (status) =>
                          String(
                            status,
                          ) ===
                          event.target.value,
                      );

                    const nextStatus =
                      (selectedStatus ??
                        "Active") as KRAStatus;

                    handleChange(
                      "status",
                      nextStatus,
                    );
                  }}
                >
                  {STATUS_OPTIONS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>
              </div>

            </div>
          </div>

          {/* ====================================================
              FOOTER
              ==================================================== */}

          <div className="kra-modal-footer">
            <button
              type="button"
              className="kra-modal-btn kra-modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="kra-modal-btn kra-modal-btn-primary"
            >
              {editData
                ? "Update KRA"
                : "Submit KRA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KraModal;