import React from "react";

import {
  ChevronRight,
  UserRoundCheck,
  Users,
} from "lucide-react";

import "./LeaveEmployeesHeader.css";

const LeaveEmployeesHeader: React.FC = () => {
  return (
    <section className="leave-employees-header">
      <div className="leave-employees-header__content">
        {/* LEFT */}
        <div className="leave-employees-header__text">
          <div className="leave-employees-header__title-row">
            <Users
              className="leave-employees-header__title-icon"
              size={25}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <h1 className="leave-employees-header__title">
              Employees
            </h1>
          </div>

          <p className="leave-employees-header__description">
            Manage employee information, departments and account status.
          </p>
        </div>

        {/* RIGHT */}
        <div className="leave-employees-header__right">
          <div
            className="leave-employees-header__employee-visual"
            aria-hidden="true"
          >
            <span className="leave-employees-header__visual-dot leave-employees-header__visual-dot--top" />
            <span className="leave-employees-header__visual-dot leave-employees-header__visual-dot--bottom" />

            <div className="leave-employees-header__visual-circle">
              <UserRoundCheck
                size={31}
                strokeWidth={1.8}
              />
            </div>
          </div>

          <nav
            className="leave-employees-header__breadcrumb"
            aria-label="Breadcrumb"
          >
            <span className="leave-employees-header__breadcrumb-parent">
              Employee Management
            </span>

            <ChevronRight
              size={15}
              strokeWidth={2}
              className="leave-employees-header__breadcrumb-icon"
              aria-hidden="true"
            />

            <span className="leave-employees-header__breadcrumb-current">
              Employees
            </span>
          </nav>
        </div>
      </div>
    </section>
  );
};

export default LeaveEmployeesHeader;