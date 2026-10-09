// src/pages/shifts/shift-assignment/components/AssignmentActions/AssignmentActions.tsx

import React from 'react';
import { Send, RotateCcw } from 'lucide-react';
import './AssignmentActions.css';

export interface AssignmentActionsProps {
    onSubmit: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    resetLabel?: string;
    disabled?: boolean;
}

const AssignmentActions: React.FC<AssignmentActionsProps> = ({
    onSubmit,
    onReset,
    isSubmitting = false,
    submitLabel = 'Assign Shift',
    resetLabel = 'Reset',
    disabled = false,
}) => {
    return (
        <div className="sa-actions">
            <button
                className="sa-actions__primary"
                onClick={onSubmit}
                disabled={disabled || isSubmitting}
                type="button"
            >
                <Send size={18} className="sa-actions__primary-icon" />
                {isSubmitting ? 'Assigning...' : submitLabel}
            </button>
            <button
                className="sa-actions__secondary"
                onClick={onReset}
                disabled={disabled || isSubmitting}
                type="button"
            >
                <RotateCcw size={16} className="sa-actions__secondary-icon" />
                {resetLabel}
            </button>
        </div>
    );
};

export default AssignmentActions;