import React from 'react';

import {
  AdminHoliday,
} from '../../types/adminHoliday.types';

import {
  formatDate,
} from '../../utils/adminHoliday.utils';

import {
  AdminHolidayActions,
} from '../AdminHolidayActions/AdminHolidayActions';

import {
  AdminHolidayStatusBadge,
} from '../AdminHolidayStatusBadge/AdminHolidayStatusBadge';

import './AdminHolidayRow.css';

interface AdminHolidayRowProps {
  holiday: AdminHoliday;

  index: number;

  onEdit: (
    holiday: AdminHoliday,
  ) => void;

  onDelete: (
    id: string,
  ) => void;

  onStatusToggle: (
    id: string,
  ) => void;
}

export const AdminHolidayRow: React.FC<
  AdminHolidayRowProps
> = ({
  holiday,
  index,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {

  return (
    <tr className="admin-holiday-row">

      {/* ====================================================
          INDEX
      ==================================================== */}

      <td className="admin-holiday-row-id">
        {index + 1}
      </td>


      {/* ====================================================
          TITLE
      ==================================================== */}

      <td className="admin-holiday-row-title">
        {holiday.title}
      </td>


      {/* ====================================================
          DATE
      ==================================================== */}

      <td className="admin-holiday-row-date">
        {formatDate(
          holiday.holidayDate,
        )}
      </td>


      {/* ====================================================
          DAY
      ==================================================== */}

      <td className="admin-holiday-row-day">
        {holiday.day}
      </td>


      {/* ====================================================
          STATUS
      ==================================================== */}

      <td className="admin-holiday-row-status">

        <AdminHolidayStatusBadge
          status={
            holiday.status
          }

          onToggle={() =>
            onStatusToggle(
              holiday.id,
            )
          }
        />

      </td>


      {/* ====================================================
          ACTIONS
      ==================================================== */}

      <td className="admin-holiday-row-actions">

        <AdminHolidayActions
          onEdit={() =>
            onEdit(
              holiday,
            )
          }

          onDelete={() =>
            onDelete(
              holiday.id,
            )
          }
        />

      </td>

    </tr>
  );
};

export default AdminHolidayRow;