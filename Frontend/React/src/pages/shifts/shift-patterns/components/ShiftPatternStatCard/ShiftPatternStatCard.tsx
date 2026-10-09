import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ShiftPatternStatCard.css';

interface ShiftPatternStatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
}

const ShiftPatternStatCard: React.FC<ShiftPatternStatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
}) => {
  return (
    <div className="sp-stat-card">
      <div className="sp-stat-card-icon-wrapper">
        <Icon size={24} className="sp-stat-card-icon" />
      </div>
      <div className="sp-stat-card-content">
        <div className="sp-stat-card-title">{title}</div>
        <div className="sp-stat-card-value">{value}</div>
        <div className="sp-stat-card-description">{description}</div>
      </div>
    </div>
  );
};

export default ShiftPatternStatCard;