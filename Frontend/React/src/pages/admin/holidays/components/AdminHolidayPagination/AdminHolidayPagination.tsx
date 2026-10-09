import React from 'react';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import './AdminHolidayPagination.css';

interface AdminHolidayPaginationProps {
  currentPage: number;

  totalItems: number;

  pageSize: number;

  onPageChange: (
    page: number,
  ) => void;
}

export const AdminHolidayPagination: React.FC<
  AdminHolidayPaginationProps
> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {

  const totalPages =
    Math.ceil(
      totalItems /
        pageSize,
    );


  if (
    totalPages <= 1
  ) {
    return null;
  }


  const getPageNumbers = (): (
    number | string
  )[] => {

    const pages: (
      number | string
    )[] = [];

    const showPages = 5;


    if (
      totalPages <=
      showPages
    ) {

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {

        pages.push(
          page,
        );

      }

      return pages;
    }


    pages.push(1);


    let start =
      Math.max(
        2,
        currentPage - 1,
      );

    let end =
      Math.min(
        totalPages - 1,
        currentPage + 1,
      );


    if (
      currentPage <= 2
    ) {

      end = 4;

    } else if (
      currentPage >=
      totalPages - 1
    ) {

      start =
        totalPages - 3;

    }


    if (
      start > 2
    ) {

      pages.push(
        '...',
      );

    }


    for (
      let page = start;
      page <= end;
      page++
    ) {

      pages.push(
        page,
      );

    }


    if (
      end <
      totalPages - 1
    ) {

      pages.push(
        '...',
      );

    }


    pages.push(
      totalPages,
    );


    return pages;
  };


  const handlePrevious =
    (): void => {

      if (
        currentPage > 1
      ) {

        onPageChange(
          currentPage - 1,
        );

      }
    };


  const handleNext =
    (): void => {

      if (
        currentPage <
        totalPages
      ) {

        onPageChange(
          currentPage + 1,
        );

      }
    };


  const isFirst =
    currentPage === 1;

  const isLast =
    currentPage ===
    totalPages;


  return (
    <div className="admin-holiday-pagination">

      {/* ====================================================
          PREVIOUS
      ==================================================== */}

      <button
        type="button"
        className={`admin-holiday-pagination-btn ${
          isFirst
            ? 'admin-holiday-pagination-disabled'
            : ''
        }`}
        onClick={
          handlePrevious
        }
        disabled={
          isFirst
        }
      >

        <ChevronLeft
          size={16}
        />

        <span>
          Previous
        </span>

      </button>


      {/* ====================================================
          PAGE NUMBERS
      ==================================================== */}

      <div className="admin-holiday-pagination-pages">

        {getPageNumbers().map(
          (
            page,
            index,
          ) => {

            const isEllipsis =
              typeof page ===
              'string';

            const isActive =
              page ===
              currentPage;


            return (
              <button
                key={`${page}-${index}`}
                type="button"
                className={`admin-holiday-pagination-page ${
                  isActive
                    ? 'admin-holiday-pagination-active'
                    : ''
                } ${
                  isEllipsis
                    ? 'admin-holiday-pagination-ellipsis'
                    : ''
                }`}
                onClick={() => {

                  if (
                    typeof page ===
                    'number'
                  ) {

                    onPageChange(
                      page,
                    );

                  }

                }}
                disabled={
                  isEllipsis
                }
              >
                {page}
              </button>
            );
          },
        )}

      </div>


      {/* ====================================================
          NEXT
      ==================================================== */}

      <button
        type="button"
        className={`admin-holiday-pagination-btn ${
          isLast
            ? 'admin-holiday-pagination-disabled'
            : ''
        }`}
        onClick={
          handleNext
        }
        disabled={
          isLast
        }
      >

        <span>
          Next
        </span>

        <ChevronRight
          size={16}
        />

      </button>

    </div>
  );
};

export default AdminHolidayPagination;