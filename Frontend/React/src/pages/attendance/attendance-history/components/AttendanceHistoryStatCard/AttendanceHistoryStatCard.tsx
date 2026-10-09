import React from 'react';
import { LucideIcon } from 'lucide-react';
import './AttendanceHistoryStatCard.css';

interface AttendanceHistoryStatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
  sparkline?: React.ReactNode;
}

export const AttendanceHistoryStatCard: React.FC<AttendanceHistoryStatCardProps> = ({
  icon: Icon,
  label,
  value,
  color = '#64748b',
  sparkline
}) => {
  // Background color with 12% opacity (hex + '1F' = ~12%)
  const bgColor = `${color}1F`;

  return (
    <div className="attendance-history-stat-card">
      <div className="stat-card-content">
        <div 
          className="stat-card-icon-wrapper" 
          style={{ backgroundColor: bgColor, color }}
        >
          <Icon size={22} />
        </div>
        <div className="stat-card-body">
          <span className="stat-card-label">{label}</span>
          <span className="stat-card-value">{value}</span>
        </div>
      </div>
      {sparkline && (
        <div className="stat-card-sparkline">
          {sparkline}
        </div>
      )}
    </div>
  );
};