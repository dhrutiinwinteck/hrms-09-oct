// src/pages/admin/holidays/components/AdminHolidayStatistics/AdminHolidayStatistics.tsx

import React from 'react';
import { Calendar, Clock, CheckCircle, CalendarDays } from 'lucide-react';
import { AdminHolidayStatCard } from '../AdminHolidayStatCard/AdminHolidayStatCard';
import { AdminHolidayStatistics as StatisticsType } from '../../types/adminHoliday.types';
import './AdminHolidayStatistics.css';

interface AdminHolidayStatisticsProps {
  statistics: StatisticsType | null;
}

export const AdminHolidayStatistics: React.FC<AdminHolidayStatisticsProps> = ({ statistics }) => {
  if (!statistics) {
    return null;
  }

  const stats = [
    {
      id: 'total',
      label: 'Total Holidays',
      value: statistics.totalHolidays,
      subtext: 'This Year',
      icon: Calendar,
      iconColor: '#0f7b7b',
    },
    {
      id: 'upcoming',
      label: 'Upcoming Holiday',
      value: statistics.upcomingHoliday,
      subtext: 'Next Holiday',
      icon: Clock,
      iconColor: '#f59e0b',
    },
    {
      id: 'taken',
      label: 'Holidays Taken',
      value: statistics.holidaysTaken,
      subtext: 'This Year',
      icon: CheckCircle,
      iconColor: '#10b981',
    },
    {
      id: 'weekend',
      label: 'Weekend Days',
      value: statistics.weekendDays,
      subtext: 'This Year',
      icon: CalendarDays,
      iconColor: '#8b5cf6',
    },
  ];

  return (
    <div className="admin-holiday-statistics">
      {stats.map((stat) => (
        <AdminHolidayStatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
};