import {
  useCallback,
  useEffect,
  useState,
} from "react";

import rosterService from "../services/roster.service";

import {
  RosterData,
} from "../types/roster.types";

import {
  addWeeks,
  startOfWeekMonday,
} from "../utils/roster.utils";

/* ============================================================
   RETURN TYPE
============================================================ */

export interface UseRosterResult {
  rosterData: RosterData | null;

  loading: boolean;

  error: string | null;

  weekStart: Date;

  refresh: () => Promise<void>;

  goToPreviousWeek: () => void;

  goToNextWeek: () => void;

  goToWeek: (
    date: Date,
  ) => void;
}

/* ============================================================
   HOOK
============================================================ */

export const useRoster = (
  initialDate: Date = new Date(),
): UseRosterResult => {
  const [
    weekStart,
    setWeekStart,
  ] = useState<Date>(
    () =>
      startOfWeekMonday(
        initialDate,
      ),
  );

  const [
    rosterData,
    setRosterData,
  ] = useState<RosterData | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState<boolean>(
    true,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /* ==========================================================
     FETCH
  ========================================================== */

  const loadRoster =
    useCallback(
      async (
        date: Date,
      ): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const data =
            await rosterService.getRoster(
              date,
            );

          setRosterData(
            data,
          );
        } catch (
          requestError
        ) {
          setError(
            rosterService.getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  /* ==========================================================
     INITIAL / WEEK CHANGE
  ========================================================== */

  useEffect(() => {
    void loadRoster(
      weekStart,
    );
  }, [
    loadRoster,
    weekStart,
  ]);

  /* ==========================================================
     PREVIOUS WEEK
  ========================================================== */

  const goToPreviousWeek =
    useCallback(() => {
      setWeekStart(
        (current) =>
          addWeeks(
            current,
            -1,
          ),
      );
    }, []);

  /* ==========================================================
     NEXT WEEK
  ========================================================== */

  const goToNextWeek =
    useCallback(() => {
      setWeekStart(
        (current) =>
          addWeeks(
            current,
            1,
          ),
      );
    }, []);

  /* ==========================================================
     SELECT WEEK
  ========================================================== */

  const goToWeek =
    useCallback(
      (date: Date) => {
        setWeekStart(
          startOfWeekMonday(
            date,
          ),
        );
      },
      [],
    );

  /* ==========================================================
     REFRESH
  ========================================================== */

  const refresh =
    useCallback(
      async (): Promise<void> => {
        await loadRoster(
          weekStart,
        );
      },
      [
        loadRoster,
        weekStart,
      ],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    rosterData,

    loading,

    error,

    weekStart,

    refresh,

    goToPreviousWeek,

    goToNextWeek,

    goToWeek,
  };
};

export default useRoster;