import {
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ShiftSwapRequest,
  ShiftSwapStatus,
} from '../../types/shiftSwap.types';

import './ShiftSwapTable.css';

interface ShiftSwapTableProps {
  requests: ShiftSwapRequest[];

  loading: boolean;

  submitting: boolean;

  onAccept: (
    requestId: string,
  ) => Promise<void>;

  onReject: (
    requestId: string,
  ) => Promise<void>;

  onApprove: (
    requestId: string,
  ) => Promise<void>;

  onManagerReject: (
    requestId: string,
  ) => Promise<void>;
}

const PAGE_SIZE = 5;

const ShiftSwapTable = ({
  requests,
  loading,
  submitting,
  onAccept,
  onReject,
  onApprove,
  onManagerReject,
}: ShiftSwapTableProps) => {
  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      requests.length /
        PAGE_SIZE,
    ),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const paginatedRequests =
    useMemo(() => {
      const startIndex =
        (safeCurrentPage - 1) *
        PAGE_SIZE;

      return requests.slice(
        startIndex,
        startIndex + PAGE_SIZE,
      );
    }, [
      requests,
      safeCurrentPage,
    ]);

  const startEntry =
    requests.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          PAGE_SIZE +
        1;

  const endEntry = Math.min(
    safeCurrentPage *
      PAGE_SIZE,
    requests.length,
  );

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages,
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const handlePrevious = () => {
    setCurrentPage(
      (page) =>
        Math.max(
          1,
          page - 1,
        ),
    );
  };

  const handleNext = () => {
    setCurrentPage(
      (page) =>
        Math.min(
          totalPages,
          page + 1,
        ),
    );
  };

  return (
    <section className="shift-swap-table-card">
      <div className="shift-swap-table-card__header">
        <div>
          <h2>
            Shift Swap Requests
          </h2>

          <p>
            View and manage employee shift swap requests.
          </p>
        </div>

        <span className="shift-swap-table-card__total">
          {requests.length} Requests
        </span>
      </div>

      <div className="shift-swap-table-wrapper">
        <table className="shift-swap-table">
          <thead>
            <tr>
              <th>
                Requested By
              </th>

              <th>
                Requested To
              </th>

              <th>
                Request Type
              </th>

              <th>
                Requested On
              </th>

              <th>
                Swap Date
              </th>

              <th>
                Status
              </th>

              <th className="shift-swap-table__action-column">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="shift-swap-table__state"
                >
                  Loading shift swap requests...
                </td>
              </tr>
            ) : paginatedRequests.length ===
              0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="shift-swap-table__state"
                >
                  No shift swap requests found.
                </td>
              </tr>
            ) : (
              paginatedRequests.map(
                (request) => (
                  <tr
                    key={
                      request.id
                    }
                  >
                    <td>
                      <EmployeeCell
                        employee={
                          request.requestedBy
                        }
                      />
                    </td>

                    <td>
                      <EmployeeCell
                        employee={
                          request.requestedTo
                        }
                      />
                    </td>

                    <td>
                      <span className="request-type">
                        {
                          request.requestType
                        }
                      </span>
                    </td>

                    <td>
                      <span className="date-cell">
                        {
                          request.requestedOn
                        }
                      </span>
                    </td>

                    <td>
                      <span className="date-cell">
                        {
                          request.swapDate
                        }
                      </span>
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          request.status
                        }
                      />
                    </td>

                    <td className="shift-swap-table__action-column">
                      <ActionButtons
                        request={
                          request
                        }
                        submitting={
                          submitting
                        }
                        onAccept={
                          onAccept
                        }
                        onReject={
                          onReject
                        }
                        onApprove={
                          onApprove
                        }
                        onManagerReject={
                          onManagerReject
                        }
                      />
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="shift-swap-table-card__footer">
        <span className="shift-swap-table-card__entries">
          {requests.length ===
          0
            ? 'Showing 0 entries'
            : `Showing ${startEntry} to ${endEntry} of ${requests.length} entries`}
        </span>

        <div
          className="shift-swap-pagination"
          aria-label="Table pagination"
        >
          <button
            type="button"
            className="shift-swap-pagination__button"
            onClick={
              handlePrevious
            }
            disabled={
              safeCurrentPage ===
              1
            }
            aria-label="Previous page"
          >
            <ChevronLeft
              size={16}
            />
          </button>

          {Array.from(
            {
              length:
                totalPages,
            },
            (_, index) =>
              index + 1,
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={`shift-swap-pagination__button ${
                safeCurrentPage ===
                page
                  ? 'is-active'
                  : ''
              }`}
              onClick={() => {
                setCurrentPage(
                  page,
                );
              }}
              aria-label={`Go to page ${page}`}
              aria-current={
                safeCurrentPage ===
                page
                  ? 'page'
                  : undefined
              }
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="shift-swap-pagination__button"
            onClick={
              handleNext
            }
            disabled={
              safeCurrentPage ===
              totalPages
            }
            aria-label="Next page"
          >
            <ChevronRight
              size={16}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   ACTION BUTTONS
============================================================ */

interface ActionButtonsProps {
  request: ShiftSwapRequest;

  submitting: boolean;

  onAccept: (
    requestId: string,
  ) => Promise<void>;

  onReject: (
    requestId: string,
  ) => Promise<void>;

  onApprove: (
    requestId: string,
  ) => Promise<void>;

  onManagerReject: (
    requestId: string,
  ) => Promise<void>;
}

const ActionButtons = ({
  request,
  submitting,
  onAccept,
  onReject,
  onApprove,
  onManagerReject,
}: ActionButtonsProps) => {
  if (
    request.status ===
    'PendingTargetAcceptance'
  ) {
    return (
      <div className="shift-swap-table__direct-actions">
        <button
          type="button"
          className="shift-swap-table__edit-button"
          onClick={() =>
            void onAccept(
              request.id,
            )
          }
          disabled={
            submitting
          }
          aria-label="Accept shift swap request"
          title="Accept"
        >
          <Check
            size={15}
            strokeWidth={2}
          />

          <span>
            Accept
          </span>
        </button>

        <button
          type="button"
          className="shift-swap-table__delete-button"
          onClick={() =>
            void onReject(
              request.id,
            )
          }
          disabled={
            submitting
          }
          aria-label="Reject shift swap request"
          title="Reject"
        >
          <X
            size={15}
            strokeWidth={2}
          />

          <span>
            Reject
          </span>
        </button>
      </div>
    );
  }

  if (
    request.status ===
    'PendingManagerApproval'
  ) {
    return (
      <div className="shift-swap-table__direct-actions">
        <button
          type="button"
          className="shift-swap-table__edit-button"
          onClick={() =>
            void onApprove(
              request.id,
            )
          }
          disabled={
            submitting
          }
          aria-label="Approve shift swap request"
          title="Approve"
        >
          <Check
            size={15}
            strokeWidth={2}
          />

          <span>
            Approve
          </span>
        </button>

        <button
          type="button"
          className="shift-swap-table__delete-button"
          onClick={() =>
            void onManagerReject(
              request.id,
            )
          }
          disabled={
            submitting
          }
          aria-label="Reject shift swap request as manager"
          title="Reject"
        >
          <X
            size={15}
            strokeWidth={2}
          />

          <span>
            Reject
          </span>
        </button>
      </div>
    );
  }

  return (
    <span>
      —
    </span>
  );
};

/* ============================================================
   EMPLOYEE CELL
============================================================ */

interface EmployeeCellProps {
  employee:
    ShiftSwapRequest['requestedBy'];
}

const EmployeeCell = ({
  employee,
}: EmployeeCellProps) => {
  const initials =
    employee.name
      .split(' ')
      .map(
        (name) =>
          name.charAt(0),
      )
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div className="employee-cell">
      <div className="employee-cell__avatar">
        {employee.avatar ? (
          <img
            src={
              employee.avatar
            }
            alt=""
          />
        ) : (
          initials
        )}
      </div>

      <div className="employee-cell__details">
        <strong>
          {employee.name}
        </strong>

        <span>
          {employee.employeeCode ||
            employee.designation}
        </span>
      </div>
    </div>
  );
};

/* ============================================================
   STATUS BADGE
============================================================ */

interface StatusBadgeProps {
  status: ShiftSwapStatus;
}

const StatusBadge = ({
  status,
}: StatusBadgeProps) => {
  const statusConfig: Record<
    ShiftSwapStatus,
    {
      label: string;
      className: string;
    }
  > = {
    PendingTargetAcceptance: {
      label:
        'Pending Target Acceptance',

      className:
        'pending',
    },

    PendingManagerApproval: {
      label:
        'Pending Manager Approval',

      className:
        'pending',
    },

    Approved: {
      label:
        'Approved',

      className:
        'approved',
    },

    Rejected: {
      label:
        'Rejected',

      className:
        'rejected',
    },
  };

  const config =
    statusConfig[status];

  return (
    <span
      className={`status-badge status-badge--${config.className}`}
    >
      <span className="status-badge__dot" />

      {config.label}
    </span>
  );
};

export default ShiftSwapTable;