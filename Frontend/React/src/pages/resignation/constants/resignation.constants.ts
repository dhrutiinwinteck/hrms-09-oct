// ---------------------------------------------------------
// Resignation Constants
// Single source of truth for the Resignation module.
// Contains zero UI logic, zero API logic, and zero mock data.
// ---------------------------------------------------------

/**
 * 1. Page Metadata
 */
import { ResignationFilters } from "../types/resignation.types";
export const PAGE_TITLE = "Resignation";
export const PAGE_SUBTITLE =
  "View, track and manage all employee resignation requests in one place.";

/**
 * 2. Breadcrumb Configuration
 */
export const BREADCRUMB = ["Dashboard", "Resignation"];

/**
 * 3. Statistic Card Configuration
 * Used by StatisticsCards component to render metrics.
 * Data values are fetched via API and mapped to apiField.
 */
export const STATISTIC_CARDS = [
  {
    id: "total",
    title: "Total Requests",
    apiField: "totalRequests",
    icon: "Files",
    color: "#2D9CDB",
    trendColor: "#27AE60",
  },
  {
    id: "pending",
    title: "Pending Requests",
    apiField: "pending",
    icon: "Clock",
    color: "#F2994A",
    trendColor: "#F2C94C",
  },
  {
    id: "approved",
    title: "Approved Requests",
    apiField: "approved",
    icon: "CheckCircle",
    color: "#27AE60",
    trendColor: "#27AE60",
  },
  {
    id: "rejected",
    title: "Rejected Requests",
    apiField: "rejected",
    icon: "XCircle",
    color: "#EB5757",
    trendColor: "#EB5757",
  },
] as const;

/**
 * 4. Filter Dropdown Options
 */
export const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Withdrawn", value: "Withdrawn" },
] as const;

export const DEPARTMENT_OPTIONS = [
  { label: "All Department", value: "" },
  { label: "HR", value: "HR" },
  { label: "IT", value: "IT" },
  { label: "Finance", value: "Finance" },
  { label: "Support", value: "Support" },
  { label: "Operations", value: "Operations" },
  { label: "Admin", value: "Admin" },
] as const;

/**
 * 5. Table Column Configuration
 * Used by the reusable enterprise Table component.
 * No JSX; purely structural definitions.
 */
export const RESIGNATION_TABLE_COLUMNS = [
  {
    id: "employee",
    label: "Employee",
    width: "25%",
    sortable: false,
    align: "left",
  },
  {
    id: "details",
    label: "Resignation Details",
    width: "20%",
    sortable: false,
    align: "left",
  },
  {
    id: "reason",
    label: "Reason",
    width: "15%",
    sortable: false,
    align: "left",
  },
  {
    id: "status",
    label: "Status",
    width: "15%",
    sortable: true,
    align: "center",
  },
  {
    id: "approvals",
    label: "Approvals",
    width: "15%",
    sortable: false,
    align: "center",
  },
  {
    id: "actions",
    label: "Actions",
    width: "10%",
    sortable: false,
    align: "right",
  },
] as const;

/**
 * 6. Status Badge Mapping
 * Used by ResignationStatusBadge component to render correct pill styles.
 */
export const RESIGNATION_STATUS = {
  PENDING: {
    label: "Pending",
    color: "#F2994A",
    background: "#FFF3E0",
    border: "#FFB74D",
  },
  APPROVED: {
    label: "Approved",
    color: "#27AE60",
    background: "#E8F5E9",
    border: "#81C784",
  },
  REJECTED: {
    label: "Rejected",
    color: "#EB5757",
    background: "#FFEBEE",
    border: "#EF9A9A",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "#828282",
    background: "#F5F5F5",
    border: "#BDBDBD",
  },
} as const;

/**
 * 7. Approval Stage Configuration
 * Defines the exact sequence of approval workflows.
 */
export const APPROVAL_STAGES = [
  { id: "rm", label: "Reporting Manager", sequence: 1 },
  { id: "hr", label: "HR Manager", sequence: 2 },
  { id: "director", label: "Director", sequence: 3 },
  { id: "ceo", label: "CEO", sequence: 4 },
] as const;

/**
 * 8. Form Dropdown Options
 */
export const RESIGNATION_OPTIONS = [
  { label: "Yes, I want to resign", value: "yes" },
  { label: "No", value: "no" },
] as const;

export const NOTICE_PERIOD_OPTIONS = [
  { label: "15 Days", value: "15" },
  { label: "30 Days", value: "30" },
  { label: "60 Days", value: "60" },
  { label: "90 Days", value: "90" },
] as const;

/**
 * 9. Form Validation Limits
 */
export const MAX_REASON_LENGTH = 500;
export const MIN_REASON_LENGTH = 10;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * 10. Modal Configuration
 */
export const RESIGNATION_MODAL = {
  TITLE: "Apply for Resignation",
  DESCRIPTION:
    "Please fill out the details below to initiate your resignation process.",
  WIDTH: "640px",
  ANIMATION_DURATION: 300,
  OVERLAY_BLUR: "4px",
  PRIMARY_BUTTON: "Submit Request",
  SECONDARY_BUTTON: "Cancel",
} as const;

/**
 * 11. Empty State Configuration
 */
export const EMPTY_STATE = {
  TITLE: "No Resignation Requests Found",
  DESCRIPTION: "Try changing your filters or adjusting your search criteria.",
  ILLUSTRATION: "No Data",
} as const;

/**
 * 12. Pagination Defaults
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/**
 * 13. Sorting Defaults
 */
export const DEFAULT_SORT_BY = "createdAt";
export const DEFAULT_SORT_DIRECTION = "desc";

/**
 * 14. API Endpoints
 * These will be used by the Service layer.
 * Later, switching to FastAPI only requires changing the base URL in axiosInstance.
 */
export const RESIGNATION_API_ENDPOINTS = {
  GET_ALL: "/resignations/",
  GET_BY_ID: "/resignations/:id",
  CREATE: "/resignations/",
  UPDATE: "/resignations/:id",
  DELETE: "/resignations/:id",
} as const;

/**
 * 15. Query Keys (for future React Query integration)
 */
export const RESIGNATION_QUERY_KEYS = {
  ALL: ["resignations"],
  LISTS: ["resignations", "list"],
  DETAILS: ["resignations", "details"],
} as const;

/**
 * 16. Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  CARD: 250,
  MODAL: 300,
  TABLE: 200,
  FILTER: 150,
  BADGE: 100,
} as const;

/**
 * 17. Default Filter State
 */
export const DEFAULT_FILTERS: ResignationFilters = {
  status: undefined,
  department: undefined,
  search: "",
  startDate: undefined,
  endDate: undefined,
  sortBy: DEFAULT_SORT_BY,
  sortDirection: DEFAULT_SORT_DIRECTION,
  dateRange: {
    start: "",
    end: "",
  },
};

/**
 * 18. Form Validation Messages (for consistent UI feedback)
 */
export const VALIDATION_MESSAGES = {
  REASON_REQUIRED: "Please provide a reason for resignation.",
  NOTICE_REQUIRED: "Please select a notice period.",
  DATE_VALID: "Please select valid dates.",
  REASON_MAX_LENGTH: `Reason cannot exceed ${MAX_REASON_LENGTH} characters.`,
  REASON_MIN_LENGTH: `Reason must be at least ${MIN_REASON_LENGTH} characters.`,
  FILE_TYPE: "Only PDF, DOC, and DOCX files are allowed.",
  FILE_SIZE: `File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
} as const;
