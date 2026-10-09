import axiosInstance from "@/services/axios/axiosInstance";

import {
  BackendWeeklyRosterResponse,
  RosterData,
} from "../types/roster.types";

import {
  formatApiDate,
  startOfWeekMonday,
} from "../utils/roster.utils";

import {
  mapRosterResponse,
} from "../utils/roster.mapper";

/* ============================================================
   ERROR MESSAGE
============================================================ */

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    typeof error ===
      "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError =
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

    return (
      axiosError.response
        ?.data?.detail ||
      axiosError.response
        ?.data?.message ||
      "Failed to load roster."
    );
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "Failed to load roster.";
};

/* ============================================================
   ROSTER SERVICE
============================================================ */

export const rosterService = {
  async getRoster(
    selectedDate: Date,
  ): Promise<RosterData> {
    const monday =
      startOfWeekMonday(
        selectedDate,
      );

    const weekStart =
      formatApiDate(
        monday,
      );

    const response =
      await axiosInstance.get<BackendWeeklyRosterResponse>(
        "/api/v1/roster",
        {
          params: {
            week_start:
              weekStart,
          },
        },
      );

    return mapRosterResponse(
      response.data,
    );
  },

  async getCurrentRoster(): Promise<RosterData> {
    return this.getRoster(
      new Date(),
    );
  },

  async getRosterForDate(
    selectedDate: Date,
  ): Promise<RosterData> {
    return this.getRoster(
      selectedDate,
    );
  },

  getErrorMessage,
};

export default rosterService;