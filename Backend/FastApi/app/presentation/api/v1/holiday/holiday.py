from fastapi import APIRouter, Depends, status

from sqlalchemy.orm import Session

from typing import List

from app.presentation.dependencies.database import get_transactional_db

from app.application.services.holiday.holiday_service import HolidayService

from app.application.dtos.holiday.holiday_dto import (
    HolidayCreate,
    HolidayUpdate,
    HolidayResponse,
)


router = APIRouter()


@router.get("/", response_model=List[HolidayResponse])
def get_all_holidays(
    db: Session = Depends(get_transactional_db),
):
    return HolidayService(db).get_all()


@router.get("/{id}", response_model=HolidayResponse)
def get_holiday_by_id(
    id: int,
    db: Session = Depends(get_transactional_db),
):
    return HolidayService(db).get_by_id(id)


@router.post(
    "/",
    response_model=HolidayResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_holiday(
    data: HolidayCreate,
    db: Session = Depends(get_transactional_db),
):
    return HolidayService(db).create(data)


@router.put("/{id}", response_model=HolidayResponse)
def update_holiday(
    id: int,
    data: HolidayUpdate,
    db: Session = Depends(get_transactional_db),
):
    return HolidayService(db).update(id, data)


@router.delete("/{id}")
def delete_holiday(
    id: int,
    db: Session = Depends(get_transactional_db),
):
    return HolidayService(db).delete(id)