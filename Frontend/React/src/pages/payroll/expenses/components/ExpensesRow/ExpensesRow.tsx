import React from 'react';

import {
  Trash2,
} from 'lucide-react';

import type {
  Expense,
} from '../../types/expenses.types';

import './ExpensesRow.css';

interface ExpensesRowProps {
  expense: Expense;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const ExpensesRow: React.FC<
  ExpensesRowProps
> = ({
  expense,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <tr className="expenses-row">
      <td className="expenses-row__delete">
        <button
          type="button"
          className="expenses-row__delete-button"
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          aria-label={`Delete ${expense.type}`}
        >
          <Trash2 size={13} />
        </button>
      </td>

      <td className="expenses-row__type">
        <span>{expense.type || '-'}</span>
      </td>

      <td className="expenses-row__description">
        <span>{expense.description || '-'}</span>
      </td>
    </tr>
  );
};

export default ExpensesRow;