from abc import ABC, abstractmethod


class PayslipInterface(ABC):

    @abstractmethod
    async def get_full_payslip(
        self,
        payslip_id: int,
    ):
        pass

    @abstractmethod
    async def generate_pdf(
        self,
        payslip_id: int,
    ):
        pass

    @abstractmethod
    async def send_email(
        self,
        payslip_id: int,
    ):
        pass

    @abstractmethod
    async def delete(
        self,
        payslip_id: int,
    ):
        pass

    @abstractmethod
    async def get_payroll_setting(self):
        pass

    @abstractmethod
    async def update_payroll_setting(
        self,
        values: dict,
    ):
        pass