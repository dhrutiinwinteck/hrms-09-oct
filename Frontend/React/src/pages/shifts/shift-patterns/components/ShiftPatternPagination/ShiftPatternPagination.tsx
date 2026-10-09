import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPaginationText } from '../../utils/shiftPatterns.utils';
import './ShiftPatternPagination.css';

interface ShiftPatternPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const ShiftPatternPagination: React.FC<ShiftPatternPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const start = (currentPage - 1) * 10 + 1;
  const end = Math.min(currentPage * 10, totalItems);
  const paginationText = formatPaginationText(start, end, totalItems);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="shift-pattern-pagination">
      <div className="pagination-info">{paginationText}</div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="pagination-page active">{currentPage}</span>
        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ShiftPatternPagination;