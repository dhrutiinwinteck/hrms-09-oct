import React from 'react';

import {
  Clock3,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';

import payslipImage from '../../../../../assets/images/payslip/payslip.png';

import './PayslipAdminHeader.css';

interface PayslipAdminHeaderProps {
  onAddSalary?: () => void;
  onAddSalaryPf?: () => void;
}

export const PayslipAdminHeader: React.FC<
  PayslipAdminHeaderProps
> = ({
  onAddSalary,
  onAddSalaryPf,
}) => {
  return (
    <section className="payslip-admin-header">
      <div className="payslip-admin-header__content">
        <div className="payslip-admin-header__breadcrumb">
          <span>Dashboard</span>
          <span className="payslip-admin-header__breadcrumb-separator">
            ›
          </span>
          <span>Payroll</span>
          <span className="payslip-admin-header__breadcrumb-separator">
            ›
          </span>
          <strong>Payslip</strong>
        </div>

        <div className="payslip-admin-header__main">
          <div className="payslip-admin-header__left">
            <div className="payslip-admin-header__title-row">
              <div className="payslip-admin-header__icon-box">
                <FileText
                  size={42}
                  strokeWidth={1.8}
                />

                <span className="payslip-admin-header__rupee">
                  ₹
                </span>
              </div>

              <div className="payslip-admin-header__title-content">
                <span className="payslip-admin-header__eyebrow">
                  P A Y R O L L
                </span>

                <h1 className="payslip-admin-header__title">
                  Payslip
                </h1>

                <p className="payslip-admin-header__description">
                  Manage and generate employee payslips
                </p>
              </div>
            </div>

            <div className="payslip-admin-header__features">
              <div className="payslip-admin-header__feature">
                <div className="payslip-admin-header__feature-icon">
                  <Users size={21} />
                </div>

                <div>
                  <strong>Accurate Records</strong>
                  <span>Secure &amp; reliable</span>
                </div>
              </div>

              <div className="payslip-admin-header__feature">
                <div className="payslip-admin-header__feature-icon">
                  <Clock3 size={21} />
                </div>

                <div>
                  <strong>Time Saving</strong>
                  <span>Generate in seconds</span>
                </div>
              </div>

              <div className="payslip-admin-header__feature">
                <div className="payslip-admin-header__feature-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>Employee Friendly</strong>
                  <span>Easy access to payslips</span>
                </div>
              </div>
            </div>
          </div>

          <div className="payslip-admin-header__illustration">
            <img
              src={payslipImage}
              alt="Payslip"
              className="payslip-admin-header__illustration-image"
            />

            <div className="payslip-admin-header__illustration-copy">
              Simpler
              <br />
              Payroll
              <br />
              Brighter People.
              <span />
            </div>
          </div>
        </div>
      </div>

      <div className="payslip-admin-header__actions">
        <button
          type="button"
          className="payslip-admin-header__salary-button payslip-admin-header__salary-button--pf"
          onClick={onAddSalaryPf}
        >
          <span>+</span>
          Add Salary (PF)
        </button>

        <button
          type="button"
          className="payslip-admin-header__salary-button payslip-admin-header__salary-button--regular"
          onClick={onAddSalary}
        >
          <span>+</span>
          Add Salary
        </button>
      </div>
    </section>
  );
};