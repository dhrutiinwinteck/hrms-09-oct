import React from "react";
import {
  Building2,
  ShieldCheck,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";

import "./DepartmentSummaryCard.css";

export interface DepartmentSummaryItem {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
}

interface DepartmentSummaryCardProps {
  items?: DepartmentSummaryItem[];
}

const defaultSummaryItems: DepartmentSummaryItem[] = [
  {
    title: "Total Departments",
    value: 12,
    description: "All Active Departments",
    icon: Building2,
  },
  {
    title: "Active Departments",
    value: 11,
    description: "Currently Active",
    icon: ShieldCheck,
  },
  {
    title: "Inactive Departments",
    value: 1,
    description: "Currently Inactive",
    icon: ShieldOff,
  },
];

const DepartmentSummaryCard: React.FC<
  DepartmentSummaryCardProps
> = ({ items = defaultSummaryItems }) => {
  return (
    <section
      className="department-summary-section"
      aria-label="Department summary"
    >
      <div className="department-summary-grid">
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <article
              className="department-summary-card"
              key={`${item.title}-${index}`}
            >
              <div className="department-summary-icon">
                <Icon
                  className="department-summary-icon-svg"
                  size={21}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <div className="department-summary-content">
                <p className="department-summary-title">
                  {item.title}
                </p>

                <p className="department-summary-value">
                  {item.value}
                </p>

                <p className="department-summary-description">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DepartmentSummaryCard;