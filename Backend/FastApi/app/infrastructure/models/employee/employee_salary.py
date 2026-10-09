# from datetime import datetime

# from sqlalchemy import DateTime, Integer, Numeric, String
# from sqlalchemy.orm import Mapped, mapped_column

# from app.infrastructure.database.base import Base


# class EmployeeSalary(Base):
#     __tablename__ = "employee_salary"

#     id: Mapped[int] = mapped_column(
#         Integer,
#         primary_key=True,
#         autoincrement=True
#     )

#     emp_id: Mapped[int] = mapped_column(
#         Integer,
#         nullable=False,
#         index=True
#     )

#     salary: Mapped[float | None] = mapped_column(
#         Numeric(12, 2),
#         nullable=True
#     )

#     mode_pay: Mapped[int | None] = mapped_column(
#         Integer,
#         nullable=True
#     )

#     uan: Mapped[str | None] = mapped_column(
#         String,
#         nullable=True
#     )

#     esic: Mapped[str | None] = mapped_column(
#         String,
#         nullable=True
#     )

#     createdby: Mapped[str | None] = mapped_column(
#         String,
#         nullable=True
#     )

#     createdon: Mapped[datetime | None] = mapped_column(
#         DateTime,
#         nullable=True
#     )

#     modifiedby: Mapped[str | None] = mapped_column(
#         String,
#         nullable=True
#     )

#     modifiedon: Mapped[datetime | None] = mapped_column(
#         DateTime,
#         nullable=True
#     )


from app.infrastructure.models.payroll.salary import SalaryModel


# Reuse the existing SQLAlchemy model.
# This prevents duplicate registration of the employee_salary table.
EmployeeSalary = SalaryModel