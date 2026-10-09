import React from 'react';

import type {
  ExpenseStatus,
} from '../../types/expenses.types';

import './ExpensesStatusBadge.css';

interface ExpensesStatusBadgeProps {
  status: ExpenseStatus;
}

export const ExpensesStatusBadge: React.FC<
  ExpensesStatusBadgeProps
> = ({ status }) => {
  return (
    <span
      className={`expenses-status-badge expenses-status-badge--${status.toLowerCase()}`}
    >
      {status}
    </span>
  );
};

export default ExpensesStatusBadge;