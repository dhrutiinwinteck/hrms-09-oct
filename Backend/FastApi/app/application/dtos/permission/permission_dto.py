from typing import Dict

from pydantic import BaseModel


# ============================================================
# PERMISSION ACTION STATE
# ============================================================

class PermissionActionState(BaseModel):

    view: bool = False

    add: bool = False

    edit: bool = False

    delete: bool = False

    export: bool = False

    import_: bool = False

    settings: bool = False


# ============================================================
# SAVE PERMISSIONS REQUEST
# ============================================================

class SavePermissionsRequest(BaseModel):

    target_type: str

    target_id: str

    permissions: Dict[
        str,
        PermissionActionState,
    ]