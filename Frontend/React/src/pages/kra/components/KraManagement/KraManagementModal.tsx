import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Save,
  X,
} from "lucide-react";

import type {
  KraDetail,
  KraManagementRecord,
} from "./KraManagementTable";

import "./KraManagementModal.css";

/* =========================================================
   TYPES
   ========================================================= */

export type KraManagementModalMode =
  | "view"
  | "edit";

interface KraManagementModalProps {
  isOpen: boolean;

  mode: KraManagementModalMode;

  record: KraManagementRecord | null;

  onClose: () => void;

  /**
   * Preserves the existing parent contract.
   *
   * The returned record contains:
   * - aggregated totals
   * - updated kraDetails
   */
  onSave?: (
    record: KraManagementRecord,
  ) => void;
}

interface EditableKraDetail
  extends KraDetail {
  id: number;

  tlScore: number | null;

  rmScore: number | null;

  tmScore: number | null;
}


/* =========================================================
   EMPLOYEE SUMMARY METADATA
   ========================================================= */

interface KraModalEmployeeMeta {
  employeeCode?: string | null;
  reportingManagerName?: string | null;
  directManagerName?: string | null;
   teamLeaderName?: string | null;
  topManagerName?: string | null;
}

interface KraValidationErrors {
  [kraId: number]: {
    tlScore?: string;
    rmScore?: string;
    tmScore?: string;
  };
}

/* =========================================================
   HELPERS
   ========================================================= */

const toFiniteNumber = (
  value: unknown,
): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

const getDetailFocusedArea = (
  detail: KraDetail,
): string => {
  return (
    detail.focusedArea ??
    detail.focused_area ??
    ""
  );
};

const getDetailImprovementArea = (
  detail: KraDetail,
): string => {
  return (
    detail.improvementArea ??
    detail.improvement_area ??
    detail.keyImprovementArea ??
    detail.key_improvement_area ??
    ""
  );
};

const getDetailWeightage = (
  detail: KraDetail,
): number | null => {
  return toFiniteNumber(
    detail.weightage,
  );
};

const getDetailSelfScore = (
  detail: KraDetail,
): number | null => {
  return toFiniteNumber(
    detail.selfScore ??
      detail.self_score,
  );
};

const getDetailTlScore = (
  detail: KraDetail,
): number | null => {
  return toFiniteNumber(
    detail.tlScore ??
      detail.tl_score,
  );
};

const getDetailRmScore = (
  detail: KraDetail,
): number | null => {
  return toFiniteNumber(
    detail.rmScore ??
      detail.rm_score,
  );
};

const getDetailTmScore = (
  detail: KraDetail,
): number | null => {
  return toFiniteNumber(
    detail.tmScore ??
      detail.tm_score,
  );
};

const getRecordDetails = (
  record: KraManagementRecord,
): EditableKraDetail[] => {
  if (
    Array.isArray(record.kraDetails) &&
    record.kraDetails.length > 0
  ) {
    return record.kraDetails.map(
      (detail) => ({
        ...detail,

        id:
          Number.isFinite(
            Number(detail.id),
          )
            ? Number(detail.id)
            : record.id,

        focusedArea:
          getDetailFocusedArea(
            detail,
          ),

        improvementArea:
          getDetailImprovementArea(
            detail,
          ),

        weightage:
          getDetailWeightage(
            detail,
          ),

        selfScore:
          getDetailSelfScore(
            detail,
          ),

        tlScore:
          getDetailTlScore(
            detail,
          ),

        rmScore:
          getDetailRmScore(
            detail,
          ),

        tmScore:
          getDetailTmScore(
            detail,
          ),

        kraDate:
          detail.kraDate ??
          detail.kra_date ??
          record.kraDate,

        fromMonth:
          detail.fromMonth ??
          detail.from_month ??
          record.fromMonth,

        toMonth:
          detail.toMonth ??
          detail.to_month ??
          record.toMonth,

        year:
          detail.year ??
          record.year,
      }),
    );
  }

  /*
   * Backward compatibility.
   *
   * If no individual details exist,
   * show the current record as one KRA.
   */
  return [
    {
      id: record.id,

      focusedArea: "",

      improvementArea: "",

      weightage:
        toFiniteNumber(
          record.weightage,
        ),

      selfScore:
        toFiniteNumber(
          record.selfScore,
        ),

      tlScore:
        toFiniteNumber(
          record.tlScore,
        ),

      rmScore:
        toFiniteNumber(
          record.rmScore,
        ),

      tmScore:
        toFiniteNumber(
          record.tmScore,
        ),

      kraDate:
        record.kraDate,

      fromMonth:
        record.fromMonth,

      toMonth:
        record.toMonth,

      year:
        record.year,
    },
  ];
};

const sumScores = (
  details: EditableKraDetail[],
  selector: (
    detail: EditableKraDetail,
  ) => number | null,
): number | null => {
  const values = details
    .map(selector)
    .filter(
      (value): value is number =>
        value !== null &&
        Number.isFinite(value),
    );

  if (values.length === 0) {
    return null;
  }

  return values.reduce(
    (total, value) =>
      total + value,
    0,
  );
};

const sumWeightage = (
  details: EditableKraDetail[],
): number | null => {
  const values = details
    .map(
      (detail) =>
        detail.weightage,
    )
    .filter(
      (value): value is number =>
        value !== null &&
        Number.isFinite(value),
    );

  if (values.length === 0) {
    return null;
  }

  return values.reduce(
    (total, value) =>
      total + value,
    0,
  );
};

const formatNumber = (
  value: number | null,
): string => {
  if (value === null) {
    return "—";
  }

  if (
    Number.isInteger(value)
  ) {
    return String(value);
  }

  return value.toFixed(2);
};

const getGrade = (
  selfScore: number | null,
  weightage: number | null,
): {
  percentage: number | null;
  label: string;
  className: string;
} => {
  if (
    selfScore === null ||
    weightage === null ||
    weightage <= 0
  ) {
    return {
      percentage: null,
      label: "Grade not available",
      className:
        "kra-management-grade--unknown",
    };
  }

  const percentage =
    (selfScore /
      weightage) *
    100;

  if (percentage <= 50) {
    return {
      percentage,
      label:
        "Below 50% Not satisfactory",
      className:
        "kra-management-grade--below",
    };
  }

  if (percentage <= 80) {
    return {
      percentage,
      label:
        ">50 to 80% Average performance",
      className:
        "kra-management-grade--average",
    };
  }

  if (percentage <= 100) {
    return {
      percentage,
      label:
        ">80 to 100% Met Expectation",
      className:
        "kra-management-grade--met",
    };
  }

  return {
    percentage,
    label:
      ">100% Exceeded Expectation",
    className:
      "kra-management-grade--exceeded",
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraManagementModal: React.FC<
  KraManagementModalProps
> = ({
  isOpen,
  mode,
  record,
  onClose,
  onSave,
}) => {
  const [
    kraDetails,
    setKraDetails,
  ] = useState<
    EditableKraDetail[]
  >([]);
  const scoreTableWrapperRef =
  useRef<HTMLDivElement | null>(null);

  const [
    validationErrors,
    setValidationErrors,
  ] =
    useState<KraValidationErrors>(
      {},
    );

  const isViewMode =
    mode === "view";

  const isEditMode =
    mode === "edit";

  
    const canEditTl =
    !isViewMode &&
    record?.canEditTl === true;

  const canEditRm =
    !isViewMode &&
    record?.canEditRm === true;

  const canEditTm =
    !isViewMode &&
    record?.canEditTm === true;

  

  /* =======================================================
     LOAD RECORD
     ======================================================= */

 useEffect(() => {
  if (!isOpen || !record) {
    setKraDetails([]);
    setValidationErrors({});
    return;
  }

  const details = getRecordDetails(record);

  setKraDetails(details);
  setValidationErrors({});

  requestAnimationFrame(() => {
    const wrapper =
      scoreTableWrapperRef.current;

    if (!wrapper) {
      return;
    }

    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;
  });
}, [
  isOpen,
  record,
  mode,
]);
  /* =======================================================
     ESCAPE + BODY SCROLL
     ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ): void => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style
        .overflow;

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

  /* =======================================================
     TOTALS
     ======================================================= */

  const totals = useMemo(() => {
    return {
      weightage:
        sumWeightage(
          kraDetails,
        ),

      selfScore:
        sumScores(
          kraDetails,
          (detail) =>
            detail.selfScore,
        ),

      tlScore:
        sumScores(
          kraDetails,
          (detail) =>
            detail.tlScore,
        ),

      rmScore:
        sumScores(
          kraDetails,
          (detail) =>
            detail.rmScore,
        ),

      tmScore:
        sumScores(
          kraDetails,
          (detail) =>
            detail.tmScore,
        ),
    };
  }, [
    kraDetails,
  ]);

  const grade = useMemo(
    () =>
      getGrade(
        totals.selfScore,
        totals.weightage,
      ),
    [
      totals.selfScore,
      totals.weightage,
    ],
  );

  /* =======================================================
     SCORE CHANGE
     ======================================================= */

  /*
   * The parent record carries these display-only fields as
   * optional properties so the existing KraManagementRecord
   * contract remains unchanged.
   */
const employeeMeta =
  record as
    | (KraManagementRecord &
        KraModalEmployeeMeta)
    | null;

const employeeCode =
  employeeMeta?.employeeCode?.trim() || "—";

const reportingManagerName =
  employeeMeta?.reportingManagerName?.trim() || "—";

const teamLeaderName =
  employeeMeta?.teamLeaderName?.trim() || "—";

const topManagementName =
  employeeMeta?.topManagerName?.trim() || "—";

  const handleKraScoreChange = (
  kraId: number,
  field:
    | "tlScore"
    | "rmScore"
    | "tmScore",
  value: string,
): void => {

  if (field === "tlScore" && !canEditTl) {
    return;
  }

  if (field === "rmScore" && !canEditRm) {
    return;
  }

  if (field === "tmScore" && !canEditTm) {
    return;
  }

    const numericValue =
      value === ""
        ? null
        : Number(value);

    if (
      numericValue !== null &&
      (!Number.isFinite(
        numericValue,
      ) ||
        numericValue < 0)
    ) {
      return;
    }

    const kra =
      kraDetails.find(
        (detail) =>
          detail.id === kraId,
      );

    if (!kra) {
      return;
    }

   const weightage = getDetailWeightage(kra);

if (
  numericValue !== null &&
  weightage !== null &&
  numericValue > weightage
) {
      const fieldLabel =
        field === "tlScore"
          ? "TL Score"
          : field === "rmScore"
            ? "RM Score"
            : "TM Score";

      setValidationErrors(
        (previous) => ({
          ...previous,

          [kraId]: {
            ...previous[kraId],
            [field]:
              `${fieldLabel} must be between 0 and ${weightage}.`,
          },
        }),
      );

      return;
    }

    setKraDetails(
      (previous) =>
        previous.map(
          (detail) =>
            detail.id === kraId
              ? {
                  ...detail,
                  [field]:
                    numericValue,
                }
              : detail,
        ),
    );

    setValidationErrors(
      (previous) => ({
        ...previous,

        [kraId]: {
          ...previous[kraId],
          [field]:
            undefined,
        },
      }),
    );
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateAllScores =
    (): boolean => {
      const errors: KraValidationErrors =
        {};

      kraDetails.forEach(
  (kra) => {
    const kraErrors: {
      tlScore?: string;
      rmScore?: string;
      tmScore?: string;
    } = {};


 const scores = [
  ...(canEditTl
    ? [
        {
          field: "tlScore" as const,
          label: "TL Score",
          value: kra.tlScore,
        },
      ]
    : []),

  ...(canEditRm
    ? [
        {
          field: "rmScore" as const,
          label: "RM Score",
          value: kra.rmScore,
        },
      ]
    : []),

  ...(canEditTm
    ? [
        {
          field: "tmScore" as const,
          label: "TM Score",
          value: kra.tmScore,
        },
      ]
    : []),
];

          scores.forEach(
            ({
              field,
              label,
              value,
            }) => {
              if (
                value === null
              ) {
                kraErrors[field] =
                  `${label} is required.`;

                return;
              }

              if (
                !Number.isFinite(
                  value,
                )
              ) {
                kraErrors[field] =
                  `${label} must be a valid number.`;

                return;
              }

              if (
                value < 0
              ) {
                kraErrors[field] =
                  `${label} cannot be negative.`;

                return;
              }

             const weightage = getDetailWeightage(kra);

if (
  weightage !== null &&
  value > weightage
) {
  kraErrors[field] =
    `${label} must be between 0 and ${weightage}.`;
}
            },
          );

          if (
            Object.keys(
              kraErrors,
            ).length > 0
          ) {
            errors[kra.id] =
              kraErrors;
          }
        },
      );

      setValidationErrors(
        errors,
      );

      return (
        Object.keys(errors)
          .length === 0
      );
    };

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    if (
      !record ||
      !isEditMode
    ) {
      return;
    }

    if (
      !validateAllScores()
    ) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Save the individual KRA values AND
     * rebuild the aggregated totals.
     */
    const updatedRecord: KraManagementRecord =
      {
        ...record,

        weightage:
          totals.weightage,

        selfScore:
          totals.selfScore,

        tlScore:
          totals.tlScore,

        rmScore:
          totals.rmScore,

        tmScore:
          totals.tmScore,

        kraDetails:
          kraDetails.map(
            (detail) => ({
              ...detail,

              id: detail.id,

              focusedArea:
                getDetailFocusedArea(
                  detail,
                ),

              improvementArea:
                getDetailImprovementArea(
                  detail,
                ),

              weightage:
                detail.weightage,

              selfScore:
                detail.selfScore,

              tlScore:
                detail.tlScore,

              rmScore:
                detail.rmScore,

              tmScore:
                detail.tmScore,
            }),
          ),
      };

    onSave?.(
      updatedRecord,
    );
  };

  /* =======================================================
     OVERLAY
     ======================================================= */

  const handleOverlayMouseDown =
    (
      event: React.MouseEvent<HTMLDivElement>,
    ): void => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose();
      }
    };

  /* =======================================================
     GUARD
     ======================================================= */

  if (
    !isOpen ||
    !record
  ) {
    return null;
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="kra-management-modal-overlay"
      role="presentation"
      onMouseDown={
        handleOverlayMouseDown
      }
    >
      <section
        className={`kra-management-modal ${
          isViewMode
            ? "kra-management-modal--view"
            : "kra-management-modal--edit"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kra-management-modal-title"
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="kra-management-modal-header">
          <div className="kra-management-modal-heading">
            <div
              className="kra-management-modal-heading-icon"
              aria-hidden="true"
            >
              <CalendarDays
                size={21}
                strokeWidth={
                  1.8
                }
              />
            </div>

            <div>
              <h2 id="kra-management-modal-title">
                {isViewMode
                  ? "View KRA Details"
                  : "Edit KRA Details"}
              </h2>

              <p>
                {isViewMode
                  ? "Review employee KRA performance and scores."
                  : "Update employee KRA evaluation scores."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="kra-management-modal-close"
            onClick={
              onClose
            }
            aria-label="Close modal"
          >
            <X
              size={19}
              strokeWidth={
                1.8
              }
            />
          </button>
        </header>

        {/* =================================================
            EMPLOYEE SUMMARY
            ================================================= */}

        {/* =================================================
    EMPLOYEE + MANAGER SUMMARY
    ================================================= */}
<div className="kra-management-modal-employee">

  {/* =================================================
      PRIMARY EMPLOYEE INFORMATION
      ================================================= */}
  <div className="kra-management-modal-employee-primary">

    <div className="kra-management-modal-employee-field">
      <span className="kra-management-modal-employee-label">
        Employee
      </span>

      <strong className="kra-management-modal-employee-value">
        {record.employeeName}
      </strong>

      <span className="kra-management-modal-employee-subvalue">
        {record.designation}
      </span>
    </div>

    <div className="kra-management-modal-employee-field">
      <span className="kra-management-modal-employee-label">
        Emp Code
      </span>

      <strong className="kra-management-modal-employee-value">
        {employeeCode}
      </strong>
    </div>

    <div className="kra-management-modal-employee-field">
      <span className="kra-management-modal-employee-label">
        Reporting Manager
      </span>

      <strong className="kra-management-modal-employee-value">
        {reportingManagerName}
      </strong>
    </div>

  </div>


  {/* =================================================
      MANAGEMENT HIERARCHY
      ================================================= */}
  <div className="kra-management-modal-manager-row">

    {/* TEAM LEADER */}
    <div className="kra-management-modal-employee-field">

      <span className="kra-management-modal-employee-label">
        Team Leader
      </span>

      <strong className="kra-management-modal-employee-value">
        {teamLeaderName}
      </strong>

    </div>


    {/* TOP MANAGEMENT */}
    <div className="kra-management-modal-employee-field">

      <span className="kra-management-modal-employee-label">
        Top Management
      </span>

      <strong className="kra-management-modal-employee-value">
        {topManagementName}
      </strong>

    </div>

  </div>

</div>
        {/* =================================================
            FORM
            ================================================= */}

        <form
          className="kra-management-modal-form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div className="kra-management-modal-body">
            {/* =============================================
                PERIOD INFORMATION
                ============================================= */}

            {isEditMode && (
              <div className="kra-management-modal-period-grid">
                {/* KRA DATE */}

                <div className="kra-management-modal-field">
                  <label>
                    KRA Date
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.kraDate
                    }
                  </div>
                </div>

                {/* YEAR */}

                <div className="kra-management-modal-field">
                  <label>
                    Year
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.year
                    }
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                PERIOD INFORMATION - VIEW
                ============================================= */}

            {isViewMode && (
              <div className="kra-management-modal-period-grid kra-management-modal-period-grid--three">
                <div className="kra-management-modal-field">
                  <label>
                    From Month
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.fromMonth
                    }
                  </div>
                </div>

                <div className="kra-management-modal-field">
                  <label>
                    To Month
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.toMonth
                    }
                  </div>
                </div>

                <div className="kra-management-modal-field">
                  <label>
                    Year
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.year
                    }
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                PERIOD INFORMATION - EDIT
                ============================================= */}

            {isEditMode && (
              <div className="kra-management-modal-period-grid">
                <div className="kra-management-modal-field">
                  <label>
                    From Month
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.fromMonth
                    }
                  </div>
                </div>

                <div className="kra-management-modal-field">
                  <label>
                    To Month
                  </label>

                  <div className="kra-management-modal-readonly">
                    {
                      record.toMonth
                    }
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                KRA SCORE DETAILS
                ============================================= */}

            <section className="kra-management-score-details">
              <div className="kra-management-score-details-title">
                KRA Score Details
              </div>

              <div
  ref={scoreTableWrapperRef}
  className="kra-management-score-table-wrapper"
>
                <table className="kra-management-score-table">
                  <thead>
                    <tr>
                      <th>
                        Focused Area
                      </th>

                      <th>
                        Weightage
                      </th>

                      <th>
                        Self Rating
                      </th>

                      <th>
                        Key Improvement Area
                      </th>

                      <th>
                        TL Score
                      </th>

                      <th>
                        RM Score
                      </th>

                      <th>
                        TM Score
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {kraDetails.map(
                      (
                        kra,
                        index,
                      ) => {
                        const errors =
                          validationErrors[
                            kra.id
                          ] ?? {};

                        return (
                         <tr
  key={`${record.id}-${kra.id}-${index}`}
>
                            {/* FOCUSED AREA */}

                            <td>
                              <span className="kra-management-detail-text kra-management-detail-text--strong">
                                {getDetailFocusedArea(
                                  kra,
                                ) ||
                                  `KRA ${
                                    index +
                                    1
                                  }`}
                              </span>
                            </td>

                            {/* WEIGHTAGE */}

                            <td>
                              <div className="kra-management-detail-readonly-box">
                              {formatNumber(
  getDetailWeightage(kra),
)}
                              </div>
                            </td>

                            {/* SELF RATING */}

                            <td>
                              <div className="kra-management-detail-readonly-box">
                                {formatNumber(
                                  kra.selfScore,
                                )}
                              </div>
                            </td>

                            {/* IMPROVEMENT AREA */}

                            <td>
                              <span className="kra-management-detail-text">
                                {getDetailImprovementArea(
                                  kra,
                                ) ||
                                  "—"}
                              </span>
                            </td>

                            {/* TL SCORE */}

                            <td>
                              {isViewMode ? (
                                <div className="kra-management-detail-readonly-box">
                                  {formatNumber(
                                    kra.tlScore,
                                  )}
                                </div>
                              ) : (
                                <div className="kra-management-detail-input-wrapper">
                                  <input
                                    type="number"
                                    min={
                                      0
                                    }
                                    max={
                                      kra.weightage ??
                                      undefined
                                    }
                                    step={
                                      1
                                    }
                                    value={
                                      kra.tlScore ??
                                      ""
                                    }
                                    disabled={!canEditTl}
                                    onChange={(
                                      event,
                                    ) =>
                                      handleKraScoreChange(
                                        kra.id,
                                        "tlScore",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    aria-label={`TL Score for ${
                                      getDetailFocusedArea(
                                        kra,
                                      ) ||
                                      `KRA ${
                                        index +
                                        1
                                      }`
                                    }`}
                                    className={
                                      errors.tlScore
                                        ? "kra-management-detail-input kra-management-detail-input--error"
                                        : "kra-management-detail-input"
                                    }
                                  />

                                  {errors.tlScore && (
                                    <span
                                      className="kra-management-detail-error"
                                      role="alert"
                                    >
                                      {
                                        errors.tlScore
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* RM SCORE */}

                            <td>
                              {isViewMode ? (
                                <div className="kra-management-detail-readonly-box">
                                  {formatNumber(
                                    kra.rmScore,
                                  )}
                                </div>
                              ) : (
                                <div className="kra-management-detail-input-wrapper">
                                  <input
                                    type="number"
                                    min={
                                      0
                                    }
                                    max={
                                      kra.weightage ??
                                      undefined
                                    }
                                    step={
                                      1
                                    }
                                    value={
                                      kra.rmScore ??
                                      ""
                                    }
                                    disabled={!canEditRm}
                                    onChange={(
                                      event,
                                    ) =>
                                      handleKraScoreChange(
                                        kra.id,
                                        "rmScore",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    aria-label={`RM Score for ${
                                      getDetailFocusedArea(
                                        kra,
                                      ) ||
                                      `KRA ${
                                        index +
                                        1
                                      }`
                                    }`}
                                    className={
                                      errors.rmScore
                                        ? "kra-management-detail-input kra-management-detail-input--error"
                                        : "kra-management-detail-input"
                                    }
                                  />

                                  {errors.rmScore && (
                                    <span
                                      className="kra-management-detail-error"
                                      role="alert"
                                    >
                                      {
                                        errors.rmScore
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* TM SCORE */}

                            <td>
                              {isViewMode ? (
                                <div className="kra-management-detail-readonly-box">
                                  {formatNumber(
                                    kra.tmScore,
                                  )}
                                </div>
                              ) : (
                                <div className="kra-management-detail-input-wrapper">
                                  <input
                                    type="number"
                                    min={
                                      0
                                    }
                                    max={
                                      kra.weightage ??
                                      undefined
                                    }
                                    step={
                                      1
                                    }
                                    value={
                                      kra.tmScore ??
                                      ""
                                    }
                                     disabled={!canEditTm}
                                    onChange={(
                                      event,
                                    ) =>
                                      handleKraScoreChange(
                                        kra.id,
                                        "tmScore",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    aria-label={`TM Score for ${
                                      getDetailFocusedArea(
                                        kra,
                                      ) ||
                                      `KRA ${
                                        index +
                                        1
                                      }`
                                    }`}
                                    className={
                                      errors.tmScore
                                        ? "kra-management-detail-input kra-management-detail-input--error"
                                        : "kra-management-detail-input"
                                    }
                                  />

                                  {errors.tmScore && (
                                    <span
                                      className="kra-management-detail-error"
                                      role="alert"
                                    >
                                      {
                                        errors.tmScore
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}

                    {/* =======================================
                        TOTAL
                        ======================================= */}

                    <tr className="kra-management-score-total">
                      <td>
                        <strong>
                          Total
                        </strong>
                      </td>

                      <td>
                        <div className="kra-management-total-box">
                          <strong>
                            {formatNumber(
                              totals.weightage,
                            )}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="kra-management-total-box">
                          <strong>
                            {totals.selfScore ===
                            null
                              ? "—"
                              : totals.selfScore.toFixed(
                                  2,
                                )}
                          </strong>
                        </div>
                      </td>

                      <td />

                      <td>
                        <div className="kra-management-total-box">
                          <strong>
                            {formatNumber(
                              totals.tlScore,
                            )}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="kra-management-total-box">
                          <strong>
                            {formatNumber(
                              totals.rmScore,
                            )}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <div className="kra-management-total-box">
                          <strong>
                            {formatNumber(
                              totals.tmScore,
                            )}
                          </strong>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* =============================================
                  EDIT MODE NOTE
                  ============================================= */}

              {isEditMode && (
  <div className="kra-management-edit-note">
    <span>*</span>

    <p>
      Focused Area, Weightage, Self
      Rating and Key Improvement Area
      are read only.
      {!canEditTl &&
        " TL Score is read only."}
      {!canEditRm &&
        " RM Score is read only."}
      {!canEditTm &&
        " TM Score is read only."}
    </p>
  </div>
)}
            </section>

            {/* =============================================
                GRADE
                ============================================= */}

            <section className="kra-management-grade-section">
              <h3>
                Grade
              </h3>

              <div className="kra-management-grade-legend">
                <div className="kra-management-grade-pill kra-management-grade-pill--below">
                  <strong>
                    Below 50%
                  </strong>
                  <span>
                    Not satisfactory
                  </span>
                </div>

                <div className="kra-management-grade-pill kra-management-grade-pill--average">
                  <strong>
                    &gt;50 to 80%
                  </strong>
                  <span>
                    Average performance
                  </span>
                </div>

                <div className="kra-management-grade-pill kra-management-grade-pill--met">
                  <strong>
                    &gt;80 to 100%
                  </strong>
                  <span>
                    Met Expectation
                  </span>
                </div>

                <div className="kra-management-grade-pill kra-management-grade-pill--exceeded">
                  <strong>
                    &gt;100%
                  </strong>
                  <span>
                    Exceeded Expectation
                  </span>
                </div>
              </div>

              <div
                className={`kra-management-current-grade ${grade.className}`}
              >
                {grade.percentage ===
                null
                  ? grade.label
                  : `${grade.label}`}
              </div>
            </section>
          </div>

          {/* ===============================================
              FOOTER
              =============================================== */}

          <footer className="kra-management-modal-footer">
            <button
              type="button"
              className="kra-management-modal-secondary"
              onClick={
                onClose
              }
            >
              {isViewMode
                ? "Back"
                : "Cancel"}
            </button>

            {isEditMode && (
              <button
                type="submit"
                className="kra-management-modal-primary"
              >
                <Save
                  size={16}
                  strokeWidth={
                    1.9
                  }
                />

                Save Changes
              </button>
            )}
          </footer>
        </form>
      </section>
    </div>
  );
};

export default KraManagementModal;