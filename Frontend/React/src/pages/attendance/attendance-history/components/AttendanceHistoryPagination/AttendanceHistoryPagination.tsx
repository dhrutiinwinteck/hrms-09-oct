// src/pages/attendance/attendance-history/components/AttendanceHistoryPagination/AttendanceHistoryPagination.tsx

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './AttendanceHistoryPagination.css';

interface AttendanceHistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AttendanceHistoryPagination: React.FC<AttendanceHistoryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(currentPage - 2);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(currentPage + 2);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="attendance-history-pagination">
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>
      
      {getPageNumbers().map(page => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      <button 
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};