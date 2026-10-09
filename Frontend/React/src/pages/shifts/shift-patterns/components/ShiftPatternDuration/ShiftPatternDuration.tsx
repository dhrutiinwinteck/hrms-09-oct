import React from 'react';
import './ShiftPatternDuration.css';

interface ShiftPatternDurationProps {
  duration: string;
}

const ShiftPatternDuration: React.FC<ShiftPatternDurationProps> = ({ duration }) => {
  return <span className="duration-badge">{duration}</span>;
};

export default ShiftPatternDuration;