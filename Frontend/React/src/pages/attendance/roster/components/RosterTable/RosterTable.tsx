import React from "react";

import {
  CircleHelp,
  Moon,
  Sun,
} from "lucide-react";

import {
  RosterDay,
  RosterEmployee,
  RosterShift,
  ShiftType,
} from "../../types/roster.types";

import {
  getShiftDisplayLabel,
} from "../../utils/roster.utils";

import "./RosterTable.css";

/* ============================================================
   PROPS
============================================================ */

export interface RosterTableProps {
  days: RosterDay[];

  employees: RosterEmployee[];

  onShiftClick?: (
    employee: RosterEmployee,
    shift: RosterShift,
    day: RosterDay,
    dayIndex: number,
  ) => void;

  loading?: boolean;
}

/* ============================================================
   COMPONENT
============================================================ */

const RosterTable: React.FC<
  RosterTableProps
> = ({
  days,
  employees,
  onShiftClick,
  loading = false,
}) => {
  /* ==========================================================
     ICON
  ========================================================== */

  const renderShiftIcon = (
    type: ShiftType,
  ): React.ReactNode => {
    if (type === "night") {
      return (
        <Moon
          className="roster-table__shift-icon"
          aria-hidden="true"
        />
      );
    }

    if (type === "day") {
      return (
        <Sun
          className="roster-table__shift-icon"
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  /* ==========================================================
     CLASS
  ========================================================== */

  const getShiftClassName = (
    shift: RosterShift,
  ): string => {
    if (shift.isWeekOff) {
      return "roster-table__shift roster-table__shift--off";
    }

    if (shift.isLeave) {
      return "roster-table__shift roster-table__shift--off";
    }

    if (
      shift.type === "night"
    ) {
      return "roster-table__shift roster-table__shift--night";
    }

    return "roster-table__shift roster-table__shift--day";
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <section
        className="roster-table"
        aria-label="Weekly roster"
        aria-busy="true"
      >
        <div className="roster-table__loading">
          <div className="roster-table__loading-spinner" />

          <span>
            Loading roster...
          </span>
        </div>
      </section>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section
      className="roster-table"
      aria-label="Weekly roster"
    >
      <div className="roster-table__scroll">
        <table className="roster-table__table">
          <thead>
            <tr>
              <th
                scope="col"
                className="roster-table__employee-header"
              >
                Name / Date
              </th>

              {days.map(
                (day) => (
                  <th
                    key={`${day.day}-${day.fullDate}`}
                    scope="col"
                    className="roster-table__day-header"
                  >
                    <span className="roster-table__day-name">
                      {day.day}
                    </span>

                    <span className="roster-table__day-date">
                      {day.date}
                    </span>
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {employees.length > 0 ? (
              employees.map(
                (employee) => (
                  <tr
                    key={
                      employee.id
                    }
                  >
                    <td className="roster-table__employee-cell">
                      <div className="roster-table__employee">
                        <div
                          className="roster-table__avatar"
                          aria-hidden="true"
                        >
                          {
                            employee.initials
                          }
                        </div>

                        <span className="roster-table__employee-name">
                          {
                            employee.name
                          }
                        </span>
                      </div>
                    </td>

                    {days.map(
                      (
                        day,
                        dayIndex,
                      ) => {
                        const shift =
                          employee.shifts[
                            dayIndex
                          ] ?? {
                            type: "unknown" as ShiftType,
                            label: "—",
                          };

                        const label =
                          getShiftDisplayLabel(
                            shift,
                          );

                        return (
                          <td
                            key={`${employee.id}-${day.fullDate}`}
                            className="roster-table__shift-cell"
                          >
                            <button
                              type="button"
                              className={getShiftClassName(
                                shift,
                              )}
                              onClick={() =>
                                onShiftClick?.(
                                  employee,
                                  shift,
                                  day,
                                  dayIndex,
                                )
                              }
                              aria-label={`${employee.name}, ${day.day}, ${label}`}
                              title={
                                shift.patternName
                                  ? `${shift.patternName}${shift.startTime && shift.endTime ? ` (${shift.startTime} - ${shift.endTime})` : ""}`
                                  : label
                              }
                            >
                              {renderShiftIcon(
                                shift.type,
                              )}

                              <span>
                                {
                                  label
                                }
                              </span>
                            </button>
                          </td>
                        );
                      },
                    )}
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={
                    days.length + 1
                  }
                  className="roster-table__empty"
                >
                  No roster data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="roster-table__footer">
        <div className="roster-table__legend">
          <div className="roster-table__legend-item">
            <span className="roster-table__legend-box roster-table__legend-box--day" />

            <span>
              Day Shift (06:00 - 18:00)
            </span>
          </div>

          <div className="roster-table__legend-item">
            <span className="roster-table__legend-box roster-table__legend-box--night" />

            <span>
              Night Shift (18:00 - 06:00)
            </span>
          </div>

          <div className="roster-table__legend-item">
            <span className="roster-table__legend-box roster-table__legend-box--off" />

            <span>
              Week Off (WO)
            </span>
          </div>
        </div>

        <div className="roster-table__hint">
          <CircleHelp
            className="roster-table__hint-icon"
            aria-hidden="true"
          />

          <span>
            Click on any shift to view details
          </span>
        </div>
      </footer>
    </section>
  );
};

export default RosterTable;