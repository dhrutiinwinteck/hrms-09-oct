import React from "react";

import {
  ClipboardList,
  Eye,
  Trash2,
} from "lucide-react";

import "./KraScoreTable.css";

/* =========================================================
   KRA SCORE
   ========================================================= */

/**
 * Represents one KRA score row displayed
 * in the employee KRA score table.
 */
export interface KraScore {
  id: number;

  fromMonth: string;

  toMonth: string;

  year: number;

  /**
   * Date on which the KRA score was
   * created/submitted.
   */
  kraDate?: string | null;

  /**
   * Backend normalized score.
   *
   * This value is kept for compatibility
   * with existing page logic.
   *
   * IMPORTANT:
   *
   * The Self Score column does NOT display
   * this value.
   */
  selfScore: number;

  /**
   * Actual total employee self rating.
   *
   * Example:
   *
   * 20 + 77 + 80 + 55 = 232
   */
  totalSelfRating: number;

  /**
   * Total KRA weightage.
   *
   * Example:
   *
   * 50 + 80 + 80 + 80 = 290
   */
  totalWeightage: number;
}

/* =========================================================
   PROPS
   ========================================================= */

interface KraScoreTableProps {
  data: KraScore[];

  pageSize: number;

  /**
   * Current pagination page.
   */
  currentPage?: number;

  onPageSizeChange: (
    pageSize: number,
  ) => void;

  /**
   * View existing KRA score.
   */
  onView?: (
    item: KraScore,
  ) => void;

  /**
   * Delete existing KRA score.
   */
  onDelete?: (
    item: KraScore,
  ) => void;
}

/* =========================================================
   DATE FORMATTER
   ========================================================= */

/**
 * Formats KRA date for display.
 *
 * Supported API examples:
 *
 * 2026-08-26
 * 2026-08-26T10:30:00
 * 2026-08-26T10:30:00.000Z
 *
 * Output:
 *
 * 26/08/2026
 */
const formatKraDate = (
  kraDate?: string | null,
): string => {
  if (!kraDate) {
    return "—";
  }

  const trimmedDate =
    kraDate.trim();

  if (!trimmedDate) {
    return "—";
  }

  /*
   * Handle ISO date strings directly.
   *
   * This prevents timezone-related
   * date shifting.
   */
  const isoDateMatch =
    trimmedDate.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (isoDateMatch) {
    const [
      ,
      year,
      month,
      day,
    ] = isoDateMatch;

    return `${day}/${month}/${year}`;
  }

  /*
   * Fallback for other valid
   * date formats.
   */
  const parsedDate =
    new Date(
      trimmedDate,
    );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "—";
  }

  const day =
    String(
      parsedDate.getDate(),
    ).padStart(2, "0");

  const month =
    String(
      parsedDate.getMonth() + 1,
    ).padStart(2, "0");

  const year =
    parsedDate.getFullYear();

  return `${day}/${month}/${year}`;
};

/* =========================================================
   SCORE CLASS
   ========================================================= */

/**
 * Determines the visual class for the
 * Self Score badge.
 *
 * IMPORTANT:
 *
 * The percentage is calculated internally
 * only for styling.
 *
 * It is NEVER displayed in the UI.
 *
 * Example:
 *
 * 232 / 290
 *
 * will be styled according to its
 * score ratio, but the user sees only:
 *
 * 232 / 290
 */
const getScoreClass = (
  totalSelfRating: number,
  totalWeightage: number,
): string => {
  if (
    !Number.isFinite(
      totalSelfRating,
    ) ||
    !Number.isFinite(
      totalWeightage,
    ) ||
    totalWeightage <= 0
  ) {
    return "kra-score-badge--poor";
  }

  const scoreRatio =
    totalSelfRating /
    totalWeightage;

  if (
    scoreRatio >= 0.7
  ) {
    return "kra-score-badge--good";
  }

  if (
    scoreRatio >= 0.5
  ) {
    return "kra-score-badge--average";
  }

  return "kra-score-badge--poor";
};

/* =========================================================
   SCORE FORMATTER
   ========================================================= */

/**
 * Formats raw marks without adding
 * any percentage or /100 text.
 *
 * Examples:
 *
 * 232      -> "232"
 * 232.5    -> "232.5"
 * 232.00   -> "232"
 */
const formatScore = (
  value: number,
): string => {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return "0";
  }

  return Number(
    value.toFixed(2),
  ).toString();
};

/* =========================================================
   COMPONENT
   ========================================================= */

const KraScoreTable: React.FC<
  KraScoreTableProps
> = ({
  data,
  pageSize,
  currentPage = 1,
  onPageSizeChange,
  onView,
  onDelete,
}) => {
  /* =======================================================
     PAGE SIZE
     ======================================================= */

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    const value =
      Number(
        event.target.value,
      );

    if (
      !Number.isInteger(
        value,
      ) ||
      value <= 0
    ) {
      return;
    }

    onPageSizeChange(value);
  };

  /* =======================================================
     SERIAL NUMBER
     ======================================================= */

  /**
   * Example:
   *
   * page 1 + pageSize 5:
   *
   * 1, 2, 3, 4, 5
   *
   * page 2 + pageSize 5:
   *
   * 6, 7, 8, 9, 10
   */
  const getSerialNumber = (
    index: number,
  ): number => {
    const safePage =
      Number.isInteger(
        currentPage,
      ) &&
      currentPage > 0
        ? currentPage
        : 1;

    const safePageSize =
      Number.isInteger(
        pageSize,
      ) &&
      pageSize > 0
        ? pageSize
        : data.length || 1;

    return (
      (safePage - 1) *
        safePageSize +
      index +
      1
    );
  };

  /* =======================================================
     ACTION VISIBILITY
     ======================================================= */

  const hasActions =
    Boolean(
      onView || onDelete,
    );

  /* =======================================================
     COLUMN COUNT
     ======================================================= */

  const columnCount =
    hasActions ? 7 : 6;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section
      className="kra-score-table-card"
      aria-labelledby="kra-score-list-title"
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="kra-score-table-header">
        <div className="kra-score-table-title-wrapper">
          <ClipboardList
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <h2
            id="kra-score-list-title"
            className="kra-score-table-title"
          >
            KRA Score List
          </h2>
        </div>

        <div className="kra-score-entries-control">
          <label htmlFor="kra-page-size">
            Show
          </label>

          <select
            id="kra-page-size"
            value={pageSize}
            onChange={
              handlePageSizeChange
            }
            aria-label="Number of entries per page"
          >
            <option value={5}>
              5
            </option>

            <option value={10}>
              10
            </option>

            <option value={20}>
              20
            </option>
          </select>

          <span>
            entries
          </span>
        </div>
      </div>

      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="kra-score-table-wrapper">
        <table className="kra-score-table">
          <colgroup>
            <col className="kra-column-serial" />

            <col className="kra-column-month" />

            <col className="kra-column-month" />

            <col className="kra-column-year" />

            <col className="kra-column-score" />

            <col className="kra-column-date" />

            {hasActions && (
              <col className="kra-column-action" />
            )}
          </colgroup>

          {/* =================================================
              TABLE HEADER
              ================================================= */}

          <thead>
            <tr>
              <th
                scope="col"
                className="kra-serial-column"
              >
                S.No.
              </th>

              <th scope="col">
                From Month
              </th>

              <th scope="col">
                To Month
              </th>

              <th scope="col">
                Year
              </th>

              <th scope="col">
                Self Score
              </th>

              <th scope="col">
                KRA Date
              </th>

              {hasActions && (
                <th
                  scope="col"
                  className="kra-action-column"
                >
                  Action
                </th>
              )}
            </tr>
          </thead>

          {/* =================================================
              TABLE BODY
              ================================================= */}

          <tbody>
            {data.length > 0 ? (
              data.map(
                (
                  item,
                  index,
                ) => {
                  /*
                   * Convert values safely because
                   * API data can sometimes contain
                   * numeric strings.
                   */
                  const totalSelfRating =
                    Number(
                      item.totalSelfRating ??
                        0,
                    );

                  const totalWeightage =
                    Number(
                      item.totalWeightage ??
                        0,
                    );

                  /*
                   * Visual class only.
                   *
                   * No percentage is displayed.
                   */
                  const scoreClass =
                    getScoreClass(
                      totalSelfRating,
                      totalWeightage,
                    );

                  return (
                    <tr
                      key={
                        item.id
                      }
                    >
                      {/* =====================================
                          S.NO.
                          ===================================== */}

                      <td className="kra-serial-cell">
                        {getSerialNumber(
                          index,
                        )}
                      </td>

                      {/* =====================================
                          FROM MONTH
                          ===================================== */}

                      <td>
                        {
                          item.fromMonth
                        }
                      </td>

                      {/* =====================================
                          TO MONTH
                          ===================================== */}

                      <td>
                        {
                          item.toMonth
                        }
                      </td>

                      {/* =====================================
                          YEAR
                          ===================================== */}

                      <td>
                        {
                          item.year
                        }
                      </td>

                      {/* =====================================
                          SELF SCORE
                          ===================================== */}

                      <td>
                        <span
                          className={`kra-score-badge ${scoreClass}`}
                        >
                          {formatScore(
                            totalSelfRating,
                          )}

                          {" / "}

                          {formatScore(
                            totalWeightage,
                          )}
                        </span>
                      </td>

                      {/* =====================================
                          KRA DATE
                          ===================================== */}

                      <td>
                        <span className="kra-score-date">
                          {formatKraDate(
                            item.kraDate,
                          )}
                        </span>
                      </td>

                      {/* =====================================
                          ACTIONS
                          ===================================== */}

                      {hasActions && (
                        <td className="kra-action-cell">
                          <div className="kra-score-actions">
                            {/* VIEW */}

                            {onView && (
                              <button
                                type="button"
                                className="kra-score-action-btn kra-score-action-btn--view"
                                aria-label={`View KRA score for ${item.fromMonth} to ${item.toMonth} ${item.year}`}
                                title="View KRA Score"
                                onClick={() =>
                                  onView(
                                    item,
                                  )
                                }
                              >
                                <Eye
                                  size={
                                    15
                                  }
                                  strokeWidth={
                                    1.8
                                  }
                                  aria-hidden="true"
                                />
                              </button>
                            )}

                            {/* DELETE */}

                            {onDelete && (
                              <button
                                type="button"
                                className="kra-score-action-btn kra-score-action-btn--delete"
                                aria-label={`Delete KRA score for ${item.fromMonth} to ${item.toMonth} ${item.year}`}
                                title="Delete KRA Score"
                                onClick={() =>
                                  onDelete(
                                    item,
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    15
                                  }
                                  strokeWidth={
                                    1.8
                                  }
                                  aria-hidden="true"
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                },
              )
            ) : (
              <tr>
                <td
                  colSpan={
                    columnCount
                  }
                  className="kra-score-empty"
                >
                  No KRA scores found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default KraScoreTable;