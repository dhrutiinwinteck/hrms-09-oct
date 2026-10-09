import type { LucideIcon } from 'lucide-react';

import {
  CheckCircle2,
  ClipboardList,
  Users,
  XCircle,
} from 'lucide-react';

import './ShiftSwapSummary.css';

interface ShiftSwapSummaryData {
  Pending: number;
  Approved: number;
  Rejected: number;
}

interface ShiftSwapSummaryProps {
  summary: ShiftSwapSummaryData;
}

interface SummaryCardConfig {
  key: keyof ShiftSwapSummaryData | 'Total';
  label: string;
  subLabel: string;
  icon: LucideIcon;
  className: string;
}

const SUMMARY_CARDS: SummaryCardConfig[] = [
  {
    key: 'Total',
    label: 'Total Requests',
    subLabel: 'All requests',
    icon: ClipboardList,
    className: 'total',
  },
  {
    key: 'Pending',
    label: 'Pending',
    subLabel: 'Awaiting approval',
    icon: Users,
    className: 'pending',
  },
  {
    key: 'Approved',
    label: 'Approved',
    subLabel: 'Approved requests',
    icon: CheckCircle2,
    className: 'approved',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    subLabel: 'Rejected requests',
    icon: XCircle,
    className: 'rejected',
  },
];

const ShiftSwapSummary = ({
  summary,
}: ShiftSwapSummaryProps) => {
  const totalRequests =
    summary.Pending +
    summary.Approved +
    summary.Rejected;

  return (
    <section
      className="shift-swap-summary"
      aria-label="Shift swap summary"
    >
      {SUMMARY_CARDS.map((card) => {
        const Icon = card.icon;

        const count =
          card.key === 'Total'
            ? totalRequests
            : summary[card.key];

        return (
          <article
            key={card.key}
            className={`shift-swap-summary__card shift-swap-summary__card--${card.className}`}
          >
            <div className="shift-swap-summary__icon">
              <Icon
                size={21}
                strokeWidth={2}
              />
            </div>

            <div className="shift-swap-summary__content">
              <strong className="shift-swap-summary__count">
                {String(count).padStart(2, '0')}
              </strong>

              <span className="shift-swap-summary__label">
                {card.label}
              </span>

              <span className="shift-swap-summary__sub-label">
                {card.subLabel}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default ShiftSwapSummary;