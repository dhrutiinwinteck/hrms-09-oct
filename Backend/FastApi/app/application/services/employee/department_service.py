from fastapi import HTTPException

from app.domain.interfaces.employee.department_interface import (
    IDepartmentRepository
)

from app.infrastructure.models.employee.department import (
    DepartmentModel
)


class DepartmentService:

    def __init__(
        self,
        repo: IDepartmentRepository
    ):
        self.repo = repo

    def list_all(self):
        return self.repo.get_all()

    def get_by_id(
        self,
        dept_id: int
    ):
        dept = self.repo.get_by_id(
            dept_id
        )

        if not dept:
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        return dept

    def create(
        self,
        name: str
    ):
        new_dept = DepartmentModel(
            name=name
        )

        return self.repo.add(
            new_dept
        )

    def update(
        self,
        dept_id: int,
        name: str
    ):
        dept = self.get_by_id(
            dept_id
        )

        dept.name = name

        return self.repo.update(
            dept
        )

    def delete(
        self,
        dept_id: int
    ):
        dept = self.get_by_id(
            dept_id
        )

        self.repo.delete(
            dept
        )

        return {
            "message":
                "Department deleted successfully"
        }