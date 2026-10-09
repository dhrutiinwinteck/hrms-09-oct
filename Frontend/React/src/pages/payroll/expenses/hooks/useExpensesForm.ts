import {
  useCallback,
  useState,
} from 'react';

import type {
  ExpenseAttachment,
  ExpenseCreateRequest,
} from '../types/expenses.types';

import {
  validateExpense,
} from '../validations/expenses.schema';

const INITIAL_VALUES: ExpenseCreateRequest = {
  type: '',

  category: '',

  subCategory: '',

  expenseFrom: '',

  expenseTo: '',

  amount: undefined,

  attachments: [],

  onSiteLocation: '',

  description: '',

  employeeId: null,

  categoryId: null,

  subCategoryId: null,
};

export function useExpensesForm() {
  const [values, setValues] =
    useState<ExpenseCreateRequest>(
      INITIAL_VALUES
    );

  const [errors, setErrors] =
    useState<Record<string, string>>(
      {}
    );

  const updateField = useCallback(
    <
      K extends keyof ExpenseCreateRequest
    >(
      field: K,
      value: ExpenseCreateRequest[K]
    ): void => {
      setValues((current) => ({
        ...current,
        [field]: value,
      }));

      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const nextErrors = {
          ...current,
        };

        delete nextErrors[field];

        return nextErrors;
      });
    },
    []
  );

  const setAttachments = useCallback(
    (
      attachments: ExpenseAttachment[]
    ): void => {
      setValues((current) => ({
        ...current,
        attachments,
      }));

      setErrors((current) => {
        if (!current.attachments) {
          return current;
        }

        const nextErrors = {
          ...current,
        };

        delete nextErrors.attachments;

        return nextErrors;
      });
    },
    []
  );

  const validate = useCallback(
    (): boolean => {
      const result =
        validateExpense(values);

      setErrors(result.errors);

      return result.isValid;
    },
    [values]
  );

  const reset = useCallback(
    (): void => {
      setValues({
        ...INITIAL_VALUES,
        attachments: [],
      });

      setErrors({});
    },
    []
  );

  const setFormValues = useCallback(
    (
      nextValues: ExpenseCreateRequest
    ): void => {
      setValues(nextValues);
      setErrors({});
    },
    []
  );

  return {
    values,

    errors,

    updateField,

    setAttachments,

    setFormValues,

    validate,

    reset,
  };
}