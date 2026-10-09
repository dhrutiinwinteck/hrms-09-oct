// src/pages/shifts/types/shiftPatterns.types.ts

export type ShiftStatus = 'active' | 'inactive';

export type ShiftType = 'morning' | 'afternoon' | 'night';

export interface ShiftPattern {
  id: string;

  name: string;

  startTime: string;

  endTime: string;

  duration: string;

  status: ShiftStatus;

  shiftType: ShiftType;

  createdBy?: string;

  createdDate?: string;

  modifiedBy?: string | null;

  modifiedDate?: string | null;
}

export interface ShiftPatternFormData {
  shiftName: string;

  startTime: string;

  endTime: string;
}

export interface ShiftPatternFilters {
  searchTerm: string;

  status: ShiftStatus | 'all';
}

export interface ShiftPatternStats {
  total: number;

  active: number;

  inactive: number;

  assigned: number;
}

/**
 * Exact response returned by:
 *
 * GET /api/v1/shift-patterns
 *
 * POST /api/v1/shift-patterns
 */
export interface ShiftPatternApiResponse {
  pattern_id: number;

  pattern_name: string;

  start_time: string;

  end_time: string;

  created_by: string;

  created_date: string;

  modified_by?: string | null;

  modified_date?: string | null;
}

/**
 * Exact response returned by:
 *
 * DELETE /api/v1/shift-patterns/{pattern_id}
 */
export interface ShiftPatternDeleteApiResponse {
  message: string;

  pattern_id: number;
}