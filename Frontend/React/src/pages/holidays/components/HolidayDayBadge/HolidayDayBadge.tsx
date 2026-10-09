import React from 'react';
import './HolidayDayBadge.css';

interface HolidayDayBadgeProps {
  day: string;
  variant: string;
}

export const HolidayDayBadge: React.FC<HolidayDayBadgeProps> = ({ day, variant }) => {
  return (
    <span className={`holiday-day-badge ${variant}`}>
      {day}
    </span>
  );
};