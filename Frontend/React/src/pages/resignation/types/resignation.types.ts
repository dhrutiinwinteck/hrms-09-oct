// ---------------------------------------------------------
// Resignation Types
// Defines the data structures used throughout the Resignation module.
// ---------------------------------------------------------

/**
 * Represents the status of a resignation request.
 */
export type ResignationStatus = 
  | 'Pending' 
  | 'Pending RM Approval' 
  | 'Pending HR Approval' 
  | 'Approved' 
  | 'Rejected' 
  | 'Withdrawn';

/**
 * Represents the reason for resignation.
 */
export type ResignationReason = 
  | 'Career Growth' 
  | 'Personal Reasons' 
  | 'Higher Studies' 
  | 'Relocation' 
  | 'Work Environment' 
  | 'Other' 
  | 'Better Opportunity';

/**
 * Represents an employee's basic information.
 */
export interface Employee {
  id: string;
  avatarUrl: string;
  fullName: string;
  designation: string;
  department: string;
}

/**
 * Represents an approval action taken by a manager/HR.
 */
export interface Approval {
  approverId: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string; // ISO date string
}

/**
 * Core Resignation entity.
 */
export interface Resignation {
  id: string;
  employee: Employee;
  resignationDate: string; // ISO date string
  lastWorkingDate: string; // ISO date string
  reason: ResignationReason;
  details?: string;
  status: ResignationStatus;
  approvals: Approval[];
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Statistics data for the dashboard cards.
 */
export interface ResignationStatistics {
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Pagination state for the table.
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Filtering options for the resignation list.
 */
export interface ResignationFilters {
  status?: ResignationStatus;
  department?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * State for the New Resignation Modal.
 */
export interface ResignationModalState {
  isOpen: boolean;
  isSubmitting: boolean;
}

/**
 * Payload for creating a new resignation.
 */
export interface CreateResignationPayload {
  employeeId: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: ResignationReason;
  details?: string;
  attachment?: File;
}