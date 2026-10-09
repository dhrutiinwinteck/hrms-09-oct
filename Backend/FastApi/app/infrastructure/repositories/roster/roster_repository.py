from __future__ import annotations

from datetime import date
from typing import Any, Dict, List

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.domain.interfaces.roster.roster_interface import (
    IRosterRepository,
)


class RosterRepository(IRosterRepository):
    """
    PostgreSQL repository for the read-only weekly roster.

    The roster is NOT stored in a separate table.

    Source tables:

        employee_detail
        employeeshiftdates
        shiftpattern

    The employeeshiftdates table is the primary source for
    date-wise employee roster state.

    No INSERT / UPDATE / DELETE operations are performed here.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    # ============================================================
    # WEEKLY ROSTER
    # ============================================================

    def get_weekly_roster(
        self,
        week_start: date,
        week_end: date,
    ) -> List[Dict[str, Any]]:
        """
        Get the complete roster for a Monday-Sunday week.

        Returns one record for each employee/date combination
        that exists in employeeshiftdates.

        Only active employees are included.

        Actual PostgreSQL tables/columns:

            employee_detail
                id
                emp_code
                first_name
                last_name
                is_remove

            employeeshiftdates
                shiftdateid
                empid
                patternid
                dates
                dayofweek
                isweekoff
                isleave

            shiftpattern
                patternid
                patternname
                starttime
                endtime
        """

        result = self._session.execute(
            text(
                """
                SELECT
                    e.id AS employee_id,

                    e.emp_code AS employee_code,

                    TRIM(
                        COALESCE(e.first_name, '')
                        || ' '
                        || COALESCE(e.last_name, '')
                    ) AS employee_name,

                    sd.shiftdateid AS shift_date_id,

                    sd.dates::date AS roster_date,

                    COALESCE(
                        sd.dayofweek,
                        TRIM(
                            TO_CHAR(
                                sd.dates,
                                'Day'
                            )
                        )
                    ) AS day_of_week,

                    sd.patternid AS pattern_id,

                    sp.patternname AS pattern_name,

                    sp.starttime AS start_time,

                    sp.endtime AS end_time,

                    COALESCE(
                        sd.isweekoff,
                        FALSE
                    ) AS is_week_off,

                    COALESCE(
                        sd.isleave,
                        FALSE
                    ) AS is_leave

                FROM public.employee_detail e

                INNER JOIN public.employeeshiftdates sd
                    ON sd.empid = e.id

                LEFT JOIN public.shiftpattern sp
                    ON sp.patternid = sd.patternid

                WHERE
                    COALESCE(e.is_remove, 0) = 0

                    AND sd.dates::date
                        BETWEEN :week_start
                        AND :week_end

                ORDER BY
                    e.first_name ASC,
                    e.last_name ASC,
                    sd.dates ASC,
                    sd.shiftdateid ASC
                """
            ),
            {
                "week_start": week_start,
                "week_end": week_end,
            },
        ).mappings().all()

        return [dict(row) for row in result]