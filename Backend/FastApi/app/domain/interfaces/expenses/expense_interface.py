from abc import ABC, abstractmethod
from datetime import datetime
from typing import Sequence

from app.infrastructure.models.expenses.expense import ExpenseCategoryModel, ExpenseModel, ExpenseSubCategoryModel


class IExpenseRepository(ABC):
    @abstractmethod
    def list_categories(self, active_only: bool = False) -> Sequence[ExpenseCategoryModel]: ...

    @abstractmethod
    def get_category(self, category_id: int) -> ExpenseCategoryModel | None: ...

    @abstractmethod
    def save_category(self, entity: ExpenseCategoryModel) -> ExpenseCategoryModel: ...

    @abstractmethod
    def list_subcategories(self, category_id: int | None = None, active_only: bool = False) -> Sequence[ExpenseSubCategoryModel]: ...

    @abstractmethod
    def get_subcategory(self, subcategory_id: int) -> ExpenseSubCategoryModel | None: ...

    @abstractmethod
    def save_subcategory(self, entity: ExpenseSubCategoryModel) -> ExpenseSubCategoryModel: ...

    @abstractmethod
    def list_expenses(self, created_by: str | None = None) -> Sequence[ExpenseModel]: ...

    @abstractmethod
    def get_expense(self, expense_id: int) -> ExpenseModel | None: ...

    @abstractmethod
    def save_expense(self, entity: ExpenseModel) -> ExpenseModel: ...

    @abstractmethod
    def delete_expense(self, entity: ExpenseModel) -> None: ...
