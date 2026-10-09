import React from 'react';

import {
  ChevronDown,
  FileText,
} from 'lucide-react';

import {
  PAYSLIP_EMPTY_STATE_DESCRIPTION,
  PAYSLIP_EMPTY_STATE_TITLE,
} from '../../constants/payslipAdmin.constants';

import type {
  PayslipRecord,
} from '../../types/payslipAdmin.types';

import {
  PayslipAdminRow,
} from '../PayslipAdminRow/PayslipAdminRow';

import './PayslipAdminTable.css';

interface PayslipAdminTableProps {
  payslips: PayslipRecord[];
  isLoading: boolean;
  onPreview?: (payslip: PayslipRecord) => void;
}

const columns = [
  'Name',
  'Employee ID',
  'Month',
  'Salary',
  'Payslip',
  'Action',
] as const;

export const PayslipAdminTable: React.FC<
  PayslipAdminTableProps
> = ({
  payslips,
  isLoading,
  onPreview,
}) => {
  return (
    <div className="payslip-admin-table-wrapper">
      <table className="payslip-admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                <span>{column}</span>

                <ChevronDown
                  size={13}
                  className="payslip-admin-table__sort-icon"
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="payslip-admin-table__loading"
              >
                Loading payslips...
              </td>
            </tr>
          ) : payslips.length > 0 ? (
            payslips.map((payslip) => (
              <PayslipAdminRow
                key={payslip.id}
                payslip={payslip}
                onPreview={onPreview}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="payslip-admin-table__empty-cell"
              >
                <div className="payslip-admin-table__empty">
                  <div className="payslip-admin-table__empty-icon">
                    <FileText size={37} />
                  </div>

                  <strong>
                    {PAYSLIP_EMPTY_STATE_TITLE}
                  </strong>

                  <span>
                    {PAYSLIP_EMPTY_STATE_DESCRIPTION}
                  </span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};