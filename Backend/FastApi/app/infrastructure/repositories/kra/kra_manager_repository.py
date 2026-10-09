from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session, aliased

from app.domain.interfaces.kra.kra_manager_interface import IKRAManagerRepository

from app.infrastructure.models.employee.designation import DesignationModel
from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.kra.kra_manager import KRAManager
from app.infrastructure.models.kra.kra_master import KRAMaster
from app.infrastructure.models.kra.kra_score import KRAScore

class KRAManagerRepository(IKRAManagerRepository):
    """
    Repository for KRA Manager.

    Hierarchy:

        Employee
            |
            +---- Reporting Manager
            |
            +---- Team Leader
            |
            +---- Top Management

    Important:

        Reporting Manager and Team Leader are different roles.

        Employee.reporting_manager
            = actual Reporting Manager

        Team Leader
            = active employee whose designation is
              Team Leader / Team Lead
              AND belongs to the same department
              AND belongs to the same Top Management chain.
    """

    def __init__(
        self,
        db: Session,
    ) -> None:
        self.db = db

    # =========================================================
    # GET ALL
    # =========================================================

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAManager]:

        statement = (
            select(KRAManager)
            .order_by(
                KRAManager.id.asc()
            )
            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement
            ).all()
        )

    # =========================================================
    # GET ALL FOR MANAGER
    # =========================================================

    def get_all_for_manager(
        self,
        employee_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> list[KRAManager]:

        direct_manager = aliased(
            EmployeeModel
        )

        target_designation = aliased(
            DesignationModel
        )

        team_leader = aliased(
            EmployeeModel
        )

        team_leader_designation = aliased(
            DesignationModel
        )

        # -----------------------------------------------------
        # TEAM LEADER ACCESS
        # -----------------------------------------------------
        #
        # Logged-in employee is allowed to access a KRA when:
        #
        # 1. Logged-in employee is the Team Leader
        # 2. Team Leader is active
        # 3. Designation is Team Leader / Team Lead
        # 4. Team Leader reports to same Top Management
        # 5. Team Leader belongs to SAME DEPARTMENT
        #    as the target employee
        #
        # -----------------------------------------------------

        team_leader_exists = (
            select(1)
            .select_from(team_leader)
            .join(
                team_leader_designation,
                team_leader.designation
                == team_leader_designation.id,
            )
            .where(
                # Logged-in employee must be the Team Leader
                team_leader.id
                == employee_id,

                # Team Leader must be active
                team_leader.is_remove
                == 0,

                # Team Leader and target employee must
                # belong to the same Top Management chain.
                team_leader.reporting_manager
                == direct_manager.reporting_manager,

                # =================================================
                # IMPORTANT FIX:
                # Team Leader and target employee MUST be
                # from the same department.
                # =================================================
                team_leader_designation.depart_id
                == target_designation.depart_id,

                # Team Leader designation
                or_(
                    team_leader_designation.name.ilike(
                        "%team leader%"
                    ),
                    team_leader_designation.name.ilike(
                        "%team lead%"
                    ),
                ),
            )
            .exists()
        )

        statement = (
            select(KRAManager)

            # -------------------------------------------------
            # KRA SCORE -> EMPLOYEE
            # -------------------------------------------------

            .join(
                KRAScore,
                KRAScore.id
                == KRAManager.kra_score_id,
            )

            .join(
                EmployeeModel,
                EmployeeModel.id
                == KRAScore.emp_id,
            )

            # -------------------------------------------------
            # EMPLOYEE -> TARGET EMPLOYEE DESIGNATION
            # -------------------------------------------------
            #
            # This gives us the department of the employee
            # whose KRA is being returned.
            #
            # Designation -> Department
            #
            # -------------------------------------------------

            .join(
                target_designation,
                EmployeeModel.designation
                == target_designation.id,
            )

            # -------------------------------------------------
            # EMPLOYEE -> REPORTING MANAGER
            # -------------------------------------------------

            .outerjoin(
                direct_manager,
                direct_manager.id
                == EmployeeModel.reporting_manager,
            )

            # -------------------------------------------------
            # EMPLOYEE ACCESS
            # -------------------------------------------------

            .where(
                EmployeeModel.is_remove == 0,

                or_(
                    # -----------------------------------------
                    # 1. REPORTING MANAGER
                    # -----------------------------------------

                    EmployeeModel.reporting_manager
                    == employee_id,

                    # -----------------------------------------
                    # 2. TOP / SECOND LEVEL MANAGEMENT
                    # -----------------------------------------

                    direct_manager.reporting_manager
                    == employee_id,

                    # -----------------------------------------
                    # 3. TEAM LEADER
                    # -----------------------------------------
                    #
                    # IMPORTANT:
                    # team_leader_exists now checks:
                    #
                    # SAME TOP MANAGEMENT
                    # +
                    # SAME DEPARTMENT
                    #
                    # -----------------------------------------

                    team_leader_exists,
                ),
            )

            .order_by(
                KRAManager.id.asc()
            )

            .offset(skip)
            .limit(limit)
        )

        return list(
            self.db.scalars(
                statement
            ).all()
        )

    # =========================================================
    # GET BY ID
    # =========================================================

    def get_by_id(
        self,
        record_id: int,
    ) -> KRAManager | None:

        statement = (
            select(KRAManager)
            .where(
                KRAManager.id
                == record_id
            )
        )

        return self.db.scalar(
            statement
        )

    # =========================================================
    # GET BY ID FOR MANAGER
    # =========================================================

    def get_by_id_for_manager(
        self,
        record_id: int,
        employee_id: int,
    ) -> KRAManager | None:

        direct_manager = aliased(
            EmployeeModel
        )

        target_designation = aliased(
            DesignationModel
        )

        team_leader = aliased(
            EmployeeModel
        )

        team_leader_designation = aliased(
            DesignationModel
        )

        # -----------------------------------------------------
        # TEAM LEADER ACCESS
        # -----------------------------------------------------
        #
        # Same rules as get_all_for_manager().
        #
        # This is important because a Team Leader should not
        # be able to access another department's KRA by
        # manually changing the record ID.
        #
        # -----------------------------------------------------

        team_leader_exists = (
            select(1)
            .select_from(team_leader)
            .join(
                team_leader_designation,
                team_leader.designation
                == team_leader_designation.id,
            )
            .where(
                # Logged-in employee must be the Team Leader
                team_leader.id
                == employee_id,

                # Team Leader must be active
                team_leader.is_remove
                == 0,

                # Same Top Management
                team_leader.reporting_manager
                == direct_manager.reporting_manager,

                # =================================================
                # IMPORTANT FIX:
                # Same Department
                # =================================================

                team_leader_designation.depart_id
                == target_designation.depart_id,

                # Team Leader designation
                or_(
                    team_leader_designation.name.ilike(
                        "%team leader%"
                    ),
                    team_leader_designation.name.ilike(
                        "%team lead%"
                    ),
                ),
            )
            .exists()
        )

        statement = (
            select(KRAManager)

            # -------------------------------------------------
            # KRA SCORE -> EMPLOYEE
            # -------------------------------------------------

            .join(
                KRAScore,
                KRAScore.id
                == KRAManager.kra_score_id,
            )

            .join(
                EmployeeModel,
                EmployeeModel.id
                == KRAScore.emp_id,
            )

            # -------------------------------------------------
            # TARGET EMPLOYEE DESIGNATION
            # -------------------------------------------------

            .join(
                target_designation,
                EmployeeModel.designation
                == target_designation.id,
            )

            # -------------------------------------------------
            # EMPLOYEE -> REPORTING MANAGER
            # -------------------------------------------------

            .outerjoin(
                direct_manager,
                direct_manager.id
                == EmployeeModel.reporting_manager,
            )

            # -------------------------------------------------
            # ACCESS
            # -------------------------------------------------

            .where(
                KRAManager.id
                == record_id,

                EmployeeModel.is_remove
                == 0,

                or_(
                    # -----------------------------------------
                    # Reporting Manager
                    # -----------------------------------------

                    EmployeeModel.reporting_manager
                    == employee_id,

                    # -----------------------------------------
                    # Top / second-level manager
                    # -----------------------------------------

                    direct_manager.reporting_manager
                    == employee_id,

                    # -----------------------------------------
                    # Team Leader
                    # -----------------------------------------

                    team_leader_exists,
                ),
            )
        )

        return self.db.scalars(
            statement
        ).first()

    # =========================================================
    # GET EMPLOYEE ID FROM KRA SCORE
    # =========================================================

    def get_employee_id_by_score_id(
        self,
        kra_score_id: int,
    ) -> int | None:

        statement = (
            select(
                KRAScore.emp_id
            )
            .where(
                KRAScore.id
                == kra_score_id
            )
        )

        return self.db.scalar(
            statement
        )

    # =========================================================
    # EMPLOYEE HIERARCHY
    # =========================================================

    def get_employee_hierarchy(
        self,
        employee_id: int,
    ) -> dict[str, object] | None:
        """
        Resolve employee hierarchy.

        Business hierarchy:

            Employee
                |
                +---- Reporting Manager
                |
                +---- Team Leader
                |
                +---- Top Management

        Important:

            employee.reporting_manager
                = actual Reporting Manager

            direct_manager.reporting_manager
                = Top Management

        Team Leader is resolved from active employees whose
        designation is "Team Leader" / "Team Lead" and who:

            1. Report to the same Top Management
            2. Belong to the same Department

        No employee name or employee ID is hardcoded.
        """

        direct_manager = aliased(
            EmployeeModel
        )

        top_manager = aliased(
            EmployeeModel
        )

        target_designation = aliased(
            DesignationModel
        )

        team_leader = aliased(
            EmployeeModel
        )

        team_leader_designation = aliased(
            DesignationModel
        )

        statement = (
            select(

                # -------------------------------------------------
                # EMPLOYEE
                # -------------------------------------------------

                EmployeeModel.id.label(
                    "employee_id"
                ),

                EmployeeModel.first_name.label(
                    "employee_first_name"
                ),

                EmployeeModel.last_name.label(
                    "employee_last_name"
                ),

                # -------------------------------------------------
                # REPORTING MANAGER
                # -------------------------------------------------

                EmployeeModel.reporting_manager.label(
                    "direct_manager_id"
                ),

                direct_manager.first_name.label(
                    "direct_manager_first_name"
                ),

                direct_manager.last_name.label(
                    "direct_manager_last_name"
                ),

                # -------------------------------------------------
                # TOP MANAGEMENT
                # -------------------------------------------------

                direct_manager.reporting_manager.label(
                    "top_manager_id"
                ),

                top_manager.first_name.label(
                    "top_manager_first_name"
                ),

                top_manager.last_name.label(
                    "top_manager_last_name"
                ),

                # -------------------------------------------------
                # TEAM LEADER
                # -------------------------------------------------

                team_leader.id.label(
                    "team_leader_id"
                ),

                team_leader.first_name.label(
                    "team_leader_first_name"
                ),

                team_leader.last_name.label(
                    "team_leader_last_name"
                ),

                team_leader.emp_code.label(
                    "team_leader_emp_code"
                ),

                team_leader_designation.name.label(
                    "team_leader_designation_name"
                ),
            )

            # =====================================================
            # EMPLOYEE -> REPORTING MANAGER
            # =====================================================

            .outerjoin(
                direct_manager,
                direct_manager.id
                == EmployeeModel.reporting_manager,
            )

            # =====================================================
            # EMPLOYEE -> DESIGNATION
            # =====================================================
            #
            # Needed to determine the target employee's
            # department.
            #
            # =====================================================

            .outerjoin(
                target_designation,
                EmployeeModel.designation
                == target_designation.id,
            )

            # =====================================================
            # REPORTING MANAGER -> TOP MANAGEMENT
            # =====================================================

            .outerjoin(
                top_manager,
                top_manager.id
                == direct_manager.reporting_manager,
            )

            # =====================================================
            # FIND TEAM LEADER
            # =====================================================
            #
            # Team Leader must satisfy ALL of these:
            #
            # 1. Active employee
            # 2. Designation contains "Team Leader"
            #    OR "Team Lead"
            # 3. Reports to same Top Management
            # 4. Belongs to SAME Department
            # 5. Must not be target employee
            #
            # =====================================================

            .outerjoin(
                team_leader,
                and_(
                    # Do not select target employee itself
                    team_leader.id
                    != EmployeeModel.id,

                    # Active employee only
                    team_leader.is_remove
                    == 0,

                    # Same Top Management
                    team_leader.reporting_manager
                    == direct_manager.reporting_manager,

                    # =================================================
                    # IMPORTANT FIX:
                    # Team Leader's department must match the
                    # target employee's department.
                    #
                    # We compare through DesignationModel because
                    # employee_detail does not contain a direct
                    # department column.
                    # =================================================

                    team_leader.designation.in_(
                        select(
                            DesignationModel.id
                        ).where(
                            DesignationModel.depart_id
                            == target_designation.depart_id,

                            or_(
                                DesignationModel.name.ilike(
                                    "%team leader%"
                                ),
                                DesignationModel.name.ilike(
                                    "%team lead%"
                                ),
                            ),
                        )
                    ),
                ),
            )

            .outerjoin(
                team_leader_designation,
                team_leader.designation
                == team_leader_designation.id,
            )

            # =====================================================
            # TARGET EMPLOYEE
            # =====================================================

            .where(
                EmployeeModel.id
                == employee_id,

                EmployeeModel.is_remove
                == 0,
            )

            # =====================================================
            # DETERMINISTIC TEAM LEADER
            # =====================================================
            #
            # If multiple Team Leaders satisfy the hierarchy,
            # use the lowest employee ID consistently.
            #
            # =====================================================

            .order_by(
                team_leader.id.asc()
            )
        )

        row = (
            self.db.execute(
                statement
            )
            .mappings()
            .first()
        )

        if row is None:
            return None

        # =========================================================
        # NAME HELPER
        # =========================================================

        def make_name(
            first_name: str | None,
            last_name: str | None,
        ) -> str | None:

            value = (
                f"{first_name or ''} "
                f"{last_name or ''}"
            ).strip()

            return value or None

        # =========================================================
        # FINAL HIERARCHY OBJECT
        # =========================================================

        return {

            # -----------------------------------------------------
            # EMPLOYEE
            # -----------------------------------------------------

            "employee_id": row[
                "employee_id"
            ],

            "employee_name": make_name(
                row[
                    "employee_first_name"
                ],
                row[
                    "employee_last_name"
                ],
            ),

            # -----------------------------------------------------
            # REPORTING MANAGER
            # -----------------------------------------------------

            "direct_manager_id": row[
                "direct_manager_id"
            ],

            "direct_manager_name": make_name(
                row[
                    "direct_manager_first_name"
                ],
                row[
                    "direct_manager_last_name"
                ],
            ),

            # -----------------------------------------------------
            # TEAM LEADER
            # -----------------------------------------------------

            "team_leader_id": row[
                "team_leader_id"
            ],

            "team_leader_name": make_name(
                row[
                    "team_leader_first_name"
                ],
                row[
                    "team_leader_last_name"
                ],
            ),

            "team_leader_emp_code": row[
                "team_leader_emp_code"
            ],

            "team_leader_designation_name": row[
                "team_leader_designation_name"
            ],

            # -----------------------------------------------------
            # TOP MANAGEMENT
            # -----------------------------------------------------

            "top_manager_id": row[
                "top_manager_id"
            ],

            "top_manager_name": make_name(
                row[
                    "top_manager_first_name"
                ],
                row[
                    "top_manager_last_name"
                ],
            ),
        }

    # =========================================================
    # TEAM LEADER CHECK
    # =========================================================

    def is_team_leader(
        self,
        employee_id: int,
    ) -> bool:

        statement = (
            select(
                DesignationModel.name
            )
            .join(
                EmployeeModel,
                EmployeeModel.designation
                == DesignationModel.id,
            )
            .where(
                EmployeeModel.id
                == employee_id,

                EmployeeModel.is_remove
                == 0,
            )
        )

        designation_name = (
            self.db.scalar(
                statement
            )
        )

        if not designation_name:
            return False

        normalized = (
            str(designation_name)
            .strip()
            .lower()
        )

        return (
            "team leader"
            in normalized
            or
            "team lead"
            in normalized
        )

    # =========================================================
    # SCORE PERMISSIONS
    # =========================================================

    def get_score_permissions(
        self,
        target_employee_id: int,
        evaluator_id: int,
    ) -> dict[str, bool]:

        hierarchy = (
            self.get_employee_hierarchy(
                target_employee_id
            )
        )

        if hierarchy is None:
            return {
                "can_edit_tl": False,
                "can_edit_rm": False,
                "can_edit_tm": False,
            }

        # -----------------------------------------------------
        # HIERARCHY IDS
        # -----------------------------------------------------

        direct_manager_id = (
            hierarchy.get(
                "direct_manager_id"
            )
        )

        team_leader_id = (
            hierarchy.get(
                "team_leader_id"
            )
        )

        top_manager_id = (
            hierarchy.get(
                "top_manager_id"
            )
        )

        # -----------------------------------------------------
        # TL CHECK
        # -----------------------------------------------------

        evaluator_is_team_leader = (
            self.is_team_leader(
                evaluator_id
            )
        )

        # -----------------------------------------------------
        # TEAM LEADER
        #
        # Evaluator must be the resolved Team Leader
        # for the target employee.
        #
        # Because get_employee_hierarchy() is now
        # department-aware, a Team Leader from another
        # department cannot receive TL permission.
        # -----------------------------------------------------

        can_edit_tl = (
            evaluator_is_team_leader
            and
            team_leader_id
            == evaluator_id
        )

        # -----------------------------------------------------
        # REPORTING MANAGER
        #
        # Evaluator must be the actual Reporting Manager.
        #
        # A Team Leader must not automatically become RM.
        # -----------------------------------------------------

        can_edit_rm = (
            direct_manager_id
            == evaluator_id
            and
            not evaluator_is_team_leader
        )

        # -----------------------------------------------------
        # TOP MANAGEMENT
        # -----------------------------------------------------

        can_edit_tm = (
            top_manager_id
            == evaluator_id
        )

        return {
            "can_edit_tl": can_edit_tl,
            "can_edit_rm": can_edit_rm,
            "can_edit_tm": can_edit_tm,
        }

    # =========================================================
    # EMPLOYEE + KRA DISPLAY DATA
    # =========================================================

    def get_manager_display_data(
        self,
        entity: KRAManager,
    ) -> dict:

        statement = (
            select(

                EmployeeModel.id.label(
                    "employee_id"
                ),

                EmployeeModel.emp_code.label(
                    "employee_code"
                ),

                EmployeeModel.first_name.label(
                    "first_name"
                ),

                EmployeeModel.last_name.label(
                    "last_name"
                ),

                EmployeeModel.designation.label(
                    "designation_id"
                ),

                DesignationModel.name.label(
                    "designation_name"
                ),

                KRAScore.kra_date.label(
                    "kra_date"
                ),

                KRAScore.frommonth.label(
                    "frommonth"
                ),

                KRAScore.tomonth.label(
                    "tomonth"
                ),

                KRAScore.year.label(
                    "year"
                ),

                KRAMaster.focused_area.label(
                    "focused_area"
                ),

                KRAMaster.weightage.label(
                    "weightage"
                ),
            )

            .join(
                KRAScore,
                KRAScore.emp_id
                == EmployeeModel.id,
            )

            .outerjoin(
                DesignationModel,
                EmployeeModel.designation
                == DesignationModel.id,
            )

            .outerjoin(
                KRAMaster,
                KRAMaster.id
                == entity.master_id,
            )

            .where(
                KRAScore.id
                == entity.kra_score_id,

                EmployeeModel.id
                == KRAScore.emp_id,
            )
        )

        row = (
            self.db.execute(
                statement
            )
            .mappings()
            .first()
        )

        if row is None:
            return {}

        return dict(row)

    # =========================================================
    # EXISTS
    # =========================================================

    def exists(
        self,
        record_id: int,
    ) -> bool:

        statement = (
            select(
                KRAManager.id
            )
            .where(
                KRAManager.id
                == record_id
            )
        )

        return (
            self.db.scalar(
                statement
            )
            is not None
        )

    # =========================================================
    # CREATE
    # =========================================================

    def create(
        self,
        entity: KRAManager,
    ) -> KRAManager:

        self.db.add(
            entity
        )

        self.db.flush()

        self.db.refresh(
            entity
        )

        return entity

    # =========================================================
    # UPDATE
    # =========================================================

    def update(
        self,
        entity: KRAManager,
    ) -> KRAManager:

        self.db.add(
            entity
        )

        self.db.flush()

        self.db.refresh(
            entity
        )

        return entity

    # =========================================================
    # DELETE
    # =========================================================

    def delete(
        self,
        entity: KRAManager,
    ) -> None:

        self.db.delete(
            entity
        )

        self.db.flush()

