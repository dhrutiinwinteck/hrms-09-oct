import React from 'react';
import {
  User,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

import { JoiningApprovalStatCard } from '../JoiningApprovalStatCard/JoiningApprovalStatCard';

import './JoiningApprovalStats.css';

interface StatsData {
  pending: number;
  approved: number;
  rejected: number;
  onHold: number;
}

interface StatsProps {
  stats: StatsData;
}

export const JoiningApprovalStats: React.FC<StatsProps> = ({
  stats,
}) => {
  return (
    <div className="joining-approval-stats-container">

      <JoiningApprovalStatCard
        icon={User}
        label="Pending Approvals"
        value={stats.pending}
        subtitle="Requests"
        color="#1890ff"
      />

      <JoiningApprovalStatCard
        icon={CheckCircle2}
        label="Approved"
        value={stats.approved}
        subtitle="This Month"
        color="#16a34a"
      />

      <JoiningApprovalStatCard
        icon={XCircle}
        label="Rejected"
        value={stats.rejected}
        subtitle="This Month"
        color="#dc2626"
      />

      <JoiningApprovalStatCard
        icon={Clock}
        label="On Hold"
        value={stats.onHold}
        subtitle="Requests"
        color="#ea580c"
      />

    </div>
  );
};