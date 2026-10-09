import axios, {
  AxiosError,
  AxiosInstance,
} from "axios";

/* ============================================================
   KRA MANAGER API RECORD
   ============================================================ */

export interface KRAManagerEntry {
  id: number;

  master_id: number;

  kra_score_id: number;

  isedited: boolean;

  self_score: number | null;

  key_improvement_area: string | null;

  reporting_manager: number;

  rm_score: number | null;

  rm_remark: string | null;

  tl_score: number | null;

  tl_remark: string | null;

  tp_score: number | null;

  tp_remark: string | null;

  createdon: string | null;

  createdby: string | null;

  modifiedon: string | null;

  modifiedby: string | null;

  /* =========================================================
     EMPLOYEE
     ========================================================= */

  emp_id?: number | null;

  employee_id?: number | null;

  employee_code?: string | null;

  employee_name?: string | null;

  employee_email?: string | null;

  /* =========================================================
     REPORTING MANAGER
     ========================================================= */

  reporting_manager_name?: string | null;

  reportingManagerName?: string | null;

  /* =========================================================
     DEPARTMENT
     ========================================================= */

  department_id?: number | null;

  department_name?: string | null;

  /* =========================================================
     DESIGNATION
     ========================================================= */

  designation_id?: number | null;

  designation_name?: string | null;

  designationName?: string | null;

  /* =========================================================
     KRA
     ========================================================= */

  kra_date?: string | null;

  frommonth?: number | null;

  tomonth?: number | null;

  year?: number | null;

  /* =========================================================
     KRA MASTER
     ========================================================= */

  focused_area?: string | null;

  focusedArea?: string | null;

  weightage?: number | null;

  keyImprovementArea?: string | null;

  /* =========================================================
     CAMEL CASE
     ========================================================= */

  employeeId?: number | null;

  employeeCode?: string | null;

  employeeName?: string | null;

  employeeEmail?: string | null;

  departmentId?: number | null;

  departmentName?: string | null;

  designationId?: number | null;

  kraDate?: string | null;

  fromMonth?: number | null;

  toMonth?: number | null;

  /* =========================================================
     SCORE PERMISSIONS
     ========================================================= */

  can_edit_tl?: boolean;

  can_edit_rm?: boolean;

  can_edit_tm?: boolean;

  canEditTl?: boolean;

  canEditRm?: boolean;

  canEditTm?: boolean;

  /* =========================================================
     HIERARCHY
     ========================================================= */

  /* ============================================================
   HIERARCHY
   ============================================================ */

direct_manager_id?: number | null;
direct_manager_name?: string | null;

team_leader_id?: number | null;
team_leader_name?: string | null;
team_leader_emp_code?: string | null;
team_leader_designation_name?: string | null;

top_manager_id?: number | null;
top_manager_name?: string | null;

directManagerId?: number | null;
directManagerName?: string | null;

teamLeaderId?: number | null;
teamLeaderName?: string | null;
teamLeaderEmpCode?: string | null;
teamLeaderDesignationName?: string | null;

topManagerId?: number | null;
topManagerName?: string | null;
}

/* ============================================================
   FORM DATA
   ============================================================ */

export interface KRAManagerFormData {
  master_id: number;

  kra_score_id: number;

  isedited?: boolean;

  self_score?: number | null;

  key_improvement_area?: string | null;

  reporting_manager?: number;

  rm_score?: number | null;

  rm_remark?: string | null;

  tl_score?: number | null;

  tl_remark?: string | null;

  tp_score?: number | null;

  tp_remark?: string | null;

  createdby?: string | null;

  modifiedby?: string | null;
}

/* ============================================================
   EMPLOYEE
   ============================================================ */

export interface EmployeeEntry {
  id: number;

  emp_code: string | null;

  first_name: string | null;

  last_name: string | null;

  email: string | null;

  is_remove: number | boolean | null;

  reporting_manager?: number | null;

  designation_id?: number | null;

  designation_name?: string | null;

  department_id?: number | null;

  department_name?: string | null;

  designation?: string | null;

  department?: string | null;

  designationId?: number | null;

  designationName?: string | null;

  departmentId?: number | null;

  departmentName?: string | null;
}

/* ============================================================
   DESIGNATION
   ============================================================ */

export interface DesignationEntry {
  id: number;

  name: string;
}

/* ============================================================
   KRA SCORE
   ============================================================ */

interface KRAScoreRecord {
  id: number;

  emp_id: number;

  kra_date: string | null;

  total_self_score: number | null;

  total_rm_score: number | null;

  total_tl_score: number | null;

  total_tp_score: number | null;

  rm_remark: string | null;

  tl_remark: string | null;

  top_management_remark: string | null;

  frommonth: number | null;

  tomonth: number | null;

  year: number | null;

  createdon: string | null;

  createdby: string | null;

  modifiedon: string | null;

  modifiedby: string | null;
}

/* ============================================================
   KRA MASTER
   ============================================================ */

interface KRAMasterRecord {
  id: number;

  department_id: number;

  designation_id: number;

  focused_area: string | null;

  weightage: number | null;

  frommonth: number | null;

  tomonth: number | null;

  year: number | null;

  status: number | null;

  createdby: string | null;

  createdon: string | null;

  modifiedby: string | null;

  modifiedon: string | null;
}

/* ============================================================
   API CONFIGURATION
   ============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8001";

/* ============================================================
   API ENDPOINTS
   ============================================================ */

const MANAGER_API_URL =
  "/api/v1/performance/manager";

const SCORE_API_URL =
  "/api/v1/performance/score";

const MASTER_API_URL =
  "/api/v1/performance/master";

const EMPLOYEE_API_URL =
  "/api/v1/employees/";

const DESIGNATION_API_URL =
  "/api/v1/designations/";

/* ============================================================
   AXIOS INSTANCE
   ============================================================ */

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ============================================================
   REQUEST INTERCEPTOR
   ============================================================ */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/* ============================================================
   ERROR HANDLER
   ============================================================ */

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const responseData =
        error.response.data as
          | {
              detail?: unknown;
              message?: unknown;
              error?: unknown;
            }
          | undefined;

      const detail =
        responseData?.detail ??
        responseData?.message ??
        responseData?.error;

      if (typeof detail === "string") {
        return detail;
      }

      if (
        detail !== undefined &&
        detail !== null
      ) {
        try {
          return JSON.stringify(detail);
        } catch {
          return fallback;
        }
      }

      return `${fallback} Server returned ${error.response.status}.`;
    }

    if (error.request) {
      return `${fallback} Backend server is not responding.`;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
};

/* ============================================================
   NUMBER NORMALIZATION
   ============================================================ */

const toNullableNumber = (
  value: unknown,
): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
};

/* ============================================================
   INTEGER NORMALIZATION
   ============================================================ */

const toNullableInteger = (
  value: unknown,
): number | null => {
  const numberValue =
    toNullableNumber(value);

  if (numberValue === null) {
    return null;
  }

  return Number.isInteger(numberValue)
    ? numberValue
    : null;
};

/* ============================================================
   STRING NORMALIZATION
   ============================================================ */

const toNullableString = (
  value: unknown,
): string | null => {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const stringValue =
    String(value).trim();

  return stringValue.length > 0
    ? stringValue
    : null;
};

/* ============================================================
   NORMALIZE ARRAY RESPONSE
   ============================================================ */

const normalizeArrayResponse = <T>(
  responseData: unknown,
): T[] => {
  if (Array.isArray(responseData)) {
    return responseData as T[];
  }

  if (
    !responseData ||
    typeof responseData !== "object"
  ) {
    return [];
  }

  const data =
    responseData as Record<
      string,
      unknown
    >;

  const possibleArrays = [
    data.data,
    data.items,
    data.results,
    data.records,
  ];

  for (const value of possibleArrays) {
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
};

/* ============================================================
   GET EMPLOYEE NAME
   ============================================================ */

const getEmployeeName = (
  employee?: EmployeeEntry,
): string => {
  if (!employee) {
    return "Unknown Employee";
  }

  const firstName =
    employee.first_name?.trim() ?? "";

  const lastName =
    employee.last_name?.trim() ?? "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  if (employee.emp_code?.trim()) {
    return employee.emp_code.trim();
  }

  return "Unknown Employee";
};


/* ============================================================
   GET REPORTING MANAGER NAME
   ============================================================ */

const getReportingManagerName = (
  employee: EmployeeEntry | undefined,
  employeeMap: Map<number, EmployeeEntry>,
): string | null => {
  if (!employee) {
    return null;
  }

  const reportingManagerId =
    toNullableInteger(
      employee.reporting_manager,
    );

  if (reportingManagerId === null) {
    return null;
  }

  const reportingManager =
    employeeMap.get(
      reportingManagerId,
    );

  if (!reportingManager) {
    return null;
  }

  return getEmployeeName(
    reportingManager,
  );
};

/* ============================================================
   GET MANAGER RECORDS
   ============================================================ */

const getManagerRecords =
  async (
    skip: number,
    limit: number,
  ): Promise<KRAManagerEntry[]> => {
    const response =
      await api.get<unknown>(
        MANAGER_API_URL,
        {
          params: {
            skip,
            limit,
          },
        },
      );

    return normalizeArrayResponse<KRAManagerEntry>(
      response.data,
    );
  };

/* ============================================================
   GET SCORE RECORDS
   ============================================================ */

const getScoreRecords =
  async (): Promise<KRAScoreRecord[]> => {
    const response =
      await api.get<unknown>(
        SCORE_API_URL,
        {
          params: {
            skip: 0,
            limit: 1000,
          },
        },
      );

    return normalizeArrayResponse<KRAScoreRecord>(
      response.data,
    );
  };

/* ============================================================
   GET EMPLOYEE RECORDS
   ============================================================ */

const getEmployeeRecords =
  async (): Promise<EmployeeEntry[]> => {
    const response =
      await api.get<unknown>(
        EMPLOYEE_API_URL,
      );

    return normalizeArrayResponse<EmployeeEntry>(
      response.data,
    );
  };

/* ============================================================
   GET MASTER RECORDS
   ============================================================ */

const getMasterRecords =
  async (): Promise<KRAMasterRecord[]> => {
    const response =
      await api.get<unknown>(
        MASTER_API_URL,
      );

    return normalizeArrayResponse<KRAMasterRecord>(
      response.data,
    );
  };

/* ============================================================
   GET DESIGNATION RECORDS
   ============================================================ */

const getDesignationRecords =
  async (): Promise<DesignationEntry[]> => {
    const response =
      await api.get<unknown>(
        DESIGNATION_API_URL,
      );

    return normalizeArrayResponse<DesignationEntry>(
      response.data,
    );
  };

/* ============================================================
   NORMALIZE MASTER RECORD
   ============================================================ */

const normalizeMasterRecord = (
  master: KRAMasterRecord,
): KRAMasterRecord => {
  return {
    ...master,

    id:
      toNullableInteger(
        master.id,
      ) ?? 0,

    department_id:
      toNullableInteger(
        master.department_id,
      ) ?? 0,

    designation_id:
      toNullableInteger(
        master.designation_id,
      ) ?? 0,

    focused_area:
      toNullableString(
        master.focused_area,
      ),

    weightage:
      toNullableNumber(
        master.weightage,
      ),

    frommonth:
      toNullableInteger(
        master.frommonth,
      ),

    tomonth:
      toNullableInteger(
        master.tomonth,
      ),

    year:
      toNullableInteger(
        master.year,
      ),

    status:
      toNullableInteger(
        master.status,
      ),
  };
};

/* ============================================================
   GET ALL KRA MANAGER RECORDS
   ============================================================ */

const getAll = async (
  skip = 0,
  limit = 100,
): Promise<KRAManagerEntry[]> => {
  try {
    /* ========================================================
       1. MANAGER API
       ======================================================== */

    const managerRecords =
      await getManagerRecords(
        skip,
        limit,
      );

    if (managerRecords.length === 0) {
      return [];
    }

    /* ========================================================
       2. ENRICHMENT APIs
       ======================================================== */

    const [
      scoreResult,
      employeeResult,
      masterResult,
      designationResult,
    ] = await Promise.allSettled([
      getScoreRecords(),
      getEmployeeRecords(),
      getMasterRecords(),
      getDesignationRecords(),
    ]);

    const scoreRecords =
      scoreResult.status === "fulfilled"
        ? scoreResult.value
        : [];

    const employeeRecords =
      employeeResult.status === "fulfilled"
        ? employeeResult.value
        : [];

    const masterRecords =
      masterResult.status === "fulfilled"
        ? masterResult.value
        : [];

    const designationRecords =
      designationResult.status === "fulfilled"
        ? designationResult.value
        : [];

    /* ========================================================
       3. SCORE MAP

       kra_score_log_new.kra_score_id
                    ↓
       kra_score_new.id
       ======================================================== */

    const scoreMap =
      new Map<number, KRAScoreRecord>();

    for (const score of scoreRecords) {
      const scoreId =
        toNullableInteger(
          score.id,
        );

      if (scoreId !== null) {
        scoreMap.set(
          scoreId,
          {
            ...score,
            id: scoreId,
            emp_id:
              toNullableInteger(
                score.emp_id,
              ) ?? 0,
          },
        );
      }
    }

    /* ========================================================
       4. EMPLOYEE MAP

       kra_score_new.emp_id
                    ↓
       employee_detail.id
       ======================================================== */

    const employeeMap =
      new Map<number, EmployeeEntry>();

    for (const employee of employeeRecords) {
      const employeeId =
        toNullableInteger(
          employee.id,
        );

      if (employeeId !== null) {
        employeeMap.set(
          employeeId,
          {
            ...employee,
            id: employeeId,
          },
        );
      }
    }

    /* ========================================================
       5. MASTER MAP

       kra_score_log_new.master_id
                    ↓
       kra_master_new.id

       IMPORTANT:
       This is where Focused Area and Weightage originate.
       ======================================================== */

    const masterMap =
      new Map<number, KRAMasterRecord>();

    for (const master of masterRecords) {
      const normalizedMaster =
        normalizeMasterRecord(
          master,
        );

      if (
        normalizedMaster.id > 0
      ) {
        masterMap.set(
          normalizedMaster.id,
          normalizedMaster,
        );
      }
    }

    /* ========================================================
       6. DESIGNATION MAP
       ======================================================== */

    const designationMap =
      new Map<number, DesignationEntry>();

    for (
      const designation of designationRecords
    ) {
      const designationId =
        toNullableInteger(
          designation.id,
        );

      if (designationId !== null) {
        designationMap.set(
          designationId,
          {
            ...designation,
            id: designationId,
          },
        );
      }
    }

    /* ========================================================
       7. FINAL ENRICHMENT
       ======================================================== */

    return managerRecords.map(
      (
        manager,
      ): KRAManagerEntry => {
        /* ======================================================
           MANAGER → SCORE
           ====================================================== */

        const managerScoreId =
          toNullableInteger(
            manager.kra_score_id,
          ) ?? 0;

        const score =
          scoreMap.get(
            managerScoreId,
          );

        /* ======================================================
           SCORE → EMPLOYEE
           ====================================================== */

        const employeeId =
          toNullableInteger(
            score?.emp_id ??
              manager.emp_id ??
              manager.employee_id,
          );

        const employee =
          employeeId !== null
            ? employeeMap.get(
                employeeId,
              )
            : undefined;

        /* ======================================================
           MANAGER → MASTER

           THIS IS THE MAIN FIX.

           manager.master_id may come from API as:
             "15"

           while master.id may be:
             15

           Therefore both are normalized to number.
           ====================================================== */

        const managerMasterId =
          toNullableInteger(
            manager.master_id,
          );

        const master =
          managerMasterId !== null
            ? masterMap.get(
                managerMasterId,
              )
            : undefined;

        /* ======================================================
           DEBUG INFORMATION

           Only logs when master lookup fails.
           ====================================================== */

        if (
          managerMasterId !== null &&
          !master
        ) {
          console.warn(
            "[KRA] KRA Master not found",
            {
              managerId: manager.id,
              masterId:
                managerMasterId,
              availableMasterIds:
                Array.from(
                  masterMap.keys(),
                ),
            },
          );
        }

        /* ======================================================
           EMPLOYEE
           ====================================================== */

        const employeeName =
          employee
            ? getEmployeeName(
                employee,
              )
            : manager.employee_name ??
              manager.employeeName ??
              "Unknown Employee";

        const employeeCode =
          employee?.emp_code ??
          manager.employee_code ??
          null;

        const employeeEmail =
          employee?.email ??
          manager.employee_email ??
          null;

          /* ======================================================
   REPORTING MANAGER
   ====================================================== */

const reportingManagerName =
  getReportingManagerName(
    employee,
    employeeMap,
  );

        /* ======================================================
           DEPARTMENT
           ====================================================== */

        const departmentId =
          toNullableInteger(
            employee?.department_id ??
              employee?.departmentId ??
              master?.department_id ??
              manager.department_id,
          );

        const departmentName =
          employee?.department_name ??
          employee?.departmentName ??
          employee?.department ??
          manager.department_name ??
          null;

        /* ======================================================
           DESIGNATION
           ====================================================== */

        const designationId =
          toNullableInteger(
            employee?.designation_id ??
              employee?.designationId ??
              (
                typeof employee?.designation ===
                "number"
                  ? employee.designation
                  : null
              ) ??
              master?.designation_id ??
              manager.designation_id,
          );

        const designationMaster =
          designationId !== null
            ? designationMap.get(
                designationId,
              )
            : undefined;

        const designationName =
          employee?.designation_name ??
          employee?.designationName ??
          (
            typeof employee?.designation ===
            "string"
              ? employee.designation
              : null
          ) ??
          designationMaster?.name ??
          manager.designation_name ??
          manager.designationName ??
          null;

        /* ======================================================
           DATE
           ====================================================== */

        const kraDate =
          score?.kra_date ??
          manager.kra_date ??
          null;

        /* ======================================================
           PERIOD
           ====================================================== */

        const fromMonth =
          toNullableInteger(
            score?.frommonth ??
              master?.frommonth ??
              manager.frommonth,
          );

        const toMonth =
          toNullableInteger(
            score?.tomonth ??
              master?.tomonth ??
              manager.tomonth,
          );

        const year =
          toNullableInteger(
            score?.year ??
              master?.year ??
              manager.year,
          );

        /* ======================================================
           FOCUSED AREA

           PRIMARY SOURCE:
             kra_master_new.focused_area

           FALLBACK:
             manager.focused_area
        ====================================================== */

        const focusedArea =
          toNullableString(
            master?.focused_area ??
              manager.focused_area ??
              manager.focusedArea,
          );

        /* ======================================================
           WEIGHTAGE

           PRIMARY SOURCE:
             kra_master_new.weightage

           FALLBACK:
             manager.weightage
        ====================================================== */

        const weightage =
          toNullableNumber(
            master?.weightage ??
              manager.weightage,
          );

        /* ======================================================
           KEY IMPROVEMENT AREA

           This belongs to manager record.
        ====================================================== */

        const keyImprovementArea =
          toNullableString(
            manager.key_improvement_area ??
              manager.keyImprovementArea,
          );

        /* ======================================================
           SCORES
           ====================================================== */

        const selfScore =
          toNullableNumber(
            manager.self_score ??
              score?.total_self_score,
          );

        const rmScore =
          toNullableNumber(
            manager.rm_score ??
              score?.total_rm_score,
          );

        const tlScore =
          toNullableNumber(
            manager.tl_score ??
              score?.total_tl_score,
          );

        const tpScore =
          toNullableNumber(
            manager.tp_score ??
              score?.total_tp_score,
          );

        /* ======================================================
           FINAL OBJECT
           ====================================================== */

        return {
          ...manager,

                    /* ====================================================
             SCORE EDIT PERMISSIONS
             ==================================================== */

          canEditTl:
            manager.can_edit_tl ?? false,

          canEditRm:
            manager.can_edit_rm ?? false,

          canEditTm:
            manager.can_edit_tm ?? false,

          /* ====================================================
             EMPLOYEE HIERARCHY
             ==================================================== */

          directManagerId:
  manager.direct_manager_id ?? null,

directManagerName:
  manager.direct_manager_name ?? null,

teamLeaderId:
  manager.team_leader_id ?? null,

teamLeaderName:
  manager.team_leader_name ?? null,

teamLeaderEmpCode:
  manager.team_leader_emp_code ?? null,

teamLeaderDesignationName:
  manager.team_leader_designation_name ?? null,

topManagerId:
  manager.top_manager_id ?? null,

topManagerName:
  manager.top_manager_name ?? null,

          /* ====================================================
             EMPLOYEE
             ==================================================== */

          emp_id:
            employeeId,

          employee_id:
            employeeId,

          employeeId:
            employeeId,

          employee_code:
            employeeCode,

          employeeCode:
            employeeCode,

          employee_name:
            employeeName,

          employeeName:
            employeeName,

          employee_email:
  employeeEmail,

employeeEmail:
  employeeEmail,

/* ====================================================
   REPORTING MANAGER
   ==================================================== */

reporting_manager_name:
  reportingManagerName,

reportingManagerName:
  reportingManagerName,

/* ====================================================
   DEPARTMENT
   ==================================================== */

          department_id:
            departmentId,

          departmentId:
            departmentId,

          department_name:
            departmentName,

          departmentName:
            departmentName,

          /* ====================================================
             DESIGNATION
             ==================================================== */

          designation_id:
            designationId,

          designationId:
            designationId,

          designation_name:
            designationName,

          designationName:
            designationName,

          /* ====================================================
             KRA MASTER
             ==================================================== */

          focused_area:
            focusedArea,

          focusedArea:
            focusedArea,

          weightage:
            weightage,

          /* ====================================================
             KEY IMPROVEMENT AREA
             ==================================================== */

          key_improvement_area:
            keyImprovementArea,

          keyImprovementArea:
            keyImprovementArea,

          /* ====================================================
             KRA DATE
             ==================================================== */

          kra_date:
            kraDate,

          kraDate:
            kraDate,

          /* ====================================================
             PERIOD
             ==================================================== */

          frommonth:
            fromMonth,

          fromMonth:
            fromMonth,

          tomonth:
            toMonth,

          toMonth:
            toMonth,

          year:
            year,

          /* ====================================================
             SCORES
             ==================================================== */

          self_score:
            selfScore,

          rm_score:
            rmScore,

          tl_score:
            tlScore,

          tp_score:
            tpScore,

          /* ====================================================
             REMARKS
             ==================================================== */

          rm_remark:
            manager.rm_remark ??
            score?.rm_remark ??
            null,

          tl_remark:
            manager.tl_remark ??
            score?.tl_remark ??
            null,

          tp_remark:
            manager.tp_remark ??
            score?.top_management_remark ??
            null,
        };
      },
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load KRA Manager records.",
      ),
    );
  }
};

/* ============================================================
   GET BY ID
   ============================================================ */

const getById = async (
  recordId: number,
): Promise<KRAManagerEntry> => {
  try {
    if (
      !Number.isInteger(recordId) ||
      recordId <= 0
    ) {
      throw new Error(
        "Invalid KRA Manager record ID.",
      );
    }

    const response =
      await api.get<KRAManagerEntry>(
        `${MANAGER_API_URL}/${recordId}`,
      );

    const record =
      response.data;

    /*
     * Normalize values returned directly
     * by the single-record API.
     */

    return {
      ...record,

      id:
        toNullableInteger(
          record.id,
        ) ?? recordId,

      master_id:
        toNullableInteger(
          record.master_id,
        ) ?? 0,

      kra_score_id:
        toNullableInteger(
          record.kra_score_id,
        ) ?? 0,

      emp_id:
        toNullableInteger(
          record.emp_id,
        ),

      employee_id:
        toNullableInteger(
          record.employee_id,
        ),

      department_id:
        toNullableInteger(
          record.department_id,
        ),

      designation_id:
        toNullableInteger(
          record.designation_id,
        ),

      weightage:
        toNullableNumber(
          record.weightage,
        ),

      focused_area:
        toNullableString(
          record.focused_area ??
            record.focusedArea,
        ),

      focusedArea:
        toNullableString(
          record.focused_area ??
            record.focusedArea,
        ),

      key_improvement_area:
        toNullableString(
          record.key_improvement_area ??
            record.keyImprovementArea,
        ),

      keyImprovementArea:
        toNullableString(
          record.key_improvement_area ??
            record.keyImprovementArea,
        ),

      self_score:
        toNullableNumber(
          record.self_score,
        ),

      rm_score:
        toNullableNumber(
          record.rm_score,
        ),

      tl_score:
        toNullableNumber(
          record.tl_score,
        ),

      tp_score:
        toNullableNumber(
          record.tp_score,
        ),
    };
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to load the KRA Manager record.",
      ),
    );
  }
};

/* ============================================================
   GET EMPLOYEES
   ============================================================ */

const getEmployees =
  async (): Promise<EmployeeEntry[]> => {
    try {
      return await getEmployeeRecords();
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load employees.",
        ),
      );
    }
  };

/* ============================================================
   GET EMPLOYEE BY ID
   ============================================================ */

const getEmployeeById =
  async (
    employeeId: number,
  ): Promise<EmployeeEntry | null> => {
    try {
      if (
        !Number.isInteger(employeeId) ||
        employeeId <= 0
      ) {
        return null;
      }

      const employees =
        await getEmployeeRecords();

      return (
        employees.find(
          (employee) =>
            toNullableInteger(
              employee.id,
            ) === employeeId,
        ) ?? null
      );
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error,
          "Unable to load employee.",
        ),
      );
    }
  };

/* ============================================================
   CREATE
   ============================================================ */

const create = async (
  data: KRAManagerFormData,
): Promise<KRAManagerEntry> => {
  try {
    const payload: KRAManagerFormData = {
      ...data,

      master_id:
        toNullableInteger(
          data.master_id,
        ) ?? 0,

      kra_score_id:
        toNullableInteger(
          data.kra_score_id,
        ) ?? 0,

      self_score:
        toNullableNumber(
          data.self_score,
        ),

      rm_score:
        toNullableNumber(
          data.rm_score,
        ),

      tl_score:
        toNullableNumber(
          data.tl_score,
        ),

      tp_score:
        toNullableNumber(
          data.tp_score,
        ),
    };

    const response =
      await api.post<KRAManagerEntry>(
        MANAGER_API_URL,
        payload,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to create the KRA Manager record.",
      ),
    );
  }
};

/* ============================================================
   UPDATE
   ============================================================ */

const update = async (
  recordId: number,
  data: KRAManagerFormData,
): Promise<KRAManagerEntry> => {
  try {
    if (
      !Number.isInteger(recordId) ||
      recordId <= 0
    ) {
      throw new Error(
        "Invalid KRA Manager record ID.",
      );
    }

    const payload: KRAManagerFormData = {
      ...data,

      master_id:
        toNullableInteger(
          data.master_id,
        ) ?? 0,

      kra_score_id:
        toNullableInteger(
          data.kra_score_id,
        ) ?? 0,

      self_score:
        toNullableNumber(
          data.self_score,
        ),
    };

    // ---------------------------------------------------------
    // Only include score fields that were actually supplied
    // ---------------------------------------------------------

    if (data.rm_score !== undefined) {
      payload.rm_score =
        toNullableNumber(
          data.rm_score,
        );
    }

    if (data.tl_score !== undefined) {
      payload.tl_score =
        toNullableNumber(
          data.tl_score,
        );
    }

    if (data.tp_score !== undefined) {
      payload.tp_score =
        toNullableNumber(
          data.tp_score,
        );
    }

    // ---------------------------------------------------------
    // Only include remarks that were supplied
    // ---------------------------------------------------------

    if (data.rm_remark !== undefined) {
      payload.rm_remark =
        data.rm_remark;
    }

    if (data.tl_remark !== undefined) {
      payload.tl_remark =
        data.tl_remark;
    }

    if (data.tp_remark !== undefined) {
      payload.tp_remark =
        data.tp_remark;
    }

    const response =
      await api.put<KRAManagerEntry>(
        `${MANAGER_API_URL}/${recordId}`,
        payload,
      );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update the KRA Manager record.",
      ),
    );
  }
};

/* ============================================================
   DELETE
   ============================================================ */

const remove = async (
  recordId: number,
): Promise<void> => {
  try {
    if (
      !Number.isInteger(recordId) ||
      recordId <= 0
    ) {
      throw new Error(
        "Invalid KRA Manager record ID.",
      );
    }

    await api.delete(
      `${MANAGER_API_URL}/${recordId}`,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete the KRA Manager record.",
      ),
    );
  }
};

/* ============================================================
   EXPORT
   ============================================================ */

export const kraManagementService = {
  getAll,

  getById,

  getEmployees,

  getEmployeeById,

  create,

  update,

  delete: remove,
};

export default kraManagementService;