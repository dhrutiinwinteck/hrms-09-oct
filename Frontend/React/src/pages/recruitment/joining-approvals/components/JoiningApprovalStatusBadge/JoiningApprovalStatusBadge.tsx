import React from 'react';
import { JoiningApprovalStatus } from '../../types/joiningApprovals.types';
import './JoiningApprovalStatusBadge.css';

interface StatusBadgeProps {
  status: JoiningApprovalStatus;
}

export const JoiningApprovalStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = (status: JoiningApprovalStatus) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Rejected': return 'rejected';
      case 'On Hold': return 'hold';
      default: return 'pending';
    }
  };

  return (
    <span className={`joining-status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};