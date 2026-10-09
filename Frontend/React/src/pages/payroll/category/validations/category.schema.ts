import type { CategoryFormValues } from '../types/category.types';

export interface CategoryValidationErrors {
  categoryName?: string;
}

export function validateCategory(
  values: CategoryFormValues,
): CategoryValidationErrors {
  const errors: CategoryValidationErrors = {};

  const categoryName =
    values.categoryName.trim();

  if (!categoryName) {
    errors.categoryName =
      'Category name is required.';
  } else if (categoryName.length < 2) {
    errors.categoryName =
      'Category name must contain at least 2 characters.';
  } else if (categoryName.length > 100) {
    errors.categoryName =
      'Category name cannot exceed 100 characters.';
  }

  return errors;
}