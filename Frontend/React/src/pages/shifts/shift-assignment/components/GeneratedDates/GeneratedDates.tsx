// src/pages/shifts/shift-assignment/components/GeneratedDates/GeneratedDates.tsx

import React from 'react';

import {
    CalendarDays,
    Clock,
    Check,
    Umbrella,
    ChevronDown,
} from 'lucide-react';

import {
    GeneratedShiftDate,
    ShiftPattern,
} from '../../types/shiftAssignment.types';

import './GeneratedDates.css';

export interface GeneratedDatesProps {
    dates: GeneratedShiftDate[];

    patterns: ShiftPattern[];

    onPatternChange: (
        date: string,
        patternId: string,
    ) => void;

    onWeekOffChange: (
        date: string,
        isWeekOff: boolean,
    ) => void;

    disabled?: boolean;
}

const GeneratedDates: React.FC<
    GeneratedDatesProps
> = ({
    dates,
    patterns,
    onPatternChange,
    onWeekOffChange,
    disabled = false,
}) => {

    return (
        <section className="sa-section sa-section--generated-dates">

            <div className="sa-section__header">

                <div className="sa-section__number">
                    5
                </div>

                <div className="sa-section__generated-header-content">

                    <h2 className="sa-section__title">
                        Generated Dates
                    </h2>

                    <span className="sa-generated-count">
                        {dates.length} date
                        {dates.length !== 1
                            ? 's'
                            : ''}
                    </span>

                </div>

            </div>

            <div className="sa-section__body">

                {dates.length === 0 ? (

                    <div className="sa-generated-empty">

                        <CalendarDays
                            size={34}
                        />

                        <strong>
                            Select start and end dates
                        </strong>

                        <span>
                            Generated dates will appear here.
                        </span>

                    </div>

                ) : (

                    <div className="sa-generated-dates">

                        {dates.map(
                            date => {

                                const selectedPattern =
                                    patterns.find(
                                        pattern =>
                                            String(
                                                pattern.id,
                                            ) ===
                                            String(
                                                date.patternId,
                                            ),
                                    );

                                return (

                                    <div
                                        key={
                                            date.shiftDate
                                        }
                                        className={`sa-generated-date-row ${
                                            date.isWeekOff
                                                ? 'sa-generated-date-row--weekoff'
                                                : ''
                                        } ${
                                            date.isLeave
                                                ? 'sa-generated-date-row--leave'
                                                : ''
                                        }`}
                                    >

                                        {/* =================================
                                            DATE
                                        ================================= */}

                                        <div className="sa-generated-date-info">

                                            <div className="sa-generated-date-icon">

                                                <CalendarDays
                                                    size={18}
                                                />

                                            </div>

                                            <div className="sa-generated-date-text">

                                                <span className="sa-generated-date-value">

                                                    {formatDisplayDate(
                                                        date.shiftDate,
                                                    )}

                                                </span>

                                                <span className="sa-generated-day">

                                                    {date.dayOfWeek}

                                                </span>

                                            </div>

                                        </div>

                                        {/* =================================
                                            STATUS
                                        ================================= */}

                                        <div className="sa-generated-date-status">

                                            {date.isLeave ? (

                                                <span className="sa-generated-status sa-generated-status--leave">

                                                    <Umbrella
                                                        size={13}
                                                    />

                                                    Leave

                                                </span>

                                            ) : (

                                                <div className="sa-generated-status-control">

                                                    <select
                                                        value={
                                                            date.isWeekOff
                                                                ? 'weekoff'
                                                                : 'working'
                                                        }
                                                        onChange={
                                                            event =>
                                                                onWeekOffChange(
                                                                    date.shiftDate,
                                                                    event.target.value === 'weekoff',
                                                                )
                                                        }
                                                        disabled={
                                                            disabled
                                                        }
                                                        className={`sa-generated-status-select ${
                                                            date.isWeekOff
                                                                ? 'sa-generated-status-select--weekoff'
                                                                : 'sa-generated-status-select--working'
                                                        }`}
                                                        aria-label={`Change status for ${formatDisplayDate(
                                                            date.shiftDate,
                                                        )}`}
                                                    >

                                                        <option value="working">
                                                            Working Day
                                                        </option>

                                                        <option value="weekoff">
                                                            Week Off
                                                        </option>

                                                    </select>

                                                    <ChevronDown
                                                        size={13}
                                                        className="sa-generated-status-select__icon"
                                                    />

                                                </div>

                                            )}

                                        </div>

                                        {/* =================================
                                            PATTERN
                                        ================================= */}

                                        <div className="sa-generated-pattern-control">

                                            <Clock
                                                size={16}
                                                className="sa-generated-pattern-icon"
                                            />

                                            <select
                                                value={
                                                    date.patternId
                                                }
                                                onChange={event =>
                                                    onPatternChange(
                                                        date.shiftDate,
                                                        event.target.value,
                                                    )
                                                }
                                                disabled={
                                                    disabled ||
                                                    patterns.length === 0
                                                }
                                                className="sa-generated-pattern-select"
                                            >

                                                {patterns.length ===
                                                    0 ? (

                                                    <option value="">
                                                        No shift patterns available
                                                    </option>

                                                ) : (

                                                    patterns.map(
                                                        pattern => (

                                                            <option
                                                                key={
                                                                    pattern.id
                                                                }
                                                                value={
                                                                    pattern.id
                                                                }
                                                            >

                                                                {
                                                                    pattern.name
                                                                }

                                                                {' ('}

                                                                {
                                                                    pattern.startTime
                                                                }

                                                                {' - '}

                                                                {
                                                                    pattern.endTime
                                                                }

                                                                {')'}

                                                            </option>

                                                        ),
                                                    )

                                                )}

                                            </select>

                                        </div>

                                    </div>
                                );
                            },
                        )}

                    </div>
                )}

            </div>
        </section>
    );
};

/* ============================================================
   DISPLAY DATE
============================================================ */

const formatDisplayDate = (
    dateString: string,
): string => {

    if (!dateString) {
        return '';
    }

    const parts =
        dateString.split('-');

    if (
        parts.length !== 3
    ) {
        return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export default GeneratedDates;