import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Target,
  XCircle,
} from "lucide-react";

import Breadcrumb from "./components/Breadcrumb/Breadcrumb";
import FilterToolbar from "./components/FilterToolbar/FilterToolbar";
import KraTable from "./components/KraTable/KraTable";
import KraModal from "./components/KraModal/KraModal";
import SummaryCard from "./components/SummaryCards/SummaryCard";

import {
  KRAMasterEntry,
  KRAStatus,
} from "./types/kra.types";

import kraService from "./services/kraService";

import axiosInstance from "../../services/axios/axiosInstance";

import "./KraMaster.css";

/* =========================================================
   TYPES
   ========================================================= */

interface KraFilters {
  department: string;
  designation: string;
}

type PaginationItem =
  | number
  | "ellipsis-start"
  | "ellipsis-end";

/* =========================================================
   MASTER DATA TYPES
   ========================================================= */

interface DepartmentOption {
  id: number;
  name: string;
}

interface DesignationOption {
  id: number;
  name: string;
  depart_id: number;
  department_name?: string | null;
}

/* =========================================================
   API MASTER DATA TYPES
   ========================================================= */

interface DepartmentApiResponse {
  id: number | string;
  name: string;
}

interface DesignationApiResponse {
  id: number | string;
  name: string;
  depart_id: number | string;
  department_name?: string | null;
}

/* =========================================================
   CONSTANTS
   ========================================================= */

const INITIAL_FILTERS: KraFilters = {
  department: "",
  designation: "",
};

const PAGE_SIZE = 10;

/* =========================================================
   MONTHS
   ========================================================= */

const MONTHS: readonly string[] = [
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
   STATUS MAPPING
   ========================================================= */

const mapStatus = (
  status:
    | number
    | string
    | null
    | undefined,
): KRAStatus => {
  if (
    status === null ||
    status === undefined
  ) {
    return "Inactive";
  }

  if (typeof status === "string") {
    const normalizedStatus =
      status.trim().toLowerCase();

    /*
     * Text status
     */

    if (
      normalizedStatus ===
      "active"
    ) {
      return "Active";
    }

    if (
      normalizedStatus ===
      "inactive"
    ) {
      return "Inactive";
    }

    /*
     * Numeric status received
     * as string.
     */

    if (
      normalizedStatus === "1"
    ) {
      return "Active";
    }

    if (
      normalizedStatus === "0"
    ) {
      return "Inactive";
    }

    return "Inactive";
  }

  if (status === 1) {
    return "Active";
  }

  if (status === 0) {
    return "Inactive";
  }

  return "Inactive";
};

/* =========================================================
   MONTH MAPPING
   ========================================================= */

/**
 * Converts API month values into the exact
 * month names expected by the UI.
 *
 * Supported:
 *
 * 1       -> January
 * "1"     -> January
 * 12      -> December
 * "12"    -> December
 * "May"   -> May
 * "may"   -> May
 * "MAY"   -> May
 */
const mapMonth = (
  month:
    | number
    | string
    | null
    | undefined,
): string => {
  if (
    month === null ||
    month === undefined
  ) {
    return "";
  }

  const rawValue =
    String(month).trim();

  if (!rawValue) {
    return "";
  }

  /*
   * =======================================================
   * NUMERIC MONTH
   * =======================================================
   */

  const numericMonth =
    Number(rawValue);

  if (
    Number.isInteger(
      numericMonth,
    ) &&
    numericMonth >= 1 &&
    numericMonth <= 12
  ) {
    return MONTHS[
      numericMonth - 1
    ];
  }

  /*
   * =======================================================
   * MONTH NAME
   * =======================================================
   */

  const normalizedMonth =
    rawValue.toLowerCase();

  const monthIndex =
    MONTHS.findIndex(
      (monthName) =>
        monthName.toLowerCase() ===
        normalizedMonth,
    );

  if (
    monthIndex !== -1
  ) {
    return MONTHS[
      monthIndex
    ];
  }

  /*
   * =======================================================
   * SHORT MONTH NAME
   * =======================================================
   *
   * Example:
   *
   * Jan -> January
   * Feb -> February
   * Mar -> March
   * etc.
   */

  const shortMonthIndex =
    MONTHS.findIndex(
      (monthName) =>
        monthName
          .substring(0, 3)
          .toLowerCase() ===
        normalizedMonth,
    );

  if (
    shortMonthIndex !== -1
  ) {
    return MONTHS[
      shortMonthIndex
    ];
  }

  /*
   * =======================================================
   * PRESERVE UNKNOWN VALUE
   * =======================================================
   */

  return rawValue;
};

/* =========================================================
   API RESPONSE TYPE
   ========================================================= */

interface KRAMasterApiRecord {
  id:
    | number
    | string;

  department_id:
    | number
    | string;

  designation_id:
    | number
    | string;

  focused_area?:
    | string
    | null;

  focusedArea?:
    | string
    | null;

  weightage?:
    | number
    | string
    | null;

  /*
   * Standard backend names
   */

  frommonth?:
    | number
    | string
    | null;

  tomonth?:
    | number
    | string
    | null;

  /*
   * Snake case variants
   */

  from_month?:
    | number
    | string
    | null;

  to_month?:
    | number
    | string
    | null;

  /*
   * Camel case variants
   */

  fromMonth?:
    | number
    | string
    | null;

  toMonth?:
    | number
    | string
    | null;

  /*
   * Additional possible API names
   */

  from?:
    | number
    | string
    | null;

  to?:
    | number
    | string
    | null;

  from_month_id?:
    | number
    | string
    | null;

  to_month_id?:
    | number
    | string
    | null;

  fromMonthId?:
    | number
    | string
    | null;

  toMonthId?:
    | number
    | string
    | null;

  year?:
    | number
    | string
    | null;

  status?:
    | number
    | string
    | null;

  createdby?:
    | string
    | null;

  createdon?:
    | string
    | null;

  modifiedby?:
    | string
    | null;

  modifiedon?:
    | string
    | null;

  department?:
    | string
    | null;

  designation?:
    | string
    | null;

  /*
   * Allow additional API properties.
   *
   * This is important because the backend
   * may serialize database fields using
   * a different casing.
   */

  [key: string]: unknown;
}

/* =========================================================
   API FIELD FINDER
   ========================================================= */

/**
 * Finds a property from the API response without
 * depending on JavaScript property casing.
 *
 * Example:
 *
 * frommonth
 * fromMonth
 * from_month
 * FROMMONTH
 * FromMonth
 *
 * can all be detected.
 */
const getApiField = (
  record: KRAMasterApiRecord,
  possibleNames: string[],
): unknown => {
  /*
   * First try exact property names.
   */

  for (
    const propertyName of possibleNames
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        record,
        propertyName,
      )
    ) {
      return record[
        propertyName
      ];
    }
  }

  /*
   * Then perform normalized comparison.
   *
   * This converts:
   *
   * from_month
   * from-month
   * FromMonth
   * FROMMONTH
   *
   * into the same comparison value.
   */

  const normalizeKey = (
    value: string,
  ): string =>
    value
      .replace(
        /[_\-\s]/g,
        "",
      )
      .toLowerCase();

  const normalizedNames =
    possibleNames.map(
      normalizeKey,
    );

  const actualKey =
    Object.keys(record).find(
      (key) =>
        normalizedNames.includes(
          normalizeKey(key),
        ),
    );

  if (
    actualKey !== undefined
  ) {
    return record[
      actualKey
    ];
  }

  return undefined;
};

/* =========================================================
   GET FROM MONTH
   ========================================================= */

const getFromMonthValue = (
  record: KRAMasterApiRecord,
): unknown => {
  return getApiField(
    record,
    [
      "frommonth",
      "from_month",
      "fromMonth",
      "FromMonth",
      "FROMMONTH",
      "from",
      "from_month_id",
      "fromMonthId",
    ],
  );
};

/* =========================================================
   GET TO MONTH
   ========================================================= */

const getToMonthValue = (
  record: KRAMasterApiRecord,
): unknown => {
  return getApiField(
    record,
    [
      "tomonth",
      "to_month",
      "toMonth",
      "ToMonth",
      "TOMONTH",
      "to",
      "to_month_id",
      "toMonthId",
    ],
  );
};

/* =========================================================
   API → UI MAPPING
   ========================================================= */

const mapKraRecord = (
  record: KRAMasterApiRecord,
  departmentOptions: DepartmentOption[],
  designationOptions: DesignationOption[],
): KRAMasterEntry => {
  /* =======================================================
     DEPARTMENT
     ======================================================= */

  const department =
    departmentOptions.find(
      (item) =>
        Number(item.id) ===
        Number(
          record.department_id,
        ),
    );

  /* =======================================================
     DESIGNATION
     ======================================================= */

  const designation =
    designationOptions.find(
      (item) =>
        Number(item.id) ===
        Number(
          record.designation_id,
        ),
    );

  /* =======================================================
     MONTH VALUES
     ======================================================= */

  const rawFromMonth =
    getFromMonthValue(
      record,
    );

  const rawToMonth =
    getToMonthValue(
      record,
    );

  /*
   * IMPORTANT DEBUG INFORMATION
   *
   * This shows the exact values coming
   * from the API before conversion.
   */

  console.log(
    `[KRA ${record.id}] Month API values:`,
    {
      rawFromMonth,
      rawToMonth,
      apiKeys:
        Object.keys(record),
    },
  );

  const mappedFromMonth =
    mapMonth(
      rawFromMonth as
        | number
        | string
        | null
        | undefined,
    );

  const mappedToMonth =
    mapMonth(
      rawToMonth as
        | number
        | string
        | null
        | undefined,
    );

  console.log(
    `[KRA ${record.id}] Month UI values:`,
    {
      fromMonth:
        mappedFromMonth,
      toMonth:
        mappedToMonth,
    },
  );

  /* =======================================================
     FOCUSED AREA
     ======================================================= */

  const rawFocusedArea =
    getApiField(
      record,
      [
        "focused_area",
        "focusedArea",
        "FocusedArea",
        "FOCUSED_AREA",
      ],
    );

  /* =======================================================
     WEIGHTAGE
     ======================================================= */

  const rawWeightage =
    getApiField(
      record,
      [
        "weightage",
        "Weightage",
        "WEIGHTAGE",
      ],
    );

  const numericWeightage =
    Number(
      rawWeightage,
    );

  /* =======================================================
     YEAR
     ======================================================= */

  const rawYear =
    getApiField(
      record,
      [
        "year",
        "Year",
        "YEAR",
      ],
    );

  const numericYear =
    Number(rawYear);

  /* =======================================================
     STATUS
     ======================================================= */

  const rawStatus =
    getApiField(
      record,
      [
        "status",
        "Status",
        "STATUS",
      ],
    );

  /* =======================================================
     RETURN UI MODEL
     ======================================================= */

  return {
    id: String(
      record.id,
    ),

    department:
      department?.name ??
      record.department ??
      String(
        record.department_id,
      ),

    designation:
      designation?.name ??
      record.designation ??
      String(
        record.designation_id,
      ),

    focusedArea:
      rawFocusedArea ===
        null ||
      rawFocusedArea ===
        undefined
        ? ""
        : String(
            rawFocusedArea,
          ).trim(),

    weightage:
      Number.isFinite(
        numericWeightage,
      )
        ? numericWeightage
        : 0,

    /*
     * FINAL MONTH VALUES
     */

    fromMonth:
      mappedFromMonth,

    toMonth:
      mappedToMonth,

    year:
      Number.isFinite(
        numericYear,
      )
        ? numericYear
        : new Date().getFullYear(),

    status:
      mapStatus(
        rawStatus as
          | number
          | string
          | null
          | undefined,
      ),
  };
};

/* =========================================================
   PAGINATION HELPER
   ========================================================= */

const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (
    totalPages <= 7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1,
    );
  }

  if (
    currentPage <= 4
  ) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis-end",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
    return [
      1,
      "ellipsis-start",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraMaster: React.FC = () => {
  /* =======================================================
     STATE
     ======================================================= */

  const [
    isModalOpen,
    setIsModalOpen,
  ] =
    useState<boolean>(
      false,
    );

  const [
    data,
    setData,
  ] =
    useState<
      KRAMasterEntry[]
    >([]);

  const [
    editingEntry,
    setEditingEntry,
  ] =
    useState<KRAMasterEntry | null>(
      null,
    );

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<KraFilters>({
      ...INITIAL_FILTERS,
    });

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState<number>(1);

  const [
    departments,
    setDepartments,
  ] =
    useState<
      DepartmentOption[]
    >([]);

  const [
    designations,
    setDesignations,
  ] =
    useState<
      DesignationOption[]
    >([]);

  /* =======================================================
     LOAD KRA RECORDS
     ======================================================= */

  const loadKraRecords =
    async (
      departmentOptions:
        DepartmentOption[] =
          departments,
      designationOptions:
        DesignationOption[] =
          designations,
    ): Promise<void> => {
      try {
        const records =
          await kraService.getAll();

        console.log(
          "=================================================",
        );

        console.log(
          "KRA MASTER API RESPONSE",
        );

        console.log(
          records,
        );

        console.log(
          "=================================================",
        );

        /*
         * Validate response.
         */

        if (
          !Array.isArray(
            records,
          )
        ) {
          console.error(
            "KRA Master API did not return an array:",
            records,
          );

          setData([]);
          setCurrentPage(1);

          return;
        }

        /*
         * Map API records to UI records.
         */

        const mappedRecords =
          records.map(
            (
              record,
            ) =>
              mapKraRecord(
                record as KRAMasterApiRecord,
                departmentOptions,
                designationOptions,
              ),
          );

        /*
         * Complete mapped result.
         */

        console.log(
          "=================================================",
        );

        console.log(
          "KRA MASTER MAPPED DATA",
        );

        console.log(
          mappedRecords,
        );

        console.table(
          mappedRecords.map(
            (
              record,
            ) => ({
              id:
                record.id,

              department:
                record.department,

              designation:
                record.designation,

              focusedArea:
                record.focusedArea,

              weightage:
                record.weightage,

              fromMonth:
                record.fromMonth,

              toMonth:
                record.toMonth,

              year:
                record.year,

              status:
                record.status,
            }),
          ),
        );

        console.log(
          "=================================================",
        );

        setData(
          mappedRecords,
        );

        setCurrentPage(1);
      } catch (error) {
        console.error(
          "Failed to load KRA Master records:",
          error,
        );

        setData([]);
      }
    };

  /* =======================================================
     LOAD DEPARTMENTS + DESIGNATIONS + KRA
     ======================================================= */

  useEffect(() => {
    let isMounted =
      true;

    const loadAllMasterData =
      async (): Promise<void> => {
        try {
          const [
            departmentResponse,
            designationResponse,
          ] =
            await Promise.all([
              axiosInstance.get<
                DepartmentApiResponse[]
              >(
                "/api/v1/departments/",
              ),

              axiosInstance.get<
                DesignationApiResponse[]
              >(
                "/api/v1/designations/",
              ),
            ]);

          if (
            !isMounted
          ) {
            return;
          }

          /* =================================================
             NORMALIZE DEPARTMENTS
             ================================================= */

          const departmentData: DepartmentOption[] =
            Array.isArray(
              departmentResponse.data,
            )
              ? departmentResponse.data
                  .map(
                    (
                      department,
                    ): DepartmentOption => ({
                      id: Number(
                        department.id,
                      ),

                      name: String(
                        department.name ??
                          "",
                      ).trim(),
                    }),
                  )
                  .filter(
                    (
                      department,
                    ) =>
                      Number.isFinite(
                        department.id,
                      ) &&
                      department.name
                        .length >
                        0,
                  )
              : [];

          /* =================================================
             NORMALIZE DESIGNATIONS
             ================================================= */

          const designationData: DesignationOption[] =
            Array.isArray(
              designationResponse.data,
            )
              ? designationResponse.data
                  .map(
                    (
                      designation,
                    ): DesignationOption => ({
                      id: Number(
                        designation.id,
                      ),

                      name: String(
                        designation.name ??
                          "",
                      ).trim(),

                      depart_id:
                        Number(
                          designation.depart_id,
                        ),

                      department_name:
                        designation.department_name ??
                        null,
                    }),
                  )
                  .filter(
                    (
                      designation,
                    ) =>
                      Number.isFinite(
                        designation.id,
                      ) &&
                      Number.isFinite(
                        designation.depart_id,
                      ) &&
                      designation.name
                        .length >
                        0,
                  )
              : [];

          console.log(
            "Departments API Response:",
            departmentData,
          );

          console.log(
            "Designations API Response:",
            designationData,
          );

          setDepartments(
            departmentData,
          );

          setDesignations(
            designationData,
          );

          /*
           * IMPORTANT:
           *
           * KRA is loaded only after
           * Department and Designation
           * master data is available.
           */

          await loadKraRecords(
            departmentData,
            designationData,
          );
        } catch (error) {
          if (
            !isMounted
          ) {
            return;
          }

          console.error(
            "Failed to load Department/Designation/KRA data:",
            error,
          );
        }
      };

    void loadAllMasterData();

    return () => {
      isMounted =
        false;
    };

    // loadKraRecords intentionally excluded
    // because it is a function declared inside
    // this component and the initial load must
    // happen only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     FILTERED DATA
     ======================================================= */

  const filteredData =
    useMemo<
      KRAMasterEntry[]
    >(
      () => {
        const selectedDepartment =
          appliedFilters.department
            .trim()
            .toLowerCase();

        const selectedDesignation =
          appliedFilters.designation
            .trim()
            .toLowerCase();

        return data.filter(
          (
            entry,
          ) => {
            const entryDepartment =
              String(
                entry.department ??
                  "",
              )
                .trim()
                .toLowerCase();

            const entryDesignation =
              String(
                entry.designation ??
                  "",
              )
                .trim()
                .toLowerCase();

            const departmentMatches =
              selectedDepartment ===
                "" ||
              entryDepartment ===
                selectedDepartment;

            const designationMatches =
              selectedDesignation ===
                "" ||
              entryDesignation ===
                selectedDesignation;

            return (
              departmentMatches &&
              designationMatches
            );
          },
        );
      },
      [
        data,
        appliedFilters,
      ],
    );

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
          PAGE_SIZE,
      ),
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

  const paginatedData =
    useMemo<
      KRAMasterEntry[]
    >(
      () => {
        const startIndex =
          (currentPage - 1) *
          PAGE_SIZE;

        const endIndex =
          startIndex +
          PAGE_SIZE;

        return filteredData.slice(
          startIndex,
          endIndex,
        );
      },
      [
        filteredData,
        currentPage,
      ],
    );

  const paginationItems =
    useMemo<
      PaginationItem[]
    >(
      () => {
        if (
          filteredData.length ===
          0
        ) {
          return [];
        }

        return getPaginationItems(
          currentPage,
          totalPages,
        );
      },
      [
        currentPage,
        totalPages,
        filteredData.length,
      ],
    );

  /* =======================================================
     PAGINATION DISPLAY
     ======================================================= */

  const startEntry =
    filteredData.length ===
    0
      ? 0
      : (currentPage - 1) *
          PAGE_SIZE +
        1;

  const endEntry =
    filteredData.length ===
    0
      ? 0
      : Math.min(
          currentPage *
            PAGE_SIZE,
          filteredData.length,
        );

  /* =======================================================
     SUMMARY
     ======================================================= */

  const currentDate =
    new Date();

  const currentYear =
    currentDate.getFullYear();

  const currentMonthIndex =
    currentDate.getMonth();

  const currentQuarterNumber =
    Math.floor(
      currentMonthIndex / 3,
    ) + 1;

  const currentQuarterStartMonth =
    currentQuarterNumber *
      3 -
    3;

  const currentQuarterEndMonth =
    currentQuarterStartMonth +
    2;

  const currentQuarterLabel =
    `Q${currentQuarterNumber} ${currentYear}`;

  const summaryStats =
    useMemo(
      () => {
        const total =
          data.length;

        const active =
          data.filter(
            (
              entry,
            ) =>
              entry.status ===
              "Active",
          ).length;

        const inactive =
          data.filter(
            (
              entry,
            ) =>
              entry.status ===
              "Inactive",
          ).length;

        const currentQuarter =
          data.filter(
            (
              entry,
            ) => {
              if (
                entry.year !==
                currentYear
              ) {
                return false;
              }

              const fromMonthIndex =
                MONTHS.indexOf(
                  entry.fromMonth,
                );

              const toMonthIndex =
                MONTHS.indexOf(
                  entry.toMonth,
                );

              if (
                fromMonthIndex ===
                  -1 ||
                toMonthIndex ===
                  -1
              ) {
                return false;
              }

              return (
                fromMonthIndex <=
                  currentQuarterEndMonth &&
                toMonthIndex >=
                  currentQuarterStartMonth
              );
            },
          ).length;

        return {
          total,
          active,
          inactive,
          currentQuarter,
        };
      },
      [
        data,
        currentYear,
        currentQuarterStartMonth,
        currentQuarterEndMonth,
      ],
    );

  const activePercentage =
    summaryStats.total >
    0
      ? Math.round(
          (summaryStats.active /
            summaryStats.total) *
            100,
        )
      : 0;

  const inactivePercentage =
    summaryStats.total >
    0
      ? Math.round(
          (summaryStats.inactive /
            summaryStats.total) *
            100,
        )
      : 0;

  /* =======================================================
     ADD
     ======================================================= */

  const handleAdd =
    (): void => {
      setEditingEntry(
        null,
      );

      setIsModalOpen(
        true,
      );
    };

  /* =======================================================
     EDIT
     ======================================================= */

  const handleEdit = (
    entry: KRAMasterEntry,
  ): void => {
    setEditingEntry(
      entry,
    );

    setIsModalOpen(
      true,
    );
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete =
    async (
      id: string,
    ): Promise<void> => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this KRA entry?",
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        await kraService.delete(
          Number(id),
        );

        await loadKraRecords(
          departments,
          designations,
        );

        setCurrentPage(
          1,
        );
      } catch (error) {
        console.error(
          "Failed to delete KRA Master record:",
          error,
        );

        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to delete KRA Master record.",
        );
      }
    };

  /* =======================================================
     MODAL CLOSE
     ======================================================= */

  const handleCloseModal =
    (): void => {
      setIsModalOpen(
        false,
      );

      setEditingEntry(
        null,
      );
    };

  /* =======================================================
     SAVE
     ======================================================= */

  const handleSave =
    async (
      entry: KRAMasterEntry,
    ): Promise<void> => {
      try {
        /* ==================================================
           MONTH VALIDATION
           ================================================== */

        const fromMonthIndex =
          MONTHS.indexOf(
            entry.fromMonth,
          );

        const toMonthIndex =
          MONTHS.indexOf(
            entry.toMonth,
          );

        if (
          fromMonthIndex ===
          -1
        ) {
          window.alert(
            "Invalid From Month selected.",
          );

          return;
        }

        if (
          toMonthIndex ===
          -1
        ) {
          window.alert(
            "Invalid To Month selected.",
          );

          return;
        }

        /* ==================================================
           FIND DEPARTMENT
           ================================================== */

        const selectedDepartment =
          departments.find(
            (
              department,
            ) =>
              department.name
                .trim()
                .toLowerCase() ===
              entry.department
                .trim()
                .toLowerCase(),
          );

        if (
          !selectedDepartment
        ) {
          window.alert(
            "Please select a valid Department.",
          );

          return;
        }

        /* ==================================================
           FIND DESIGNATION
           ================================================== */

        const selectedDesignation =
          designations.find(
            (
              designation,
            ) =>
              designation.name
                .trim()
                .toLowerCase() ===
                (
                  entry.designation ??
                  ""
                )
                  .trim()
                  .toLowerCase() &&
              Number(
                designation.depart_id,
              ) ===
                Number(
                  selectedDepartment.id,
                ),
          );

        if (
          !selectedDesignation
        ) {
          window.alert(
            "Please select a valid Designation for the selected Department.",
          );

          return;
        }

        /* ==================================================
           PAYLOAD
           ================================================== */

        const payload = {
          department_id:
            Number(
              selectedDepartment.id,
            ),

          designation_id:
            Number(
              selectedDesignation.id,
            ),

          focused_area:
            entry.focusedArea.trim(),

          weightage:
            Number(
              entry.weightage,
            ),

          frommonth:
            fromMonthIndex + 1,

          tomonth:
            toMonthIndex + 1,

          year:
            Number(
              entry.year,
            ),

          status:
            entry.status ===
            "Active"
              ? 1
              : 0,
        };

        console.log(
          "KRA POST/PUT Payload:",
          payload,
        );

        /* ==================================================
           CREATE / UPDATE
           ================================================== */

        if (
          editingEntry
        ) {
          await kraService.update(
            Number(
              editingEntry.id,
            ),
            payload,
          );
        } else {
          await kraService.create(
            payload,
          );
        }

        /* ==================================================
           RELOAD
           ================================================== */

        await loadKraRecords(
          departments,
          designations,
        );

        handleCloseModal();
      } catch (error) {
        console.error(
          "Failed to save KRA Master record:",
          error,
        );

        window.alert(
          error instanceof Error
            ? error.message
            : "Unable to save KRA Master record.",
        );
      }
    };

  /* =======================================================
     SEARCH
     ======================================================= */

  const handleSearch = (
    filters: KraFilters,
  ): void => {
    setAppliedFilters({
      department:
        filters.department.trim(),

      designation:
        filters.designation.trim(),
    });

    setCurrentPage(
      1,
    );
  };

  /* =======================================================
     RESET
     ======================================================= */

  const handleReset =
    (): void => {
      setAppliedFilters({
        ...INITIAL_FILTERS,
      });

      setCurrentPage(
        1,
      );
    };

  /* =======================================================
     PAGE CHANGE
     ======================================================= */

  const handlePageChange =
    (
      pageNumber: number,
    ): void => {
      if (
        pageNumber < 1 ||
        pageNumber >
          totalPages ||
        pageNumber ===
          currentPage
      ) {
        return;
      }

      setCurrentPage(
        pageNumber,
      );
    };

  /* =======================================================
     PREVIOUS PAGE
     ======================================================= */

  const handlePreviousPage =
    (): void => {
      if (
        currentPage <= 1
      ) {
        return;
      }

      setCurrentPage(
        (
          previousPage,
        ) =>
          previousPage - 1,
      );
    };

  /* =======================================================
     NEXT PAGE
     ======================================================= */

  const handleNextPage =
    (): void => {
      if (
        currentPage >=
        totalPages
      ) {
        return;
      }

      setCurrentPage(
        (
          previousPage,
        ) =>
          previousPage + 1,
      );
    };

  /* =======================================================
     UI
     ======================================================= */

  return (
    <main className="kra-master-page">
      <div className="kra-master-content">

        {/* =================================================
            HEADER
            ================================================= */}

        <header className="kra-master-header">
          <Breadcrumb />
        </header>

        {/* =================================================
            SUMMARY
            ================================================= */}

        <section
          className="kra-summary-grid"
          aria-label="KRA summary"
        >
          <SummaryCard
            label="Total KRA"
            value={
              summaryStats.total
            }
            icon={
              <Target
                size={20}
                aria-hidden="true"
              />
            }
            trend="+12% from last quarter"
          />

          <SummaryCard
            label="Active"
            value={
              summaryStats.active
            }
            icon={
              <CheckCircle
                size={20}
                aria-hidden="true"
              />
            }
            trend={`${activePercentage}% of total`}
          />

          <SummaryCard
            label="Inactive"
            value={
              summaryStats.inactive
            }
            icon={
              <XCircle
                size={20}
                aria-hidden="true"
              />
            }
            trend={`${inactivePercentage}% of total`}
          />

          <SummaryCard
            label="Current Quarter"
            value={
              summaryStats.currentQuarter
            }
            icon={
              <Calendar
                size={20}
                aria-hidden="true"
              />
            }
            trend={
              currentQuarterLabel
            }
          />
        </section>

        {/* =================================================
            CONTENT
            ================================================= */}

        <section className="kra-content-panel">

          {/* ===============================================
              FILTER TOOLBAR
              =============================================== */}

          <FilterToolbar
            onAddClick={
              handleAdd
            }
            onSearch={
              handleSearch
            }
            onReset={
              handleReset
            }

            /*
             * IMPORTANT:
             * Pass complete objects.
             */

            departmentOptions={
              departments
            }

            designationOptions={
              designations
            }
          />

          {/* ===============================================
              TABLE
              =============================================== */}

          <div className="kra-table-container">
            <KraTable
              data={
                paginatedData
              }
              onEdit={
                handleEdit
              }
              onDelete={
                handleDelete
              }
            />
          </div>

          {/* ===============================================
              PAGINATION
              =============================================== */}

          <footer className="kra-pagination">

            <div className="kra-pagination-info">
              Showing{" "}
              <strong>
                {startEntry}
              </strong>{" "}
              to{" "}
              <strong>
                {endEntry}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredData.length}
              </strong>{" "}
              entries
            </div>

            {filteredData.length >
              0 && (
              <nav
                className="kra-pagination-controls"
                aria-label="KRA pagination"
              >

                {/* PREVIOUS */}

                <button
                  type="button"
                  className="kra-pagination-btn"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    currentPage ===
                    1
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>

                {/* PAGE NUMBERS */}

                {paginationItems.map(
                  (
                    item,
                    index,
                  ) => {
                    if (
                      item ===
                        "ellipsis-start" ||
                      item ===
                        "ellipsis-end"
                    ) {
                      return (
                        <span
                          key={`${item}-${index}`}
                          className="kra-pagination-dots"
                          aria-hidden="true"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive =
                      item ===
                      currentPage;

                    return (
                      <button
                        key={item}
                        type="button"
                        className={
                          isActive
                            ? "kra-pagination-btn kra-pagination-btn-active"
                            : "kra-pagination-btn"
                        }
                        onClick={() =>
                          handlePageChange(
                            item,
                          )
                        }
                        aria-current={
                          isActive
                            ? "page"
                            : undefined
                        }
                        aria-label={`Page ${item}`}
                      >
                        {item}
                      </button>
                    );
                  },
                )}

                {/* NEXT */}

                <button
                  type="button"
                  className="kra-pagination-btn"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>

              </nav>
            )}
          </footer>
        </section>
      </div>

      {/* ===================================================
          KRA MODAL
          =================================================== */}

      <KraModal
        isOpen={
          isModalOpen
        }
        onClose={
          handleCloseModal
        }
        onSave={
          handleSave
        }
        editData={
          editingEntry
        }
        departments={
          departments
        }
        designations={
          designations
        }
      />
    </main>
  );
};

export default KraMaster;