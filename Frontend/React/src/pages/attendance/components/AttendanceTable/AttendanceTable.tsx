/**
 * ======================================================
 * Attendance Module - Table Component
 * ======================================================
 * Enterprise-grade component for displaying attendance records in a table.
 * Includes sorting, pagination, row actions, and status badges.
 *
 * Features:
 * - Sortable columns (click header to sort)
 * - Status badge integration
 * - Row actions (View, Edit, Download)
 * - Pagination controls
 * - Loading and empty states
 * - Responsive design with horizontal scroll
 * - Accessibility (ARIA labels, roles)
 * - Keyboard navigation
 * - Memoized for performance
 *
 * @module components/AttendanceTable
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  MoreVertical,
  Eye,
  Edit,
  Download,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AttendanceRecord } from '../../types/attendance.types';
import { AttendanceStatusBadge } from '../AttendanceStatusBadge/AttendanceStatusBadge';
import {
  formatDisplayDate,
  formatDisplayTime,
  formatWorkingHours,
  formatBreakTime,
} from '../../utils/attendance.utils';
import { ATTENDANCE_TABLE_COLUMNS } from '../../constants/attendance.constants';
import './AttendanceTable.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceTableProps {
  /** Array of attendance records. */
  records: AttendanceRecord[];
  /** Whether the table is in a loading state. */
  loading?: boolean;
  /** Callback when a row action is triggered. */
  onAction?: (action: 'view' | 'edit' | 'download', recordId: string) => void;
  /** Callback when sorting changes. */
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  /** Current sort field. */
  sortField?: string;
  /** Current sort direction. */
  sortDirection?: 'asc' | 'desc';
  /** Additional CSS class names. */
  className?: string;
  /** Items per page (for pagination). */
  itemsPerPage?: number;
  /** Total count of records (for pagination). */
  totalCount?: number;
  /** Current page number. */
  currentPage?: number;
  /** Callback when page changes. */
  onPageChange?: (page: number) => void;
}

// -----------------------------------------------------------------------------
// Sub-component: Row Actions Dropdown
// -----------------------------------------------------------------------------

interface RowActionsProps {
  recordId: string;
  onAction: (action: 'view' | 'edit' | 'download', id: string) => void;
}

const RowActions: React.FC<RowActionsProps> = React.memo(({ recordId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleAction = useCallback((action: 'view' | 'edit' | 'download') => {
    onAction(action, recordId);
    setIsOpen(false);
  }, [onAction, recordId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="attendance-table__actions" ref={dropdownRef}>
      <button
        className="attendance-table__actions-toggle"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Row actions"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          className="attendance-table__actions-menu"
          role="menu"
          onKeyDown={handleKeyDown}
        >
          <button
            className="attendance-table__actions-item"
            onClick={() => handleAction('view')}
            role="menuitem"
          >
            <Eye size={14} />
            View
          </button>
          <button
            className="attendance-table__actions-item"
            onClick={() => handleAction('edit')}
            role="menuitem"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            className="attendance-table__actions-item"
            onClick={() => handleAction('download')}
            role="menuitem"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      )}
    </div>
  );
});

RowActions.displayName = 'RowActions';

// -----------------------------------------------------------------------------
// Sub-component: Table Row
// -----------------------------------------------------------------------------

interface TableRowProps {
  record: AttendanceRecord;
  onAction: (action: 'view' | 'edit' | 'download', id: string) => void;
}

const TableRow: React.FC<TableRowProps> = React.memo(({ record, onAction }) => {
  return (
    <tr className="attendance-table__row">
      <td className="attendance-table__cell">{formatDisplayDate(record.date)}</td>
      <td className="attendance-table__cell">{record.shift}</td>
      <td className="attendance-table__cell">{formatDisplayTime(record.punchIn)}</td>
      <td className="attendance-table__cell">{formatDisplayTime(record.punchOut)}</td>
      <td className="attendance-table__cell">{formatWorkingHours(record.workingHours)}</td>
      <td className="attendance-table__cell">{formatBreakTime(record.breakTime)}</td>
      <td className="attendance-table__cell">
        <AttendanceStatusBadge status={record.status} size="sm" />
      </td>
      <td className="attendance-table__cell attendance-table__cell--actions">
        <RowActions recordId={record.id} onAction={onAction} />
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

// -----------------------------------------------------------------------------
// Main Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceTable component for displaying attendance records.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  loading = false,
  onAction = () => {},
  onSort,
  sortField = 'date',
  sortDirection = 'desc',
  className = '',
  itemsPerPage = 10,
  totalCount,
  currentPage = 1,
  onPageChange,
}) => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /** Internal sort state if no external control. */
  const [internalSortField, setInternalSortField] = useState<string>('date');
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>('desc');

  // Use external sort if provided, otherwise internal
  const activeSortField = onSort ? sortField : internalSortField;
  const activeSortDirection = onSort ? sortDirection : internalSortDirection;

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  /**
   * Calculate displayed records (paginated if using internal pagination).
   */
  const displayedRecords = useMemo(() => {
    if (!records) return [];
    if (onPageChange) {
      // External pagination, just return all records (parent handles pagination)
      return records;
    }
    // Internal pagination
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return records.slice(start, end);
  }, [records, currentPage, itemsPerPage, onPageChange]);

  /**
   * Calculate total pages.
   */
  const totalPages = useMemo(() => {
    const count = totalCount || records.length;
    return Math.ceil(count / itemsPerPage);
  }, [totalCount, records.length, itemsPerPage]);

  /**
   * Page numbers for pagination controls.
   */
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles column header click for sorting.
   */
  const handleSort = useCallback(
    (field: string) => {
      if (!onSort && field === 'actions') return;
      let direction: 'asc' | 'desc' = 'asc';
      if (activeSortField === field) {
        direction = activeSortDirection === 'asc' ? 'desc' : 'asc';
      }
      if (onSort) {
        onSort(field, direction);
      } else {
        setInternalSortField(field);
        setInternalSortDirection(direction);
      }
    },
    [activeSortField, activeSortDirection, onSort]
  );

  /**
   * Handles page change.
   */
  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange && page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [onPageChange, totalPages]
  );

  /**
   * Gets sort icon for a column.
   */
  const getSortIcon = useCallback(
    (field: string) => {
      if (field === 'actions') return null;
      if (activeSortField !== field) {
        return <ChevronUp size={14} className="attendance-table__sort-icon" />;
      }
      return activeSortDirection === 'asc' ? (
        <ChevronUp size={14} className="attendance-table__sort-icon active" />
      ) : (
        <ChevronDown size={14} className="attendance-table__sort-icon active" />
      );
    },
    [activeSortField, activeSortDirection]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Loading state
  if (loading) {
    return (
      <div className="attendance-table attendance-table--loading">
        <div className="attendance-table__skeleton">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="attendance-table__skeleton-row">
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
              <div className="attendance-table__skeleton-cell" />
            </div>
          ))}
        </div>
        <div className="attendance-table__loading-text">Loading records...</div>
      </div>
    );
  }

  // Empty state
  if (!records || records.length === 0) {
    return (
      <div className="attendance-table attendance-table--empty">
        <div className="attendance-table__empty-icon">📋</div>
        <div className="attendance-table__empty-title">No Records Found</div>
        <div className="attendance-table__empty-text">
          No attendance records match the current filters.
        </div>
      </div>
    );
  }

  return (
    <div className={`attendance-table ${className}`}>
      {/* Table Container */}
      <div className="attendance-table__container">
        <table className="attendance-table__table" role="grid">
          <thead>
            <tr>
              {ATTENDANCE_TABLE_COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={`attendance-table__header ${column.sortable ? 'sortable' : ''}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  role="columnheader"
                  aria-sort={
                    activeSortField === column.key
                      ? activeSortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  tabIndex={column.sortable ? 0 : -1}
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key);
                    }
                  }}
                >
                  <span className="attendance-table__header-content">
                    {column.label}
                    {column.sortable && getSortIcon(column.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRecords.map((record) => (
              <TableRow key={record.id} record={record} onAction={onAction} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="attendance-table__pagination">
          <div className="attendance-table__pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalCount || records.length)} of{' '}
            {totalCount || records.length} entries
          </div>
          <div className="attendance-table__pagination-controls">
            <button
              className="attendance-table__pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ←
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`attendance-table__pagination-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
            <button
              className="attendance-table__pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceTable;