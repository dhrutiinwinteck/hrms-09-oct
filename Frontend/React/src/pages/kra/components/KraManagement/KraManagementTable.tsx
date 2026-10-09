import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import "./KraManagementTable.css";

/* =========================================================
   TYPES
   ========================================================= */
export interface KraDetail {
  /**
   * UI/KRA master ID.
   * This identifies the KRA master row such as
   * Checking2, Checking3, etc.
   */
  id: number;

  /**
   * Actual KRA Manager database record ID.
   *
   * IMPORTANT:
   * This is the ID that must be used when updating
   * an individual KRA score.
   */
  managerRecordId?: number | null;

  /**
   * Explicit KRA Master ID.
   *
   * Usually same as `id`, but keeping it separately
   * makes save/update logic unambiguous.
   */
  masterId?: number | null;

  /* KRA MASTER */
  focusedArea?: string | null;
  focused_area?: string | null;

  weightage?: number | null;

  /* SELF SCORE */
  selfScore: number | null;
  self_score?: number | null;

  /* TL SCORE */
  tlScore: number | null;
  tl_score?: number | null;

  /* RM SCORE */
  rmScore: number | null;
  rm_score?: number | null;

  /* TM SCORE */
  tmScore: number | null;
  tm_score?: number | null;

  /* IMPROVEMENT AREA */
  improvementArea?: string | null;
  improvement_area?: string | null;

  keyImprovementArea?: string | null;
  key_improvement_area?: string | null;

  /* PERIOD */
  kraDate?: string | null;
  kra_date?: string | null;

  fromMonth?: string | null;
  from_month?: string | null;

  toMonth?: string | null;
  to_month?: string | null;

  year?: number | null;
}

export interface KraManagementRecord {
  id: number;

  /* =========================================================
     EMPLOYEE
     ========================================================= */

  employeeName: string;

  employee_name?: string;

  employeeId?: number | null;

  employeeCode?: string | null;

  /* =========================================================
     INTERNAL KRA VALUES
     ========================================================= */

  masterId?: number;

  kraScoreId?: number;

  isEdited?: boolean;

  reportingManager?: number | null;

  /* =========================================================
     REMARKS
     ========================================================= */

  rmRemark?: string | null;

  tlRemark?: string | null;

  tpRemark?: string | null;

  createdOn?: string | null;

  createdBy?: string | null;

  modifiedOn?: string | null;

  modifiedBy?: string | null;

  /* =========================================================
     REPORTING MANAGER
     ========================================================= */

  reportingManagerId?: number | null;

  reportingManagerName?: string | null;

  /* =========================================================
     DESIGNATION
     ========================================================= */

  designation: string;

  /* =========================================================
     PERIOD
     ========================================================= */

  kraDate: string;

  kra_date?: string;

  fromMonth: string;

  from_month?: string;

  toMonth: string;

  to_month?: string;

  year: number;

  /* =========================================================
     KRA MASTER
     ========================================================= */

  focusedArea?: string | null;

  focused_area?: string | null;

  weightage?: number | null;

  /* =========================================================
     IMPROVEMENT AREA
     ========================================================= */

  improvementArea?: string | null;

  improvement_area?: string | null;

  keyImprovementArea?: string | null;

  key_improvement_area?: string | null;

  /* =========================================================
     SCORES
     ========================================================= */

  selfScore: number | null;

  tlScore: number | null;

  rmScore: number | null;

  tmScore: number | null;

  /* =========================================================
     SCORE EDIT PERMISSIONS
     ========================================================= */

  canEditTl?: boolean;

  canEditRm?: boolean;

  canEditTm?: boolean;

  /* =========================================================
     MANAGER HIERARCHY
     ========================================================= */

  directManagerId?: number | null;

  directManagerName?: string | null;

  topManagerId?: number | null;

  topManagerName?: string | null;

  teamLeaderId?: number | null;
teamLeaderName?: string | null;
teamLeaderEmpCode?: string | null;
teamLeaderDesignationName?: string | null;
  /* =========================================================
     INDIVIDUAL KRA DETAILS
     ========================================================= */

  kraDetails?: KraDetail[];
}

interface KraManagementTableProps {
  data?: KraManagementRecord[];

  onView?: (
    record: KraManagementRecord,
  ) => void;

  onEdit?: (
    record: KraManagementRecord,
  ) => void;

  onDelete?: (
    record: KraManagementRecord,
  ) => void;
}

/* =========================================================
   AVATAR COLORS
   ========================================================= */

const AVATAR_COLORS: string[] = [
  "#cde7e7",
  "#dddcc2",
  "#ffd7ba",
  "#cee4ef",
  "#dfd4ef",
  "#d8ead4",
  "#f0d6d6",
  "#d7e3cf",
  "#e8d6bd",
  "#d1ddeb",
];

const AVATAR_TEXT_COLORS: string[] = [
  "#17606a",
  "#476d35",
  "#c7521a",
  "#235f78",
  "#493b76",
  "#3f7041",
  "#8c4646",
  "#536c3f",
  "#805b32",
  "#3b5875",
];

interface AvatarTheme {
  backgroundColor: string;
  color: string;
}

/* =========================================================
   MOCK DATA
   ========================================================= */

const DEFAULT_DATA: KraManagementRecord[] = [
  {
    id: 1,
    employeeName: "Ravi Sharma",
    designation: "Project Manager",
    kraDate: "01/05/2025",
    fromMonth: "May",
    toMonth: "Apr",
    year: 2025,
    weightage: 100,
    selfScore: 85,
    tlScore: 80,
    rmScore: 82,
    tmScore: 84,
    kraDetails: [
      {
        id: 1,
        focusedArea: "Project Delivery",
        weightage: 100,
        selfScore: 85,
        tlScore: 80,
        rmScore: 82,
        tmScore: 84,
        improvementArea:
          "Improve delivery predictability",
        kraDate: "01/05/2025",
        fromMonth: "May",
        toMonth: "Apr",
        year: 2025,
      },
    ],
  },

  {
    id: 2,
    employeeName: "Neha Patel",
    designation: "Senior Developer",
    kraDate: "01/05/2025",
    fromMonth: "May",
    toMonth: "Apr",
    year: 2025,
    weightage: 100,
    selfScore: 78,
    tlScore: 75,
    rmScore: 76,
    tmScore: 77,
    kraDetails: [
      {
        id: 2,
        focusedArea: "Development",
        weightage: 100,
        selfScore: 78,
        tlScore: 75,
        rmScore: 76,
        tmScore: 77,
        improvementArea:
          "Improve code quality",
        kraDate: "01/05/2025",
        fromMonth: "May",
        toMonth: "Apr",
        year: 2025,
      },
    ],
  },

  {
    id: 3,
    employeeName: "Amit Mehta",
    designation: "UI/UX Designer",
    kraDate: "01/05/2025",
    fromMonth: "May",
    toMonth: "Apr",
    year: 2025,
    weightage: 100,
    selfScore: 65,
    tlScore: 60,
    rmScore: 62,
    tmScore: 63,
    kraDetails: [
      {
        id: 3,
        focusedArea: "UI/UX",
        weightage: 100,
        selfScore: 65,
        tlScore: 60,
        rmScore: 62,
        tmScore: 63,
        improvementArea:
          "Improve design consistency",
        kraDate: "01/05/2025",
        fromMonth: "May",
        toMonth: "Apr",
        year: 2025,
      },
    ],
  },

  {
    id: 4,
    employeeName: "Pooja Singh",
    designation: "QA Engineer",
    kraDate: "29/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 90,
    tlScore: 88,
    rmScore: 89,
    tmScore: 90,
    kraDetails: [
      {
        id: 4,
        focusedArea: "Testing",
        weightage: 100,
        selfScore: 90,
        tlScore: 88,
        rmScore: 89,
        tmScore: 90,
        improvementArea:
          "Maintain test coverage",
        kraDate: "29/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 5,
    employeeName: "Vikram Kumar",
    designation: "System Analyst",
    kraDate: "28/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 72,
    tlScore: 70,
    rmScore: 71,
    tmScore: 72,
    kraDetails: [
      {
        id: 5,
        focusedArea: "System Analysis",
        weightage: 100,
        selfScore: 72,
        tlScore: 70,
        rmScore: 71,
        tmScore: 72,
        improvementArea:
          "Improve requirement analysis",
        kraDate: "28/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 6,
    employeeName: "Anjali Verma",
    designation: "HR Executive",
    kraDate: "25/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 81,
    tlScore: 79,
    rmScore: 80,
    tmScore: 82,
    kraDetails: [
      {
        id: 6,
        focusedArea: "HR Operations",
        weightage: 100,
        selfScore: 81,
        tlScore: 79,
        rmScore: 80,
        tmScore: 82,
        improvementArea:
          "Improve process turnaround",
        kraDate: "25/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 7,
    employeeName: "Rahul Joshi",
    designation: "Software Engineer",
    kraDate: "22/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 69,
    tlScore: 68,
    rmScore: 70,
    tmScore: 71,
    kraDetails: [
      {
        id: 7,
        focusedArea:
          "Software Development",
        weightage: 100,
        selfScore: 69,
        tlScore: 68,
        rmScore: 70,
        tmScore: 71,
        improvementArea:
          "Improve development velocity",
        kraDate: "22/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 8,
    employeeName: "Sneha Rao",
    designation: "Business Analyst",
    kraDate: "20/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 86,
    tlScore: 84,
    rmScore: 85,
    tmScore: 87,
    kraDetails: [
      {
        id: 8,
        focusedArea:
          "Business Analysis",
        weightage: 100,
        selfScore: 86,
        tlScore: 84,
        rmScore: 85,
        tmScore: 87,
        improvementArea:
          "Improve stakeholder communication",
        kraDate: "20/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 9,
    employeeName: "Karan Shah",
    designation: "Team Lead",
    kraDate: "18/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 92,
    tlScore: 91,
    rmScore: 90,
    tmScore: 93,
    kraDetails: [
      {
        id: 9,
        focusedArea:
          "Team Leadership",
        weightage: 100,
        selfScore: 92,
        tlScore: 91,
        rmScore: 90,
        tmScore: 93,
        improvementArea:
          "Maintain team performance",
        kraDate: "18/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 10,
    employeeName: "Priya Nair",
    designation: "Finance Executive",
    kraDate: "15/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 74,
    tlScore: 73,
    rmScore: 75,
    tmScore: 76,
    kraDetails: [
      {
        id: 10,
        focusedArea:
          "Finance Operations",
        weightage: 100,
        selfScore: 74,
        tlScore: 73,
        rmScore: 75,
        tmScore: 76,
        improvementArea:
          "Improve reporting accuracy",
        kraDate: "15/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 11,
    employeeName: "Arjun Desai",
    designation: "Backend Developer",
    kraDate: "12/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 88,
    tlScore: 86,
    rmScore: 87,
    tmScore: 89,
    kraDetails: [
      {
        id: 11,
        focusedArea:
          "Backend Development",
        weightage: 100,
        selfScore: 88,
        tlScore: 86,
        rmScore: 87,
        tmScore: 89,
        improvementArea:
          "Improve API performance",
        kraDate: "12/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },

  {
    id: 12,
    employeeName: "Meera Iyer",
    designation: "HR Manager",
    kraDate: "10/04/2025",
    fromMonth: "Apr",
    toMonth: "Mar",
    year: 2025,
    weightage: 100,
    selfScore: 83,
    tlScore: 82,
    rmScore: 84,
    tmScore: 85,
    kraDetails: [
      {
        id: 12,
        focusedArea:
          "HR Management",
        weightage: 100,
        selfScore: 83,
        tlScore: 82,
        rmScore: 84,
        tmScore: 85,
        improvementArea:
          "Improve employee engagement",
        kraDate: "10/04/2025",
        fromMonth: "Apr",
        toMonth: "Mar",
        year: 2025,
      },
    ],
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const getInitials = (
  employeeName: string,
): string => {
  return employeeName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0).toUpperCase(),
    )
    .join("");
};

/* =========================================================
   SCORE CLASS
   ========================================================= */

const getScoreClass = (
  score: number | null,
): string => {
  if (score === null) {
    return "kra-management-score--average";
  }

  if (score >= 70) {
    return "kra-management-score--good";
  }

  return "kra-management-score--average";
};

/* =========================================================
   NUMBER NORMALIZATION
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

/* =========================================================
   FOCUSED AREA NORMALIZATION
   ========================================================= */

const getDetailFocusedArea = (
  detail: KraDetail,
): string | null => {
  const value =
    detail.focusedArea ??
    detail.focused_area ??
    null;

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0
    ? normalized
    : null;
};

/* =========================================================
   IMPROVEMENT AREA NORMALIZATION
   ========================================================= */

const getDetailImprovementArea = (
  detail: KraDetail,
): string | null => {
  const value =
    detail.improvementArea ??
    detail.improvement_area ??
    detail.keyImprovementArea ??
    detail.key_improvement_area ??
    null;

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized.length > 0
    ? normalized
    : null;
};

/* =========================================================
   NORMALIZE INDIVIDUAL KRA DETAIL
   ========================================================= */

const normalizeKraDetail = (
  detail: KraDetail,
  fallbackRecord: KraManagementRecord,
): KraDetail => {
  const focusedArea =
    getDetailFocusedArea(detail);

  const improvementArea =
    getDetailImprovementArea(detail);

  return {
    ...detail,

    id: Number.isFinite(
      Number(detail.id),
    )
      ? Number(detail.id)
      : fallbackRecord.id,

    focusedArea,

    focused_area:
      focusedArea,

    improvementArea,

    improvement_area:
      improvementArea,

    keyImprovementArea:
      improvementArea,

    key_improvement_area:
      improvementArea,

    weightage:
      toFiniteNumber(
        detail.weightage,
      ),

    selfScore:
      toFiniteNumber(
        detail.selfScore ??
          detail.self_score,
      ),

    self_score:
      toFiniteNumber(
        detail.selfScore ??
          detail.self_score,
      ),

    tlScore:
      toFiniteNumber(
        detail.tlScore ??
          detail.tl_score,
      ),

    tl_score:
      toFiniteNumber(
        detail.tlScore ??
          detail.tl_score,
      ),

    rmScore:
      toFiniteNumber(
        detail.rmScore ??
          detail.rm_score,
      ),

    rm_score:
      toFiniteNumber(
        detail.rmScore ??
          detail.rm_score,
      ),

    tmScore:
      toFiniteNumber(
        detail.tmScore ??
          detail.tm_score,
      ),

    tm_score:
      toFiniteNumber(
        detail.tmScore ??
          detail.tm_score,
      ),

    kraDate:
      detail.kraDate ??
      detail.kra_date ??
      fallbackRecord.kraDate ??
      fallbackRecord.kra_date,

    kra_date:
      detail.kra_date ??
      detail.kraDate ??
      fallbackRecord.kra_date ??
      fallbackRecord.kraDate,

    fromMonth:
      detail.fromMonth ??
      detail.from_month ??
      fallbackRecord.fromMonth ??
      fallbackRecord.from_month,

    from_month:
      detail.from_month ??
      detail.fromMonth ??
      fallbackRecord.from_month ??
      fallbackRecord.fromMonth,

    toMonth:
      detail.toMonth ??
      detail.to_month ??
      fallbackRecord.toMonth ??
      fallbackRecord.to_month,

    to_month:
      detail.to_month ??
      detail.toMonth ??
      fallbackRecord.to_month ??
      fallbackRecord.toMonth,

    year:
      detail.year ??
      fallbackRecord.year,
  };
};

/* =========================================================
   GET INDIVIDUAL KRA DETAILS
   ========================================================= */

const getRecordKraDetails = (
  record: KraManagementRecord,
): KraDetail[] => {
  /*
   * PRIMARY PATH
   *
   * API already supplied individual KRA records.
   */

  if (
    Array.isArray(record.kraDetails) &&
    record.kraDetails.length > 0
  ) {
    return record.kraDetails.map(
      (detail) =>
        normalizeKraDetail(
          detail,
          record,
        ),
    );
  }

  /*
   * FALLBACK PATH
   *
   * Older API responses can return
   * one flat KRA record without kraDetails.
   */

  const fallbackDetail: KraDetail = {
    id: record.id,

    focusedArea:
      record.focusedArea ??
      record.focused_area ??
      null,

    focused_area:
      record.focused_area ??
      record.focusedArea ??
      null,

    weightage:
      toFiniteNumber(
        record.weightage,
      ),

    selfScore:
      toFiniteNumber(
        record.selfScore,
      ),

    self_score:
      toFiniteNumber(
        record.selfScore,
      ),

    tlScore:
      toFiniteNumber(
        record.tlScore,
      ),

    tl_score:
      toFiniteNumber(
        record.tlScore,
      ),

    rmScore:
      toFiniteNumber(
        record.rmScore,
      ),

    rm_score:
      toFiniteNumber(
        record.rmScore,
      ),

    tmScore:
      toFiniteNumber(
        record.tmScore,
      ),

    tm_score:
      toFiniteNumber(
        record.tmScore,
      ),

    improvementArea:
      record.improvementArea ??
      record.improvement_area ??
      record.keyImprovementArea ??
      record.key_improvement_area ??
      null,

    improvement_area:
      record.improvement_area ??
      record.improvementArea ??
      record.keyImprovementArea ??
      record.key_improvement_area ??
      null,

    keyImprovementArea:
      record.keyImprovementArea ??
      record.key_improvement_area ??
      record.improvementArea ??
      record.improvement_area ??
      null,

    key_improvement_area:
      record.key_improvement_area ??
      record.keyImprovementArea ??
      record.improvementArea ??
      record.improvement_area ??
      null,

    kraDate:
      record.kraDate ??
      record.kra_date ??
      null,

    kra_date:
      record.kra_date ??
      record.kraDate ??
      null,

    fromMonth:
      record.fromMonth ??
      record.from_month ??
      null,

    from_month:
      record.from_month ??
      record.fromMonth ??
      null,

    toMonth:
      record.toMonth ??
      record.to_month ??
      null,

    to_month:
      record.to_month ??
      record.toMonth ??
      null,

    year: record.year,
  };

  return [
    normalizeKraDetail(
      fallbackDetail,
      record,
    ),
  ];
};

/* =========================================================
   NULLABLE SUM
   ========================================================= */

const sumNullableScores = (
  records: KraDetail[],
  selector: (
    record: KraDetail,
  ) => number | null | undefined,
): number | null => {
  const values = records
    .map(selector)
    .map(toFiniteNumber)
    .filter(
      (
        value,
      ): value is number =>
        value !== null,
    );

  if (values.length === 0) {
    return null;
  }

  return values.reduce(
    (
      total,
      value,
    ) => total + value,
    0,
  );
};

/* =========================================================
   AGGREGATION
   ========================================================= */

const aggregateKraRecords = (
  records: KraManagementRecord[],
): KraManagementRecord[] => {
  const groupedRecords =
    new Map<
      string,
      KraDetail[]
    >();

  const groupMetadata =
    new Map<
      string,
      KraManagementRecord
    >();

  records.forEach(
    (record) => {
      const employeeName = (
        record.employeeName ??
        record.employee_name ??
        ""
      )
        .trim()
        .toLowerCase();

      const designation = (
        record.designation ??
        ""
      )
        .trim()
        .toLowerCase();

      const fromMonth = (
        record.fromMonth ??
        record.from_month ??
        ""
      )
        .trim()
        .toLowerCase();

      const toMonth = (
        record.toMonth ??
        record.to_month ??
        ""
      )
        .trim()
        .toLowerCase();

      const year = Number(
        record.year,
      );

      const groupingKey = [
        employeeName,
        designation,
        year,
        fromMonth,
        toMonth,
      ].join("|");

      const details =
        getRecordKraDetails(
          record,
        );

      const existingGroup =
        groupedRecords.get(
          groupingKey,
        );

      if (existingGroup) {
        existingGroup.push(
          ...details,
        );
      } else {
        groupedRecords.set(
          groupingKey,
          [...details],
        );

        groupMetadata.set(
          groupingKey,
          record,
        );
      }
    },
  );

  return Array.from(
    groupedRecords.entries(),
  ).map(
    (
      [
        groupingKey,
        details,
      ],
    ) => {
      const firstRecord =
        groupMetadata.get(
          groupingKey,
        )!;

      const validWeightages =
        details
          .map(
            (detail) =>
              toFiniteNumber(
                detail.weightage,
              ),
          )
          .filter(
            (
              value,
            ): value is number =>
              value !== null,
          );

      const totalWeightage =
        validWeightages.length > 0
          ? validWeightages.reduce(
              (
                total,
                value,
              ) => total + value,
              0,
            )
          : null;

      const totalSelfScore =
        sumNullableScores(
          details,
          (detail) =>
            detail.selfScore,
        );

      const totalTlScore =
        sumNullableScores(
          details,
          (detail) =>
            detail.tlScore,
        );

      const totalRmScore =
        sumNullableScores(
          details,
          (detail) =>
            detail.rmScore,
        );

      const totalTmScore =
        sumNullableScores(
          details,
          (detail) =>
            detail.tmScore,
        );

      return {
        ...firstRecord,

        id:
          firstRecord.id,

        employeeName:
          firstRecord.employeeName ??
          firstRecord.employee_name ??
          "",

        employee_name:
          firstRecord.employee_name ??
          firstRecord.employeeName ??
          "",

        designation:
          firstRecord.designation,

        kraDate:
          firstRecord.kraDate ??
          firstRecord.kra_date ??
          "",

        kra_date:
          firstRecord.kra_date ??
          firstRecord.kraDate ??
          "",

        fromMonth:
          firstRecord.fromMonth ??
          firstRecord.from_month ??
          "",

        from_month:
          firstRecord.from_month ??
          firstRecord.fromMonth ??
          "",

        toMonth:
          firstRecord.toMonth ??
          firstRecord.to_month ??
          "",

        to_month:
          firstRecord.to_month ??
          firstRecord.toMonth ??
          "",

        year:
          Number(
            firstRecord.year,
          ),

        focusedArea:
          firstRecord.focusedArea ??
          firstRecord.focused_area ??
          details[0]?.focusedArea ??
          details[0]?.focused_area ??
          null,

        focused_area:
          firstRecord.focused_area ??
          firstRecord.focusedArea ??
          details[0]?.focused_area ??
          details[0]?.focusedArea ??
          null,

        weightage:
          totalWeightage,

        improvementArea:
          firstRecord.improvementArea ??
          firstRecord.improvement_area ??
          firstRecord.keyImprovementArea ??
          firstRecord.key_improvement_area ??
          details[0]?.improvementArea ??
          details[0]?.improvement_area ??
          details[0]?.keyImprovementArea ??
          details[0]?.key_improvement_area ??
          null,

        improvement_area:
          firstRecord.improvement_area ??
          firstRecord.improvementArea ??
          firstRecord.key_improvement_area ??
          firstRecord.keyImprovementArea ??
          details[0]?.improvement_area ??
          details[0]?.improvementArea ??
          details[0]?.key_improvement_area ??
          details[0]?.keyImprovementArea ??
          null,

        keyImprovementArea:
          firstRecord.keyImprovementArea ??
          firstRecord.key_improvement_area ??
          firstRecord.improvementArea ??
          firstRecord.improvement_area ??
          details[0]?.keyImprovementArea ??
          details[0]?.key_improvement_area ??
          details[0]?.improvementArea ??
          details[0]?.improvement_area ??
          null,

        key_improvement_area:
          firstRecord.key_improvement_area ??
          firstRecord.keyImprovementArea ??
          firstRecord.improvement_area ??
          firstRecord.improvementArea ??
          details[0]?.key_improvement_area ??
          details[0]?.keyImprovementArea ??
          details[0]?.improvement_area ??
          details[0]?.improvementArea ??
          null,

        selfScore:
          totalSelfScore,

        tlScore:
          totalTlScore,

        rmScore:
          totalRmScore,

        tmScore:
          totalTmScore,

        kraDetails:
          details,
      };
    },
  );
};

/* =========================================================
   AVATAR THEME
   ========================================================= */

const createRandomAvatarThemes = (
  records: KraManagementRecord[],
): Record<
  number,
  AvatarTheme
> => {
  const themes: Record<
    number,
    AvatarTheme
  > = {};

  records.forEach(
    (record) => {
      const randomIndex =
        Math.floor(
          Math.random() *
            AVATAR_COLORS.length,
        );

      themes[record.id] = {
        backgroundColor:
          AVATAR_COLORS[
            randomIndex
          ],

        color:
          AVATAR_TEXT_COLORS[
            randomIndex
          ],
      };
    },
  );

  return themes;
};

/* =========================================================
   SELF SCORE DISPLAY
   ========================================================= */

const formatSelfScore = (
  selfScore: number | null,
  weightage: number | null,
): string => {
  if (
    selfScore === null &&
    weightage === null
  ) {
    return "—";
  }

  if (weightage === null) {
    return selfScore === null
      ? "—"
      : String(selfScore);
  }

  return `${selfScore ?? 0} / ${weightage}`;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraManagementTable: React.FC<
  KraManagementTableProps
> = ({
  data = DEFAULT_DATA,
  onView,
  onEdit,
  onDelete,
}) => {
  const [
    currentPage,
    setCurrentPage,
  ] = useState<number>(1);

  const [
    pageSize,
    setPageSize,
  ] = useState<number>(5);

  const [
    avatarThemes,
  ] = useState<
    Record<
      number,
      AvatarTheme
    >
  >(() =>
    createRandomAvatarThemes(
      data,
    ),
  );

  /* =======================================================
     AGGREGATION
     ======================================================= */

  const aggregatedRecords =
    useMemo(
      () =>
        aggregateKraRecords(
          data,
        ),
      [data],
    );

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalRecords =
    aggregatedRecords.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
          pageSize,
      ),
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const currentRecords =
    useMemo(() => {
      const startIndex =
        (safeCurrentPage - 1) *
        pageSize;

      return aggregatedRecords.slice(
        startIndex,
        startIndex + pageSize,
      );
    }, [
      aggregatedRecords,
      safeCurrentPage,
      pageSize,
    ]);

  const startEntry =
    totalRecords === 0
      ? 0
      : (safeCurrentPage - 1) *
          pageSize +
        1;

  const endEntry =
    Math.min(
      safeCurrentPage *
        pageSize,
      totalRecords,
    );

  /* =======================================================
     EVENTS
     ======================================================= */

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setPageSize(
      Number(
        event.target.value,
      ),
    );

    setCurrentPage(1);
  };

  const handlePreviousPage =
    (): void => {
      setCurrentPage(
        (
          previousPage,
        ) =>
          Math.max(
            previousPage - 1,
            1,
          ),
      );
    };

  const handleNextPage =
    (): void => {
      setCurrentPage(
        (
          previousPage,
        ) =>
          Math.min(
            previousPage + 1,
            totalPages,
          ),
      );
    };

  const handlePageChange = (
    page: number,
  ): void => {
    setCurrentPage(page);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      className="kra-management-table-card"
      aria-label="KRA management records"
    >
      <div className="kra-management-table-scroll">
        <table className="kra-management-table">
          <thead>
            <tr>

              {/* =================================
                  SR. NO.
                  ================================= */}

              <th className="kra-management-serial-heading">
                Sr. No.
              </th>

              {/* =================================
                  EMPLOYEE
                  ================================= */}

              <th>
                Employee Name
              </th>

              {/* =================================
                  DESIGNATION
                  ================================= */}

              <th>
                Designation
              </th>

              {/* =================================
                  KRA DATE
                  ================================= */}

              <th>
                <span className="kra-management-sort-heading">
                  KRA Date

                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </th>

              {/* =================================
                  FROM MONTH
                  ================================= */}

              <th>
                From Month
              </th>

              {/* =================================
                  TO MONTH
                  ================================= */}

              <th>
                <span className="kra-management-sort-heading">
                  To Month

                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
              </th>

              {/* =================================
                  YEAR
                  ================================= */}

              <th>
                Year
              </th>

              {/* =================================
                  SELF SCORE
                  ================================= */}

              <th>
                Self Score
              </th>

              {/* =================================
                  TL SCORE
                  ================================= */}

              <th>
                TL Score
              </th>

              {/* =================================
                  RM SCORE
                  ================================= */}

              <th>
                RM Score
              </th>

              {/* =================================
                  TM SCORE
                  ================================= */}

              <th>
                TM Score
              </th>

              {/* =================================
                  ACTION
                  ================================= */}

              <th className="kra-management-action-heading">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map(
                (record, index) => {
                  const avatarTheme =
                    avatarThemes[
                      record.id
                    ] ?? {
                      backgroundColor:
                        "#dcebea",
                      color:
                        "#285d5c",
                    };

                  return (
                    <tr
                      key={
                        record.id
                      }
                    >

                      {/* =================================
                          SR. NO.
                          ================================= */}

                      <td className="kra-management-serial-number">
                        {(safeCurrentPage - 1) *
                          pageSize +
                          index +
                          1}
                      </td>

                      {/* =================================
                          EMPLOYEE
                          ================================= */}

                      <td>
                        <div className="kra-management-employee">
                          <div
                            className="kra-management-avatar"
                            style={
                              avatarTheme
                            }
                            aria-hidden="true"
                          >
                            {getInitials(
                              record.employeeName,
                            )}
                          </div>

                          <div className="kra-management-employee-info">
                            <strong>
                              {
                                record.employeeName
                              }
                            </strong>
                          </div>
                        </div>
                      </td>

                      {/* =================================
                          DESIGNATION
                          ================================= */}

                      <td>
                        <span className="kra-management-designation">
                          {
                            record.designation
                          }
                        </span>
                      </td>

                      {/* =================================
                          KRA DATE
                          ================================= */}

                      <td>
                        {
                          record.kraDate
                        }
                      </td>

                      {/* =================================
                          FROM MONTH
                          ================================= */}

                      <td>
                        {
                          record.fromMonth
                        }
                      </td>

                      {/* =================================
                          TO MONTH
                          ================================= */}

                      <td>
                        {
                          record.toMonth
                        }
                      </td>

                      {/* =================================
                          YEAR
                          ================================= */}

                      <td>
                        {
                          record.year
                        }
                      </td>

                      {/* =================================
                          SELF SCORE
                          ================================= */}

                      <td>
                        <span
                          className={`kra-management-score ${getScoreClass(
                            record.selfScore,
                          )}`}
                        >
                          {formatSelfScore(
                            record.selfScore,
                            record.weightage ??
                              null,
                          )}
                        </span>
                      </td>

                      {/* =================================
                          TL SCORE
                          ================================= */}

                      <td>
                        <span
                          className={`kra-management-score ${getScoreClass(
                            record.tlScore,
                          )}`}
                        >
                          {record.tlScore ??
                            "—"}
                        </span>
                      </td>

                      {/* =================================
                          RM SCORE
                          ================================= */}

                      <td>
                        <span
                          className={`kra-management-score ${getScoreClass(
                            record.rmScore,
                          )}`}
                        >
                          {record.rmScore ??
                            "—"}
                        </span>
                      </td>

                      {/* =================================
                          TM SCORE
                          ================================= */}

                      <td>
                        <span
                          className={`kra-management-score ${getScoreClass(
                            record.tmScore,
                          )}`}
                        >
                          {record.tmScore ??
                            "—"}
                        </span>
                      </td>

                      {/* =================================
                          ACTIONS
                          ================================= */}

                      <td>
                        <div className="kra-management-actions">

                          {/* VIEW */}

                          <button
                            type="button"
                            className="kra-management-action-button"
                            title="View"
                            aria-label={`View ${record.employeeName}`}
                            onClick={() =>
                              onView?.(
                                record,
                              )
                            }
                          >
                            <Eye
                              size={15}
                              strokeWidth={1.8}
                            />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            className="kra-management-action-button"
                            title="Edit"
                            aria-label={`Edit ${record.employeeName}`}
                            onClick={() =>
                              onEdit?.(
                                record,
                              )
                            }
                          >
                            <Pencil
                              size={14}
                              strokeWidth={1.8}
                            />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="kra-management-action-button kra-management-action-button--delete"
                            title="Delete"
                            aria-label={`Delete ${record.employeeName}`}
                            onClick={() =>
                              onDelete?.(
                                record,
                              )
                            }
                          >
                            <Trash2
                              size={14}
                              strokeWidth={1.8}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )
            ) : (
              <tr>
                <td
                  colSpan={12}
                  className="kra-management-table-empty"
                >
                  No KRA records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="kra-management-table-footer">
        <p className="kra-management-table-info">
          Showing{" "}
          {startEntry} to{" "}
          {endEntry} of{" "}
          {totalRecords} entries
        </p>

        <div className="kra-management-pagination-area">

          {/* PAGE SIZE */}

          <div className="kra-management-page-size">
            <select
              value={
                pageSize
              }
              onChange={
                handlePageSizeChange
              }
              aria-label="Rows per page"
            >
              <option value={5}>
                5 per page
              </option>

              <option value={10}>
                10 per page
              </option>

              <option value={20}>
                20 per page
              </option>

              <option value={25}>
                25 per page
              </option>
            </select>
          </div>

          {/* PAGINATION */}

          {totalRecords > 0 && (
            <nav
              className="kra-management-pagination"
              aria-label="KRA management pagination"
            >

              {/* PREVIOUS */}

              <button
                type="button"
                className="kra-management-page-button"
                disabled={
                  safeCurrentPage ===
                  1
                }
                onClick={
                  handlePreviousPage
                }
                aria-label="Previous page"
              >
                <ChevronLeft
                  size={16}
                  strokeWidth={1.8}
                />
              </button>

              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) =>
                  index + 1,
              ).map(
                (page) => (
                  <button
                    key={
                      page
                    }
                    type="button"
                    className={`kra-management-page-button ${
                      safeCurrentPage ===
                      page
                        ? "kra-management-page-button--active"
                        : ""
                    }`}
                    onClick={() =>
                      handlePageChange(
                        page,
                      )
                    }
                    aria-current={
                      safeCurrentPage ===
                      page
                        ? "page"
                        : undefined
                    }
                  >
                    {
                      page
                    }
                  </button>
                ),
              )}

              {/* NEXT */}

              <button
                type="button"
                className="kra-management-page-button"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={
                  handleNextPage
                }
                aria-label="Next page"
              >
                <ChevronRight
                  size={16}
                  strokeWidth={1.8}
                />
              </button>
            </nav>
          )}
        </div>
      </footer>
    </section>
  );
};

export default KraManagementTable;