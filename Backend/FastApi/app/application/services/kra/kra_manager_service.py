from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_manager_dto import (
    KRAManagerCreateRequest,
    KRAManagerResponse,
    KRAManagerUpdateRequest,
)
from app.infrastructure.models.kra.kra_manager import KRAManager
from app.infrastructure.repositories.kra.kra_manager_repository import (
    KRAManagerRepository,
)

class KRAManagerService:
    """
    KRA Manager business logic.

    Hierarchy:

        Employee
            ├── Reporting Manager
            ├── Team Leader
            └── Top Management

    Score permissions:

        Team Leader -> TL Score
        RM          -> RM Score
        TM          -> TM Score

    Database mapping:

        TL Score -> tl_score
        RM Score -> rm_score
        TM Score -> tp_score
    """

    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db
        self.repository = KRAManagerRepository(db)

    # =========================================================
    # AUTHORIZE EMPLOYEE
    # =========================================================

    def _ensure_employee_can_access(
        self,
        employee_id: int,
        manager_id: int,
    ) -> None:

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee ID.",
            )

        if manager_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid manager ID.",
            )

        hierarchy = (
            self.repository.get_employee_hierarchy(
                employee_id
            )
        )

        if hierarchy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee was not found.",
            )

        direct_manager_id = hierarchy.get(
            "direct_manager_id"
        )

        team_leader_id = hierarchy.get(
            "team_leader_id"
        )

        top_manager_id = hierarchy.get(
            "top_manager_id"
        )

        # -----------------------------------------------------
        # ACCESS RULE
        # -----------------------------------------------------
        #
        # Reporting Manager -> allowed
        # Team Leader       -> allowed
        # Top Management    -> allowed
        #
        # -----------------------------------------------------

        if (
            direct_manager_id != manager_id
            and team_leader_id != manager_id
            and top_manager_id != manager_id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized to "
                    "access this employee's KRA."
                ),
            )

    # =========================================================
    # GET PERMISSIONS
    # =========================================================

    def _get_permissions(
        self,
        target_employee_id: int,
        evaluator_id: int,
    ) -> dict[str, bool]:

        return self.repository.get_score_permissions(
            target_employee_id=target_employee_id,
            evaluator_id=evaluator_id,
        )

    # =========================================================
    # BUILD RESPONSE
    # =========================================================

    def _build_response(
        self,
        entity: KRAManager,
        evaluator_id: int,
    ) -> KRAManagerResponse:

        target_employee_id = (
            self.repository.get_employee_id_by_score_id(
                entity.kra_score_id
            )
        )

        if target_employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Employee associated with "
                    "this KRA score was not found."
                ),
            )

        hierarchy = (
            self.repository.get_employee_hierarchy(
                target_employee_id
            )
        )

        if hierarchy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee hierarchy was not found.",
            )

        permissions = self._get_permissions(
            target_employee_id=target_employee_id,
            evaluator_id=evaluator_id,
        )

        display_data = (
            self.repository.get_manager_display_data(
                entity
            )
        )

        employee_name = hierarchy.get(
            "employee_name"
        )

        response_data = {
            # -------------------------------------------------
            # KRA MANAGER
            # -------------------------------------------------

            "id": entity.id,

            "master_id": entity.master_id,

            "kra_score_id": entity.kra_score_id,

            "isedited": entity.isedited,

            "self_score": entity.self_score,

            "key_improvement_area": (
                entity.key_improvement_area
            ),

            "reporting_manager": (
                hierarchy.get(
                    "direct_manager_id"
                )
                or 0
            ),

            "rm_score": entity.rm_score,

            "rm_remark": entity.rm_remark,

            "tl_score": entity.tl_score,

            "tl_remark": entity.tl_remark,

            "tp_score": entity.tp_score,

            "tp_remark": entity.tp_remark,

            "createdon": entity.createdon,

            "createdby": entity.createdby,

            "modifiedon": entity.modifiedon,

            "modifiedby": entity.modifiedby,

            # -------------------------------------------------
            # EMPLOYEE
            # -------------------------------------------------

            "employee_id": target_employee_id,

            "employee_code": display_data.get(
                "employee_code"
            ),

            "employee_name": employee_name,

            # -------------------------------------------------
            # DESIGNATION
            # -------------------------------------------------

            "designation_id": display_data.get(
                "designation_id"
            ),

            "designation_name": display_data.get(
                "designation_name"
            ),

            # -------------------------------------------------
            # KRA
            # -------------------------------------------------

            "kra_date": display_data.get(
                "kra_date"
            ),

            "frommonth": display_data.get(
                "frommonth"
            ),

            "tomonth": display_data.get(
                "tomonth"
            ),

            "year": display_data.get(
                "year"
            ),

            "focused_area": display_data.get(
                "focused_area"
            ),

            "weightage": display_data.get(
                "weightage"
            ),

            "total_weightage": display_data.get(
                "weightage"
            ),

            # -------------------------------------------------
            # REPORTING MANAGER
            # -------------------------------------------------

            "reporting_manager_name": (
                hierarchy.get(
                    "direct_manager_name"
                )
            ),

            "direct_manager_id": (
                hierarchy.get(
                    "direct_manager_id"
                )
            ),

            "direct_manager_name": (
                hierarchy.get(
                    "direct_manager_name"
                )
            ),

            # -------------------------------------------------
            # TEAM LEADER
            # -------------------------------------------------

            "team_leader_id": (
                hierarchy.get(
                    "team_leader_id"
                )
            ),

            "team_leader_name": (
                hierarchy.get(
                    "team_leader_name"
                )
            ),

            "team_leader_emp_code": (
                hierarchy.get(
                    "team_leader_emp_code"
                )
            ),

            "team_leader_designation_name": (
                hierarchy.get(
                    "team_leader_designation_name"
                )
            ),

            # -------------------------------------------------
            # TOP MANAGEMENT
            # -------------------------------------------------

            "top_manager_id": (
                hierarchy.get(
                    "top_manager_id"
                )
            ),

            "top_manager_name": (
                hierarchy.get(
                    "top_manager_name"
                )
            ),

            # -------------------------------------------------
            # PERMISSIONS
            # -------------------------------------------------

            "can_edit_tl": permissions[
                "can_edit_tl"
            ],

            "can_edit_rm": permissions[
                "can_edit_rm"
            ],

            "can_edit_tm": permissions[
                "can_edit_tm"
            ],
        }

        return KRAManagerResponse(
            **response_data
        )

    # =========================================================
    # GET ALL FOR MANAGER
    # =========================================================

    def get_all_for_manager(
        self,
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAManagerResponse]:

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authenticated employee ID.",
            )

        if skip < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="skip cannot be negative.",
            )

        if limit < 1 or limit > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "limit must be between "
                    "1 and 500."
                ),
            )

        records = (
            self.repository.get_all_for_manager(
                employee_id=employee_id,
                skip=skip,
                limit=limit,
            )
        )

        return [
            self._build_response(
                entity=record,
                evaluator_id=employee_id,
            )
            for record in records
        ]

    # =========================================================
    # GET BY ID
    # =========================================================

    def get_by_id_for_manager(
        self,
        record_id: int,
        employee_id: int,
    ) -> KRAManagerResponse:

        if record_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid record ID.",
            )

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authenticated employee ID.",
            )

        entity = (
            self.repository.get_by_id_for_manager(
                record_id=record_id,
                employee_id=employee_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "KRA Manager record was not found "
                    "or you are not authorized to access it."
                ),
            )

        return self._build_response(
            entity=entity,
            evaluator_id=employee_id,
        )

    # =========================================================
    # CREATE
    # =========================================================

    def create(
        self,
        request: KRAManagerCreateRequest,
        employee_id: int,
    ) -> KRAManagerResponse:

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authenticated employee ID.",
            )

        # -----------------------------------------------------
        # DUPLICATE CHECK
        # -----------------------------------------------------

        if self.repository.exists(request.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"KRA Manager record with id "
                    f"{request.id} already exists."
                ),
            )

        # -----------------------------------------------------
        # FIND TARGET EMPLOYEE
        # -----------------------------------------------------

        target_employee_id = (
            self.repository.get_employee_id_by_score_id(
                request.kra_score_id
            )
        )

        if target_employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "The supplied kra_score_id "
                    "does not exist."
                ),
            )

        # -----------------------------------------------------
        # ACCESS CHECK
        # -----------------------------------------------------

        self._ensure_employee_can_access(
            employee_id=target_employee_id,
            manager_id=employee_id,
        )

        # -----------------------------------------------------
        # HIERARCHY
        # -----------------------------------------------------

        hierarchy = (
            self.repository.get_employee_hierarchy(
                target_employee_id
            )
        )

        if hierarchy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee hierarchy was not found.",
            )

        actual_reporting_manager = (
            hierarchy.get(
                "direct_manager_id"
            )
        )

        # -----------------------------------------------------
        # PERMISSIONS
        # -----------------------------------------------------

        permissions = self._get_permissions(
            target_employee_id=target_employee_id,
            evaluator_id=employee_id,
        )

        # -----------------------------------------------------
        # CREATE ENTITY
        # -----------------------------------------------------

        entity = KRAManager(
            id=request.id,

            master_id=request.master_id,

            kra_score_id=request.kra_score_id,

            isedited=request.isedited,

            self_score=request.self_score,

            key_improvement_area=(
                request.key_improvement_area
            ),

            # NEVER use evaluator ID here.
            # Always use actual Reporting Manager.
            reporting_manager=(
                actual_reporting_manager
                or 0
            ),

            # -------------------------------------------------
            # REPORTING MANAGER SCORE
            # -------------------------------------------------

            rm_score=(
                request.rm_score
                if permissions[
                    "can_edit_rm"
                ]
                else None
            ),

            rm_remark=(
                request.rm_remark
                if permissions[
                    "can_edit_rm"
                ]
                else None
            ),

            # -------------------------------------------------
            # TEAM LEADER SCORE
            # -------------------------------------------------

            tl_score=(
                request.tl_score
                if permissions[
                    "can_edit_tl"
                ]
                else None
            ),

            tl_remark=(
                request.tl_remark
                if permissions[
                    "can_edit_tl"
                ]
                else None
            ),

            # -------------------------------------------------
            # TOP MANAGEMENT SCORE
            # -------------------------------------------------

            tp_score=(
                request.tp_score
                if permissions[
                    "can_edit_tm"
                ]
                else None
            ),

            tp_remark=(
                request.tp_remark
                if permissions[
                    "can_edit_tm"
                ]
                else None
            ),

            createdon=(
                request.createdon
                or datetime.now()
            ),

            createdby=request.createdby,

            modifiedon=request.modifiedon,

            modifiedby=request.modifiedby,
        )

        try:

            created_entity = (
                self.repository.create(
                    entity
                )
            )

            self.db.commit()

            self.db.refresh(
                created_entity
            )

            return self._build_response(
                entity=created_entity,
                evaluator_id=employee_id,
            )

        except IntegrityError as exc:

            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to create KRA Manager "
                    "record because the supplied data "
                    "violates a database constraint."
                ),
            ) from exc

        except Exception:

            self.db.rollback()

            raise

    # =========================================================
    # UPDATE
    # =========================================================

    def update(
        self,
        record_id: int,
        request: KRAManagerUpdateRequest,
        employee_id: int,
    ) -> KRAManagerResponse:

        # -----------------------------------------------------
        # GET EXISTING RECORD
        # -----------------------------------------------------

        entity = (
            self.repository.get_by_id_for_manager(
                record_id=record_id,
                employee_id=employee_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "KRA Manager record was not found "
                    "or you are not authorized to update it."
                ),
            )

        # -----------------------------------------------------
        # EXISTING TARGET EMPLOYEE
        # -----------------------------------------------------

        existing_employee_id = (
            self.repository.get_employee_id_by_score_id(
                entity.kra_score_id
            )
        )

        if existing_employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target employee was not found.",
            )

        # -----------------------------------------------------
        # READ REQUEST
        # -----------------------------------------------------

        update_data = request.model_dump(
            exclude_unset=True
        )

        # -----------------------------------------------------
        # DETERMINE TARGET EMPLOYEE IF SCORE ID CHANGES
        # -----------------------------------------------------

        target_kra_score_id = update_data.get(
            "kra_score_id",
            entity.kra_score_id,
        )

        target_employee_id = (
            self.repository.get_employee_id_by_score_id(
                target_kra_score_id
            )
        )

        if target_employee_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "The supplied kra_score_id "
                    "does not exist."
                ),
            )

        # -----------------------------------------------------
        # ACCESS
        # -----------------------------------------------------

        self._ensure_employee_can_access(
            employee_id=target_employee_id,
            manager_id=employee_id,
        )

        # -----------------------------------------------------
        # PERMISSIONS
        # -----------------------------------------------------

        permissions = self._get_permissions(
            target_employee_id=target_employee_id,
            evaluator_id=employee_id,
        )

        # =====================================================
        # REPORTING MANAGER
        # =====================================================

        # Client must never control Reporting Manager.
        update_data.pop(
            "reporting_manager",
            None,
        )

        # =====================================================
        # SCORE SECURITY
        # =====================================================

        if (
            "tl_score" in update_data
            and not permissions["can_edit_tl"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit TL Score."
                ),
            )

        if (
            "tl_remark" in update_data
            and not permissions["can_edit_tl"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit TL Remark."
                ),
            )

        if (
            "rm_score" in update_data
            and not permissions["can_edit_rm"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit RM Score."
                ),
            )

        if (
            "rm_remark" in update_data
            and not permissions["can_edit_rm"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit RM Remark."
                ),
            )

        if (
            "tp_score" in update_data
            and not permissions["can_edit_tm"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit TM Score."
                ),
            )

        if (
            "tp_remark" in update_data
            and not permissions["can_edit_tm"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You are not authorized "
                    "to edit TM Remark."
                ),
            )

        # =====================================================
        # PROTECT SYSTEM FIELDS
        # =====================================================

        update_data.pop(
            "createdon",
            None,
        )

        update_data.pop(
            "createdby",
            None,
        )

        # =====================================================
        # APPLY UPDATE
        # =====================================================

        for field_name, value in update_data.items():
            setattr(
                entity,
                field_name,
                value,
            )

        # =====================================================
        # ALWAYS RESTORE REAL REPORTING MANAGER
        # =====================================================

        hierarchy = (
            self.repository.get_employee_hierarchy(
                target_employee_id
            )
        )

        if hierarchy is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee hierarchy was not found.",
            )

        entity.reporting_manager = (
            hierarchy.get(
                "direct_manager_id"
            )
            or 0
        )

        entity.modifiedon = (
            request.modifiedon
            or datetime.now()
        )

        try:

            updated_entity = (
                self.repository.update(
                    entity
                )
            )

            self.db.commit()

            self.db.refresh(
                updated_entity
            )

            return self._build_response(
                entity=updated_entity,
                evaluator_id=employee_id,
            )

        except IntegrityError as exc:

            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unable to update KRA Manager "
                    "record because the supplied data "
                    "violates a database constraint."
                ),
            ) from exc

        except Exception:

            self.db.rollback()

            raise

    # =========================================================
    # DELETE
    # =========================================================

    def delete(
        self,
        record_id: int,
        employee_id: int,
    ) -> None:

        entity = (
            self.repository.get_by_id_for_manager(
                record_id=record_id,
                employee_id=employee_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "KRA Manager record was not found "
                    "or you are not authorized to delete it."
                ),
            )

        try:

            self.repository.delete(
                entity
            )

            self.db.commit()

        except IntegrityError as exc:

            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "The KRA Manager record cannot "
                    "be deleted because it is referenced "
                    "by another database object."
                ),
            ) from exc

        except Exception:

            self.db.rollback()

            raise


