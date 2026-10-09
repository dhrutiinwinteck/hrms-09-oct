// ============================================================
// RESIGNATION MAPPER
// Enterprise Data Transformation Layer.
// Converts Backend DTOs to Frontend Models and vice versa.
// Future API changes only require updates in this file.
// ============================================================

import {
  Resignation,
  Employee,
  Approval,
  CreateResignationPayload,
  ResignationStatus,
  PaginationState,
} from '../types/resignation.types';

// ============================================================
// DTO INTERFACES (MOCKING FASTAPI CONTRACT)
// These represent what the backend sends/receives.
// ============================================================
export interface ResignationResponseDTO {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  employeeDepartment: string;
  employeeAvatarUrl?: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  details?: string;
  status: ResignationStatus;
  approvals: ApprovalDTO[];
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalDTO {
  approverId: string;
  approverName: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp?: string;
  notes?: string;
}

export interface CreateResignationRequestDTO {
  employeeId: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason: string;
  details?: string;
  // Note: Files are typically sent via FormData, not JSON
}

export interface PaginationResponseDTO {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// ============================================================
// MAPPER FUNCTIONS
// ============================================================

/**
 * Maps a Backend DTO to a Frontend Resignation Model.
 * Handles complex object construction and string-to-date conversions.
 * 
 * @param dto - The raw object received from the API.
 * @returns A strictly typed Resignation entity for the UI.
 */
export const mapResignationDtoToModel = (dto: ResignationResponseDTO): Resignation => {
  // Construct the nested Employee object
  const employee: Employee = {
    id: dto.employeeId,
    fullName: dto.employeeName,
    designation: dto.employeeDesignation,
    department: dto.employeeDepartment,
    avatarUrl: dto.employeeAvatarUrl || '',
  };

  // Map the nested approvals array
  const approvals: Approval[] = dto.approvals.map((approvalDto) => ({
    approverId: approvalDto.approverId,
    approverName: approvalDto.approverName,
    status: approvalDto.status,
    timestamp: approvalDto.timestamp || new Date().toISOString(),
  }));

  return {
    id: dto.id,
    employee,
    resignationDate: dto.resignationDate,
    lastWorkingDate: dto.lastWorkingDate,
    reason: dto.reason as Resignation['reason'],
    details: dto.details || '',
    status: dto.status,
    approvals,
    attachmentUrl: dto.attachmentUrl || '',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
};

/**
 * Maps a Frontend Model to a Create Request DTO for the Backend.
 * Strips away UI-specific computed properties.
 * 
 * @param model - The validated frontend payload.
 * @returns The object structure expected by the POST endpoint.
 */
export const mapModelToCreateRequest = (model: CreateResignationPayload): CreateResignationRequestDTO => {
  return {
    employeeId: model.employeeId,
    resignationDate: model.resignationDate,
    lastWorkingDate: model.lastWorkingDate,
    reason: model.reason,
    details: model.details,
  };
};

/**
 * Maps a Frontend Model to an Update Request DTO.
 * Supports partial updates (PATCH).
 * 
 * @param model - The partial frontend payload.
 * @returns The object structure expected by the PATCH endpoint.
 */
export const mapModelToUpdateRequest = (
  model: Partial<CreateResignationPayload>
): Partial<CreateResignationRequestDTO> => {
  return {
    ...(model.employeeId && { employeeId: model.employeeId }),
    ...(model.resignationDate && { resignationDate: model.resignationDate }),
    ...(model.lastWorkingDate && { lastWorkingDate: model.lastWorkingDate }),
    ...(model.reason && { reason: model.reason }),
    ...(model.details && { details: model.details }),
  };
};

/**
 * Maps the backend pagination response to the frontend PaginationState.
 * 
 * @param dto - The pagination metadata from the API response.
 * @returns A normalized PaginationState object.
 */
export const mapPagination = (dto: PaginationResponseDTO): PaginationState => {
  return {
    page: dto.currentPage,
    limit: dto.pageSize,
    total: dto.totalItems,
    totalPages: dto.totalPages,
  };
};

/**
 * Maps an Approval DTO to the frontend Approval model.
 * 
 * @param dto - The raw approval data.
 * @returns A formatted Approval object.
 */
export const mapApprovalResponse = (dto: ApprovalDTO): Approval => {
  return {
    approverId: dto.approverId,
    approverName: dto.approverName,
    status: dto.status,
    timestamp: dto.timestamp || new Date().toISOString(),
  };
};