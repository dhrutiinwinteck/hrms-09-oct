import React from 'react';

import {
  Eye,
  MoreHorizontal,
} from 'lucide-react';

import './PayslipAdminActions.css';

interface PayslipAdminActionsProps {
  onPreview?: () => void;
}

export const PayslipAdminActions: React.FC<
  PayslipAdminActionsProps
> = ({
  onPreview,
}) => {
  return (
    <div className="payslip-admin-actions">
      <button
        type="button"
        className="payslip-admin-actions__button"
        onClick={onPreview}
        aria-label="Preview payslip"
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        className="payslip-admin-actions__button"
        aria-label="More actions"
      >
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
};