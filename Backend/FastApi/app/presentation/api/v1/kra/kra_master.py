from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.application.dtos.kra.kra_master_dto import (
    KRAMasterCreateRequest,
    KRAMasterResponse,
    KRAMasterUpdateRequest,
)

from app.application.services.kra.kra_master_service import (
    KRAMasterService,
)

from app.infrastructure.database.connection import (
    get_db_session,
)


router = APIRouter()


# =========================================================
# RESPONSE MAPPER
# =========================================================

def map_kra_master_response(
    entity,
) -> KRAMasterResponse:
    """
    Explicitly maps the SQLAlchemy KRAMaster entity
    to the API response.

    This prevents response serialization from
    accidentally omitting frommonth / tomonth.
    """

    return KRAMasterResponse(
        id=int(entity.id),

        department_id=int(
            entity.department_id
        ),

        designation_id=int(
            entity.designation_id
        ),

        focused_area=(
            entity.focused_area
        ),

        weightage=(
            entity.weightage
        ),

        # =====================================================
        # IMPORTANT MONTH FIELDS
        # =====================================================

        frommonth=(
            entity.frommonth
        ),

        tomonth=(
            entity.tomonth
        ),

        year=(
            entity.year
        ),

        status=(
            entity.status
        ),

        createdby=(
            entity.createdby
        ),

        createdon=(
            entity.createdon
        ),

        modifiedby=(
            entity.modifiedby
        ),

        modifiedon=(
            entity.modifiedon
        ),
    )


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "/master",
    response_model=None,
    status_code=status.HTTP_200_OK,
    summary="List All Master Goals",
)
def list_all_master_goals(
    db: Session = Depends(get_db_session),
):
    print(
        "##################################################"
    )
    print(
        "### KRA MASTER ROUTER - MONTH FIX VERSION 001 ###"
    )
    print(
        "##################################################"
    )

    service = KRAMasterService(db)

    entities = service.get_all()

    result = []

    for entity in entities:

        print(
            "KRA ENTITY:",
            entity,
        )

        print(
            "KRA ID:",
            entity.id,
        )

        print(
            "KRA FROM MONTH:",
            entity.frommonth,
        )

        print(
            "KRA TO MONTH:",
            entity.tomonth,
        )

        item = {
            "debug_marker": "KRA_MONTH_FIX_VERSION_001",

            "id": entity.id,

            "department_id":
                entity.department_id,

            "designation_id":
                entity.designation_id,

            "focused_area":
                entity.focused_area,

            "weightage":
                entity.weightage,

            "frommonth":
                entity.frommonth,

            "tomonth":
                entity.tomonth,

            "year":
                entity.year,

            "status":
                entity.status,

            "createdby":
                entity.createdby,

            "createdon":
                entity.createdon,

            "modifiedby":
                entity.modifiedby,

            "modifiedon":
                entity.modifiedon,
        }

        print(
            "KRA FINAL RESPONSE ITEM:",
            item,
        )

        result.append(item)

    return result
# =========================================================
# GET BY ID
# =========================================================

@router.get(
    "/master/{kra_id}",
    response_model=KRAMasterResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Master Goal",
)
def get_master_goal(
    kra_id: int,
    db: Session = Depends(
        get_db_session
    ),
) -> KRAMasterResponse:

    service = KRAMasterService(db)

    entity = service.get_by_id(
        kra_id
    )

    return map_kra_master_response(
        entity
    )


# =========================================================
# CREATE
# =========================================================

@router.post(
    "/master",
    response_model=KRAMasterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Master Goal",
)
def create_master_goal(
    request: KRAMasterCreateRequest,
    db: Session = Depends(
        get_db_session
    ),
) -> KRAMasterResponse:

    service = KRAMasterService(db)

    entity = service.create(
        request
    )

    return map_kra_master_response(
        entity
    )


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/master/{kra_id}",
    response_model=KRAMasterResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Master Goal",
)
def update_master_goal(
    kra_id: int,
    request: KRAMasterUpdateRequest,
    db: Session = Depends(
        get_db_session
    ),
) -> KRAMasterResponse:

    service = KRAMasterService(db)

    entity = service.update(
        kra_id,
        request,
    )

    return map_kra_master_response(
        entity
    )


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/master/{kra_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Master Goal",
)
def delete_master_goal(
    kra_id: int,
    db: Session = Depends(
        get_db_session
    ),
) -> Response:

    service = KRAMasterService(db)

    service.delete(
        kra_id
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )