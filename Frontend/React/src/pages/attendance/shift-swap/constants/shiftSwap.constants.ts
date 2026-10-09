import {
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
} from 'lucide-react';

import type {
  ShiftSwapRequestType,
  ShiftSwapStatus,
} from '../types/shiftSwap.types';

export const SHIFT_SWAP_REQUEST_TYPES: ShiftSwapRequestType[] = [
  'Specific Day',
];

export const SHIFT_SWAP_STATUSES: ShiftSwapStatus[] = [
  'PendingTargetAcceptance',
  'PendingManagerApproval',
  'Approved',
  'Rejected',
];

export const SUMMARY_CONFIG = [
  {
    key: 'Pending',
    label: 'Pending',
    subLabel: 'Requests',
    icon: Users,
  },

  {
    key: 'Approved',
    label: 'Approved',
    subLabel: 'Requests',
    icon: CheckCircle2,
  },

  {
    key: 'Rejected',
    label: 'Rejected',
    subLabel: 'Requests',
    icon: XCircle,
  },

  {
    key: 'On Hold',
    label: 'On Hold',
    subLabel: 'Requests',
    icon: Clock3,
  },
] as const;

export const TABLE_PAGE_SIZE = 5;

export const EMPTY_SHIFT_SWAP_MESSAGE =
  'No shift swap requests found.';

export const SHIFT_SWAP_API_ENDPOINT =
  '/api/v1/shift-swaps';