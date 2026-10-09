import React from 'react';

import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react';

import type {
  ExpenseStatistics,
} from '../../types/expenses.types';

import { ExpensesStatCard } from '../ExpensesStatCard/ExpensesStatCard';

import './ExpensesStatistics.css';

interface ExpensesStatisticsProps {
  statistics: ExpenseStatistics;
}

export const ExpensesStatistics: React.FC<
  ExpensesStatisticsProps
> = ({ statistics }) => {
  return (
    <div className="expenses-statistics">
      <ExpensesStatCard
        label="Total Expenses"
        value={statistics.total}
        icon={<FileText size={15} />}
      />

      <ExpensesStatCard
        label="Pending"
        value={statistics.pending}
        icon={<Clock3 size={15} />}
      />

      <ExpensesStatCard
        label="Approved"
        value={statistics.approved}
        icon={<CheckCircle2 size={15} />}
      />

      <ExpensesStatCard
        label="Rejected"
        value={statistics.rejected}
        icon={<XCircle size={15} />}
      />
    </div>
  );
};

export default ExpensesStatistics;