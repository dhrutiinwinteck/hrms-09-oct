import React from "react";
import { Plus } from "lucide-react";

import "./LeaveApplyHeader.css";
import leaveCalendarIllustration from "../../../../assets/images/leave/leave-calendar-illustration.png";

interface LeaveApplyHeaderProps {
  onAddLeaveClick?: () => void;
}

const LeaveApplyHeader: React.FC<LeaveApplyHeaderProps> = ({
  onAddLeaveClick,
}) => {
  return (
    <header className="leave-header">
      <div className="leave-header__inner">

        {/* Left Content */}
        <div className="leave-header__content">
          <h1 className="leave-header__title">
            Leaves
          </h1>

          <p className="leave-header__description">
            Manage and view all employee leave records.
          </p>
        </div>

        {/* Center Illustration */}
        <div
          className="leave-header__image-wrapper"
          aria-hidden="true"
        >
          <img
            src={leaveCalendarIllustration}
            alt=""
            className="leave-header__image"
          />
        </div>

        {/* Apply Leave Button */}
        <div className="leave-header__actions">
          <button
            type="button"
            className="leave-header__add-button"
            onClick={onAddLeaveClick}
          >
            <Plus
              size={18}
              strokeWidth={2.4}
            />
            Apply Leave
          </button>
        </div>

      </div>
    </header>
  );
};

export default LeaveApplyHeader;