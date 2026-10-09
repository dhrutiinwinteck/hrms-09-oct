import { ShiftStatus } from '../types/shiftPatterns.types';

export const PAGE_TITLE = 'Shift Patterns';

export const PAGE_SUBTITLE =
  'Create and manage shift patterns for your organization.';

export const STATUS_OPTIONS: {
  value: ShiftStatus | 'all';
  label: string;
}[] = [
  {
    value: 'all',
    label: 'All Status',
  },
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'inactive',
    label: 'Inactive',
  },
];

export const TABLE_COLUMNS = [
  {
    key: 'index',
    label: '#',
  },
  {
    key: 'name',
    label: 'Shift Name',
  },
  {
    key: 'start',
    label: 'Start Time',
  },
  {
    key: 'end',
    label: 'End Time',
  },
  {
    key: 'duration',
    label: 'Duration',
  },
  {
    key: 'status',
    label: 'Status',
  },
  {
    key: 'actions',
    label: 'Action',
  },
];

export const STATS_CARDS = [
  {
    id: 'total',
    title: 'Total Shift Patterns',
    icon: 'Calendar',
    description: 'All Patterns',
  },
  {
    id: 'active',
    title: 'Active Patterns',
    icon: 'Clock',
    description: 'Currently Active',
  },
  {
    id: 'inactive',
    title: 'Inactive Patterns',
    icon: 'PauseCircle',
    description: 'Currently Inactive',
  },
  {
    id: 'assigned',
    title: 'Employees Assigned',
    icon: 'Users',
    description: 'Across All Patterns',
  },
];