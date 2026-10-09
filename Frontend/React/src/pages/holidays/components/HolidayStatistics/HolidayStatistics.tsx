import React from 'react';

import {
  CalendarDays,
  Clock3,
  PartyPopper,
  Badge,
} from 'lucide-react';

import {
  HolidayStatCard,
} from '../HolidayStatCard/HolidayStatCard';

import type {
  Holiday,
} from '../../types/holiday.types';

import './HolidayStatistics.css';


interface HolidayStatisticsProps {

  totalHolidays: number;

  upcomingHolidays: number;

  nextUpcomingHoliday:
    | Holiday
    | null;

  longWeekends: number;

  observedHolidays: number;
}


export const HolidayStatistics: React.FC<
  HolidayStatisticsProps
> = ({
  totalHolidays,
  nextUpcomingHoliday,
  longWeekends,
  observedHolidays,
}) => {

  /*
   * ==========================================================
   * UPCOMING HOLIDAY DISPLAY
   * ==========================================================
   */

  const upcomingHolidayTitle =
    nextUpcomingHoliday?.title ||
    'No upcoming holiday';


  const upcomingHolidayFooter =
    nextUpcomingHoliday
      ? `${nextUpcomingHoliday.date} • ${nextUpcomingHoliday.day}`
      : 'No upcoming holidays';


  return (

    <div className="holiday-statistics">

      {/* ====================================================
          TOTAL HOLIDAYS
      ==================================================== */}

      <HolidayStatCard
        title="Total Holidays"
        value={totalHolidays}
        footer="This Year"
        icon={CalendarDays}
        iconBgColor="#e8f4f8"
        iconColor="#0f4c5c"
      />


      {/* ====================================================
          NEXT UPCOMING HOLIDAY
      ==================================================== */}

      <HolidayStatCard
        title="Upcoming Holiday"
        value={upcomingHolidayTitle}
        footer={upcomingHolidayFooter}
        icon={Clock3}
        iconBgColor="#fff4df"
        iconColor="#d97706"
      />


      {/* ====================================================
          LONG WEEKENDS
      ==================================================== */}

      <HolidayStatCard
        title="Long Weekends"
        value={longWeekends}
        footer="This Year"
        icon={PartyPopper}
        iconBgColor="#f8ece8"
        iconColor="#b85a3a"
      />


      {/* ====================================================
          OBSERVED HOLIDAYS
      ==================================================== */}

      <HolidayStatCard
        title="Observed Holidays"
        value={observedHolidays}
        footer="This Year"
        icon={Badge}
        iconBgColor="#ece8f8"
        iconColor="#5a3ab8"
      />

    </div>
  );
};