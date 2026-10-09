import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LockKeyhole,
} from 'lucide-react';

import {
  PayslipAdminHeader,
} from './components/PayslipAdminHeader/PayslipAdminHeader';

import {
  PayslipAdminFilters,
} from './components/PayslipAdminFilters/PayslipAdminFilters';

import {
  PayslipAdminTable,
} from './components/PayslipAdminTable/PayslipAdminTable';

import {
  PayslipPreview,
} from './components/PayslipPreview/PayslipPreview';

import {
  AddSalaryPfModal,
} from './components/AddSalaryPfModal/AddSalaryPfModal';

import {
  usePayslipAdmin,
} from './hooks/usePayslipAdmin';

import {
  generatePayslip,
  getPayslipById,
} from './services/payslipAdmin.service';

import {
  usePayslipFilters,
} from './hooks/usePayslipFilters';

import type {
  PayslipRecord,
  PayslipDetail,
} from './types/payslipAdmin.types';

import {
  getShowingEnd,
  getShowingStart,
} from './utils/payslipAdmin.utils';

import './PayslipAdminPage.css';

type AddSalaryFormData = Parameters<
  NonNullable<
    React.ComponentProps<
      typeof AddSalaryPfModal
    >['onCreate']
  >
>[0];

export const PayslipAdminPage: React.FC = () => {
  // ============================================================
  // PAYSLIP DATA
  // ============================================================

  const {
    payslips,
    isLoading,
    error,
    reload,
  } = usePayslipAdmin();

  // ============================================================
  // FILTERS + PAGINATION
  // ============================================================

  const {
    filters,
    filteredPayslips,
    paginatedPayslips,
    currentPage,
    totalPages,
    setSearch,
    setPageSize,
    setPage,
  } = usePayslipFilters(payslips);

  // ============================================================
  // SELECTED PAYSLIP DETAIL
  // ============================================================

  const [
    selectedPayslip,
    setSelectedPayslip,
  ] = useState<PayslipDetail | null>(null);

  const [
    isPreviewLoading,
    setIsPreviewLoading,
  ] = useState(false);

  // ============================================================
  // ADD SALARY MODAL
  // ============================================================

  const [
    isAddSalaryPfOpen,
    setIsAddSalaryPfOpen,
  ] = useState(false);

  // ============================================================
  // TABLE DISPLAY RANGE
  // ============================================================

  const showingStart = useMemo(
    () =>
      getShowingStart(
        filteredPayslips.length,
        currentPage,
        filters.pageSize,
      ),
    [
      currentPage,
      filteredPayslips.length,
      filters.pageSize,
    ],
  );

  const showingEnd = useMemo(
    () =>
      getShowingEnd(
        filteredPayslips.length,
        currentPage,
        filters.pageSize,
      ),
    [
      currentPage,
      filteredPayslips.length,
      filters.pageSize,
    ],
  );

  // ============================================================
  // VIEW PAYSLIP
  // ============================================================

  const handlePreview = useCallback(
    async (payslip: PayslipRecord) => {
      try {
        setIsPreviewLoading(true);

        // Clear previous payslip details
        setSelectedPayslip(null);

        // Fetch complete payslip details from backend
        const response = await getPayslipById(
          payslip.id,
        );

        setSelectedPayslip(response);
      } catch (previewError) {
        console.error(
          'Failed to fetch payslip details:',
          previewError,
        );

        alert(
          'Unable to load payslip details.',
        );
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [],
  );

  // ============================================================
  // OPEN/CLOSE ADD SALARY MODAL
  // ============================================================

  const handleOpenAddSalaryPf = useCallback(() => {
    setIsAddSalaryPfOpen(true);
  }, []);

  const handleCloseAddSalaryPf = useCallback(() => {
    setIsAddSalaryPfOpen(false);
  }, []);

  // ============================================================
  // CLOSE PAYSLIP PREVIEW
  // ============================================================

  const handleClosePreview = useCallback(() => {
    setSelectedPayslip(null);
  }, []);

  // ============================================================
  // GENERATE PAYSLIP
  // ============================================================

  const handleGeneratePayslip = useCallback(
    async (data: AddSalaryFormData) => {
      try {
        const formData = data as unknown as Record<
          string,
          unknown
        >;

        const employeeValue =
          formData.employeeId ??
          formData.employee_id ??
          formData.emp_id ??
          formData.employee;

        const monthValue = formData.month;

        const employeeId = Number(
          typeof employeeValue === 'object' &&
          employeeValue !== null
            ? (
                employeeValue as {
                  id?: number | string;
                }
              ).id
            : employeeValue,
        );

        if (!employeeId || employeeId <= 0) {
          alert(
            'Please select a valid employee.',
          );

          return;
        }

        if (
          typeof monthValue !== 'string' ||
          !monthValue
        ) {
          alert(
            'Please select a month.',
          );

          return;
        }

        const monthDate = new Date(monthValue);

        const month = Number.isNaN(
          monthDate.getTime(),
        )
          ? monthValue
          : `${monthDate.getFullYear()}-${String(
              monthDate.getMonth() + 1,
            ).padStart(2, '0')}-01`;

        await generatePayslip({
          emp_id: employeeId,
          month,
        });

        await reload();

        handleCloseAddSalaryPf();

        alert(
          'Payslip generated successfully.',
        );
      } catch (generateError) {
        console.error(
          'Generate payslip error:',
          generateError,
        );

        alert(
          generateError instanceof Error
            ? generateError.message
            : 'Unable to generate payslip.',
        );
      }
    },
    [
      reload,
      handleCloseAddSalaryPf,
    ],
  );

  return (
    <main className="payslip-admin-page">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <PayslipAdminHeader
        onAddSalaryPf={handleOpenAddSalaryPf}
      />

      {/* ========================================================
          PAYSLIP DATA CARD
      ======================================================== */}

      <section className="payslip-admin-page__data-card">
        {error && (
          <div
            className="payslip-admin-page__error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <PayslipAdminFilters
          pageSize={filters.pageSize}
          search={filters.search}
          onPageSizeChange={setPageSize}
          onSearchChange={setSearch}
        />

        {/* ======================================================
            TABLE
        ====================================================== */}

        <PayslipAdminTable
          payslips={paginatedPayslips}
          isLoading={isLoading}
          onPreview={handlePreview}
        />

        {/* ======================================================
            TABLE FOOTER + PAGINATION
        ====================================================== */}

        <div className="payslip-admin-page__table-footer">
          <span className="payslip-admin-page__entries-info">
            Showing {showingStart} to {showingEnd} of{' '}
            {filteredPayslips.length} entries
          </span>

          <div
            className="payslip-admin-page__pagination"
            aria-label="Payslip pagination"
          >
            {/* FIRST PAGE */}

            <button
              type="button"
              className="payslip-admin-page__pagination-button"
              onClick={() => setPage(1)}
              disabled={
                currentPage === 1 ||
                filteredPayslips.length === 0
              }
              aria-label="First page"
            >
              <ChevronsLeft size={13} />
            </button>

            {/* PREVIOUS PAGE */}

            <button
              type="button"
              className="payslip-admin-page__pagination-button"
              onClick={() =>
                setPage(currentPage - 1)
              }
              disabled={
                currentPage === 1 ||
                filteredPayslips.length === 0
              }
              aria-label="Previous page"
            >
              <ChevronLeft size={13} />
            </button>

            {/* CURRENT PAGE */}

            <button
              type="button"
              className="payslip-admin-page__pagination-button payslip-admin-page__pagination-button--active"
              aria-current="page"
            >
              {currentPage}
            </button>

            {/* NEXT PAGE */}

            <button
              type="button"
              className="payslip-admin-page__pagination-button"
              onClick={() =>
                setPage(currentPage + 1)
              }
              disabled={
                currentPage >= totalPages
              }
              aria-label="Next page"
            >
              <ChevronRight size={13} />
            </button>

            {/* LAST PAGE */}

            <button
              type="button"
              className="payslip-admin-page__pagination-button"
              onClick={() =>
                setPage(totalPages)
              }
              disabled={
                currentPage >= totalPages ||
                filteredPayslips.length === 0
              }
              aria-label="Last page"
            >
              <ChevronsRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          INFORMATION CARDS
      ======================================================== */}

      <section className="payslip-admin-page__info-section">
        {/* GENERATE PAYSLIPS CARD */}

        <article className="payslip-admin-page__info-card payslip-admin-page__info-card--ease">
          <div className="payslip-admin-page__info-icon">
            <Calculator size={29} />
          </div>

          <div className="payslip-admin-page__info-content">
            <h3>
              Generate Payslips with Ease
            </h3>

            <p>
              Add salary details and generate
              payslips for your employees in
              just a few clicks.
            </p>
          </div>
        </article>

        {/* SECURITY CARD */}

        <article className="payslip-admin-page__info-card payslip-admin-page__info-card--secure">
          <div className="payslip-admin-page__info-icon">
            <LockKeyhole size={29} />
          </div>

          <div className="payslip-admin-page__info-content">
            <h3>
              Secure &amp; Confidential
            </h3>

            <p>
              Employee salary information is
              encrypted and secure at all times.
            </p>
          </div>
        </article>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}

      <footer className="payslip-admin-page__footer">
        <span>
          © 2026 Inwinteck HRMS. All rights reserved.
        </span>

        <div className="payslip-admin-page__footer-right">
          <span>Help</span>

          <span className="payslip-admin-page__footer-divider">
            |
          </span>

          <span>Privacy</span>

          <span className="payslip-admin-page__footer-divider">
            |
          </span>

          <span>Terms</span>
        </div>
      </footer>

      {/* ========================================================
          PAYSLIP PREVIEW MODAL
      ======================================================== */}

      {isPreviewLoading && (
        <div
          className="payslip-admin-page__preview-loading"
          role="status"
        >
          Loading payslip...
        </div>
      )}

      {selectedPayslip && (
        <PayslipPreview
          payslip={selectedPayslip}
          loading={isPreviewLoading}
          onClose={handleClosePreview}
        />
      )}

      {/* ========================================================
          ADD SALARY (PF) MODAL
      ======================================================== */}

      <AddSalaryPfModal
        isOpen={isAddSalaryPfOpen}
        onClose={handleCloseAddSalaryPf}
        onCreate={handleGeneratePayslip}
      />
    </main>
  );
};

export default PayslipAdminPage;