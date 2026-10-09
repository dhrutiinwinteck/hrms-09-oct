export interface ExpenseAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface Expense {
  id: string;
  type: string;
  description: string;

  category?: string;
  subCategory?: string;

  expenseFrom?: string;
  expenseTo?: string;

  onSiteLocation?: string;
  amount?: number;
  expenseDate?: string;

  status?: ExpenseStatus;

  employeeId?: string | null;
  categoryId?: number | null;
  subCategoryId?: number | null;

  attachments?: ExpenseAttachment[];

  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Paid";


export type ExpenseWorkflowRole = "hr" | "promoter";


export interface Expense {
  id: string;
  type: string;
  description: string;

  category?: string;
  subCategory?: string;

  expenseFrom?: string;
  expenseTo?: string;

  onSiteLocation?: string;
  amount?: number;
  expenseDate?: string;

  status?: ExpenseStatus;

  // Add these fields
  hrStatus?: ExpenseStatus;
  promoterStatus?: ExpenseStatus;

  employeeId?: string | null;
  categoryId?: number | null;
  subCategoryId?: number | null;

  attachments?: ExpenseAttachment[];

  createdAt?: string;
  updatedAt?: string;
}


export interface ExpenseCreateRequest {
  /**
   * Frontend display value.
   * Example: Travel, Food, Accommodation
   */
  type: string;

  /**
   * Backend type:
   * 0 = admin entry
   * employee ID = employee entry
   */
  backendType?: number;

  category: string;
  subCategory: string;

  /**
   * Backend category IDs
   */
  categoryId: number | null;
  subCategoryId: number | null;

  expenseFrom: string;
  expenseTo: string;

  amount: number | undefined;

  /**
   * Actual uploaded files
   */
  files: File[];

  onSiteLocation: string;
  description: string;

  employeeId?: string | null;
}

export interface ExpenseUpdateRequest
  extends Partial<ExpenseCreateRequest> {
  status?: ExpenseStatus;
}

export interface ExpenseFilters {
  search: string;
  page: number;
  pageSize: number;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExpenseStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
}