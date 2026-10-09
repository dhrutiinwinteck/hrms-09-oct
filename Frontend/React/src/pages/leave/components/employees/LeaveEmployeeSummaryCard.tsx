import React, {
  useMemo,
} from "react";

import {
  ClipboardList,
  Clock3,
  CircleCheck,
  CircleX,
} from "lucide-react";

import {
  Employee,
} from "./LeaveEmployeesTable";

import "./LeaveEmployeeSummaryCard.css";

/* =========================================================
   TYPES
   ========================================================= */

interface LeaveSummaryItem {
  id: number;

  title: string;

  value: number;

  description: string;

  type:
  | "total"
  | "pending"
  | "approved"
  | "rejected";

  icon: React.ReactNode;
}

/* =========================================================
   PROPS
   ========================================================= */

interface LeaveEmployeeSummaryCardProps {
  employees: Employee[];
}

/* =========================================================
   COMPONENT
   ========================================================= */

const LeaveEmployeeSummaryCard: React.FC<
  LeaveEmployeeSummaryCardProps
> = ({
  employees,
}) => {

  const summaryData =
    useMemo<LeaveSummaryItem[]>(
      () => {

        const totalLeaves =
          employees.length;

        const pendingLeaves =
          employees.filter(
            (employee) =>
              employee.leaveStatus
                .toLowerCase() ===
              "pending",
          ).length;

        const approvedLeaves =
          employees.filter(
            (employee) =>
              employee.leaveStatus
                .toLowerCase() ===
              "approved",
          ).length;

        const rejectedLeaves =
          employees.filter(
            (employee) =>
              employee.leaveStatus
                .toLowerCase() ===
              "rejected",
          ).length;

        

        return [
          {
            id: 1,

            title:
              "Total Leave Requests",

            value:
              totalLeaves,

            description:
              "All leave applications",

            type:
              "total",

            icon: (
              <ClipboardList
                size={22}
                strokeWidth={2}
              />
            ),
          },

          {
            id: 2,

            title:
              "Pending",

            value:
              pendingLeaves,

            description:
              "Awaiting approval",

            type:
              "pending",

            icon: (
              <Clock3
                size={22}
                strokeWidth={2}
              />
            ),
          },

          {
            id: 3,

            title:
              "Approved",

            value:
              approvedLeaves,

            description:
              "Approved requests",

            type:
              "approved",

            icon: (
              <CircleCheck
                size={22}
                strokeWidth={2}
              />
            ),
          },

          {
            id: 4,

            title:
              "Rejected",

            value:
              rejectedLeaves,

            description:
              "Rejected requests",

            type:
              "rejected",

            icon: (
              <CircleX
                size={22}
                strokeWidth={2}
              />
            ),
          },

          
        ];
      },
      [employees],
    );

  return (
    <section
      className="leave-summary"
      aria-label="Leave summary"
    >

      <div className="leave-summary__grid">

        {summaryData.map(
          (item) => (
            <article
              key={item.id}
              className={`leave-summary-card leave-summary-card--${item.type}`}
            >

              <div className="leave-summary-card__icon-wrapper">

                <div className="leave-summary-card__icon">
                  {item.icon}
                </div>

              </div>

              <div className="leave-summary-card__content">

                <h3 className="leave-summary-card__title">
                  {item.title}
                </h3>

                <div className="leave-summary-card__value">
                  {item.value}
                </div>

                <p className="leave-summary-card__description">
                  {item.description}
                </p>

              </div>

            </article>
          ),
        )}

      </div>

    </section>
  );
};

export default LeaveEmployeeSummaryCard;