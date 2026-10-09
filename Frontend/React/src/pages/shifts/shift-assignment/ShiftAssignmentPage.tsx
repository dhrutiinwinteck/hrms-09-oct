// src/pages/shifts/shift-assignment/ShiftAssignmentPage.tsx

import React, {
    useEffect,
} from 'react';

import ShiftAssignmentHeader
    from './components/ShiftAssignmentHeader/ShiftAssignmentHeader';

import EmployeeDurationSection
    from './components/EmployeeDurationSection/EmployeeDurationSection';

import ShiftPatternSection
    from './components/ShiftPatternSection/ShiftPatternSection';

import LeaveSection
    from './components/LeaveSection/LeaveSection';

import WeekOffDays
    from './components/WeekOffDays/WeekOffDays';

import GeneratedDates
    from './components/GeneratedDates/GeneratedDates';

import AssignmentActions
    from './components/AssignmentActions/AssignmentActions';

import {
    useShiftAssignment,
} from './hooks/useShiftAssignment';

import './ShiftAssignmentPage.css';

const ShiftAssignmentPage:
    React.FC =
    () => {

    const {

        employees,

        shiftPatterns,

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

        setStartDate,

        setEndDate,

        setSelectedShiftPattern,

        setLeaveDate,

        setSelectedLeaveType,

        addLeave,

        removeLeave,

        toggleWeekOffDay,

        clearWeekOffDays,

        setGeneratedDatePattern,

        setGeneratedDateWeekOff,

        resetForm,

        handleSubmit,

        clearSubmitState,

    } = useShiftAssignment();

    /* ========================================================
       CLEAR SUBMIT STATE
    ======================================================== */

    useEffect(() => {

        if (
            submitSuccess ||
            submitError
        ) {

            const timer =
                setTimeout(
                    () => {

                        clearSubmitState();

                    },
                    5000,
                );

            return () =>
                clearTimeout(
                    timer,
                );
        }

    }, [
        submitSuccess,
        submitError,
        clearSubmitState,
    ]);

    /* ========================================================
       BREADCRUMB
    ======================================================== */

    const breadcrumbItems = [

        {
            label:
                'Dashboard',

            path:
                '/dashboard',
        },

        {
            label:
                'Shift Assignment',

            path:
                '/shifts/shift-assignment',
        },

        {
            label:
                'Assign to Employee',

            isActive:
                true,
        },
    ];

    /* ========================================================
       RESET
    ======================================================== */

    const handleReset =
        () => {

            resetForm();

            clearSubmitState();
        };

    /* ========================================================
       RENDER
    ======================================================== */

    return (

        <div className="sa-page">

            <ShiftAssignmentHeader
                title="Assign Shift to Employee"
                subtitle="Assign a shift pattern to a selected employee for a specific date range."
                breadcrumbItems={
                    breadcrumbItems
                }
            />

            {isLoading ? (

                <div className="sa-page__loading">
                    Loading...
                </div>

            ) : (

                <>

                    {/* =========================================
                        1. EMPLOYEE & DURATION
                    ========================================= */}

                    <EmployeeDurationSection
                        employees={
                            employees
                        }

                        selectedEmployeeId={
                            selectedEmployeeId
                        }

                        onEmployeeChange={
                            setSelectedEmployee
                        }

                        startDate={
                            startDate
                        }

                        onStartDateChange={
                            setStartDate
                        }

                        endDate={
                            endDate
                        }

                        onEndDateChange={
                            setEndDate
                        }

                        errors={{
                            employeeId:
                                errors.employeeId,

                            startDate:
                                errors.startDate,

                            endDate:
                                errors.endDate,
                        }}

                        disabled={
                            isSubmitting
                        }
                    />

                    {/* =========================================
                        2. SHIFT & PATTERN
                    ========================================= */}

                    <ShiftPatternSection
                        patterns={
                            shiftPatterns
                        }

                        selectedPatternId={
                            selectedShiftPatternId
                        }

                        onPatternChange={
                            setSelectedShiftPattern
                        }

                        error={
                            errors.shiftPatternId
                        }

                        disabled={
                            isSubmitting
                        }
                    />

                    {/* =========================================
                        3. LEAVE
                    ========================================= */}

                    <LeaveSection
                        leaveDate={
                            leaveDate
                        }

                        onLeaveDateChange={
                            setLeaveDate
                        }

                        leaveDayOfWeek={
                            leaveDayOfWeek
                        }

                        selectedLeaveType={
                            selectedLeaveType
                        }

                        onLeaveTypeChange={
                            setSelectedLeaveType
                        }

                        leaves={
                            leaves
                        }

                        onAddLeave={
                            addLeave
                        }

                        onRemoveLeave={
                            removeLeave
                        }

                        addLeaveError={
                            errors.leaves
                        }

                        disabled={
                            isSubmitting
                        }
                    />

                    {/* =========================================
                        4. WEEK OFF
                    ========================================= */}

                    <WeekOffDays
                        selectedDays={
                            weekOffDays
                        }

                        onToggleDay={
                            toggleWeekOffDay
                        }

                        onClearAll={
                            clearWeekOffDays
                        }

                        disabled={
                            isSubmitting
                        }
                    />

                    {/* =========================================
                        5. GENERATED DATES
                    ========================================= */}

                    <GeneratedDates
                        dates={
                            generatedDates
                        }

                        patterns={
                            shiftPatterns
                        }

                        onPatternChange={
                            setGeneratedDatePattern
                        }

                        onWeekOffChange={
                            setGeneratedDateWeekOff
                        }

                        disabled={
                            isSubmitting
                        }
                    />

                    {errors.generatedPatterns && (

                        <div className="sa-page__submit-error">

                            {
                                errors.generatedPatterns
                            }

                        </div>

                    )}

                    {/* =========================================
                        SUBMIT ERROR
                    ========================================= */}

                    {submitError && (

                        <div className="sa-page__submit-error">

                            {
                                submitError
                            }

                        </div>

                    )}

                    {/* =========================================
                        SUCCESS
                    ========================================= */}

                    {submitSuccess && (

                        <div className="sa-page__submit-success">

                            ✓ Shift assigned successfully!

                        </div>

                    )}

                    {/* =========================================
                        ACTIONS
                    ========================================= */}

                    <AssignmentActions
                        onSubmit={
                            handleSubmit
                        }

                        onReset={
                            handleReset
                        }

                        isSubmitting={
                            isSubmitting
                        }

                        submitLabel="Assign Shift"

                        resetLabel="Reset"

                        disabled={
                            isLoading
                        }
                    />

                </>
            )}

        </div>
    );
};

export default ShiftAssignmentPage;