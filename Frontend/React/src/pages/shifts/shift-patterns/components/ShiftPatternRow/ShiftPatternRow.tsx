// src/pages/shifts/components/ShiftPatternRow/ShiftPatternRow.tsx

import React from 'react';

import {
  ShiftPattern,
} from '../../types/shiftPatterns.types';

import ShiftPatternIcon from '../ShiftPatternIcon/ShiftPatternIcon';

import ShiftPatternDuration from '../ShiftPatternDuration/ShiftPatternDuration';

import ShiftPatternStatus from '../ShiftPatternStatus/ShiftPatternStatus';

import ShiftPatternActions from '../ShiftPatternActions/ShiftPatternActions';

import './ShiftPatternRow.css';

interface ShiftPatternRowProps {
  pattern: ShiftPattern;

  index: number;

  onEdit: (
    pattern: ShiftPattern
  ) => void;

  onDelete: (
    id: string
  ) => void;
}

const ShiftPatternRow: React.FC<
  ShiftPatternRowProps
> = ({
  pattern,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="shift-pattern-row">

      <td className="col-index">
        {String(index).padStart(2, '0')}
      </td>

      <td className="col-name">
        <ShiftPatternIcon
          shiftType={
            pattern.shiftType
          }
        />

        <span className="shift-name">
          {pattern.name}
        </span>
      </td>

      <td className="col-start">
        {pattern.startTime}
      </td>

      <td className="col-end">
        {pattern.endTime}
      </td>

      <td className="col-duration">
        <ShiftPatternDuration
          duration={
            pattern.duration
          }
        />
      </td>

      <td className="col-status">
        <ShiftPatternStatus
          status={
            pattern.status
          }
        />
      </td>

      <td className="col-actions">
        <ShiftPatternActions
          onEdit={() =>
            onEdit(pattern)
          }
          onDelete={() =>
            onDelete(pattern.id)
          }
        />
      </td>

    </tr>
  );
};

export default ShiftPatternRow;