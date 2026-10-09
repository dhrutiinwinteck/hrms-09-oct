import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import RosterHeader from "./components/RosterHeader/RosterHeader";

import RosterSummaryCard from "./components/RosterSummaryCard/RosterSummaryCard";

import RosterTable from "./components/RosterTable/RosterTable";

import type {
  RosterDay,
  RosterEmployee,
  RosterShift,
} from "./types/roster.types";

import useRoster from "./hooks/useRoster";

import {
  formatHours,
  formatWeek,
} from "./utils/roster.utils";

import "./RosterDashboard.css";

/* ============================================================
   PROPS
============================================================ */

export interface RosterDashboardProps {
  initialDate?: Date;

  onExport?: (
    employees: RosterEmployee[],
    days: RosterDay[],
  ) => void | Promise<void>;

  onShiftClick?: (
    employee: RosterEmployee,
    shift: RosterShift,
    day: RosterDay,
    dayIndex: number,
  ) => void;
}

/* ============================================================
   COMPONENT
============================================================ */

const RosterDashboard: React.FC<
  RosterDashboardProps
> = ({
  initialDate = new Date(),
  onExport,
  onShiftClick,
}) => {
  const {
    rosterData,
    loading,
    error,
    goToPreviousWeek,
    goToNextWeek,
    goToWeek,
  } = useRoster(
    initialDate,
  );

  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  /* ==========================================================
     DATA
  ========================================================== */

  const days =
    rosterData?.days ?? [];

  const employees =
    rosterData?.employees ?? [];

  /* ==========================================================
     WEEK LABEL
  ========================================================== */

  const weekLabel =
    rosterData
      ? `Week: ${formatWeek(
          rosterData.week,
        )}`
      : "Loading roster...";

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summaryItems =
    useMemo(() => {
      if (!rosterData) {
        return [];
      }

      const statistics =
        rosterData.statistics;

      return [
        {
          id: "employees",

          type: "employees" as const,

          title:
            "Total Employees",

          value:
            statistics.totalEmployees,

          description:
            `${statistics.activeThisWeek} active this week`,
        },

        {
          id: "shifts",

          type: "shifts" as const,

          title:
            "Total Shifts",

          value:
            statistics.totalShifts,

          description:
            `${statistics.scheduled} scheduled`,
        },

        {
          id: "coverage",

          type: "coverage" as const,

          title:
            "Coverage",

          value:
            `${statistics.coverage}%`,

          description:
            "All shifts filled",

          progress:
            statistics.coverage,
        },

        {
          id: "hours",

          type: "hours" as const,

          title:
            "Total Hours",

          value:
            formatHours(
              statistics.totalHours,
            ),

          description:
            "Planned hours",
        },
      ];
    }, [rosterData]);

  /* ==========================================================
     WEEK PICKER
  ========================================================== */

  const handleWeekChange =
    useCallback(
      async (
        selectedDate: Date,
      ): Promise<void> => {
        goToWeek(
          selectedDate,
        );
      },
      [goToWeek],
    );

  /* ==========================================================
     PREVIOUS
  ========================================================== */

  const handlePreviousWeek =
    useCallback(() => {
      goToPreviousWeek();
    }, [
      goToPreviousWeek,
    ]);

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNextWeek =
    useCallback(() => {
      goToNextWeek();
    }, [
      goToNextWeek,
    ]);

  /* ==========================================================
     EXPORT
  ========================================================== */

  const handleExport =
    useCallback(
      async (): Promise<void> => {
        if (
          isExporting ||
          !rosterData
        ) {
          return;
        }

        setIsExporting(
          true,
        );

        try {
          if (onExport) {
            await onExport(
              employees,
              days,
            );

            return;
          }

          const rows: string[][] =
            [
              [
                "Name / Date",
                ...days.map(
                  (day) =>
                    `${day.day} ${day.date}`,
                ),
              ],
            ];

          employees.forEach(
            (
              employee,
            ) => {
              const row: string[] =
                [
                  employee.name,
                ];

              days.forEach(
                (
                  _day,
                  index,
                ) => {
                  const shift =
                    employee
                      .shifts[
                      index
                    ];

                  if (
                    !shift
                  ) {
                    row.push(
                      "",
                    );

                    return;
                  }

                  if (
                    shift.isWeekOff
                  ) {
                    row.push(
                      "WO",
                    );

                    return;
                  }

                  if (
                    shift.isLeave
                  ) {
                    row.push(
                      "Leave",
                    );

                    return;
                  }

                  if (
                    shift.startTime &&
                    shift.endTime
                  ) {
                    row.push(
                      `${shift.startTime} - ${shift.endTime}`,
                    );

                    return;
                  }

                  row.push(
                    shift.label ??
                      "",
                  );
                },
              );

              rows.push(
                row,
              );
            },
          );

          const escapeCsv =
            (
              value: string,
            ): string =>
              `"${value.replace(
                /"/g,
                '""',
              )}"`;

          const csv =
            "\uFEFF" +
            rows
              .map(
                (row) =>
                  row
                    .map(
                      escapeCsv,
                    )
                    .join(","),
              )
              .join(
                "\r\n",
              );

          const blob =
            new Blob(
              [csv],
              {
                type:
                  "text/csv;charset=utf-8;",
              },
            );

          const url =
            URL.createObjectURL(
              blob,
            );

          const link =
            document.createElement(
              "a",
            );

          const start =
            rosterData.week
              .startDate
              .toISOString()
              .slice(
                0,
                10,
              );

          const end =
            rosterData.week
              .endDate
              .toISOString()
              .slice(
                0,
                10,
              );

          link.href = url;

          link.download =
            `Roster_${start}_${end}.csv`;

          document.body.appendChild(
            link,
          );

          link.click();

          link.remove();

          URL.revokeObjectURL(
            url,
          );
        } catch (
          exportError
        ) {
          console.error(
            "Roster export failed:",
            exportError,
          );
        } finally {
          setIsExporting(
            false,
          );
        }
      },
      [
        days,
        employees,
        isExporting,
        onExport,
        rosterData,
      ],
    );

  /* ==========================================================
     SHIFT CLICK
  ========================================================== */

  const handleShiftClick =
    useCallback(
      (
        employee: RosterEmployee,
        shift: RosterShift,
        day: RosterDay,
        dayIndex: number,
      ): void => {
        onShiftClick?.(
          employee,
          shift,
          day,
          dayIndex,
        );
      },
      [onShiftClick],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main
      className="roster-dashboard"
      aria-label="Roster dashboard"
    >
      <div className="roster-dashboard__container">
        <section className="roster-dashboard__header">
          <RosterHeader
            weekLabel={
              weekLabel
            }
            onWeekChange={
              handleWeekChange
            }
            onExport={
              handleExport
            }
            onPreviousWeek={
              handlePreviousWeek
            }
            onNextWeek={
              handleNextWeek
            }
            exportLoading={
              isExporting
            }
            disabled={
              loading
            }
          />
        </section>

        {error && (
          <div
            className="roster-dashboard__error"
            role="alert"
          >
            {error}
          </div>
        )}

        {rosterData && (
          <section className="roster-dashboard__summary">
            <RosterSummaryCard
              items={
                summaryItems
              }
            />
          </section>
        )}

        <section className="roster-dashboard__table-section">
          <RosterTable
            days={days}
            employees={
              employees
            }
            onShiftClick={
              handleShiftClick
            }
            loading={
              loading
            }
          />
        </section>
      </div>
    </main>
  );
};

export default RosterDashboard;