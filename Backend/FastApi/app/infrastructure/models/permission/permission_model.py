from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
)

from app.infrastructure.database.base import Base


# ============================================================
# EXISTING ROLE PERMISSION MODEL
# ============================================================

class RolePermissionModel(Base):

    __tablename__ = "role_permissions"

    __table_args__ = {
        "extend_existing": True
    }

    id = Column(
        Integer,
        primary_key=True,
    )

    role_id = Column(
        String(128),
        nullable=False,
    )

    module_id = Column(
        String(100),
        nullable=False,
    )

    can_view = Column(
        Boolean,
        default=False,
    )

    can_add = Column(
        Boolean,
        default=False,
    )

    can_edit = Column(
        Boolean,
        default=False,
    )

    can_delete = Column(
        Boolean,
        default=False,
    )

    can_export = Column(
        Boolean,
        default=False,
    )

    can_import = Column(
        Boolean,
        default=False,
    )

    can_settings = Column(
        Boolean,
        default=False,
    )


# ============================================================
# EXISTING USER PERMISSION MODEL
# ============================================================

class UserPermissionModel(Base):

    __tablename__ = "user_permissions"

    __table_args__ = {
        "extend_existing": True
    }

    id = Column(
        Integer,
        primary_key=True,
    )

    user_id = Column(
        String(128),
        nullable=False,
    )

    module_id = Column(
        String(100),
        nullable=False,
    )

    can_view = Column(
        Boolean,
        default=False,
    )

    can_add = Column(
        Boolean,
        default=False,
    )

    can_edit = Column(
        Boolean,
        default=False,
    )

    can_delete = Column(
        Boolean,
        default=False,
    )

    can_export = Column(
        Boolean,
        default=False,
    )

    can_import = Column(
        Boolean,
        default=False,
    )

    can_settings = Column(
        Boolean,
        default=False,
    )


# ============================================================
# PERMISSION ITEM
# ============================================================

class PermissionItemModel(Base):

    __tablename__ = "permission_items"

    __table_args__ = {
        "extend_existing": True
    }

    id = Column(
        Integer,
        primary_key=True,
    )

    module_key = Column(
        String(100),
        nullable=False,
    )

    module_name = Column(
        String(150),
        nullable=False,
    )

    permission_key = Column(
        String(150),
        nullable=False,
    )

    permission_name = Column(
        String(200),
        nullable=False,
    )

    display_order = Column(
        Integer,
        nullable=False,
        default=0,
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )


# ============================================================
# ROLE PERMISSION ITEM
# ============================================================

class RolePermissionItemModel(Base):

    __tablename__ = "role_permission_items"

    __table_args__ = {
        "extend_existing": True
    }

    id = Column(
        Integer,
        primary_key=True,
    )

    role_id = Column(
        String(128),
        nullable=False,
    )

    permission_item_id = Column(
        Integer,
        ForeignKey(
            "permission_items.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    can_view = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_add = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_edit = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_delete = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_export = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_import = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_settings = Column(
        Boolean,
        default=False,
        nullable=False,
    )


# ============================================================
# USER PERMISSION ITEM
# ============================================================

class UserPermissionItemModel(Base):

    __tablename__ = "user_permission_items"

    __table_args__ = {
        "extend_existing": True
    }

    id = Column(
        Integer,
        primary_key=True,
    )

    user_id = Column(
        String(128),
        nullable=False,
    )

    permission_item_id = Column(
        Integer,
        ForeignKey(
            "permission_items.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    can_view = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_add = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_edit = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_delete = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_export = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_import = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    can_settings = Column(
        Boolean,
        default=False,
        nullable=False,
    )