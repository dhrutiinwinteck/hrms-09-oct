import React, {
  useEffect,
} from 'react';

import {
  FileText,
  X,
} from 'lucide-react';

import expensesImage from '../../../../../assets/images/payslip/expenses.png';

import type {
  ExpenseCreateRequest,
} from '../../types/expenses.types';

import { ExpensesForm } from '../ExpensesForm/ExpensesForm';

import './ExpensesModal.css';

interface ExpensesModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (
    values: ExpenseCreateRequest
  ) => Promise<void>;
}

export const ExpensesModal: React.FC<
  ExpensesModalProps
> = ({
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow = '';
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="expenses-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expenses-modal-title"
    >
      <div
        className="expenses-modal__backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget &&
            !isSaving
          ) {
            onClose();
          }
        }}
      />

      <div className="expenses-modal__dialog">
        <header className="expenses-modal__header">
          <div className="expenses-modal__heading">
            <div className="expenses-modal__title-icon">
              <FileText
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <div>
              <h2 id="expenses-modal-title">
                Add Expenses
              </h2>

              <p>
                Fill in the details below to
                record a new expense
              </p>
            </div>
          </div>

          <button
            type="button"
            className="expenses-modal__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close Add Expenses"
          >
            <X size={15} />
          </button>

          <div className="expenses-modal__art">
            <img
              src={expensesImage}
              alt=""
              aria-hidden="true"
            />

            <div className="expenses-modal__art-copy">
              <strong>
                Manage
                <br />
                Expenses
                <br />
                Efficiently
              </strong>

              <span />
            </div>
          </div>
        </header>

        <ExpensesForm
          isSaving={isSaving}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};

export default ExpensesModal;