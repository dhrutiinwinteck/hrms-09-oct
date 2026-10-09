// src/pages/attendance/components/AttendanceSummaryCard/AttendanceSummaryCard.tsx

import React, { useMemo } from 'react';
// import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import './AttendanceSummaryCard.css';

export interface AttendanceSummaryCardProps {
  title: string;
  value: string | number;
  iconName: string;
  iconBgColor?: string;
  subtitle?: string;
  percentage?: string;
  loading?: boolean;
  className?: string;
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  title,
  value,
  iconName,
  iconBgColor = '#dbeafe',
  subtitle,
  percentage,
  loading = false,
  className = '',
}) => {
  const IconComponent = useMemo(() => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || null;
}, [iconName]);

  if (loading) {
    return (
      <div className="attendance-summary-card attendance-summary-card--loading">
        <div className="attendance-summary-card__skeleton">
          <div className="attendance-summary-card__skeleton-icon" />
          <div className="attendance-summary-card__skeleton-content">
            <div className="attendance-summary-card__skeleton-title" />
            <div className="attendance-summary-card__skeleton-value" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`attendance-summary-card ${className}`}>
      <div className="attendance-summary-card__content">
        <div
          className="attendance-summary-card__icon-wrapper"
          style={{ backgroundColor: iconBgColor }}
        >
          {IconComponent && <IconComponent className="attendance-summary-card__icon" size={24} strokeWidth={2} />}
        </div>
        <div className="attendance-summary-card__text">
          <h3 className="attendance-summary-card__title">{title}</h3>
          <div className="attendance-summary-card__value-wrapper">
            <span className="attendance-summary-card__value">{value}</span>
          </div>
          {(subtitle || percentage) && (
            <div className="attendance-summary-card__footer">
              {percentage && <span className="attendance-summary-card__percentage">{percentage}</span>}
              {subtitle && <span className="attendance-summary-card__subtitle">{subtitle}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryCard;