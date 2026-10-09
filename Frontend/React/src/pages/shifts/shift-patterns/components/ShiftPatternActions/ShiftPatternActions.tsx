// src/pages/shifts/shift-patterns/components/ShiftPatternActions/ShiftPatternActions.tsx

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import './ShiftPatternActions.css';

interface ShiftPatternActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ShiftPatternActions: React.FC<
  ShiftPatternActionsProps
> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div className="shift-pattern-actions">
      <button
        className="action-btn action-edit"
        onClick={onEdit}
        aria-label="Edit shift pattern"
      >
        <Edit size={16} />
      </button>

      <button
        className="action-btn action-delete"
        onClick={onDelete}
        aria-label="Delete shift pattern"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ShiftPatternActions;