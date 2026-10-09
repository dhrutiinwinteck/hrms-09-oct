// src/pages/attendance/AttendanceDashboard.tsx
import React, { useCallback, useState, useMemo } from 'react';
import { useAttendance } from './hooks/useAttendance';
import { AttendanceStatistics } from './components/AttendanceStatistics/AttendanceStatistics';
import { AttendanceOverview } from './components/AttendanceOverview/AttendanceOverview';
import { AttendanceFilterBar } from './components/AttendanceFilterBar/AttendanceFilterBar';
import { AttendanceTabs } from './components/AttendanceTabs/AttendanceTabs';
import { AttendanceTable } from './components/AttendanceTable/AttendanceTable';
import { AttendanceExport } from './components/AttendanceExport/AttendanceExport';
import bannerImage from '../../assets/images/attendance/attendance.jpg';
import './AttendanceDashboard.css';

export const AttendanceDashboard: React.FC = () => {
  const {
    loading,
    error,
    records,
    summary,
    overview,
    filters,
    setFilters,
    applyFilters,
    resetFilters,
    refresh,
  } = useAttendance();

  const [showFilters, setShowFilters] = useState<boolean>(false);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const dateRangeText = useMemo(() => {
    if (overview.length === 0) return 'Select a month';
    const first = overview[0]?.date;
    const last = overview[overview.length - 1]?.date;
    if (!first || !last) return 'Select a month';
    const format = (d: string) => {
      const parts = d.split('-');
      const date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    return `${format(first)} - ${format(last)}`;
  }, [overview]);

  // const handleDateChange = useCallback(
  //   (date: string | undefined) => {
  //     if (date) {
  //       setFilters({ selectedDate: date });
  //       applyFilters();
  //     } else {
  //       resetFilters();
  //     }
  //   },
  //   [setFilters, applyFilters, resetFilters]
  // );

  const handleTableAction = useCallback(
    (action: 'view' | 'edit' | 'download', recordId: string) => {
      console.log(`Action "${action}" on record ${recordId}`);
    },
    []
  );

  const handleSort = useCallback(
    (field: string, direction: 'asc' | 'desc') => {
      console.log(`Sorting by ${field} ${direction}`);
    },
    []
  );

  if (error) {
    return (
      <div className="attendance-dashboard attendance-dashboard--error">
        <div className="attendance-dashboard__error">
          <span className="attendance-dashboard__error-icon">⚠</span>
          <h3 className="attendance-dashboard__error-title">Error Loading Data</h3>
          <p className="attendance-dashboard__error-message">{error}</p>
          <button className="attendance-dashboard__error-btn" onClick={refresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      {/* Mock indicator commented out as requested */}
      {/* {isMock && ( ... )} */}
      {/* Header Section */}
      <div className="attendance-dashboard__header">
        <div className="attendance-dashboard__header-left">
          <h1 className="attendance-dashboard__title">Attendance History</h1>
          <p className="attendance-dashboard__subtitle">
            View and track your daily attendance activities and logs.
          </p>
        </div>
        <div className="attendance-dashboard__header-right">
          <button
            className="attendance-dashboard__filter-toggle"
            onClick={toggleFilters}
            aria-expanded={showFilters}
          >
            <span className="attendance-dashboard__filter-icon">⚙</span>
            Filter
          </button>
          <div className="attendance-dashboard__date-range">
            <span className="attendance-dashboard__date-range-icon">📅</span>
            <span className="attendance-dashboard__date-range-text">{dateRangeText}</span>
          </div>
          <AttendanceExport records={records} loading={loading} size="md" />
        </div>
      </div>

      {/* Hero Illustration (absolute, centered) */}
      <div className="attendance-dashboard__hero">
        <img
          src={bannerImage}
          alt="Attendance Illustration"
          className="attendance-dashboard__hero-image"
        />
      </div>

      {/* Filter Bar (toggled by Filter button) – now uncommented */}
      <AttendanceFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        loading={loading}
        className={showFilters ? 'visible' : ''}
      />

      {/* Statistics Cards */}
      <AttendanceStatistics summary={summary} loading={loading} error={error} />

      {/* Overview Strip */}
      <AttendanceOverview
        data={overview}
        loading={loading}
        error={error}
        onDayClick={(date) => {
          setFilters({ selectedDate: date });
          applyFilters();
        }}
      />

      {/* Tabs & Table */}
      <AttendanceTabs activeTab="daily">
        <AttendanceTable
          records={records}
          loading={loading}
          onAction={handleTableAction}
          onSort={handleSort}
          itemsPerPage={10}
          totalCount={records.length}
        />
      </AttendanceTabs>
    </div>
  );
};

export default AttendanceDashboard;