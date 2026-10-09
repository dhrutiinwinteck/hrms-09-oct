import React, { useMemo } from 'react';

import {
  Target,
  CircleCheck,
  UserRound,
  CalendarCheck2,
} from 'lucide-react';

import type {
  KraManagementRecord,
} from './KraManagementTable';

import './KraManagementSummary.css';

/* =========================================================
   TYPES
   ========================================================= */

type SummaryCardVariant =
  | 'primary'
  | 'warning'
  | 'employee'
  | 'year';

interface SummaryCard {
  id: string;
  title: string;
  value: number;
  badge: string;
  icon: React.ReactNode;
  variant: SummaryCardVariant;
}

interface KraManagementSummaryProps {
  data?: KraManagementRecord[];
}

/* =========================================================
   COMPONENT
   ========================================================= */

const KraManagementSummary: React.FC<
  KraManagementSummaryProps
> = ({
  data = [],
}) => {
  /* =======================================================
     SAFE DATA

     Even if API/parent accidentally passes undefined,
     component will never crash.
     ======================================================= */

  const safeData = useMemo<KraManagementRecord[]>(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  /* =======================================================
     CURRENT YEAR
     ======================================================= */

  const currentYear = new Date().getFullYear();

  /* =======================================================
     CALCULATE SUMMARY FROM TABLE DATA
     ======================================================= */

  const summaryData = useMemo(() => {
    /* -----------------------------------------------------
       TOTAL KRA RECORDS
       ----------------------------------------------------- */

    const totalKras = safeData.length;

    /* -----------------------------------------------------
       ACTIVE KRAs

       Current table model does not contain a status field,
       therefore every available KRA is treated as active.

       Once backend provides status, replace this with:
       safeData.filter(record => record.status === 'Active')
       ----------------------------------------------------- */

    const activeKras = safeData.length;

    /* -----------------------------------------------------
       UNIQUE EMPLOYEES
       ----------------------------------------------------- */

    const uniqueEmployeeNames = safeData
      .map((record) => record.employeeName)
      .filter(
        (employeeName): employeeName is string =>
          typeof employeeName === 'string' &&
          employeeName.trim().length > 0,
      )
      .map((employeeName) =>
        employeeName.trim().toLowerCase(),
      );

    const employees = new Set(
      uniqueEmployeeNames,
    ).size;

    /* -----------------------------------------------------
       KRAs CREATED IN CURRENT YEAR
       ----------------------------------------------------- */

    const krasThisYear = safeData.filter(
      (record) =>
        Number(record.year) === currentYear,
    ).length;

    return {
      totalKras,
      activeKras,
      employees,
      krasThisYear,
    };
  }, [safeData, currentYear]);

  /* =======================================================
     SUMMARY CARDS
     ======================================================= */

  const summaryCards = useMemo<SummaryCard[]>(
    () => [
      {
        id: 'total-kras',
        title: 'Total KRAs',
        value: summaryData.totalKras,
        badge: 'All time',

        icon: (
          <Target
            size={29}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ),

        variant: 'primary',
      },

      {
        id: 'active-kras',
        title: 'Active KRAs',
        value: summaryData.activeKras,
        badge: 'Active records',

        icon: (
          <CircleCheck
            size={29}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ),

        variant: 'warning',
      },

      {
        id: 'employees',
        title: 'Employees',
        value: summaryData.employees,
        badge: 'Assigned KRAs',

        icon: (
          <UserRound
            size={29}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ),

        variant: 'employee',
      },

      {
        id: 'kras-this-year',
        title: 'KRAs This Year',
        value: summaryData.krasThisYear,
        badge: `Created in ${currentYear}`,

        icon: (
          <CalendarCheck2
            size={29}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ),

        variant: 'year',
      },
    ],
    [
      summaryData.totalKras,
      summaryData.activeKras,
      summaryData.employees,
      summaryData.krasThisYear,
      currentYear,
    ],
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      className="kra-management-summary"
      aria-label="KRA management summary"
    >
      {summaryCards.map((card) => (
        <article
          key={card.id}
          className={`kra-management-summary-card kra-management-summary-card--${card.variant}`}
        >
          {/* =============================================
              CARD CONTENT
              ============================================= */}

          <div className="kra-management-summary-card-content">
            {/* ICON */}

            <div
              className="kra-management-summary-icon"
              aria-hidden="true"
            >
              {card.icon}
            </div>

            {/* INFORMATION */}

            <div className="kra-management-summary-info">
              <span className="kra-management-summary-title">
                {card.title}
              </span>

              <strong className="kra-management-summary-value">
                {card.value}
              </strong>

              <span className="kra-management-summary-badge">
                {card.badge}
              </span>
            </div>
          </div>

          {/* =============================================
              DECORATIVE WAVE
              ============================================= */}

          <div
            className="kra-management-summary-wave"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 400 48"
              preserveAspectRatio="none"
              focusable="false"
            >
              <path
                className="kra-management-summary-wave-fill"
                d="
                  M0,37
                  C28,38 37,29 59,31
                  C80,34 91,35 112,27
                  C135,18 149,20 171,27
                  C194,34 216,31 238,20
                  C260,9 275,13 296,25
                  C316,36 332,28 350,18
                  C368,8 381,13 400,22
                  L400,48
                  L0,48
                  Z
                "
              />

              <path
                className="kra-management-summary-wave-line"
                d="
                  M0,37
                  C28,38 37,29 59,31
                  C80,34 91,35 112,27
                  C135,18 149,20 171,27
                  C194,34 216,31 238,20
                  C260,9 275,13 296,25
                  C316,36 332,28 350,18
                  C368,8 381,13 400,22
                "
              />
            </svg>
          </div>
        </article>
      ))}
    </section>
  );
};

export default KraManagementSummary;