from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_score_dto import (
    ApplicableKRAResponse,
    EmployeeKRAScoreItem,
    EmployeeKRAScoreRequest,
    KRAScoreCreate,
    KRAScoreParameterResponse,
    KRAScoreResponse,
    KRAScoreUpdate,
)

from app.infrastructure.models.employee.designation import (
    DesignationModel,
)

from app.infrastructure.models.employee.employee import (
    EmployeeModel,
)

from app.infrastructure.models.kra.kra_manager import (
    KRAManager,
)

from app.infrastructure.models.kra.kra_master import (
    KRAMaster,
)

from app.infrastructure.models.kra.kra_score import (
    KRAScore,
)

from app.infrastructure.repositories.kra.kra_score_repository import (
    KRAScoreRepository,
)

class KRAScoreService:

    def __init__(
        self,
        db: Session,
    ) -> None:

        self.db = db

        self.repository = (
            KRAScoreRepository()
        )

    # =========================================================
    # EMPLOYEE
    # =========================================================

    def _get_employee(
        self,
        employee_id: int,
    ) -> EmployeeModel:

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee ID.",
            )

        statement = (
            select(EmployeeModel)
            .where(
                EmployeeModel.id
                == employee_id,

                EmployeeModel.is_remove
                == 0,
            )
        )

        employee = self.db.scalar(
            statement
        )

        if employee is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Active employee with id "
                    f"{employee_id} was not found."
                ),
            )

        if employee.designation is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Employee does not have a designation."
                ),
            )

        return employee

    # =========================================================
    # EMPLOYEE DEPARTMENT
    # =========================================================

    def _get_employee_department_id(
        self,
        employee_id: int,
    ) -> int:

        employee = self._get_employee(
            employee_id
        )

        statement = (
            select(
                DesignationModel.depart_id
            )
            .where(
                DesignationModel.id
                == employee.designation
            )
        )

        department_id = self.db.scalar(
            statement
        )

        if department_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Employee designation was found, "
                    "but its department was not found."
                ),
            )

        return int(
            department_id
        )

    # =========================================================
    # GET APPLICABLE KRA
    # =========================================================

    def get_applicable_kras(
        self,
        employee_id: int,
        year: int,
        frommonth: int,
        tomonth: int,
    ) -> list[KRAMaster]:

        # -----------------------------------------------------
        # VALIDATE YEAR
        # -----------------------------------------------------

        if year < 2000 or year > 2100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid KRA year.",
            )

        # -----------------------------------------------------
        # VALIDATE FROM MONTH
        # -----------------------------------------------------

        if not 1 <= frommonth <= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid From Month.",
            )

        # -----------------------------------------------------
        # VALIDATE TO MONTH
        # -----------------------------------------------------

        if not 1 <= tomonth <= 12:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid To Month.",
            )

        # -----------------------------------------------------
        # VALIDATE PERIOD ORDER
        # -----------------------------------------------------

        if frommonth > tomonth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "From Month cannot be greater "
                    "than To Month."
                ),
            )

        # -----------------------------------------------------
        # GET ACTIVE EMPLOYEE
        # -----------------------------------------------------

        employee = self._get_employee(
            employee_id
        )

        # -----------------------------------------------------
        # GET EMPLOYEE DEPARTMENT
        # -----------------------------------------------------

        department_id = (
            self._get_employee_department_id(
                employee_id
            )
        )

        # =====================================================
        # EXACT KRA MASTER PERIOD MATCH
        # =====================================================
        #
        # IMPORTANT:
        #
        # Only an EXACTLY configured KRA Master period
        # is considered applicable.
        #
        # Example:
        #
        # KRA Master:
        #     April -> June -> 2026
        #
        # User selects:
        #     February -> June -> 2026
        #
        # Result:
        #     NO MATCH
        #
        # We intentionally DO NOT use:
        #
        #     frommonth <= selected_frommonth
        #     tomonth >= selected_tomonth
        #
        # because that would allow overlapping periods.
        #
        # The selected period must exactly equal the
        # configured KRA Master period.
        # =====================================================

        statement = (
            select(KRAMaster)
            .where(
                # Employee department must match
                KRAMaster.department_id
                == department_id,

                # Employee designation must match
                KRAMaster.designation_id
                == employee.designation,

                # Year must match exactly
                KRAMaster.year
                == year,

                # From Month must match exactly
                KRAMaster.frommonth
                == frommonth,

                # To Month must match exactly
                KRAMaster.tomonth
                == tomonth,

                # Only active KRA Master records
                KRAMaster.status
                != 0,
            )
            .order_by(
                KRAMaster.id.asc()
            )
        )

        return list(
            self.db.scalars(
                statement
            ).all()
        )

    # =========================================================
    # VALIDATE SCORE ITEMS
    # =========================================================

    def _validate_items(
        self,
        request_items: list[
            EmployeeKRAScoreItem
        ],
        applicable_kras: list[
            KRAMaster
        ],
    ) -> tuple[
        dict[int, KRAMaster],
        Decimal,
        Decimal,
    ]:

        master_ids = [
            item.master_id
            for item in request_items
        ]

        if len(master_ids) != len(
            set(master_ids)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Duplicate KRA master IDs "
                    "are not allowed."
                ),
            )

        applicable_by_id = {
            kra.id: kra
            for kra in applicable_kras
        }

        total_weightage = Decimal(
            "0"
        )

        weighted_score = Decimal(
            "0"
        )

        for item in request_items:

            kra = (
                applicable_by_id.get(
                    item.master_id
                )
            )

            if kra is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"KRA Master ID "
                        f"{item.master_id} is not "
                        "applicable to this employee "
                        "for the selected period."
                    ),
                )

            weightage = Decimal(
                str(
                    kra.weightage
                    if kra.weightage
                    is not None
                    else 0
                )
            )

            score = Decimal(
                str(
                    item.self_score
                )
            )

            if (
                score < 0
                or score > 100
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Self score must be "
                        "between 0 and 100."
                    ),
                )

            total_weightage += (
                weightage
            )

            weighted_score += (
                weightage * score
            ) / Decimal("100")

        if total_weightage <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Applicable KRA weightage "
                    "must be greater than zero."
                ),
            )

        return (
            applicable_by_id,
            total_weightage,
            weighted_score,
        )

    # =========================================================
    # CALCULATE TOTAL SELF SCORE
    # =========================================================

    def _calculate_total_self_score(
        self,
        total_weightage: Decimal,
        weighted_score: Decimal,
    ) -> Decimal:

        return (
            weighted_score
            / total_weightage
            * Decimal("100")
        ).quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

    # =========================================================
    # CREATE PARAMETER LOGS
    # =========================================================

    def _create_parameter_logs(
        self,
        score_id: int,
        employee_id: int,
        items: list[
            EmployeeKRAScoreItem
        ],
        now: datetime,
    ) -> None:

        for item in items:

            log_entity = KRAManager(
                master_id=item.master_id,

                kra_score_id=score_id,

                isedited=False,

                self_score=item.self_score,

                key_improvement_area=(
                    item.key_improvement_area
                ),

                reporting_manager=0,

                rm_score=None,

                rm_remark=None,

                tl_score=None,

                tl_remark=None,

                tp_score=None,

                tp_remark=None,

                createdon=now,

                createdby=str(
                    employee_id
                ),

                modifiedon=None,

                modifiedby=None,
            )

            self.repository.create_log(
                self.db,
                log_entity,
            )

    # =========================================================
    # CREATE ADMIN SCORE
    # =========================================================

    def create(
        self,
        request: KRAScoreCreate,
    ) -> KRAScoreResponse:

        self._get_employee(
            request.emp_id
        )

        existing = (
            self.repository.get_existing_employee_period(
                self.db,
                request.emp_id,
                request.year,
                request.frommonth,
                request.tomonth,
            )
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A KRA score already exists for "
                    "this employee and selected period."
                ),
            )

        applicable_kras = (
            self.get_applicable_kras(
                employee_id=request.emp_id,
                year=request.year,
                frommonth=request.frommonth,
                tomonth=request.tomonth,
            )
        )

        if request.items:

            (
                _,
                total_weightage,
                weighted_score,
            ) = self._validate_items(
                request.items,
                applicable_kras,
            )

            calculated_score = (
                self._calculate_total_self_score(
                    total_weightage,
                    weighted_score,
                )
            )

            total_self_score = (
                request.total_self_score
                if request.total_self_score
                is not None
                else calculated_score
            )

        else:

            total_self_score = (
                request.total_self_score
            )

        now = datetime.now()

        entity = KRAScore(
            emp_id=request.emp_id,

            kra_date=request.kra_date,

            total_self_score=(
                total_self_score
            ),

            total_rm_score=(
                request.total_rm_score
            ),

            total_tl_score=(
                request.total_tl_score
            ),

            total_tp_score=(
                request.total_tp_score
            ),

            rm_remark=request.rm_remark,

            tl_remark=request.tl_remark,

            top_management_remark=(
                request.top_management_remark
            ),

            frommonth=request.frommonth,

            tomonth=request.tomonth,

            year=request.year,

            createdon=now,

            createdby=request.createdby,
        )

        try:

            self.repository.create(
                self.db,
                entity,
            )

            if request.items:

                self._create_parameter_logs(
                    score_id=entity.id,
                    employee_id=request.emp_id,
                    items=request.items,
                    now=now,
                )

            self.db.commit()

            self.db.refresh(
                entity
            )

            return self._build_score_response(
                entity
            )

        except Exception:

            self.db.rollback()

            raise

    # =========================================================
    # EMPLOYEE SELF SCORE
    # =========================================================

    def submit_employee_self_score(
        self,
        employee_id: int,
        request: EmployeeKRAScoreRequest,
    ) -> KRAScoreResponse:

        # =====================================================
        # 1. VERIFY EMPLOYEE
        # =====================================================

        self._get_employee(
            employee_id
        )

        # =====================================================
        # 2. GET EXACT APPLICABLE KRA MASTER
        # =====================================================

        applicable_kras = (
            self.get_applicable_kras(
                employee_id=employee_id,
                year=request.year,
                frommonth=request.frommonth,
                tomonth=request.tomonth,
            )
        )

        # =====================================================
        # 3. NO EXACT KRA
        # =====================================================

        if not applicable_kras:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "No applicable KRA parameters "
                    "were found for the selected "
                    "employee, period and year."
                ),
            )

        # =====================================================
        # 4. REQUEST MAP
        # =====================================================

        request_by_master_id = {
            item.master_id: item
            for item in request.items
        }

        applicable_master_ids = {
            kra.id
            for kra in applicable_kras
        }

        missing_request_ids = (
            applicable_master_ids
            - set(
                request_by_master_id.keys()
            )
        )

        if missing_request_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "All applicable KRA parameters "
                    "must be submitted."
                ),
            )

        # =====================================================
        # 5. VALIDATE REQUEST
        # =====================================================

        (
            _,
            total_weightage,
            weighted_score,
        ) = self._validate_items(
            request.items,
            applicable_kras,
        )

        # =====================================================
        # 6. FIND EXISTING EMPLOYEE PERIOD
        # =====================================================

        existing = (
            self.repository.get_existing_employee_period(
                self.db,
                employee_id,
                request.year,
                request.frommonth,
                request.tomonth,
            )
        )

        # =====================================================
        # 7. EXISTING SCORE
        # =====================================================

        if existing is not None:

            # -------------------------------------------------
            # Load existing parameter logs.
            # -------------------------------------------------

            existing_logs = (
                self.repository.get_logs_by_score_id(
                    self.db,
                    existing.id,
                )
            )

            existing_logs_by_master_id = {
                log.master_id: log
                for log in existing_logs
            }

            now = datetime.now()

            # -------------------------------------------------
            # IMPORTANT:
            #
            # If a KRAManager row does not exist for an
            # applicable master, create a BLANK row.
            #
            # This fixes older partial KRA records where:
            #
            # KRAScore exists
            # but parameter log does not exist.
            # -------------------------------------------------

            for kra in applicable_kras:

                master_id = kra.id

                if (
                    master_id
                    in existing_logs_by_master_id
                ):
                    continue

                missing_log = KRAManager(
                    master_id=master_id,

                    kra_score_id=existing.id,

                    isedited=False,

                    self_score=None,

                    key_improvement_area=None,

                    reporting_manager=0,

                    rm_score=None,

                    rm_remark=None,

                    tl_score=None,

                    tl_remark=None,

                    tp_score=None,

                    tp_remark=None,

                    createdon=now,

                    createdby=str(
                        employee_id
                    ),

                    modifiedon=None,

                    modifiedby=None,
                )

                self.repository.create_log(
                    self.db,
                    missing_log,
                )

                existing_logs_by_master_id[
                    master_id
                ] = missing_log

            # -------------------------------------------------
            # Process every exact applicable KRA.
            # -------------------------------------------------

            for kra in applicable_kras:

                master_id = kra.id

                item = (
                    request_by_master_id.get(
                        master_id
                    )
                )

                if item is None:
                    raise HTTPException(
                        status_code=(
                            status.HTTP_400_BAD_REQUEST
                        ),
                        detail=(
                            f"KRA parameter "
                            f"{master_id} is missing "
                            "from the request."
                        ),
                    )

                log = (
                    existing_logs_by_master_id.get(
                        master_id
                    )
                )

                if log is None:
                    raise HTTPException(
                        status_code=(
                            status.HTTP_500_INTERNAL_SERVER_ERROR
                        ),
                        detail=(
                            f"Unable to initialize "
                            f"KRA parameter "
                            f"{master_id}."
                        ),
                    )

                # =============================================
                # COMPLETED PARAMETER
                #
                # NEVER MODIFY
                # =============================================

                if log.self_score is not None:

                    existing_score = Decimal(
                        str(
                            log.self_score
                        )
                    )

                    incoming_score = Decimal(
                        str(
                            item.self_score
                        )
                    )

                    if (
                        incoming_score
                        != existing_score
                    ):
                        raise HTTPException(
                            status_code=(
                                status.HTTP_409_CONFLICT
                            ),
                            detail=(
                                "Completed KRA parameters "
                                "cannot be modified."
                            ),
                        )

                    existing_improvement = (
                        log.key_improvement_area
                        or ""
                    ).strip()

                    incoming_improvement = (
                        item.key_improvement_area
                        or ""
                    ).strip()

                    if (
                        incoming_improvement
                        != existing_improvement
                    ):
                        raise HTTPException(
                            status_code=(
                                status.HTTP_409_CONFLICT
                            ),
                            detail=(
                                "Completed KRA parameters "
                                "cannot be modified."
                            ),
                        )

                    continue

                # =============================================
                # BLANK PARAMETER
                #
                # ALLOW EMPLOYEE TO COMPLETE
                # =============================================

                log.self_score = (
                    item.self_score
                )

                log.key_improvement_area = (
                    item.key_improvement_area
                )

                log.modifiedon = now

                log.modifiedby = str(
                    employee_id
                )

            # -------------------------------------------------
            # Verify every applicable parameter is completed.
            # -------------------------------------------------

            incomplete_master_ids = []

            for kra in applicable_kras:

                log = (
                    existing_logs_by_master_id.get(
                        kra.id
                    )
                )

                if (
                    log is None
                    or log.self_score is None
                ):
                    incomplete_master_ids.append(
                        kra.id
                    )

            if incomplete_master_ids:

                self.db.rollback()

                raise HTTPException(
                    status_code=(
                        status.HTTP_400_BAD_REQUEST
                    ),
                    detail=(
                        "Self rating is required for "
                        "every KRA parameter."
                    ),
                )

            # -------------------------------------------------
            # Recalculate final total.
            # -------------------------------------------------

            total_self_score = (
                self._calculate_total_self_score(
                    total_weightage,
                    weighted_score,
                )
            )

            # -------------------------------------------------
            # UPDATE SAME KRAScore.
            #
            # DO NOT CREATE A NEW KRAScore.
            # -------------------------------------------------

            existing.total_self_score = (
                total_self_score
            )

            existing.modifiedon = now

            existing.modifiedby = str(
                employee_id
            )

            if request.kra_date is not None:
                existing.kra_date = (
                    request.kra_date
                )

            try:

                self.db.commit()

                self.db.refresh(
                    existing
                )

                return self._build_score_response(
                    existing
                )

            except Exception:

                self.db.rollback()

                raise

        # =====================================================
        # 8. NEW SCORE
        # =====================================================

        total_self_score = (
            self._calculate_total_self_score(
                total_weightage,
                weighted_score,
            )
        )

        now = datetime.now()

        entity = KRAScore(
            emp_id=employee_id,

            kra_date=request.kra_date,

            total_self_score=(
                total_self_score
            ),

            total_rm_score=None,

            total_tl_score=None,

            total_tp_score=None,

            rm_remark=None,

            tl_remark=None,

            top_management_remark=None,

            frommonth=request.frommonth,

            tomonth=request.tomonth,

            year=request.year,

            createdon=now,

            createdby=str(
                employee_id
            ),
        )

        try:

            self.repository.create(
                self.db,
                entity,
            )

            self._create_parameter_logs(
                score_id=entity.id,
                employee_id=employee_id,
                items=request.items,
                now=now,
            )

            self.db.commit()

            self.db.refresh(
                entity
            )

            return self._build_score_response(
                entity
            )

        except Exception:

            self.db.rollback()

            raise

    # =========================================================
    # BUILD COMPLETE SCORE RESPONSE
    # =========================================================

    def _build_score_response(
        self,
        entity: KRAScore,
    ) -> KRAScoreResponse:

        logs = (
            self.repository.get_logs_by_score_id(
                self.db,
                entity.id,
            )
        )

        master_ids = [
            log.master_id
            for log in logs
        ]

        masters_by_id: dict[
            int,
            KRAMaster,
        ] = {}

        if master_ids:

            # =================================================
            # IMPORTANT:
            #
            # Only load KRA Masters belonging to the SAME
            # score period.
            #
            # This prevents an old/wrong master from being
            # returned only because its ID exists in a log.
            # =================================================

            master_statement = (
                select(KRAMaster)
                .where(
                    KRAMaster.id.in_(
                        master_ids
                    ),

                    KRAMaster.year
                    == entity.year,

                    KRAMaster.frommonth
                    == entity.frommonth,

                    KRAMaster.tomonth
                    == entity.tomonth,

                    KRAMaster.status
                    != 0,
                )
            )

            masters = list(
                self.db.scalars(
                    master_statement
                ).all()
            )

            masters_by_id = {
                master.id: master
                for master in masters
            }

        parameters = []

        for log in logs:

            master = (
                masters_by_id.get(
                    log.master_id
                )
            )

            if master is None:
                continue

            parameters.append(
                KRAScoreParameterResponse(
                    master_id=log.master_id,

                    focused_area=(
                        master.focused_area
                    ),

                    weightage=(
                        master.weightage
                    ),

                    self_score=(
                        log.self_score
                    ),

                    key_improvement_area=(
                        log.key_improvement_area
                    ),
                )
            )

        return KRAScoreResponse(
            id=entity.id,

            emp_id=entity.emp_id,

            kra_date=entity.kra_date,

            total_self_score=(
                entity.total_self_score
            ),

            total_rm_score=(
                entity.total_rm_score
            ),

            total_tl_score=(
                entity.total_tl_score
            ),

            total_tp_score=(
                entity.total_tp_score
            ),

            rm_remark=entity.rm_remark,

            tl_remark=entity.tl_remark,

            top_management_remark=(
                entity.top_management_remark
            ),

            frommonth=entity.frommonth,

            tomonth=entity.tomonth,

            year=entity.year,

            createdby=entity.createdby,

            createdon=entity.createdon,

            modifiedon=entity.modifiedon,

            modifiedby=entity.modifiedby,

            parameters=parameters,
        )

    # =========================================================
    # GET BY ID
    # =========================================================

    def get_by_id(
        self,
        score_id: int,
    ) -> KRAScoreResponse:

        if score_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid KRA Score ID.",
            )

        entity = (
            self.repository.get_by_id(
                self.db,
                score_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"KRA Score with id "
                    f"{score_id} not found."
                ),
            )

        return self._build_score_response(
            entity
        )

    # =========================================================
    # GET ALL
    # =========================================================

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAScoreResponse]:

        entities = (
            self.repository.get_all(
                self.db,
                skip,
                limit,
            )
        )

        return [
            self._build_score_response(
                entity
            )
            for entity in entities
        ]

    # =========================================================
    # GET BY EMPLOYEE
    # =========================================================

    def get_by_employee(
        self,
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAScoreResponse]:

        if employee_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid employee ID.",
            )

        entities = (
            self.repository.get_by_employee(
                self.db,
                employee_id,
                skip,
                limit,
            )
        )

        return [
            self._build_score_response(
                entity
            )
            for entity in entities
        ]

    # =========================================================
    # UPDATE
    # =========================================================

    def update(
        self,
        score_id: int,
        request: KRAScoreUpdate,
    ) -> KRAScoreResponse:

        entity = (
            self.repository.get_by_id(
                self.db,
                score_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"KRA Score with id "
                    f"{score_id} not found."
                ),
            )

        values = request.model_dump(
            exclude_unset=True
        )

        values["modifiedon"] = (
            datetime.now()
        )

        try:

            self.repository.update(
                self.db,
                entity,
                values,
            )

            self.db.commit()

            self.db.refresh(
                entity
            )

            return self._build_score_response(
                entity
            )

        except Exception:

            self.db.rollback()

            raise

    # =========================================================
    # DELETE
    # =========================================================

    def delete(
        self,
        score_id: int,
    ) -> None:

        entity = (
            self.repository.get_by_id(
                self.db,
                score_id,
            )
        )

        if entity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"KRA Score with id "
                    f"{score_id} not found."
                ),
            )

        try:

            self.repository.delete(
                self.db,
                entity,
            )

            self.db.commit()

        except Exception:

            self.db.rollback()

            raise

