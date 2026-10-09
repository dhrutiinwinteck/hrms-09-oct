from fastapi import APIRouter

# Import your routers
# AUTH
# ============================================================

from app.presentation.api.v1.auth.auth import (
    router as auth_router,
)


# ============================================================
# EMPLOYEE
# ============================================================

from app.presentation.api.v1.employee.employees import (
    router as employees_router,
)

from app.presentation.api.v1.employee.employee_personal import (
    router as personal_details_router,
)


from app.presentation.api.v1.employee.department import (
    router as dept_api_router,
)

from app.presentation.api.v1.employee.designation import (
    router as desg_api_router,
)


# ============================================================
# ATTENDANCE
# ============================================================

from app.presentation.api.v1.attendance.attendance import (
    router as attendance_router,
)

from app.presentation.api.v1.attendance.attendance_report import (
    router as attendance_report_router,
)
# ============================================================
# DASHBOARD
# ============================================================

from app.presentation.api.v1.dashboard.dashboard import (
    router as dashboard_router,
)


# ============================================================
# RECRUITMENT
# ============================================================

from app.presentation.api.v1.recruitment.application_invitations import (
    router as application_invitations_router,
)

from app.presentation.api.v1.recruitment import (
    job_applications,
)

from app.presentation.api.v1.recruitment.offer_letter import (
    router as offer_letter_router,
)

# ============================================================
# ONBOARDING
# ============================================================

from app.presentation.api.v1.onboarding.joining_approvals import (
    router as joining_approvals_router,
)

from app.presentation.api.v1.onboarding.joining_forms import (
    router as joining_forms_router,
)


# ============================================================
# LEAVE
# ============================================================

from app.presentation.api.v1.leave.leaves import (
    router as leaves_router,
)

from app.presentation.api.v1.leave.comp_off import (
    router as comp_off_router,
)

# ============================================================
# HOLIDAY
# ============================================================

from app.presentation.api.v1.holiday.holiday import (
    router as holiday_router,
)


# ============================================================
# PERFORMANCE
# ============================================================

from app.presentation.api.v1.performance.performance import (
    router as performance_router,
)


# ============================================================
# PAYROLL
# ============================================================

from app.presentation.api.v1.payroll.payroll import (
    router as payroll_router,
)


# ============================================================
# PERMISSIONS
# ============================================================

# Permission API is temporarily excluded because
# app/presentation/api/v1/permission/permissions.py
# currently contains incorrect/missing Permission router code.
#
# DO NOT import perms_api_router until the Permission API
# file is corrected.
#
# from app.presentation.api.v1.permission.permissions import (
#     router as perms_api_router,
# )


# ============================================================
# RESIGNATION
# ============================================================

from app.presentation.api.v1.resignation.resignation import (
    router as resignation_router,
)


# ============================================================
# ROSTER
# ============================================================

from app.presentation.api.v1.roster.roster import (
    router as roster_router,
)


# ============================================================
# SHIFTS
# ============================================================

from app.presentation.api.v1.shifts.shift_patterns import (
    router as shift_patterns_router,
)

from app.presentation.api.v1.shifts.shift_assignments import (
    router as shift_assignments_router,
)

from app.presentation.api.v1.shifts.shift_swaps import (
    router as shift_swaps_router,
)

from app.presentation.api.v1.policy import (
    router as policy_router,
)


from app.presentation.api.v1.kra.kra_master import (
    router as kra_master_router,
)

from app.presentation.api.v1.kra.kra_manager import (
    router as kra_manager_router,
)

from app.presentation.api.v1.kra.kra_score import (
    router as kra_score_router,
)

from app.presentation.api.v1.referral.referrals import router as referrals_router

from app.presentation.api.v1.payroll.payslips import (
    router as payslip_router
)

from app.presentation.api.v1.expenses.expenses import (
    router as expenses_router,
)

from app.presentation.api.v1.payroll.payroll_settings import (
    router as payroll_settings_router,
)

from app.presentation.api.v1.payroll.monthly_salary import (
    router as monthly_salary_router,
)

from app.presentation.api.v1.employee.employee_educationinfo import (
    router as education_info_router,
)

from app.presentation.api.v1.employee.employee_bank import (
    router as employee_bank_router,
)

from app.presentation.api.v1.employee.employee_emergencycontact import (
    router as employee_emergencycontact_router,
)

from app.presentation.api.v1.employee.employee_experienceinfo import (
    router as employee_experience_router,
)

from app.presentation.api.v1.employee.employee_familyinfo import (
    router as employee_familyinfo_router,
)

from app.presentation.api.v1.employee.employee_salary import (
    router as employee_salary_router,
)



from app.presentation.api.v1.permission.permissions import (
    router as perms_api_router,
)

from app.presentation.api.v1.recruitment.letter_of_intent import (
    router as letter_of_intent_router,

)

from app.presentation.api.v1.onboarding.onboarding_documents import (
    router as onboarding_documents_router,
)

# ============================================================
# MAIN API ROUTER
# ============================================================

api_router = APIRouter()


# ============================================================
# AUTHENTICATION
# ============================================================

api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# EMPLOYEES
# ============================================================

api_router.include_router(
    employees_router,
    prefix="/employees",
    tags=["Employees"],
)


# ADD THIS BLOCK:
api_router.include_router(
    personal_details_router,
    # The prefix "/personal-details" is already defined inside the router file
    tags=["Employee Personal Details"], 
)

api_router.include_router(
    education_info_router,
    tags=["Employee Education Information"],
)

api_router.include_router(employee_bank_router)

api_router.include_router(
    employee_emergencycontact_router,
)

api_router.include_router(
    employee_experience_router,
    tags=["Employee Experience Information"],
)

api_router.include_router(
    employee_familyinfo_router,
)

api_router.include_router(employee_salary_router)



# ============================================================
# ATTENDANCE REPORTS
# ============================================================

api_router.include_router(
    attendance_report_router,
    prefix="/attendance/reports",
    tags=["Attendance Reports"],
)



# ============================================================
# ATTENDANCE
# ============================================================

api_router.include_router(
    attendance_router,
    prefix="/attendance",
    tags=["Attendance"],
)





# ============================================================
# LEAVES
# ============================================================

api_router.include_router(
    leaves_router,
    prefix="/leaves",
    tags=["Leaves"],
)

api_router.include_router(
    comp_off_router,
    prefix="/leaves",
    tags=["Comp Off"],
)


# ============================================================
# PAYROLL
# ============================================================

api_router.include_router(
    payroll_router,
    prefix="/payroll",
    tags=["Payroll"],
)

api_router.include_router(
    payslip_router,
    prefix="/payslips",
    tags=["Payslips"]
)

api_router.include_router(
    expenses_router,
)

api_router.include_router(
    payroll_settings_router,
)

api_router.include_router(
    monthly_salary_router,
    prefix="/payroll",
    tags=["Monthly Salary"],
)


# ============================================================
# PERFORMANCE
# ============================================================

api_router.include_router(
    performance_router,
    prefix="/performance",
    tags=["Performance & KRA"],
)


# ============================================================
# SALARY MANAGEMENT
# ============================================================

# Salary API will be added after verifying the migrated
# salary API file.
#
# Do not add a guessed import here.


# ============================================================
# DASHBOARD
# ============================================================

api_router.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# DEPARTMENTS
# ============================================================

api_router.include_router(
    dept_api_router,
    prefix="/departments",
    tags=["Departments"],
)


# ============================================================
# DESIGNATIONS
# ============================================================

api_router.include_router(
    desg_api_router,
    prefix="/designations",
    tags=["Designations"],
)


# ============================================================
# HOLIDAYS
# ============================================================

api_router.include_router(
    holiday_router,
    prefix="/holidays",
    tags=["Holidays"],
)


# ============================================================
# RESIGNATION
# ============================================================

api_router.include_router(
    resignation_router,
    prefix="/resignation",
    tags=["Resignation"],
)


# ============================================================
# PERMISSIONS
# ============================================================

# TEMPORARILY DISABLED
#
# The Permission API file currently does not contain
# a valid `router` object.
#
# This will be enabled after permissions.py is corrected.
#
# api_router.include_router(
#     perms_api_router,
#     prefix="/permissions",
#     tags=["Permission Management"],
# )


# ============================================================
# SHIFT PATTERNS
# ============================================================

api_router.include_router(
    shift_patterns_router,
    prefix="/shift-patterns",
    tags=["Shift Patterns"],
)


# ============================================================
# SHIFT ASSIGNMENTS
# ============================================================

api_router.include_router(
    shift_assignments_router,
    prefix="/shift-assignments",
    tags=["Shift Assignments"],
)


# ============================================================
# SHIFT SWAPS
# ============================================================

api_router.include_router(
    shift_swaps_router,
    tags=["Shift Swaps"],
)


# ============================================================
# ROSTER
# ============================================================

api_router.include_router(
    roster_router,
    tags=["Roster"],
)


# ============================================================
# APPLICATION INVITATIONS
# ============================================================

api_router.include_router(
    application_invitations_router,
    prefix="/api/v1",
    tags=["Application Invitations"],
)


# ============================================================
# OFFER LETTERS
# ============================================================

api_router.include_router(
    offer_letter_router,
)


# ============================================================
# LETTER OF INTENT
# ============================================================

api_router.include_router(
    letter_of_intent_router,
)

# ============================================================
# JOB APPLICATIONS
# ============================================================

api_router.include_router(
    job_applications.router,
    
    tags=["Job Applications"],
)


# ============================================================
# JOINING APPROVALS
# ============================================================

api_router.include_router(
    joining_approvals_router,
    tags=["Joining Approvals"],
)


api_router.include_router(onboarding_documents_router)


# ============================================================
# JOINING FORMS
# ============================================================

api_router.include_router(
    joining_forms_router,
    tags=["Joining Forms"],
)

# ============================================================
# Policy Management
# ============================================================

api_router.include_router(
    policy_router,
    prefix="/policies",
    tags=["Policy Management"],
)

# ==========================================================
# REFERRALS
# ==========================================================

api_router.include_router(
    referrals_router,
)
# ============================================================
# KRA Master
# ============================================================

api_router.include_router(
    kra_master_router,
    prefix="/performance",
    tags=["KRA MASTER"],
)

# ============================================================
# KRA Manager
# ============================================================

api_router.include_router(
    kra_manager_router,
    prefix="/performance",
    tags=["KRA MANAGER"],
)

# ============================================================
# KRA Score
# ============================================================

api_router.include_router(
    kra_score_router,
    prefix="/performance/score",
    tags=["KRA SCORE"],
)



# ============================================================
# PERMISSIONS
# ============================================================

api_router.include_router(
    perms_api_router,
    prefix="/permissions",
    tags=["Permissions"],
)