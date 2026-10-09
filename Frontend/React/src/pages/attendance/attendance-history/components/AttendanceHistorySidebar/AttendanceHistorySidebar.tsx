// src/pages/attendance/attendance-history/components/AttendanceHistorySidebar/AttendanceHistorySidebar.tsx

import React from 'react';
import { AttendanceHistoryFilters } from '../AttendanceHistoryFilters/AttendanceHistoryFilters';
import { AttendanceHistoryQuickStats } from '../AttendanceHistoryQuickStats/AttendanceHistoryQuickStats';
import { AttendanceHistoryInsights } from '../AttendanceHistoryInsights/AttendanceHistoryInsights';
import { AttendanceStatistics, AttendanceInsights, MonthOption } from '../../types/attendanceHistory.types';
import './AttendanceHistorySidebar.css';

interface AttendanceHistorySidebarProps {
  statistics: AttendanceStatistics | null;
  insights: AttendanceInsights | null;
  selectedMonth: MonthOption;
  onMonthChange: (month: MonthOption) => void;
  onCalculateLateMarks: () => void;
  onExport: () => void;
  loading?: boolean;
}

export const AttendanceHistorySidebar: React.FC<AttendanceHistorySidebarProps> = ({
  statistics,
  insights,
  selectedMonth,
  onMonthChange,
  onCalculateLateMarks,
  onExport,
  loading = false
}) => {
  return (
    <aside className="attendance-history-sidebar">
      <AttendanceHistoryFilters
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        onCalculateLateMarks={onCalculateLateMarks}
        onExport={onExport}
        loading={loading}
      />
      
      <AttendanceHistoryQuickStats 
        statistics={statistics}
        loading={loading}
      />
      
      <AttendanceHistoryInsights 
        insights={insights}
        loading={loading}
      />
    </aside>
  );
};