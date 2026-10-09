import type { SubCategory } from '../types/subCategory.types';

export const SUB_CATEGORY_MOCK_DATA: SubCategory[] = [
  {
    id: 1,
    name: 'T.Miscellaneous',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Travel Expenses',
    status: 'Active',
  },
];

export interface CategoryOption {
  id: number;
  name: string;
}

export const CATEGORY_MOCK_DATA: CategoryOption[] = [
  {
    id: 1,
    name: 'Travel',
  },
  {
    id: 2,
    name: 'Food',
  },
  {
    id: 3,
    name: 'Office Expenses',
  },
  {
    id: 4,
    name: 'Medical',
  },
  {
    id: 5,
    name: 'Miscellaneous',
  },
];