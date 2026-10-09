import React, { useState } from "react";

import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileText,
  Trash2,
} from "lucide-react";

import type { Expense } from "../../types/expenses.types";

import "./ExpensesTable.css";

type ExpenseStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

type ExpenseRole = "hr" | "promoter";

interface ExpensesTableProps {
  expenses: Expense[];
  page: number;
  totalPages: number;
  totalFiltered: number;
  isLoading: boolean;
  isDeleting: boolean;

  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;

  /**
   * Backend HR / Promoter status update callback.
   */
  onStatusChange?: (
    expenseId: string,
    role: ExpenseRole,
    status: ExpenseStatus,
  ) => void;
}

type ExpenseWithWorkflowStatus = Expense & {
  hrStatus?: ExpenseStatus | string;
  promoterStatus?: ExpenseStatus | string;
  hr_status?: ExpenseStatus | string;
  promoter_status?: ExpenseStatus | string;
};

interface StatusOverride {
  hr: ExpenseStatus;
  promoter: ExpenseStatus;
}

const TABLE_COLUMN_COUNT = 15;
const PAGE_SIZE = 10;

const STATUS_OPTIONS: ExpenseStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
];

const formatDate = (date?: string): string => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAmount = (amount?: number): string => {
  if (amount === undefined || amount === null) {
    return "-";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getAttachmentName = (
  expense: Expense,
  index: number,
): string => {
  return expense.attachments?.[index]?.fileName ?? "-";
};

const normalizeStatus = (
  status?: string | number | null,
): ExpenseStatus => {
  if (status === 11 || String(status).toLowerCase() === "approved") {
    return "Approved";
  }

  if (status === 12 || String(status).toLowerCase() === "rejected") {
    return "Rejected";
  }

  return "Pending";
};

const getHrStatus = (
  expense: Expense,
): ExpenseStatus => {
  const workflowExpense =
    expense as ExpenseWithWorkflowStatus;

  return normalizeStatus(
    workflowExpense.hrStatus ??
      workflowExpense.hr_status ??
      expense.status,
  );
};

const getPromoterStatus = (
  expense: Expense,
): ExpenseStatus => {
  const workflowExpense =
    expense as ExpenseWithWorkflowStatus;

  return normalizeStatus(
    workflowExpense.promoterStatus ??
      workflowExpense.promoter_status,
  );
};

const TableHeading: React.FC<{
  label: string;
}> = ({ label }) => {
  return (
    <div className="expenses-table__heading">
      <span>{label}</span>
      <ArrowDownUp size={10} />
    </div>
  );
};

interface StatusCellProps {
  status: ExpenseStatus;
  role: ExpenseRole;
  expenseId: string;
  onChange: (
    expenseId: string,
    role: ExpenseRole,
    status: ExpenseStatus,
  ) => void;
}

const StatusCell: React.FC<StatusCellProps> = ({
  status,
  role,
  expenseId,
  onChange,
}) => {
  return (
    <select
      className={`expenses-table__status expenses-table__status--${status.toLowerCase()}`}
      value={status}
      disabled={false}
      aria-label={`Update ${role} status for expense ${expenseId}`}
      title={`Update ${role} status`}
      style={{
        pointerEvents: "auto",
        cursor: "pointer",
        appearance: "auto",
        WebkitAppearance: "auto",
      }}
      onChange={(event) => {
        const selectedStatus =
          event.target.value as ExpenseStatus;

        onChange(
          expenseId,
          role,
          selectedStatus,
        );
      }}
    >
      {STATUS_OPTIONS.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
};

export const ExpensesTable: React.FC<
  ExpensesTableProps
> = ({
  expenses,
  page,
  totalPages,
  totalFiltered,
  isLoading,
  isDeleting,
  onDelete,
  onPageChange,
  onStatusChange,
}) => {
  /**
   * Stores immediate UI changes.
   *
   * This makes the selected status visible immediately,
   * even before the backend response is received.
   */
  const [statusOverrides, setStatusOverrides] =
    useState<Record<string, StatusOverride>>({});

  const firstEntry =
    totalFiltered === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const lastEntry = Math.min(
    page * PAGE_SIZE,
    totalFiltered,
  );

  const getCurrentStatus = (
    expense: Expense,
    role: ExpenseRole,
  ): ExpenseStatus => {
    const override = statusOverrides[expense.id];

    if (override) {
      return override[role];
    }

    return role === "hr"
      ? getHrStatus(expense)
      : getPromoterStatus(expense);
  };

  const handleStatusChange = (
    expenseId: string,
    role: ExpenseRole,
    status: ExpenseStatus,
  ): void => {
    const expense = expenses.find(
      (item) => item.id === expenseId,
    );

    if (!expense) {
      return;
    }

    const currentHrStatus =
      getCurrentStatus(expense, "hr");

    const currentPromoterStatus =
      getCurrentStatus(expense, "promoter");

    /**
     * Update UI immediately.
     */
    setStatusOverrides((previous) => ({
      ...previous,
      [expenseId]: {
        hr:
          role === "hr"
            ? status
            : currentHrStatus,

        promoter:
          role === "promoter"
            ? status
            : currentPromoterStatus,
      },
    }));

    /**
     * Call parent callback for backend update.
     */
    onStatusChange?.(
      expenseId,
      role,
      status,
    );
  };

  return (
    <div className="expenses-table-card">
      <div className="expenses-table-scroll">
        <table className="expenses-table">
          <thead>
            <tr>
              <th className="expenses-table__delete-column">
                <TableHeading label="Delete" />
              </th>

              <th>
                <TableHeading label="Type" />
              </th>

              <th className="expenses-table__description-column">
                <TableHeading label="Description" />
              </th>

              <th>
                <TableHeading label="Category Name" />
              </th>

              <th className="expenses-table__amount-column">
                <TableHeading label="Amount" />
              </th>

              <th>
                <TableHeading label="Expense From" />
              </th>

              <th>
                <TableHeading label="Expense To" />
              </th>

              <th>
                <TableHeading label="Attachment 1" />
              </th>

              <th>
                <TableHeading label="Attachment 2" />
              </th>

              <th>
                <TableHeading label="Attachment 3" />
              </th>

              <th>
                <TableHeading label="Attachment 4" />
              </th>

              <th>
                <TableHeading label="Attachment 5" />
              </th>

              <th>
                <TableHeading label="On Site Location" />
              </th>

              <th className="expenses-table__status-column">
                <TableHeading label="HR Status" />
              </th>

              <th className="expenses-table__status-column">
                <TableHeading label="Promoter Status" />
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="expenses-table__loading"
                >
                  <div className="expenses-loading">
                    <span className="expenses-loading__spinner" />
                    Loading expenses...
                  </div>
                </td>
              </tr>
            ) : expenses.length > 0 ? (
              expenses.map((expense) => {
                const hrStatus = getCurrentStatus(
                  expense,
                  "hr",
                );

                const promoterStatus =
                  getCurrentStatus(
                    expense,
                    "promoter",
                  );

                return (
                  <tr
                    className="expenses-table__row"
                    key={expense.id}
                  >
                    {/* Delete */}
                    <td className="expenses-table__delete-cell">
                      <button
                        type="button"
                        className="expenses-table__delete-button"
                        onClick={() =>
                          onDelete(expense.id)
                        }
                        disabled={isDeleting}
                        aria-label={`Delete expense ${expense.id}`}
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>

                    {/* Type */}
                    <td>
                      <span className="expenses-table__text">
                        {expense.type || "-"}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="expenses-table__description">
                      <span
                        title={expense.description}
                      >
                        {expense.description || "-"}
                      </span>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="expenses-table__text">
                        {expense.category || "-"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="expenses-table__amount">
                      {formatAmount(expense.amount)}
                    </td>

                    {/* Expense From */}
                    <td>
                      <span className="expenses-table__date">
                        {formatDate(expense.expenseFrom)}
                      </span>
                    </td>

                    {/* Expense To */}
                    <td>
                      <span className="expenses-table__date">
                        {formatDate(expense.expenseTo)}
                      </span>
                    </td>

                    {/* Attachments */}
                    {[0, 1, 2, 3, 4].map(
                      (attachmentIndex) => {
                        const attachmentName =
                          getAttachmentName(
                            expense,
                            attachmentIndex,
                          );

                        return (
                          <td
                            key={`${expense.id}-attachment-${attachmentIndex}`}
                          >
                            {attachmentName !== "-" ? (
                              <div
                                className="expenses-table__attachment"
                                title={attachmentName}
                              >
                                <FileText size={13} />

                                <span>
                                  {attachmentName}
                                </span>
                              </div>
                            ) : (
                              <span className="expenses-table__muted">
                                -
                              </span>
                            )}
                          </td>
                        );
                      },
                    )}

                    {/* On Site Location */}
                    <td>
                      <span
                        className="expenses-table__location"
                        title={
                          expense.onSiteLocation || ""
                        }
                      >
                        {expense.onSiteLocation || "-"}
                      </span>
                    </td>

                    {/* HR Status */}
                    <td className="expenses-table__status-cell">
                      <StatusCell
                        expenseId={expense.id}
                        role="hr"
                        status={hrStatus}
                        onChange={handleStatusChange}
                      />
                    </td>

                    {/* Promoter Status */}
                    <td className="expenses-table__status-cell">
                      <StatusCell
                        expenseId={expense.id}
                        role="promoter"
                        status={promoterStatus}
                        onChange={handleStatusChange}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="expenses-empty"
                >
                  <div className="expenses-empty__content">
                    <div className="expenses-empty__icon">
                      <FileSearch
                        size={27}
                        strokeWidth={1.2}
                      />
                    </div>

                    <h3>No expenses found</h3>

                    <p>
                      Add your first expense to get
                      started
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="expenses-table-footer">
        <span className="expenses-table-footer__summary">
          Showing {firstEntry} to {lastEntry} of{" "}
          {totalFiltered} entries
        </span>

        <div className="expenses-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              onPageChange(page - 1)
            }
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            type="button"
            className="expenses-pagination__active"
            disabled
          >
            {page}
          </button>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() =>
              onPageChange(page + 1)
            }
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesTable;