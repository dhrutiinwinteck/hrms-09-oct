// src/pages/shifts/shift-assignment/components/EmployeeDurationSection/EmployeeDurationSection.tsx

import React from 'react';
import { Calendar } from 'lucide-react';
import EmployeeSelect from '../EmployeeSelect/EmployeeSelect';
import { Employee } from '../../types/shiftAssignment.types';
import './EmployeeDurationSection.css';

export interface EmployeeDurationSectionProps {
    employees: Employee[];
    selectedEmployeeId: string;
    onEmployeeChange: (id: string) => void;
    startDate: string;
    onStartDateChange: (date: string) => void;
    endDate: string;
    onEndDateChange: (date: string) => void;
    errors?: {
        employeeId?: string;
        startDate?: string;
        endDate?: string;
    };
    disabled?: boolean;
}

const EmployeeDurationSection: React.FC<EmployeeDurationSectionProps> = ({
    employees,
    selectedEmployeeId,
    onEmployeeChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    errors = {},
    disabled = false,
}) => {
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onStartDateChange(e.target.value);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onEndDateChange(e.target.value);
    };

    return (
        <section className="sa-section sa-section--employee-duration">
            <div className="sa-section__header">
                <div className="sa-section__number">1</div>
                <h2 className="sa-section__title">Employee & Duration</h2>
            </div>
            <div className="sa-section__body sa-section__body--two-col">
                <div className="sa-section__col sa-section__col--left">
                    <EmployeeSelect
                        employees={employees}
                        value={selectedEmployeeId}
                        onChange={onEmployeeChange}
                        placeholder="Select Employee"
                        label="Employee"
                        required
                        error={errors.employeeId}
                        disabled={disabled}
                    />
                </div>
                <div className="sa-section__col sa-section__col--right">
                    <div className="sa-duration-fields">
                        <div className="sa-duration-field">
                            <label className="sa-duration-field__label">
                                Start Date <span className="sa-duration-field__required">*</span>
                            </label>
                            <div className="sa-duration-field__input-wrapper">
                                <Calendar size={16} className="sa-duration-field__icon" />
                                <input
                                    type="date"
                                    className={`sa-duration-field__input ${errors.startDate ? 'sa-duration-field__input--error' : ''}`}
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    placeholder="dd-mm-yyyy"
                                    disabled={disabled}
                                />
                            </div>
                            {errors.startDate && (
                                <div className="sa-duration-field__error">{errors.startDate}</div>
                            )}
                        </div>
                        <div className="sa-duration-field">
                            <label className="sa-duration-field__label">
                                End Date <span className="sa-duration-field__required">*</span>
                            </label>
                            <div className="sa-duration-field__input-wrapper">
                                <Calendar size={16} className="sa-duration-field__icon" />
                                <input
                                    type="date"
                                    className={`sa-duration-field__input ${errors.endDate ? 'sa-duration-field__input--error' : ''}`}
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    placeholder="dd-mm-yyyy"
                                    disabled={disabled}
                                />
                            </div>
                            {errors.endDate && (
                                <div className="sa-duration-field__error">{errors.endDate}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmployeeDurationSection;