/**
 * ======================================================
 * Attendance Module - Overview Component
 * ======================================================
 * Enterprise-grade component for displaying the monthly attendance
 * overview as a horizontal strip with daily status indicators.
 *
 * Features:
 * - Horizontal scrollable strip of days
 * - Color-coded status indicators (Present, Absent, Late, Weekly Off, Holiday)
 * - Day number and weekday display
 * - Responsive and touch-friendly
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Loading and empty states
 * - Tooltips on hover showing full date and status
 *
 * @module components/AttendanceOverview
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { AttendanceOverviewItem } from '../../types/attendance.types';
import { getStatusColor, getStatusLabel } from '../../utils/attendance.utils';
import { ARIA_LABELS } from '../../constants/attendance.constants';
import './AttendanceOverview.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceOverviewProps {
  /** Array of overview items for the month. */
  data: AttendanceOverviewItem[];
  /** Loading state. */
  loading?: boolean;
  /** Error message if any. */
  error?: string | null;
  /** Additional CSS class names. */
  className?: string;
  /** Optional callback when a day is clicked. */
  onDayClick?: (date: string) => void;
}

// -----------------------------------------------------------------------------
// Sub-component: Individual Day Item
// -----------------------------------------------------------------------------

interface OverviewDayItemProps {
  item: AttendanceOverviewItem;
  onClick?: (date: string) => void;
}

/**
 * Renders a single day in the overview strip.
 * Memoized for performance.
 */
const OverviewDayItem: React.FC<OverviewDayItemProps> = React.memo(({ item, onClick }) => {
  const { date, dayOfMonth, dayOfWeek, status } = item;
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(date);
    }
  }, [date, onClick]);

  return (
    <div
      className="attendance-overview__day"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${dayOfWeek} ${dayOfMonth}: ${statusLabel}`}
      title={`${date} - ${statusLabel}`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(date);
        }
      }}
    >
      <div className="attendance-overview__day-number">{String(dayOfMonth).padStart(2, '0')}</div>
      <div className="attendance-overview__day-weekday">{dayOfWeek}</div>
      <div
        className="attendance-overview__day-status"
        style={{ backgroundColor: statusColor }}
        aria-hidden="true"
      />
    </div>
  );
});

OverviewDayItem.displayName = 'OverviewDayItem';

// -----------------------------------------------------------------------------
// Main Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceOverview component for displaying the monthly overview strip.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({
  data,
  loading = false,
  error = null,
  className = '',
  onDayClick,
}) => {
  // ---------------------------------------------------------------------------
  // Refs & State
  // ---------------------------------------------------------------------------

  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  /**
   * Group data by week for better organization.
   * Used for visual grouping in the strip.
   */
  // const weeks = useMemo(() => {
  //   if (!data || data.length === 0) return [];

  //   const result: AttendanceOverviewItem[][] = [];
  //   let currentWeek: AttendanceOverviewItem[] = [];

  //   // Get the first day of week (assuming data is in order)
  //   const firstItem = data[0];
  //   if (!firstItem) return [];

  //   // Find the index of the first day's weekday in WEEKDAY_SHORT_NAMES
  //   const startDayIndex = WEEKDAY_SHORT_NAMES.indexOf(firstItem.dayOfWeek as typeof WEEKDAY_SHORT_NAMES[number]);

  //   // Add empty placeholders for days before the first day of month
  //   for (let i = 0; i < startDayIndex; i++) {
  //     currentWeek.push(null as any);
  //   }

  //   // Group days into weeks
  //   data.forEach((item) => {
  //     const dayIndex = WEEKDAY_SHORT_NAMES.indexOf(item.dayOfWeek as typeof WEEKDAY_SHORT_NAMES[number]);
  //     if (dayIndex === 0 && currentWeek.length > 0) {
  //       // New week starts
  //       if (currentWeek.length > 0) {
  //         // Fill remaining days with placeholders
  //         while (currentWeek.length < 7) {
  //           currentWeek.push(null as any);
  //         }
  //         result.push(currentWeek);
  //       }
  //       currentWeek = [];
  //     }
  //     currentWeek.push(item);
  //   });

  //   // Fill remaining days of the last week
  //   while (currentWeek.length < 7) {
  //     currentWeek.push(null as any);
  //   }
  //   if (currentWeek.length > 0) {
  //     result.push(currentWeek);
  //   }

  //   return result;
  // }, [data]);

  /**
   * Month header text (e.g., "July 2026").
   */
  const monthHeader = useMemo(() => {
    if (!data || data.length === 0) return '';
    const firstDate = data[0]?.date;
    if (!firstDate) return '';
    const parts = firstDate.split('-');
    if (parts.length !== 3) return '';
    const month = parseInt(parts[1]);
    const year = parseInt(parts[0]);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${year}`;
  }, [data]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      if (isAtEnd) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Loading state
  if (loading) {
    return (
      <div className="attendance-overview attendance-overview--loading">
        <div className="attendance-overview__header">
          <h3 className="attendance-overview__title">Attendance Overview</h3>
          <div className="attendance-overview__skeleton-title" />
        </div>
        <div className="attendance-overview__strip">
          {Array.from({ length: 31 }).map((_, index) => (
            <div key={index} className="attendance-overview__day attendance-overview__day--skeleton">
              <div className="attendance-overview__day-number-skeleton" />
              <div className="attendance-overview__day-weekday-skeleton" />
              <div className="attendance-overview__day-status-skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="attendance-overview attendance-overview--error">
        <span className="attendance-overview__error-icon">⚠</span>
        <span className="attendance-overview__error-message">{error}</span>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="attendance-overview attendance-overview--empty">
        <span className="attendance-overview__empty-icon">📅</span>
        <span className="attendance-overview__empty-message">No overview data available</span>
      </div>
    );
  }

  return (
    <div className={`attendance-overview ${className}`}>
      {/* Header */}
      <div className="attendance-overview__header">
        <h3 className="attendance-overview__title">Attendance Overview</h3>
        <span className="attendance-overview__month">{monthHeader}</span>
      </div>

      {/* Legend */}
      <div className="attendance-overview__legend">
        <span className="attendance-overview__legend-item">
          <span className="attendance-overview__legend-dot" style={{ backgroundColor: '#22c55e' }} />
          Present
        </span>
        <span className="attendance-overview__legend-item">
          <span className="attendance-overview__legend-dot" style={{ backgroundColor: '#ef4444' }} />
          Absent
        </span>
        <span className="attendance-overview__legend-item">
          <span className="attendance-overview__legend-dot" style={{ backgroundColor: '#f59e0b' }} />
          Late
        </span>
        <span className="attendance-overview__legend-item">
          <span className="attendance-overview__legend-dot" style={{ backgroundColor: '#94a3b8' }} />
          Off/Holiday
        </span>
      </div>

      {/* Scrollable Strip */}
      <div
        ref={containerRef}
        className="attendance-overview__strip"
        onScroll={handleScroll}
        role="list"
        aria-label={ARIA_LABELS.overviewStrip}
      >
        {data.map((item, index) => (
          <OverviewDayItem
            key={item.date || index}
            item={item}
            onClick={onDayClick}
          />
        ))}
      </div>

      {/* Scroll Hint */}
      {showScrollHint && (
        <div className="attendance-overview__scroll-hint" aria-hidden="true">
          
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceOverview;