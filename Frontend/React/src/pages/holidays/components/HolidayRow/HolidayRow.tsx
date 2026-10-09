import React from "react";

import {
  CalendarDays,
} from "lucide-react";

import {
  Holiday,
} from "../../types/holiday.types";

import {
  HolidayDayBadge,
} from "../HolidayDayBadge/HolidayDayBadge";

import "./HolidayRow.css";


interface HolidayRowProps {
  holiday: Holiday;
}


export const HolidayRow: React.FC<
  HolidayRowProps
> = ({
  holiday,
}) => {
  return (
    <tr className="holiday-row">

      <td className="holiday-row-icon">
        <span className="holiday-emoji">
          {holiday.icon}
        </span>
      </td>


      <td className="holiday-row-title">
        {holiday.title}
      </td>


      <td className="holiday-row-date">

        <CalendarDays
          size={14}
          className="holiday-date-icon"
        />

        <span>
          {holiday.date}
        </span>

      </td>


      <td className="holiday-row-day">

        <HolidayDayBadge
          day={holiday.day}
          variant={
            holiday.dayVariant
          }
        />

      </td>

    </tr>
  );
};