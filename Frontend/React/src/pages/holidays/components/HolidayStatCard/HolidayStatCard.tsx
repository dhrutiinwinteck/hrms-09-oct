import React from 'react';
import { LucideIcon } from 'lucide-react';

import './HolidayStatCard.css';

interface HolidayStatCardProps {
  title: string;

  value: string | number;

  footer: string;

  icon: LucideIcon;

  iconBgColor?: string;

  iconColor?: string;
}

export const HolidayStatCard: React.FC<
  HolidayStatCardProps
> = ({
  title,
  value,
  footer,
  icon: Icon,
  iconBgColor = '#e8f4f8',
  iconColor = '#0f4c5c',
}) => {

  return (
    <div className="holiday-stat-card">

      <div className="holiday-stat-card-content">

        {/* ==================================================
            ICON
        ================================================== */}

        <div className="holiday-stat-card-left">

          <div
            className="holiday-stat-card-icon"
            style={{
              backgroundColor:
                iconBgColor,
            }}
          >
            <Icon
              size={20}
              color={iconColor}
            />
          </div>

        </div>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="holiday-stat-card-right">

          <span className="holiday-stat-card-title">
            {title}
          </span>

          <div
            className={`holiday-stat-card-value ${
              typeof value === 'string'
                ? 'holiday-stat-card-value-text'
                : ''
            }`}
            title={String(value)}
          >
            {value}
          </div>

          <div className="holiday-stat-card-footer">
            {footer}
          </div>

        </div>

      </div>

    </div>
  );
};