import React from "react";
import { ChevronRight } from "lucide-react";

import "./AddViewLeaveHeader.css";

const AddViewLeaveHeader: React.FC = () => {
  return (
    <header className="add-view-leave-header">
      <h1 className="add-view-leave-header__title">
        Add / View Leaves
      </h1>

      <nav
        className="add-view-leave-header__breadcrumb"
        aria-label="Breadcrumb"
      >
        <span className="add-view-leave-header__breadcrumb-item">
          Home
        </span>

        <ChevronRight
          className="add-view-leave-header__breadcrumb-icon"
          size={15}
          strokeWidth={2}
          aria-hidden="true"
        />

        <span className="add-view-leave-header__breadcrumb-item">
          Leave Management
        </span>

        <ChevronRight
          className="add-view-leave-header__breadcrumb-icon"
          size={15}
          strokeWidth={2}
          aria-hidden="true"
        />

        <span
          className="
            add-view-leave-header__breadcrumb-item
            add-view-leave-header__breadcrumb-item--active
          "
          aria-current="page"
        >
          Add / View Leaves
        </span>
      </nav>
    </header>
  );
};

export default AddViewLeaveHeader;