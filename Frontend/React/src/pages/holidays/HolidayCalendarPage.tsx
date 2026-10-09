import React from "react";

import {
  useHolidayCalendar,
} from "./hooks/useHolidayCalendar";

import {
  HolidayCalendarHeader,
} from "./components/HolidayCalendarHeader/HolidayCalendarHeader";

import {
  HolidayStatistics,
} from "./components/HolidayStatistics/HolidayStatistics";

import {
  HolidayTable,
} from "./components/HolidayTable/HolidayTable";

import {
  HolidayPagination,
} from "./components/HolidayPagination/HolidayPagination";

import "./HolidayCalendarPage.css";


export const HolidayCalendarPage: React.FC = () => {

  const {
    holidays,

    statistics,

    loading,

    error,

    currentPage,

    totalPages,

    totalItems,

    visibleRange,

    goToPage,

    goToFirstPage,

    goToLastPage,

    goToNextPage,

    goToPreviousPage,

  } = useHolidayCalendar();


  return (

    <div className="holiday-calendar-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <HolidayCalendarHeader />


      {/* ==================================================
          STATISTICS
      ================================================== */}

      <HolidayStatistics

        totalHolidays={
          statistics.totalHolidays
        }

        upcomingHolidays={
          statistics.upcomingHolidays
        }

        nextUpcomingHoliday={
          statistics.nextUpcomingHoliday
        }

        longWeekends={
          statistics.longWeekends
        }

        observedHolidays={
          statistics.observedHolidays
        }

      />


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div
          role="alert"
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            border:
              "1px solid #f5c2c7",
            backgroundColor:
              "#f8d7da",
            color: "#842029",
          }}
        >
          {error}
        </div>

      )}


      {/* ==================================================
          HOLIDAY TABLE
      ================================================== */}

      {loading ? (

        <div
          style={{
            padding: "32px",
            textAlign: "center",
          }}
        >
          Loading holidays...
        </div>

      ) : (

        <>

          <HolidayTable
            holidays={holidays}
          />


          {/* ==============================================
              PAGINATION
          ============================================== */}

          {totalItems > 0 && (

            <HolidayPagination

              currentPage={
                currentPage
              }

              totalPages={
                totalPages
              }

              totalItems={
                totalItems
              }

              visibleRange={
                visibleRange
              }

              onPageChange={
                goToPage
              }

              onFirstPage={
                goToFirstPage
              }

              onLastPage={
                goToLastPage
              }

              onNextPage={
                goToNextPage
              }

              onPreviousPage={
                goToPreviousPage
              }

            />

          )}

        </>

      )}

    </div>
  );
};


export default HolidayCalendarPage;