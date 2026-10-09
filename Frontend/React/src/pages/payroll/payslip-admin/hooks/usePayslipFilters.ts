import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_PAYSLIP_PAGE_SIZE,
} from '../constants/payslipAdmin.constants';

import type {
  PayslipFilterState,
  PayslipRecord,
} from '../types/payslipAdmin.types';

export const usePayslipFilters = (
  payslips: PayslipRecord[],
) => {
  const [
    filters,
    setFilters,
  ] = useState<PayslipFilterState>({
    search: '',
    page: 1,
    pageSize: DEFAULT_PAYSLIP_PAGE_SIZE,
  });

  const filteredPayslips = useMemo(() => {
    const search = filters.search
      .trim()
      .toLowerCase();

    if (!search) {
      return payslips;
    }

    return payslips.filter((payslip) =>
      [
        payslip.name,
        payslip.employeeId,
        payslip.month,
        payslip.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [filters.search, payslips]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPayslips.length / filters.pageSize,
    ),
  );

  const currentPage = Math.min(
    filters.page,
    totalPages,
  );

  const paginatedPayslips = useMemo(() => {
    const start =
      (currentPage - 1) * filters.pageSize;

    return filteredPayslips.slice(
      start,
      start + filters.pageSize,
    );
  }, [
    currentPage,
    filteredPayslips,
    filters.pageSize,
  ]);

  const setSearch = useCallback(
    (search: string) => {
      setFilters((previous) => ({
        ...previous,
        search,
        page: 1,
      }));
    },
    [],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      setFilters((previous) => ({
        ...previous,
        pageSize,
        page: 1,
      }));
    },
    [],
  );

  const setPage = useCallback(
    (page: number) => {
      setFilters((previous) => ({
        ...previous,
        page: Math.max(
          1,
          Math.min(page, totalPages),
        ),
      }));
    },
    [totalPages],
  );

  return {
    filters,
    filteredPayslips,
    paginatedPayslips,
    currentPage,
    totalPages,
    setSearch,
    setPageSize,
    setPage,
  };
};