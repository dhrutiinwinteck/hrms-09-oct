/* =========================================================
   KRA MY PAGE
   Department + Designation Based KRA Flow
   ========================================================= */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import KraHeader from "./components/KraScore/KraHeader";

import KraOverview from "./components/KraScore/KraOverview";

import KraFilters, {
  type KraFilterValues,
} from "./components/KraScore/KraFilters";

import KraScoreTable, {
  type KraScore,
} from "./components/KraScore/KraScoreTable";

import KraScoreModal, {
  type KraScoreFormData,
  type KraScoreModalMode,
} from "./components/KraScore/KraScoreModal";

import kraScoreService, {
  type ApplicableKRA,
  type EmployeeKRAScoreRequest,
  type KRAScoreEntry,
} from "./services/kraScoreService";

import "./Kra.css";

/* =========================================================
   MONTHS
   ========================================================= */

const MONTH_NAMES = [
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
] as const;

/* =========================================================
   FILTERS
   ========================================================= */

const INITIAL_FILTERS: KraFilterValues = {
  fromMonth: "",
  toMonth: "",
  year: "",
};

/* =========================================================
   UI MODEL
   ========================================================= */

interface KraScoreWithEmployee
  extends KraScore {
  empId: number;

  fromMonthNumber: number;

  toMonthNumber: number;

  totalRmScore: number | null;

  totalTlScore: number | null;

  totalTpScore: number | null;

  rmRemark: string | null;

  tlRemark: string | null;

  topManagementRemark: string | null;
}

/* =========================================================
   KRA PARAMETER
   ========================================================= */

interface KraParameter {
  id: number;

  focusedArea: string;

  weightage: number;

  selfRating: number | null;

  improvementArea: string;
}

/* =========================================================
   MONTH NUMBER → NAME
   ========================================================= */

const formatMonthFromNumber = (
  month: number,
  year: number,
): string => {
  const monthIndex =
    Number(month) - 1;

  if (
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return `${month} ${year}`;
  }

  return `${MONTH_NAMES[monthIndex]} ${year}`;
};

/* =========================================================
   DATE FORMATTER
   ========================================================= */

const formatApiDate = (
  value: string | null,
): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  const month =
    MONTH_NAMES[
      date.getMonth()
    ].slice(0, 3);

  const year =
    date.getFullYear();

  return `${day} ${month} ${year}`;
};

/* =========================================================
   API → UI
   ========================================================= */

/**
 * Converts the backend KRA score response into
 * the UI model used by the KRA page.
 *
 * IMPORTANT BUSINESS DISPLAY RULE:
 *
 * The backend `total_self_score` is a normalized
 * score based on 100.
 *
 * The table must NOT display that normalized value.
 *
 * Instead, the table displays:
 *
 *     SUM(self_score) / SUM(weightage)
 *
 * Example:
 *
 *     Self ratings:
 *     20 + 77 + 80 + 55 = 232
 *
 *     Weightages:
 *     50 + 80 + 80 + 80 = 290
 *
 *     Table:
 *     232 / 290
 */
const mapApiScoreToUi = (
  item: KRAScoreEntry,
): KraScoreWithEmployee => {
  /* =======================================================
     BACKEND SCORE
     ======================================================= */

  /*
   * Keep the backend score internally for
   * compatibility with the existing page.
   *
   * IMPORTANT:
   *
   * This value is NOT displayed in the
   * Self Score table column.
   */
  const selfScore = Number(
    item.total_self_score ?? 0,
  );

  /* =======================================================
     KRA PARAMETERS
     ======================================================= */

  const scoreParameters =
    item.parameters ?? [];

  /* =======================================================
     TOTAL RAW SELF RATING
     ======================================================= */

  /*
   * Calculate actual employee marks.
   *
   * Example:
   *
   * 20 + 77 + 80 + 55
   *
   * = 232
   */
  const totalSelfRating =
    scoreParameters.reduce(
      (
        total,
        parameter,
      ) => {
        const rating =
          Number(
            parameter.self_score ??
              0,
          );

        if (
          !Number.isFinite(
            rating,
          ) ||
          rating < 0
        ) {
          return total;
        }

        return (
          total + rating
        );
      },
      0,
    );

  /* =======================================================
     TOTAL WEIGHTAGE
     ======================================================= */

  /*
   * Calculate the maximum possible marks.
   *
   * Example:
   *
   * 50 + 80 + 80 + 80
   *
   * = 290
   */
  const totalWeightage =
    scoreParameters.reduce(
      (
        total,
        parameter,
      ) => {
        const weightage =
          Number(
            parameter.weightage ??
              0,
          );

        if (
          !Number.isFinite(
            weightage,
          ) ||
          weightage <= 0
        ) {
          return total;
        }

        return (
          total + weightage
        );
      },
      0,
    );

  /* =======================================================
     RETURN UI MODEL
     ======================================================= */

  return {
    id: Number(
      item.id,
    ),

    empId: Number(
      item.emp_id,
    ),

    fromMonth:
      formatMonthFromNumber(
        Number(
          item.frommonth,
        ),
        Number(
          item.year,
        ),
      ),

    toMonth:
      formatMonthFromNumber(
        Number(
          item.tomonth,
        ),
        Number(
          item.year,
        ),
      ),

    fromMonthNumber:
      Number(
        item.frommonth,
      ),

    toMonthNumber:
      Number(
        item.tomonth,
      ),

    year: Number(
      item.year,
    ),

    kraDate:
      formatApiDate(
        item.kra_date,
      ),

    /*
     * Legacy/backend score.
     *
     * This remains available for the
     * existing overview logic.
     *
     * The table uses:
     *
     * totalSelfRating / totalWeightage
     *
     * instead.
     */
    selfScore,

    /*
     * ACTUAL RAW SELF MARKS
     *
     * Example:
     *
     * 20 + 77 + 80 + 55 = 232
     */
    totalSelfRating:
      Number(
        totalSelfRating.toFixed(
          2,
        ),
      ),

    /*
     * TOTAL POSSIBLE MARKS
     *
     * Example:
     *
     * 50 + 80 + 80 + 80 = 290
     */
    totalWeightage:
      Number(
        totalWeightage.toFixed(
          2,
        ),
      ),

    totalRmScore:
      item.total_rm_score,

    totalTlScore:
      item.total_tl_score,

    totalTpScore:
      item.total_tp_score,

    rmRemark:
      item.rm_remark,

    tlRemark:
      item.tl_remark,

    topManagementRemark:
      item.top_management_remark,
  };
};

/* =========================================================
   MONTH NAME → NUMBER
   ========================================================= */

const getMonthNumber = (
  value: string,
): number => {
  const index =
    MONTH_NAMES.findIndex(
      (month) =>
        month.toLowerCase() ===
        value
          .trim()
          .toLowerCase(),
    );

  return index + 1;
};

/* =========================================================
   COMPONENT
   ========================================================= */

const Kra: React.FC = () => {
  /* =======================================================
     DATA
     ======================================================= */

  const [
    kraScores,
    setKraScores,
  ] = useState<
    KraScoreWithEmployee[]
  >([]);

  /* =======================================================
     LOADING
     ======================================================= */

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* =======================================================
     FILTER
     ======================================================= */

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<KraFilterValues>(
      INITIAL_FILTERS,
    );

  /* =======================================================
     PAGINATION
     ======================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(5);

  /* =======================================================
     MODAL
     ======================================================= */

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    modalMode,
    setModalMode,
  ] =
    useState<KraScoreModalMode>(
      "add",
    );

  const [
    selectedScore,
    setSelectedScore,
  ] =
    useState<KraScoreWithEmployee | null>(
      null,
    );

  const [
    modalParameters,
    setModalParameters,
  ] = useState<KraParameter[]>(
    [],
  );

  /* =======================================================
     LOAD MY SCORES
     ======================================================= */

  const loadKraScores =
    useCallback(
      async (): Promise<void> => {
        try {
          setIsLoading(true);

          setErrorMessage("");

          const response =
            await kraScoreService.getMyScores(
              0,
              100,
            );

          const mappedData =
            response
              .map(
                mapApiScoreToUi,
              )
              .sort(
                (a, b) =>
                  b.id - a.id,
              );

          setKraScores(
            mappedData,
          );
        } catch (error) {
          const message =
            error instanceof
            Error
              ? error.message
              : "Unable to load your KRA scores.";

          setErrorMessage(
            message,
          );
        } finally {
          setIsLoading(false);
        }
      },
      [],
    );

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    void loadKraScores();
  }, [
    loadKraScores,
  ]);

  /* =======================================================
     FILTERED DATA
     ======================================================= */

  const filteredScores =
    useMemo(() => {
      return kraScores.filter(
        (score) => {
          /* YEAR */

          if (
            appliedFilters.year &&
            score.year.toString() !==
              appliedFilters.year
          ) {
            return false;
          }

          /* FROM MONTH */

          if (
            appliedFilters.fromMonth
          ) {
            const filterMonth =
              getMonthNumber(
                appliedFilters.fromMonth,
              );

            if (
              score.fromMonthNumber <
              filterMonth
            ) {
              return false;
            }
          }

          /* TO MONTH */

          if (
            appliedFilters.toMonth
          ) {
            const filterMonth =
              getMonthNumber(
                appliedFilters.toMonth,
              );

            if (
              score.toMonthNumber >
              filterMonth
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      kraScores,
      appliedFilters,
    ]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalRecords =
    filteredScores.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
          pageSize,
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

  const currentRecords =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        pageSize;

      return filteredScores.slice(
        startIndex,
        startIndex + pageSize,
      );
    }, [
      filteredScores,
      currentPage,
      pageSize,
    ]);

  const startEntry =
    totalRecords === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const endEntry =
    Math.min(
      currentPage *
        pageSize,
      totalRecords,
    );

  /* =======================================================
     OVERVIEW
     ======================================================= */

  const overviewData =
    useMemo(() => {
      const totalScores =
        kraScores.length;

      const pendingReviews =
        kraScores.filter(
          (score) =>
            score.totalRmScore ===
              null ||
            score.totalTlScore ===
              null ||
            score.totalTpScore ===
              null,
        ).length;

      const averageScore =
        totalScores === 0
          ? 0
          : Number(
              (
                kraScores.reduce(
                  (
                    total,
                    score,
                  ) =>
                    total +
                    score.selfScore,
                  0,
                ) /
                totalScores
              ).toFixed(1),
            );

      const kraOwners =
        totalScores > 0
          ? 1
          : 0;

      return {
        totalScores,
        pendingReviews,
        averageScore,
        kraOwners,
      };
    }, [
      kraScores,
    ]);

  /* =======================================================
     ADD
     ======================================================= */

  const handleAddClick =
    useCallback((): void => {
      setSelectedScore(
        null,
      );

      setModalMode("add");

      setErrorMessage("");

      setIsModalOpen(true);
    }, []);

  /* =======================================================
     VIEW
     ======================================================= */

  const handleView =
    useCallback(
      async (
        item: KraScore,
      ): Promise<void> => {
        try {
          setIsSubmitting(true);

          setErrorMessage("");

          /*
           * Always load the complete KRA
           * record.
           *
           * GET /score/{id} returns:
           *
           * - total_self_score
           * - parameters[]
           * - review scores
           * - remarks
           * - period
           */

          const score =
            await kraScoreService.getById(
              item.id,
            );

          /* ---------------------------------------------
             MAP PARAMETER ROWS
             --------------------------------------------- */

          const parameters: KraParameter[] =
            (
              score.parameters ??
              []
            ).map(
              (
                parameter,
              ): KraParameter => ({
                id: Number(
                  parameter.master_id,
                ),

                focusedArea:
                  parameter.focused_area ??
                  "",

                weightage:
                  Number(
                    parameter.weightage ??
                      0,
                  ),

                selfRating:
                  parameter.self_score !==
                  null
                    ? Number(
                        parameter.self_score,
                      )
                    : null,

                improvementArea:
                  parameter.key_improvement_area ??
                  "",
              }),
            );

          /* ---------------------------------------------
             CALCULATE RAW TOTALS
             --------------------------------------------- */

          const totalSelfRating =
            parameters.reduce(
              (
                total,
                parameter,
              ) => {
                const rating =
                  Number(
                    parameter.selfRating ??
                      0,
                  );

                if (
                  !Number.isFinite(
                    rating,
                  ) ||
                  rating < 0
                ) {
                  return total;
                }

                return (
                  total + rating
                );
              },
              0,
            );

          const totalWeightage =
            parameters.reduce(
              (
                total,
                parameter,
              ) => {
                const weightage =
                  Number(
                    parameter.weightage ??
                      0,
                  );

                if (
                  !Number.isFinite(
                    weightage,
                  ) ||
                  weightage <= 0
                ) {
                  return total;
                }

                return (
                  total +
                  weightage
                );
              },
              0,
            );

          /* ---------------------------------------------
             BACKEND SCORE
             --------------------------------------------- */

          const backendSelfScore =
            Number(
              score.total_self_score ??
                item.selfScore ??
                0,
            );

          /* ---------------------------------------------
             SELECTED SCORE
             --------------------------------------------- */

          const selected:
            KraScoreWithEmployee =
            {
              ...item,

              id: Number(
                score.id,
              ),

              empId: Number(
                score.emp_id,
              ),

              fromMonth:
                formatMonthFromNumber(
                  Number(
                    score.frommonth,
                  ),
                  Number(
                    score.year,
                  ),
                ),

              toMonth:
                formatMonthFromNumber(
                  Number(
                    score.tomonth,
                  ),
                  Number(
                    score.year,
                  ),
                ),

              fromMonthNumber:
                Number(
                  score.frommonth,
                ),

              toMonthNumber:
                Number(
                  score.tomonth,
                ),

              year: Number(
                score.year,
              ),

              kraDate:
                formatApiDate(
                  score.kra_date,
                ),

              /*
               * Keep backend normalized score
               * for existing compatibility.
               *
               * The modal itself displays the
               * raw parameter total.
               */
              selfScore:
                backendSelfScore,

              /*
               * Raw employee marks.
               */
              totalSelfRating:
                Number(
                  totalSelfRating.toFixed(
                    2,
                  ),
                ),

              /*
               * Maximum possible marks.
               */
              totalWeightage:
                Number(
                  totalWeightage.toFixed(
                    2,
                  ),
                ),

              totalRmScore:
                score.total_rm_score,

              totalTlScore:
                score.total_tl_score,

              totalTpScore:
                score.total_tp_score,

              rmRemark:
                score.rm_remark,

              tlRemark:
                score.tl_remark,

              topManagementRemark:
                score.top_management_remark,
            };

          setSelectedScore(
            selected,
          );

          setModalParameters(
            parameters,
          );

          setModalMode(
            "view",
          );

          setIsModalOpen(
            true,
          );
        } catch (error) {
          const message =
            error instanceof
            Error
              ? error.message
              : "Unable to load KRA score details.";

          setErrorMessage(
            message,
          );

          window.alert(
            message,
          );
        } finally {
          setIsSubmitting(
            false,
          );
        }
      },
      [],
    );

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete =
    useCallback(
      async (
        item: KraScore,
      ): Promise<void> => {
        const confirmed =
          window.confirm(
            `Are you sure you want to delete the KRA score for ${item.fromMonth} to ${item.toMonth} (${item.year})?`,
          );

        if (!confirmed) {
          return;
        }

        try {
          setIsSubmitting(true);

          setErrorMessage("");

          await kraScoreService.delete(
            item.id,
          );

          await loadKraScores();

          setCurrentPage(1);
        } catch (error) {
          const message =
            error instanceof
            Error
              ? error.message
              : "Unable to delete KRA score.";

          setErrorMessage(
            message,
          );

          window.alert(
            message,
          );
        } finally {
          setIsSubmitting(
            false,
          );
        }
      },
      [
        loadKraScores,
      ],
    );

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const handleCloseModal =
    useCallback((): void => {
      if (isSubmitting) {
        return;
      }

      setIsModalOpen(
        false,
      );

      setSelectedScore(
        null,
      );

      setModalMode("add");
    }, [
      isSubmitting,
    ]);

  /* =======================================================
     LOAD APPLICABLE KRA MASTER
     ======================================================= */

  const handleLoadApplicableKras =
    useCallback(
      async (
        year: number,
        fromMonth: number,
        toMonth: number,
      ): Promise<
        ApplicableKRA[]
      > => {
        return kraScoreService.getApplicableKras(
          year,
          fromMonth,
          toMonth,
        );
      },
      [],
    );

  /* =======================================================
     SUBMIT / UPDATE SELF SCORE
     ======================================================= */

  const handleModalSubmit =
    useCallback(
      async (
        formData: KraScoreFormData,
      ): Promise<void> => {
        if (isSubmitting) {
          return;
        }

        try {
          setIsSubmitting(true); 

          setErrorMessage("");

          const year =
            Number(
              formData.year,
            );

          const frommonth =
            getMonthNumber(
              formData.fromMonth,
            );

          const tomonth =
            getMonthNumber(
              formData.toMonth,
            );

          /* ---------------------------------------------
             VALIDATE PERIOD
             --------------------------------------------- */

          if (
            !Number.isInteger(
              year,
            ) ||
            year <= 0
          ) {
            throw new Error(
              "Invalid KRA year.",
            );
          }

          if (
            frommonth < 1 ||
            frommonth > 12
          ) {
            throw new Error(
              "Invalid From Month.",
            );
          }

          if (
            tomonth < 1 ||
            tomonth > 12
          ) {
            throw new Error(
              "Invalid To Month.",
            );
          }

          if (
            frommonth >
            tomonth
          ) {
            throw new Error(
              "From Month cannot be greater than To Month.",
            );
          }

          /* ---------------------------------------------
             ADD
             --------------------------------------------- */

          if (
            modalMode === "add"
          ) {
            if (
              !formData.parameters ||
              formData.parameters
                .length === 0
            ) {
              throw new Error(
                "No applicable KRA is available for the selected period.",
              );
            }

            const payload: EmployeeKRAScoreRequest =
              {
                frommonth,

                tomonth,

                year,

                kra_date:
                  formData.kraDate ||
                  null,

                items:
                  formData.parameters.map(
                    (
                      parameter,
                    ) => ({
                      master_id:
                        Number(
                          parameter.id,
                        ),

                      self_score:
                        Number(
                          parameter.selfRating,
                        ),

                      key_improvement_area:
                        parameter.improvementArea?.trim() ||
                        null,
                    }),
                  ),
              };

            /* ---------------------------------------------
               VALIDATE ITEMS
               --------------------------------------------- */

            const hasInvalidItem =
              payload.items.some(
                (item) =>
                  !Number.isInteger(
                    item.master_id,
                  ) ||
                  item.master_id <=
                    0 ||
                  !Number.isFinite(
                    item.self_score,
                  ) ||
                  item.self_score <
                    1 ||
                  item.self_score >
                    100,
              );

            if (
              hasInvalidItem
            ) {
              throw new Error(
                "One or more KRA self ratings are invalid.",
              );
            }

            /* ---------------------------------------------
               CREATE SELF SCORE
               --------------------------------------------- */

            await kraScoreService.submitSelfScore(
              payload,
            );
          }

          /* ---------------------------------------------
             EDIT
             --------------------------------------------- */

          if (
            modalMode ===
            "edit"
          ) {
            if (
              !selectedScore
            ) {
              throw new Error(
                "No KRA score selected for editing.",
              );
            }

            const totalSelfScore =
              Number(
                formData.totalSelfRating ??
                  formData.selfScore ??
                  0,
              );

            if (
              !Number.isFinite(
                totalSelfScore,
              ) ||
              totalSelfScore <
                0 ||
              totalSelfScore >
                100
            ) {
              throw new Error(
                "Invalid self score.",
              );
            }

            /*
             * Preserve the existing
             * legacy update endpoint.
             */
            const updatePayload =
              {
                emp_id:
                  selectedScore.empId,

                kra_date:
                  formData.kraDate ||
                  null,

                total_self_score:
                  totalSelfScore,

                total_rm_score:
                  selectedScore.totalRmScore,

                total_tl_score:
                  selectedScore.totalTlScore,

                total_tp_score:
                  selectedScore.totalTpScore,

                rm_remark:
                  selectedScore.rmRemark,

                tl_remark:
                  selectedScore.tlRemark,

                top_management_remark:
                  selectedScore.topManagementRemark,

                frommonth,

                tomonth,

                year,

                createdby: null,

                modifiedby: null,
              };

            await kraScoreService.update(
              selectedScore.id,
              updatePayload,
            );
          }

          /* ---------------------------------------------
             RELOAD
             --------------------------------------------- */

          await loadKraScores();

          /* ---------------------------------------------
             CLOSE
             --------------------------------------------- */

          setIsModalOpen(
            false,
          );

          setSelectedScore(
            null,
          );

          setModalMode("add");

          setCurrentPage(1);
        } catch (error) {
          const message =
            error instanceof
            Error
              ? error.message
              : "Unable to save KRA self score.";

          setErrorMessage(
            message,
          );

          window.alert(
            message,
          );
        } finally {
          setIsSubmitting(
            false,
          );
        }
      },
      [
        isSubmitting,
        loadKraScores,
        modalMode,
        selectedScore,
      ],
    );

  /* =======================================================
     APPLY FILTER
     ======================================================= */

  const handleApplyFilters =
    useCallback(
      (
        filters: KraFilterValues,
      ): void => {
        setAppliedFilters(
          filters,
        );

        setCurrentPage(1);
      },
      [],
    );

  /* =======================================================
     RESET FILTER
     ======================================================= */

  const handleResetFilters =
    useCallback((): void => {
      setAppliedFilters(
        INITIAL_FILTERS,
      );

      setCurrentPage(1);
    }, []);

  /* =======================================================
     PAGE SIZE
     ======================================================= */

  const handlePageSizeChange =
    useCallback(
      (
        newPageSize: number,
      ): void => {
        setPageSize(
          newPageSize,
        );

        setCurrentPage(1);
      },
      [],
    );

  /* =======================================================
     PREVIOUS
     ======================================================= */

  const handlePreviousPage =
    useCallback((): void => {
      setCurrentPage(
        (previousPage) =>
          Math.max(
            previousPage - 1,
            1,
          ),
      );
    }, []);

  /* =======================================================
     NEXT
     ======================================================= */

  const handleNextPage =
    useCallback((): void => {
      setCurrentPage(
        (previousPage) =>
          Math.min(
            previousPage + 1,
            totalPages,
          ),
      );
    }, [
      totalPages,
    ]);

  /* =======================================================
     PAGE CHANGE
     ======================================================= */

  const handlePageChange =
    useCallback(
      (page: number): void => {
        if (
          page < 1 ||
          page > totalPages
        ) {
          return;
        }

        setCurrentPage(page);
      },
      [
        totalPages,
      ],
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="kra-page">
      <div className="kra-page-container">
        {/* HEADER */}

        <KraHeader
          onAddClick={
            handleAddClick
          }
        />

        {/* ERROR */}

        {errorMessage && (
          <div
            className="kra-error-state"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {/* OVERVIEW */}

        <KraOverview
          totalScores={
            overviewData.totalScores
          }
          pendingReviews={
            overviewData.pendingReviews
          }
          averageScore={
            overviewData.averageScore
          }
          kraOwners={
            overviewData.kraOwners
          }
        />

        {/* FILTERS */}

        <KraFilters
          onApplyFilters={
            handleApplyFilters
          }
          onReset={
            handleResetFilters
          }
        />

        {/* SCORE LIST */}

        <div className="kra-score-list-section">
          {isLoading ? (
            <div
              className="kra-loading-state"
              role="status"
            >
              Loading your KRA scores...
            </div>
          ) : (
            <>
              <KraScoreTable
                data={
                  currentRecords
                }
                pageSize={
                  pageSize
                }
                currentPage={
                  currentPage
                }
                onPageSizeChange={
                  handlePageSizeChange
                }
                onView={
                  handleView
                }
                onDelete={
                  handleDelete
                }
              />

              {/* PAGINATION */}

              <div className="kra-page-pagination">
                <p className="kra-page-pagination-info">
                  Showing{" "}
                  {
                    startEntry
                  }{" "}
                  to{" "}
                  {
                    endEntry
                  }{" "}
                  of{" "}
                  {
                    totalRecords
                  }{" "}
                  entries
                </p>

                {totalRecords >
                  0 && (
                  <nav
                    className="kra-page-pagination-controls"
                    aria-label="KRA score pagination"
                  >
                    {/* PREVIOUS */}

                    <button
                      type="button"
                      className="kra-page-pagination-btn"
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
                        size={16}
                        strokeWidth={
                          1.8
                        }
                      />
                    </button>

                    {/* PAGE NUMBERS */}

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (
                        _,
                        index,
                      ) =>
                        index + 1,
                    ).map(
                      (
                        page,
                      ) => (
                        <button
                          key={
                            page
                          }
                          type="button"
                          className={`kra-page-pagination-btn ${
                            currentPage ===
                            page
                              ? "kra-page-pagination-btn--active"
                              : ""
                          }`}
                          onClick={() =>
                            handlePageChange(
                              page,
                            )
                          }
                          aria-current={
                            currentPage ===
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
                      className="kra-page-pagination-btn"
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
                        size={16}
                        strokeWidth={
                          1.8
                        }
                      />
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          KRA SCORE MODAL
          ===================================================== */}

      <KraScoreModal
        isOpen={
          isModalOpen
        }
        mode={
          modalMode
        }
        selectedScore={
          selectedScore
        }
        parameters={
          modalParameters
        }
        onClose={
          handleCloseModal
        }
        onSubmit={
          handleModalSubmit
        }
        onLoadApplicableKras={
          handleLoadApplicableKras
        }
      />
    </main>
  );
};

export default Kra;