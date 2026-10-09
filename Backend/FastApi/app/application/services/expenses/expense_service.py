from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.application.dtos.expenses.expense_dto import ExpenseCreateForm, ExpenseStatusUpdate
from app.infrastructure.models.expenses.expense import ExpenseCategoryModel, ExpenseModel, ExpenseSubCategoryModel
from app.infrastructure.repositories.expenses.expense_repository import ExpenseRepository


class ExpenseService:
    ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
    MAX_FILE_SIZE = 5 * 1024 * 1024

    def __init__(self, db: Session, upload_directory: str, public_base_url: str):
        self._db = db
        self._repository = ExpenseRepository(db)
        self._upload_directory = Path(upload_directory).resolve()
        self._public_base_url = public_base_url.rstrip("/")

    def categories(self, active_only: bool = False):
        return self._repository.list_categories(active_only)

    def create_category(self, name: str, actor: str):
        entity = ExpenseCategoryModel(category_name=name.strip(), status=1, created_by=actor, created_on=datetime.now(timezone.utc))
        return self._repository.save_category(entity)

    def update_category(self, category_id: int, name: str, actor: str):
        entity = self._repository.get_category(category_id)
        if entity is None:
            raise HTTPException(status_code=404, detail="Expense category not found.")
        entity.category_name = name.strip()
        entity.modified_by = actor
        entity.modified_on = datetime.now(timezone.utc)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def toggle_category(self, category_id: int, actor: str):
        entity = self._repository.get_category(category_id)
        if entity is None:
            raise HTTPException(status_code=404, detail="Expense category not found.")
        entity.status = 0 if entity.status == 1 else 1
        entity.modified_by = actor
        entity.modified_on = datetime.now(timezone.utc)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def subcategories(self, category_id: int | None = None, active_only: bool = False):
        return self._repository.list_subcategories(category_id, active_only)

    def create_subcategory(self, category_id: int, name: str, actor: str):
        if self._repository.get_category(category_id) is None:
            raise HTTPException(status_code=400, detail="Parent expense category does not exist.")
        entity = ExpenseSubCategoryModel(category_id=category_id, sub_category_name=name.strip(), status=1, created_by=actor, created_on=datetime.now(timezone.utc))
        return self._repository.save_subcategory(entity)

    def update_subcategory(self, subcategory_id: int, category_id: int, name: str, actor: str):
        entity = self._repository.get_subcategory(subcategory_id)
        if entity is None:
            raise HTTPException(status_code=404, detail="Expense sub-category not found.")
        if self._repository.get_category(category_id) is None:
            raise HTTPException(status_code=400, detail="Parent expense category does not exist.")
        entity.category_id = category_id
        entity.sub_category_name = name.strip()
        entity.modified_by = actor
        entity.modified_on = datetime.now(timezone.utc)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def toggle_subcategory(self, subcategory_id: int, actor: str):
        entity = self._repository.get_subcategory(subcategory_id)
        if entity is None:
            raise HTTPException(status_code=404, detail="Expense sub-category not found.")
        entity.status = 0 if entity.status == 1 else 1
        entity.modified_by = actor
        entity.modified_on = datetime.now(timezone.utc)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    async def _save_file(self, upload: UploadFile | None) -> str | None:
        if upload is None or not upload.filename:
            return None
        extension = Path(upload.filename).suffix.lower()
        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported attachment type: {extension or 'unknown'}")
        content = await upload.read()
        if len(content) > self.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Each attachment must be 5 MB or smaller.")
        self._upload_directory.mkdir(parents=True, exist_ok=True)
        safe_name = f"{datetime.now(timezone.utc):%Y%m%d%H%M%S%f}_{uuid4().hex}{extension}"
        target = self._upload_directory / safe_name
        target.write_bytes(content)
        return f"{self._public_base_url}/Expense/{safe_name}"

    async def create_expense(self, form: ExpenseCreateForm, actor: str, employee_id: int, files: list[UploadFile | None]):
        if self._repository.get_category(form.category_id) is None:
            raise HTTPException(status_code=400, detail="Expense category does not exist.")
        if form.sub_category_id is not None and self._repository.get_subcategory(form.sub_category_id) is None:
            raise HTTPException(status_code=400, detail="Expense sub-category does not exist.")
        now = datetime.now(timezone.utc)
        bill_urls = [await self._save_file(item) for item in files]
        is_admin_entry = form.type == 0
        entity = ExpenseModel(
            type=0 if is_admin_entry else employee_id,
            description=form.description.strip(), category_id=form.category_id,
            sub_category_id=form.sub_category_id, amount=form.amount,
            expense_from=form.expense_from, expense_to=form.expense_to,
            bill=bill_urls[0], bill1=bill_urls[1], bill2=bill_urls[2], bill3=bill_urls[3], bill4=bill_urls[4],
            on_site_location=form.on_site_location.strip() if form.on_site_location else None,
            status_hr=11 if is_admin_entry else 10, status_promoter=10,
            created_by=actor, created_on=now,
        )
        return self._repository.save_expense(entity)

    def list_expenses(self, actor: str | None = None):
        return self._repository.list_expenses(actor)

    def get_expense(self, expense_id: int):
        entity = self._repository.get_expense(expense_id)
        if entity is None:
            raise HTTPException(status_code=404, detail="Expense not found.")
        return entity

    def update_status(self, expense_id: int, update: ExpenseStatusUpdate, actor: str, is_promoter: bool):
        entity = self.get_expense(expense_id)
        if update.status == 10:
            raise HTTPException(status_code=400, detail="Status 10 is pending and cannot be submitted as an update.")
        if update.status == 12 and not update.reason:
            raise HTTPException(status_code=422, detail="A rejection reason is required.")
        if is_promoter:
            entity.status_promoter = update.status
            entity.reject_reason_promoter = update.reason
        else:
            entity.status_hr = update.status
            entity.reject_reason_hr = update.reason
        entity.modified_by = actor
        entity.modified_on = datetime.now(timezone.utc)
        self._db.commit()
        self._db.refresh(entity)
        return entity

    def delete_expense(self, expense_id: int):
        entity = self.get_expense(expense_id)
        if entity.status_promoter in (11, 12):
            raise HTTPException(status_code=409, detail="An expense finalized by promoter cannot be deleted.")
        self._repository.delete_expense(entity)
