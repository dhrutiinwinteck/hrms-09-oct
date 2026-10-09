import { Holiday } from "../types/holiday.types";


// ============================================================
// MOCK HOLIDAYS
// ============================================================

export const mockHolidays: Holiday[] = [
  {
    id: "1",
    title: "Republic Day",
    date: "26 Jan 2026",
    day: "Monday",
    icon: "🇮🇳",
    dayVariant: "monday",
    status: 1,
  },

  {
    id: "2",
    title: "Holi",
    date: "07 Mar 2026",
    day: "Saturday",
    icon: "🎨",
    dayVariant: "saturday",
    status: 1,
  },

  {
    id: "3",
    title: "Ram Navami",
    date: "26 Mar 2026",
    day: "Thursday",
    icon: "🕉️",
    dayVariant: "thursday",
    status: 1,
  },

  {
    id: "4",
    title: "Good Friday",
    date: "03 Apr 2026",
    day: "Friday",
    icon: "✝️",
    dayVariant: "friday",
    status: 1,
  },

  {
    id: "5",
    title: "Diwali",
    date: "12 Nov 2026",
    day: "Thursday",
    icon: "🪔",
    dayVariant: "thursday",
    status: 1,
  },

  {
    id: "6",
    title: "Guru Nanak Jayanti",
    date: "25 Nov 2026",
    day: "Wednesday",
    icon: "☬",
    dayVariant: "wednesday",
    status: 1,
  },

  {
    id: "7",
    title: "Christmas",
    date: "25 Dec 2026",
    day: "Friday",
    icon: "🎄",
    dayVariant: "friday",
    status: 1,
  },

  {
    id: "8",
    title: "New Year",
    date: "01 Jan 2027",
    day: "Friday",
    icon: "🎉",
    dayVariant: "friday",
    status: 1,
  },

  {
    id: "9",
    title: "Maha Shivaratri",
    date: "15 Feb 2026",
    day: "Sunday",
    icon: "🔱",
    dayVariant: "sunday",
    status: 1,
  },

  {
    id: "10",
    title: "Independence Day",
    date: "15 Aug 2026",
    day: "Saturday",
    icon: "🇮🇳",
    dayVariant: "saturday",
    status: 1,
  },

  {
    id: "11",
    title: "Gandhi Jayanti",
    date: "02 Oct 2026",
    day: "Friday",
    icon: "🕊️",
    dayVariant: "friday",
    status: 1,
  },

  {
    id: "12",
    title: "Dussehra",
    date: "19 Oct 2026",
    day: "Monday",
    icon: "🏹",
    dayVariant: "monday",
    status: 1,
  },

  {
    id: "13",
    title: "Eid al-Fitr",
    date: "21 Mar 2026",
    day: "Saturday",
    icon: "🌙",
    dayVariant: "saturday",
    status: 1,
  },

  {
    id: "14",
    title: "Baisakhi",
    date: "13 Apr 2026",
    day: "Monday",
    icon: "🌾",
    dayVariant: "monday",
    status: 1,
  },
];


// ============================================================
// MOCK STATISTICS
// ============================================================

export const mockStatistics = {
  totalHolidays: 14,
  upcomingHolidays: 5,
  longWeekends: 4,
  observedHolidays: 14,
};