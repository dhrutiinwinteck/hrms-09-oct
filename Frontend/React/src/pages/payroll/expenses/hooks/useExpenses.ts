import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { expensesService } from '../services/expenses.service';

import type {
  Expense,
  ExpenseCreateRequest,
  ExpenseFilters,
  ExpenseStatistics,
  ExpenseUpdateRequest,
} from '../types/expenses.types';

import {
  calculateExpenseStatistics,
  filterExpenses,
  paginateExpenses,
} from '../utils/expenses.utils';

import {
  DEFAULT_EXPENSE_PAGE_SIZE,
} from '../constants/expenses.constants';

export interface UseExpensesReturn {
  expenses: Expense[];
  filteredExpenses: Expense[];
  visibleExpenses: Expense[];
  filters: ExpenseFilters;
  statistics: ExpenseStatistics;
  totalPages: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setPageSize: (value: number) => void;
  setPage: (value: number) => void;
  refresh: () => Promise<void>;
  createExpense: (
    payload: ExpenseCreateRequest
  ) => Promise<Expense>;
  updateExpense: (
    id: string,
    payload: ExpenseUpdateRequest
  ) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
}

export function useExpenses(): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    search: '',
    page: 1,
    pageSize: DEFAULT_EXPENSE_PAGE_SIZE,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await expensesService.getExpenses();

      setExpenses(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load expenses.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredExpenses = useMemo(
    () =>
      filterExpenses(
        expenses,
        filters.search
      ),
    [expenses, filters.search]
  );

  const pagination = useMemo(
    () =>
      paginateExpenses(
        filteredExpenses,
        filters.page,
        filters.pageSize
      ),
    [
      filteredExpenses,
      filters.page,
      filters.pageSize,
    ]
  );

  const statistics = useMemo(
    () => calculateExpenseStatistics(expenses),
    [expenses]
  );

  const setSearch = useCallback((value: string) => {
    setFilters((current) => ({
      ...current,
      search: value,
      page: 1,
    }));
  }, []);

  const setPageSize = useCallback((value: number) => {
    setFilters((current) => ({
      ...current,
      pageSize: value,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((value: number) => {
    setFilters((current) => ({
      ...current,
      page: Math.max(1, value),
    }));
  }, []);

  const createExpense = useCallback(
    async (payload: ExpenseCreateRequest) => {
      try {
        setIsSaving(true);
        setError(null);

        const created =
          await expensesService.createExpense(payload);

        setExpenses((current) => [
          created,
          ...current,
        ]);

        return created;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to create expense.';

        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateExpense = useCallback(
    async (
      id: string,
      payload: ExpenseUpdateRequest
    ) => {
      try {
        setIsSaving(true);
        setError(null);

        const updated =
          await expensesService.updateExpense(
            id,
            payload
          );

        setExpenses((current) =>
          current.map((expense) =>
            expense.id === id
              ? updated
              : expense
          )
        );

        return updated;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to update expense.';

        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true);
        setError(null);

        await expensesService.deleteExpense(id);

        setExpenses((current) =>
          current.filter(
            (expense) => expense.id !== id
          )
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to delete expense.';

        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    expenses,
    filteredExpenses,
    visibleExpenses: pagination.items,
    filters,
    statistics,
    totalPages: pagination.totalPages,
    isLoading,
    isSaving,
    error,
    setSearch,
    setPageSize,
    setPage,
    refresh,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}