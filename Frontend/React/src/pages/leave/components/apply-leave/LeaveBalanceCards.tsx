import React from "react";

import {
  BriefcaseBusiness,
  Coffee,
  CalendarDays,
} from "lucide-react";

import "./LeaveBalanceCards.css";

interface LeaveBalanceCardsProps {
  // ==========================================================
  // PAID LEAVE
  // ==========================================================

  paidYearly: number;
  paidUsed: number;
  paidRemaining: number;

  // ==========================================================
  // CASUAL LEAVE
  // ==========================================================

  casualYearly: number;
  casualUsed: number;
  casualRemaining: number;

  // ==========================================================
  // COMP OFF
  // ==========================================================

  compOffUsed: number;
  compOffRemaining: number;
}

const formatLeaveNumber = (
  value: number
): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value
    .toFixed(2)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
};

const LeaveBalanceCards: React.FC<
  LeaveBalanceCardsProps
> = ({
  paidUsed,
  paidRemaining,

  casualUsed,
  casualRemaining,

  compOffUsed,
  compOffRemaining,
}) => {
  return (
    <section
      className="leave-balance"
      aria-label="Leave balance summary"
    >
      {/* ======================================================
          YEARLY LEAVE
      ====================================================== */}
<div className="leave-balance__yearly-grid">

  {/* ====================================================
      PAID LEAVE YEARLY
  ==================================================== */}

  <article className="leave-balance__yearly-card leave-balance__yearly-card--paid">

    <div className="leave-balance__yearly-value">
      12
    </div>

    <div className="leave-balance__yearly-title">
      Yearly Paid Leave (PL)
    </div>

  </article>


  {/* ====================================================
      CASUAL LEAVE YEARLY
  ==================================================== */}

  <article className="leave-balance__yearly-card leave-balance__yearly-card--casual">

    <div className="leave-balance__yearly-value">
      9
    </div>

    <div className="leave-balance__yearly-title">
      Yearly Casual Leave (CL)
    </div>

  </article>

</div>

      {/* ======================================================
          CURRENT LEAVE BALANCE
      ====================================================== */}

      <div className="leave-balance__grid">

        {/* ====================================================
            PAID LEAVE
        ==================================================== */}

        <article className="leave-balance__card leave-balance__card--paid">

          <div className="leave-balance__icon leave-balance__icon--paid">
            <BriefcaseBusiness
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div className="leave-balance__content">

            <div className="leave-balance__title">
              Paid Leave
            </div>

            <div className="leave-balance__available">
              <span>
                Available:
              </span>

              <strong>
                {formatLeaveNumber(
                  paidRemaining
                )}
              </strong>
            </div>

            <div className="leave-balance__used">
              <span>
                Used:
              </span>

              <strong>
                {formatLeaveNumber(
                  paidUsed
                )}
              </strong>
            </div>

          </div>
        </article>

        {/* ====================================================
            CASUAL LEAVE
        ==================================================== */}

        <article className="leave-balance__card leave-balance__card--casual">

          <div className="leave-balance__icon leave-balance__icon--casual">
            <Coffee
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div className="leave-balance__content">

            <div className="leave-balance__title">
              Casual Leave
            </div>

            <div className="leave-balance__available">
              <span>
                Available:
              </span>

              <strong>
                {formatLeaveNumber(
                  casualRemaining
                )}
              </strong>
            </div>

            <div className="leave-balance__used">
              <span>
                Used:
              </span>

              <strong>
                {formatLeaveNumber(
                  casualUsed
                )}
              </strong>
            </div>

          </div>
        </article>

        {/* ====================================================
            COMP OFF
        ==================================================== */}

        <article className="leave-balance__card leave-balance__card--comp">

          <div className="leave-balance__icon leave-balance__icon--comp">
            <CalendarDays
              size={22}
              strokeWidth={2.2}
            />
          </div>

          <div className="leave-balance__content">

            <div className="leave-balance__title">
              Comp Off
            </div>

            <div className="leave-balance__available">
              <span>
                Available:
              </span>

              <strong>
                {formatLeaveNumber(
                  compOffRemaining
                )}
              </strong>
            </div>

            <div className="leave-balance__used">
              <span>
                Used:
              </span>

              <strong>
                {formatLeaveNumber(
                  compOffUsed
                )}
              </strong>
            </div>

          </div>
        </article>

      </div>
    </section>
  );
};

export default LeaveBalanceCards;