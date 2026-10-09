import React from 'react';

import {
  HolidayStatus,
} from '../../types/adminHoliday.types';

import {
  HOLIDAY_STATUS_LABELS,
} from '../../constants/adminHoliday.constants';

import './AdminHolidayStatusBadge.css';

interface AdminHolidayStatusBadgeProps {
  status: HolidayStatus;
  onToggle: () => void;
}

export const AdminHolidayStatusBadge: React.FC<
  AdminHolidayStatusBadgeProps
> = ({
  status,
  onToggle,
}) => {
  return (
    <button
      type="button"
      className={`admin-holiday-status-badge admin-holiday-status-${status}`}
      onClick={onToggle}
      aria-label={`Change holiday status from ${status}`}
    >
      <span
        className="admin-holiday-status-dot"
        aria-hidden="true"
      />

      <span className="admin-holiday-status-label">
        {HOLIDAY_STATUS_LABELS[status]}
      </span>
    </button>
  );
};

export default AdminHolidayStatusBadge;