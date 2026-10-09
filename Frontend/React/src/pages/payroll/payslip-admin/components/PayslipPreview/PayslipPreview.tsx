import React, {
  useEffect,
  useState,
} from 'react';

import {
  Download,
  Mail,
  Printer,
  X,
} from 'lucide-react';

import type {
  PayslipDetail,
} from '../../types/payslipAdmin.types';

import {
  formatSalary,
} from '../../utils/payslipAdmin.utils';

import {
  downloadPayslipPdf,
  sendPayslipEmail,
} from '../../services/payslipAdmin.service';

import './PayslipPreview.css';

interface PayslipPreviewProps {
  payslip: PayslipDetail | null;
  loading?: boolean;
  onClose: () => void;
}

/* ============================================================
   COMMON VALUE HELPERS
============================================================ */

const getValue = (
  value: unknown,
  fallback = '-',
): string => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback;
  }

  return String(value);
};

const getAmount = (
  value?: number | null,
): string => {
  return formatSalary(Number(value ?? 0));
};

/* ============================================================
   COMPANY LOGO URL HELPER
============================================================ */

const getCompanyLogoUrl = (
  imagePath: string | null | undefined,
): string | null => {
  if (
    !imagePath ||
    imagePath.trim() === ''
  ) {
    return null;
  }

  const originalPath = imagePath.trim();

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8001'
  ).replace(/\/+$/, '');

  /*
   * Already usable browser URLs
   */
  if (
    originalPath.startsWith('data:') ||
    originalPath.startsWith('blob:')
  ) {
    return originalPath;
  }

  /*
   * Normalize Windows path separators
   */
  let normalizedPath = originalPath.replace(
    /\\/g,
    '/',
  );

  /*
   * Handle absolute URLs
   */
  try {
    const parsedUrl = new URL(normalizedPath);

    /*
     * Replace localhost backend URL with configured API URL.
     * This is important when frontend is opened using an IP address.
     */
    if (
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '0.0.0.0'
    ) {
      return `${apiBaseUrl}${parsedUrl.pathname}${parsedUrl.search}`;
    }

    return normalizedPath;
  } catch {
    /*
     * Continue for relative and Windows file paths
     */
  }

  /*
   * Extract the public uploads path from a Windows file path.

   * Example:
   * D:/Hrms-Uat-main/Backend/FastApi/uploads/company_logo/logo.png

   * Converts to:
   * /uploads/company_logo/logo.png
   */
  const uploadsIndex = normalizedPath
    .toLowerCase()
    .indexOf('/uploads/');

  if (uploadsIndex !== -1) {
    normalizedPath = normalizedPath.substring(
      uploadsIndex,
    );
  }

  /*
   * Remove leading ./ 
   */
  normalizedPath = normalizedPath.replace(
    /^\.\//,
    '',
  );

  /*
   * If only the filename is returned, assume
   * it belongs to uploads/company_logo.
   */
  if (
    !normalizedPath.startsWith('/') &&
    !normalizedPath.startsWith('uploads/')
  ) {
    normalizedPath =
      `/uploads/company_logo/${normalizedPath}`;
  }

  /*
   * Ensure uploads paths start with /
   */
  if (
    normalizedPath.startsWith('uploads/')
  ) {
    normalizedPath = `/${normalizedPath}`;
  }

  /*
   * Return final browser-accessible URL
   */
  return `${apiBaseUrl}${normalizedPath}`;
};

/* ============================================================
   EMPLOYEE HELPERS
============================================================ */

const getEmployeeName = (
  payslip: PayslipDetail,
): string => {
  if (payslip.employee_name) {
    return payslip.employee_name;
  }

  return [
    payslip.first_name,
    payslip.last_name,
  ]
    .filter(Boolean)
    .join(' ') || '-';
};

const formatDate = (
  value?: string | null,
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN');
};

/* ============================================================
   COMPONENT
============================================================ */

export const PayslipPreview: React.FC<
  PayslipPreviewProps
> = ({
  payslip,
  loading = false,
  onClose,
}) => {
  const [
    isDownloading,
    setIsDownloading,
  ] = useState(false);

  const [
    isSendingEmail,
    setIsSendingEmail,
  ] = useState(false);

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [onClose]);

  if (!payslip) {
    return null;
  }

  const employeeName = getEmployeeName(
    payslip,
  );

  const employeeEmail =
    payslip.email?.trim();

  const companyLogoUrl =
    getCompanyLogoUrl(
      payslip.company_logo,
    );

  /* ==========================================================
     PRINT
  ========================================================== */

  const handlePrint = (): void => {
    window.print();
  };

  /* ==========================================================
     DOWNLOAD PDF
  ========================================================== */

  const handleDownload = async (): Promise<void> => {
    if (
      !payslip.id ||
      isDownloading
    ) {
      return;
    }

    try {
      setIsDownloading(true);

      const blob = await downloadPayslipPdf(
        payslip.id,
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `payslip-${payslip.emp_code ?? payslip.emp_id}-${payslip.month}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        'Failed to download payslip:',
        error,
      );

      window.alert(
        'Unable to download payslip PDF.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* ==========================================================
     SEND EMAIL
  ========================================================== */

  const handleSendEmail = async (): Promise<void> => {
    if (
      !payslip.id ||
      !employeeEmail ||
      isSendingEmail
    ) {
      return;
    }

    try {
      setIsSendingEmail(true);

      await sendPayslipEmail(
        payslip.id,
      );

      window.alert(
        `Payslip sent successfully to ${employeeEmail}.`,
      );
    } catch (error) {
      console.error(
        'Failed to send payslip email:',
        error,
      );

      window.alert(
        'Unable to send payslip email.',
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="payslip-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Payslip preview"
    >
      <div
        className="payslip-preview__backdrop"
        onClick={onClose}
      />

      <div className="payslip-preview__dialog">
        {/* ====================================================
            PREVIEW HEADER
        ==================================================== */}

        <header className="payslip-preview__toolbar">
          <div>
            <span className="payslip-preview__eyebrow">
              PAYROLL MANAGEMENT
            </span>

            <h2>
              Payslip Preview
            </h2>
          </div>

          <div className="payslip-preview__actions">
            <button
              type="button"
              className="payslip-preview__action-button"
              onClick={handlePrint}
              disabled={loading}
            >
              <Printer size={14} />

              <span>
                Print
              </span>
            </button>

            <button
              type="button"
              className="payslip-preview__action-button"
              onClick={handleDownload}
              disabled={
                loading ||
                isDownloading ||
                !payslip.id
              }
            >
              <Download size={14} />

              <span>
                {isDownloading
                  ? 'Downloading...'
                  : 'Download'}
              </span>
            </button>

            <button
              type="button"
              className="payslip-preview__action-button payslip-preview__email-button"
              onClick={handleSendEmail}
              disabled={
                loading ||
                isSendingEmail ||
                !employeeEmail
              }
              title={
                employeeEmail
                  ? `Send to ${employeeEmail}`
                  : 'Employee email is unavailable'
              }
            >
              <Mail size={14} />

              <span>
                {isSendingEmail
                  ? 'Sending...'
                  : 'Send Email'}
              </span>
            </button>

            <button
              type="button"
              className="payslip-preview__close"
              onClick={onClose}
              aria-label="Close payslip preview"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ====================================================
            PAYSLIP CONTENT
        ==================================================== */}

        <div className="payslip-preview__scroll">
          {loading ? (
            <div className="payslip-preview__loading">
              Loading payslip...
            </div>
          ) : (
            <div className="payslip-document">
              {/* ==================================================
                  COMPANY HEADER
              ================================================== */}

              <div className="payslip-document__company">
                {companyLogoUrl && (
                  <img
                    src={companyLogoUrl}
                    alt="Company logo"
                    className="payslip-document__logo"
                    onError={(event) => {
                      console.error(
                        'Company logo failed to load:',
                        companyLogoUrl,
                      );

                      event.currentTarget.style.display =
                        'none';
                    }}
                  />
                )}

                <h1>
                  {getValue(
                    payslip.company_name,
                    'Inwinteck Pvt Ltd',
                  )}
                </h1>

                <p>
                  {getValue(
                    payslip.company_address,
                  )}
                </p>

                <p>
                  {getValue(
                    payslip.company_contact,
                  )}
                </p>

                <h2>
                  PAYSLIP FOR THE MONTH OF{' '}
                  {getValue(
                    payslip.month,
                    'MONTH',
                  ).toUpperCase()}
                </h2>
              </div>

              {/* ==================================================
                  EMPLOYEE DETAILS
              ================================================== */}

              <table className="payslip-table payslip-employee-table">
                <tbody>
                  <tr>
                    <td className="payslip-label">
                      Name
                    </td>

                    <td>
                      {employeeName}
                    </td>

                    <td className="payslip-label">
                      Employee Code
                    </td>

                    <td>
                      {getValue(
                        payslip.emp_code ??
                          payslip.emp_id,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Joining Date
                    </td>

                    <td>
                      {formatDate(
                        payslip.doj,
                      )}
                    </td>

                    <td className="payslip-label">
                      Department
                    </td>

                    <td>
                      {getValue(
                        payslip.department_name ??
                          payslip.department,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Mode of Pay
                    </td>

                    <td>
                      {getValue(
                        payslip.pay_mode ??
                          payslip.mode_pay,
                      )}
                    </td>

                    <td className="payslip-label">
                      Designation
                    </td>

                    <td>
                      {getValue(
                        payslip.designation_name ??
                          payslip.designation,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Bank A/C No.
                    </td>

                    <td>
                      {getValue(
                        payslip.account_no,
                      )}
                    </td>

                    <td className="payslip-label">
                      UAN No.
                    </td>

                    <td>
                      {getValue(
                        payslip.uan,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Location
                    </td>

                    <td>
                      {getValue(
                        payslip.location,
                      )}
                    </td>

                    <td className="payslip-label">
                      ESIC No.
                    </td>

                    <td>
                      {getValue(
                        payslip.esic_no,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Aadhaar No.
                    </td>

                    <td>
                      {getValue(
                        payslip.aadhar_no,
                      )}
                    </td>

                    <td className="payslip-label">
                      PAN No.
                    </td>

                    <td>
                      {getValue(
                        payslip.pan_no,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="payslip-label">
                      Days Paid
                    </td>

                    <td>
                      {getValue(
                        payslip.day_paid,
                      )}
                    </td>

                    <td className="payslip-label">
                      LOP/Absent
                    </td>

                    <td>
                      {getValue(
                        payslip.lop_absent,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ==================================================
                  EARNINGS AND DEDUCTIONS
              ================================================== */}

              <table className="payslip-table payslip-salary-table">
                <thead>
                  <tr>
                    <th colSpan={2}>
                      Earning
                    </th>

                    <th colSpan={2}>
                      Deduction & Recoveries
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      Basic Salary
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.basic,
                      )}
                    </td>

                    <td>
                      Provident Fund (Employee)
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.pf,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      House Rent Allowance (H.R.A)
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.hra,
                      )}
                    </td>

                    <td>
                      Provident Fund (Employer)
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.pf_employer,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      City Compensatory Allowance (CCA)
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.city_compensatory_allowance,
                      )}
                    </td>

                    <td>
                      E.S.I.C
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.esic,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Special Allowance
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.special_allowance,
                      )}
                    </td>

                    <td>
                      Professional Tax
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.pt,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Other Earnings
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.other_earning,
                      )}
                    </td>

                    <td>
                      Other Deduction
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.other_deduction,
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td>
                      Night Allowance
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.night_allowance,
                      )}
                    </td>

                    <td>
                      Total Deductions
                    </td>

                    <td className="amount total-value">
                      {getAmount(
                        payslip.total_deduction,
                      )}
                    </td>
                  </tr>

                  <tr className="payslip-total-row">
                    <td>
                      Total Earnings
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.total_earnings,
                      )}
                    </td>

                    <td>
                      Net Pay
                    </td>

                    <td className="amount">
                      {getAmount(
                        payslip.net_pay,
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ==================================================
                  FINAL AMOUNT
              ================================================== */}

              <div className="payslip-net-pay">
                <span>
                  Net Payable
                </span>

                <strong>
                  {getAmount(
                    payslip.net_pay,
                  )}
                </strong>
              </div>

              <div className="payslip-amount-words">
                <strong>
                  In words:
                </strong>

                <span>
                  {getValue(
                    payslip.amount_in_words,
                  )}
                </span>
              </div>

              <p className="payslip-footer-note">
                This is a system-generated payslip
                and does not require a signature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayslipPreview;