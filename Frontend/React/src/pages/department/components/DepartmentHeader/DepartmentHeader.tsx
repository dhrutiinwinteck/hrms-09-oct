import React from "react";
import { ChevronRight, Plus } from "lucide-react";

import "./DepartmentHeader.css";

export interface DepartmentHeaderProps {
  onAddDepartment?: () => void;
}

const DepartmentHeader: React.FC<DepartmentHeaderProps> = ({
  onAddDepartment,
}) => {
  return (
    <header className="department-header">
      <div className="department-header__content">
        {/* Left Section */}
        <div className="department-header__left">
          <h1 className="department-header__title">
            Department
          </h1>

          <p className="department-header__subtitle">
            Manage and organize all departments in the organization.
          </p>
        </div>

        {/* Right Section */}
        <div className="department-header__right">
          {/* Breadcrumb */}
          <nav
            className="department-header__breadcrumb"
            aria-label="Breadcrumb"
          >
            <span className="department-header__breadcrumb-item">
              Dashboard
            </span>

            <ChevronRight
              className="department-header__breadcrumb-chevron"
              aria-hidden="true"
            />

            <span
              className="
                department-header__breadcrumb-item
                department-header__breadcrumb-item--active
              "
              aria-current="page"
            >
              Department
            </span>
          </nav>

          {/* Add Department */}
          <button
            type="button"
            className="department-header__add-button"
            onClick={onAddDepartment}
            aria-label="Add Department"
          >
            <Plus
              className="department-header__add-icon"
              aria-hidden="true"
            />

            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Decorative Dots */}
      <div
        className="department-header__dots"
        aria-hidden="true"
      />
    </header>
  );
};

export default DepartmentHeader;