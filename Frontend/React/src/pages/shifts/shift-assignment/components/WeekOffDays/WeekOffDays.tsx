// src/pages/shifts/shift-assignment/components/WeekOffDays/WeekOffDays.tsx

import React from 'react';
import { WeekDayKey, WEEK_DAY_LABELS } from '../../types/shiftAssignment.types';
import './WeekOffDays.css';

export interface WeekOffDaysProps {
    selectedDays: Record<WeekDayKey, boolean>;
    onToggleDay: (day: WeekDayKey) => void;
    onClearAll: () => void;
    disabled?: boolean;
}

const WeekOffDays: React.FC<WeekOffDaysProps> = ({
    selectedDays,
    onToggleDay,
    onClearAll,
    disabled = false,
}) => {
    const dayKeys: WeekDayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    const allSelected = dayKeys.every(key => selectedDays[key]);

    return (
        <section className="sa-section sa-section--weekoff">
            <div className="sa-section__header">
                <div className="sa-section__number">4</div>
                <h2 className="sa-section__title">Week-Off Days</h2>
                <button
                    className="sa-weekoff__clear-btn"
                    onClick={onClearAll}
                    disabled={disabled || !allSelected}
                    type="button"
                >
                    Clear All
                </button>
            </div>
            <div className="sa-section__body">
                <div className="sa-weekoff__grid">
                    {dayKeys.map((key) => (
                        <label
                            key={key}
                            className={`sa-weekoff__option ${selectedDays[key] ? 'sa-weekoff__option--selected' : ''}`}
                        >
                            <input
                                type="checkbox"
                                className="sa-weekoff__checkbox"
                                checked={selectedDays[key]}
                                onChange={() => onToggleDay(key)}
                                disabled={disabled}
                            />
                            <span className="sa-weekoff__label">{WEEK_DAY_LABELS[key]}</span>
                        </label>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WeekOffDays;