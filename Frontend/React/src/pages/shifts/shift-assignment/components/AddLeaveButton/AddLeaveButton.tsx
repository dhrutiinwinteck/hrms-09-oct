// src/pages/shifts/shift-assignment/components/AddLeaveButton/AddLeaveButton.tsx

import React from 'react';
import { Plus } from 'lucide-react';
import './AddLeaveButton.css';

export interface AddLeaveButtonProps {
    onClick: () => void;
    label?: string;
    disabled?: boolean;
    loading?: boolean;
}

const AddLeaveButton: React.FC<AddLeaveButtonProps> = ({
    onClick,
    label = 'Add Leave',
    disabled = false,
    loading = false,
}) => {
    return (
        <button
            className={`sa-add-leave-btn ${disabled || loading ? 'sa-add-leave-btn--disabled' : ''}`}
            onClick={onClick}
            disabled={disabled || loading}
            type="button"
        >
            <Plus size={18} className="sa-add-leave-btn__icon" />
            {loading ? 'Adding...' : label}
        </button>
    );
};

export default AddLeaveButton;