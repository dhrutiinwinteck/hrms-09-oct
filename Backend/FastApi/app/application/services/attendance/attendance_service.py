import pytz

from datetime import datetime

from fastapi import HTTPException

from app.domain.interfaces.attendance.attendance_interface import (
    IAttendanceRepository
)

from app.application.dtos.attendance.attendance import (
    AttendanceUpdate
)

from app.application.dtos.attendance.attendance_location import (
    PunchLocationRequest
)

from app.application.services.attendance.location_service import (
    LocationService
)

from app.infrastructure.models.attendance.timesheet import (
    TimesheetModel
)

from app.infrastructure.models.attendance.timesheet_log import (
    TimesheetLogModel
)


IST = pytz.timezone("Asia/Kolkata")


class AttendanceService:

    def __init__(
        self,
        repo: IAttendanceRepository,
        location_service: LocationService,
    ):

        self.repo = repo

        self.location_service = location_service

    # ============================================================
    # IST CURRENT TIME
    # ============================================================

    def get_ist_now(self):

        return datetime.now(IST).replace(
            tzinfo=None
        )

    # ============================================================
    # NORMALIZE UPDATE DATETIME
    # ============================================================

    @staticmethod
    def normalize_update_datetime(
        value: datetime
    ) -> datetime:

        if value.tzinfo is not None:

            return value.replace(
                tzinfo=None
            )

        return value

    # ============================================================
    # PUNCH IN
    # ============================================================

    def punch_in(
        self,
        emp_id: int,
        location: PunchLocationRequest,
    ):

        now = self.get_ist_now()

        # ========================================================
        # CHECK ONLY OPEN SESSION
        # ========================================================

        active_today = self.repo.get_today_record(
            emp_id,
            now.date()
        )

        if active_today:

            raise HTTPException(
                status_code=400,
                detail="Already Punched In for today"
            )

        # ========================================================
        # PROCESS PUNCH-IN LOCATION
        # ========================================================

        location_data = (
            self.location_service.process_location(
                latitude=location.latitude,
                longitude=location.longitude,
                accuracy=location.accuracy,
            )
        )

        # ========================================================
        # CREATE NEW ATTENDANCE SESSION
        # ========================================================

        new_ts = TimesheetModel(

            emp_id=emp_id,

            date=now.date(),

            punch_in=now,

            punch_out=None,

            working_hrs=0.0,

            total_break=0.0,

            punch_in_latitude=(
                location_data["latitude"]
            ),

            punch_in_longitude=(
                location_data["longitude"]
            ),

            punch_in_accuracy=(
                location_data["accuracy"]
            ),

            punch_in_address=(
                location_data["address"]
            ),

        )

        # ========================================================
        # SAVE TIMESHEET
        # ========================================================

        self.repo.add_timesheet(
            new_ts
        )

        # ========================================================
        # SAVE PUNCH-IN LOG
        # ========================================================

        self.repo.add_log(
            TimesheetLogModel(
                emp_id=emp_id,
                activity="PI",
                log=now
            )
        )

        # ========================================================
        # COMMIT
        # ========================================================

        try:

            self.repo.commit()

        except Exception:

            self.repo.rollback()

            raise

        # ========================================================
        # RESPONSE
        # ========================================================

        return {

            "success": True,

            "message": "Punch in successful",

            "attendance": {

                "attendance_date": (
                    now.strftime("%Y-%m-%d")
                ),

                "punch_in": (
                    now.strftime("%H:%M:%S")
                ),

                "punch_in_location": {

                    "latitude": (
                        location_data["latitude"]
                    ),

                    "longitude": (
                        location_data["longitude"]
                    ),

                    "accuracy": (
                        location_data["accuracy"]
                    ),

                    "address": (
                        location_data["address"]
                    ),

                    
                }
            }
        }

    # ============================================================
    # BREAK IN
    # ============================================================

    def break_in(
        self,
        emp_id: int
    ):

        now = self.get_ist_now()

        ts = self.repo.get_active_session(
            emp_id
        )

        if not ts:

            raise HTTPException(
                status_code=404,
                detail="No active session found"
            )

        ts.last_break_in = now

        self.repo.add_log(
            TimesheetLogModel(
                emp_id=emp_id,
                activity="BI",
                log=now
            )
        )

        self.repo.commit()

        return {
            "message": "Break Started",
            "time": now
        }

    # ============================================================
    # BREAK OUT
    # ============================================================

    def break_out(
        self,
        emp_id: int
    ):

        now = self.get_ist_now()

        ts = self.repo.get_active_session(
            emp_id
        )

        if not ts or not ts.last_break_in:

            raise HTTPException(
                status_code=400,
                detail="No active break found"
            )

        duration = (
            now - ts.last_break_in
        ).total_seconds() / 60

        ts.total_break = (
            ts.total_break or 0
        ) + duration

        ts.last_break_out = now

        self.repo.add_log(
            TimesheetLogModel(
                emp_id=emp_id,
                activity="BO",
                log=now
            )
        )

        self.repo.commit()

        return {
            "message": "Break Ended",
            "total_break_mins": ts.total_break
        }

    # ============================================================
    # PUNCH OUT
    # ============================================================

    def punch_out(
        self,
        emp_id: int,
        location: PunchLocationRequest,
    ):

        now = self.get_ist_now()

        # ========================================================
        # FIND OPEN SESSION
        # ========================================================

        ts = self.repo.get_active_session(
            emp_id
        )

        if not ts:

            raise HTTPException(
                status_code=404,
                detail="No active punch-in found"
            )

        # ========================================================
        # PROCESS PUNCH-OUT LOCATION
        # ========================================================

        location_data = (
            self.location_service.process_location(
                latitude=location.latitude,
                longitude=location.longitude,
                accuracy=location.accuracy,
            )
        )

        # ========================================================
        # SAVE PUNCH-OUT TIME
        # ========================================================

        ts.punch_out = now

        # ========================================================
        # SAVE PUNCH-OUT LOCATION
        # ========================================================

        ts.punch_out_latitude = (
            location_data["latitude"]
        )

        ts.punch_out_longitude = (
            location_data["longitude"]
        )

        ts.punch_out_accuracy = (
            location_data["accuracy"]
        )

        ts.punch_out_address = (
            location_data["address"]
        )

        

        # ========================================================
        # CALCULATE WORKING HOURS
        # ========================================================

        total_duration_hrs = (
            ts.punch_out - ts.punch_in
        ).total_seconds() / 3600

        break_hrs = (
            ts.total_break or 0
        ) / 60

        ts.working_hrs = round(
            max(
                0,
                total_duration_hrs - break_hrs
            ),
            2
        )

        # ========================================================
        # SAVE PUNCH-OUT LOG
        # ========================================================

        self.repo.add_log(
            TimesheetLogModel(
                emp_id=emp_id,
                activity="PO",
                log=now
            )
        )

        # ========================================================
        # MONTHLY ACCRUAL
        # ========================================================

        if now.day == 1:

            self.repo.execute_accrual_proc()

        # ========================================================
        # COMMIT
        # ========================================================

        try:

            self.repo.commit()

        except Exception:

            self.repo.rollback()

            raise

        # ========================================================
        # RESPONSE
        # ========================================================

        return {

            "success": True,

            "message": "Punched Out Successfully",

            "attendance": {

                "attendance_date": (
                    now.strftime("%Y-%m-%d")
                ),

                "punch_out": (
                    now.strftime("%H:%M:%S")
                ),

                "working_hours": (
                    ts.working_hrs
                ),

                "punch_out_location": {

                    "latitude": (
                        location_data["latitude"]
                    ),

                    "longitude": (
                        location_data["longitude"]
                    ),

                    "accuracy": (
                        location_data["accuracy"]
                    ),

                    "address": (
                        location_data["address"]
                    ),

                   
                }
            }
        }

    # ============================================================
    # GET ALL ATTENDANCE
    # ============================================================

    def get_all_records(
        self,
        page: int = 1,
        page_size: int = 50
    ):

        records, total_records = (
            self.repo.get_all(
                page=page,
                page_size=page_size
            )
        )

        total_pages = (
            (total_records + page_size - 1)
            // page_size
        )

        return {

            "success": True,

            "data": records,

            "pagination": {

                "page": page,

                "page_size": page_size,

                "total_records":
                    total_records,

                "total_pages":
                    total_pages,

                "has_next":
                    page < total_pages,

                "has_previous":
                    page > 1
            }
        }

    # ============================================================
    # GET BY ID
    # ============================================================

    def get_record_by_id(
        self,
        attendance_id: int
    ):

        record = self.repo.get_by_id(
            attendance_id
        )

        if not record:

            raise HTTPException(
                status_code=404,
                detail="Attendance record not found"
            )

        return record

    # ============================================================
    # UPDATE
    # ============================================================

    def update_record(
        self,
        attendance_id: int,
        data: AttendanceUpdate
    ):

        record = self.get_record_by_id(
            attendance_id
        )

        # ========================================================
        # UPDATE PUNCH-IN
        # ========================================================

        if data.punch_in is not None:

            record.punch_in = (
                self.normalize_update_datetime(
                    data.punch_in
                )
            )

        # ========================================================
        # UPDATE PUNCH-OUT
        # ========================================================

        if data.punch_out is not None:

            record.punch_out = (
                self.normalize_update_datetime(
                    data.punch_out
                )
            )

        # ========================================================
        # UPDATE TOTAL BREAK
        # ========================================================

        if data.total_break is not None:

            record.total_break = (
                data.total_break
            )

        # ========================================================
        # RECALCULATE WORKING HOURS
        # ========================================================

        if (
            record.punch_in
            and record.punch_out
        ):

            duration = (
                record.punch_out
                - record.punch_in
            ).total_seconds() / 3600

            break_hrs = (
                record.total_break or 0
            ) / 60

            record.working_hrs = round(
                max(
                    0,
                    duration - break_hrs
                ),
                2
            )

        # ========================================================
        # COMMIT UPDATE TO DATABASE
        # ========================================================

        try:

            self.repo.commit()

        except Exception:

            self.repo.rollback()

            raise

        # ========================================================
        # RETURN UPDATED RECORD
        # ========================================================

        return record

    # ============================================================
    # DELETE
    # ============================================================

    def delete_record(
        self,
        attendance_id: int
    ):

        record = self.get_record_by_id(
            attendance_id
        )

        self.repo.delete_logs_by_date(
            record.emp_id,
            record.date
        )

        self.repo.delete_timesheet(
            record
        )

        self.repo.commit()

        return {
            "message":
                "Attendance record and associated logs deleted"
        }