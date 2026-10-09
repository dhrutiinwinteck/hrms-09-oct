import React from "react";

import "./DesignationStatCard.css";

export interface DesignationStatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  variant?: "green" | "orange" | "blue";
}

export const DesignationStatCard: React.FC<
  DesignationStatCardProps
> = ({
  title,
  value,
  description,
  icon,
  variant = "green",
}) => {
  return (
    <article
      className={`designation-stat-card designation-stat-card--${variant}`}
    >
      {/* =====================================
          ICON
      ===================================== */}

      <div
        className="designation-stat-card__icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="designation-stat-card__content">
        <span className="designation-stat-card__title">
          {title}
        </span>

        <strong className="designation-stat-card__value">
          {value}
        </strong>

        <span className="designation-stat-card__description">
          {description}
        </span>
      </div>
    </article>
  );
};

export default DesignationStatCard;