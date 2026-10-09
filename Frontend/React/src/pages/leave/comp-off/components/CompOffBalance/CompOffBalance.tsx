import {
  ArrowRight,
  CalendarCheck2,
} from 'lucide-react';

import type {
  CompOffBalance as Balance,
} from '../../types/compOff.types';

interface CompOffBalanceProps {
  balance: Balance;
}

const CompOffBalance = ({
  balance,
}: CompOffBalanceProps) => {
  const total =
    balance.totalEarned > 0
      ? balance.totalEarned
      : balance.available + balance.used;

  const availablePercentage =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (balance.available / total) *
              100,
          ),
        )
      : 0;

  return (
    <div className="comp-off-balance-card">
      <div className="balance-header">
        <h2>My Comp Off Balance</h2>
      </div>

      <div className="balance-content">
        <div className="balance-donut">
          <div
            className="balance-donut-progress"
            style={{
              background: `conic-gradient(
                #39716e ${availablePercentage}%,
                #e4dccd ${availablePercentage}% 100%
              )`,
            }}
          >
            <div className="balance-donut-inner">
              <strong>
                {balance.available}
              </strong>

              <span>
                Available
                <br />
                Comp Off
              </span>
            </div>
          </div>
        </div>

        <div className="balance-values">
          <div>
            <span>
              <i className="earned-dot" />
              Total Earned
            </span>
            <strong>
              {balance.totalEarned}
            </strong>
          </div>

          <div>
            <span>
              <i className="used-dot" />
              Used
            </span>
            <strong>{balance.used}</strong>
          </div>

          <div>
            <span>
              <i className="available-dot" />
              Available
            </span>
            <strong>
              {balance.available}
            </strong>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="balance-history-button"
      >
        View History
        <ArrowRight size={16} />
      </button>

      <div className="balance-small-icon">
        <CalendarCheck2 size={16} />
      </div>
    </div>
  );
};

export default CompOffBalance;