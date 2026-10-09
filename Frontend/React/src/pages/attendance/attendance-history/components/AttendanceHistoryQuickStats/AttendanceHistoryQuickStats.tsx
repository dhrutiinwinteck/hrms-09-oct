// src/pages/attendance/attendance-history/components/AttendanceHistoryQuickStats/AttendanceHistoryQuickStats.tsx

import React from 'react';
import { AttendanceStatistics } from '../../types/attendanceHistory.types';
import './AttendanceHistoryQuickStats.css';

interface AttendanceHistoryQuickStatsProps {
  statistics: AttendanceStatistics | null;
  loading?: boolean;
}

export const AttendanceHistoryQuickStats: React.FC<AttendanceHistoryQuickStatsProps> = ({
  statistics,
  loading = false
}) => {
  if (loading || !statistics) {
    return (
      <div className="attendance-history-quick-stats">
        <h3 className="quick-stats-title">Quick Stats</h3>
        <div className="quick-stats-skeleton">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-row-skeleton">
              <div className="skeleton-label-short"></div>
              <div className="skeleton-value-short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Average Attendance', value: `${statistics.averageAttendance.toFixed(1)}%` },
    { label: 'Average Late (mins)', value: statistics.averageLateMinutes.toFixed(1) },
    { label: 'Total Working Days', value: statistics.totalWorkingDays },
  ];

  return (
    <div className="attendance-history-quick-stats">
      <h3 className="quick-stats-title">Quick Stats</h3>
      <div className="quick-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="quick-stat-row">
            <span className="quick-stat-label">{stat.label}</span>
            <span className="quick-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};