from __future__ import annotations

from datetime import date
from typing import Any, Dict, List, Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.interfaces.shifts.shift_assignment_interface import (
    IShiftAssignmentRepository,
)


class ShiftAssignmentRepository(
    IShiftAssignmentRepository
):

    def __init__(
        self,
        session: Session,
    ) -> None:
        self._session = session

    def employee_exists(
        self,
        employee_id: int,
    ) -> bool:

        result = self._session.execute(
            text(
                """
                SELECT 1
                FROM public.employee_detail
                WHERE id = :employee_id
                LIMIT 1
                """
            ),
            {
                "employee_id": employee_id,
            },
        )

        return (
            result.scalar_one_or_none()
            is not None
        )

    def get_active_employees(
        self,
    ) -> List[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    id,
                    first_name,
                    last_name,
                    emp_code,
                    email,
                    phone,
                    designation
                FROM public.employee_detail
                ORDER BY
                    first_name,
                    last_name,
                    id
                """
            )
        )

        return [
            dict(row._mapping)
            for row in result.fetchall()
        ]

    def get_shift_patterns(
        self,
    ) -> List[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    patternid,
                    patternname,
                    starttime,
                    endtime
                FROM public.shiftpattern
                ORDER BY
                    patternname NULLS LAST,
                    patternid
                """
            )
        )

        return [
            dict(row._mapping)
            for row in result.fetchall()
        ]

    def shift_pattern_exists(
        self,
        pattern_id: int,
    ) -> bool:

        result = self._session.execute(
            text(
                """
                SELECT 1
                FROM public.shiftpattern
                WHERE patternid = :pattern_id
                LIMIT 1
                """
            ),
            {
                "pattern_id": pattern_id,
            },
        )

        return (
            result.scalar_one_or_none()
            is not None
        )

    def create_assignment(
        self,
        employee_id: int,
        start_date: date,
        end_date: date,
        week_off_days: Optional[str],
        leave_days: Optional[str],
        created_by: Optional[str],
    ) -> int:

        result = self._session.execute(
            text(
                """
                INSERT INTO public.employeeshift
                (
                    empid,
                    startdate,
                    enddate,
                    weekoffdays,
                    leavedays
                )
                VALUES
                (
                    :employee_id,
                    :start_date,
                    :end_date,
                    :week_off_days,
                    :leave_days
                )
                RETURNING empshiftid
                """
            ),
            {
                "employee_id": employee_id,
                "start_date": start_date,
                "end_date": end_date,
                "week_off_days": week_off_days,
                "leave_days": leave_days,
            },
        )

        assignment_id = result.scalar_one()

        return int(
            assignment_id
        )

    def create_assignment_dates(
        self,
        emp_shift_id: int,
        employee_id: int,
        generated_dates: List[Dict[str, Any]],
    ) -> None:

        if not generated_dates:
            return

        statement = text(
            """
            INSERT INTO public.employeeshiftdates
            (
                empshiftid,
                empid,
                patternid,
                dates,
                dayofweek,
                isweekoff,
                isleave
            )
            VALUES
            (
                :emp_shift_id,
                :employee_id,
                :pattern_id,
                :shift_date,
                :day_of_week,
                :is_week_off,
                :is_leave
            )
            """
        )

        parameters = [
            {
                "emp_shift_id": emp_shift_id,
                "employee_id": employee_id,
                "pattern_id": item["pattern_id"],
                "shift_date": item["shift_date"],
                "day_of_week": item["day_of_week"],
                "is_week_off": item["is_week_off"],
                "is_leave": item["is_leave"],
            }
            for item in generated_dates
        ]

        self._session.execute(
            statement,
            parameters,
        )

    def get_assignment(
        self,
        assignment_id: int,
    ) -> Optional[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    es.empshiftid,
                    es.empid,
                    es.startdate,
                    es.enddate,
                    es.weekoffdays,
                    es.leavedays,

                    COALESCE(
                        NULLIF(
                            TRIM(
                                CONCAT(
                                    COALESCE(
                                        e.first_name,
                                        ''
                                    ),
                                    ' ',
                                    COALESCE(
                                        e.last_name,
                                        ''
                                    )
                                )
                            ),
                            ''
                        ),
                        'Unknown'
                    ) AS employee_name,

                    e.emp_code

                FROM public.employeeshift es

                INNER JOIN public.employee_detail e
                    ON e.id = es.empid

                WHERE es.empshiftid = :assignment_id

                LIMIT 1
                """
            ),
            {
                "assignment_id": assignment_id,
            },
        )

        row = result.fetchone()

        if row is None:
            return None

        return dict(
            row._mapping
        )

    def get_assignment_dates(
        self,
        assignment_id: int,
    ) -> List[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    esd.empshiftid,
                    esd.empid,
                    esd.patternid,
                    esd.dates,
                    esd.dayofweek,
                    esd.isweekoff,
                    esd.isleave,

                    sp.patternname,
                    sp.starttime,
                    sp.endtime

                FROM public.employeeshiftdates esd

                LEFT JOIN public.shiftpattern sp
                    ON sp.patternid = esd.patternid

                WHERE esd.empshiftid = :assignment_id

                ORDER BY esd.dates
                """
            ),
            {
                "assignment_id": assignment_id,
            },
        )

        return [
            dict(row._mapping)
            for row in result.fetchall()
        ]

    def get_assignment_date(
        self,
        assignment_id: int,
        shift_date: date,
    ) -> Optional[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    esd.empshiftid,
                    esd.empid,
                    esd.patternid,
                    esd.dates,
                    esd.dayofweek,
                    esd.isweekoff,
                    esd.isleave
                FROM public.employeeshiftdates esd
                WHERE esd.empshiftid = :assignment_id
                  AND DATE(esd.dates) = :shift_date
                LIMIT 1
                """
            ),
            {
                "assignment_id": assignment_id,
                "shift_date": shift_date,
            },
        )

        row = result.fetchone()

        if row is None:
            return None

        return dict(
            row._mapping
        )

    def update_assignment_date(
        self,
        assignment_id: int,
        shift_date: date,
        pattern_id: Optional[int],
        is_week_off: Optional[bool],
        is_leave: Optional[bool],
    ) -> bool:

        set_clauses: List[str] = []

        parameters: Dict[str, Any] = {
            "assignment_id": assignment_id,
            "shift_date": shift_date,
        }

        if pattern_id is not None:
            set_clauses.append(
                "patternid = :pattern_id"
            )

            parameters[
                "pattern_id"
            ] = pattern_id

        if is_week_off is not None:
            set_clauses.append(
                "isweekoff = :is_week_off"
            )

            parameters[
                "is_week_off"
            ] = is_week_off

        if is_leave is not None:
            set_clauses.append(
                "isleave = :is_leave"
            )

            parameters[
                "is_leave"
            ] = is_leave

        if not set_clauses:
            return True

        statement = text(
            f"""
            UPDATE public.employeeshiftdates
            SET
                {", ".join(set_clauses)}
            WHERE empshiftid = :assignment_id
              AND DATE(dates) = :shift_date
            """
        )

        result = self._session.execute(
            statement,
            parameters,
        )

        return result.rowcount > 0

    def get_all_assignments(
        self,
    ) -> List[Dict[str, Any]]:

        result = self._session.execute(
            text(
                """
                SELECT
                    es.empshiftid,
                    es.empid,
                    es.startdate,
                    es.enddate,
                    es.weekoffdays,
                    es.leavedays,

                    COALESCE(
                        NULLIF(
                            TRIM(
                                CONCAT(
                                    COALESCE(
                                        e.first_name,
                                        ''
                                    ),
                                    ' ',
                                    COALESCE(
                                        e.last_name,
                                        ''
                                    )
                                )
                            ),
                            ''
                        ),
                        'Unknown'
                    ) AS employee_name,

                    e.emp_code,

                    COALESCE(
                        STRING_AGG(
                            DISTINCT sp.patternname,
                            ', '
                            ORDER BY sp.patternname
                        ),
                        ''
                    ) AS shift_pattern_names

                FROM public.employeeshift es

                INNER JOIN public.employee_detail e
                    ON e.id = es.empid

                LEFT JOIN public.employeeshiftdates esd
                    ON esd.empshiftid =
                       es.empshiftid

                LEFT JOIN public.shiftpattern sp
                    ON sp.patternid =
                       esd.patternid

                GROUP BY
                    es.empshiftid,
                    es.empid,
                    es.startdate,
                    es.enddate,
                    es.weekoffdays,
                    es.leavedays,
                    e.first_name,
                    e.last_name,
                    e.emp_code

                ORDER BY
                    es.empshiftid DESC
                """
            )
        )

        return [
            dict(row._mapping)
            for row in result.fetchall()
        ]

    def update_assignment(
        self,
        assignment_id: int,
        employee_id: int,
        start_date: date,
        end_date: date,
        week_off_days: Optional[str],
        leave_days: Optional[str],
        modified_by: Optional[str],
    ) -> None:

        self._session.execute(
            text(
                """
                UPDATE public.employeeshift
                SET
                    empid = :employee_id,
                    startdate = :start_date,
                    enddate = :end_date,
                    weekoffdays = :week_off_days,
                    leavedays = :leave_days
                WHERE empshiftid = :assignment_id
                """
            ),
            {
                "assignment_id": assignment_id,
                "employee_id": employee_id,
                "start_date": start_date,
                "end_date": end_date,
                "week_off_days": week_off_days,
                "leave_days": leave_days,
            },
        )

    def delete_assignment_dates(
        self,
        assignment_id: int,
    ) -> None:

        self._session.execute(
            text(
                """
                DELETE FROM public.employeeshiftdates
                WHERE empshiftid = :assignment_id
                """
            ),
            {
                "assignment_id": assignment_id,
            },
        )

    def delete_assignment(
        self,
        assignment_id: int,
    ) -> bool:

        result = self._session.execute(
            text(
                """
                DELETE FROM public.employeeshift
                WHERE empshiftid = :assignment_id
                """
            ),
            {
                "assignment_id": assignment_id,
            },
        )

        return result.rowcount > 0