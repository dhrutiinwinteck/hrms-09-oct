import type {
  CompOffDayType,
  CompOffStatus,
} from '../types/compOff.types';

export const COMP_OFF_API = {
  base: '/api/v1/leaves/comp-off',
  my: '/api/v1/leaves/comp-off/my',
  all: '/api/v1/leaves/comp-off/all',
  pending: '/api/v1/leaves/comp-off/pending',
  balance: '/api/v1/leaves/comp-off/balance',
} as const;

export const COMP_OFF_STATUS = {
  APPLIED: 'APPLIED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const satisfies Record<string, CompOffStatus>;

export const COMP_OFF_DAY_TYPES = {
  PUBLIC_HOLIDAY: 'PUBLIC_HOLIDAY',
  WEEK_OFF: 'WEEK_OFF',
} as const satisfies Record<string, CompOffDayType>;

export const COMP_OFF_PAGE_SIZE = 8;

export const COMP_OFF_REASON_MAX_LENGTH = 500;

export const COMP_OFF_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const COMP_OFF_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

export const COMP_OFF_ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
];

export const COMP_OFF_STATUS_LABELS: Record<
  CompOffStatus,
  string
> = {
  APPLIED: 'Applied',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const COMP_OFF_DAY_TYPE_LABELS: Record<
  CompOffDayType,
  string
> = {
  PUBLIC_HOLIDAY: 'Public Holiday',
  WEEK_OFF: 'Week Off',
};