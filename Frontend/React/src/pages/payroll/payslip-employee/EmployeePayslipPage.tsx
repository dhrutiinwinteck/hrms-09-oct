import { useMemo, useState } from 'react';

import { Download, Search } from 'lucide-react';

import { getUsername } from '../../auth/utils/authStorage';

import { useEmployeePayslip } from './hooks/useEmployeePayslip';

import './EmployeePayslipPage.css';

const EmployeePayslipPage = () => {
  // Employee code stored during login (example: IWT68)
  const employeeCode = getUsername();

  const {
    payslips,
    loading,
    error,
    downloadPdf,
  } = useEmployeePayslip(employeeCode);

  const [search, setSearch] = useState('');

  const filteredPayslips = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return payslips;
    }

    return payslips.filter((payslip) =>
      `${payslip.month ?? ''} ${
        payslip.employee_name ?? ''
      }`
        .toLowerCase()
        .includes(searchValue),
    );
  }, [payslips, search]);

  if (!employeeCode) {
    return (
      <div className="employee-payslip-page">
        <div className="employee-payslip-empty">
          Employee information not found. Please log in again.
        </div>
      </div>
    );
  }

  return (
    <div className="employee-payslip-page">
      <div className="employee-payslip-header">
        <div>
          <h1>My Payslips</h1>
          <p>
            View and download your monthly salary slips.
          </p>
        </div>
      </div>

      <div className="employee-payslip-toolbar">
        <div className="employee-payslip-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search payslip..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      {loading && (
        <div className="employee-payslip-message">
          Loading payslips...
        </div>
      )}

      {error && (
        <div className="employee-payslip-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="employee-payslip-table-wrapper">
          <table className="employee-payslip-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Salary</th>
                <th>Total Earnings</th>
                <th>Total Deduction</th>
                <th>Net Pay</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="employee-payslip-empty"
                  >
                    No payslips found.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td>{payslip.month ?? '-'}</td>

                    <td>₹{payslip.salary ?? 0}</td>

                    <td>
                      ₹{payslip.total_earnings ?? 0}
                    </td>

                    <td>
                      ₹{payslip.total_deduction ?? 0}
                    </td>

                    <td>₹{payslip.net_pay ?? 0}</td>

                    <td>
                      <button
                        type="button"
                        className="employee-payslip-download-button"
                        onClick={() =>
                          void downloadPdf(payslip.id)
                        }
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeePayslipPage;