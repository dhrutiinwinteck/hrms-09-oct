// src/pages/attendance/attendance-history/components/AttendanceHistoryLegend/AttendanceHistoryLegend.tsx

import React from 'react';
import { Clock } from 'lucide-react';
import './AttendanceHistoryLegend.css';

export const AttendanceHistoryLegend: React.FC = () => {
  const items = [
    { label: 'Present', color: '#22c55e', bg: '#dcfce7' },
    { label: 'Absent', color: '#ef4444', bg: '#fee2e2' },
    { label: 'Week Off', color: '#94a3b8', bg: '#f1f5f9' },
    { label: 'Late Punch In (Time)', color: '#f59e0b', icon: Clock }
  ];

  return (
    <div className="attendance-history-legend">
      {items.map((item, index) => (
        <div key={index} className="legend-item">
          {item.icon ? (
            <item.icon size={14} style={{ color: item.color }} />
          ) : (
            <span 
              className="legend-color" 
              style={{ backgroundColor: item.bg, color: item.color }}
            >
              {item.label.charAt(0)}
            </span>
          )}
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
};