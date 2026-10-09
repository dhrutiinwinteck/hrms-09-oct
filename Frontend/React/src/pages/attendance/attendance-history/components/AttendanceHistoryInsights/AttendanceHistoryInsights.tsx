// src/pages/attendance/attendance-history/components/AttendanceHistoryInsights/AttendanceHistoryInsights.tsx

import React from 'react';
import { Lightbulb, Users } from 'lucide-react';
import { AttendanceInsights } from '../../types/attendanceHistory.types';
import './AttendanceHistoryInsights.css';

interface AttendanceHistoryInsightsProps {
  insights: AttendanceInsights | null;
  loading?: boolean;
}

export const AttendanceHistoryInsights: React.FC<AttendanceHistoryInsightsProps> = ({
  insights,
  loading = false
}) => {
  if (loading || !insights) {
    return (
      <div className="attendance-history-insights">
        <div className="insights-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-history-insights">
      <div className="insights-header">
        <h3 className="insights-title">Attendance Insights</h3>
        <Lightbulb size={16} className="insights-icon" />
      </div>
      
      <div className="insights-content">
        <div className="insights-message">
          <span className="insights-highlight">{insights.count}</span>
          <span className="insights-text">{insights.description}</span>
        </div>
        
        <button className="insights-btn">
          {insights.actionLabel}
        </button>
      </div>
      
      <div className="insights-visual">
        <div className="attendance-donut">
          <svg viewBox="0 0 100 100" className="donut-svg">
            {/* Present - 75% */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="16"
              strokeDasharray={`${75 * 2.513} 251.3`}
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              className="donut-segment"
            />
            {/* Absent - 12% */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="16"
              strokeDasharray={`${12 * 2.513} 251.3`}
              strokeDashoffset={`-${75 * 2.513}`}
              transform="rotate(-90 50 50)"
              className="donut-segment"
            />
            {/* Late - 8% */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="16"
              strokeDasharray={`${8 * 2.513} 251.3`}
              strokeDashoffset={`-${87 * 2.513}`}
              transform="rotate(-90 50 50)"
              className="donut-segment"
            />
            {/* Week Off - 5% */}
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#94a3b8" 
              strokeWidth="16"
              strokeDasharray={`${5 * 2.513} 251.3`}
              strokeDashoffset={`-${95 * 2.513}`}
              transform="rotate(-90 50 50)"
              className="donut-segment"
            />
            <circle cx="50" cy="50" r="30" fill="white" />
          </svg>
          <div className="donut-center">
            <Users size={20} className="donut-icon" />
          </div>
        </div>
        
        <div className="attendance-distribution">
          <div className="distribution-item">
            <span className="dist-color present"></span>
            <span className="dist-label">Present</span>
            <span className="dist-value">75%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-color absent"></span>
            <span className="dist-label">Absent</span>
            <span className="dist-value">12%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-color late"></span>
            <span className="dist-label">Late</span>
            <span className="dist-value">8%</span>
          </div>
          <div className="distribution-item">
            <span className="dist-color weekoff"></span>
            <span className="dist-label">Week Off</span>
            <span className="dist-value">5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};