import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAllHolidays,
  HolidayApiError,
} from "../api/holidayApi";

import {
  Holiday,
  HolidayApiResponse,
} from "../types/holiday.types";

import {
  calculateStatistics,
  mapHolidayFromApi,
} from "../utils/holiday.utils";


// ============================================================
// HOOK
// ============================================================

export const useHolidayCalendar = () => {

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const [
    pageSize,
  ] = useState(8);


  // ==========================================================
  // HOLIDAYS
  // ==========================================================

  const [
    holidays,
    setHolidays,
  ] = useState<Holiday[]>([]);


  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ==========================================================
  // ERROR
  // ==========================================================

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // ==========================================================
  // LOAD HOLIDAYS
  // ==========================================================

  const loadHolidays =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError(null);


          // ==================================================
          // API REQUEST
          // ==================================================

          const response:
            HolidayApiResponse[] =
            await getAllHolidays();


          // ==================================================
          // MAP API RESPONSE
          // ==================================================

          const mappedHolidays =
            response.map(
              mapHolidayFromApi,
            );


          // ==================================================
          // TODAY
          //
          // IMPORTANT:
          // Use date-only comparison.
          //
          // Example:
          //
          // Today = 30 Sep
          //
          // 29 Sep → removed
          // 30 Sep → visible
          // 02 Oct → visible
          // 25 Dec → visible
          // ==================================================

          const today =
            new Date();

          today.setHours(
            0,
            0,
            0,
            0,
          );


          // ==================================================
          // FILTER UPCOMING HOLIDAYS
          // ==================================================

          const upcomingHolidays =
            mappedHolidays
              .filter(
                (holiday) => {

                  const holidayDate =
                    new Date(
                      holiday.date,
                    );

                  holidayDate.setHours(
                    0,
                    0,
                    0,
                    0,
                  );

                  return (
                    holidayDate.getTime() >=
                    today.getTime()
                  );
                },
              )
              .sort(
                (
                  first,
                  second,
                ) => {

                  const firstDate =
                    new Date(
                      first.date,
                    ).getTime();

                  const secondDate =
                    new Date(
                      second.date,
                    ).getTime();

                  return (
                    firstDate -
                    secondDate
                  );
                },
              );


          // ==================================================
          // SET FILTERED DATA
          //
          // IMPORTANT:
          // Pagination is now based on upcoming holidays only.
          // ==================================================

          setHolidays(
            upcomingHolidays,
          );


          // ==================================================
          // RESET TO PAGE 1
          // ==================================================

          setCurrentPage(1);

        } catch (
          err: unknown
        ) {

          console.error(
            "Failed to load holidays:",
            err,
          );


          // ==================================================
          // API ERROR
          // ==================================================

          if (
            err instanceof
            HolidayApiError
          ) {

            setError(
              err.message,
            );

          } else if (
            err instanceof Error
          ) {

            setError(
              err.message,
            );

          } else {

            setError(
              "Unable to load holidays.",
            );

          }

        } finally {

          setLoading(false);

        }

      },
      [],
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    void loadHolidays();

  }, [
    loadHolidays,
  ]);


  // ==========================================================
  // TOTAL ITEMS
  //
  // IMPORTANT:
  // This now represents ONLY upcoming holidays.
  // ==========================================================

  const totalItems =
    holidays.length;


  // ==========================================================
  // TOTAL PAGES
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          pageSize,
      ),
    );


  // ==========================================================
  // CURRENT PAGE DATA
  // ==========================================================

  const currentHolidays =
    useMemo(() => {

      const startIndex =
        (currentPage - 1) *
        pageSize;


      const endIndex =
        startIndex +
        pageSize;


      return holidays.slice(
        startIndex,
        endIndex,
      );

    }, [
      holidays,
      currentPage,
      pageSize,
    ]);


  // ==========================================================
  // VISIBLE RANGE
  // ==========================================================

  const visibleRange =
    useMemo(() => {

      if (
        totalItems === 0
      ) {

        return {
          start: 0,
          end: 0,
        };

      }


      const start =
        (currentPage - 1) *
          pageSize +
        1;


      const end =
        Math.min(
          currentPage *
            pageSize,
          totalItems,
        );


      return {
        start,
        end,
      };

    }, [
      currentPage,
      pageSize,
      totalItems,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics =
    useMemo(
      () =>
        calculateStatistics(
          holidays,
        ),
      [
        holidays,
      ],
    );


  // ==========================================================
  // GO TO PAGE
  // ==========================================================

  const goToPage =
    useCallback(
      (
        page: number,
      ) => {

        if (
          page >= 1 &&
          page <= totalPages
        ) {

          setCurrentPage(
            page,
          );

        }

      },
      [
        totalPages,
      ],
    );


  // ==========================================================
  // FIRST PAGE
  // ==========================================================

  const goToFirstPage =
    useCallback(
      () => {

        setCurrentPage(1);

      },
      [],
    );


  // ==========================================================
  // LAST PAGE
  // ==========================================================

  const goToLastPage =
    useCallback(
      () => {

        setCurrentPage(
          totalPages,
        );

      },
      [
        totalPages,
      ],
    );


  // ==========================================================
  // NEXT PAGE
  // ==========================================================

  const goToNextPage =
    useCallback(
      () => {

        setCurrentPage(
          (
            previousPage,
          ) => {

            if (
              previousPage <
              totalPages
            ) {

              return (
                previousPage + 1
              );

            }

            return previousPage;

          },
        );

      },
      [
        totalPages,
      ],
    );


  // ==========================================================
  // PREVIOUS PAGE
  // ==========================================================

  const goToPreviousPage =
    useCallback(
      () => {

        setCurrentPage(
          (
            previousPage,
          ) => {

            if (
              previousPage > 1
            ) {

              return (
                previousPage - 1
              );

            }

            return previousPage;

          },
        );

      },
      [],
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    /*
     * Current page holidays.
     *
     * These are already filtered to:
     *
     * today + future dates
     */
    holidays:
      currentHolidays,


    /*
     * Filtered upcoming holidays.
     */
    allHolidays:
      holidays,


    /*
     * Statistics.
     */
    statistics,


    /*
     * Loading.
     */
    loading,


    /*
     * Error.
     */
    error,


    /*
     * Refresh.
     */
    refresh:
      loadHolidays,


    /*
     * Pagination.
     */
    currentPage,

    totalPages,

    totalItems,

    pageSize,

    visibleRange,


    /*
     * Navigation.
     */
    goToPage,

    goToFirstPage,

    goToLastPage,

    goToNextPage,

    goToPreviousPage,

  };
};