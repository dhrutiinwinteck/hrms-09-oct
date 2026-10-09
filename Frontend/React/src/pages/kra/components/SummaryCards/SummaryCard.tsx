import React from "react";
import "./SummaryCard.css";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  trend,
}) => {
  return (
    <article className="kra-summary-card">
      <div className="kra-summary-card-main">
        <span className="kra-summary-card-label">
          {label}
        </span>

        <span className="kra-summary-card-value">
          {value}
        </span>
      </div>

      <div
        className="kra-summary-card-icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      {trend && (
        <span className="kra-summary-card-trend">
          {trend}
        </span>
      )}
    </article>
  );
};

export default SummaryCard;