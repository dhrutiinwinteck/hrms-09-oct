import type {
  Expense,
  ExpenseStatistics,
  PaginatedExpenses,
} from '../types/expenses.types';

export function filterExpenses(
  expenses: Expense[],
  search: string
): Expense[] {
  const normalizedSearch = search
    .trim()
    .toLowerCase();

  if (!normalizedSearch) {
    return expenses;
  }

  return expenses.filter((expense) =>
    [
      expense.type,
      expense.description,
      expense.status,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(normalizedSearch)
      )
  );
}

export function paginateExpenses(
  expenses: Expense[],
  page: number,
  pageSize: number
): PaginatedExpenses {
  const safePageSize = Math.max(1, pageSize);

  const total = expenses.length;

  const totalPages =
    total === 0
      ? 1
      : Math.ceil(total / safePageSize);

  const safePage = Math.min(
    Math.max(1, page),
    totalPages
  );

  const startIndex =
    (safePage - 1) * safePageSize;

  return {
    items: expenses.slice(
      startIndex,
      startIndex + safePageSize
    ),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export function calculateExpenseStatistics(
  expenses: Expense[]
): ExpenseStatistics {
  return {
    total: expenses.length,
    pending: expenses.filter(
      (expense) => expense.status === 'Pending'
    ).length,
    approved: expenses.filter(
      (expense) => expense.status === 'Approved'
    ).length,
    rejected: expenses.filter(
      (expense) => expense.status === 'Rejected'
    ).length,
    paid: expenses.filter(
      (expense) => expense.status === 'Paid'
    ).length,
  };
}

export function formatExpenseCount(
  count: number
): string {
  return `${count}`;
}