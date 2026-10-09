import React from 'react';
import { getStatusColor } from '../../utils/employees.utils';
import './EmployeeStatusBadge.css';

interface EmployeeStatusBadgeProps {
  status: string;

  // ============================================================
  // ADDED:
  // Active status click handler.
  // ============================================================
  onActivate?: () => void;
}

export const EmployeeStatusBadge: React.FC<
  EmployeeStatusBadgeProps
> = ({
  status,
  onActivate,
}) => {
  const color = getStatusColor(status);

  // ============================================================
  // ADDED:
  // Only Active status will be clickable.
  // ============================================================
  const isActive =
    status.trim().toLowerCase() === 'active';

  const handleClick = () => {
    if (isActive) {
      onActivate?.();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLSpanElement>
  ) => {
    if (!isActive) {
      return;
    }

    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      onActivate?.();
    }
  };

  return (
    <span
      className={`employee-status-badge ${
        isActive
          ? 'employee-status-badge-clickable'
          : ''
      }`}
      style={{
        backgroundColor: color,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isActive ? 'button' : undefined}
      tabIndex={isActive ? 0 : undefined}
    >
      {status}
    </span>
  );
};