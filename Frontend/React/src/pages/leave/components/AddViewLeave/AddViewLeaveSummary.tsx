import React, { useMemo } from "react";
import { Clock3, Umbrella, UsersRound } from "lucide-react";
import type { Employee, LeaveBalance } from "../../types/leave.types";
import "./AddViewLeaveSummary.css";
type SummaryCardType = "employees" | "casual" | "paid" | "compOff";
interface LeaveSummaryItem {
  id: number;
  title: string;
  value: number;
  description: string;
  type: SummaryCardType;
}
interface AddViewLeaveSummaryProps {
  employees: Employee[];
  leaveBalances: LeaveBalance[];
}
const AddViewLeaveSummary: React.FC<AddViewLeaveSummaryProps> = ({
  employees,
  leaveBalances,
}) => {
  const summaryData = useMemo<LeaveSummaryItem[]>(() => {
    const totalCasualLeave = leaveBalances.reduce(
      (total, balance) => total + Number(balance.remained_casual_leave ?? 0),
      0,
    );
    const totalPaidLeave = leaveBalances.reduce(
      (total, balance) => total + Number(balance.remained_paid_leave ?? 0),
      0,
    );
    const totalCompOff = leaveBalances.reduce(
      (total, balance) => total + Number(balance.remained_comp_off ?? 0),
      0,
    );
    return [
      {
        id: 1,
        title: "Total Employees",
        value: employees.length,
        description: "Active Employees",
        type: "employees",
      },
      {
        id: 2,
        title: "Total Casual Leave",
        value: totalCasualLeave,
        description: "Leave Balance",
        type: "casual",
      },
      {
        id: 3,
        title: "Total Paid Leave",
        value: totalPaidLeave,
        description: "Leave Balance",
        type: "paid",
      },
      {
        id: 4,
        title: "Total Comp Off",
        value: totalCompOff,
        description: "Leave Balance",
        type: "compOff",
      },
    ];
  }, [employees, leaveBalances]);
  const getSummaryIcon = (type: SummaryCardType): React.ReactNode => {
    switch (type) {
      case "employees":
        return <UsersRound size={29} strokeWidth={2.2} />;
      case "casual":
        return <Umbrella size={30} strokeWidth={2.2} />;
      case "paid":
        return <Umbrella size={30} strokeWidth={2.2} />;
      case "compOff":
        return <Clock3 size={30} strokeWidth={2.2} />;
      default:
        return null;
    }
  };
  return (
    <section
      className="add-view-leave-summary"
      aria-label="Leave balance summary"
    >
      {" "}
      <div className="add-view-leave-summary__grid">
        {" "}
        {summaryData.map((item) => (
          <article
            key={item.id}
            className={`add-view-leave-summary-card add-view-leave-summary-card--${item.type}`}
          >
            {" "}
            <div className="add-view-leave-summary-card__icon-wrapper">
              {" "}
              {getSummaryIcon(item.type)}{" "}
            </div>{" "}
            <div className="add-view-leave-summary-card__content">
              {" "}
              <p className="add-view-leave-summary-card__title">
                {" "}
                {item.title}{" "}
              </p>{" "}
              <p className="add-view-leave-summary-card__value">
                {" "}
                {item.value.toLocaleString()}{" "}
              </p>{" "}
              <p className="add-view-leave-summary-card__description">
                {" "}
                {item.description}{" "}
              </p>{" "}
            </div>{" "}
          </article>
        ))}{" "}
      </div>{" "}
    </section>
  );
};
export default AddViewLeaveSummary;
