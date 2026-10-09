from datetime import datetime

from app.domain.interfaces.dashboard.dashboard_interface import (
    IDashboardRepository
)


class DashboardService:

    def __init__(
        self,
        repo: IDashboardRepository
    ):
        self.repo = repo

    def get_dashboard_summary(self):

        now = datetime.now()

        today_date = now.date()

        # Fetch data via Repository

        total_emp = (
            self.repo.get_total_active_employees()
        )

        present_count = (
            self.repo.get_present_today_count(
                today_date
            )
        )

        leave_count = (
            self.repo.get_on_leave_today_count(
                today_date
            )
        )

        birthdays = (
            self.repo.get_birthdays_today(
                now.month,
                now.day
            )
        )

        # Mapping Domain Models to DTO format

        birthday_list = [
            {
                "emp_code": e.emp_code,
                "full_name": (
                    f"{e.first_name} {e.last_name}"
                ),
                "photo": e.photo
            }
            for e in birthdays
        ]

        return {
            "total_employees": total_emp,
            "present_today": present_count,
            "on_leave_today": leave_count,
            "birthdays_today": birthday_list,
            "server_time": now
        }