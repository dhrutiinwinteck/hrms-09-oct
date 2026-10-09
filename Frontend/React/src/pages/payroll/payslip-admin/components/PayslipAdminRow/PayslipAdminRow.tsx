import React from 'react';

import {
  PayslipAdminActions,
} from '../PayslipAdminActions/PayslipAdminActions';

import {
  PayslipStatusBadge,
} from '../PayslipStatusBadge/PayslipStatusBadge';

import type {
  PayslipRecord,
} from '../../types/payslipAdmin.types';

import {
  formatSalary,
} from '../../utils/payslipAdmin.utils';

import './PayslipAdminRow.css';

interface PayslipAdminRowProps {
  payslip: PayslipRecord;
  onPreview?: (payslip: PayslipRecord) => void;
}

export const PayslipAdminRow: React.FC<
  PayslipAdminRowProps
> = ({
  payslip,
  onPreview,
}) => {
  return (
    <tr className="payslip-admin-row">
      <td>{payslip.name}</td>
      <td>{payslip.employeeId}</td>
      <td>{payslip.month}</td>
      <td>{formatSalary(payslip.salary)}</td>
      <td>
        <PayslipStatusBadge
          status={payslip.status}
        />
      </td>
      <td>
        <PayslipAdminActions
          onPreview={() =>
            onPreview?.(payslip)
          }
        />
      </td>
    </tr>
  );
};