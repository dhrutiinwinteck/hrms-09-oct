import {
    Employee,
    ShiftPattern,
    ShiftAssignmentFormData,
    ShiftAssignment,
} from '../types/shiftAssignment.types';

import {
    validateShiftAssignment,
} from '../validations/shiftAssignment.schema';

import axiosInstance from '../../../../services/axios/axiosInstance';

import {
    isAxiosError,
} from 'axios';

/* ============================================================
   ENDPOINTS
============================================================ */

const EMPLOYEES_ENDPOINT =
    '/api/v1/shift-assignments/employees';

const PATTERNS_ENDPOINT =
    '/api/v1/shift-assignments/patterns';

const ASSIGNMENTS_ENDPOINT =
    '/api/v1/shift-assignments';

/* ============================================================
   API TYPES
============================================================ */

interface ApiEmployee {
    id?: number;
    employee_id?: number;
    empid?: number;

    name?: string;
    employee_name?: string;

    first_name?: string;
    last_name?: string;

    email?: string;

    department?: string;
    department_name?: string;

    emp_code?: string;
}

interface ApiShiftPattern {
    id?: number;
    pattern_id?: number;
    patternid?: number;

    name?: string;
    pattern_name?: string;
    patternname?: string;

    start_time?: string;
    starttime?: string;

    end_time?: string;
    endtime?: string;

    description?: string;
}

/* ============================================================
   ERROR RESPONSE
============================================================ */

interface ApiErrorResponse {
    detail?: string;

    message?: string;
}

/* ============================================================
   SERVICE INTERFACE
============================================================ */

export interface IShiftAssignmentService {

    getEmployees():
        Promise<Employee[]>;

    getShiftPatterns():
        Promise<ShiftPattern[]>;

    assignShift(
        data:
            ShiftAssignmentFormData,
    ):
        Promise<ShiftAssignment[]>;
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

const getErrorMessage = (
    error: unknown,
): string => {

    if (
        isAxiosError(
            error,
        )
    ) {

        const data =
            error.response?.data as
                | ApiErrorResponse
                | undefined;

        if (
            data?.detail
        ) {

            return data.detail;
        }

        if (
            data?.message
        ) {

            return data.message;
        }

        if (
            error.response?.status ===
            400
        ) {

            return 'Invalid shift assignment data.';
        }

        if (
            error.response?.status ===
            401
        ) {

            return 'You are not authorized. Please login again.';
        }

        if (
            error.response?.status ===
            404
        ) {

            return 'Shift assignment API endpoint was not found.';
        }

        if (
            error.response?.status ===
            409
        ) {

            return (
                data?.detail ||
                'Shift assignment conflict.'
            );
        }

        if (
            error.response?.status ===
            500
        ) {

            return 'Internal server error. Please try again.';
        }

        return (
            error.message ||
            'Request failed.'
        );
    }

    if (
        error instanceof Error
    ) {

        return error.message;
    }

    return 'Something went wrong.';
};

/* ============================================================
   EMPLOYEE MAPPER
============================================================ */

const mapEmployee = (
    item: ApiEmployee,
): Employee => {

    const firstName =
        item.first_name ||
        '';

    const lastName =
        item.last_name ||
        '';

    const combinedName =
        `${firstName} ${lastName}`
            .trim();

    return {

        id:
            String(
                item.id ??
                item.employee_id ??
                item.empid ??
                '',
            ),

        name:
            item.employee_name ||
            item.name ||
            combinedName ||
            'Unknown Employee',

        email:
            item.email ||
            '',

        department:
            item.department_name ||
            item.department ||
            '',
    };
};

/* ============================================================
   PATTERN MAPPER
============================================================ */

const mapShiftPattern = (
    item: ApiShiftPattern,
): ShiftPattern => {

    return {

        id:
            String(
                item.pattern_id ??
                item.patternid ??
                item.id ??
                '',
            ),

        name:
            item.pattern_name ||
            item.patternname ||
            item.name ||
            'Unnamed Shift Pattern',

        startTime:
            item.start_time ||
            item.starttime ||
            '',

        endTime:
            item.end_time ||
            item.endtime ||
            '',

        description:
            item.description,
    };
};

/* ============================================================
   PAYLOAD
============================================================ */

const buildPayload = (
    formData:
        ShiftAssignmentFormData,
) => {

    /* --------------------------------------------------------
       EMPLOYEES
    -------------------------------------------------------- */

    const employeeIds =
        formData.employeeId
            .split(',')
            .map(
                value =>
                    Number(
                        value.trim(),
                    ),
            )
            .filter(
                value =>
                    Number.isInteger(
                        value,
                    ) &&
                    value > 0,
            );

    /* --------------------------------------------------------
       WEEK OFF DAYS
    -------------------------------------------------------- */

    const weekOffDays: string[] =
        [];

    const weekDayMap: Record<
        string,
        string
    > = {

        sun:
            'Sunday',

        mon:
            'Monday',

        tue:
            'Tuesday',

        wed:
            'Wednesday',

        thu:
            'Thursday',

        fri:
            'Friday',

        sat:
            'Saturday',
    };

    Object.entries(
        formData.weekOffDays,
    ).forEach(
        ([
            key,
            selected,
        ]) => {

            if (
                selected
            ) {

                const day =
                    weekDayMap[key];

                if (
                    day
                ) {

                    weekOffDays.push(
                        day,
                    );
                }
            }
        },
    );

    /* --------------------------------------------------------
       LEAVE DAYS
    -------------------------------------------------------- */

    const leaveDays =
        formData.leaves.map(
            leave => ({

                date:
                    leave.date,

                day_of_week:
                    leave.dayOfWeek,

                leave_type:
                    leave.leaveType,
            }),
        );

    /* --------------------------------------------------------
       GENERATED PATTERNS
    -------------------------------------------------------- */

    const generatedPatterns =
        formData.generatedPatterns.map(
            generated => ({

                shift_date:
                    generated.shiftDate,

                pattern_id:
                    Number(
                        generated.patternId,
                    ),

                is_week_off:
                    Boolean(
                        generated.isWeekOff,
                    ),

                is_leave:
                    Boolean(
                        generated.isLeave,
                    ),
            }),
        );

    return {

        employee_ids:
            employeeIds,

        start_date:
            formData.startDate,

        end_date:
            formData.endDate,

        week_off_days:
            weekOffDays,

        leave_days:
            leaveDays,

        generated_patterns:
            generatedPatterns,
    };
};

/* ============================================================
   SERVICE
============================================================ */

class ShiftAssignmentService
    implements IShiftAssignmentService {

    /* ========================================================
       GET EMPLOYEES
    ======================================================== */

    async getEmployees():
        Promise<Employee[]> {

        try {

            const response =
                await axiosInstance.get<
                    ApiEmployee[]
                >(
                    EMPLOYEES_ENDPOINT,
                );

            return (
                response.data ||
                []
            ).map(
                mapEmployee,
            );

        } catch (
            error: unknown
        ) {

            console.error(
                'Failed to load employees:',
                error,
            );

            throw new Error(
                getErrorMessage(
                    error,
                ),
            );
        }
    }

    /* ========================================================
       GET SHIFT PATTERNS
    ======================================================== */

    async getShiftPatterns():
        Promise<ShiftPattern[]> {

        try {

            const response =
                await axiosInstance.get<
                    ApiShiftPattern[]
                >(
                    PATTERNS_ENDPOINT,
                );

            return (
                response.data ||
                []
            ).map(
                mapShiftPattern,
            );

        } catch (
            error: unknown
        ) {

            console.error(
                'Failed to load shift patterns:',
                error,
            );

            throw new Error(
                getErrorMessage(
                    error,
                ),
            );
        }
    }

    /* ========================================================
       CREATE SHIFT ASSIGNMENT
    ======================================================== */

    async assignShift(
        formData:
            ShiftAssignmentFormData,
    ):
        Promise<ShiftAssignment[]> {

        /* ----------------------------------------------------
           FRONTEND VALIDATION
        ---------------------------------------------------- */

        const validation =
            validateShiftAssignment(
                formData,
            );

        if (
            !validation.isValid
        ) {

            throw new Error(
                'Validation failed: ' +
                JSON.stringify(
                    validation.errors,
                ),
            );
        }

        /* ----------------------------------------------------
           BUILD BACKEND PAYLOAD
        ---------------------------------------------------- */

        const payload =
            buildPayload(
                formData,
            );

        console.log(
            '[Shift Assignment] POST:',
            ASSIGNMENTS_ENDPOINT,
        );

        console.log(
            '[Shift Assignment] Payload:',
            payload,
        );

        /* ----------------------------------------------------
           API REQUEST
        ---------------------------------------------------- */

        try {

            const response =
                await axiosInstance.post<
                    ShiftAssignment[]
                >(
                    ASSIGNMENTS_ENDPOINT,
                    payload,
                );

            console.log(
                '[Shift Assignment] Success:',
                response.data,
            );

            return (
                response.data ||
                []
            );

        } catch (
            error: unknown
        ) {

            console.error(
                '[Shift Assignment] API Error:',
                error,
            );

            throw new Error(
                getErrorMessage(
                    error,
                ),
            );
        }
    }
}

/* ============================================================
   SINGLE SERVICE INSTANCE

   THIS IS THE IMPORTANT EXPORT
============================================================ */

export const shiftAssignmentService =
    new ShiftAssignmentService();

/* ============================================================
   OPTIONAL DEFAULT EXPORT

   This makes both import styles work:

   import { shiftAssignmentService } from '...';

   AND

   import shiftAssignmentService from '...';
============================================================ */

export default shiftAssignmentService;