import type {
  DesignationFilters,
  DesignationStatus,
} from "../types/designation.types";

export const API_BASE_URL = "http://localhost:3001";

export const DESIGNATION_STATUSES = [
  "Active",
  "Inactive",
] as const;

export const DESIGNATION_STATUS_FILTERS: Array<
  "All" | DesignationStatus
> = [
  "All",
  "Active",
  "Inactive",
];

export const DEFAULT_PAGE_SIZE = 5;

export const INITIAL_FILTERS: DesignationFilters = {
  search: "",
  departmentId: "",
  status: "All",
};

export const DESIGNATION_FORM_INITIAL_VALUES = {
  name: "",
  departmentId: "",
  status: "Active" as DesignationStatus,
};