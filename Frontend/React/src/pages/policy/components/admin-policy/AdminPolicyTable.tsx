import React, { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Trash2,
} from "lucide-react";

import "./AdminPolicyTable.css";

/* =========================================================
   TYPES
   ========================================================= */

export type PolicyStatus = "Active" | "Inactive";

export interface PolicyItem {
  id: number;
  name: string;
  description: string;
  status: PolicyStatus;
  createdBy: string;
  creatorRole: string;
  lastUpdated: string;
  documentUrl?: string;
}

interface AdminPolicyTableProps {
  policies: PolicyItem[];
  currentPage: number;
  totalItems: number;
  pageSize: number;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  onView: (policy: PolicyItem) => void;
  onDelete: (policy: PolicyItem) => void;
}

/* =========================================================
   COMPONENT
   ========================================================= */

const AdminPolicyTable: React.FC<
  AdminPolicyTableProps
> = ({
  policies,
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onView,
  onDelete,
}) => {
  /* =========================================================
     PAGINATION
     ========================================================= */

  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0
      ? pageSize
      : 10;

  const safeTotalItems =
    Number.isFinite(totalItems) && totalItems >= 0
      ? totalItems
      : 0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      safeTotalItems / safePageSize,
    ),
  );

  const safeCurrentPage = Math.min(
    Math.max(
      Number.isFinite(currentPage)
        ? currentPage
        : 1,
      1,
    ),
    totalPages,
  );

  /* =========================================================
     DISPLAY RANGE
     ========================================================= */

  const startItem =
    safeTotalItems === 0
      ? 0
      : (safeCurrentPage - 1) *
          safePageSize +
        1;

  const endItem =
    safeTotalItems === 0
      ? 0
      : Math.min(
          safeCurrentPage *
            safePageSize,
          safeTotalItems,
        );

  /* =========================================================
     PAGE NUMBERS
     ========================================================= */

  const pageNumbers = useMemo<number[]>(
    () => {
      if (totalPages <= 5) {
        return Array.from(
          { length: totalPages },
          (_, index) => index + 1,
        );
      }

      if (safeCurrentPage <= 3) {
        return [1, 2, 3, 4, 5];
      }

      if (
        safeCurrentPage >=
        totalPages - 2
      ) {
        return [
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      }

      return [
        safeCurrentPage - 2,
        safeCurrentPage - 1,
        safeCurrentPage,
        safeCurrentPage + 1,
        safeCurrentPage + 2,
      ];
    },
    [safeCurrentPage, totalPages],
  );

  /* =========================================================
     SERIAL NUMBER
     
     Page 1, page size 10:
       1  2  3 ... 10

     Page 2, page size 10:
       11 12 13 ... 20

     Page 3, page size 10:
       21 22 23 ... 30
     ========================================================= */

  const getSerialNumber = (
    index: number,
  ): number => {
    return (
      (safeCurrentPage - 1) *
        safePageSize +
      index +
      1
    );
  };

  /* =========================================================
     HANDLERS
     ========================================================= */

  const handlePrevious = (): void => {
    if (safeCurrentPage > 1) {
      onPageChange(
        safeCurrentPage - 1,
      );
    }
  };

  const handleNext = (): void => {
    if (
      safeCurrentPage <
      totalPages
    ) {
      onPageChange(
        safeCurrentPage + 1,
      );
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const newPageSize =
      Number(event.target.value);

    if (
      Number.isFinite(newPageSize) &&
      newPageSize > 0
    ) {
      onPageSizeChange(
        newPageSize,
      );
    }
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="admin-policy-table">
      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="admin-policy-table__scroll">
        <table className="admin-policy-table__element">
          {/* =================================================
              COLUMN DEFINITIONS
              ================================================= */}

          <colgroup>
            <col className="admin-policy-table__col-serial" />

            <col className="admin-policy-table__col-policy" />

            <col className="admin-policy-table__col-description" />

            <col className="admin-policy-table__col-status" />

            <col className="admin-policy-table__col-creator" />

            <col className="admin-policy-table__col-date" />

            <col className="admin-policy-table__col-actions" />
          </colgroup>

          {/* =================================================
              TABLE HEADER
              ================================================= */}

          <thead>
            <tr>
              {/* SR. NO. */}

              <th className="admin-policy-table__serial-heading">
                Sr. No.
              </th>

              {/* POLICY NAME */}

              <th>
                Policy Name
              </th>

              {/* DESCRIPTION */}

              <th>
                Description
              </th>

              {/* STATUS */}

              <th>
                Status
              </th>

              {/* CREATED BY */}

              <th>
                Created By
              </th>

              {/* LAST UPDATED */}

              <th>
                Last Updated
              </th>

              {/* ACTIONS */}

              <th className="admin-policy-table__actions-heading">
                Actions
              </th>
            </tr>
          </thead>

          {/* =================================================
              TABLE BODY
              ================================================= */}

          <tbody>
            {policies.length > 0 ? (
              policies.map(
                (
                  policy,
                  index,
                ) => (
                  <tr
                    key={
                      policy.id
                    }
                  >
                    {/* =========================================
                        SR. NO.
                        ========================================= */}

                    <td className="admin-policy-table__serial">
                      {getSerialNumber(
                        index,
                      )}
                    </td>

                    {/* =========================================
                        POLICY NAME
                        ========================================= */}

                    <td>
                      <div className="admin-policy-table__policy-name">
                        <FileText
                          size={17}
                          strokeWidth={
                            1.8
                          }
                          aria-hidden="true"
                        />

                        <span
                          title={
                            policy.name
                          }
                          className="admin-policy-table__policy-name-text"
                        >
                          {
                            policy.name
                          }
                        </span>
                      </div>
                    </td>

                    {/* =========================================
                        DESCRIPTION
                        ========================================= */}

                    <td>
                      <div
                        className="admin-policy-table__description"
                        title={
                          policy.description
                        }
                      >
                        {
                          policy.description
                        }
                      </div>
                    </td>

                    {/* =========================================
                        STATUS
                        ========================================= */}

                    <td>
                      <span
                        className={`admin-policy-table__status ${
                          policy.status ===
                          "Active"
                            ? "admin-policy-table__status--active"
                            : "admin-policy-table__status--inactive"
                        }`}
                      >
                        <span
                          className="admin-policy-table__status-dot"
                          aria-hidden="true"
                        />

                        {
                          policy.status
                        }
                      </span>
                    </td>

                    {/* =========================================
                        CREATED BY
                        ========================================= */}

                    <td>
                      <div className="admin-policy-table__creator">
                        <div className="admin-policy-table__creator-info">
                          <strong
                            title={
                              policy.createdBy
                            }
                          >
                            {
                              policy.createdBy
                            }
                          </strong>
                        </div>
                      </div>
                    </td>

                    {/* =========================================
                        LAST UPDATED
                        ========================================= */}

                    <td>
                      <div className="admin-policy-table__date">
                        {
                          policy.lastUpdated
                        }
                      </div>
                    </td>

                    {/* =========================================
                        ACTIONS
                        ========================================= */}

                    <td>
                      <div className="admin-policy-table__actions">
                        {/* VIEW */}

                        <button
                          type="button"
                          className="admin-policy-table__action admin-policy-table__action--view"
                          onClick={() =>
                            onView(
                              policy,
                            )
                          }
                          title="View Policy"
                          aria-label={`View ${policy.name}`}
                        >
                          <Eye
                            size={16}
                            strokeWidth={
                              1.8
                            }
                            aria-hidden="true"
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="admin-policy-table__action admin-policy-table__action--delete"
                          onClick={() =>
                            onDelete(
                              policy,
                            )
                          }
                          title="Delete Policy"
                          aria-label={`Delete ${policy.name}`}
                        >
                          <Trash2
                            size={16}
                            strokeWidth={
                              1.8
                            }
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="admin-policy-table__empty-cell"
                >
                  <div className="admin-policy-table__empty">
                    <div className="admin-policy-table__empty-icon">
                      <FileText
                        size={25}
                        strokeWidth={
                          1.7
                        }
                        aria-hidden="true"
                      />
                    </div>

                    <strong>
                      No policies found
                    </strong>

                    <span>
                      Try changing the
                      filters or add a
                      new policy.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="admin-policy-table__footer">
        {/* ENTRY INFORMATION */}

        <div className="admin-policy-table__entries">
          Showing{" "}
          {startItem} to{" "}
          {endItem} of{" "}
          {safeTotalItems} entries
        </div>

        {/* PAGINATION */}

        <div className="admin-policy-table__pagination">
          {/* PAGE SIZE */}

          <label
            className="admin-policy-table__page-size-wrapper"
            htmlFor="policy-page-size"
          >
            <span className="admin-policy-table__page-size-label">
              Show
            </span>

            <select
              id="policy-page-size"
              className="admin-policy-table__page-size"
              value={safePageSize}
              onChange={
                handlePageSizeChange
              }
              aria-label="Policies per page"
            >
              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>
            </select>

            <span className="admin-policy-table__page-size-label">
              / page
            </span>
          </label>

          {/* PREVIOUS */}

          <button
            type="button"
            className="admin-policy-table__navigation-button"
            onClick={
              handlePrevious
            }
            disabled={
              safeCurrentPage <=
              1
            }
            aria-label="Previous page"
          >
            <ChevronLeft
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <span>
              Previous
            </span>
          </button>

          {/* PAGE NUMBERS */}

          <div className="admin-policy-table__pages">
            {pageNumbers.map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  className={`admin-policy-table__page ${
                    page ===
                    safeCurrentPage
                      ? "admin-policy-table__page--active"
                      : ""
                  }`}
                  onClick={() =>
                    onPageChange(
                      page,
                    )
                  }
                  aria-current={
                    page ===
                    safeCurrentPage
                      ? "page"
                      : undefined
                  }
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              ),
            )}

            {/* ELLIPSIS + LAST PAGE */}

            {totalPages > 5 &&
              safeCurrentPage <
                totalPages -
                  2 && (
                <>
                  <span
                    className="admin-policy-table__ellipsis"
                    aria-hidden="true"
                  >
                    ...
                  </span>

                  {!pageNumbers.includes(
                    totalPages,
                  ) && (
                    <button
                      type="button"
                      className="admin-policy-table__page"
                      onClick={() =>
                        onPageChange(
                          totalPages,
                        )
                      }
                      aria-label={`Go to page ${totalPages}`}
                    >
                      {
                        totalPages
                      }
                    </button>
                  )}
                </>
              )}
          </div>

          {/* NEXT */}

          <button
            type="button"
            className="admin-policy-table__navigation-button"
            onClick={
              handleNext
            }
            disabled={
              safeCurrentPage >=
                totalPages ||
              safeTotalItems === 0
            }
            aria-label="Next page"
          >
            <span>
              Next
            </span>

            <ChevronRight
              size={15}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPolicyTable;