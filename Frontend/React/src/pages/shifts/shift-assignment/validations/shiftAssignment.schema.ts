// src/pages/shifts/shift-assignment/validations/shiftAssignment.schema.ts

import {
    ShiftAssignmentFormData,
    ShiftAssignmentValidationErrors,
    LeaveRecord,
} from '../types/shiftAssignment.types';

import {
    isValidDate,
    isDateSameOrAfter,
    isDuplicateLeave,
    isDateInRange,
} from '../utils/shiftAssignment.utils';

export interface ValidationResult {
    isValid: boolean;

    errors:
        ShiftAssignmentValidationErrors;
}

export const validateShiftAssignment = (
    data: ShiftAssignmentFormData,
): ValidationResult => {

    const errors:
        ShiftAssignmentValidationErrors =
        {};

    /* ========================================================
       EMPLOYEE
    ======================================================== */

    const employeeIds =
        data.employeeId
            .split(',')
            .map(
                id =>
                    Number(
                        id.trim(),
                    ),
            )
            .filter(
                id =>
                    Number.isInteger(id) &&
                    id > 0,
            );

    if (
        employeeIds.length === 0
    ) {

        errors.employeeId =
            'Please select at least one employee.';
    }

    /* ========================================================
       START DATE
    ======================================================== */

    if (
        !data.startDate ||
        data.startDate.trim() === ''
    ) {

        errors.startDate =
            'Start date is required.';

    } else if (
        !isValidDate(
            data.startDate,
        )
    ) {

        errors.startDate =
            'Please enter a valid date.';
    }

    /* ========================================================
       END DATE
    ======================================================== */

    if (
        !data.endDate ||
        data.endDate.trim() === ''
    ) {

        errors.endDate =
            'End date is required.';

    } else if (
        !isValidDate(
            data.endDate,
        )
    ) {

        errors.endDate =
            'Please enter a valid date.';

    } else if (
        data.startDate &&
        isValidDate(
            data.startDate,
        )
    ) {

        if (
            !isDateSameOrAfter(
                data.endDate,
                data.startDate,
            )
        ) {

            errors.endDate =
                'End date cannot be before start date.';
        }
    }

    /* ========================================================
       DEFAULT SHIFT PATTERN
    ======================================================== */

    if (
        !data.shiftPatternId ||
        data.shiftPatternId.trim() === ''
    ) {

        errors.shiftPatternId =
            'Please select a shift pattern.';
    }

    /* ========================================================
       LEAVES
    ======================================================== */

    if (
        data.startDate &&
        data.endDate &&
        isValidDate(
            data.startDate,
        ) &&
        isValidDate(
            data.endDate,
        )
    ) {

        const invalidLeaves =
            data.leaves.filter(
                leave =>
                    !isDateInRange(
                        leave.date,
                        data.startDate,
                        data.endDate,
                    ),
            );

        if (
            invalidLeaves.length > 0
        ) {

            errors.leaves =
                'Some leave dates are outside the assignment date range.';
        }

        /* ----------------------------------------------------
           Duplicate leaves
        ---------------------------------------------------- */

        const seenLeaves =
            new Set<string>();

        for (
            const leave
            of data.leaves
        ) {

            if (
                isDuplicateLeave(
                    Array.from(
                        seenLeaves,
                    ).map(
                        date => ({
                            id: date,
                            date,
                            dayOfWeek: '',
                            leaveType: '',
                        }),
                    ) as LeaveRecord[],
                    leave.date,
                )
            ) {
                errors.leaves =
                    'Duplicate leave dates are not allowed.';

                break;
            }

            seenLeaves.add(
                leave.date,
            );
        }
    }

    /* ========================================================
       GENERATED PATTERNS
    ======================================================== */

    if (
        data.startDate &&
        data.endDate &&
        data.shiftPatternId
    ) {

        if (
            data.generatedPatterns.length === 0
        ) {

            errors.generatedPatterns =
                'Generated dates could not be created.';

        } else {

            const missingPattern =
                data.generatedPatterns.some(
                    item =>
                        !item.patternId ||
                        Number(
                            item.patternId,
                        ) <= 0,
                );

            if (
                missingPattern
            ) {

                errors.generatedPatterns =
                    'Every generated date must have a shift pattern.';
            }
        }
    }

    return {

        isValid:
            Object.keys(
                errors,
            ).length === 0,

        errors,
    };
};

/* ============================================================
   LEAVE DATE VALIDATION
============================================================ */

export const validateLeaveDate = (
    date: string,
    startDate: string,
    endDate: string,
    existingLeaves: LeaveRecord[],
): {
    isValid: boolean;
    error?: string;
} => {

    if (
        !date ||
        date.trim() === ''
    ) {

        return {
            isValid: false,
            error: 'Date is required.',
        };
    }

    if (
        !isValidDate(
            date,
        )
    ) {

        return {
            isValid: false,
            error: 'Please enter a valid date.',
        };
    }

    if (
        startDate &&
        endDate
    ) {

        if (
            !isDateInRange(
                date,
                startDate,
                endDate,
            )
        ) {

            return {
                isValid: false,
                error:
                    'Leave date must be within the assignment date range.',
            };
        }
    }

    if (
        isDuplicateLeave(
            existingLeaves,
            date,
        )
    ) {

        return {
            isValid: false,
            error:
                'This date has already been added.',
        };
    }

    return {
        isValid: true,
    };
};