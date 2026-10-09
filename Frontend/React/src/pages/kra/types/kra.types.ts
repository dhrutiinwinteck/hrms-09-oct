export type KRAStatus =
  | "Active"
  | "Inactive";

export interface KRAMasterEntry {
  id: string;

  /**
   * Department to which this KRA applies.
   */
  department: string;

  /**
   * Designation to which this KRA applies.
   *
   * IMPORTANT:
   * Designation is mandatory because KRA assignment
   * is based on Department + Designation.
   */
  designation: string;

  /**
   * KRA / focused area.
   */
  focusedArea: string;

  /**
   * Weightage in percentage.
   *
   * Example:
   * 40 = 40%
   */
  weightage: number;

  /**
   * KRA applicability period.
   */
  fromMonth: string;
  toMonth: string;

  /**
   * KRA year.
   */
  year: number;

  /**
   * Active / Inactive.
   */
  status: KRAStatus;

  remarks?: string;
}

export interface SummaryStats {
  totalRecords: number;
  active: number;
  inactive: number;
  currentQuarter: number;
}

export type KRAMasterFormData =
  Omit<KRAMasterEntry, "id">;