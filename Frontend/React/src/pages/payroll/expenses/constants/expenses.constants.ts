export const EXPENSES_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_EXPENSE_PAGE_SIZE = 10;

export const EXPENSES_TABLE_COLUMNS = [
  {
    key: 'delete',
    label: 'Delete',
  },
  {
    key: 'type',
    label: 'Type',
  },
  {
    key: 'description',
    label: 'Description',
  },
] as const;

export const EXPENSES_FEATURES = [
  {
    title: 'Better Tracking',
    description: 'Keep all expenses organized',
    icon: 'file',
  },
  {
    title: 'Policy Compliant',
    description: 'Stay within company policy',
    icon: 'check',
  },
  {
    title: 'Transparent Records',
    description: 'Maintain clear documentation',
    icon: 'document',
  },
] as const;