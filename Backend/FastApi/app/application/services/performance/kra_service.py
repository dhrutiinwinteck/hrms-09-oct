from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.application.dtos.performance.kra import (
    KRAMasterCreate,
    KRASelfSubmission,
)

from app.infrastructure.models.performance.kra_master import (
    KraMasterNew,
)

from app.infrastructure.models.performance.kra_score import (
    KraScoreNew,
)

from app.infrastructure.models.performance.kra_log import (
    KraScoreLogNew,
)


class KRAService:

    def __init__(self, db: Session):
        self.db = db

    # ==========================
    # 1. KRA MASTER GET LOGIC
    # ==========================

    def get_all_masters(self):
        return self.db.query(
            KraMasterNew
        ).all()

    def get_master_by_id(
        self,
        master_id: int
    ):
        obj = (
            self.db.query(KraMasterNew)
            .filter(
                KraMasterNew.id == master_id
            )
            .first()
        )

        if not obj:
            raise HTTPException(
                status_code=404,
                detail="Master Goal not found"
            )

        return obj

    # ==========================
    # 2. ASSESSMENT GET LOGIC
    # ==========================

    def get_all_assessments(self):
        return self.db.query(
            KraScoreNew
        ).all()

    def get_assessment_by_id(
        self,
        score_id: int
    ):
        # Fetch header

        header = (
            self.db.query(KraScoreNew)
            .filter(
                KraScoreNew.id == score_id
            )
            .first()
        )

        if not header:
            raise HTTPException(
                status_code=404,
                detail="Assessment not found"
            )

        # Fetch related logs

        logs = (
            self.db.query(KraScoreLogNew)
            .filter(
                KraScoreLogNew.kra_score_id
                == score_id
            )
            .all()
        )

        # Merge for response

        return {
            "id": header.id,
            "emp_id": header.emp_id,
            "kra_date": header.kra_date,
            "year": header.year,
            "total_self_score": (
                header.total_self_score
            ),
            "total_tl_score": (
                header.total_tl_score
            ),
            "total_rm_score": (
                header.total_rm_score
            ),
            "total_tp_score": (
                header.total_tp_score
            ),
            "logs": logs
        }

    def get_employee_history(
        self,
        emp_id: int
    ):
        return (
            self.db.query(KraScoreNew)
            .filter(
                KraScoreNew.emp_id == emp_id
            )
            .all()
        )

    # ... keep your existing create/update/delete methods ...

    # --- Master CRUD ---

    def create_master(
        self,
        data: KRAMasterCreate
    ):
        existing_w = (
            self.db.query(
                func.sum(
                    KraMasterNew.weightage
                )
            )
            .filter(
                KraMasterNew.designation_id
                == data.designation_id,
                KraMasterNew.year == data.year,
                KraMasterNew.status == 1
            )
            .scalar()
            or 0
        )

        if (
            existing_w + data.weightage
        ) > 100:
            raise HTTPException(
                status_code=400,
                detail="Weightage exceeds 100%"
            )

        new_obj = KraMasterNew(
            **data.dict()
        )

        self.db.add(new_obj)
        self.db.commit()

        return new_obj

    def update_master(
        self,
        id: int,
        data: KRAMasterCreate
    ):
        obj = (
            self.db.query(KraMasterNew)
            .filter(
                KraMasterNew.id == id
            )
            .first()
        )

        for key, val in data.dict(
            exclude_unset=True
        ).items():
            setattr(
                obj,
                key,
                val
            )

        self.db.commit()

        return obj

    def delete_master(
        self,
        id: int
    ):
        (
            self.db.query(KraMasterNew)
            .filter(
                KraMasterNew.id == id
            )
            .delete()
        )

        self.db.commit()

        return {
            "message":
                "Master Goal Deleted"
        }

    # --- Assessment CRUD ---

    def submit_self(
        self,
        data: KRASelfSubmission
    ):
        total = sum(
            i.score
            for i in data.scores
        )

        header = KraScoreNew(
            emp_id=data.emp_id,
            kra_date=datetime.now(),
            frommonth=data.from_month,
            tomonth=data.to_month,
            year=data.year,
            total_self_score=total
        )

        self.db.add(header)
        self.db.flush()

        for i in data.scores:

            self.db.add(
                KraScoreLogNew(
                    kra_score_id=header.id,
                    master_id=i.master_id,
                    self_score=i.score,
                    key_improvement_area=i.remarks
                )
            )

        self.db.commit()

        return header

    def delete_assessment(
        self,
        id: int
    ):
        (
            self.db.query(KraScoreLogNew)
            .filter(
                KraScoreLogNew.kra_score_id
                == id
            )
            .delete()
        )

        (
            self.db.query(KraScoreNew)
            .filter(
                KraScoreNew.id == id
            )
            .delete()
        )

        self.db.commit()

        return {
            "message":
                "Assessment Deleted"
        }

    # --- Management Review ---

    # def submit_review(self, id: int, data: KRAManagerReview):
    #     header = self.db.query(KraScoreNew).filter(KraScoreNew.id == id).first()
    #     total_rev = sum(s['score'] for s in data.scores)
    #
    #     if data.reviewer_role == "TL":
    #         header.total_tl_score, header.tl_remark = total_rev, data.remarks
    #     elif data.reviewer_role == "RM":
    #         header.total_rm_score, header.rm_remark = total_rev, data.remarks
    #     elif data.reviewer_role == "TP":
    #         header.total_tp_score, header.top_management_remark = total_rev, data.remarks
    #
    #     for s in data.scores:
    #         log = self.db.query(KraScoreLogNew).filter(
    #             KraScoreLogNew.kra_score_id == id,
    #             KraScoreLogNew.master_id == s['master_id']
    #         ).first()
    #
    #         if log:
    #             setattr(
    #                 log,
    #                 f"{data.reviewer_role.lower()}_score",
    #                 s['score']
    #             )
    #
    #     self.db.commit()
    #     return {"message": "Review Saved"}