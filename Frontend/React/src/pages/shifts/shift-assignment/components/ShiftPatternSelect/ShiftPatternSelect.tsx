// src/pages/shifts/shift-assignment/components/ShiftPatternSelect/ShiftPatternSelect.tsx

import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react';

import {
    createPortal,
} from 'react-dom';

import {
    Clock,
    ChevronDown,
    Check,
} from 'lucide-react';

import {
    ShiftPattern,
} from '../../types/shiftAssignment.types';

import './ShiftPatternSelect.css';

export interface ShiftPatternSelectProps {
    patterns: ShiftPattern[];

    value: string;

    onChange: (
        value: string,
    ) => void;

    placeholder?: string;

    label?: string;

    required?: boolean;

    error?: string;

    disabled?: boolean;
}

const ShiftPatternSelect: React.FC<
    ShiftPatternSelectProps
> = ({
    patterns,
    value,
    onChange,
    placeholder = 'Select Shift Pattern',
    label,
    required = false,
    error,
    disabled = false,
}) => {

    /* ========================================================
       STATE
    ======================================================== */

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    const [
        dropdownStyle,
        setDropdownStyle,
    ] = useState<React.CSSProperties>({});

    /* ========================================================
       REFS
    ======================================================== */

    const containerRef =
        useRef<HTMLDivElement>(null);

    const controlRef =
        useRef<HTMLDivElement>(null);

    /**
     * IMPORTANT
     *
     * Dropdown is rendered using createPortal().
     *
     * Therefore dropdown is outside containerRef.
     *
     * We need a separate ref for the portal.
     */
    const dropdownRef =
        useRef<HTMLDivElement>(null);

    /* ========================================================
       SELECTED PATTERN
    ======================================================== */

    const selectedPattern =
        useMemo(
            () => {
                return patterns.find(
                    pattern =>
                        String(pattern.id) ===
                        String(value),
                );
            },
            [
                patterns,
                value,
            ],
        );

    /* ========================================================
       OUTSIDE CLICK
    ======================================================== */

    useEffect(() => {

        const handleMouseDown = (
            event: MouseEvent,
        ) => {

            const target =
                event.target as Node;

            const clickedInsideControl =
                containerRef.current?.contains(
                    target,
                );

            const clickedInsideDropdown =
                dropdownRef.current?.contains(
                    target,
                );

            /**
             * IMPORTANT:
             *
             * If click is inside either the
             * select control OR portal dropdown,
             * do not close.
             */
            if (
                clickedInsideControl ||
                clickedInsideDropdown
            ) {
                return;
            }

            setIsOpen(false);
        };

        document.addEventListener(
            'mousedown',
            handleMouseDown,
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleMouseDown,
            );
        };

    }, []);

    /* ========================================================
       ESCAPE
    ======================================================== */

    useEffect(() => {

        const handleEscape = (
            event: KeyboardEvent,
        ) => {

            if (
                event.key === 'Escape'
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            'keydown',
            handleEscape,
        );

        return () => {

            document.removeEventListener(
                'keydown',
                handleEscape,
            );
        };

    }, []);

    /* ========================================================
       DROPDOWN POSITION
    ======================================================== */

    const updateDropdownPosition =
        useCallback(() => {

            if (
                !controlRef.current
            ) {
                return;
            }

            const rect =
                controlRef.current
                    .getBoundingClientRect();

            const viewportHeight =
                window.innerHeight;

            const dropdownHeight =
                Math.min(
                    240,
                    Math.max(
                        60,
                        patterns.length * 42 + 8,
                    ),
                );

            const spaceBelow =
                viewportHeight -
                rect.bottom -
                8;

            const spaceAbove =
                rect.top -
                8;

            let top: number;

            let transformOrigin: string;

            if (
                spaceBelow >= dropdownHeight ||
                spaceBelow >= spaceAbove
            ) {

                top =
                    rect.bottom +
                    6;

                transformOrigin =
                    'top center';

            } else {

                top =
                    rect.top -
                    dropdownHeight -
                    6;

                transformOrigin =
                    'bottom center';
            }

            setDropdownStyle({

                position: 'fixed',

                top,

                left:
                    rect.left,

                width:
                    rect.width,

                maxHeight:
                    Math.min(
                        240,
                        viewportHeight - 32,
                    ),

                transformOrigin,

                zIndex: 99999,
            });

        }, [
            patterns.length,
        ]);

    /* ========================================================
       UPDATE POSITION WHILE OPEN
    ======================================================== */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        updateDropdownPosition();

        const handleUpdate =
            () => {
                updateDropdownPosition();
            };

        window.addEventListener(
            'scroll',
            handleUpdate,
            true,
        );

        window.addEventListener(
            'resize',
            handleUpdate,
        );

        return () => {

            window.removeEventListener(
                'scroll',
                handleUpdate,
                true,
            );

            window.removeEventListener(
                'resize',
                handleUpdate,
            );
        };

    }, [
        isOpen,
        updateDropdownPosition,
    ]);

    /* ========================================================
       TOGGLE
    ======================================================== */

    const handleToggle = () => {

        if (disabled) {
            return;
        }

        setIsOpen(
            previous =>
                !previous,
        );

        requestAnimationFrame(
            () => {
                updateDropdownPosition();
            },
        );
    };

    /* ========================================================
       SELECT PATTERN
    ======================================================== */

    const handleSelect = (
        patternId: string,
    ) => {

        console.log(
            '[Shift Pattern] Selected:',
            patternId,
        );

        onChange(
            String(patternId),
        );

        setIsOpen(false);
    };

    /* ========================================================
       PREVENT PORTAL MOUSEDOWN FROM CLOSING DROPDOWN
    ======================================================== */

    const handleOptionMouseDown = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {

        /**
         * Prevent focus/mousedown behavior from
         * interfering with option selection.
         */
        event.preventDefault();
    };

    /* ========================================================
       KEYBOARD
    ======================================================== */

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLDivElement>,
    ) => {

        if (
            event.key === 'Escape'
        ) {

            event.preventDefault();

            setIsOpen(false);

            return;
        }

        if (
            event.key === 'Enter'
        ) {

            event.preventDefault();

            if (
                isOpen &&
                patterns.length === 1
            ) {

                handleSelect(
                    String(
                        patterns[0].id,
                    ),
                );

                return;
            }

            if (isOpen) {
                setIsOpen(false);
            }

            return;
        }

        if (
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp'
        ) {

            event.preventDefault();

            if (!isOpen) {

                setIsOpen(true);

                requestAnimationFrame(
                    () => {
                        updateDropdownPosition();
                    },
                );
            }
        }
    };

    /* ========================================================
       DROPDOWN
    ======================================================== */

    const dropdownContent =
        isOpen &&
        !disabled &&
        patterns.length > 0 && (

            <div
                ref={dropdownRef}
                className="sa-shift-pattern-select__dropdown"
                style={dropdownStyle}
                role="listbox"
            >

                {patterns.map(
                    pattern => {

                        const isSelected =
                            String(
                                pattern.id,
                            ) ===
                            String(
                                value,
                            );

                        return (

                            <div
                                key={
                                    pattern.id
                                }
                                className={`sa-shift-pattern-select__option ${
                                    isSelected
                                        ? 'sa-shift-pattern-select__option--selected'
                                        : ''
                                }`}
                                onMouseDown={
                                    handleOptionMouseDown
                                }
                                onClick={() =>
                                    handleSelect(
                                        String(
                                            pattern.id,
                                        ),
                                    )
                                }
                                role="option"
                                aria-selected={
                                    isSelected
                                }
                            >

                                <div className="sa-shift-pattern-select__option-content">

                                    <span className="sa-shift-pattern-select__option-name">

                                        {
                                            pattern.name
                                        }

                                    </span>

                                    <span className="sa-shift-pattern-select__option-time">

                                        {
                                            pattern.startTime
                                        }

                                        {' - '}

                                        {
                                            pattern.endTime
                                        }

                                    </span>

                                    {pattern.description && (

                                        <span className="sa-shift-pattern-select__option-desc">

                                            {
                                                pattern.description
                                            }

                                        </span>

                                    )}

                                </div>

                                {isSelected && (

                                    <Check
                                        size={14}
                                        className="sa-shift-pattern-select__option-check"
                                    />

                                )}

                            </div>
                        );
                    },
                )}

            </div>
        );

    /* ========================================================
       RENDER
    ======================================================== */

    return (

        <div
            className="sa-shift-pattern-select"
            ref={containerRef}
        >

            {/* ==================================================
                LABEL
            ================================================== */}

            {label && (

                <label className="sa-shift-pattern-select__label">

                    {label}

                    {required && (

                        <span className="sa-shift-pattern-select__required">

                            *

                        </span>

                    )}

                </label>

            )}

            {/* ==================================================
                CONTROL
            ================================================== */}

            <div
                ref={controlRef}
                className={`sa-shift-pattern-select__control ${
                    isOpen
                        ? 'sa-shift-pattern-select__control--open'
                        : ''
                } ${
                    error
                        ? 'sa-shift-pattern-select__control--error'
                        : ''
                } ${
                    disabled
                        ? 'sa-shift-pattern-select__control--disabled'
                        : ''
                }`}
                onClick={
                    handleToggle
                }
                tabIndex={
                    disabled
                        ? -1
                        : 0
                }
                role="combobox"
                aria-expanded={
                    isOpen
                }
                aria-haspopup="listbox"
                aria-disabled={
                    disabled
                }
                onKeyDown={
                    handleKeyDown
                }
            >

                <div className="sa-shift-pattern-select__value">

                    <Clock
                        size={16}
                        className="sa-shift-pattern-select__value-icon"
                    />

                    {selectedPattern ? (

                        <span className="sa-shift-pattern-select__value-text">

                            {
                                selectedPattern.name
                            }

                            <span className="sa-shift-pattern-select__value-sub">

                                {
                                    selectedPattern.startTime
                                }

                                {' - '}

                                {
                                    selectedPattern.endTime
                                }

                            </span>

                        </span>

                    ) : (

                        <span className="sa-shift-pattern-select__placeholder">

                            {
                                placeholder
                            }

                        </span>

                    )}

                </div>

                <ChevronDown
                    size={16}
                    className={`sa-shift-pattern-select__chevron ${
                        isOpen
                            ? 'sa-shift-pattern-select__chevron--open'
                            : ''
                    }`}
                />

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="sa-shift-pattern-select__error">

                    {
                        error
                    }

                </div>

            )}

            {/* ==================================================
                PORTAL
            ================================================== */}

            {createPortal(
                dropdownContent,
                document.body,
            )}

        </div>
    );
};

export default ShiftPatternSelect;