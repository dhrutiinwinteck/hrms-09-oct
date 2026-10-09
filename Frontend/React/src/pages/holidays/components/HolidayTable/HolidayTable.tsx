import React, { useMemo } from "react";

import {
  Holiday,
} from "../../types/holiday.types";

import {
  HolidayRow,
} from "../HolidayRow/HolidayRow";

import "./HolidayTable.css";


interface HolidayTableProps {
  holidays: Holiday[];
}


export const HolidayTable: React.FC<
  HolidayTableProps
> = ({
  holidays,
}) => {

  /*
   * ==========================================================
   * VISIBLE HOLIDAYS
   *
   * Show:
   * - Today's holiday
   * - All future holidays
   *
   * Hide:
   * - All holidays before today
   * ==========================================================
   */

  const visibleHolidays = useMemo(() => {

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0,
    );

    return holidays
      .filter((holiday) => {

        const holidayDate = new Date(
          holiday.date,
        );

        /*
         * Normalize the holiday date so
         * the comparison is date-only.
         */
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
      })
      .sort((first, second) => {

        const firstDate =
          new Date(first.date).getTime();

        const secondDate =
          new Date(second.date).getTime();

        return (
          firstDate -
          secondDate
        );
      });

  }, [holidays]);


  return (
    <div className="holiday-table-wrapper">

      <table className="holiday-table">

        <thead>

          <tr>

            <th className="holiday-table-header-icon">
            </th>

            <th className="holiday-table-header-title">
              Holiday
            </th>

            <th className="holiday-table-header-date">
              Date
            </th>

            <th className="holiday-table-header-day">
              Day
            </th>

          </tr>

        </thead>


        <tbody>

          {visibleHolidays.length > 0 ? (

            visibleHolidays.map(
              (holiday) => (

                <HolidayRow
                  key={holiday.id}
                  holiday={holiday}
                />

              ),
            )

          ) : (

            <tr>

              <td
                colSpan={4}
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                No upcoming holidays.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
};