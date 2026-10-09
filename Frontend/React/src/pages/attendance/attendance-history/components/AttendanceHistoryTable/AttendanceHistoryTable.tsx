// src/pages/attendance/attendance-history/components/AttendanceHistoryTable/AttendanceHistoryTable.tsx

import React from 'react';
import { Clock } from 'lucide-react';
import { EmployeeAttendance } from '../../types/attendanceHistory.types';
import { STATUS_BG_COLORS } from '../../constants/attendanceHistory.constants';
import './AttendanceHistoryTable.css';

interface AttendanceHistoryTableProps {
  employees: EmployeeAttendance[];
  month: string;   // "YYYY-MM"
  year: number;
}

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

const getDayOfWeek = (day: number, month: number, year: number) => {
  const date = new Date(year, month - 1, day);
  return date.getDay();
};

const getDayLabel = (day: number, month: number, year: number) => {
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  employees,
  month,
  year
}) => {
  // Parse numeric month from the "YYYY-MM" string
  const monthNumber = parseInt(month.split('-')[1], 10); // 1–12
  const daysInMonth = getDaysInMonth(monthNumber, year);
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const renderStatusBadge = (record: any) => {
    const status = record.status;
    const bgColor = STATUS_BG_COLORS[status] || '#f1f5f9';
    // Removed unused 'label' variable
    
    if (status === 'P' && record.lateMinutes && record.lateMinutes > 0) {
      return (
        <div className="status-cell late">
          <div className="status-badge" style={{ backgroundColor: bgColor }}>
            {status}
          </div>
          <div className="late-time">
            <Clock size={12} />
            <span>{record.checkIn || '09:18 AM'}</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="status-cell">
        <div className="status-badge" style={{ backgroundColor: bgColor }}>
          {status}
        </div>
      </div>
    );
  };

  return (
    <div className="attendance-history-table-wrapper">
      <table className="attendance-history-table">
        <thead>
          <tr>
            <th className="col-employee">Employee</th>
            {/* <th className="col-id">ID</th> */}
            {dayLabels.map(day => {
              const dayOfWeek = getDayOfWeek(day, monthNumber, year);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <th key={day} className={`col-day ${isWeekend ? 'weekend' : ''}`}>
                  <span className="day-name">{getDayLabel(day, monthNumber, year)}</span>
                  <span className="day-number">{day}</span>
                  <span className="day-month">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][monthNumber - 1]}
                  </span>
                </th>
              );
            })}
            <th className="col-late-count">Late Count</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td className="col-employee">
                <div className="employee-info">
                  <img 
                    src={employee.avatar} 
                    alt={employee.name} 
                    className="employee-avatar"
                  />
                  <div className="employee-details">
                    <span className="employee-name">{employee.name}</span>
                    <span className="employee-designation">{employee.designation}</span>
                    {/* <span className="employee-id-small">{employee.id}</span> */}
                  </div>
                </div>
              </td>
              {/* <td className="col-id">{employee.id}</td> */}
              {dayLabels.map((day, index) => (
                <td key={day} className="col-day-cell">
                  {renderStatusBadge(employee.dailyRecords[index] || { status: 'WO' })}
                </td>
              ))}
              <td className="col-late-count">{employee.lateCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};