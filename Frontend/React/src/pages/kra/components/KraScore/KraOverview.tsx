import React from 'react';
import {
  ClipboardList,
  Clock3,
  TrendingUp,
  UsersRound,
} from 'lucide-react';

import kraOverviewIllustration from '../../../../assets/images/kra/kra-overview-illustration.png';

import './KraOverview.css';

interface KraOverviewProps {
  totalScores?: number;
  pendingReviews?: number;
  averageScore?: number;
  kraOwners?: number;
}

type OverviewVariant =
  | 'primary'
  | 'warning'
  | 'success'
  | 'secondary';

interface OverviewStat {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: OverviewVariant;
}

const KraOverview: React.FC<KraOverviewProps> = ({
  totalScores = 24,
  pendingReviews = 6,
  averageScore = 68.5,
  kraOwners = 12,
}) => {
  const stats: OverviewStat[] = [
    {
      id: 'total',
      value: totalScores.toString(),
      label: 'Total KRA Scores',
      description: 'All Time',
      icon: <ClipboardList />,
      variant: 'primary',
    },
    {
      id: 'pending',
      value: pendingReviews
        .toString()
        .padStart(2, '0'),
      label: 'Pending Review',
      description: 'Need attention',
      icon: <Clock3 />,
      variant: 'warning',
    },
    {
      id: 'average',
      value: `${averageScore}%`,
      label: 'Average Score',
      description: 'This Year',
      icon: <TrendingUp />,
      variant: 'success',
    },
    {
      id: 'owners',
      value: kraOwners.toString(),
      label: 'KRA Owners',
      description: 'Across Departments',
      icon: <UsersRound />,
      variant: 'secondary',
    },
  ];

  return (
    <section
      className="kra-overview"
      aria-label="KRA overview"
    >
      {/* =====================================================
          LEFT ILLUSTRATION
          ===================================================== */}
      <div
        className="kra-overview-illustration"
        aria-hidden="true"
      >
        <img
          src={kraOverviewIllustration}
          alt=""
          className="kra-overview-illustration-image"
          draggable={false}
        />
      </div>

      {/* =====================================================
          KPI OVERVIEW
          ===================================================== */}
      <div className="kra-overview-stats">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className={`kra-overview-stat kra-overview-stat-${stat.variant}`}
          >
            <div className="kra-overview-stat-top">
              <div
                className="kra-overview-stat-icon"
                aria-hidden="true"
              >
                {stat.icon}
              </div>

              <strong className="kra-overview-stat-value">
                {stat.value}
              </strong>
            </div>

            <div className="kra-overview-stat-content">
              <span className="kra-overview-stat-label">
                {stat.label}
              </span>

              <span className="kra-overview-stat-description">
                {stat.description}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default KraOverview;