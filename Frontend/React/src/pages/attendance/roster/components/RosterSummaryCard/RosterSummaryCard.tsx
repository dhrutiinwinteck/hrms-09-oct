import React from "react";

import {
  AlarmClock,
  CalendarDays,
  Clock3,
  UsersRound,
} from "lucide-react";

import {
  RosterSummaryCardType,
  RosterSummaryItem,
} from "../../types/roster.types";

import "./RosterSummaryCard.css";

export interface RosterSummaryCardProps {
  items: RosterSummaryItem[];
}

const RosterSummaryCard: React.FC<
  RosterSummaryCardProps
> = ({
  items,
}) => {
  const getIcon = (
    type: RosterSummaryCardType,
  ): JSX.Element => {
    switch (type) {
      case "employees":
        return (
          <UsersRound
            aria-hidden="true"
            strokeWidth={1.8}
          />
        );

      case "shifts":
        return (
          <CalendarDays
            aria-hidden="true"
            strokeWidth={1.8}
          />
        );

      case "coverage":
        return (
          <Clock3
            aria-hidden="true"
            strokeWidth={1.8}
          />
        );

      case "hours":
        return (
          <AlarmClock
            aria-hidden="true"
            strokeWidth={1.8}
          />
        );

      default:
        return (
          <UsersRound
            aria-hidden="true"
            strokeWidth={1.8}
          />
        );
    }
  };

  return (
    <section
      className="roster-summary"
      aria-label="Roster summary"
    >
      <div className="roster-summary__grid">
        {items.map(
          (item) => {
            const isCoverage =
              item.type ===
              "coverage";

            const progress =
              Math.min(
                Math.max(
                  item.progress ??
                    0,
                  0,
                ),
                100,
              );

            return (
              <article
                key={item.id}
                className={`roster-summary__card roster-summary__card--${item.type}`}
              >
                <div className="roster-summary__icon-wrapper">
                  {getIcon(
                    item.type,
                  )}
                </div>

                <div className="roster-summary__content">
                  <p className="roster-summary__title">
                    {item.title}
                  </p>

                  <p className="roster-summary__value">
                    {item.value}
                  </p>

                  <p className="roster-summary__description">
                    {
                      item.description
                    }
                  </p>

                  {isCoverage && (
                    <div
                      className="roster-summary__progress"
                      role="progressbar"
                      aria-valuenow={
                        progress
                      }
                      aria-valuemin={
                        0
                      }
                      aria-valuemax={
                        100
                      }
                      aria-label={`Coverage ${progress}%`}
                    >
                      <span
                        className="roster-summary__progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          },
        )}
      </div>
    </section>
  );
};

export default RosterSummaryCard;