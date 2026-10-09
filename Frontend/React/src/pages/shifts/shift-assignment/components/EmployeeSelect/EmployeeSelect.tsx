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
    User,
    ChevronDown,
    Check,
    X,
} from 'lucide-react';

import {
    Employee,
} from '../../types/shiftAssignment.types';

import './EmployeeSelect.css';

export interface EmployeeSelectProps {
    employees: Employee[];

    /**
     * Single employee:
     * "12"
     *
     * Multiple employees:
     * "12,15,18"
     */
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

const EmployeeSelect: React.FC<
    EmployeeSelectProps
> = ({
    employees,
    value,
    onChange,
    placeholder = 'Select Employee',
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

    /**
     * IMPORTANT:
     *
     * inputValue is ONLY the search text.
     *
     * It is NOT used to display selected employee names.
     *
     * This prevents the previous useEffect bug where the
     * selected employee name kept overwriting the search text.
     */
    const [
        inputValue,
        setInputValue,
    ] = useState('');

    const [
        highlightedIndex,
        setHighlightedIndex,
    ] = useState(-1);

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

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const inputRef =
        useRef<HTMLInputElement>(null);

    /* ========================================================
       NORMALIZE SELECTED IDS
    ======================================================== */

    const selectedIds = useMemo(
        () => {
            return value
                .split(',')
                .map(
                    id =>
                        id.trim(),
                )
                .filter(Boolean);
        },
        [value],
    );

    /* ========================================================
       SELECTED EMPLOYEES
    ======================================================== */

    const selectedEmployees =
        useMemo(
            () => {
                return employees.filter(
                    employee =>
                        selectedIds.includes(
                            employee.id,
                        ),
                );
            },
            [
                employees,
                selectedIds,
            ],
        );

    /* ========================================================
       SELECTED ID SET
    ======================================================== */

    const selectedIdSet =
        useMemo(
            () =>
                new Set(
                    selectedIds,
                ),
            [selectedIds],
        );

    /* ========================================================
       DISPLAY TEXT
    ======================================================== */

    const selectedDisplayText =
        useMemo(
            () => {

                if (
                    selectedEmployees.length === 0
                ) {
                    return '';
                }

                if (
                    selectedEmployees.length === 1
                ) {
                    return selectedEmployees[0].name;
                }

                return `${selectedEmployees.length} employees selected`;
            },
            [selectedEmployees],
        );

    /* ========================================================
       FILTER EMPLOYEES
    ======================================================== */

    const filteredEmployees =
        useMemo(
            () => {

                const search =
                    inputValue
                        .trim()
                        .toLowerCase();

                if (!search) {
                    return employees;
                }

                return employees.filter(
                    employee => {

                        const name =
                            employee.name
                                ?.toLowerCase() ??
                            '';

                        const email =
                            employee.email
                                ?.toLowerCase() ??
                            '';

                        const department =
                            employee.department
                                ?.toLowerCase() ??
                            '';

                        return (
                            name.includes(search) ||
                            email.includes(search) ||
                            department.includes(search)
                        );
                    },
                );
            },
            [
                employees,
                inputValue,
            ],
        );

    /* ========================================================
       RESET HIGHLIGHT WHEN FILTER CHANGES
    ======================================================== */

    useEffect(() => {

        if (
            filteredEmployees.length === 0
        ) {
            setHighlightedIndex(-1);
            return;
        }

        setHighlightedIndex(
            previous => {

                if (
                    previous < 0
                ) {
                    return -1;
                }

                if (
                    previous >=
                    filteredEmployees.length
                ) {
                    return (
                        filteredEmployees.length - 1
                    );
                }

                return previous;
            },
        );

    }, [
        filteredEmployees.length,
    ]);

    /* ========================================================
       UPDATE DROPDOWN POSITION
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
                    280,
                    Math.max(
                        60,
                        filteredEmployees.length * 50 + 8,
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

            if (
                spaceBelow >= dropdownHeight ||
                spaceBelow >= spaceAbove
            ) {
                top =
                    rect.bottom +
                    4;
            } else {
                top =
                    rect.top -
                    dropdownHeight -
                    4;
            }

            setDropdownStyle({
                position: 'fixed',
                top,
                left: rect.left,
                width: rect.width,
                maxHeight:
                    Math.min(
                        280,
                        viewportHeight - 32,
                    ),
                zIndex: 99999,
            });

        }, [
            filteredEmployees.length,
        ]);

    /* ========================================================
       OPEN DROPDOWN
    ======================================================== */

    const openDropdown =
        useCallback(() => {

            if (disabled) {
                return;
            }

            setIsOpen(true);

            requestAnimationFrame(
                () => {
                    updateDropdownPosition();
                },
            );

        }, [
            disabled,
            updateDropdownPosition,
        ]);

    /* ========================================================
       DROPDOWN POSITION EVENTS
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
       OUTSIDE CLICK
       
       IMPORTANT FIX:
       
       Because dropdown is rendered using createPortal(),
       dropdownRef must ALSO be checked.
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

            if (
                clickedInsideControl ||
                clickedInsideDropdown
            ) {
                return;
            }

            setIsOpen(false);

            setHighlightedIndex(-1);

            setInputValue('');
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
                event.key !== 'Escape'
            ) {
                return;
            }

            if (!isOpen) {
                return;
            }

            setIsOpen(false);

            setHighlightedIndex(-1);

            setInputValue('');

            inputRef.current?.blur();
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

    }, [
        isOpen,
    ]);

    /* ========================================================
       SEARCH INPUT
    ======================================================== */

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {

        const search =
            event.target.value;

        setInputValue(
            search,
        );

        setIsOpen(true);

        setHighlightedIndex(-1);

        requestAnimationFrame(
            () => {
                updateDropdownPosition();
            },
        );
    };

    /* ========================================================
       SELECT / DESELECT EMPLOYEE
    ======================================================== */

    const handleSelect = (
        employeeId: string,
    ) => {

        if (!employeeId) {
            return;
        }

        const alreadySelected =
            selectedIdSet.has(
                employeeId,
            );

        let nextIds: string[];

        if (
            alreadySelected
        ) {

            /* ----------------------------------------------
               DESELECT
            ---------------------------------------------- */

            nextIds =
                selectedIds.filter(
                    id =>
                        id !== employeeId,
                );

        } else {

            /* ----------------------------------------------
               SELECT
            ---------------------------------------------- */

            nextIds = [
                ...selectedIds,
                employeeId,
            ];
        }

        /* --------------------------------------------------
           Remove duplicates
        -------------------------------------------------- */

        nextIds =
            Array.from(
                new Set(
                    nextIds,
                ),
            );

        /* --------------------------------------------------
           Send value back to parent
        -------------------------------------------------- */

        onChange(
            nextIds.join(','),
        );

        /* --------------------------------------------------
           Keep dropdown OPEN for multi-select
        -------------------------------------------------- */

        setInputValue('');

        setIsOpen(true);

        setHighlightedIndex(-1);

        requestAnimationFrame(
            () => {

                updateDropdownPosition();

                inputRef.current?.focus();
            },
        );
    };

    /* ========================================================
       KEYBOARD NAVIGATION
    ======================================================== */

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {

        /* ----------------------------------------------------
           ESCAPE
        ---------------------------------------------------- */

        if (
            event.key === 'Escape'
        ) {

            event.preventDefault();

            setIsOpen(false);

            setHighlightedIndex(-1);

            setInputValue('');

            return;
        }

        /* ----------------------------------------------------
           ARROW DOWN
        ---------------------------------------------------- */

        if (
            event.key === 'ArrowDown'
        ) {

            event.preventDefault();

            if (!isOpen) {

                setIsOpen(true);

                setHighlightedIndex(
                    filteredEmployees.length > 0
                        ? 0
                        : -1,
                );

                return;
            }

            setHighlightedIndex(
                previous => {

                    if (
                        filteredEmployees.length === 0
                    ) {
                        return -1;
                    }

                    if (
                        previous <
                        filteredEmployees.length - 1
                    ) {
                        return previous + 1;
                    }

                    return 0;
                },
            );

            return;
        }

        /* ----------------------------------------------------
           ARROW UP
        ---------------------------------------------------- */

        if (
            event.key === 'ArrowUp'
        ) {

            event.preventDefault();

            if (
                !isOpen ||
                filteredEmployees.length === 0
            ) {
                return;
            }

            setHighlightedIndex(
                previous => {

                    if (
                        previous <= 0
                    ) {
                        return (
                            filteredEmployees.length - 1
                        );
                    }

                    return previous - 1;
                },
            );

            return;
        }

        /* ----------------------------------------------------
           ENTER
        ---------------------------------------------------- */

        if (
            event.key === 'Enter'
        ) {

            if (
                highlightedIndex >= 0 &&
                highlightedIndex <
                    filteredEmployees.length
            ) {

                event.preventDefault();

                const employee =
                    filteredEmployees[
                        highlightedIndex
                    ];

                handleSelect(
                    employee.id,
                );
            }

            return;
        }

        /* ----------------------------------------------------
           TAB
        ---------------------------------------------------- */

        if (
            event.key === 'Tab'
        ) {

            setIsOpen(false);

            setHighlightedIndex(-1);

            setInputValue('');

            return;
        }
    };

    /* ========================================================
       INPUT FOCUS
    ======================================================== */

    const handleInputFocus = () => {

        if (disabled) {
            return;
        }

        openDropdown();

        requestAnimationFrame(
            () => {
                updateDropdownPosition();
            },
        );
    };

    /* ========================================================
       CONTROL CLICK
    ======================================================== */

    const handleControlClick = () => {

        if (disabled) {
            return;
        }

        if (isOpen) {

            inputRef.current?.focus();

            return;
        }

        setInputValue('');

        openDropdown();

        requestAnimationFrame(
            () => {
                inputRef.current?.focus();
            },
        );
    };

    /* ========================================================
       CLEAR ALL
    ======================================================== */

    const handleClear = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {

        event.preventDefault();

        event.stopPropagation();

        onChange('');

        setInputValue('');

        setHighlightedIndex(-1);

        setIsOpen(false);

        requestAnimationFrame(
            () => {
                inputRef.current?.focus();
            },
        );
    };

    /* ========================================================
       TOGGLE FROM DROPDOWN
    ======================================================== */

    const handleOptionMouseDown = (
        event: React.MouseEvent<HTMLDivElement>,
    ) => {

        /*
         * Prevent browser focus changes before click.
         *
         * This is especially important because the dropdown
         * is rendered through a portal.
         */

        event.preventDefault();
    };

    /* ========================================================
       DROPDOWN CONTENT
    ======================================================== */

    const dropdownContent =
        isOpen &&
        !disabled && (

            <div
                ref={dropdownRef}
                className="sa-employee-select__dropdown"
                style={dropdownStyle}
            >

                <div className="sa-employee-select__options">

                    {filteredEmployees.length === 0 ? (

                        <div className="sa-employee-select__no-results">
                            No employees found
                        </div>

                    ) : (

                        filteredEmployees.map(
                            (
                                employee,
                                index,
                            ) => {

                                const selected =
                                    selectedIdSet.has(
                                        employee.id,
                                    );

                                const highlighted =
                                    index ===
                                    highlightedIndex;

                                return (

                                    <div
                                        key={
                                            employee.id
                                        }
                                        className={`sa-employee-select__option ${
                                            selected
                                                ? 'sa-employee-select__option--selected'
                                                : ''
                                        } ${
                                            highlighted
                                                ? 'sa-employee-select__option--highlighted'
                                                : ''
                                        }`}
                                        onMouseDown={
                                            handleOptionMouseDown
                                        }
                                        onClick={() =>
                                            handleSelect(
                                                employee.id,
                                            )
                                        }
                                        onMouseEnter={() =>
                                            setHighlightedIndex(
                                                index,
                                            )
                                        }
                                        role="option"
                                        aria-selected={
                                            selected
                                        }
                                    >

                                        <div className="sa-employee-select__option-content">

                                            <span className="sa-employee-select__option-name">
                                                {
                                                    employee.name
                                                }
                                            </span>

                                            <span className="sa-employee-select__option-dept">
                                                {
                                                    employee.department
                                                }
                                            </span>

                                        </div>

                                        {selected && (

                                            <Check
                                                size={14}
                                                className="sa-employee-select__option-check"
                                            />

                                        )}

                                    </div>
                                );
                            },
                        )
                    )}

                </div>

            </div>
        );

    /* ========================================================
       RENDER
    ======================================================== */

    return (

        <div
            className="sa-employee-select"
            ref={containerRef}
        >

            {/* ==================================================
                LABEL
            ================================================== */}

            {label && (

                <label className="sa-employee-select__label">

                    {label}

                    {required && (

                        <span className="sa-employee-select__required">
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
                className={`sa-employee-select__control ${
                    isOpen
                        ? 'sa-employee-select__control--open'
                        : ''
                } ${
                    error
                        ? 'sa-employee-select__control--error'
                        : ''
                } ${
                    disabled
                        ? 'sa-employee-select__control--disabled'
                        : ''
                }`}
                onClick={
                    handleControlClick
                }
            >

                <div className="sa-employee-select__input-wrapper">

                    {/* USER ICON */}

                    <User
                        size={16}
                        className="sa-employee-select__input-icon"
                    />

                    {/* ==================================================
                        SEARCH INPUT
                    ================================================== */}

                    <input
                        ref={inputRef}
                        type="text"
                        className="sa-employee-select__input"
                        value={
                            inputValue
                        }
                        onChange={
                            handleInputChange
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        onFocus={
                            handleInputFocus
                        }
                        placeholder={
                            selectedDisplayText ||
                            placeholder
                        }
                        disabled={
                            disabled
                        }
                        autoComplete="off"
                        spellCheck={false}
                        aria-autocomplete="list"
                        aria-expanded={
                            isOpen
                        }
                        aria-haspopup="listbox"
                        role="combobox"
                    />

                    {/* ==================================================
                        CLEAR BUTTON
                    ================================================== */}

                    {selectedEmployees.length > 0 && (

                        <button
                            type="button"
                            className="sa-employee-select__clear-btn"
                            onClick={
                                handleClear
                            }
                            tabIndex={-1}
                            aria-label="Clear selected employees"
                        >

                            <X
                                size={14}
                            />

                        </button>

                    )}

                </div>

                {/* ==================================================
                    CHEVRON
                ================================================== */}

                <ChevronDown
                    size={16}
                    className={`sa-employee-select__chevron ${
                        isOpen
                            ? 'sa-employee-select__chevron--open'
                            : ''
                    }`}
                />

            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="sa-employee-select__error">
                    {error}
                </div>

            )}

            {/* ==================================================
                PORTAL DROPDOWN
            ================================================== */}

            {createPortal(
                dropdownContent,
                document.body,
            )}

        </div>
    );
};

export default EmployeeSelect;