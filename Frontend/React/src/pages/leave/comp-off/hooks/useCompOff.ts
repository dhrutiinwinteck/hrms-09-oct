// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';


// import type {
//   CompOffBalance,
//   CompOffFilters,
//   CompOffRequest,
//   CompOffSummary,
//   CreateCompOffRequest,
// } from '../types/compOff.types';
// import { compOffService } from '../services/compOff.service';
// import employeeProfileService from '@/pages/employees/services/employeeProfile.service';

// const PAGE_SIZE = 8;

// const DEFAULT_FILTERS: CompOffFilters = {
//   status: 'ALL',
//   dayType: 'ALL',
//   fromDate: '',
//   toDate: '',
//   search: '',
// };

// const DEFAULT_BALANCE: CompOffBalance = {
//   totalEarned: 0,
//   used: 0,
//   available: 0,
// };



// const getStatus = (
//   request: CompOffRequest,
// ): string => {
//   return String(
//     request.status ?? '',
//   )
//     .trim()
//     .toUpperCase();
// };

// const getDayType = (
//   request: CompOffRequest,
// ): string => {
//   return String(
//     request.dayType ?? '',
//   )
//     .trim()
//     .toUpperCase();
// };



// const matchesDateRange = (
//   request: CompOffRequest,
//   fromDate: string,
//   toDate: string,
// ): boolean => {
//   if (!fromDate && !toDate) {
//     return true;
//   }

//   const workedDate = new Date(
//     request.workedDate,
//   );

//   if (Number.isNaN(workedDate.getTime())) {
//     return false;
//   }

//   if (fromDate) {
//     const from = new Date(fromDate);

//     if (workedDate < from) {
//       return false;
//     }
//   }

//   if (toDate) {
//     const to = new Date(toDate);

//     to.setHours(
//       23,
//       59,
//       59,
//       999,
//     );

//     if (workedDate > to) {
//       return false;
//     }
//   }

//   return true;
// };

// const matchesSearch = (
//   request: CompOffRequest,
//   search: string,
// ): boolean => {
//   const normalizedSearch =
//     search.trim().toLowerCase();

//   if (!normalizedSearch) {
//     return true;
//   }

//   const searchableText = [
//     request.reason,
//     request.workedDate,
//     request.requestedOn,
//     request.compOffDate,
//     getStatus(request),
//     getDayType(request),
//   ]
//     .filter(Boolean)
//     .join(' ')
//     .toLowerCase();

//   return searchableText.includes(
//     normalizedSearch,
//   );
// };

// export const useCompOff = () => {
//   const [requests, setRequests] =
//     useState<CompOffRequest[]>([]);

//   const [filters, setFilters] =
//     useState<CompOffFilters>(
//       DEFAULT_FILTERS,
//     );

//   const [currentPage, setCurrentPage] =
//     useState(1);

//   const [loading, setLoading] =
//     useState(true);

//   const [submitting, setSubmitting] =
//     useState(false);

//   const [error, setError] =
//     useState('');

//   const [balance, setBalance] =
//     useState<CompOffBalance>(
//       DEFAULT_BALANCE,
//     );

//   const [isHR, setIsHR] =
//   useState(false);

// const [roleLoading, setRoleLoading] =
//   useState(true);

//   // const loadMyRequests =
//   //   useCallback(async () => {
//   //     setLoading(true);
//   //     setError('');

//   //     try {
//   //       /*
//   //        * IMPORTANT:
//   //        *
//   //        * This endpoint returns ONLY the
//   //        * logged-in employee's requests.
//   //        *
//   //        * Do NOT replace this with:
//   //        *
//   //        * /all
//   //        * /pending
//   //        */
//   //       const data =
//   //         await compOffService.getMyRequests();

//   //       setRequests(data);
//   //     } catch (requestError) {
//   //       setRequests([]);

//   //       setError(
//   //         requestError instanceof Error
//   //           ? requestError.message
//   //           : 'Unable to load Comp Off requests.',
//   //       );
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   }, []);

//   const loadRequests =
//   useCallback(async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const data = isHR
//         ? await compOffService.getAllRequests()
//         : await compOffService.getMyRequests();

//       setRequests(data);
//     } catch (requestError) {
//       setRequests([]);

//       setError(
//         requestError instanceof Error
//           ? requestError.message
//           : 'Unable to load Comp Off requests.',
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [isHR]);

//   useEffect(() => {
//   const loadUserRole = async () => {
//     try {
//       setRoleLoading(true);

//       const profile =
//         await employeeProfileService.getCurrentProfile();

//       const department =
//         String(
//           profile?.department ?? '',
//         )
//           .trim()
//           .toLowerCase();

//       const hr =
//         department === 'hr' ||
//         department === 'human resource' ||
//         department === 'human resources';

//       setIsHR(hr);
//     } catch (profileError) {
//       console.error(
//         'Unable to determine Comp Off user role:',
//         profileError,
//       );

//       setIsHR(false);
//     } finally {
//       setRoleLoading(false);
//     }
//   };

//   void loadUserRole();
// }, []);

//   // useEffect(() => {
//   //   void loadMyRequests();
//   // }, [loadMyRequests]);

//   useEffect(() => {
//   if (roleLoading) {
//     return;
//   }

//   void loadRequests();
// }, [
//   roleLoading,
//   loadRequests,
// ]);

//   const summary = useMemo<CompOffSummary>(
//     () => {
//       const approved = requests.filter(
//         (request) =>
//           getStatus(request) === 'APPROVED',
//       ).length;

//       const rejected = requests.filter(
//         (request) =>
//           getStatus(request) === 'REJECTED',
//       ).length;

//       const pending = requests.filter(
//         (request) =>
//           getStatus(request) === 'PENDING' ||
//           getStatus(request) === 'APPLIED',
//       ).length;

//       return {
//         totalRequests: requests.length,
//         approved,
//         pending,
//         rejected,
//       };
//     },
//     [requests],
//   );

//   const filteredRequests = useMemo(
//     () => {
//       return requests.filter((request) => {
//         const statusMatches =
//           filters.status === 'ALL' ||
//           getStatus(request) ===
//             filters.status;

//         const dayTypeMatches =
//           filters.dayType === 'ALL' ||
//           getDayType(request) ===
//             filters.dayType;

//         const dateMatches =
//           matchesDateRange(
//             request,
//             filters.fromDate,
//             filters.toDate,
//           );

//         const searchMatches =
//           matchesSearch(
//             request,
//             filters.search,
//           );

//         return (
//           statusMatches &&
//           dayTypeMatches &&
//           dateMatches &&
//           searchMatches
//         );
//       });
//     },
//     [requests, filters],
//   );

//   const totalPages = Math.max(
//     1,
//     Math.ceil(
//       filteredRequests.length /
//         PAGE_SIZE,
//     ),
//   );

//   const safeCurrentPage = Math.min(
//     currentPage,
//     totalPages,
//   );

//   const paginatedRequests =
//     useMemo(() => {
//       const start =
//         (safeCurrentPage - 1) *
//         PAGE_SIZE;

//       return filteredRequests.slice(
//         start,
//         start + PAGE_SIZE,
//       );
//     }, [
//       filteredRequests,
//       safeCurrentPage,
//     ]);

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   const updateFilters = useCallback(
//     (
//       values: Partial<CompOffFilters>,
//     ) => {
//       setFilters((previous) => ({
//         ...previous,
//         ...values,
//       }));

//       setCurrentPage(1);
//     },
//     [],
//   );

//   const resetFilters = useCallback(() => {
//     setFilters(DEFAULT_FILTERS);
//     setCurrentPage(1);
//   }, []);

//   const submitRequest = useCallback(
//     async (
//       values: CreateCompOffRequest,
//     ): Promise<void> => {
//       setSubmitting(true);
//       setError('');

//       try {
//         await compOffService.createRequest(
//           values,
//         );

//         /*
//          * Re-fetch from /my after creation.
//          *
//          * This guarantees the table represents
//          * the backend state instead of locally
//          * fabricating a request.
//          */
//         // await loadMyRequests();
//         await loadRequests();

//         setCurrentPage(1);
//       } catch (requestError) {
//         throw new Error(
//           requestError instanceof Error
//             ? requestError.message
//             : 'Unable to submit Comp Off request.',
//         );
//       } finally {
//         setSubmitting(false);
//       }
//     },
//     [loadRequests],
//   );

//   // const refresh = useCallback(
//   //   async () => {
//   //     await loadMyRequests();
//   //   },
//   //   [loadMyRequests],
//   // );
//   const refresh = useCallback(
//   async () => {
//     await loadRequests();
//   },
//   [loadRequests],
// );

//   /*
//    * Balance:
//    *
//    * If your /my endpoint already returns balance,
//    * map it here.
//    *
//    * Until the backend provides a dedicated employee
//    * balance endpoint, keep the balance safe instead
//    * of using /debug/balance in production.
//    */
//   useEffect(() => {
//     const approvedCount =
//       requests.filter(
//         (request) =>
//           getStatus(request) === 'APPROVED',
//       ).length;

//     setBalance({
//       totalEarned: approvedCount,
//       used: 0,
//       available: approvedCount,
//     });
//   }, [requests]);

//   return {
//     summary,
//     balance,
//     filters,
//     updateFilters,
//     resetFilters,
//     requests,
//     paginatedRequests,
//     filteredRequests,
//     currentPage: safeCurrentPage,
//     totalPages,
//     setCurrentPage,
//     loading,
//     submitting,
//     error,
//     submitRequest,
//     refresh,
//     isHR,
//     roleLoading,
//   };
// };

// export default useCompOff;





import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  CompOffBalance,
  CompOffFilters,
  CompOffRequest,
  CompOffSummary,
  CreateCompOffRequest,
} from '../types/compOff.types';

import { compOffService } from '../services/compOff.service';

import employeeProfileService from '@/pages/employees/services/employeeProfile.service';

const PAGE_SIZE = 8;

const DEFAULT_FILTERS: CompOffFilters = {
  status: 'ALL',
  dayType: 'ALL',
  fromDate: '',
  toDate: '',
  search: '',
};

const DEFAULT_BALANCE: CompOffBalance = {
  totalEarned: 0,
  used: 0,
  available: 0,
};

/* ============================================================
   HELPERS
============================================================ */

const getStatus = (
  request: CompOffRequest,
): string => {
  return String(
    request.status ?? '',
  )
    .trim()
    .toUpperCase();
};

const getDayType = (
  request: CompOffRequest,
): string => {
  return String(
    request.dayType ?? '',
  )
    .trim()
    .toUpperCase();
};

/* ============================================================
   DATE FILTER
============================================================ */

const matchesDateRange = (
  request: CompOffRequest,
  fromDate: string,
  toDate: string,
): boolean => {
  if (!fromDate && !toDate) {
    return true;
  }

  const workedDate = new Date(
    request.workedDate,
  );

  if (
    Number.isNaN(
      workedDate.getTime(),
    )
  ) {
    return false;
  }

  if (fromDate) {
    const from = new Date(
      fromDate,
    );

    if (workedDate < from) {
      return false;
    }
  }

  if (toDate) {
    const to = new Date(
      toDate,
    );

    to.setHours(
      23,
      59,
      59,
      999,
    );

    if (workedDate > to) {
      return false;
    }
  }

  return true;
};

/* ============================================================
   SEARCH FILTER
============================================================ */

const matchesSearch = (
  request: CompOffRequest,
  search: string,
): boolean => {
  const normalizedSearch =
    search
      .trim()
      .toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  /*
   * Employees:
   * - reason
   * - worked date
   * - requested date
   * - comp off date
   * - status
   * - day type
   *
   * HR:
   * - employee name
   * - employee code
   * - employee ID
   *
   * are also searchable.
   */

  const searchableText = [
    request.employeeName,
    request.employeeCode,
    request.employeeId,
    request.reason,
    request.workedDate,
    request.requestedOn,
    request.compOffDate,
    getStatus(request),
    getDayType(request),
  ]
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== '',
    )
    .map((value) =>
      String(value).toLowerCase(),
    )
    .join(' ');

  return searchableText.includes(
    normalizedSearch,
  );
};

/* ============================================================
   HOOK
============================================================ */

export const useCompOff = () => {
  const [
    requests,
    setRequests,
  ] = useState<CompOffRequest[]>(
    [],
  );

  const [
    filters,
    setFilters,
  ] = useState<CompOffFilters>(
    DEFAULT_FILTERS,
  );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    balance,
    setBalance,
  ] = useState<CompOffBalance>(
    DEFAULT_BALANCE,
  );

  /* ==========================================================
     HR / EMPLOYEE ROLE
  ========================================================== */

  const [
    isHR,
    setIsHR,
  ] = useState(false);

  const [
    roleLoading,
    setRoleLoading,
  ] = useState(true);

  /* ==========================================================
     LOAD USER ROLE
  ========================================================== */

  const loadUserRole =
    useCallback(
      async (): Promise<void> => {
        setRoleLoading(true);

        try {
          const profile =
            await employeeProfileService.getCurrentProfile();

          /*
           * ----------------------------------------------------
           * Department
           * ----------------------------------------------------
           */

          const department =
            String(
              profile?.department ?? '',
            )
              .trim()
              .toLowerCase();

          /*
           * ----------------------------------------------------
           * Designation
           * ----------------------------------------------------
           *
           * Important:
           *
           * In your HR profile the user can have a designation
           * such as:
           *
           * Human Resource Recruiter
           * HR Recruiter
           * Human Resources Manager
           *
           * Therefore checking only:
           *
           * department === 'human resource'
           *
           * is not sufficient.
           */

          const designation =
            String(
              profile?.designation ?? '',
            )
              .trim()
              .toLowerCase();

          /*
           * ----------------------------------------------------
           * Additional role-like values
           * ----------------------------------------------------
           *
           * These are optional defensive checks. They will not
           * affect your existing backend/API logic.
           */

          const profileWithRole =
            profile as typeof profile & {
              role?: unknown;
              role_name?: unknown;
              roleName?: unknown;
              user_role?: unknown;
              userRole?: unknown;
            };

          const role =
            String(
              profileWithRole?.role ?? '',
            )
              .trim()
              .toLowerCase();

          const roleName =
            String(
              profileWithRole?.role_name ??
                profileWithRole?.roleName ??
                profileWithRole?.user_role ??
                profileWithRole?.userRole ??
                '',
            )
              .trim()
              .toLowerCase();

          /*
           * ----------------------------------------------------
           * HR DETECTION
           * ----------------------------------------------------
           *
           * HR is true when ANY trusted profile field identifies
           * the user as Human Resource / HR.
           */

          const departmentIsHR =
            department === 'hr' ||
            department === 'human resource' ||
            department === 'human resources' ||
            department.includes(
              'human resource',
            ) ||
            department.includes(
              'human resources',
            );

          const designationIsHR =
            designation === 'hr' ||
            designation.includes(
              'human resource',
            ) ||
            designation.includes(
              'human resources',
            ) ||
            designation.includes(
              'hr recruiter',
            ) ||
            designation.includes(
              'hr manager',
            ) ||
            designation.includes(
              'hr executive',
            ) ||
            designation.includes(
              'hr administrator',
            );

          const roleIsHR =
            role === 'hr' ||
            role.includes(
              'human resource',
            ) ||
            role.includes(
              'human resources',
            );

          const roleNameIsHR =
            roleName === 'hr' ||
            roleName.includes(
              'human resource',
            ) ||
            roleName.includes(
              'human resources',
            );

          const hr =
            departmentIsHR ||
            designationIsHR ||
            roleIsHR ||
            roleNameIsHR;

          /*
           * ----------------------------------------------------
           * DEBUG LOG
           * ----------------------------------------------------
           *
           * Keep this temporarily so we can immediately verify
           * what the logged-in account is returning.
           */

          console.log(
            '================ COMP OFF ROLE ================',
          );

          console.log(
            'Employee Code:',
            profile?.emp_code,
          );

          console.log(
            'Department:',
            profile?.department,
          );

          console.log(
            'Designation:',
            profile?.designation,
          );

          console.log(
            'Role:',
            profileWithRole?.role,
          );

          console.log(
            'Role Name:',
            profileWithRole?.role_name ??
              profileWithRole?.roleName ??
              profileWithRole?.user_role ??
              profileWithRole?.userRole,
          );

          console.log(
            'Department Is HR:',
            departmentIsHR,
          );

          console.log(
            'Designation Is HR:',
            designationIsHR,
          );

          console.log(
            'Role Is HR:',
            roleIsHR,
          );

          console.log(
            'Final Is HR:',
            hr,
          );

          console.log(
            '================================================',
          );

          setIsHR(hr);
        } catch (
          profileError
        ) {
          console.error(
            'Unable to determine Comp Off user role:',
            profileError,
          );

          /*
           * Fail closed.
           *
           * If profile/role information cannot
           * be loaded, do NOT give the user HR
           * access on the frontend.
           */

          setIsHR(false);
        } finally {
          setRoleLoading(false);
        }
      },
      [],
    );

  /* ==========================================================
     LOAD REQUESTS
  ========================================================== */

  const loadRequests =
    useCallback(
      async (): Promise<void> => {
        setLoading(true);
        setError('');

        try {
          /*
           * ----------------------------------------------------
           * HR
           * ----------------------------------------------------
           *
           * GET:
           * /api/v1/leaves/comp-off/all
           *
           * HR needs every employee's request because HR is
           * responsible for approval/rejection.
           *
           * ----------------------------------------------------
           * Employee
           * ----------------------------------------------------
           *
           * GET:
           * /api/v1/leaves/comp-off/my
           *
           * Normal employees only see their own requests.
           */

          const data = isHR
            ? await compOffService.getAllRequests()
            : await compOffService.getMyRequests();

          setRequests(data);
        } catch (
          requestError
        ) {
          setRequests([]);

          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load Comp Off requests.',
          );
        } finally {
          setLoading(false);
        }
      },
      [isHR],
    );

  /* ==========================================================
     INITIAL ROLE LOAD
  ========================================================== */

  useEffect(() => {
    void loadUserRole();
  }, [loadUserRole]);

  /* ==========================================================
     LOAD REQUESTS AFTER ROLE IS KNOWN
  ========================================================== */

  useEffect(() => {
    /*
     * Do not load /my or /all until we know
     * whether the logged-in user is HR.
     */

    if (roleLoading) {
      return;
    }

    void loadRequests();
  }, [
    roleLoading,
    loadRequests,
  ]);

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary =
    useMemo<CompOffSummary>(
      () => {
        const approved =
          requests.filter(
            (request) =>
              getStatus(request) ===
              'APPROVED',
          ).length;

        const rejected =
          requests.filter(
            (request) =>
              getStatus(request) ===
              'REJECTED',
          ).length;

        const pending =
          requests.filter(
            (request) =>
              getStatus(request) ===
                'PENDING' ||
              getStatus(request) ===
                'APPLIED',
          ).length;

        return {
          totalRequests:
            requests.length,
          approved,
          pending,
          rejected,
        };
      },
      [requests],
    );

  /* ==========================================================
     FILTERED REQUESTS
  ========================================================== */

  const filteredRequests =
    useMemo(
      () => {
        return requests.filter(
          (request) => {
            const statusMatches =
              filters.status ===
                'ALL' ||
              getStatus(request) ===
                filters.status;

            const dayTypeMatches =
              filters.dayType ===
                'ALL' ||
              getDayType(request) ===
                filters.dayType;

            const dateMatches =
              matchesDateRange(
                request,
                filters.fromDate,
                filters.toDate,
              );

            const searchMatches =
              matchesSearch(
                request,
                filters.search,
              );

            return (
              statusMatches &&
              dayTypeMatches &&
              dateMatches &&
              searchMatches
            );
          },
        );
      },
      [
        requests,
        filters,
      ],
    );

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredRequests.length /
          PAGE_SIZE,
      ),
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedRequests =
    useMemo(
      () => {
        const start =
          (safeCurrentPage - 1) *
          PAGE_SIZE;

        return filteredRequests.slice(
          start,
          start + PAGE_SIZE,
        );
      },
      [
        filteredRequests,
        safeCurrentPage,
      ],
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

  /* ==========================================================
     UPDATE FILTERS
  ========================================================== */

  const updateFilters =
    useCallback(
      (
        values: Partial<CompOffFilters>,
      ) => {
        setFilters(
          (previous) => ({
            ...previous,
            ...values,
          }),
        );

        setCurrentPage(1);
      },
      [],
    );

  /* ==========================================================
     RESET FILTERS
  ========================================================== */

  const resetFilters =
    useCallback(() => {
      setFilters(
        DEFAULT_FILTERS,
      );

      setCurrentPage(1);
    }, []);

  /* ==========================================================
     SUBMIT REQUEST
  ========================================================== */

  const submitRequest =
    useCallback(
      async (
        values: CreateCompOffRequest,
      ): Promise<void> => {
        setSubmitting(true);
        setError('');

        try {
          await compOffService.createRequest(
            values,
          );

          /*
           * Re-fetch using the same role-aware
           * endpoint that was used during initial
           * loading.
           *
           * Employee -> /my
           * HR       -> /all
           */

          await loadRequests();

          setCurrentPage(1);
        } catch (
          requestError
        ) {
          throw new Error(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to submit Comp Off request.',
          );
        } finally {
          setSubmitting(false);
        }
      },
      [loadRequests],
    );

  /* ==========================================================
   APPROVE COMP OFF REQUEST
========================================================== */

const approveRequest =
  useCallback(
    async (
      requestId: number,
    ): Promise<void> => {
      setSubmitting(true);
      setError('');

      try {
        await compOffService.approveRequest(
          requestId,
        );

        /*
         * Re-fetch the role-aware request list
         * so the approved request immediately
         * reflects the backend state.
         *
         * HR -> /all
         * Employee -> /my
         */
        await loadRequests();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to approve Comp Off request.';

        setError(message);

        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadRequests],
  );


/* ==========================================================
   REJECT COMP OFF REQUEST
========================================================== */

const rejectRequest =
  useCallback(
    async (
      requestId: number,
      rejectionReason: string,
    ): Promise<void> => {
      setSubmitting(true);
      setError('');

      try {
        await compOffService.rejectRequest(
          requestId,
          {
            rejectionReason,
          },
        );

        /*
         * Re-fetch the role-aware request list
         * so the rejected request immediately
         * reflects the backend state.
         *
         * HR -> /all
         * Employee -> /my
         */
        await loadRequests();
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to reject Comp Off request.';

        setError(message);

        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [loadRequests],
  );
  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(
      async (): Promise<void> => {
        await loadRequests();
      },
      [loadRequests],
    );

  /* ==========================================================
     BALANCE
  ========================================================== */

  /*
   * Balance:
   *
   * If your backend later provides a dedicated
   * employee balance endpoint, this can be replaced
   * with the backend balance.
   *
   * Until then, preserve the existing logic.
   */

  useEffect(() => {
    const approvedCount =
      requests.filter(
        (request) =>
          getStatus(request) ===
          'APPROVED',
      ).length;

    setBalance({
      totalEarned:
        approvedCount,
      used: 0,
      available:
        approvedCount,
    });
  }, [requests]);

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    summary,
    balance,
    filters,
    updateFilters,
    resetFilters,
    requests,
    paginatedRequests,
    filteredRequests,
    currentPage:
      safeCurrentPage,
    totalPages,
    setCurrentPage,
    loading,
    submitting,
    error,
    submitRequest,
    approveRequest,
    rejectRequest,
    refresh,

    /*
     * Role information required by
     * CompOffPage.tsx.
     */

    isHR,
    roleLoading,
  };
};

export default useCompOff;