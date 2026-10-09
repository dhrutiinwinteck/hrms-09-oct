export type CompOffDayType =
  | 'PUBLIC_HOLIDAY'
  | 'WEEK_OFF';

export type CompOffStatus =
  | 'APPLIED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

export interface CompOffRequest {
  requestId: number;
  employeeId?: number | string;
  employeeCode?: string;
  employeeName?: string;
  workedDate: string;
  dayType: CompOffDayType;
  reason: string;
  requestedOn: string;
  compOffDate?: string | null;
  status: CompOffStatus;
  approvedBy?: string | null;
  approvedByName?: string | null;
  approvedOn?: string | null;
  rejectedBy?: string | null;
  rejectedByName?: string | null;
  rejectedOn?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  attachmentUrl?: string | null;
  quantity?: number;
  balanceAfter?: number | null;
}

export interface CreateCompOffRequest {
  workedDate: string;
  dayType: CompOffDayType;
  reason: string;
  attachment?: File | null;
}

export interface ApproveCompOffRequest {
  compOffDate: string;
  remarks?: string;
}

export interface RejectCompOffRequest {
  rejectionReason: string;
}

export interface CompOffFilters {
  status: 'ALL' | CompOffStatus;
  dayType: 'ALL' | CompOffDayType;
  fromDate: string;
  toDate: string;
  search: string;
}

export interface CompOffSummary {
  totalRequests: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface CompOffBalance {
  totalEarned: number;
  used: number;
  available: number;
}

export interface CompOffRequestDetails {
  request: CompOffRequest;
}

export interface CompOffListResponse {
  items: CompOffRequest[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface CompOffApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}
