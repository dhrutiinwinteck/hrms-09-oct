// src/pages/attendance/attendance-history/components/AttendanceHistoryOverview/AttendanceHistoryOverview.tsx

import React from 'react';
import { EmployeeAttendance } from '../../types/attendanceHistory.types';
import { AttendanceHistoryTable } from '../AttendanceHistoryTable/AttendanceHistoryTable';
import { AttendanceHistoryLegend } from '../AttendanceHistoryLegend/AttendanceHistoryLegend';
import './AttendanceHistoryOverview.css';

interface AttendanceHistoryOverviewProps {
  employees: EmployeeAttendance[];
  month: number;   // numeric month (1–12)
  year: number;    // e.g., 2026
  loading?: boolean;
}

export const AttendanceHistoryOverview: React.FC<AttendanceHistoryOverviewProps> = ({
  employees,
  month,
  year,
  loading = false
}) => {
  // Convert numeric month/year to the expected "YYYY-MM" string format
  const monthString = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div className="attendance-history-overview">
      <div className="attendance-history-overview-header">
        <h2 className="overview-title">Daily Attendance Overview</h2>
        <span className="overview-count">
          Showing 1 to {Math.min(employees.length, 5)} of {employees.length} employees
        </span>
      </div>
      
      {loading ? (
        <div className="overview-loading">
          <div className="loading-spinner"></div>
          <span>Loading attendance data...</span>
        </div>
      ) : (
        <>
          <div className="attendance-history-table-scroll">
            <AttendanceHistoryTable 
              employees={employees} 
              month={monthString}   // pass string instead of number
              year={year} 
            />
          </div>
          <AttendanceHistoryLegend />
        </>
      )}
    </div>
  );
};