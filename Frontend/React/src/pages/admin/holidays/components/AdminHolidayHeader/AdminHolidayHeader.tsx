import React from "react";
import { Plus } from "lucide-react";

import "./AdminHolidayHeader.css";

interface AdminHolidayHeaderProps {
  onAddHoliday: () => void;
}

export const AdminHolidayHeader: React.FC<
  AdminHolidayHeaderProps
> = ({ onAddHoliday }) => {
  return (
    <header className="admin-holiday-header">

      {/* ======================================================
          HEADER LEFT
          ====================================================== */}

      <div className="admin-holiday-header-left">

        <h1 className="admin-holiday-title">
          Holiday Calendar
        </h1>

        <nav
          className="admin-holiday-breadcrumb"
          aria-label="Breadcrumb"
        >

          <span>
            Dashboard
          </span>

          <span
            className="admin-holiday-breadcrumb-separator"
            aria-hidden="true"
          >
            /
          </span>

          <span>
            Administration
          </span>

          <span
            className="admin-holiday-breadcrumb-separator"
            aria-hidden="true"
          >
            /
          </span>

          <span className="admin-holiday-breadcrumb-current">
            Holiday Calendar
          </span>

        </nav>

      </div>


      {/* ======================================================
          HEADER RIGHT
          ====================================================== */}

      <div className="admin-holiday-header-right">

        <button
          type="button"
          className="admin-holiday-add-button"
          onClick={onAddHoliday}
        >
          <Plus
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>
            Add Holiday
          </span>

        </button>

      </div>

    </header>
  );
};

export default AdminHolidayHeader;