// src/pages/shifts/shift-assignment/components/ShiftPatternSection/ShiftPatternSection.tsx

import React from 'react';
import ShiftPatternSelect from '../ShiftPatternSelect/ShiftPatternSelect';
import { ShiftPattern } from '../../types/shiftAssignment.types';
import './ShiftPatternSection.css';

export interface ShiftPatternSectionProps {
    patterns: ShiftPattern[];
    selectedPatternId: string;
    onPatternChange: (id: string) => void;
    error?: string;
    disabled?: boolean;
}

const ShiftPatternSection: React.FC<ShiftPatternSectionProps> = ({
    patterns,
    selectedPatternId,
    onPatternChange,
    error,
    disabled = false,
}) => {
    return (
        <section className="sa-section sa-section--shift-pattern">
            <div className="sa-section__header">
                <div className="sa-section__number">2</div>
                <h2 className="sa-section__title">Shift & Pattern</h2>
            </div>
            <div className="sa-section__body">
                <ShiftPatternSelect
                    patterns={patterns}
                    value={selectedPatternId}
                    onChange={onPatternChange}
                    placeholder="Select Shift Pattern"
                    label="Shift Pattern"
                    required
                    error={error}
                    disabled={disabled}
                />
            </div>
        </section>
    );
};

export default ShiftPatternSection;