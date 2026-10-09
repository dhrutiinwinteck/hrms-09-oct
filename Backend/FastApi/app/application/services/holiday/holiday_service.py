from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.application.dtos.holiday.holiday_dto import (
    HolidayCreate,
    HolidayUpdate,
)

from app.infrastructure.models.holiday.holiday import (
    HolidayModel,
)


class HolidayService:

    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        # orderby s.Holiday_Date ascending
        return (
            self.db.query(HolidayModel)
            .order_by(HolidayModel.holiday_date.asc())
            .all()
        )

    def get_by_id(self, holiday_id: int):
        h = (
            self.db.query(HolidayModel)
            .filter(HolidayModel.id == holiday_id)
            .first()
        )

        if not h:
            raise HTTPException(
                status_code=404,
                detail="Holiday not found",
            )

        return h

    def create(self, data: HolidayCreate):
        # REPLICATING C# LOGIC: Check if date already exists
        # int cnt = (from s in db.Holiday where s.Holiday_Date == sa.Holiday_Date select s).Count();

        exists = (
            self.db.query(HolidayModel)
            .filter(
                HolidayModel.holiday_date == data.holiday_date
            )
            .first()
        )

        if exists:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"We have already mentioned Holiday at "
                    f"{data.holiday_date.strftime('%d %b %Y')}"
                ),
            )

        new_h = HolidayModel(
            holiday_name=data.holiday_name,
            holiday_date=data.holiday_date,
            createdby=data.createdby,
            status=1,
        )

        self.db.add(new_h)
        self.db.commit()
        self.db.refresh(new_h)

        return new_h

    def update(
        self,
        holiday_id: int,
        data: HolidayUpdate,
    ):
        h = self.get_by_id(holiday_id)

        # Check for date duplicates if date is being changed
        if (
            data.holiday_date
            and data.holiday_date != h.holiday_date
        ):
            exists = (
                self.db.query(HolidayModel)
                .filter(
                    HolidayModel.holiday_date
                    == data.holiday_date
                )
                .first()
            )

            if exists:
                raise HTTPException(
                    status_code=400,
                    detail="Another holiday exists on this date",
                )

        for key, val in data.dict(
            exclude_unset=True
        ).items():
            setattr(h, key, val)

        self.db.commit()
        self.db.refresh(h)

        return h

    def delete(self, holiday_id: int):
        h = self.get_by_id(holiday_id)

        self.db.delete(h)
        self.db.commit()

        return {
            "message":
                "Holiday deleted successfully"
        }