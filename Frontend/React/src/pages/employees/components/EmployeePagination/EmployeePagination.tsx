// src/pages/employees/components/EmployeePagination/EmployeePagination.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './EmployeePagination.css';

interface EmployeePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const EmployeePagination: React.FC<EmployeePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= halfVisible + 1) {
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="employee-pagination">
      <div className="pagination-info">
        Showing {startIndex} to {endIndex} of {totalItems} entries
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {pageNumbers.map((page, index) => {
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
              className={`pagination-btn ${page === currentPage ? 'pagination-active' : ''}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          );
        })}
        
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};