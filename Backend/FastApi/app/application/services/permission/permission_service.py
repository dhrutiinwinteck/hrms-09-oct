from sqlalchemy.orm import Session

from app.application.dtos.permission.permission_dto import (
    SavePermissionsRequest,
)

from app.infrastructure.models.permission.permission_model import (
    PermissionItemModel,
    RolePermissionItemModel,
    UserPermissionItemModel,
)


class PermissionService:

    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    # ========================================================
    # GET PERMISSIONS
    # ========================================================

    def get_permissions(
        self,
        target_type: str,
        target_id: str,
    ):

        # ----------------------------------------------------
        # GET ACTIVE PERMISSION DEFINITIONS
        # ----------------------------------------------------

        permission_items = (
            self.db.query(
                PermissionItemModel
            )
            .filter(
                PermissionItemModel.is_active.is_(True)
            )
            .order_by(
                PermissionItemModel.module_key,
                PermissionItemModel.display_order,
            )
            .all()
        )

        # ----------------------------------------------------
        # GET SAVED PERMISSIONS
        # ----------------------------------------------------

        if target_type == "role":

            saved_permissions = (
                self.db.query(
                    RolePermissionItemModel
                )
                .filter(
                    RolePermissionItemModel.role_id
                    == target_id
                )
                .all()
            )

        elif target_type == "user":

            saved_permissions = (
                self.db.query(
                    UserPermissionItemModel
                )
                .filter(
                    UserPermissionItemModel.user_id
                    == target_id
                )
                .all()
            )

        else:

            raise ValueError(
                "target_type must be 'role' or 'user'"
            )

        # ----------------------------------------------------
        # CREATE LOOKUP
        # ----------------------------------------------------

        saved_map = {
            row.permission_item_id: row
            for row in saved_permissions
        }

        # ----------------------------------------------------
        # BUILD MATRIX
        # ----------------------------------------------------

        matrix = {}

        for item in permission_items:

            saved = saved_map.get(
                item.id
            )

            matrix[
                item.permission_key
            ] = {

                "view":
                    saved.can_view
                    if saved else False,

                "add":
                    saved.can_add
                    if saved else False,

                "edit":
                    saved.can_edit
                    if saved else False,

                "delete":
                    saved.can_delete
                    if saved else False,

                "export":
                    saved.can_export
                    if saved else False,

                "import":
                    saved.can_import
                    if saved else False,

                "settings":
                    saved.can_settings
                    if saved else False,
            }

        return matrix

    # ========================================================
    # SAVE ALL PERMISSIONS
    # ========================================================

    def save_all_permissions(
        self,
        data: SavePermissionsRequest,
    ):

        if data.target_type == "role":

            self._save_role_permissions(
                data
            )

        elif data.target_type == "user":

            self._save_user_permissions(
                data
            )

        else:

            raise ValueError(
                "target_type must be 'role' or 'user'"
            )

        self.db.commit()

        # ----------------------------------------------------
        # RETURN ACTUAL DATABASE STATE
        # ----------------------------------------------------

        return {
            "message":
                "Permissions saved successfully.",

            "target_type":
                data.target_type,

            "target_id":
                data.target_id,

            "permissions":
                self.get_permissions(
                    data.target_type,
                    data.target_id,
                ),
        }

    # ========================================================
    # SAVE ROLE PERMISSIONS
    # ========================================================

    def _save_role_permissions(
        self,
        data: SavePermissionsRequest,
    ):

        existing = (
            self.db.query(
                RolePermissionItemModel
            )
            .filter(
                RolePermissionItemModel.role_id
                == data.target_id
            )
            .all()
        )

        existing_map = {
            row.permission_item_id: row
            for row in existing
        }

        permission_items = (
            self.db.query(
                PermissionItemModel
            )
            .filter(
                PermissionItemModel.is_active.is_(True)
            )
            .all()
        )

        item_map = {
            item.permission_key: item
            for item in permission_items
        }

        # ----------------------------------------------------
        # ONLY SUPPLIED PERMISSIONS ARE UPDATED
        # ----------------------------------------------------

        for permission_key, action in (
            data.permissions.items()
        ):

            item = item_map.get(
                permission_key
            )

            if not item:
                continue

            saved = existing_map.get(
                item.id
            )

            if not saved:

                saved = RolePermissionItemModel(
                    role_id=data.target_id,
                    permission_item_id=item.id,
                )

                self.db.add(saved)

            saved.can_view = action.view

            saved.can_add = action.add

            saved.can_edit = action.edit

            saved.can_delete = action.delete

            saved.can_export = action.export

            saved.can_import = action.import_

            saved.can_settings = action.settings

    # ========================================================
    # SAVE USER PERMISSIONS
    # ========================================================

    def _save_user_permissions(
        self,
        data: SavePermissionsRequest,
    ):

        existing = (
            self.db.query(
                UserPermissionItemModel
            )
            .filter(
                UserPermissionItemModel.user_id
                == data.target_id
            )
            .all()
        )

        existing_map = {
            row.permission_item_id: row
            for row in existing
        }

        permission_items = (
            self.db.query(
                PermissionItemModel
            )
            .filter(
                PermissionItemModel.is_active.is_(True)
            )
            .all()
        )

        item_map = {
            item.permission_key: item
            for item in permission_items
        }

        # ----------------------------------------------------
        # ONLY SUPPLIED PERMISSIONS ARE UPDATED
        # ----------------------------------------------------

        for permission_key, action in (
            data.permissions.items()
        ):

            item = item_map.get(
                permission_key
            )

            if not item:
                continue

            saved = existing_map.get(
                item.id
            )

            if not saved:

                saved = UserPermissionItemModel(
                    user_id=data.target_id,
                    permission_item_id=item.id,
                )

                self.db.add(saved)

            saved.can_view = action.view

            saved.can_add = action.add

            saved.can_edit = action.edit

            saved.can_delete = action.delete

            saved.can_export = action.export

            saved.can_import = action.import_

            saved.can_settings = action.settings