import React from 'react';
import { Users, CheckCircle2, XCircle, CalendarDays, Clock, FileText } from 'lucide-react';
import { AttendanceHistoryStatCard } from '../AttendanceHistoryStatCard/AttendanceHistoryStatCard';
import { AttendanceStatistics } from '../../types/attendanceHistory.types';
// import { STATISTICS_LABELS } from '../../constants/attendanceHistory.constants';
import './AttendanceHistoryStats.css';

interface AttendanceHistoryStatsProps {
  statistics: AttendanceStatistics | null;
  loading?: boolean;
}

export const AttendanceHistoryStats: React.FC<AttendanceHistoryStatsProps> = ({
  statistics,
  loading = false
}) => {
  if (loading || !statistics) {
    // ... (Keep your existing skeleton loader here)
    return null; 
  }

  // Senior Dev Tip: Using Cubic Bezier for smooth "Apple-style" sparklines
  const createSparkline = (color: string, data: number[]) => {
    const height = 30;
    const width = 120;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((p, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - ((p - min) / range) * (height - 10) - 5
    }));

    // Generate smooth path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = (points[i].x + points[i + 1].x) / 2;
      path += ` Q ${cp1x} ${points[i].y}, ${points[i + 1].x} ${points[i + 1].y}`;
    }

    return (
      <svg width="100%" height="30" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill={`url(#grad-${color})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
      </svg>
    );
  };

  const cards = [
    { icon: Users, label: 'Total Employees: ', value: statistics.totalEmployees, color: '#64748b', data: [30, 32, 35, 33, 35, 34, 35] },
    { icon: CheckCircle2, label: 'Present: ', value: statistics.present, color: '#10b981', data: [580, 610, 590, 620, 600, 620] },
    { icon: XCircle, label: 'Absent: ', value: statistics.absent, color: '#ef4444', data: [80, 75, 85, 70, 82, 78] },
    { icon: CalendarDays, label: 'Week Off: ', value: statistics.weekOff, color: '#334155', data: [140, 145, 138, 148, 142] },
    { icon: Clock, label: 'Late Punch In: ', value: statistics.latePunchIn, color: '#b45309', data: [30, 40, 35, 45, 34] },
    { icon: FileText, label: 'LOP: ', value: statistics.lop, color: '#0f766e', data: [12, 18, 14, 20, 16] },
  ];

  return (
    <div className="attendance-history-stats">
      {cards.map((card, index) => (
        <AttendanceHistoryStatCard
          key={index}
          icon={card.icon}
          label={card.label}
          value={card.value}
          color={card.color}
          sparkline={createSparkline(card.color, card.data)}
        />
      ))}
    </div>
  );
};