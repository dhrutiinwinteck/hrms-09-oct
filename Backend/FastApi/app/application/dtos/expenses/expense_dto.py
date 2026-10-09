from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Optional

from fastapi import Form
from pydantic import BaseModel, ConfigDict, Field, model_validator


class ExpenseCategoryCreate(BaseModel):
    category_name: Annotated[str, Field(min_length=2, max_length=150)]


class ExpenseCategoryUpdate(BaseModel):
    category_name: Annotated[str, Field(min_length=2, max_length=150)]


class ExpenseCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category_name: str
    status: int


class ExpenseSubCategoryCreate(BaseModel):
    category_id: int = Field(gt=0)
    sub_category_name: Annotated[str, Field(min_length=2, max_length=150)]


class ExpenseSubCategoryUpdate(BaseModel):
    category_id: int = Field(gt=0)
    sub_category_name: Annotated[str, Field(min_length=2, max_length=150)]


class ExpenseSubCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category_id: int
    sub_category_name: str
    status: int


class ExpenseCreateForm(BaseModel):
    type: int = Field(default=0, ge=0)
    description: Annotated[str, Field(min_length=2, max_length=4000)]
    category_id: int = Field(gt=0)
    sub_category_id: int | None = Field(default=None, gt=0)
    amount: Decimal = Field(gt=0, max_digits=18, decimal_places=2)
    expense_from: date
    expense_to: date
    on_site_location: str | None = Field(default=None, max_length=250)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.expense_to < self.expense_from:
            raise ValueError("expense_to cannot be earlier than expense_from")
        return self

    @classmethod
    def as_form(
        cls,
        type: int = Form(0),
        description: str = Form(...),
        category_id: int = Form(...),
        sub_category_id: int | None = Form(None),
        amount: Decimal = Form(...),
        expense_from: date = Form(...),
        expense_to: date = Form(...),
        on_site_location: str | None = Form(None),
    ) -> "ExpenseCreateForm":
        return cls(
            type=type,
            description=description,
            category_id=category_id,
            sub_category_id=sub_category_id,
            amount=amount,
            expense_from=expense_from,
            expense_to=expense_to,
            on_site_location=on_site_location,
        )


class ExpenseStatusUpdate(BaseModel):
    status: int = Field(ge=10, le=12)
    reason: str | None = Field(default=None, max_length=4000)


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | None = None

    type: int | None = None

    description: str | None = None

    category_id: int | None = None

    sub_category_id: int | None = None

    amount: Decimal | None = None

    expense_from: date | None = None

    expense_to: date | None = None

    bill: str | None = None

    bill1: str | None = None

    bill2: str | None = None

    bill3: str | None = None

    bill4: str | None = None

    on_site_location: str | None = None

    status_hr: int | None = None

    status_promoter: int | None = None

    reject_reason_hr: str | None = None

    reject_reason_promoter: str | None = None

    created_by: str | None = None

    created_on: datetime | None = None

    modified_by: str | None = None

    modified_on: datetime | None = None

    category_name: str | None = None

    sub_category_name: str | None = None