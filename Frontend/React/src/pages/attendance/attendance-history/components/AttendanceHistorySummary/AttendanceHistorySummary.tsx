// src/pages/attendance/attendance-history/components/AttendanceHistorySummary/AttendanceHistorySummary.tsx

import React from 'react';
import { EmployeeAttendance } from '../../types/attendanceHistory.types';
import { SUMMARY_COLUMNS } from '../../constants/attendanceHistory.constants';
import './AttendanceHistorySummary.css';

interface AttendanceHistorySummaryProps {
  employees: EmployeeAttendance[];
  loading?: boolean;
}

export const AttendanceHistorySummary: React.FC<AttendanceHistorySummaryProps> = ({
  employees,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="attendance-history-summary">
        <div className="summary-loading">
          <div className="loading-spinner"></div>
          <span>Loading summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-history-summary">
      <h2 className="summary-title">Monthly Attendance Summary</h2>
      
      <div className="summary-table-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              <th className="summary-col-employee">Employee</th>
              {SUMMARY_COLUMNS.map(col => (
                <th key={col.key} className="summary-col-data">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => {
              const s = employee.monthlySummary;
              return (
                <tr key={employee.id}>
                  <td className="summary-col-employee">
                    <div className="summary-employee-info">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name} 
                        className="summary-employee-avatar"
                      />
                      <div className="summary-employee-details">
                        <span className="summary-employee-name">{employee.name}</span>
                        <span className="summary-employee-id">{employee.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="summary-col-data">{s.present}</td>
                  <td className="summary-col-data">{s.weekOff}</td>
                  <td className="summary-col-data">{s.paidLeave}</td>
                  <td className="summary-col-data">{s.casualLeave}</td>
                  <td className="summary-col-data">{s.compensatoryLeave}</td>
                  <td className="summary-col-data">{s.halfDayPL}</td>
                  <td className="summary-col-data">{s.halfDayCL}</td>
                  <td className="summary-col-data">{s.halfDayCO}</td>
                  <td className="summary-col-data">{s.publicHoliday}</td>
                  <td className="summary-col-data">{s.lop}</td>
                  <td className="summary-col-data">{s.halfDayLOP}</td>
                  <td className="summary-col-data">{s.lwp}</td>
                  <td className="summary-col-data highlight">{s.paidDays}</td>
                  <td className="summary-col-data highlight">{s.lopAbsent}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};