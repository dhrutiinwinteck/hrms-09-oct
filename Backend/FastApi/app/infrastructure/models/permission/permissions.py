"""
Legacy permission model compatibility module.

The existing application imports RolePermissionModel
from this file.

The actual permission models are maintained in
permission_model.py.
"""

from app.infrastructure.models.permission.permission_model import (
    RolePermissionModel,
    UserPermissionModel,
    PermissionItemModel,
    RolePermissionItemModel,
    UserPermissionItemModel,
)


__all__ = [
    "RolePermissionModel",
    "UserPermissionModel",
    "PermissionItemModel",
    "RolePermissionItemModel",
    "UserPermissionItemModel",
]