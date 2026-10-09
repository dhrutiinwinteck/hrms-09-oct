import type { SubCategory } from '../types/subCategory.types';

export const filterSubCategories = (
  items: SubCategory[],
  search: string,
): SubCategory[] => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch),
  );
};

export const paginateSubCategories = (
  items: SubCategory[],
  page: number,
  pageSize: number,
): SubCategory[] => {
  const startIndex = (page - 1) * pageSize;

  return items.slice(startIndex, startIndex + pageSize);
};