import React from 'react';

import {
  Edit2,
  Trash2,
} from 'lucide-react';

import './AdminHolidayActions.css';

interface AdminHolidayActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const AdminHolidayActions: React.FC<
  AdminHolidayActionsProps
> = ({
  onEdit,
  onDelete,
}) => {
  return (
    <div className="admin-holiday-actions">

      <button
        type="button"
        className="admin-holiday-action-btn admin-holiday-action-edit"
        onClick={onEdit}
        aria-label="Edit holiday"
        title="Edit holiday"
      >
        <Edit2
          size={16}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        className="admin-holiday-action-btn admin-holiday-action-delete"
        onClick={onDelete}
        aria-label="Delete holiday"
        title="Delete holiday"
      >
        <Trash2
          size={16}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </button>

    </div>
  );
};

export default AdminHolidayActions;