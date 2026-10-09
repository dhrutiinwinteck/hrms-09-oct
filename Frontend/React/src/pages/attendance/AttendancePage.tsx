import React, { memo } from 'react';
import { AttendanceDashboard } from './AttendanceDashboard';
import './AttendancePage.css';

export const AttendancePage: React.FC = memo(() => {
  return (
    <div className="attendance-page">
      <AttendanceDashboard />
    </div>
  );
});

AttendancePage.displayName = 'AttendancePage';

export default AttendancePage;