import type {
  ExpenseCreateRequest,
} from "../types/expenses.types";

export interface ExpenseValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const isValidDate = (value: string): boolean => {
  if (!value) {
    return false;
  }

  // HTML date input returns YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export const validateExpense = (
  values: ExpenseCreateRequest,
): ExpenseValidationResult => {
  const errors: Record<string, string> = {};

  if (!values.type.trim()) {
    errors.type = "Expense type is required.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!values.expenseFrom) {
    errors.expenseFrom =
      "Expense from date is required.";
  } else if (!isValidDate(values.expenseFrom)) {
    errors.expenseFrom =
      "Enter a valid date.";
  }

  if (!values.expenseTo) {
    errors.expenseTo =
      "Expense to date is required.";
  } else if (!isValidDate(values.expenseTo)) {
    errors.expenseTo =
      "Enter a valid date.";
  }

  if (
    isValidDate(values.expenseFrom) &&
    isValidDate(values.expenseTo) &&
    values.expenseFrom > values.expenseTo
  ) {
    errors.expenseTo =
      "Expense to date must be after or equal to expense from date.";
  }

  if (
    values.amount === undefined ||
    values.amount === null ||
    !Number.isFinite(values.amount) ||
    values.amount <= 0
  ) {
    errors.amount =
      "Amount must be greater than zero.";
  }

  if (
    !values.files ||
    values.files.length === 0
  ) {
    errors.files =
      "At least one attachment is required.";
  }

  if (!values.onSiteLocation.trim()) {
    errors.onSiteLocation =
      "On site location is required.";
  }

  if (!values.description.trim()) {
    errors.description =
      "Description is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};