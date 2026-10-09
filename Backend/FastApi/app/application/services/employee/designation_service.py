from fastapi import HTTPException

from app.domain.interfaces.employee.designation_interface import (
    IDesignationRepository
)

from app.infrastructure.models.employee.designation import (
    DesignationModel
)


class DesignationService:

    def __init__(
        self,
        repo: IDesignationRepository
    ):
        self.repo = repo

    def list_all(self):
        results = self.repo.get_all_with_department()

        # Formatting data for the DTO
        return [
            {
                "id": d.id,
                "name": d.name,
                "depart_id": d.depart_id,
                "department_name": dept_name
            }
            for d, dept_name in results
        ]

    def get_by_id(
        self,
        desg_id: int
    ):
        desg = self.repo.get_by_id(
            desg_id
        )

        if not desg:
            raise HTTPException(
                status_code=404,
                detail="Designation not found"
            )

        return desg

    def create(
        self,
        name: str,
        dept_id: int
    ):
        new_desg = DesignationModel(
            name=name,
            depart_id=dept_id
        )

        return self.repo.add(
            new_desg
        )

    def update(
        self,
        desg_id: int,
        name: str,
        dept_id: int
    ):
        desg = self.get_by_id(
            desg_id
        )

        desg.name = name
        desg.depart_id = dept_id

        return self.repo.update(
            desg
        )

    def delete(
        self,
        desg_id: int
    ):
        desg = self.get_by_id(
            desg_id
        )

        self.repo.delete(
            desg
        )

        return {
            "message":
                "Designation deleted successfully"
        }