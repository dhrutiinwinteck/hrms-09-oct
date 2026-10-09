import React, { useMemo } from "react";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  FileText,
} from "lucide-react";

import type { Policy } from "../../types/policy.types";

import "./AdminPolicySummary.css";

interface AdminPolicySummaryProps {
  policies: Policy[];
}

interface PolicySummaryItem {
  id: number;
  title: string;
  value: string;
  subtitle: string;
  type:
    | "total"
    | "active"
    | "recentlyCreated"
    | "updated";
}

const chartPaths: Record<
  PolicySummaryItem["type"],
  string
> = {
  total:
    "M2 27 L15 20 L28 26 L41 22 L54 27 L67 23 L80 26 L93 18 L106 24 L119 14 L132 22 L145 16 L158 24 L171 18 L184 27 L197 22 L210 28",

  active:
    "M2 27 L16 19 L30 26 L44 21 L58 27 L72 20 L86 24 L100 15 L114 23 L128 27 L142 21 L156 25 L170 18 L184 26 L198 22 L212 27",

  recentlyCreated:
    "M2 28 L16 20 L30 27 L44 23 L58 28 L72 24 L86 16 L100 26 L114 22 L128 27 L142 21 L156 12 L170 23 L184 15 L198 27 L212 21",

  updated:
    "M2 27 L16 20 L30 26 L44 22 L58 27 L72 24 L86 18 L100 26 L114 21 L128 28 L142 17 L156 24 L170 14 L184 22 L198 18 L212 26",
};

const AdminPolicySummary: React.FC<
  AdminPolicySummaryProps
> = ({ policies }) => {
  const summaryData =
    useMemo<PolicySummaryItem[]>(() => {
      const total = policies.length;

      const active = policies.filter(
        (policy) =>
          policy.status === "Active",
      ).length;

      /*
       * Recently Created:
       * Counts policies created within the
       * last 30 rolling days.
       *
       * Uses the existing policies array.
       * No API/backend change required.
       */
      const now = new Date();

      const thirtyDaysAgo = new Date(
        now.getTime() -
          30 * 24 * 60 * 60 * 1000,
      );

      const recentlyCreated = policies.filter(
        (policy) => {
          if (!policy.createdAt) {
            return false;
          }

          const createdDate = new Date(
            policy.createdAt,
          );

          if (
            Number.isNaN(
              createdDate.getTime(),
            )
          ) {
            return false;
          }

          return (
            createdDate.getTime() >=
              thirtyDaysAgo.getTime() &&
            createdDate.getTime() <=
              now.getTime()
          );
        },
      ).length;

      const updatedThisMonth = policies.filter(
        (policy) => {
          if (!policy.updatedAt) {
            return false;
          }

          const updatedDate = new Date(
            policy.updatedAt,
          );

          if (
            Number.isNaN(
              updatedDate.getTime(),
            )
          ) {
            return false;
          }

          return (
            updatedDate.getFullYear() ===
              now.getFullYear() &&
            updatedDate.getMonth() ===
              now.getMonth()
          );
        },
      ).length;

      const activePercentage =
        total > 0
          ? ((active / total) * 100).toFixed(1)
          : "0.0";

      return [
        {
          id: 1,
          title: "Total Policies",
          value: String(total),
          subtitle: "All time",
          type: "total",
        },
        {
          id: 2,
          title: "Active Policies",
          value: String(active),
          subtitle: `${activePercentage}% of total`,
          type: "active",
        },
        {
          id: 3,
          title: "Recently Created",
          value: String(recentlyCreated),
          subtitle: "Last 30 Days",
          type: "recentlyCreated",
        },
        {
          id: 4,
          title: "Updated This Month",
          value: String(updatedThisMonth),
          subtitle: "This month",
          type: "updated",
        },
      ];
    }, [policies]);

  const renderIcon = (
    type: PolicySummaryItem["type"],
  ): React.ReactNode => {
    switch (type) {
      case "total":
        return (
          <FileText
            size={25}
            strokeWidth={2}
          />
        );

      case "active":
        return (
          <CheckCircle2
            size={26}
            strokeWidth={2}
          />
        );

      case "recentlyCreated":
        return (
          <CalendarPlus
            size={26}
            strokeWidth={2}
          />
        );

      case "updated":
        return (
          <CalendarDays
            size={25}
            strokeWidth={2}
          />
        );

      default:
        return null;
    }
  };

  return (
    <section
      className="admin-policy-summary"
      aria-label="Policy summary"
    >
      <div className="admin-policy-summary__grid">
        {summaryData.map((item) => (
          <article
            key={item.id}
            className={`admin-policy-summary__item admin-policy-summary__item--${item.type}`}
          >
            <div className="admin-policy-summary__top">
              <div
                className={`admin-policy-summary__icon admin-policy-summary__icon--${item.type}`}
                aria-hidden="true"
              >
                {renderIcon(item.type)}
              </div>

              <div className="admin-policy-summary__content">
                <strong className="admin-policy-summary__value">
                  {item.value}
                </strong>

                <span className="admin-policy-summary__title">
                  {item.title}
                </span>

                <span className="admin-policy-summary__subtitle">
                  {item.subtitle}
                </span>
              </div>
            </div>

            <div
              className="admin-policy-summary__chart"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 214 34"
                preserveAspectRatio="none"
                focusable="false"
              >
                <path
                  d={chartPaths[item.type]}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminPolicySummary;