import type { CategoryStatus } from '../types/category.types';

export const CATEGORY_API_ENDPOINT = '/categories';

export const CATEGORY_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export const DEFAULT_CATEGORY_PAGE_SIZE = 10;

export const DEFAULT_CATEGORY_STATUS: CategoryStatus = 'Active';

export const CATEGORY_STATUS_OPTIONS: CategoryStatus[] = [
  'Active',
  'Inactive',
];