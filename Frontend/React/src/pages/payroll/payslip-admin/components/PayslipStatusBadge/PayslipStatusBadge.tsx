import React from 'react';

import type {
  PayslipStatus,
} from '../../types/payslipAdmin.types';

import './PayslipStatusBadge.css';

interface PayslipStatusBadgeProps {
  status: PayslipStatus;
}

export const PayslipStatusBadge: React.FC<
  PayslipStatusBadgeProps
> = ({
  status,
}) => {
  const className =
    status === 'Generated'
      ? 'payslip-status-badge payslip-status-badge--generated'
      : status === 'Pending'
        ? 'payslip-status-badge payslip-status-badge--pending'
        : 'payslip-status-badge payslip-status-badge--not-generated';

  return (
    <span className={className}>
      {status}
    </span>
  );
};