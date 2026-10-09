import {
    useState,
    useCallback,
    useEffect,
    useMemo,
} from 'react';

import {
    ShiftAssignmentFormData,
    Employee,
    ShiftPattern,
    LeaveRecord,
    WeekOffDays,
    ShiftAssignmentValidationErrors,
    WeekDayKey,
    GeneratedShiftDate,
} from '../types/shiftAssignment.types';

import {
    DEFAULT_WEEK_OFF_DAYS,
    LEAVE_TYPES,
} from '../constants/shiftAssignment.constants';

import {
    shiftAssignmentService,
} from '../services/shiftAssignment.service';

import {
    validateShiftAssignment,
} from '../validations/shiftAssignment.schema';

import {
    generateId,
    parseDate,
    getDayOfWeek,
    isDuplicateLeave,
    generateDateRange,
} from '../utils/shiftAssignment.utils';

/* ============================================================
   RETURN TYPE
============================================================ */

export interface UseShiftAssignmentReturn {

    formData:
        ShiftAssignmentFormData;

    employees:
        Employee[];

    shiftPatterns:
        ShiftPattern[];

    leaveTypes:
        readonly string[];

    isLoading:
        boolean;

    isSubmitting:
        boolean;

    errors:
        ShiftAssignmentValidationErrors;

    submitError:
        string | null;

    submitSuccess:
        boolean;

    selectedEmployeeId:
        string;

    startDate:
        string;

    endDate:
        string;

    selectedShiftPatternId:
        string;

    leaves:
        LeaveRecord[];

    leaveDate:
        string;

    leaveDayOfWeek:
        string;

    selectedLeaveType:
        string;

    weekOffDays:
        WeekOffDays;

    generatedDates:
        GeneratedShiftDate[];

    setSelectedEmployee:
        (id: string) => void;

    setStartDate:
        (date: string) => void;

    setEndDate:
        (date: string) => void;

    setSelectedShiftPattern:
        (id: string) => void;

    setLeaveDate:
        (date: string) => void;

    setSelectedLeaveType:
        (type: string) => void;

    addLeave:
        () => {
            success: boolean;
            error?: string;
        };

    removeLeave:
        (id: string) => void;

    toggleWeekOffDay:
        (day: WeekDayKey) => void;

    clearWeekOffDays:
        () => void;

    setGeneratedDatePattern:
        (
            date: string,
            patternId: string,
        ) => void;

    setGeneratedDateWeekOff:
        (
            date: string,
            isWeekOff: boolean,
        ) => void;

    resetForm:
        () => void;

    handleSubmit:
        () => Promise<void>;

    clearSubmitState:
        () => void;
}

/* ============================================================
   HOOK
============================================================ */

export const useShiftAssignment =
    (): UseShiftAssignmentReturn => {

    /* ========================================================
       API DATA
    ======================================================== */

    const [
        employees,
        setEmployees,
    ] = useState<Employee[]>([]);

    const [
        shiftPatterns,
        setShiftPatterns,
    ] = useState<ShiftPattern[]>([]);

    /* ========================================================
       STATUS
    ======================================================== */

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        submitError,
        setSubmitError,
    ] = useState<string | null>(
        null,
    );

    const [
        submitSuccess,
        setSubmitSuccess,
    ] = useState(false);

    /* ========================================================
       FORM
    ======================================================== */

    const [
        selectedEmployeeId,
        setSelectedEmployeeId,
    ] = useState('');

    const [
        startDate,
        setStartDate,
    ] = useState('');

    const [
        endDate,
        setEndDate,
    ] = useState('');

    const [
        selectedShiftPatternId,
        setSelectedShiftPatternId,
    ] = useState('');

    /* ========================================================
       LEAVES
    ======================================================== */

    const [
        leaves,
        setLeaves,
    ] = useState<LeaveRecord[]>([]);

    const [
        leaveDate,
        setLeaveDate,
    ] = useState('');

    const [
        selectedLeaveType,
        setSelectedLeaveType,
    ] = useState(
        'Comp Off',
    );

    /* ========================================================
       WEEK OFF
    ======================================================== */

    const [
        weekOffDays,
        setWeekOffDays,
    ] = useState<WeekOffDays>({
        ...DEFAULT_WEEK_OFF_DAYS,
    });

    /* ========================================================
       GENERATED DATE PATTERN OVERRIDES
       
       Key   = date
       Value = selected pattern id

       Example:
       {
           "2026-09-07": "1",
           "2026-09-08": "2"
       }
    ======================================================== */

    const [
        generatedPatternOverrides,
        setGeneratedPatternOverrides,
    ] = useState<Record<string, string>>({});

    /* ========================================================
       GENERATED DATE WEEK-OFF OVERRIDES

       Key   = date
       Value = true / false

       Important:
       The normal Week-Off Days section remains the default
       weekday configuration.

       This object only stores date-specific changes.

       Example:
       Monday is normally Week Off.

       {
           "2026-09-14": false
       }

       Means:
       14-09-2026 Monday becomes Working Day.

       Another example:

       {
           "2026-09-15": true
       }

       Means:
       15-09-2026 Tuesday becomes Week Off even if
       Tuesday is normally a Working Day.
    ======================================================== */

    const [
        generatedWeekOffOverrides,
        setGeneratedWeekOffOverrides,
    ] = useState<Record<string, boolean>>({});

    /* ========================================================
       ERRORS
    ======================================================== */

    const [
        errors,
        setErrors,
    ] = useState<
        ShiftAssignmentValidationErrors
    >({});

    /* ========================================================
       LOAD EMPLOYEES + PATTERNS
    ======================================================== */

    useEffect(() => {

        const loadData =
            async () => {

                setIsLoading(
                    true,
                );

                try {

                    const [
                        employeeData,
                        patternData,
                    ] =
                        await Promise.all([
                            shiftAssignmentService.getEmployees(),
                            shiftAssignmentService.getShiftPatterns(),
                        ]);

                    setEmployees(
                        employeeData,
                    );

                    setShiftPatterns(
                        patternData,
                    );

                } catch (
                    error: unknown
                ) {

                    console.error(
                        'Failed to load shift assignment data:',
                        error,
                    );

                    setSubmitError(
                        error instanceof Error
                            ? error.message
                            : 'Failed to load shift assignment data.',
                    );

                } finally {

                    setIsLoading(
                        false,
                    );
                }
            };

        loadData();

    }, []);

    /* ========================================================
       DEFAULT PATTERN
    ======================================================== */

    const defaultPatternId =
        selectedShiftPatternId ||
        (
            shiftPatterns.length > 0
                ? shiftPatterns[0].id
                : ''
        );

    /* ========================================================
       GENERATED DATES
    ======================================================== */

    const generatedDates =
        useMemo(
            (): GeneratedShiftDate[] => {

                const dates =
                    generateDateRange(
                        startDate,
                        endDate,
                    );

                if (
                    dates.length === 0
                ) {
                    return [];
                }

                const dayKeyMap:
                    Record<
                        string,
                        WeekDayKey
                    > = {

                    Sunday:
                        'sun',

                    Monday:
                        'mon',

                    Tuesday:
                        'tue',

                    Wednesday:
                        'wed',

                    Thursday:
                        'thu',

                    Friday:
                        'fri',

                    Saturday:
                        'sat',
                };

                return dates.map(
                    date => {

                        /* ------------------------------------
                           DAY
                        ------------------------------------ */

                        const dayOfWeek =
                            getDayOfWeek(
                                date,
                            );

                        const dayKey =
                            dayKeyMap[
                                dayOfWeek
                            ];

                        /* ------------------------------------
                           DEFAULT WEEK OFF
                        ------------------------------------ */

                        const defaultIsWeekOff =
                            dayKey
                                ? Boolean(
                                    weekOffDays[
                                        dayKey
                                    ],
                                )
                                : false;

                        /* ------------------------------------
                           DATE-SPECIFIC WEEK OFF OVERRIDE
                           
                           Important:
                           hasOwnProperty is used instead of
                           || because false is a valid override.
                        ------------------------------------ */

                        const hasWeekOffOverride =
                            Object.prototype.hasOwnProperty.call(
                                generatedWeekOffOverrides,
                                date,
                            );

                        const isWeekOff =
                            hasWeekOffOverride
                                ? Boolean(
                                    generatedWeekOffOverrides[
                                        date
                                    ],
                                )
                                : defaultIsWeekOff;

                        /* ------------------------------------
                           LEAVE
                        ------------------------------------ */

                        const leave =
                            leaves.find(
                                item =>
                                    item.date ===
                                    date,
                            );

                        /* ------------------------------------
                           PATTERN FOR THIS DATE
                        ------------------------------------ */

                        const patternIdForDate =
                            generatedPatternOverrides[
                                date
                            ] ||
                            defaultPatternId;

                        const selectedPattern =
                            shiftPatterns.find(
                                pattern =>
                                    String(
                                        pattern.id,
                                    ) ===
                                    String(
                                        patternIdForDate,
                                    ),
                            );

                        /* ------------------------------------
                           GENERATED DATE
                        ------------------------------------ */

                        return {

                            shiftDate:
                                date,

                            dayOfWeek,

                            patternId:
                                patternIdForDate,

                            patternName:
                                selectedPattern?.name,

                            startTime:
                                selectedPattern?.startTime,

                            endTime:
                                selectedPattern?.endTime,

                            isWeekOff,

                            isLeave:
                                Boolean(
                                    leave,
                                ),
                        };
                    },
                );

            },
            [
                startDate,
                endDate,
                weekOffDays,
                leaves,
                generatedPatternOverrides,
                generatedWeekOffOverrides,
                defaultPatternId,
                shiftPatterns,
            ],
        );

    /* ========================================================
       FORM DATA
    ======================================================== */

    const formData:
        ShiftAssignmentFormData =
        useMemo(
            () => ({

                employeeId:
                    selectedEmployeeId,

                startDate,

                endDate,

                shiftPatternId:
                    selectedShiftPatternId,

                leaves,

                weekOffDays,

                generatedPatterns:
                    generatedDates,

            }),
            [
                selectedEmployeeId,
                startDate,
                endDate,
                selectedShiftPatternId,
                leaves,
                weekOffDays,
                generatedDates,
            ],
        );

    /* ========================================================
       RE-VALIDATE
    ======================================================== */

    useEffect(() => {

        const result =
            validateShiftAssignment(
                formData,
            );

        setErrors(
            result.errors,
        );

    }, [
        formData,
    ]);

    /* ========================================================
       EMPLOYEE
    ======================================================== */

    const setSelectedEmployee =
        useCallback(
            (
                id: string,
            ) => {

                setSelectedEmployeeId(
                    id,
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       START DATE
    ======================================================== */

    const setStartDateHandler =
        useCallback(
            (
                date: string,
            ) => {

                setStartDate(
                    date,
                );

                /*
                 * The generated date range changed.
                 * Date-specific overrides must therefore be
                 * cleared to avoid stale date configuration.
                 */

                setGeneratedPatternOverrides(
                    {},
                );

                setGeneratedWeekOffOverrides(
                    {},
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       END DATE
    ======================================================== */

    const setEndDateHandler =
        useCallback(
            (
                date: string,
            ) => {

                setEndDate(
                    date,
                );

                /*
                 * The generated date range changed.
                 * Date-specific overrides must therefore be
                 * cleared to avoid stale date configuration.
                 */

                setGeneratedPatternOverrides(
                    {},
                );

                setGeneratedWeekOffOverrides(
                    {},
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       DEFAULT SHIFT PATTERN
    ======================================================== */

    const setSelectedShiftPattern =
        useCallback(
            (
                id: string,
            ) => {

                setSelectedShiftPatternId(
                    id,
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       LEAVE DATE
    ======================================================== */

    const setLeaveDateHandler =
        useCallback(
            (
                date: string,
            ) => {

                setLeaveDate(
                    date,
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       LEAVE TYPE
    ======================================================== */

    const setSelectedLeaveTypeHandler =
        useCallback(
            (
                type: string,
            ) => {

                setSelectedLeaveType(
                    type,
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       ADD LEAVE
    ======================================================== */

    const addLeave =
        useCallback(
            (): {
                success: boolean;
                error?: string;
            } => {

                if (
                    !leaveDate ||
                    leaveDate.trim() === ''
                ) {

                    return {
                        success: false,
                        error:
                            'Please select a date',
                    };
                }

                const parsed =
                    parseDate(
                        leaveDate,
                    );

                if (!parsed) {

                    return {
                        success: false,
                        error:
                            'Please enter a valid date',
                    };
                }

                if (
                    startDate &&
                    endDate
                ) {

                    const start =
                        parseDate(
                            startDate,
                        );

                    const end =
                        parseDate(
                            endDate,
                        );

                    if (
                        start &&
                        end &&
                        (
                            parsed < start ||
                            parsed > end
                        )
                    ) {

                        return {
                            success: false,
                            error:
                                'Leave date must be within the assignment date range',
                        };
                    }
                }

                if (
                    isDuplicateLeave(
                        leaves,
                        leaveDate,
                    )
                ) {

                    return {
                        success: false,
                        error:
                            'This date has already been added',
                    };
                }

                const newLeave:
                    LeaveRecord = {

                    id:
                        generateId(),

                    date:
                        leaveDate,

                    dayOfWeek:
                        getDayOfWeek(
                            leaveDate,
                        ),

                    leaveType:
                        selectedLeaveType,
                };

                setLeaves(
                    previous => [
                        ...previous,
                        newLeave,
                    ],
                );

                setLeaveDate(
                    '',
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );

                return {
                    success: true,
                };
            },
            [
                leaveDate,
                selectedLeaveType,
                leaves,
                startDate,
                endDate,
            ],
        );

    /* ========================================================
       REMOVE LEAVE
    ======================================================== */

    const removeLeave =
        useCallback(
            (
                id: string,
            ) => {

                setLeaves(
                    previous =>
                        previous.filter(
                            leave =>
                                leave.id !==
                                id,
                        ),
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       WEEK OFF DEFAULT DAYS
    ======================================================== */

    const toggleWeekOffDay =
        useCallback(
            (
                day: WeekDayKey,
            ) => {

                setWeekOffDays(
                    previous => ({

                        ...previous,

                        [day]:
                            !previous[
                                day
                            ],
                    }),
                );

                /*
                 * Default weekday configuration changed.
                 *
                 * We intentionally DO NOT clear date-specific
                 * overrides here.
                 *
                 * Example:
                 *
                 * Monday = Week Off
                 * 14-09-2026 Monday = Working Day override
                 *
                 * If Monday is changed globally later,
                 * the explicit 14-09-2026 override should
                 * still remain.
                 */

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       CLEAR WEEK OFF
    ======================================================== */

    const clearWeekOffDays =
        useCallback(
            () => {

                setWeekOffDays({
                    ...DEFAULT_WEEK_OFF_DAYS,
                });

                /*
                 * Date-specific overrides remain untouched.
                 *
                 * This is intentional because "Clear All"
                 * clears the DEFAULT weekday configuration,
                 * not individual generated-date changes.
                 */

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       CHANGE GENERATED DATE PATTERN
    ======================================================== */

    const setGeneratedDatePattern =
        useCallback(
            (
                date: string,
                patternId: string,
            ) => {

                setGeneratedPatternOverrides(
                    previous => ({

                        ...previous,

                        [date]:
                            patternId,
                    }),
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       CHANGE GENERATED DATE WEEK OFF
       
       This is the new date-level override.

       true  = Week Off
       false = Working Day
    ======================================================== */

    const setGeneratedDateWeekOff =
        useCallback(
            (
                date: string,
                isWeekOff: boolean,
            ) => {

                setGeneratedWeekOffOverrides(
                    previous => ({

                        ...previous,

                        [date]:
                            isWeekOff,
                    }),
                );

                setSubmitSuccess(
                    false,
                );

                setSubmitError(
                    null,
                );
            },
            [],
        );

    /* ========================================================
       RESET
    ======================================================== */

    const resetForm =
        useCallback(
            () => {

                setSelectedEmployeeId(
                    '',
                );

                setStartDate(
                    '',
                );

                setEndDate(
                    '',
                );

                setSelectedShiftPatternId(
                    '',
                );

                setLeaves(
                    [],
                );

                setLeaveDate(
                    '',
                );

                setSelectedLeaveType(
                    'Comp Off',
                );

                setWeekOffDays({
                    ...DEFAULT_WEEK_OFF_DAYS,
                });

                setGeneratedPatternOverrides(
                    {},
                );

                setGeneratedWeekOffOverrides(
                    {},
                );

                setSubmitError(
                    null,
                );

                setSubmitSuccess(
                    false,
                );

                setErrors(
                    {},
                );
            },
            [],
        );

    /* ========================================================
       SUBMIT
    ======================================================== */

    const handleSubmit =
        useCallback(
            async () => {

                const result =
                    validateShiftAssignment(
                        formData,
                    );

                if (
                    !result.isValid
                ) {

                    setErrors(
                        result.errors,
                    );

                    setSubmitError(
                        'Please fix the errors before submitting.',
                    );

                    setSubmitSuccess(
                        false,
                    );

                    return;
                }

                if (
                    isSubmitting
                ) {
                    return;
                }

                setIsSubmitting(
                    true,
                );

                setSubmitError(
                    null,
                );

                setSubmitSuccess(
                    false,
                );

                try {

                    await shiftAssignmentService.assignShift(
                        formData,
                    );

                    setSubmitSuccess(
                        true,
                    );

                    setSubmitError(
                        null,
                    );

                    resetForm();

                    setTimeout(
                        () => {

                            setSubmitSuccess(
                                false,
                            );

                        },
                        5000,
                    );

                } catch (
                    error: unknown
                ) {

                    const message =
                        error instanceof Error
                            ? error.message
                            : 'An unexpected error occurred. Please try again.';

                    setSubmitError(
                        message,
                    );

                    setSubmitSuccess(
                        false,
                    );

                    console.error(
                        'Assign shift failed:',
                        error,
                    );

                } finally {

                    setIsSubmitting(
                        false,
                    );
                }

            },
            [
                formData,
                isSubmitting,
                resetForm,
            ],
        );

    /* ========================================================
       CLEAR SUBMIT STATE
    ======================================================== */

    const clearSubmitState =
        useCallback(
            () => {

                setSubmitError(
                    null,
                );

                setSubmitSuccess(
                    false,
                );
            },
            [],
        );

    /* ========================================================
       LEAVE DAY
    ======================================================== */

    const leaveDayOfWeek =
        leaveDate
            ? getDayOfWeek(
                leaveDate,
            )
            : '';

    /* ========================================================
       RETURN
    ======================================================== */

    return {

        formData,

        employees,

        shiftPatterns,

        leaveTypes:
            LEAVE_TYPES as readonly string[],

        isLoading,

        isSubmitting,

        errors,

        submitError,

        submitSuccess,

        selectedEmployeeId,

        startDate,

        endDate,

        selectedShiftPatternId,

        leaves,

        leaveDate,

        leaveDayOfWeek,

        selectedLeaveType,

        weekOffDays,

        generatedDates,

        setSelectedEmployee,

        setStartDate:
            setStartDateHandler,

        setEndDate:
            setEndDateHandler,

        setSelectedShiftPattern,

        setLeaveDate:
            setLeaveDateHandler,

        setSelectedLeaveType:
            setSelectedLeaveTypeHandler,

        addLeave,

        removeLeave,

        toggleWeekOffDay,

        clearWeekOffDays,

        setGeneratedDatePattern,

        setGeneratedDateWeekOff,

        resetForm,

        handleSubmit,

        clearSubmitState,
    };
};