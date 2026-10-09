# app/infrastructure/models/__init__.py

# User
from app.infrastructure.models.user.user import UserModel

# Employee
from app.infrastructure.models.employee.employee import EmployeeModel
from app.infrastructure.models.employee.department import DepartmentModel
from app.infrastructure.models.employee.designation import DesignationModel
from app.infrastructure.models.employee.bank import BankModel
from app.infrastructure.models.employee.employee_shift import EmployeeShift

# Attendance
from app.infrastructure.models.attendance.timesheet import TimesheetModel
from app.infrastructure.models.attendance.timesheet_log import TimesheetLogModel

# Recruitment
from app.infrastructure.models.recruitment.application_invitation import (
    ApplicationInvitation,
)
from app.infrastructure.models.recruitment.job_application import (
    JobApplication,
)
from app.infrastructure.models.recruitment.job_application_education import (
    JobApplicationEducation,
)
from app.infrastructure.models.recruitment.job_application_emergency_contact import (
    JobApplicationEmergencyContact,
)
from app.infrastructure.models.recruitment.job_application_reference import (
    JobApplicationReference,
)
from app.infrastructure.models.recruitment.job_application_work_experience import (
    JobApplicationWorkExperience,
)

# Onboarding
from app.infrastructure.models.onboarding.joining_approval import (
    JoiningApproval,
)
from app.infrastructure.models.onboarding.joining_form import (
    JoiningForm,
)
from app.infrastructure.models.onboarding.joining_form_document import (
    JoiningFormDocument,
)
from app.infrastructure.models.onboarding.joining_form_education import (
    JoiningFormEducation,
)
from app.infrastructure.models.onboarding.joining_form_reference import (
    JoiningFormReference,
)
from app.infrastructure.models.onboarding.joining_form_work_experience import (
    JoiningFormWorkExperience,
)

# Performance
from app.infrastructure.models.performance.kra_master import (
    KraMasterNew,
)
from app.infrastructure.models.performance.kra_score import (
    KraScoreNew,
)
from app.infrastructure.models.performance.kra_log import (
    KraScoreLogNew,
)

# Leave
from app.infrastructure.models.leave.leave_balance import (
    LeaveBalanceModel,
)
from app.infrastructure.models.leave.leave_log import (
    LeaveLogModel,
)

# Holiday
from app.infrastructure.models.holiday.holiday import (
    HolidayModel,
)

# Payroll
from app.infrastructure.models.payroll.payroll_setting import (
    PayrollSettingModel,
)
from app.infrastructure.models.payroll.payslip import (
    PayslipModel,
)
from app.infrastructure.models.payroll.salary import (
    SalaryModel,
)

# Permission
from app.infrastructure.models.permission.permissions import (
    RolePermissionModel,
)
from app.infrastructure.models.permission.permission_model import (
    RolePermissionModel,
    UserPermissionModel,
)

# Resignation
from app.infrastructure.models.resignation.resignation import (
    ResignationModel,
)

# Roster
from app.infrastructure.models.roster.shift_date import (
    ShiftDateModel,
)

# Shifts
from app.infrastructure.models.shifts.shift_pattern import (
    ShiftPatternModel,
)
from app.infrastructure.models.shifts.shift_swap import (
    ShiftSwapModel,
)

# Permission
# Permission

from app.infrastructure.models.permission.permission_model import (
    RolePermissionModel,
    UserPermissionModel,
    PermissionItemModel,
    RolePermissionItemModel,
    UserPermissionItemModel,
)