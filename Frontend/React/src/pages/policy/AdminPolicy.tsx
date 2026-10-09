import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminPolicyHeader from "./components/admin-policy/AdminPolicyHeader";

import AdminPolicySummary from "./components/admin-policy/AdminPolicySummary";

import AdminPolicyFilters, {
  type PolicyFilterState,
} from "./components/admin-policy/AdminPolicyFilters";

import AdminPolicyModal, {
  type AddPolicyFormData,
} from "./components/admin-policy/AdminPolicyModal";

import AdminPolicyTable, {
  type PolicyItem,
} from "./components/admin-policy/AdminPolicyTable";

import { usePolicies } from "./hooks/usePolicies";

import type { Policy } from "./types/policy.types";

import axiosInstance from "../../services/axios/axiosInstance";

import "./AdminPolicy.css";

/* =========================================================
   DEFAULT FILTERS
   ========================================================= */

const DEFAULT_FILTERS: PolicyFilterState = {
  search: "",
  status: "all",
  createdBy: "all",
  sortBy: "recent",
};

/* =========================================================
   NORMALIZE TEXT
   ========================================================= */

const normalizeText = (
  value:
    | string
    | null
    | undefined
): string => {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase();
};

/* =========================================================
   FORMAT API DATE
   ========================================================= */

const formatPolicyDate = (
  value:
    | string
    | null
    | undefined
): string => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  const formattedDate =
    date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  const formattedTime =
    date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );

  return `${formattedDate}\n${formattedTime}`;
};

/* =========================================================
   PARSE POLICY DATE
   ========================================================= */

const parsePolicyDate = (
  value: string
): number => {
  if (!value) {
    return 0;
  }

  const normalizedValue =
    value
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const match =
    normalizedValue.match(
      /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s+(AM|PM)$/i
    );

  if (!match) {
    const fallbackDate =
      Date.parse(
        normalizedValue
      );

    return Number.isNaN(
      fallbackDate
    )
      ? 0
      : fallbackDate;
  }

  const [
    ,
    dayValue,
    monthValue,
    yearValue,
    hourValue,
    minuteValue,
    meridiemValue,
  ] = match;

  const monthMap:
    Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  const month =
    monthMap[
      monthValue.toLowerCase()
    ];

  if (
    month === undefined
  ) {
    return 0;
  }

  const day =
    Number(dayValue);

  const year =
    Number(yearValue);

  let hour =
    Number(hourValue);

  const minute =
    Number(minuteValue);

  const meridiem =
    meridiemValue.toUpperCase();

  if (
    meridiem === "PM" &&
    hour !== 12
  ) {
    hour += 12;
  }

  if (
    meridiem === "AM" &&
    hour === 12
  ) {
    hour = 0;
  }

  return new Date(
    year,
    month,
    day,
    hour,
    minute,
    0,
    0
  ).getTime();
};

/* =========================================================
   API DOCUMENT URL
   ========================================================= */

const resolveDocumentUrl = (
  documentUrl:
    | string
    | null
    | undefined
): string | null => {
  if (!documentUrl) {
    return null;
  }

  if (
    documentUrl.startsWith(
      "http://"
    ) ||
    documentUrl.startsWith(
      "https://"
    )
  ) {
    return documentUrl;
  }

  const apiBaseUrl =
    axiosInstance.defaults
      .baseURL;

  if (apiBaseUrl) {
    try {
      return new URL(
        documentUrl,
        apiBaseUrl.endsWith("/")
          ? apiBaseUrl
          : `${apiBaseUrl}/`
      ).toString();
    } catch {
      return documentUrl;
    }
  }

  return documentUrl;
};

/* =========================================================
   MAP API POLICY → EXISTING TABLE MODEL
   ========================================================= */

const mapPolicyToPolicyItem = (
  policy: Policy
): PolicyItem => {
  return {
    id: policy.id,

    name: policy.title,

    description:
      policy.description ??
      "",

    status:
      policy.status,

    createdBy:
      policy.createdByName ??
      (
        policy.createdBy !== null
          ? String(
              policy.createdBy
            )
          : "—"
      ),

    creatorRole:
      policy.creatorRole ??
      "—",

    lastUpdated:
      formatPolicyDate(
        policy.updatedAt
      ),

    documentUrl:
      resolveDocumentUrl(
        policy.documentUrl
      ) ??
      undefined,
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

const AdminPolicy: React.FC =
  () => {
    /* =====================================================
       API POLICIES
       ===================================================== */

    const {
      policies:
        apiPolicies,
      loading,
      error,
      loadPolicies,
      create,
      remove,
    } = usePolicies();

    /* =====================================================
       LOAD POLICIES ON PAGE LOAD
       ===================================================== */

    useEffect(() => {
      void loadPolicies();
    }, [loadPolicies]);

    /* =====================================================
       API → EXISTING TABLE MODEL
       ===================================================== */

    const policies =
      useMemo<
        PolicyItem[]
      >(
        () =>
          apiPolicies.map(
            mapPolicyToPolicyItem
          ),
        [apiPolicies]
      );

    /* =====================================================
       API ERROR
       ===================================================== */

    useEffect(() => {
      if (error) {
        console.error(
          "Policy API error:",
          error
        );
      }
    }, [error]);

    /* =====================================================
       LOADING
       ===================================================== */

    useEffect(() => {
      if (loading) {
        console.debug(
          "Loading policies..."
        );
      }
    }, [loading]);

    /* =====================================================
       FILTER STATE
       ===================================================== */

    const [
      filters,
      setFilters,
    ] =
      useState<PolicyFilterState>(
        {
          ...DEFAULT_FILTERS,
        }
      );

    const [
      appliedFilters,
      setAppliedFilters,
    ] =
      useState<PolicyFilterState>(
        {
          ...DEFAULT_FILTERS,
        }
      );

    /* =====================================================
       MODAL
       ===================================================== */

    const [
      isAddPolicyModalOpen,
      setIsAddPolicyModalOpen,
    ] =
      useState<boolean>(
        false
      );

    /* =====================================================
       PAGINATION
       ===================================================== */

    const [
      currentPage,
      setCurrentPage,
    ] =
      useState<number>(1);

    const [
      pageSize,
      setPageSize,
    ] =
      useState<number>(5);

    /* =====================================================
       CREATED BY OPTIONS
       ===================================================== */

    const creators =
      useMemo<string[]>(
        () => {
          const uniqueCreators =
            new Set<string>();

          policies.forEach(
            policy => {
              const creator =
                policy.createdBy.trim();

              if (creator) {
                uniqueCreators.add(
                  creator
                );
              }
            }
          );

          return Array.from(
            uniqueCreators
          ).sort(
            (
              firstCreator,
              secondCreator
            ) =>
              firstCreator.localeCompare(
                secondCreator,
                undefined,
                {
                  sensitivity:
                    "base",
                }
              )
          );
        },
        [policies]
      );

    /* =====================================================
       FILTER + SORT
       ===================================================== */

    const filteredPolicies =
      useMemo<
        PolicyItem[]
      >(
        () => {
          const searchTerm =
            normalizeText(
              appliedFilters.search
            );

          const selectedStatus =
            normalizeText(
              appliedFilters.status
            );

          const selectedCreator =
            normalizeText(
              appliedFilters.createdBy
            );

          const filtered =
            policies.filter(
              policy => {
                const policyName =
                  normalizeText(
                    policy.name
                  );

                const policyDescription =
                  normalizeText(
                    policy.description
                  );

                const policyCreator =
                  normalizeText(
                    policy.createdBy
                  );

                const policyCreatorRole =
                  normalizeText(
                    policy.creatorRole
                  );

                const policyStatus =
                  normalizeText(
                    policy.status
                  );

                const matchesSearch =
                  searchTerm === "" ||
                  policyName.includes(
                    searchTerm
                  ) ||
                  policyDescription.includes(
                    searchTerm
                  ) ||
                  policyCreator.includes(
                    searchTerm
                  ) ||
                  policyCreatorRole.includes(
                    searchTerm
                  ) ||
                  policyStatus.includes(
                    searchTerm
                  );

                const matchesStatus =
                  selectedStatus ===
                    "all" ||
                  policyStatus ===
                    selectedStatus;

                const matchesCreatedBy =
                  selectedCreator ===
                    "all" ||
                  policyCreator ===
                    selectedCreator;

                return (
                  matchesSearch &&
                  matchesStatus &&
                  matchesCreatedBy
                );
              }
            );

          const sorted =
            [...filtered];

          switch (
            appliedFilters.sortBy
          ) {
            case "name-asc":
              sorted.sort(
                (
                  firstPolicy,
                  secondPolicy
                ) =>
                  firstPolicy.name.localeCompare(
                    secondPolicy.name,
                    undefined,
                    {
                      sensitivity:
                        "base",
                    }
                  )
              );

              break;

            case "name-desc":
              sorted.sort(
                (
                  firstPolicy,
                  secondPolicy
                ) =>
                  secondPolicy.name.localeCompare(
                    firstPolicy.name,
                    undefined,
                    {
                      sensitivity:
                        "base",
                    }
                  )
              );

              break;

            case "oldest":
              sorted.sort(
                (
                  firstPolicy,
                  secondPolicy
                ) => {
                  const firstDate =
                    parsePolicyDate(
                      firstPolicy.lastUpdated
                    );

                  const secondDate =
                    parsePolicyDate(
                      secondPolicy.lastUpdated
                    );

                  return (
                    firstDate -
                    secondDate
                  );
                }
              );

              break;

            case "recent":
            default:
              sorted.sort(
                (
                  firstPolicy,
                  secondPolicy
                ) => {
                  const firstDate =
                    parsePolicyDate(
                      firstPolicy.lastUpdated
                    );

                  const secondDate =
                    parsePolicyDate(
                      secondPolicy.lastUpdated
                    );

                  return (
                    secondDate -
                    firstDate
                  );
                }
              );

              break;
          }

          return sorted;
        },
        [
          policies,
          appliedFilters,
        ]
      );

    /* =====================================================
       PAGINATION
       ===================================================== */

    const totalItems =
      filteredPolicies.length;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          totalItems /
            pageSize
        )
      );

    const safeCurrentPage =
      Math.min(
        Math.max(
          currentPage,
          1
        ),
        totalPages
      );

    useEffect(() => {
      if (
        currentPage !==
        safeCurrentPage
      ) {
        setCurrentPage(
          safeCurrentPage
        );
      }
    }, [
      currentPage,
      safeCurrentPage,
    ]);

    const paginatedPolicies =
      useMemo<
        PolicyItem[]
      >(
        () => {
          const startIndex =
            (safeCurrentPage -
              1) *
            pageSize;

          const endIndex =
            startIndex +
            pageSize;

          return filteredPolicies.slice(
            startIndex,
            endIndex
          );
        },
        [
          filteredPolicies,
          safeCurrentPage,
          pageSize,
        ]
      );

    /* =====================================================
       FILTER CHANGE
       ===================================================== */

    const handleFilterChange =
      useCallback(
        (
          newFilters:
            PolicyFilterState
        ): void => {
          setFilters(
            newFilters
          );

          setAppliedFilters({
            search:
              newFilters.search.trim(),

            status:
              newFilters.status,

            createdBy:
              newFilters.createdBy,

            sortBy:
              newFilters.sortBy,
          });

          setCurrentPage(1);
        },
        []
      );

    /* =====================================================
       APPLY FILTER
       ===================================================== */

    const handleApplyFilters =
      useCallback(
        (): void => {
          setAppliedFilters({
            search:
              filters.search.trim(),

            status:
              filters.status,

            createdBy:
              filters.createdBy,

            sortBy:
              filters.sortBy,
          });

          setCurrentPage(1);
        },
        [filters]
      );

    /* =====================================================
       RESET FILTER
       ===================================================== */

    const handleResetFilters =
      useCallback(
        (): void => {
          const resetFilters:
            PolicyFilterState = {
            ...DEFAULT_FILTERS,
          };

          setFilters(
            resetFilters
          );

          setAppliedFilters(
            resetFilters
          );

          setCurrentPage(1);
        },
        []
      );

    /* =====================================================
       OPEN ADD POLICY
       ===================================================== */

    const handleOpenAddPolicyModal =
      useCallback(
        (): void => {
          setIsAddPolicyModalOpen(
            true
          );
        },
        []
      );

    /* =====================================================
       CLOSE ADD POLICY
       ===================================================== */

    const handleCloseAddPolicyModal =
      useCallback(
        (): void => {
          setIsAddPolicyModalOpen(
            false
          );
        },
        []
      );

    /* =====================================================
       ADD POLICY
       ===================================================== */

    const handleAddPolicy =
      useCallback(
        async (
          formData:
            AddPolicyFormData
        ): Promise<void> => {
          const policyName =
            formData.policyName.trim();

          const description =
            formData.description.trim();

          if (!policyName) {
            throw new Error(
              "Policy name is required."
            );
          }

          if (!formData.file) {
            throw new Error(
              "Policy document is required."
            );
          }

          /*
           * IMPORTANT:
           * No URL.createObjectURL().
           *
           * The actual document is uploaded
           * to the backend.
           */
          await create(
            policyName,
            description,
            formData.file
          );

          /*
           * create() already reloads
           * policies from the API.
           */

          const resetFilters:
            PolicyFilterState = {
            ...DEFAULT_FILTERS,
          };

          setFilters(
            resetFilters
          );

          setAppliedFilters(
            resetFilters
          );

          setCurrentPage(1);

          setIsAddPolicyModalOpen(
            false
          );
        },
        [create]
      );

    /* =====================================================
       PAGE CHANGE
       ===================================================== */

    const handlePageChange =
      useCallback(
        (
          page: number
        ): void => {
          if (
            !Number.isInteger(
              page
            )
          ) {
            return;
          }

          if (
            page < 1 ||
            page > totalPages
          ) {
            return;
          }

          setCurrentPage(
            page
          );
        },
        [totalPages]
      );

    /* =====================================================
       PAGE SIZE CHANGE
       ===================================================== */

    const handlePageSizeChange =
      useCallback(
        (
          size: number
        ): void => {
          if (
            !Number.isInteger(
              size
            ) ||
            size <= 0
          ) {
            return;
          }

          setPageSize(
            size
          );

          setCurrentPage(1);
        },
        []
      );

    /* =====================================================
       VIEW POLICY
       ===================================================== */

   const handleViewPolicy = useCallback(
  (policy: PolicyItem): void => {
    if (!policy.documentUrl) {
      window.alert(
        `No document is currently attached to "${policy.name}".`
      );

      return;
    }

    const link = document.createElement("a");

    link.href = policy.documentUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  []
);

    /* =====================================================
       DELETE POLICY
       ===================================================== */

    const handleDeletePolicy =
      useCallback(
        async (
          policy: PolicyItem
        ): Promise<void> => {
          const confirmed =
            window.confirm(
              `Are you sure you want to delete "${policy.name}"?`
            );

          if (!confirmed) {
            return;
          }

          try {
            /*
             * Real DELETE API.
             */
            await remove(
              policy.id
            );
          } catch (
            error
          ) {
            console.error(
              "Failed to delete policy:",
              error
            );
          }
        },
        [remove]
      );

    /* =====================================================
       RENDER
       ===================================================== */

    return (
      <div className="admin-policy-page">
        <AdminPolicyHeader
          onAddPolicy={
            handleOpenAddPolicyModal
          }
        />

        <main className="admin-policy-page__content">
          {/* =================================================
              SUMMARY
          ================================================= */}

          <section
            className="admin-policy-page__summary"
            aria-label="Policy summary"
          >
            <AdminPolicySummary
              policies={
                apiPolicies
              }
            />
          </section>

          {/* =================================================
              POLICY MANAGEMENT
          ================================================= */}

          <section
            className="admin-policy-page__management"
            aria-label="Policy management"
          >
            <AdminPolicyFilters
              filters={
                filters
              }
              creators={
                creators
              }
              onChange={
                handleFilterChange
              }
              onApply={
                handleApplyFilters
              }
              onReset={
                handleResetFilters
              }
            />

            <AdminPolicyTable
              policies={
                paginatedPolicies
              }
              currentPage={
                safeCurrentPage
              }
              totalItems={
                totalItems
              }
              pageSize={
                pageSize
              }
              onPageChange={
                handlePageChange
              }
              onPageSizeChange={
                handlePageSizeChange
              }
              onView={
                handleViewPolicy
              }
              onDelete={
                handleDeletePolicy
              }
            />
          </section>
        </main>

        {/* ===================================================
            ADD POLICY MODAL
        =================================================== */}

        <AdminPolicyModal
          isOpen={
            isAddPolicyModalOpen
          }
          onClose={
            handleCloseAddPolicyModal
          }
          onSubmit={
            handleAddPolicy
          }
        />
      </div>
    );
  };

export default AdminPolicy;