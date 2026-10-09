import React from 'react';

import './ExpensesStatCard.css';

interface ExpensesStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}

export const ExpensesStatCard: React.FC<
  ExpensesStatCardProps
> = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="expenses-stat-card">
      <div className="expenses-stat-card__icon">
        {icon}
      </div>

      <div>
        <span className="expenses-stat-card__label">
          {label}
        </span>

        <strong className="expenses-stat-card__value">
          {value}
        </strong>
      </div>
    </div>
  );
};

export default ExpensesStatCard;