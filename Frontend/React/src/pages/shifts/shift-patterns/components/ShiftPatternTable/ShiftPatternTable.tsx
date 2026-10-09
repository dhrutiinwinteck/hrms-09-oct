// src/pages/shifts/components/ShiftPatternTable/ShiftPatternTable.tsx

import React from 'react';

import {
  ShiftPattern,
} from '../../types/shiftPatterns.types';

import ShiftPatternRow from '../ShiftPatternRow/ShiftPatternRow';

import './ShiftPatternTable.css';

interface ShiftPatternTableProps {
  patterns: ShiftPattern[];

  onEdit: (
    pattern: ShiftPattern
  ) => void;

  onDelete: (
    id: string
  ) => void;
}

const ShiftPatternTable: React.FC<
  ShiftPatternTableProps
> = ({
  patterns,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="shift-pattern-table-wrapper">

      <table className="shift-pattern-table">

        <thead>
          <tr>
            <th className="col-index">
              #
            </th>

            <th className="col-name">
              Shift Name
            </th>

            <th className="col-start">
              Start Time
            </th>

            <th className="col-end">
              End Time
            </th>

            <th className="col-duration">
              Duration
            </th>

            <th className="col-status">
              Status
            </th>

            <th className="col-actions">
              Action
            </th>
          </tr>
        </thead>

        <tbody>

          {patterns.map(
            (pattern, index) => (
              <ShiftPatternRow
                key={pattern.id}
                pattern={pattern}
                index={index + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          )}

          {patterns.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="empty-row"
              >
                No shift patterns found.
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
};

export default ShiftPatternTable;