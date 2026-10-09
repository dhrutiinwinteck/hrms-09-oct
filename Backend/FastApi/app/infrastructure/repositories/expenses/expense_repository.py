from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.interfaces.expenses.expense_interface import IExpenseRepository
from app.infrastructure.models.expenses.expense import ExpenseCategoryModel, ExpenseModel, ExpenseSubCategoryModel


class ExpenseRepository(IExpenseRepository):
    def __init__(self, db: Session):
        self._db = db

    def list_categories(self, active_only: bool = False):
        stmt = select(ExpenseCategoryModel).order_by(ExpenseCategoryModel.category_name)
        if active_only:
            stmt = stmt.where(ExpenseCategoryModel.status == 1)
        return self._db.scalars(stmt).all()

    def get_category(self, category_id: int):
        return self._db.get(ExpenseCategoryModel, category_id)

    def save_category(self, entity):
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def list_subcategories(self, category_id=None, active_only=False):
        stmt = select(ExpenseSubCategoryModel).order_by(ExpenseSubCategoryModel.sub_category_name)
        if category_id is not None:
            stmt = stmt.where(ExpenseSubCategoryModel.category_id == category_id)
        if active_only:
            stmt = stmt.where(ExpenseSubCategoryModel.status == 1)
        return self._db.scalars(stmt).all()

    def get_subcategory(self, subcategory_id: int):
        return self._db.get(ExpenseSubCategoryModel, subcategory_id)

    def save_subcategory(self, entity):
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def list_expenses(self, created_by=None):
        stmt = select(ExpenseModel).order_by(ExpenseModel.created_on.desc(), ExpenseModel.id.desc())
        if created_by is not None:
            stmt = stmt.where(ExpenseModel.created_by == created_by)
        return self._db.scalars(stmt).all()

    def get_expense(self, expense_id: int):
        return self._db.get(ExpenseModel, expense_id)

    def save_expense(self, entity):
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def delete_expense(self, entity):
        self._db.delete(entity)
        self._db.commit()
