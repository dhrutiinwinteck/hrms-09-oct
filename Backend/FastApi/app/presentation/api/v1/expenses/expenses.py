from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.application.dtos.expenses.expense_dto import (
    ExpenseCategoryCreate, ExpenseCategoryResponse, ExpenseCategoryUpdate,
    ExpenseCreateForm, ExpenseResponse, ExpenseStatusUpdate,
    ExpenseSubCategoryCreate, ExpenseSubCategoryResponse, ExpenseSubCategoryUpdate,
)
from app.application.services.expenses.expense_service import ExpenseService
from app.core.config import settings
from app.infrastructure.database.connection import get_db_session
from app.core.security import (
    get_current_user_id,
    get_current_username,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])


def get_service(db: Session = Depends(get_db_session)) -> ExpenseService:
    return ExpenseService(
        db=db,
        upload_directory=str(Path(settings.BASE_DIR) / "uploads" / "Expense"),
        public_base_url=getattr(settings, "BACKEND_BASE_URL", "http://localhost:8001") + "/uploads",
    )


def response(entity):
    return ExpenseResponse.model_validate(entity)


@router.get("/categories", response_model=list[ExpenseCategoryResponse])
def get_categories(active_only: bool = Query(False), service: ExpenseService = Depends(get_service)):
    return service.categories(active_only)


@router.post("/categories", response_model=ExpenseCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(request: ExpenseCategoryCreate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.create_category(request.category_name, actor)


@router.put("/categories/{category_id}", response_model=ExpenseCategoryResponse)
def update_category(category_id: int, request: ExpenseCategoryUpdate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.update_category(category_id, request.category_name, actor)


@router.patch("/categories/{category_id}/status", response_model=ExpenseCategoryResponse)
def toggle_category(category_id: int, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.toggle_category(category_id, actor)


@router.get("/sub-categories", response_model=list[ExpenseSubCategoryResponse])
def get_subcategories(category_id: int | None = Query(None, gt=0), active_only: bool = Query(False), service: ExpenseService = Depends(get_service)):
    return service.subcategories(category_id, active_only)


@router.post("/sub-categories", response_model=ExpenseSubCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_subcategory(request: ExpenseSubCategoryCreate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.create_subcategory(request.category_id, request.sub_category_name, actor)


@router.put("/sub-categories/{subcategory_id}", response_model=ExpenseSubCategoryResponse)
def update_subcategory(subcategory_id: int, request: ExpenseSubCategoryUpdate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.update_subcategory(subcategory_id, request.category_id, request.sub_category_name, actor)


@router.patch("/sub-categories/{subcategory_id}/status", response_model=ExpenseSubCategoryResponse)
def toggle_subcategory(subcategory_id: int, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.toggle_subcategory(subcategory_id, actor)


@router.get("", response_model=list[ExpenseResponse])
def get_expenses(own_only: bool = Query(False), service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.list_expenses(actor if own_only else None)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, service: ExpenseService = Depends(get_service)):
    return service.get_expense(expense_id)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    form: ExpenseCreateForm = Depends(ExpenseCreateForm.as_form),
    bill: UploadFile | None = File(None), bill1: UploadFile | None = File(None), bill2: UploadFile | None = File(None),
    bill3: UploadFile | None = File(None), bill4: UploadFile | None = File(None),
    service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username), employee_id: int = Depends(get_current_user_id),
):
    return await service.create_expense(form, actor, employee_id, [bill, bill1, bill2, bill3, bill4])


@router.patch("/{expense_id}/hr-status", response_model=ExpenseResponse)
def update_hr_status(expense_id: int, request: ExpenseStatusUpdate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.update_status(expense_id, request, actor, is_promoter=False)


@router.patch("/{expense_id}/promoter-status", response_model=ExpenseResponse)
def update_promoter_status(expense_id: int, request: ExpenseStatusUpdate, service: ExpenseService = Depends(get_service), actor: str = Depends(get_current_username)):
    return service.update_status(expense_id, request, actor, is_promoter=True)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, service: ExpenseService = Depends(get_service)):
    service.delete_expense(expense_id)
    return None
