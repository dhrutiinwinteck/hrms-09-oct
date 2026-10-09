// src/pages/attendance/components/AttendanceStatistics/AttendanceStatistics.tsx

import React, { useMemo } from 'react';

import { AttendanceSummary } from '../../types/attendance.types';

import { AttendanceSummaryCard } from '../AttendanceSummaryCard/AttendanceSummaryCard';

import { STATISTICS_CARDS_CONFIG } from '../../constants/attendance.constants';

import './AttendanceStatistics.css';

interface AttendanceStatisticsProps {
  summary: AttendanceSummary | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const AttendanceStatistics: React.FC<AttendanceStatisticsProps> = ({
  summary,
  loading,
  error,
  className,
}) => {
  const cards = useMemo(() => {
    // ============================================================
    // NO SUMMARY / NOT LOADING
    // ============================================================

    if (!summary && !loading) {
      return STATISTICS_CARDS_CONFIG.map((config) => ({
        ...config,
        value: '--',
        subtitle: config.subtitle || '',
        percentage: undefined,
      }));
    }

    // ============================================================
    // LOADING
    // ============================================================

    if (!summary) {
      return STATISTICS_CARDS_CONFIG.map((config) => ({
        ...config,
        value: '--',
        subtitle: config.subtitle || '',
        percentage: undefined,
      }));
    }

    // ============================================================
    // BUILD STATISTICS CARDS
    // ============================================================

    return STATISTICS_CARDS_CONFIG.map((config) => {
      let value: string | number;
      let subtitle: string | undefined = config.subtitle;
      let percentage: string | undefined;

      switch (config.id) {
        // ----------------------------------------------------------
        // TOTAL DAYS
        // ----------------------------------------------------------

        case 'total-days':
          value = Number(summary.totalDays ?? 0);
          subtitle = 'In Selected Period';
          break;

        // ----------------------------------------------------------
        // PRESENT DAYS
        // ----------------------------------------------------------

        case 'present-days':
          value = Number(summary.presentDays ?? 0);

          percentage = `${Number(
            summary.presentPercentage ?? 0
          ).toFixed(1)}%`;

          break;

        // ----------------------------------------------------------
        // ABSENT DAYS
        // ----------------------------------------------------------

        case 'absent-days':
          value = Number(summary.absentDays ?? 0);

          percentage = `${Number(
            summary.absentPercentage ?? 0
          ).toFixed(1)}%`;

          break;

        // ----------------------------------------------------------
        // LATE DAYS
        // ----------------------------------------------------------

        case 'late-days':
          value = Number(summary.lateDays ?? 0);

          percentage = `${Number(
            summary.latePercentage ?? 0
          ).toFixed(1)}%`;

          break;

        // ----------------------------------------------------------
        // AVERAGE WORKING HOURS
        // ----------------------------------------------------------

        case 'avg-hours':
          value = summary.averageWorkingHours ?? '--';
          subtitle = 'Per Day';
          break;

        // ----------------------------------------------------------
        // FALLBACK
        // ----------------------------------------------------------

        default:
          value = '--';
      }

      return {
        ...config,
        value,
        subtitle,
        percentage,
      };
    });
  }, [summary, loading]);

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="attendance-statistics attendance-statistics--error">
        <span className="attendance-statistics__error-icon">
          ⚠
        </span>

        <span className="attendance-statistics__error-message">
          {error}
        </span>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className={`attendance-statistics ${className || ''}`}>
      <div className="attendance-statistics__grid">
        {cards.map((card, index) => (
          <AttendanceSummaryCard
            key={card.id || index}
            title={card.title}
            value={card.value}
            iconName={card.iconName}
            iconBgColor={card.iconBgColor}
            subtitle={card.subtitle}
            percentage={card.percentage}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default AttendanceStatistics;