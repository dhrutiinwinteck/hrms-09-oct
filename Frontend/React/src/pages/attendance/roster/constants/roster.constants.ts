import {
  ShiftType,
} from "../types/roster.types";

export const SHIFT_LABELS: Record<
  ShiftType,
  string
> = {
  day: "Day Shift",
  night: "Night Shift",
  off: "Week Off",
  leave: "Leave",
  unknown: "Unknown",
};

export const SHIFT_ICONS: Record<
  ShiftType,
  string
> = {
  day: "☀️",
  night: "🌙",
  off: "🛑",
  leave: "📅",
  unknown: "—",
};

export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const WEEK_DAYS_DISPLAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const TABLE_HEADERS = [
  "Employee",
  ...WEEK_DAYS_DISPLAY,
];

export const STAT_COLORS = {
  blue: "#2563EB",
  green: "#16A34A",
  orange: "#F97316",
  purple: "#9333EA",
};

export const STAT_BG_COLORS = {
  blue: "#EFF6FF",
  green: "#F0FDF4",
  orange: "#FFF7ED",
  purple: "#F5F3FF",
};

export const EXPORT_LABELS = {
  button: "Export to Excel",
  fileName: "Roster_",
};