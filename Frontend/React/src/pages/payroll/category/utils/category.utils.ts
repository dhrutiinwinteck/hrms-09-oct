import type { Category } from '../types/category.types';

export function filterCategories(
  categories: Category[],
  searchTerm: string,
): Category[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return categories;
  }

  return categories.filter((category) =>
    category.categoryName
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function sortCategories(
  categories: Category[],
  direction: 'asc' | 'desc',
): Category[] {
  return [...categories].sort((first, second) => {
    const result = first.categoryName.localeCompare(
      second.categoryName,
    );

    return direction === 'asc' ? result : -result;
  });
}