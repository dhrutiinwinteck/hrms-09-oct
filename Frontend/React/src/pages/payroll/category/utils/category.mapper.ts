import type {
  Category,
  CategoryFormValues,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

export function mapCategoryToForm(
  category: Category,
): CategoryFormValues {
  return {
    categoryName: category.categoryName,
    status: category.status,
  };
}

export function mapFormToCreateRequest(
  values: CategoryFormValues,
): CreateCategoryRequest {
  return {
    categoryName: values.categoryName.trim(),
    status: values.status,
  };
}

export function mapFormToUpdateRequest(
  values: CategoryFormValues,
): UpdateCategoryRequest {
  return {
    categoryName: values.categoryName.trim(),
    status: values.status,
  };
}