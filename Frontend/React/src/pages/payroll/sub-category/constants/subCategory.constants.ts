export const SUB_CATEGORY_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_SUB_CATEGORY_PAGE_SIZE = 10;

export const SUB_CATEGORY_TABLE_COLUMNS = {
  NAME: 'Sub Category Name',
  STATUS: 'Status',
  ACTION: 'Action',
} as const;

export const SUB_CATEGORY_MESSAGES = {
  EMPTY: 'No sub categories found.',
  SEARCH_EMPTY: 'No sub categories match your search.',
  LOAD_ERROR: 'Unable to load sub categories.',
} as const;