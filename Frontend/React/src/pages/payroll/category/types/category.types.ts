export type CategoryStatus = 'Active' | 'Inactive';

export interface Category {
  id: string;
  categoryName: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  status: CategoryStatus;
}

export interface UpdateCategoryRequest {
  categoryName: string;
  status: CategoryStatus;
}

export interface CategoryFormValues {
  categoryName: string;
  status: CategoryStatus;
}