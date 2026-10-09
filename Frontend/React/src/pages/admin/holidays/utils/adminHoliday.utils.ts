import {
  AdminHoliday,
  AdminHolidayStatistics,
} from '../types/adminHoliday.types';


/* ============================================================
   DAY
============================================================ */

export const getDayFromDate = (
  date: Date,
): string => {
  return date.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
    },
  );
};


/* ============================================================
   DISPLAY DATE
============================================================ */

export const formatDate = (
  date: Date,
): string => {
  return date.toLocaleDateString(
    'en-US',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};


/* ============================================================
   SEARCH
============================================================ */

export const searchHolidays = (
  holidays: AdminHoliday[],
  query: string,
): AdminHoliday[] => {

  const normalizedQuery =
    query
      .trim()
      .toLowerCase();

  if (!normalizedQuery) {
    return holidays;
  }

  return holidays.filter(
    (holiday) =>
      holiday.title
        .toLowerCase()
        .includes(
          normalizedQuery,
        ) ||
      holiday.day
        .toLowerCase()
        .includes(
          normalizedQuery,
        ),
  );
};


/* ============================================================
   STATISTICS
============================================================ */

export const calculateStatistics = (
  holidays: AdminHoliday[],
): AdminHolidayStatistics => {

  const today =
    new Date();

  const activeHolidays =
    holidays.filter(
      (holiday) =>
        holiday.status ===
        'active',
    );

  const upcoming =
    activeHolidays
      .filter(
        (holiday) =>
          holiday.holidayDate >=
          today,
      )
      .sort(
        (a, b) =>
          a.holidayDate.getTime() -
          b.holidayDate.getTime(),
      )[0];

  const weekendDays =
    holidays.filter(
      (holiday) => {

        const day =
          holiday.holidayDate.getDay();

        return (
          day === 0 ||
          day === 6
        );
      },
    ).length;

  const holidaysTaken =
    activeHolidays.filter(
      (holiday) =>
        holiday.holidayDate <
        today,
    ).length;

  return {
    totalHolidays:
      holidays.length,

    upcomingHoliday:
      upcoming?.title ||
      'None',

    holidaysTaken,

    weekendDays,
  };
};


/* ============================================================
   API ERROR
============================================================ */

export const getApiErrorMessage = (
  error: unknown,
): string => {

  const axiosError =
    error as {
      response?: {
        data?: {
          detail?: string;
          message?: string;
        };
      };

      message?: string;
    };

  return (
    axiosError
      ?.response
      ?.data
      ?.detail ||

    axiosError
      ?.response
      ?.data
      ?.message ||

    axiosError?.message ||

    'Something went wrong. Please try again.'
  );
};