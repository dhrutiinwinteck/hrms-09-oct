import React from 'react';

import {
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';

import expensesImage from '../../../../../assets/images/payslip/expenses.png';

import './ExpensesHeader.css';

import {
  EXPENSES_FEATURES,
} from '../../constants/expenses.constants';

interface ExpensesHeaderProps {
  onAddExpense: () => void;
}

const featureIcons = {
  file: FileText,
  check: CheckCircle2,
  document: ShieldCheck,
} as const;

export const ExpensesHeader: React.FC<
  ExpensesHeaderProps
> = ({ onAddExpense }) => {
  return (
    <section className="expenses-header">
      <div className="expenses-header__top">
        <div className="expenses-header__content">
          <span className="expenses-header__eyebrow">
            ACCOUNTS
          </span>

          <h1 className="expenses-header__title">
            Expenses
          </h1>

          <p className="expenses-header__description">
            Track and manage all business expenses in one
            place
          </p>

          <div className="expenses-header__features">
            {EXPENSES_FEATURES.map((feature) => {
              const Icon =
                featureIcons[
                  feature.icon as keyof typeof featureIcons
                ];

              return (
                <div
                  className="expenses-feature"
                  key={feature.title}
                >
                  <div className="expenses-feature__icon">
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="expenses-feature__text">
                    <strong>
                      {feature.title}
                    </strong>

                    <span>
                      {feature.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="expenses-header__illustration">
          <img
            src={expensesImage}
            alt="Manage business expenses"
          />

          <button
            type="button"
            className="expenses-header__mobile-action"
            onClick={onAddExpense}
          >
            Add Expense
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExpensesHeader;