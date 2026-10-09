// src/pages/admin/holidays/components/AdminHolidayStatCard/AdminHolidayStatCard.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react';
import './AdminHolidayStatCard.css';

interface AdminHolidayStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext: string;
  iconColor: string;
}

export const AdminHolidayStatCard: React.FC<AdminHolidayStatCardProps> = ({
  icon: Icon,
  label,
  value,
  subtext,
  iconColor,
}) => {
  return (
    <div className="admin-holiday-stat-card">
      <div className="admin-holiday-stat-card-icon-wrapper" style={{ color: iconColor }}>
        <Icon size={24} />
      </div>
      <div className="admin-holiday-stat-card-content">
        <div className="admin-holiday-stat-card-label">{label}</div>
        <div className="admin-holiday-stat-card-value">{value}</div>
        <div className="admin-holiday-stat-card-subtext">{subtext}</div>
      </div>
    </div>
  );
};