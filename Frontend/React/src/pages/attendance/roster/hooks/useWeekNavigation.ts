import { useState, useCallback } from 'react';

export const useWeekNavigation = (initialWeek: Date = new Date()) => {
  const [selectedWeek, setSelectedWeek] = useState<Date>(initialWeek);

  const goToPreviousWeek = useCallback(() => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  }, [selectedWeek]);

  const goToNextWeek = useCallback(() => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  }, [selectedWeek]);

  const goToCurrentWeek = useCallback(() => {
    setSelectedWeek(new Date());
  }, []);

  return {
    selectedWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
};