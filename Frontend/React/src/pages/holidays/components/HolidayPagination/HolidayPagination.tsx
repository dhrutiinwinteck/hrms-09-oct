import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './HolidayPagination.css';

interface HolidayPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  visibleRange: { start: number; end: number };
  onPageChange: (page: number) => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const HolidayPagination: React.FC<HolidayPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  visibleRange,
  onPageChange,
  onFirstPage,
  onLastPage,
  onNextPage,
  onPreviousPage,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="holiday-pagination">
      <div className="holiday-pagination-info">
        Showing {visibleRange.start} to {visibleRange.end} of {totalItems} entries
      </div>
      <div className="holiday-pagination-controls">
        <button
          className="pagination-btn"
          onClick={onFirstPage}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          className="pagination-btn"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                …
              </span>
            );
          }
          return (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
        
        <button
          className="pagination-btn"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
        <button
          className="pagination-btn"
          onClick={onLastPage}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};