import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Loader2,
  Save,
  X,
} from "lucide-react";

import type { KraScore } from "./KraScoreTable";

import kraScoreService, {
  type ApplicableKRA,
  type KRAScoreEntry,
} from "../../services/kraScoreService";

import "./KraScoreModal.css";

/* =========================================================
   TYPES
   ========================================================= */

export type KraScoreModalMode =
  | "add"
  | "edit"
  | "view";

export interface KraParameter {
  id: number;
  focusedArea: string;
  weightage: number;
  selfRating: number | null;
  improvementArea: string;
}

export interface KraScoreFormData {
  fromMonth: string;
  toMonth: string;
  year: string;
  kraDate: string;
  selfScore: string;
  parameters: KraParameter[];
  totalWeightage: number;
  totalSelfRating: number;
  grade: string;
}

export interface KraScoreModalProps {
  isOpen: boolean;
  mode: KraScoreModalMode;
  selectedScore?: KraScore | null;
  parameters?: KraParameter[];

  onLoadApplicableKras: (
    year: number,
    fromMonth: number,
    toMonth: number,
  ) => Promise<ApplicableKRA[]>;

  onClose: () => void;

  onSubmit: (
    data: KraScoreFormData,
  ) => void | Promise<void>;
}

interface FormErrors {
  fromMonth?: string;
  toMonth?: string;
  year?: string;
  parameters?: string;
}

/* =========================================================
   MONTHS
   ========================================================= */

const MONTHS = [
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

type MonthName =
  (typeof MONTHS)[number];

const MIN_SELF_RATING = 1;

/* =========================================================
   INITIAL FORM
   ========================================================= */

interface InitialForm {
  fromMonth: string;
  toMonth: string;
  year: string;
}

const INITIAL_FORM: InitialForm = {
  fromMonth: "",
  toMonth: "",
  year: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

const extractMonthName = (
  value: string,
): string => {
  if (!value) {
    return "";
  }

  const monthName =
    value.trim().split(/\s+/)[0];

  return MONTHS.includes(
    monthName as MonthName,
  )
    ? monthName
    : "";
};

const getMonthNumber = (
  value: string,
): number => {
  if (!value) {
    return 0;
  }

  const index =
    MONTHS.findIndex(
      (month) =>
        month.toLowerCase() ===
        value.trim().toLowerCase(),
    );

  return index + 1;
};

/* =========================================================
   EXACT KRA PERIOD FILTER
   =========================================================
   
   IMPORTANT:
   
   The backend should already return only exact KRA records.
   This second check prevents an old/stale/overlapping API
   response from being displayed in the UI.

   Example:

   KRA Master:
       January -> September -> 2026

   User selects:
       February -> June -> 2026

   Result:
       January -> September KRA is NOT displayed.

   Only:
       February -> June -> 2026

   is accepted.
   ========================================================= */

const filterExactApplicableKras = (
  kras: ApplicableKRA[],
  selectedYear: number,
  selectedFromMonth: number,
  selectedToMonth: number,
): ApplicableKRA[] => {
  if (!Array.isArray(kras)) {
    return [];
  }

  return kras.filter((kra) => {
    const kraYear = Number(kra.year);
    const kraFromMonth =
      Number(kra.frommonth);
    const kraToMonth =
      Number(kra.tomonth);
    const kraStatus =
      Number(kra.status);

    return (
      Number.isInteger(kraYear) &&
      kraYear === selectedYear &&
      Number.isInteger(kraFromMonth) &&
      kraFromMonth ===
        selectedFromMonth &&
      Number.isInteger(kraToMonth) &&
      kraToMonth === selectedToMonth &&
      Number.isFinite(kraStatus) &&
      kraStatus !== 0
    );
  });
};

/* =========================================================
   NORMALIZE PARAMETERS
   ========================================================= */

const normalizeParameters = (
  parameters: KraParameter[],
): KraParameter[] => {
  return parameters.map(
    (parameter) => ({
      ...parameter,

      id: Number(
        parameter.id,
      ),

      weightage: Number(
        parameter.weightage ?? 0,
      ),

      selfRating:
        parameter.selfRating === null ||
        parameter.selfRating ===
          undefined
          ? null
          : Number(
              parameter.selfRating,
            ),

      improvementArea:
        parameter.improvementArea ??
        "",
    }),
  );
};

/* =========================================================
   TOTAL WEIGHTAGE
   ========================================================= */

const calculateTotalWeightage = (
  parameters: KraParameter[],
): number => {
  return Number(
    parameters
      .reduce(
        (
          total,
          parameter,
        ) => {
          const weightage =
            Number(
              parameter.weightage,
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
      )
      .toFixed(2),
  );
};

/* =========================================================
   TOTAL SELF RATING
   ========================================================= */

const calculateTotalSelfRating = (
  parameters: KraParameter[],
): number => {
  return Number(
    parameters
      .reduce(
        (
          total,
          parameter,
        ) => {
          const rating =
            Number(
              parameter.selfRating,
            );

          if (
            !Number.isFinite(
              rating,
            ) ||
            rating <
              MIN_SELF_RATING
          ) {
            return total;
          }

          return (
            total +
            rating
          );
        },
        0,
      )
      .toFixed(2),
  );
};

/* =========================================================
   GRADE
   ========================================================= */

const getGrade = (
  score: number,
): string => {
  if (score < 50) {
    return "Below 50% Not satisfactory";
  }

  if (score <= 80) {
    return ">50 to 80% Average performance";
  }

  if (score <= 100) {
    return ">80 to 100% Met Expectation";
  }

  return ">100% Exceeded Expectation";
};

const getGradeClass = (
  score: number,
): string => {
  if (score < 50) {
    return "kra-grade-below";
  }

  if (score <= 80) {
    return "kra-grade-average";
  }

  if (score <= 100) {
    return "kra-grade-met";
  }

  return "kra-grade-exceeded";
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraScoreModal: React.FC<
  KraScoreModalProps
> = ({
  isOpen,
  mode,
  selectedScore = null,
  parameters = [],
  onClose,
  onSubmit,
  onLoadApplicableKras,
}) => {
  /* =======================================================
     STATE
     ======================================================= */

  const [
    formData,
    setFormData,
  ] =
    useState<InitialForm>(
      INITIAL_FORM,
    );

  const [
    kraParameters,
    setKraParameters,
  ] =
    useState<KraParameter[]>(
      [],
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FormErrors>({});

  const [
    isLoadingApplicableKras,
    setIsLoadingApplicableKras,
  ] =
    useState(false);

  const [
    isLoadingExistingScore,
    setIsLoadingExistingScore,
  ] =
    useState(false);

  const [
    existingScoreForPeriod,
    setExistingScoreForPeriod,
  ] =
    useState<KRAScoreEntry | null>(
      null,
    );

  const [
    existingScoreWasIncomplete,
    setExistingScoreWasIncomplete,
  ] =
    useState(false);

  const [
    initiallyCompletedParameterIds,
    setInitiallyCompletedParameterIds,
  ] =
    useState<Set<number>>(
      new Set(),
    );

  const onLoadApplicableKrasRef =
    useRef(
      onLoadApplicableKras,
    );

  useEffect(() => {
    onLoadApplicableKrasRef.current =
      onLoadApplicableKras;
  }, [
    onLoadApplicableKras,
  ]);

  /* =======================================================
     YEARS
     ======================================================= */

  const currentYear =
    new Date().getFullYear();

  const years =
    useMemo<number[]>(
      () =>
        Array.from(
          {
            length: 4,
          },
          (_, index) =>
            currentYear +
            index,
        ),
      [currentYear],
    );

  const displayYears =
    useMemo<number[]>(
      () => {
        const configuredYears =
          [...years];

        if (
          selectedScore &&
          Number.isInteger(
            Number(
              selectedScore.year,
            ),
          )
        ) {
          const selectedYear =
            Number(
              selectedScore.year,
            );

          if (
            !configuredYears.includes(
              selectedYear,
            )
          ) {
            configuredYears.push(
              selectedYear,
            );
          }
        }

        return configuredYears.sort(
          (a, b) => a - b,
        );
      },
      [
        years,
        selectedScore,
      ],
    );

  /* =======================================================
     MODES
     ======================================================= */

  const isViewMode =
    mode === "view";

  const isEditMode =
    mode === "edit";

  const isExistingPeriod =
    Boolean(
      existingScoreForPeriod,
    );

  const isReadOnly =
    isViewMode ||
    isEditMode;

  /* =======================================================
     PARAMETER READONLY
     ======================================================= */

  const isParameterReadOnly = (
    parameter: KraParameter,
  ): boolean => {
    if (
      isViewMode ||
      isEditMode
    ) {
      return true;
    }

    if (
      !isExistingPeriod
    ) {
      return false;
    }

    return initiallyCompletedParameterIds.has(
      Number(
        parameter.id,
      ),
    );
  };

  /* =======================================================
     EXISTING PARAMETER STATUS
     ======================================================= */

  const hasIncompleteExistingParameters =
    isExistingPeriod &&
    kraParameters.some(
      (parameter) =>
        parameter.selfRating ===
          null ||
        parameter.selfRating ===
          undefined,
    );

  const isExistingScoreComplete =
    isExistingPeriod &&
    kraParameters.length > 0 &&
    kraParameters.every(
      (parameter) =>
        parameter.selfRating !==
          null &&
        parameter.selfRating !==
          undefined,
    );

  /* =======================================================
     SELECTED PERIOD
     ======================================================= */

  const selectedFromMonthNumber =
    getMonthNumber(
      formData.fromMonth,
    );

  

  const hasSelectedPeriod =
    Boolean(
      formData.year &&
      formData.fromMonth &&
      formData.toMonth,
    );

  const showParameterSection =
    hasSelectedPeriod;

  /* =======================================================
     TOTALS
     ======================================================= */

  const parameterRawScore =
    useMemo(
      () =>
        calculateTotalSelfRating(
          kraParameters,
        ),
      [kraParameters],
    );

  const authoritativeFinalScore =
  useMemo(
    () => {
      if (
        kraParameters.length > 0
      ) {
        return parameterRawScore;
      }

      if (
        (
          isViewMode ||
          isEditMode
        ) &&
        selectedScore &&
        Number.isFinite(
          Number(
            selectedScore.selfScore,
          ),
        )
      ) {
        return Number(
          selectedScore.selfScore,
        );
      }

      return 0;
    },
    [
      isViewMode,
      isEditMode,
      isExistingPeriod,
      kraParameters.length,
      parameterRawScore,
      selectedScore,
    ],
  );

  const totalWeightage =
    useMemo(
      () =>
        calculateTotalWeightage(
          kraParameters,
        ),
      [kraParameters],
    );

  const totalSelfRating =
    useMemo(
      () =>
        calculateTotalSelfRating(
          kraParameters,
        ),
      [kraParameters],
    );

  const gradeScore =
    isViewMode ||
    isEditMode ||
    isExistingPeriod
      ? authoritativeFinalScore
      : totalSelfRating;

  const grade =
    getGrade(
      gradeScore,
    );

  const gradeClass =
    getGradeClass(
      gradeScore,
    );

  /* =======================================================
     INITIALIZE MODAL
     ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setErrors({});
    setIsLoadingApplicableKras(
      false,
    );
    setIsLoadingExistingScore(
      false,
    );
    setExistingScoreForPeriod(
      null,
    );
    setExistingScoreWasIncomplete(
      false,
    );
    setInitiallyCompletedParameterIds(
      new Set(),
    );

    if (
      selectedScore &&
      (
        mode === "edit" ||
        mode === "view"
      )
    ) {
      setFormData({
        fromMonth:
          extractMonthName(
            selectedScore.fromMonth,
          ),
        toMonth:
          extractMonthName(
            selectedScore.toMonth,
          ),
        year:
          selectedScore.year.toString(),
      });

      setKraParameters(
        normalizeParameters(
          parameters,
        ),
      );

      return;
    }

    setFormData(
      INITIAL_FORM,
    );

    setKraParameters([]);
  }, [
    isOpen,
    mode,
    selectedScore,
    parameters,
  ]);

  /* =======================================================
     CLOSE
     ======================================================= */

  const handleClose =
    useCallback(
      (): void => {
        setFormData(
          INITIAL_FORM,
        );

        setKraParameters([]);
        setErrors({});

        setIsLoadingApplicableKras(
          false,
        );

        setIsLoadingExistingScore(
          false,
        );

        setExistingScoreForPeriod(
          null,
        );

        setExistingScoreWasIncomplete(
          false,
        );

        setInitiallyCompletedParameterIds(
          new Set(),
        );

        onClose();
      },
      [onClose],
    );

  /* =======================================================
     BACK
     ======================================================= */

  const handleBackToPeriod =
    useCallback(
      (): void => {
        if (
          isViewMode ||
          isEditMode
        ) {
          handleClose();
          return;
        }

        setFormData(
          (previous) => ({
            ...previous,
            fromMonth: "",
            toMonth: "",
            year: "",
          }),
        );

        setKraParameters([]);

        setExistingScoreForPeriod(
          null,
        );

        setExistingScoreWasIncomplete(
          false,
        );

        setInitiallyCompletedParameterIds(
          new Set(),
        );

        setErrors({});
      },
      [
        handleClose,
        isViewMode,
        isEditMode,
      ],
    );

  /* =======================================================
     ESCAPE + BODY SCROLL
     ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleEscape = (
      event: KeyboardEvent,
    ): void => {
      if (
        event.key === "Escape"
      ) {
        handleClose();
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

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    isOpen,
    handleClose,
  ]);

  /* =======================================================
     PERIOD CHANGE
     ======================================================= */

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    if (
      isViewMode ||
      isEditMode
    ) {
      return;
    }

    const {
      name,
      value,
    } = event.target;

    setExistingScoreForPeriod(
      null,
    );

    setExistingScoreWasIncomplete(
      false,
    );

    setInitiallyCompletedParameterIds(
      new Set(),
    );

    setKraParameters([]);

    setErrors(
      (previous) => ({
        ...previous,
        [name]: undefined,
        parameters:
          undefined,
      }),
    );

    if (
      name === "year"
    ) {
      setFormData(
        (previous) => ({
          ...previous,
          year: value,
        }),
      );

      return;
    }

    if (
      name === "fromMonth"
    ) {
      setFormData(
        (previous) => ({
          ...previous,
          fromMonth: value,
          toMonth: "",
        }),
      );

      return;
    }

    if (
      name === "toMonth"
    ) {
      setFormData(
        (previous) => ({
          ...previous,
          toMonth: value,
        }),
      );
    }
  };

  /* =======================================================
     LOAD EXACT KRA
     ======================================================= */

  useEffect(() => {
    if (
      !isOpen ||
      isViewMode ||
      isEditMode
    ) {
      return undefined;
    }

    if (
      !formData.year ||
      !formData.fromMonth ||
      !formData.toMonth
    ) {
      setKraParameters([]);
      setExistingScoreForPeriod(
        null,
      );
      setExistingScoreWasIncomplete(
        false,
      );
      setInitiallyCompletedParameterIds(
        new Set(),
      );
      setIsLoadingApplicableKras(
        false,
      );
      setIsLoadingExistingScore(
        false,
      );

      return undefined;
    }

    const year =
      Number(
        formData.year,
      );

    const fromMonth =
      getMonthNumber(
        formData.fromMonth,
      );

    const toMonth =
      getMonthNumber(
        formData.toMonth,
      );

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100 ||
      fromMonth < 1 ||
      fromMonth > 12 ||
      toMonth < 1 ||
      toMonth > 12
    ) {
      return undefined;
    }

    if (
      fromMonth >
      toMonth
    ) {
      setKraParameters([]);
      setExistingScoreForPeriod(
        null,
      );
      setExistingScoreWasIncomplete(
        false,
      );
      setInitiallyCompletedParameterIds(
        new Set(),
      );

      setErrors(
        (previous) => ({
          ...previous,
          parameters:
            "To month cannot be earlier than from month.",
        }),
      );

      return undefined;
    }

    let cancelled =
      false;

    const loadKraData =
      async (): Promise<void> => {
        try {
          setIsLoadingApplicableKras(
            true,
          );

          setIsLoadingExistingScore(
            true,
          );

          setExistingScoreForPeriod(
            null,
          );

          setExistingScoreWasIncomplete(
            false,
          );

          setInitiallyCompletedParameterIds(
            new Set(),
          );

          setKraParameters([]);

          setErrors(
            (previous) => ({
              ...previous,
              parameters:
                undefined,
            }),
          );

          /* =================================================
             1. API CALL FOR EXACT PERIOD
             ================================================= */

          const apiApplicableKras =
            await onLoadApplicableKrasRef.current(
              year,
              fromMonth,
              toMonth,
            );

          if (cancelled) {
            return;
          }

          /* =================================================
             2. DEFENSIVE EXACT PERIOD FILTER
             ================================================= */

          const applicableKras =
            filterExactApplicableKras(
              apiApplicableKras,
              year,
              fromMonth,
              toMonth,
            );

          /* =================================================
             3. NO EXACT KRA
             ================================================= */

          if (
            applicableKras.length ===
            0
          ) {
            setKraParameters([]);

            setExistingScoreForPeriod(
              null,
            );

            setExistingScoreWasIncomplete(
              false,
            );

            setInitiallyCompletedParameterIds(
              new Set(),
            );

            setErrors(
              (previous) => ({
                ...previous,
                parameters:
                  "No KRA parameters are defined for the selected period.",
              }),
            );

            return;
          }

          /* =================================================
             4. LOAD EMPLOYEE SCORES
             ================================================= */

          const existingScores =
            await kraScoreService.getMyScores(
              0,
              100,
            );

          if (cancelled) {
            return;
          }

          /* =================================================
             5. EXACT EMPLOYEE SCORE MATCH
             ================================================= */

          const existingScore =
            existingScores.find(
              (score) =>
                Number(
                  score.frommonth,
                ) === fromMonth &&
                Number(
                  score.tomonth,
                ) === toMonth &&
                Number(
                  score.year,
                ) === year,
            ) ?? null;

          if (cancelled) {
            return;
          }

          /* =================================================
             6. LOAD COMPLETE SCORE DETAILS
             ================================================= */

          let scoreDetails =
            existingScore;

          if (
            existingScore &&
            (
              !Array.isArray(
                existingScore.parameters,
              ) ||
              existingScore.parameters
                .length === 0
            )
          ) {
            scoreDetails =
              await kraScoreService.getById(
                Number(
                  existingScore.id,
                ),
              );

            if (cancelled) {
              return;
            }
          }

          setExistingScoreForPeriod(
            scoreDetails,
          );

          /* =================================================
             7. EXISTING PARAMETER MAP
             ================================================= */

          const existingParameterMap =
            new Map<
              number,
              {
                selfScore:
                  number | null;
                improvementArea:
                  string;
              }
            >();

          if (
            scoreDetails &&
            Array.isArray(
              scoreDetails.parameters,
            )
          ) {
            scoreDetails.parameters.forEach(
              (parameter) => {
                const masterId =
                  Number(
                    parameter.master_id,
                  );

                if (
                  !Number.isInteger(
                    masterId,
                  ) ||
                  masterId <= 0
                ) {
                  return;
                }

                existingParameterMap.set(
                  masterId,
                  {
                    selfScore:
                      parameter.self_score ===
                        null ||
                      parameter.self_score ===
                        undefined
                        ? null
                        : Number(
                            parameter.self_score,
                          ),

                    improvementArea:
                      parameter.key_improvement_area ??
                      "",
                  },
                );
              },
            );
          }

          /* =================================================
             8. MERGE EXACT MASTER PARAMETERS
             ================================================= */

          const mappedParameters =
            applicableKras.map(
              (
                kra,
              ): KraParameter => {
                const masterId =
                  Number(
                    kra.id,
                  );

                const existingParameter =
                  existingParameterMap.get(
                    masterId,
                  );

                return {
                  id: masterId,

                  focusedArea:
                    kra.focused_area ??
                    "",

                  weightage:
                    Number(
                      kra.weightage ??
                        0,
                    ),

                  selfRating:
                    existingParameter
                      ?.selfScore ??
                    null,

                  improvementArea:
                    existingParameter
                      ?.improvementArea ??
                    "",
                };
              },
            );

          if (cancelled) {
            return;
          }

          /* =================================================
             9. LOCK COMPLETED PARAMETERS
             ================================================= */

          const initiallyCompletedIds =
            new Set<number>();

          mappedParameters.forEach(
            (parameter) => {
              if (
                parameter.selfRating !==
                  null &&
                parameter.selfRating !==
                  undefined
              ) {
                initiallyCompletedIds.add(
                  Number(
                    parameter.id,
                  ),
                );
              }
            },
          );

          setInitiallyCompletedParameterIds(
            initiallyCompletedIds,
          );

          /* =================================================
             10. EXISTING INCOMPLETE
             ================================================= */

          const hasBlankParameterOnLoad =
            mappedParameters.some(
              (parameter) =>
                parameter.selfRating ===
                  null ||
                parameter.selfRating ===
                  undefined,
            );

          setExistingScoreWasIncomplete(
            Boolean(
              scoreDetails,
            ) &&
              hasBlankParameterOnLoad,
          );

          /* =================================================
             11. SET PARAMETERS
             ================================================= */

          setKraParameters(
            mappedParameters,
          );

          /* =================================================
             12. EXISTING SCORE MESSAGE
             ================================================= */

          if (
            scoreDetails
          ) {
            setErrors(
              (previous) => ({
                ...previous,
                parameters:
                  hasBlankParameterOnLoad
                    ? "A KRA score already exists for the selected period. Completed KRA parameters are locked. Please complete the remaining blank parameters."
                    : "A KRA score already exists for the selected period. All KRA parameters are completed.",
              }),
            );
          } else {
            setErrors(
              (previous) => ({
                ...previous,
                parameters:
                  undefined,
              }),
            );
          }
        } catch (
          error
        ) {
          if (cancelled) {
            return;
          }

          setKraParameters([]);

          setExistingScoreForPeriod(
            null,
          );

          setExistingScoreWasIncomplete(
            false,
          );

          setInitiallyCompletedParameterIds(
            new Set(),
          );

          setErrors(
            (previous) => ({
              ...previous,
              parameters:
                error instanceof Error
                  ? error.message
                  : "Unable to load KRA parameters and existing score.",
            }),
          );
        } finally {
          if (!cancelled) {
            setIsLoadingApplicableKras(
              false,
            );

            setIsLoadingExistingScore(
              false,
            );
          }
        }
      };

    void loadKraData();

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    isViewMode,
    isEditMode,
    formData.year,
    formData.fromMonth,
    formData.toMonth,
  ]);

  /* =======================================================
     PARAMETER CHANGE
     ======================================================= */

  const handleParameterChange = (
    id: number,
    field:
      | "selfRating"
      | "improvementArea",
    value: string,
  ): void => {
    if (
      isViewMode ||
      isEditMode
    ) {
      return;
    }

    setKraParameters(
      (previous) =>
        previous.map(
          (parameter) => {
            if (
              parameter.id !==
              id
            ) {
              return parameter;
            }

            if (
              isExistingPeriod &&
              initiallyCompletedParameterIds.has(
                Number(
                  parameter.id,
                ),
              )
            ) {
              return parameter;
            }

            if (
              field ===
              "selfRating"
            ) {
              if (
                value.trim() ===
                ""
              ) {
                return {
                  ...parameter,
                  selfRating:
                    null,
                };
              }

              const numericValue =
                Number(
                  value,
                );

              if (
                !Number.isFinite(
                  numericValue,
                )
              ) {
                return {
                  ...parameter,
                  selfRating:
                    null,
                };
              }

              const maximumRating =
                Number(
                  parameter.weightage,
                );

              if (
                numericValue <
                MIN_SELF_RATING
              ) {
                return {
                  ...parameter,
                  selfRating:
                    MIN_SELF_RATING,
                };
              }

              if (
                Number.isFinite(
                  maximumRating,
                ) &&
                numericValue >
                  maximumRating
              ) {
                return {
                  ...parameter,
                  selfRating:
                    maximumRating,
                };
              }

              return {
                ...parameter,
                selfRating:
                  numericValue,
              };
            }

            return {
              ...parameter,
              improvementArea:
                value,
            };
          },
        ),
    );

    setErrors(
      (previous) => ({
        ...previous,
        parameters:
          undefined,
      }),
    );
  };

  /* =======================================================
     VALIDATION
     ======================================================= */

  const validateForm =
    (): boolean => {
      const validationErrors:
        FormErrors = {};

      if (
        !formData.fromMonth
      ) {
        validationErrors.fromMonth =
          "From month is required.";
      }

      if (
        !formData.toMonth
      ) {
        validationErrors.toMonth =
          "To month is required.";
      }

      if (
        !formData.year
      ) {
        validationErrors.year =
          "Year is required.";
      }

      if (
        formData.year &&
        formData.fromMonth &&
        formData.toMonth
      ) {
        const selectedYear =
          Number(
            formData.year,
          );

        const selectedFrom =
          getMonthNumber(
            formData.fromMonth,
          );

        const selectedTo =
          getMonthNumber(
            formData.toMonth,
          );

        if (
          !Number.isInteger(
            selectedYear,
          )
        ) {
          validationErrors.year =
            "Please select a valid year.";
        }

        if (
          selectedFrom >
          selectedTo
        ) {
          validationErrors.toMonth =
            "To month cannot be earlier than from month.";
        }
      }

      if (
        showParameterSection
      ) {
        if (
          isLoadingApplicableKras ||
          isLoadingExistingScore
        ) {
          validationErrors.parameters =
            "KRA parameters are still loading.";
        }

        if (
          kraParameters.length ===
            0 &&
          !isLoadingApplicableKras &&
          !isLoadingExistingScore
        ) {
          validationErrors.parameters =
            "No KRA parameters are defined for the selected period.";
        }

        const invalidWeightage =
          kraParameters.some(
            (parameter) => {
              const weightage =
                Number(
                  parameter.weightage,
                );

              return (
                !Number.isFinite(
                  weightage,
                ) ||
                weightage <= 0
              );
            },
          );

        if (
          invalidWeightage
        ) {
          validationErrors.parameters =
            "KRA weightage must be greater than 0.";
        }

        const missingRating =
          kraParameters.some(
            (parameter) =>
              parameter.selfRating ===
                null ||
              parameter.selfRating ===
                undefined,
          );

        if (
          missingRating
        ) {
          validationErrors.parameters =
            isExistingPeriod
              ? "Please complete all remaining blank KRA self ratings before saving."
              : "Self rating is required for every KRA parameter.";
        }

        const invalidRating =
          kraParameters.some(
            (parameter) => {
              const rating =
                Number(
                  parameter.selfRating,
                );

              const weightage =
                Number(
                  parameter.weightage,
                );

              if (
                !Number.isFinite(
                  rating,
                ) ||
                !Number.isFinite(
                  weightage,
                )
              ) {
                return true;
              }

              return (
                rating <
                  MIN_SELF_RATING ||
                rating >
                  weightage
              );
            },
          );

        if (
          invalidRating
        ) {
          validationErrors.parameters =
            "Self rating must be at least 1 and cannot exceed the KRA weightage.";
        }

        if (
          totalWeightage <=
          0
        ) {
          validationErrors.parameters =
            "Total KRA weightage must be greater than 0.";
        }

        if (
          totalSelfRating <=
          0
        ) {
          validationErrors.parameters =
            "Total self rating must be greater than 0.";
        }
      }

      setErrors(
        validationErrors,
      );

      return (
        Object.keys(
          validationErrors,
        ).length === 0
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
      isViewMode ||
      isEditMode
    ) {
      return;
    }

    if (
      isLoadingApplicableKras ||
      isLoadingExistingScore
    ) {
      return;
    }

    if (
      isExistingScoreComplete &&
      !existingScoreWasIncomplete
    ) {
      setErrors(
        (previous) => ({
          ...previous,
          parameters:
            "All KRA parameters for this period are already completed.",
        }),
      );

      return;
    }

    if (
      !hasSelectedPeriod
    ) {
      setErrors(
        (previous) => ({
          ...previous,
          parameters:
            "Please select From Month, To Month and Year.",
        }),
      );

      return;
    }

    if (
      !validateForm()
    ) {
      return;
    }

    const now =
      new Date();

    const currentDate =
      [
        now.getFullYear(),
        String(
          now.getMonth() + 1,
        ).padStart(
          2,
          "0",
        ),
        String(
          now.getDate(),
        ).padStart(
          2,
          "0",
        ),
      ].join("-");

    void onSubmit({
      fromMonth:
        formData.fromMonth,

      toMonth:
        formData.toMonth,

      year:
        formData.year,

      kraDate:
        currentDate,

      selfScore:
        totalSelfRating.toString(),

      parameters:
        kraParameters,

      totalWeightage:
        totalWeightage,

      totalSelfRating:
        totalSelfRating,

      grade:
        grade,
    });
  };

  /* =======================================================
     CLOSED
     ======================================================= */

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="kra-score-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <section
        className={[
          "kra-score-modal",
          `kra-score-modal--${mode}`,
        ]
          .filter(Boolean)
          .join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kra-score-modal-title"
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <header className="kra-score-modal-header">
          <div className="kra-score-modal-heading">
            <div
              className="kra-score-modal-heading-icon"
              aria-hidden="true"
            >
              <CalendarDays
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 id="kra-score-modal-title">
                {isViewMode ||
                isEditMode
                  ? "View KRA Score"
                  : "Add KRA Score"}
              </h2>

              <p>
                {isViewMode ||
                isEditMode
                  ? "View the KRA scores for the selected period."
                  : existingScoreForPeriod
                    ? hasIncompleteExistingParameters ||
                      existingScoreWasIncomplete
                      ? "A KRA score exists for this period. Complete the remaining blank KRA parameters."
                      : "A KRA score already exists and all parameters are completed."
                    : showParameterSection
                      ? isLoadingApplicableKras ||
                        isLoadingExistingScore
                        ? "Checking KRA parameters for the selected period."
                        : kraParameters.length >
                            0
                          ? "Enter KRA parameter scores for the selected period."
                          : "No KRA parameters are defined for the selected period."
                      : "Select From Month, To Month and Year to load the applicable KRA parameters."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="kra-score-modal-close"
            onClick={
              handleClose
            }
            aria-label="Close KRA Score modal"
          >
            <X
              size={19}
              strokeWidth={1.8}
            />
          </button>
        </header>

        {/* =================================================
            FORM
            ================================================= */}

        <form
          className="kra-score-modal-form"
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div className="kra-score-modal-body">

            {/* =================================================
                PERIOD
                ================================================= */}


              {/* FROM MONTH */}

              <div className="kra-score-field">
                <label htmlFor="kra-modal-from-month">
                  From Month
                  {!isReadOnly && (
                    <span>
                      *
                    </span>
                  )}
                </label>

                  <select
                    id="kra-modal-from-month"
                    name="fromMonth"
                    value={
                      formData.fromMonth
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isViewMode ||
                      isEditMode
                    }
                    className={
                      errors.fromMonth
                        ? "kra-score-input-error"
                        : ""
                    }
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

                {errors.fromMonth && (
                  <small role="alert">
                    {
                      errors.fromMonth
                    }
                  </small>
                )}
              </div>

              {/* TO MONTH */}

              <div className="kra-score-field">
                <label htmlFor="kra-modal-to-month">
                  To Month
                  {!isReadOnly && (
                    <span>
                      *
                    </span>
                  )}
                </label>

                  <select
                    id="kra-modal-to-month"
                    name="toMonth"
                    value={
                      formData.toMonth
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isViewMode ||
                      isEditMode ||
                      !formData.fromMonth
                    }
                    className={
                      errors.toMonth
                        ? "kra-score-input-error"
                        : ""
                    }
                  >
                    <option value="">
                      Select Month
                    </option>

                    {MONTHS.map(
                      (
                        month,
                        index,
                      ) => {
                        const monthNumber =
                          index + 1;

                        if (
                          selectedFromMonthNumber >
                            0 &&
                          monthNumber <
                            selectedFromMonthNumber
                        ) {
                          return null;
                        }

                        return (
                          <option
                            key={month}
                            value={month}
                          >
                            {month}
                          </option>
                        );
                      },
                    )}
                  </select>

                {errors.toMonth && (
                  <small role="alert">
                    {
                      errors.toMonth
                    }
                  </small>
                )}
              </div>

              {/* YEAR */}

              <div className="kra-score-field">
                <label htmlFor="kra-modal-year">
                  Year
                  {!isReadOnly && (
                    <span>
                      *
                    </span>
                  )}
                </label>

                  <select
                    id="kra-modal-year"
                    name="year"
                    value={
                      formData.year
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      isViewMode ||
                      isEditMode
                    }
                    className={
                      errors.year
                        ? "kra-score-input-error"
                        : ""
                    }
                  >
                    <option value="">
                      Select Year
                    </option>

                    {displayYears.map(
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

                {errors.year && (
                  <small role="alert">
                    {
                      errors.year
                    }
                  </small>
                )}
              </div>
            {/* =================================================
                BEFORE PERIOD
                ================================================= */}

            {!showParameterSection && (
              <section className="kra-score-field-full kra-parameter-section">
                <div className="kra-parameter-loading">
                  <span>
                    Select From Month, To Month and Year to load the applicable KRA parameters.
                  </span>
                </div>
              </section>
            )}

            {/* =================================================
                PARAMETER SECTION
                ================================================= */}

            {showParameterSection && (
              <section className="kra-score-field-full kra-parameter-section">

                {/* LOADING */}

                {(
                  isLoadingApplicableKras ||
                  isLoadingExistingScore
                ) && (
                  <div
                    className="kra-parameter-loading"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2
                      size={18}
                      aria-hidden="true"
                    />

                    <span>
                      {isLoadingApplicableKras
                        ? "Checking KRA parameters for the selected period..."
                        : "Checking existing KRA score..."}
                    </span>
                  </div>
                )}

                {/* NO KRA */}

                {!isLoadingApplicableKras &&
                  !isLoadingExistingScore &&
                  kraParameters.length ===
                    0 &&
                  errors.parameters && (
                    <div
                      className="kra-parameter-error"
                      role="alert"
                    >
                      {
                        errors.parameters
                      }
                    </div>
                  )}

                {/* EXISTING SCORE */}

                {existingScoreForPeriod &&
                  !isLoadingApplicableKras &&
                  !isLoadingExistingScore && (
                    <div
                      className="kra-parameter-error"
                      role="alert"
                    >
                      {hasIncompleteExistingParameters ||
                      existingScoreWasIncomplete
                        ? "A KRA score already exists for the selected period. Completed KRA parameters are locked. Please complete the remaining blank parameters."
                        : "A KRA score already exists for the selected period. All KRA parameters are completed."}
                    </div>
                  )}

                {/* TABLE */}

                {kraParameters.length >
                  0 &&
                  !isLoadingApplicableKras &&
                  !isLoadingExistingScore && (
                    <div className="kra-parameter-table-wrapper">
                      <table className="kra-parameter-table">
                        <colgroup>
                          <col className="kra-col-focused" />
                          <col className="kra-col-weight" />
                          <col className="kra-col-rating" />
                          <col className="kra-col-improvement" />
                        </colgroup>

                        <thead>
                          <tr>
                            <th>
                              Focused Area
                              <span>
                                {" "}
                                (Organization Goals)
                              </span>
                            </th>

                            <th>
                              Weightage
                            </th>

                            <th>
                              Self Rating
                              <span>
                                {" "}
                                (1–Weightage)
                              </span>
                            </th>

                            <th>
                              Key Improvement Area
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {kraParameters.map(
                            (parameter) => {
                              const maximumRating =
                                Number(
                                  parameter.weightage,
                                );

                              const parameterReadOnly =
                                isParameterReadOnly(
                                  parameter,
                                );

                              return (
                                <tr
                                  key={
                                    parameter.id
                                  }
                                >
                                  <td className="kra-focused-area">
                                    {
                                      parameter.focusedArea
                                    }
                                  </td>

                                  <td>
                                    <div className="kra-weightage-value">
                                      {
                                        parameter.weightage
                                      }
                                    </div>
                                  </td>

                                  <td>
                                    <input
                                      type="number"
                                      min={
                                        MIN_SELF_RATING
                                      }
                                      max={
                                        Number.isFinite(
                                          maximumRating,
                                        )
                                          ? maximumRating
                                          : undefined
                                      }
                                      step={1}
                                      inputMode="numeric"
                                      value={
                                        parameter.selfRating ??
                                        ""
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        handleParameterChange(
                                          parameter.id,
                                          "selfRating",
                                          event.target.value,
                                        )
                                      }
                                      disabled={
                                        parameterReadOnly
                                      }
                                      readOnly={
                                        parameterReadOnly
                                      }
                                      className={[
                                        "kra-parameter-input",
                                        parameterReadOnly
                                          ? "kra-parameter-input--readonly"
                                          : "",
                                      ]
                                        .filter(
                                          Boolean,
                                        )
                                        .join(
                                          " ",
                                        )}
                                      aria-label={`Self rating for ${parameter.focusedArea}`}
                                    />

                                    {!parameterReadOnly && (
                                      <small className="kra-rating-help">
                                        Enter{" "}
                                        {
                                          MIN_SELF_RATING
                                        }
                                        –
                                        {
                                          parameter.weightage
                                        }
                                      </small>
                                    )}
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      value={
                                        parameter.improvementArea
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        handleParameterChange(
                                          parameter.id,
                                          "improvementArea",
                                          event.target.value,
                                        )
                                      }
                                      disabled={
                                        parameterReadOnly
                                      }
                                      readOnly={
                                        parameterReadOnly
                                      }
                                      className={[
                                        "kra-parameter-input",
                                        parameterReadOnly
                                          ? "kra-parameter-input--readonly"
                                          : "",
                                      ]
                                        .filter(
                                          Boolean,
                                        )
                                        .join(
                                          " ",
                                        )}
                                      aria-label={`Key improvement area for ${parameter.focusedArea}`}
                                    />
                                  </td>
                                </tr>
                              );
                            },
                          )}

                          {/* TOTAL */}

                          <tr className="kra-total-row">
                            <td>
                              Total
                            </td>

                            <td>
                              <div className="kra-total-value">
                                {
                                  totalWeightage
                                }
                              </div>
                            </td>

                            <td colSpan={2}>
                              <div className="kra-total-value">
                                {authoritativeFinalScore.toFixed(
                                  2,
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                {/* =================================================
                    GRADE
                    ================================================= */}

                {kraParameters.length >
                  0 &&
                  !isLoadingApplicableKras &&
                  !isLoadingExistingScore && (
                    <div className="kra-grade-section">
                      <div className="kra-grade-title">
                        Grade
                      </div>

                      <div className="kra-grade-list">
                        <span className="kra-grade-badge kra-grade-below">
                          Below 50% Not satisfactory
                        </span>

                        <span className="kra-grade-badge kra-grade-average">
                          &gt;50 to 80% Average performance
                        </span>

                        <span className="kra-grade-badge kra-grade-met">
                          &gt;80 to 100% Met Expectation
                        </span>

                        <span className="kra-grade-badge kra-grade-exceeded">
                          &gt;100% Exceeded Expectation
                        </span>
                      </div>

                      <div
                        className={[
                          "kra-current-grade",
                          gradeClass,
                        ].join(" ")}
                      >
                        {
                          grade
                        }
                      </div>
                    </div>
                  )}

                {/* ERROR WITH PARAMETERS */}

                {errors.parameters &&
                  kraParameters.length >
                    0 &&
                  !isLoadingApplicableKras &&
                  !isLoadingExistingScore && (
                    <div
                      className="kra-parameter-error"
                      role="alert"
                    >
                      {
                        errors.parameters
                      }
                    </div>
                  )}
              </section>
            )}
          </div>

          {/* =================================================
              FOOTER
              ================================================= */}

          <footer className="kra-score-modal-footer">
            <button
              type="button"
              className="kra-score-modal-cancel"
              onClick={
                showParameterSection
                  ? handleBackToPeriod
                  : handleClose
              }
            >
              {showParameterSection
                ? "Back"
                : "Cancel"}
            </button>

            {!isViewMode &&
              !isEditMode && (
                <button
                  type="submit"
                  className="kra-score-modal-submit"
                  disabled={
                    isLoadingApplicableKras ||
                    isLoadingExistingScore ||
                    !hasSelectedPeriod ||
                    kraParameters.length ===
                      0 ||
                    (
                      isExistingPeriod &&
                      isExistingScoreComplete &&
                      !existingScoreWasIncomplete
                    )
                  }
                  title={
                    isExistingPeriod &&
                    isExistingScoreComplete &&
                    !existingScoreWasIncomplete
                      ? "All KRA parameters are already completed."
                      : undefined
                  }
                >
                  {isLoadingApplicableKras ||
                  isLoadingExistingScore ? (
                    <>
                      <Loader2
                        size={17}
                        strokeWidth={1.9}
                          aria-hidden="true"
                      />
                      Loading...
                    </>
                  ) : isExistingPeriod &&
                    (
                      existingScoreWasIncomplete ||
                      hasIncompleteExistingParameters
                    ) ? (
                    <>
                      <Save
                        size={17}
                        strokeWidth={1.9}
                      />
                      Complete & Save
                    </>
                  ) : isExistingPeriod ? (
                    "Already Completed"
                  ) : (
                    <>
                      <Save
                        size={17}
                        strokeWidth={1.9}
                      />

                      {showParameterSection
                        ? "Add"
                        : "Save KRA Score"}
                    </>
                  )}
                </button>
              )}
          </footer>
        </form>
      </section>
    </div>
  );
};

export default KraScoreModal;