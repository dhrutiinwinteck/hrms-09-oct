import {
  COMP_OFF_DAY_TYPE_LABELS,
  COMP_OFF_STATUS_LABELS,
} from '../constants/compOff.constants';

import type {
  CompOffDayType,
  CompOffRequest,
  CompOffStatus,
} from '../types/compOff.types';

export const formatCompOffDate = (
  value?: string | null,
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCompOffDateTime = (
  value?: string | null,
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) +
    ', ' +
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
};

export const getDayTypeLabel = (
  dayType: CompOffDayType,
): string => {
  return COMP_OFF_DAY_TYPE_LABELS[dayType];
};

export const getStatusLabel = (
  status: CompOffStatus,
): string => {
  return COMP_OFF_STATUS_LABELS[status];
};

export const getStatusClass = (
  status: CompOffStatus,
): string => {
  switch (status) {
    case 'APPROVED':
      return 'approved';

    case 'REJECTED':
      return 'rejected';

    case 'PENDING':
    case 'APPLIED':
      return 'pending';

    default:
      return 'pending';
  }
};

export const calculateCompOffSummary = (
  requests: CompOffRequest[],
) => {
  return {
    totalRequests: requests.length,
    approved: requests.filter(
      (item) => item.status === 'APPROVED',
    ).length,
    pending: requests.filter(
      (item) =>
        item.status === 'PENDING' ||
        item.status === 'APPLIED',
    ).length,
    rejected: requests.filter(
      (item) => item.status === 'REJECTED',
    ).length,
  };
};

export const normalizeDateForApi = (
  value: string,
): string => {
  if (!value) {
    return value;
  }

  return value;
};

export const normalizeCompOffRequest = (
  raw: any,
): CompOffRequest => {
  return {
    requestId:
      raw.request_id ??
      raw.requestId ??
      raw.id,

    employeeId:
      raw.employee_id ??
      raw.employeeId,

    employeeCode:
      raw.employee_code ??
      raw.employeeCode,

    employeeName:
      raw.employee_name ??
      raw.employeeName,

    workedDate:
      raw.worked_date ??
      raw.workedDate,

    dayType:
      raw.day_type ??
      raw.dayType ??
      'PUBLIC_HOLIDAY',

    reason:
      raw.reason ?? '',

    requestedOn:
      raw.requested_on ??
      raw.requestedOn ??
      raw.created_at ??
      raw.createdAt,

    compOffDate:
      raw.comp_off_date ??
      raw.compOffDate ??
      null,

    status:
      String(
        raw.status ?? 'PENDING',
      ).toUpperCase() as CompOffStatus,

    approvedBy:
      raw.approved_by_name ??
      raw.approved_by ??
      raw.approvedBy ??
      null,

    approvedOn:
      raw.approved_on ??
      raw.approvedOn ??
      null,

    rejectedBy:
      raw.rejected_by_name ??
      raw.rejected_by ??
      raw.rejectedBy ??
      null,

    rejectedOn:
      raw.rejected_on ??
      raw.rejectedOn ??
      null,

    remarks:
      raw.remarks ??
      null,

    rejectionReason:
      raw.rejection_reason ??
      raw.rejectionReason ??
      null,

    attachmentUrl:
      raw.attachment_url ??
      raw.attachmentUrl ??
      null,

    quantity:
      Number(raw.quantity ?? 1),

    balanceAfter:
      raw.balance_after ??
      raw.balanceAfter ??
      null,
  };
};