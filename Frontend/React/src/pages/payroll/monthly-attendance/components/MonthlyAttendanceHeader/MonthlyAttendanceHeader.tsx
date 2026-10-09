import React from "react";

import {
  Clock3,
  FileSpreadsheet,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import salarySheetImage from "../../../../../assets/images/payslip/salary sheet.png";

import "./MonthlyAttendanceHeader.css";

interface MonthlyAttendanceFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MONTHLY_ATTENDANCE_FEATURES: MonthlyAttendanceFeature[] = [
  {
    title: "Accurate Records",
    description: "Trusted & Transparent",
    icon: <ShieldCheck size={18} strokeWidth={2.1} />,
  },
  {
    title: "Save Time",
    description: "Quick Access",
    icon: <Clock3 size={18} strokeWidth={2.1} />,
  },
  {
    title: "Better Decisions",
    description: "Data Driven Payroll",
    icon: <UsersRound size={18} strokeWidth={2.1} />,
  },
];

const MonthlyAttendanceHeader: React.FC = () => {
  return (
    <section
      className="monthly-attendance-header"
      aria-labelledby="monthly-attendance-heading"
    >
      <div className="monthly-attendance-header__content">
        <div className="monthly-attendance-header__identity">
          <div className="monthly-attendance-header__icon">
            <FileSpreadsheet
              size={30}
              strokeWidth={1.65}
            />

            <span className="monthly-attendance-header__rupee">
              ₹
            </span>
          </div>

          <div className="monthly-attendance-header__heading">
            <span className="monthly-attendance-header__eyebrow">
              PAYROLL
            </span>

            <h1
              id="monthly-attendance-heading"
              className="monthly-attendance-header__title"
            >
              Monthly Salary Sheet
            </h1>

            <p className="monthly-attendance-header__description">
              View and download employee salary details
            </p>
          </div>
        </div>

        <div className="monthly-attendance-header__features">
          {MONTHLY_ATTENDANCE_FEATURES.map(
            (feature) => (
              <div
                className="monthly-attendance-header__feature"
                key={feature.title}
              >
                <span className="monthly-attendance-header__feature-icon">
                  {feature.icon}
                </span>

                <span className="monthly-attendance-header__feature-copy">
                  <strong>
                    {feature.title}
                  </strong>

                  <small>
                    {feature.description}
                  </small>
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="monthly-attendance-header__artwork">
        <img
          className="monthly-attendance-header__image"
          src={salarySheetImage}
          alt="Salary Sheet"
        />

        <div className="monthly-attendance-header__artwork-caption">
          <span>Accurate Payroll</span>
          <span>Happy People</span>
        </div>
      </div>
    </section>
  );
};

export default MonthlyAttendanceHeader;