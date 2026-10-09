import React from "react";
import { Plus } from "lucide-react";

import "./DesignationHeader.css";

interface DesignationHeaderProps {
  onAdd: () => void;
}

export const DesignationHeader: React.FC<
  DesignationHeaderProps
> = ({ onAdd }) => {
  return (
    <header className="designation-header">
      <div className="designation-header__main">
        {/* =====================================
            LEFT CONTENT
        ===================================== */}

        <div className="designation-header__content">
          <h1 className="designation-header__title">
            Designations
          </h1>

          <p className="designation-header__description">
            Create, manage and organize job
            designations across departments.
          </p>
        </div>

        {/* =====================================
            RIGHT CONTENT
        ===================================== */}

        <div className="designation-header__actions">
          <nav
            className="designation-header__breadcrumb"
            aria-label="Breadcrumb"
          >
            <span className="designation-header__breadcrumb-item">
              Dashboard
            </span>

            <span
              className="designation-header__separator"
              aria-hidden="true"
            >
              ›
            </span>

            <span
              className="designation-header__current"
              aria-current="page"
            >
              Designations
            </span>
          </nav>

          <button
            type="button"
            className="designation-header__add-button"
            onClick={onAdd}
            aria-label="Add Designation"
          >
            <Plus
              className="designation-header__plus"
              size={15}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>Add Designation</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DesignationHeader;