import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import './JoiningApprovalStatCard.css';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle: string;
  color?: string;
}

export const JoiningApprovalStatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color = '#0B6970',
}) => {
  return (
    <div
      className="joining-approval-stat-card"
      style={
        {
          '--stat-accent': color,
          '--stat-icon-bg': `${color}16`,
          '--stat-icon-border': `${color}28`,
        } as React.CSSProperties
      }
    >
      <div className="joining-approval-stat-card__icon">
        <Icon
          size={23}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      <div className="joining-approval-stat-card__content">
        <div className="joining-approval-stat-card__main">
          <span className="joining-approval-stat-card__value">
            {value}
          </span>

          <span className="joining-approval-stat-card__label">
            {label}
          </span>
        </div>

        <span className="joining-approval-stat-card__subtitle">
          {subtitle}
        </span>
      </div>

      <div className="joining-approval-stat-card__arrow">
        <ChevronRight
          size={19}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};