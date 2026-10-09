import React from 'react';
import { ShiftStatus } from '../../types/shiftPatterns.types';
import './ShiftPatternStatus.css';

interface ShiftPatternStatusProps {
  status: ShiftStatus;
}

const ShiftPatternStatus: React.FC<ShiftPatternStatusProps> = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span className={`shift-pattern-status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
      <span className="status-dot" />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default ShiftPatternStatus;