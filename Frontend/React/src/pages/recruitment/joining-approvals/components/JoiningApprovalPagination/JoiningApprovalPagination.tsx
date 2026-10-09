import React from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import './JoiningApprovalPagination.css';

interface PaginationProps {
  currentPage: number;

  totalItems: number;

  pageSize: number;

  onPageChange: (page: number) => void;
}

export const JoiningApprovalPagination: React.FC<
  PaginationProps
> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const totalPages =
    Math.ceil(
      totalItems / pageSize
    );

  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage =
    Math.min(
      Math.max(currentPage, 1),
      totalPages
    );

  const startItem =
    totalItems === 0
      ? 0
      : (
          (safeCurrentPage - 1) *
          pageSize
        ) + 1;

  const endItem =
    Math.min(
      safeCurrentPage * pageSize,
      totalItems
    );

  const handleFirst = (): void => {
    onPageChange(1);
  };

  const handleLast = (): void => {
    onPageChange(totalPages);
  };

  const handlePrev = (): void => {
    onPageChange(
      Math.max(
        1,
        safeCurrentPage - 1
      )
    );
  };

  const handleNext = (): void => {
    onPageChange(
      Math.min(
        totalPages,
        safeCurrentPage + 1
      )
    );
  };

  const getPageNumbers = (): (
    number | string
  )[] => {
    const pages: (
      number | string
    )[] = [];

    const delta = 2;

    const range: number[] = [];

    for (
      let i = 1;
      i <= totalPages;
      i += 1
    ) {
      if (
        i === 1 ||
        i === totalPages ||
        Math.abs(
          i - safeCurrentPage
        ) <= delta
      ) {
        range.push(i);
      }
    }

    let previous: number | null = null;

    for (
      const pageNumber of range
    ) {
      if (
        previous !== null &&
        pageNumber - previous > 1
      ) {
        pages.push('...');
      }

      pages.push(pageNumber);

      previous = pageNumber;
    }

    return pages;
  };

  return (
    <nav
      className="joining-approval-pagination"
      aria-label="Joining approval pagination"
    >
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          onClick={handleFirst}
          disabled={
            safeCurrentPage === 1
          }
          aria-label="First page"
        >
          <ChevronsLeft
            size={15}
            strokeWidth={2}
          />
        </button>

        <button
          type="button"
          onClick={handlePrev}
          disabled={
            safeCurrentPage === 1
          }
          aria-label="Previous page"
        >
          <ChevronLeft
            size={15}
            strokeWidth={2}
          />
        </button>

        {getPageNumbers().map(
          (
            pageNumber,
            index
          ) =>
            typeof pageNumber ===
            'number' ? (
              <button
                type="button"
                key={`page-${pageNumber}`}
                onClick={() =>
                  onPageChange(
                    pageNumber
                  )
                }
                className={
                  pageNumber ===
                  safeCurrentPage
                    ? 'active'
                    : ''
                }
                aria-label={`Page ${pageNumber}`}
                aria-current={
                  pageNumber ===
                  safeCurrentPage
                    ? 'page'
                    : undefined
                }
              >
                {pageNumber}
              </button>
            ) : (
              <span
                key={`ellipsis-${index}`}
                className="ellipsis"
                aria-hidden="true"
              >
                …
              </span>
            )
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={
            safeCurrentPage ===
            totalPages
          }
          aria-label="Next page"
        >
          <ChevronRight
            size={15}
            strokeWidth={2}
          />
        </button>

        <button
          type="button"
          onClick={handleLast}
          disabled={
            safeCurrentPage ===
            totalPages
          }
          aria-label="Last page"
        >
          <ChevronsRight
            size={15}
            strokeWidth={2}
          />
        </button>
      </div>
    </nav>
  );
};