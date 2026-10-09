import {
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react';

import type { CompOffSummary } from '../../types/compOff.types';

interface CompOffSummaryCardsProps {
  summary: CompOffSummary;
}

const CompOffSummaryCards = ({
  summary,
}: CompOffSummaryCardsProps) => {
  const cards = [
    {
      label: 'Total Requests',
      value: summary.totalRequests,
      icon: FileText,
      className: 'total',
    },
    {
      label: 'Approved',
      value: summary.approved,
      icon: CheckCircle2,
      className: 'approved',
    },
    {
      label: 'Pending',
      value: summary.pending,
      icon: Clock3,
      className: 'pending',
    },
    {
      label: 'Rejected',
      value: summary.rejected,
      icon: XCircle,
      className: 'rejected',
    },
  ];

  return (
    <div className="comp-off-summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`comp-off-summary-card ${card.className}`}
          >
            <div className="summary-card-icon">
              <Icon size={22} />
            </div>

            <div className="summary-card-content">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>

            <div className="summary-card-wave">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompOffSummaryCards;