import React from 'react';
import './StatusBadge.css';

export interface StatusBadgeProps {
  status: 'Pending' | 'Pending RM Approval' | 'Pending HR Approval' | 'Approved' | 'Rejected' | 'Withdrawn';
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<StatusBadgeProps['status'], { cssClass: string; label: string }> = {
  'Pending': { cssClass: 'status-pending', label: 'Pending' },
  'Pending RM Approval': { cssClass: 'status-pending-rm', label: 'Pending RM Approval' },
  'Pending HR Approval': { cssClass: 'status-pending-hr', label: 'Pending HR Approval' },
  'Approved': { cssClass: 'status-approved', label: 'Approved' },
  'Rejected': { cssClass: 'status-rejected', label: 'Rejected' },
  'Withdrawn': { cssClass: 'status-withdrawn', label: 'Withdrawn' },
};

const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  return <span className={`resignation-status-badge ${config.cssClass} size-${size}`}>{config.label}</span>;
});

StatusBadge.displayName = 'StatusBadge';
export default StatusBadge;