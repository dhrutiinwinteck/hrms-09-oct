// src/pages/attendance/attendance-history/AttendanceHistoryPage.tsx

import React from "react";

import { AttendanceHistoryHeader } from "./components/AttendanceHistoryHeader/AttendanceHistoryHeader";
import { AttendanceHistoryStats } from "./components/AttendanceHistoryStats/AttendanceHistoryStats";
import { AttendanceHistoryOverview } from "./components/AttendanceHistoryOverview/AttendanceHistoryOverview";
import { AttendanceHistorySummary } from "./components/AttendanceHistorySummary/AttendanceHistorySummary";
import { AttendanceHistorySidebar } from "./components/AttendanceHistorySidebar/AttendanceHistorySidebar";
import { AttendanceHistoryPagination } from "./components/AttendanceHistoryPagination/AttendanceHistoryPagination";

import { useAttendanceHistory } from "./hooks/useAttendanceHistory";

import "./AttendanceHistoryPage.css";


export const AttendanceHistoryPage: React.FC = () => {

  const {
    employees,
    statistics,
    pagination,
    insights,
    loading,
    selectedMonth,

    setCurrentPage,
    setSelectedMonth,
    calculateLateMarks,
    exportData,

  } = useAttendanceHistory();


  const month = selectedMonth.month;

  const year = selectedMonth.year;


  return (
    <div className="attendance-history-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <AttendanceHistoryHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onCalculateLateMarks={calculateLateMarks}
        onExport={exportData}

        /*
         * Do not pass the actual loading state here.
         * This prevents the header from showing a spinner/loading UI.
         */
        loading={false}
      />


      {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

      {loading ? (

        /*
         * Simple page-level loading message.
         * No spinner.
         * No animation.
         * No skeleton.
         */

        <div
          className="attendance-history-loading"
          role="status"
          aria-live="polite"
        >
          Loading data...
        </div>

      ) : (

        <>

          {/* ==================================================
              STATISTICS
              ================================================== */}

          <AttendanceHistoryStats
            statistics={statistics}
            loading={false}
          />


          {/* ==================================================
              MAIN GRID
              ================================================== */}

          <div className="attendance-history-grid">

            {/* ================================================
                MAIN CONTENT
                ================================================ */}

            <main className="attendance-history-main">

              <AttendanceHistoryOverview
                employees={employees}
                month={month}
                year={year}
                loading={false}
              />


              <AttendanceHistorySummary
                employees={employees}
                loading={false}
              />


              {/* ==============================================
                  PAGINATION
                  ============================================== */}

              {pagination && (
                <AttendanceHistoryPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

            </main>


            {/* ================================================
                SIDEBAR
                ================================================ */}

            <aside className="attendance-history-aside">

              {/* <AttendanceHistorySidebar
                statistics={statistics}
                insights={insights}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                onCalculateLateMarks={calculateLateMarks}
                onExport={exportData}
                loading={false}
              /> */}

            </aside>

          </div>

        </>

      )}

    </div>
  );
};