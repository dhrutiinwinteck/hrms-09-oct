// src/pages/shifts/shift-assignment/components/LeaveSection/LeaveSection.tsx

import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import AddLeaveButton from '../AddLeaveButton/AddLeaveButton';
import LeaveTable from '../LeaveTable/LeaveTable';
import { LeaveRecord } from '../../types/shiftAssignment.types';
import { LEAVE_TYPES } from '../../constants/shiftAssignment.constants';
import './LeaveSection.css';

export interface LeaveSectionProps {
    leaveDate: string;
    onLeaveDateChange: (date: string) => void;
    leaveDayOfWeek: string;
    selectedLeaveType: string;
    onLeaveTypeChange: (type: string) => void;
    leaves: LeaveRecord[];
    onAddLeave: () => { success: boolean; error?: string };
    onRemoveLeave: (id: string) => void;
    addLeaveError?: string;
    disabled?: boolean;
}

const LeaveSection: React.FC<LeaveSectionProps> = ({
    leaveDate,
    onLeaveDateChange,
    leaveDayOfWeek,
    selectedLeaveType,
    onLeaveTypeChange,
    leaves,
    onAddLeave,
    onRemoveLeave,
    addLeaveError,
    disabled = false,
}) => {
    const [localError, setLocalError] = useState<string | null>(null);

    const handleAddLeave = () => {
        const result = onAddLeave();
        if (!result.success && result.error) {
            setLocalError(result.error);
            setTimeout(() => setLocalError(null), 3000);
        } else {
            setLocalError(null);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onLeaveDateChange(e.target.value);
        setLocalError(null);
    };

    const handleLeaveTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onLeaveTypeChange(e.target.value);
    };

    const displayError = localError || addLeaveError;

    return (
        <section className="sa-section sa-section--leave">
            <div className="sa-section__header">
                <div className="sa-section__number">3</div>
                <h2 className="sa-section__title">Leave Section</h2>
            </div>
            <div className="sa-section__body">
                <div className="sa-leave-controls">
                    <div className="sa-leave-controls__row">
                        <div className="sa-leave-controls__field sa-leave-controls__field--date">
                            <label className="sa-leave-controls__label">Date</label>
                            <div className="sa-leave-controls__input-wrapper">
                                <Calendar size={18} className="sa-leave-controls__icon" />
                                <input
                                    type="date"
                                    className={`sa-leave-controls__input ${displayError ? 'sa-leave-controls__input--error' : ''}`}
                                    value={leaveDate}
                                    onChange={handleDateChange}
                                    placeholder="dd-mm-yyyy"
                                    disabled={disabled}
                                />
                            </div>
                        </div>

                        <div className="sa-leave-controls__field sa-leave-controls__field--day">
                            <label className="sa-leave-controls__label">Day of Week</label>
                            <input
                                type="text"
                                className="sa-leave-controls__input sa-leave-controls__input--day"
                                value={leaveDayOfWeek}
                                readOnly
                                disabled
                                placeholder="--"
                            />
                        </div>

                        <div className="sa-leave-controls__field sa-leave-controls__field--type">
                            <label className="sa-leave-controls__label">Leave Type</label>
                            <div className="sa-leave-controls__select-wrapper">
                                <select
                                    className="sa-leave-controls__select"
                                    value={selectedLeaveType}
                                    onChange={handleLeaveTypeChange}
                                    disabled={disabled}
                                >
                                    {LEAVE_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="sa-leave-controls__select-icon" />
                            </div>
                        </div>

                        <div className="sa-leave-controls__field sa-leave-controls__field--action">
                            <AddLeaveButton
                                onClick={handleAddLeave}
                                label="Add Leave"
                                disabled={disabled || !leaveDate}
                            />
                        </div>
                    </div>
                    {displayError && (
                        <div className="sa-leave-controls__error">{displayError}</div>
                    )}
                </div>

                <div className="sa-leave-table-wrapper">
                    <LeaveTable
                        leaves={leaves}
                        onRemoveLeave={onRemoveLeave}
                        emptyTitle="No leave added"
                        emptyDescription="Add leave dates to exclude from shift assignment"
                    />
                </div>
            </div>
        </section>
    );
};

export default LeaveSection;