/**
 * ======================================================
 * Attendance Module - Status Badge Component
 * ======================================================
 * Enterprise-grade component for displaying attendance status
 * with appropriate color coding and optional icon.
 *
 * Features:
 * - Consistent status color mapping
 * - Optional icon display
 * - Multiple size variants
 * - Accessibility (ARIA labels)
 * - Hover and focus states
 * - Responsive design
 *
 * @module components/AttendanceStatusBadge
 */

import React, { useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  Calendar,
} from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance.types';
import {
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getStatusTextColor,
  getStatusBorderColor,
} from '../../utils/attendance.utils';
import { ARIA_LABELS } from '../../constants/attendance.constants';
import './AttendanceStatusBadge.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceStatusBadgeProps {
  /** Attendance status to display. */
  status: AttendanceStatus;
  /** Size variant of the badge. */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the icon. */
  showIcon?: boolean;
  /** Additional CSS class names. */
  className?: string;
  /** Optional click handler. */
  onClick?: (status: AttendanceStatus) => void;
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceStatusBadge component for displaying status with proper styling.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
  onClick,
}) => {
  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  /**
   * Memoized status label for display.
   */
  const label = useMemo(() => getStatusLabel(status), [status]);

  /**
   * Memoized color values for consistent styling.
   */
  const colors = useMemo(() => ({
    bg: getStatusBgColor(status),
    text: getStatusTextColor(status),
    border: getStatusBorderColor(status),
    dot: getStatusColor(status),
  }), [status]);

  /**
   * Memoized icon component based on status.
   */
  const IconComponent = useMemo(() => {
    switch (status) {
      case 'Present':
        return CheckCircle;
      case 'Absent':
        return XCircle;
      case 'Late':
        return Clock;
      case 'WeeklyOff':
        return CalendarDays;
      case 'Holiday':
        return Calendar;
      default:
        return CheckCircle;
    }
  }, [status]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      event.stopPropagation();
      onClick(status);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`attendance-status-badge attendance-status-badge--${size} ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      onClick={handleClick}
      role="status"
      aria-label={ARIA_LABELS.statusBadge(label)}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(status);
        }
      }}
    >
      {showIcon && (
        <span className="attendance-status-badge__icon">
          <IconComponent
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            style={{ color: colors.dot }}
          />
        </span>
      )}
      <span className="attendance-status-badge__label">{label}</span>
      <span className="attendance-status-badge__dot" style={{ backgroundColor: colors.dot }} />
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceStatusBadge;