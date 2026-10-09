import React, { useCallback, useEffect, useMemo, useState } from "react";

import KraManagementHeader from "./components/KraManagement/KraManagementHeader";

import KraManagementSummary from "./components/KraManagement/KraManagementSummary";

import KraManagementFilters, {
  type KraManagementFilterValues,
} from "./components/KraManagement/KraManagementFilters";

import KraManagementTable, {
  type KraDetail,
  type KraManagementRecord,
} from "./components/KraManagement/KraManagementTable";

import KraManagementModal, {
  type KraManagementModalMode,
} from "./components/KraManagement/KraManagementModal";

import kraManagementService, {
  type EmployeeEntry,
  type KRAManagerEntry,
  type KRAManagerFormData,
} from "./services/kraManagement";

import kraScoreService, {
  type KRAScoreEntry,
} from "./services/kraScoreService";

import "./KraManagement.css";

/* =========================================================
   INITIAL FILTERS
   ========================================================= */

const INITIAL_FILTERS: KraManagementFilterValues = {
  search: "",
  year: "",
  selectedYear: "",
  fromMonth: "",
  toMonth: "",
};

/* =========================================================
   MONTHS
   ========================================================= */

const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* =========================================================
   API UI RECORD
   ========================================================= */
type ApiKraManagementRecord = KraManagementRecord & {
  masterId: number;
  kraScoreId: number;

  isEdited: boolean;

  keyImprovementArea: string | null;

  reportingManager: number;

  rmRemark: string | null;
  tlRemark: string | null;
  tpRemark: string | null;

  createdOn: string | null;
  createdBy: string | null;

  modifiedOn: string | null;
  modifiedBy: string | null;

  employeeId: number | null;

  employeeCode: string | null;
  reportingManagerName: string | null;

  /* =========================================================
     SCORE EDIT PERMISSIONS
     ========================================================= */

  canEditTl: boolean;
  canEditRm: boolean;
  canEditTm: boolean;

  /* =========================================================
     MANAGER HIERARCHY
     ========================================================= */

  directManagerId: number | null;
  directManagerName: string | null;

  teamLeaderId: number | null;
teamLeaderName: string | null;
teamLeaderEmpCode: string | null;
teamLeaderDesignationName: string | null;

  topManagerId: number | null;
  topManagerName: string | null;
};

/* =========================================================
   MONTH NORMALIZATION
   ========================================================= */

const normalizeMonth = (value: string): string => {
  return value.trim().slice(0, 3).toLowerCase();
};

/* =========================================================
   FORMAT MONTH
   ========================================================= */

const formatMonth = (
  month: number | null | undefined,
  year: number,
): string => {
  if (month === null || month === undefined || month < 1 || month > 12) {
    return "";
  }

  return MONTH_NAMES[month - 1] ?? `${month} ${year}`;
};

/* =========================================================
   FORMAT DATE
   ========================================================= */

const formatDate = (value: string | null): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

/* =========================================================
   SAFE SCORE

   Backend database columns are nullable.

   UI table expects number.

   Therefore null => 0.
   ========================================================= */

const safeScore = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return 0;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return parsedValue;
};

/* =========================================================
   SCORE MAP
   ========================================================= */

const createScoreMap = (
  scores: KRAScoreEntry[],
): Map<number, KRAScoreEntry> => {
  const map = new Map<number, KRAScoreEntry>();

  for (const score of scores) {
    if (Number.isInteger(score.id)) {
      map.set(score.id, score);
    }
  }

  return map;
};

/* =========================================================
   EMPLOYEE NAME
   ========================================================= */

const getEmployeeName = (
  employee: EmployeeEntry | undefined,
  fallbackId: number | null,
  managerId: number,
): string => {
  if (employee) {
    const firstName = employee.first_name?.trim() ?? "";

    const lastName = employee.last_name?.trim() ?? "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (employee.emp_code?.trim()) {
      return employee.emp_code.trim();
    }
  }

  if (fallbackId !== null && fallbackId !== undefined) {
    return `Employee #${fallbackId}`;
  }

  return `Manager Record #${managerId}`;
};

/* =========================================================
   MANAGER → UI
   ========================================================= */

const mapManagerToUi = (
  manager: KRAManagerEntry,
  score: KRAScoreEntry | undefined,
  employee: EmployeeEntry | undefined,
  reportingManagerEmployee: EmployeeEntry | undefined,
): ApiKraManagementRecord => {
  const employeeId =
    score?.emp_id ?? manager.emp_id ?? manager.employee_id ?? null;

  const year = Number(score?.year ?? manager.year ?? 0);

  /*
   * ---------------------------------------------------------
   * EMPLOYEE
   * ---------------------------------------------------------
   */

  const employeeName = employee
    ? getEmployeeName(employee, employeeId, manager.id)
    : (manager.employee_name ??
      manager.employeeName ??
      getEmployeeName(employee, employeeId, manager.id));

  const employeeCode =
    employee?.emp_code?.trim() ||
    manager.employee_code?.trim() ||
    manager.employeeCode?.trim() ||
    null;

  const reportingManagerName = reportingManagerEmployee
    ? getEmployeeName(
        reportingManagerEmployee,
        reportingManagerEmployee.id,
        manager.id,
      )
    : null;

  /*
   * ---------------------------------------------------------
   * DESIGNATION
   * ---------------------------------------------------------
   *
   * kraManagementService.getAll() already resolves the
   * designation from employee/master/manager data.
   */

  const designation =
    manager.designation_name ?? manager.designationName ?? "—";

  /*
   * ---------------------------------------------------------
   * KRA MASTER VALUES
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * kraManagementService.getAll() already resolves:
   *
   * manager.master_id
   *       ↓
   * kra_master_new.id
   *       ↓
   * focused_area
   * weightage
   *
   * Preserve those values here.
   */

  const focusedArea = manager.focused_area ?? manager.focusedArea ?? "";

  const weightage =
    manager.weightage !== null && manager.weightage !== undefined
      ? Number(manager.weightage)
      : null;

  /*
   * ---------------------------------------------------------
   * SCORES
   * ---------------------------------------------------------
   */

  const selfScore = safeScore(manager.self_score ?? null);

  const tlScore = safeScore(manager.tl_score ?? null);

  const rmScore = safeScore(manager.rm_score ?? null);

  const tmScore = safeScore(manager.tp_score ?? null);

  /*
   * ---------------------------------------------------------
   * MASTER ID / SCORE ID
   * ---------------------------------------------------------
   */

  const masterId = Number(manager.master_id);

  const kraScoreId = Number(manager.kra_score_id);

  /*
   * ---------------------------------------------------------
   * KRA DETAILS
   * ---------------------------------------------------------
   *
   * Each KRA Manager record is linked to exactly one KRA
   * Master record through master_id.
   *
   * The modal expects kraDetails[].
   *
   * Therefore preserve the resolved KRA Master values in
   * one detail object instead of allowing the modal to
   * fall back to "KRA 1" / "—".
   */

  const kraDetails = [
    {
      /*
       * UI/KRA master identity
       */
      id: Number.isInteger(masterId) && masterId > 0 ? masterId : manager.id,

      /*
       * ACTUAL KRA MANAGER DATABASE RECORD ID
       *
       * This is the ID required for:
       *
       * PUT /kra-manager/{managerRecordId}
       */
      managerRecordId:
        Number.isInteger(manager.id) && manager.id > 0 ? manager.id : null,

      /*
       * Explicit KRA master ID.
       */
      masterId: Number.isInteger(masterId) && masterId > 0 ? masterId : null,

      focusedArea,

      focused_area: focusedArea,

      weightage,

      selfScore,

      self_score: selfScore,

      tlScore,

      tl_score: tlScore,

      rmScore,

      rm_score: rmScore,

      tmScore,

      tm_score: tmScore,

      improvementArea:
        manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

      improvement_area:
        manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

      keyImprovementArea:
        manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

      key_improvement_area:
        manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

      kraDate: score?.kra_date ?? manager.kra_date ?? "",

      kra_date: score?.kra_date ?? manager.kra_date ?? "",

      fromMonth: formatMonth(
        score?.frommonth ?? manager.frommonth ?? null,
        year,
      ),

      from_month: formatMonth(
        score?.frommonth ?? manager.frommonth ?? null,
        year,
      ),

      toMonth: formatMonth(score?.tomonth ?? manager.tomonth ?? null, year),

      to_month: formatMonth(score?.tomonth ?? manager.tomonth ?? null, year),

      year,
    },
  ];

  /*
   * ---------------------------------------------------------
   * FINAL UI RECORD
   * ---------------------------------------------------------
   */
  return {
    id: manager.id,

    employeeName,

    employee_name: employeeName,

    /* =======================================================
     * SCORE EDIT PERMISSIONS
     * ======================================================= */

    canEditTl: manager.can_edit_tl ?? false,

    canEditRm: manager.can_edit_rm ?? false,

    canEditTm: manager.can_edit_tm ?? false,

    /* =======================================================
 * MANAGER HIERARCHY
 * ======================================================= */

directManagerId:
  manager.direct_manager_id ?? null,

directManagerName:
  manager.direct_manager_name ?? null,

/* =======================================================
 * TEAM LEADER
 * ======================================================= */

teamLeaderId:
  manager.team_leader_id ?? null,

teamLeaderName:
  manager.team_leader_name ?? null,

teamLeaderEmpCode:
  manager.team_leader_emp_code ?? null,

teamLeaderDesignationName:
  manager.team_leader_designation_name ?? null,

/* =======================================================
 * TOP MANAGEMENT
 * ======================================================= */

topManagerId:
  manager.top_manager_id ?? null,

topManagerName:
  manager.top_manager_name ?? null,

    designation,

    kraDate: formatDate(score?.kra_date ?? manager.kra_date ?? null),

    kra_date: score?.kra_date ?? manager.kra_date ?? "",

    fromMonth: formatMonth(score?.frommonth ?? manager.frommonth ?? null, year),

    from_month: formatMonth(
      score?.frommonth ?? manager.frommonth ?? null,
      year,
    ),

    toMonth: formatMonth(score?.tomonth ?? manager.tomonth ?? null, year),

    to_month: formatMonth(score?.tomonth ?? manager.tomonth ?? null, year),

    year,

    /* =======================================================
     * KRA MASTER VALUES
     * ======================================================= */

    focusedArea,

    focused_area: focusedArea,

    weightage,

    /* =======================================================
     * KEY IMPROVEMENT AREA
     * ======================================================= */

    improvementArea:
      manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

    improvement_area:
      manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

    keyImprovementArea:
      manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

    key_improvement_area:
      manager.key_improvement_area ?? manager.keyImprovementArea ?? null,

    /* =======================================================
     * SCORES
     * ======================================================= */

    selfScore,

    tlScore,

    rmScore,

    tmScore,

    /* =======================================================
     * INDIVIDUAL KRA DETAILS
     * ======================================================= */

    kraDetails,

    /* =======================================================
     * INTERNAL API VALUES
     * ======================================================= */

    masterId: Number.isInteger(masterId) && masterId > 0 ? masterId : 0,

    kraScoreId: Number.isInteger(kraScoreId) && kraScoreId > 0 ? kraScoreId : 0,

    isEdited: manager.isedited,

    reportingManager: manager.reporting_manager,

    rmRemark: manager.rm_remark,

    tlRemark: manager.tl_remark,

    tpRemark: manager.tp_remark,

    createdOn: manager.createdon,

    createdBy: manager.createdby,

    modifiedOn: manager.modifiedon,

    modifiedBy: manager.modifiedby,

    employeeId,

    employeeCode,

    reportingManagerName,
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraManagement: React.FC = () => {
  /* =======================================================
       STATE
       ======================================================= */

  const [records, setRecords] = useState<ApiKraManagementRecord[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [filters, setFilters] =
    useState<KraManagementFilterValues>(INITIAL_FILTERS);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [modalMode, setModalMode] = useState<KraManagementModalMode>("view");

  const [selectedRecord, setSelectedRecord] =
    useState<KraManagementRecord | null>(null);

  /* =======================================================
       LOAD RECORDS
       ======================================================= */

  const loadRecords = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      setErrorMessage("");

      /*
       * Manager service already performs:
       *
       * Manager
       *   ↓
       * Score
       *   ↓
       * Employee
       *   ↓
       * Master
       *   ↓
       * Designation
       */

      const managerRecords = await kraManagementService.getAll(0, 100);

      /*
       * Score API is retained here for
       * compatibility with existing frontend
       * behaviour.
       */

      let scoreRecords: KRAScoreEntry[] = [];

      try {
        scoreRecords = await kraScoreService.getAll(0, 500);
      } catch {
        scoreRecords = [];
      }

      /*
       * Employee records.
       */

      let employeeRecords: EmployeeEntry[] = [];

      try {
        employeeRecords = await kraManagementService.getEmployees();
      } catch (error) {
        console.error("Unable to load employees:", error);

        employeeRecords = [];
      }

      /*
       * Score lookup.
       */

      const scoreMap = createScoreMap(scoreRecords);

      /*
       * Employee lookup.
       */

      const employeeMap = new Map<number, EmployeeEntry>();

      for (const employee of employeeRecords) {
        if (Number.isInteger(employee.id)) {
          employeeMap.set(employee.id, employee);
        }
      }

      /*
       * Map final records.
       */

      const mappedRecords = managerRecords
        .map((manager) => {
          const score = scoreMap.get(manager.kra_score_id);

          const employeeId =
            score?.emp_id ?? manager.emp_id ?? manager.employee_id ?? null;

          const employee =
            employeeId !== null ? employeeMap.get(employeeId) : undefined;

          const reportingManagerIdCandidate = Number(manager.reporting_manager);

          const reportingManagerId =
            Number.isInteger(reportingManagerIdCandidate) &&
            reportingManagerIdCandidate > 0
              ? reportingManagerIdCandidate
              : (employee?.reporting_manager ?? null);

          const reportingManagerEmployee =
            reportingManagerId !== null
              ? employeeMap.get(reportingManagerId)
              : undefined;

          return mapManagerToUi(
            manager,
            score,
            employee,
            reportingManagerEmployee,
          );
        })
        .sort((a, b) => b.id - a.id);

      setRecords(mappedRecords);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load KRA Manager records.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* =======================================================
       INITIAL LOAD
       ======================================================= */

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  /* =======================================================
       FILTER CHANGE
       ======================================================= */

  const handleFilterChange = useCallback(
    (updatedFilters: KraManagementFilterValues): void => {
      setFilters(updatedFilters);
    },
    [],
  );

  /* =======================================================
       FILTERED RECORDS
       ======================================================= */

  const filteredRecords = useMemo<ApiKraManagementRecord[]>(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return records.filter((record) => {
      const searchableValues = [
        record.employeeName,
        record.designation,
        record.kraDate,
        record.fromMonth,
        record.toMonth,
        record.year.toString(),
        String(record.selfScore ?? 0),
        String(record.tlScore ?? 0),
        String(record.rmScore ?? 0),
        String(record.tmScore ?? 0),
        record.employeeId?.toString() ?? "",
        record.kraScoreId.toString(),
        record.masterId.toString(),
      ];

      const matchesSearch =
        normalizedSearch === "" ||
        searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      const matchesYear =
        filters.year === "" || record.year.toString() === filters.year;

      const matchesSelectedYear =
        filters.selectedYear === "" ||
        record.year.toString() === filters.selectedYear;

      const matchesFromMonth =
        filters.fromMonth === "" ||
        normalizeMonth(record.fromMonth) === normalizeMonth(filters.fromMonth);

      const matchesToMonth =
        filters.toMonth === "" ||
        normalizeMonth(record.toMonth) === normalizeMonth(filters.toMonth);

      return (
        matchesSearch &&
        matchesYear &&
        matchesSelectedYear &&
        matchesFromMonth &&
        matchesToMonth
      );
    });
  }, [records, filters]);

  /* =======================================================
       VIEW
       ======================================================= */

  const handleView = useCallback((record: KraManagementRecord): void => {
    setSelectedRecord(record);

    setModalMode("view");

    setIsModalOpen(true);
  }, []);

  /* =======================================================
       EDIT
       ======================================================= */

  const handleEdit = useCallback((record: KraManagementRecord): void => {
    setSelectedRecord(record);

    setModalMode("edit");

    setErrorMessage("");

    setIsModalOpen(true);
  }, []);

  /* =======================================================
       CLOSE MODAL
       ======================================================= */

  const handleCloseModal = useCallback((): void => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);

    setSelectedRecord(null);

    setModalMode("view");
  }, [isSubmitting]);

  /* =======================================================
       UPDATE PAYLOAD
       ======================================================= */
    const buildDetailUpdatePayload = (
  detail: KraDetail,
  originalRecord: KraManagementRecord,
  updatedRecord: KraManagementRecord,
): KRAManagerFormData => {
  const masterId =
    Number(detail.masterId ?? detail.id);

  const payload: KRAManagerFormData = {
    /*
     * IMPORTANT:
     * master_id belongs to THIS individual KRA.
     */
    master_id:
      Number.isInteger(masterId) &&
      masterId > 0
        ? masterId
        : Number(originalRecord.masterId ?? 0),

    /*
     * All KRA rows belonging to the same evaluation
     * use the same kra_score_id.
     */
    kra_score_id:
      Number(originalRecord.kraScoreId ?? 0),

    isedited: true,

    /*
     * Individual self score.
     *
     * NEVER use updatedRecord.selfScore here because
     * updatedRecord.selfScore is the aggregated total.
     */
    self_score:
      detail.selfScore ?? null,

    key_improvement_area:
      detail.keyImprovementArea ??
      detail.key_improvement_area ??
      detail.improvementArea ??
      detail.improvement_area ??
      null,

    reporting_manager:
      originalRecord.reportingManager
        ? Number(originalRecord.reportingManager)
        : undefined,

    createdby:
      originalRecord.createdBy ?? null,

    modifiedby:
      localStorage.getItem("userId") ??
      originalRecord.modifiedBy ??
      null,
  };

  /*
   * ---------------------------------------------------------
   * TL
   * ---------------------------------------------------------
   */
  if (updatedRecord.canEditTl === true) {
    payload.tl_score =
      detail.tlScore ?? null;

    payload.tl_remark =
      updatedRecord.tlRemark ?? null;
  }

  /*
   * ---------------------------------------------------------
   * RM
   * ---------------------------------------------------------
   */
  if (updatedRecord.canEditRm === true) {
    payload.rm_score =
      detail.rmScore ?? null;

    payload.rm_remark =
      updatedRecord.rmRemark ?? null;
  }

  /*
   * ---------------------------------------------------------
   * TM
   * DB FIELD = tp_score
   * ---------------------------------------------------------
   */
  if (updatedRecord.canEditTm === true) {
    payload.tp_score =
      detail.tmScore ?? null;

    payload.tp_remark =
      updatedRecord.tpRemark ?? null;
  }

  return payload;
};

  /* =======================================================
       SAVE
       ======================================================= */
const handleSave = useCallback(
  async (
    updatedRecord: KraManagementRecord,
  ): Promise<void> => {
    if (isSubmitting) {
      return;
    }

    /*
     * The selected record is the aggregated UI record.
     *
     * Its kraDetails[] contains the individual KRA rows.
     */
    const details =
      Array.isArray(updatedRecord.kraDetails)
        ? updatedRecord.kraDetails
        : [];

    if (details.length === 0) {
      const message =
        "No individual KRA details were found to save.";

      setErrorMessage(message);
      window.alert(message);

      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      /*
       * -------------------------------------------------------
       * SAVE EACH KRA MANAGER RECORD INDIVIDUALLY
       * -------------------------------------------------------
       *
       * Example:
       *
       * Detail 1:
       * managerRecordId = 101
       * rmScore = 40
       *
       * Detail 2:
       * managerRecordId = 102
       * rmScore = 40
       *
       * We send:
       *
       * PUT /manager/101 → rm_score = 40
       * PUT /manager/102 → rm_score = 40
       */
      for (const detail of details) {
        const managerRecordId =
          Number(detail.managerRecordId);

        if (
          !Number.isInteger(managerRecordId) ||
          managerRecordId <= 0
        ) {
          throw new Error(
            `Invalid KRA Manager record ID for "${detail.focusedArea ?? "KRA"}".`,
          );
        }

        /*
         * Find the original UI record that owns this
         * individual manager record.
         *
         * Since `records` contains aggregated records,
         * search inside their kraDetails.
         */
        const originalOwner =
          records.find((record) =>
            Array.isArray(record.kraDetails) &&
            record.kraDetails.some(
              (existingDetail) =>
                Number(
                  existingDetail.managerRecordId,
                ) === managerRecordId,
            ),
          );

        /*
         * Usually this should always exist.
         *
         * Fallback to the selected aggregated record
         * so existing data remains safe.
         */
        const originalRecord =
          originalOwner ?? updatedRecord;

        const payload =
          buildDetailUpdatePayload(
            detail,
            originalRecord,
            updatedRecord,
          );

        await kraManagementService.update(
          managerRecordId,
          payload,
        );
      }

      /*
       * -------------------------------------------------------
       * RELOAD FROM DATABASE
       * -------------------------------------------------------
       *
       * This is important.
       *
       * Do not construct the final table from local state.
       * Reload the actual persisted values.
       */
      await loadRecords();

      /*
       * Close modal only after ALL KRA rows
       * have been successfully updated.
       */
      setIsModalOpen(false);
      setSelectedRecord(null);
      setModalMode("view");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update KRA Manager records.";

      setErrorMessage(message);
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  },
  [
    isSubmitting,
    records,
    loadRecords,
  ],
);

  /* =======================================================
       DELETE
       ======================================================= */

  const handleDelete = useCallback(
    async (record: KraManagementRecord): Promise<void> => {
      const confirmed = window.confirm(
        `Are you sure you want to delete the KRA Manager record for ${record.employeeName}?`,
      );

      if (!confirmed) {
        return;
      }

      try {
        setIsSubmitting(true);

        setErrorMessage("");

        await kraManagementService.delete(record.id);

        await loadRecords();

        if (selectedRecord?.id === record.id) {
          setSelectedRecord(null);

          setIsModalOpen(false);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to delete KRA Manager record.";

        setErrorMessage(message);

        window.alert(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadRecords, selectedRecord],
  );

  /* =======================================================
       DOWNLOAD CSV
       ======================================================= */

  const handleDownloadExcel = useCallback((): void => {
    if (filteredRecords.length === 0) {
      window.alert("There are no records available to download.");

      return;
    }

    const headers: string[] = [
      "Employee",
      "Employee ID",
      "Designation",
      "KRA Date",
      "From Month",
      "To Month",
      "Year",
      "Self Score",
      "TL Score",
      "RM Score",
      "TM Score",
    ];

    const escapeCsvValue = (
      value: string | number | null | undefined,
    ): string => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const rows = filteredRecords.map((record) =>
      [
        record.employeeName,
        record.employeeId,
        record.designation,
        record.kraDate,
        record.fromMonth,
        record.toMonth,
        record.year,
        record.selfScore,
        record.tlScore,
        record.rmScore,
        record.tmScore,
      ]
        .map(escapeCsvValue)
        .join(","),
    );

    const csvContent = [headers.map(escapeCsvValue).join(","), ...rows].join(
      "\r\n",
    );

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const currentDate = new Date().toISOString().slice(0, 10);

    link.href = objectUrl;

    link.download = `kra-management-${currentDate}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
  }, [filteredRecords]);

  /* =======================================================
       RENDER
       ======================================================= */

  return (
    <main className="kra-management-page">
      <div className="kra-management-container">
        <section className="kra-management-section kra-management-header-section">
          <KraManagementHeader />
        </section>

        {errorMessage && (
          <div className="kra-management-error" role="alert">
            {errorMessage}
          </div>
        )}

        <section className="kra-management-section kra-management-summary-section">
          <KraManagementSummary data={records} />
        </section>

        <section className="kra-management-section kra-management-filters-section">
          <KraManagementFilters
            onFilterChange={handleFilterChange}
            onDownloadExcel={handleDownloadExcel}
          />
        </section>

        <section className="kra-management-section kra-management-table-section">
          {isLoading ? (
            <div className="kra-management-loading" role="status">
              Loading KRA Manager records...
            </div>
          ) : (
            <KraManagementTable
              data={filteredRecords}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>

      <KraManagementModal
        isOpen={isModalOpen}
        mode={modalMode}
        record={selectedRecord}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </main>
  );
};

export default KraManagement;