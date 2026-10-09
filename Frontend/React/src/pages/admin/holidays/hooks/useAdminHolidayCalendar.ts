import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  AdminHoliday,
  AdminHolidayStatistics,
  AdminHolidayFormData,
} from '../types/adminHoliday.types';

import {
  adminHolidayService,
} from '../services/adminHoliday.service';

import {
  DEFAULT_PAGE_SIZE,
} from '../constants/adminHoliday.constants';

import {
  calculateStatistics,
  searchHolidays,
  getApiErrorMessage,
} from '../utils/adminHoliday.utils';

export const useAdminHolidayCalendar = () => {
  const [allHolidays, setAllHolidays] =
    useState<AdminHoliday[]>([]);

  const [holidays, setHolidays] =
    useState<AdminHoliday[]>([]);

  const [statistics, setStatistics] =
    useState<AdminHolidayStatistics | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(DEFAULT_PAGE_SIZE);

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadData = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await adminHolidayService.getHolidays();

        setAllHolidays(data);

        const filtered =
          searchHolidays(
            data,
            searchQuery
          );

        const startIndex =
          (currentPage - 1) *
          pageSize;

        const endIndex =
          startIndex + pageSize;

        setHolidays(
          filtered.slice(
            startIndex,
            endIndex
          )
        );

        setStatistics(
          calculateStatistics(data)
        );
      } catch (err) {
        console.error(
          'Error loading holidays:',
          err
        );

        setError(
          getApiErrorMessage(err)
        );

        setAllHolidays([]);
        setHolidays([]);
        setStatistics(null);
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      pageSize,
      searchQuery,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ==========================================================
     ADD
  ========================================================== */

  const addHoliday = useCallback(
    async (
      data: AdminHolidayFormData
    ) => {
      setMutationLoading(true);
      setError(null);

      try {
        await adminHolidayService.addHoliday(
          data
        );

        setCurrentPage(1);

        await loadData();

        return true;
      } catch (err) {
        console.error(
          'Error adding holiday:',
          err
        );

        const message =
          getApiErrorMessage(err);

        setError(message);

        throw new Error(message);
      } finally {
        setMutationLoading(false);
      }
    },
    [loadData]
  );

  /* ==========================================================
     UPDATE
  ========================================================== */

  const updateHoliday = useCallback(
    async (
      id: string,
      data: AdminHolidayFormData
    ) => {
      setMutationLoading(true);
      setError(null);

      try {
        await adminHolidayService.updateHoliday(
          id,
          data
        );

        await loadData();

        return true;
      } catch (err) {
        console.error(
          'Error updating holiday:',
          err
        );

        const message =
          getApiErrorMessage(err);

        setError(message);

        throw new Error(message);
      } finally {
        setMutationLoading(false);
      }
    },
    [loadData]
  );

  /* ==========================================================
     STATUS TOGGLE
  ========================================================== */

  const toggleStatus = useCallback(
    async (
      id: string
    ) => {
      setMutationLoading(true);
      setError(null);

      try {
        const holiday =
          allHolidays.find(
            (item) =>
              item.id === id
          );

        if (!holiday) {
          throw new Error(
            'Holiday not found.'
          );
        }

        await adminHolidayService.toggleHolidayStatus(
          holiday
        );

        await loadData();

        return true;
      } catch (err) {
        console.error(
          'Error changing holiday status:',
          err
        );

        const message =
          getApiErrorMessage(err);

        setError(message);

        throw new Error(message);
      } finally {
        setMutationLoading(false);
      }
    },
    [
      allHolidays,
      loadData,
    ]
  );

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteHoliday = useCallback(
    async (
      id: string
    ) => {
      setMutationLoading(true);
      setError(null);

      try {
        await adminHolidayService.deleteHoliday(
          id
        );

        const filtered =
          allHolidays.filter(
            (holiday) =>
              holiday.id !== id
          );

        setAllHolidays(filtered);

        const searched =
          searchHolidays(
            filtered,
            searchQuery
          );

        const totalPages =
          Math.max(
            1,
            Math.ceil(
              searched.length /
                pageSize
            )
          );

        if (
          currentPage >
          totalPages
        ) {
          setCurrentPage(
            totalPages
          );
        } else {
          await loadData();
        }

        return true;
      } catch (err) {
        console.error(
          'Error deleting holiday:',
          err
        );

        const message =
          getApiErrorMessage(err);

        setError(message);

        throw new Error(message);
      } finally {
        setMutationLoading(false);
      }
    },
    [
      allHolidays,
      currentPage,
      loadData,
      pageSize,
      searchQuery,
    ]
  );

  /* ==========================================================
     SEARCH
  ========================================================== */

  const searchHolidayData =
    useCallback(
      (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
      },
      []
    );

  /* ==========================================================
     PAGE
  ========================================================== */

  const changePage =
    useCallback(
      (page: number) => {
        setCurrentPage(page);
      },
      []
    );

  /* ==========================================================
     PAGE SIZE
  ========================================================== */

  const changePageSize =
    useCallback(
      (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
      },
      []
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    holidays,
    statistics,

    loading,
    mutationLoading,
    error,

    searchQuery,

    currentPage,
    pageSize,
    totalItems:
      searchHolidays(
        allHolidays,
        searchQuery
      ).length,

    addHoliday,
    updateHoliday,
    toggleStatus,
    deleteHoliday,

    searchHolidays:
      searchHolidayData,

    changePage,
    changePageSize,

    reload:
      loadData,
  };
};