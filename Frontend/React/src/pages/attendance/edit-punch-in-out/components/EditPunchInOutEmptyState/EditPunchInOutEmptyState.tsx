import React from 'react';
import { Info } from 'lucide-react';
import { UI_LABELS } from '../../constants/editPunchInOut.constants';
import './EditPunchInOutEmptyState.css';

interface EditPunchInOutEmptyStateProps {
  message?: string;
}

export const EditPunchInOutEmptyState: React.FC<EditPunchInOutEmptyStateProps> = ({
  message = UI_LABELS.emptyState,
}) => {
  return (
    <div className="edit-punch-in-out-empty-state">
      <Info size={18} className="edit-punch-in-out-empty-state__icon" />
      <span className="edit-punch-in-out-empty-state__message">
        {message}
      </span>
    </div>
  );
};