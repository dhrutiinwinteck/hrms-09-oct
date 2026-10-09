import React, {
  useMemo,
} from "react";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import {
  KRAMasterEntry,
} from "../../types/kra.types";

import "./KraTable.css";

/* =========================================================
   PROPS
   ========================================================= */

interface KraTableProps {
  data: KRAMasterEntry[];

  onEdit: (
    entry: KRAMasterEntry,
  ) => void;

  onDelete: (
    id: string,
  ) => void;
}

/* =========================================================
   COMPONENT
   ========================================================= */

const KraTable: React.FC<
  KraTableProps
> = ({
  data,
  onEdit,
  onDelete,
}) => {
  /* =======================================================
     SAFE DATA
     ======================================================= */

  const safeData =
    useMemo<KRAMasterEntry[]>(
      () =>
        Array.isArray(data)
          ? data
          : [],
      [data],
    );

  /* =======================================================
     STATUS CLASS
     ======================================================= */

  const getStatusClass = (
    value:
      | string
      | null
      | undefined,
  ): string => {
    const normalizedStatus =
      String(value ?? "")
        .trim()
        .toLowerCase();

    if (!normalizedStatus) {
      return "unknown";
    }

    return normalizedStatus
      .replace(/\s+/g, "-")
      .replace(
        /[^a-z0-9-]/g,
        "",
      );
  };

  /* =======================================================
     SAFE TEXT
     ======================================================= */

  const getDisplayValue = (
    value:
      | string
      | number
      | null
      | undefined,
    fallback = "—",
  ): string => {
    if (
      value === null ||
      value === undefined
    ) {
      return fallback;
    }

    const stringValue =
      String(value).trim();

    return (
      stringValue || fallback
    );
  };

  /* =======================================================
     WEIGHTAGE
     ======================================================= */

  const getWeightage = (
    value:
      | number
      | null
      | undefined,
  ): string => {
    if (
      value === null ||
      value === undefined
    ) {
      return "0";
    }

    const numericValue =
      Number(value);

    if (
      !Number.isFinite(
        numericValue,
      )
    ) {
      return "0";
    }

    return String(
      numericValue,
    );
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = (
    id: string,
  ): void => {
    if (!id) {
      return;
    }

    onDelete(id);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="kra-table-wrapper"
      role="region"
      aria-label="KRA records"
      tabIndex={0}
    >
      <table className="kra-table">

        {/* =================================================
            EXPLICIT COLUMN WIDTHS
            ================================================= */}

        <colgroup>
          {/* SR. NO. */}
          <col className="kra-col-serial-number" />

          {/* DEPARTMENT */}
          <col className="kra-col-department" />

          {/* DESIGNATION */}
          <col className="kra-col-designation" />

          {/* FOCUSED AREA */}
          <col className="kra-col-focused-area" />

          {/* WEIGHTAGE */}
          <col className="kra-col-weightage" />

          {/* FROM */}
          <col className="kra-col-month" />

          {/* TO */}
          <col className="kra-col-month" />

          {/* YEAR */}
          <col className="kra-col-year" />

          {/* STATUS */}
          <col className="kra-col-status" />

          {/* ACTIONS */}
          <col className="kra-col-actions" />
        </colgroup>

        {/* =================================================
            HEADER
            ================================================= */}

        <thead>
          <tr>

            {/* SR. NO. */}

            <th
              scope="col"
              className="kra-table-center"
            >
              Sr.No.
            </th>

            {/* DEPARTMENT */}

            <th scope="col">
              Department
            </th>

            {/* DESIGNATION */}

            <th scope="col">
              Designation
            </th>

            {/* FOCUSED AREA */}

            <th scope="col">
              Focused Area
            </th>

            {/* WEIGHTAGE */}

            <th
              scope="col"
              className="kra-table-center"
            >
              Weightage
            </th>

            {/* FROM */}

            <th scope="col">
              From
            </th>

            {/* TO */}

            <th scope="col">
              To
            </th>

            {/* YEAR */}

            <th scope="col">
              Year
            </th>

            {/* STATUS */}

            <th
              scope="col"
              className="kra-table-center"
            >
              Status
            </th>

            {/* ACTIONS */}

            <th
              scope="col"
              className="kra-table-center"
            >
              Actions
            </th>

          </tr>
        </thead>

        {/* =================================================
            BODY
            ================================================= */}

        <tbody>
          {safeData.length > 0 ? (
            safeData.map(
              (row, index) => {
                const statusClass =
                  getStatusClass(
                    row.status,
                  );

                return (
                  <tr
                    key={row.id}
                  >

                    {/* =================================================
                        SR. NO.
                        ================================================= */}

                    <td
                      className="
                        kra-table-center
                        kra-table-serial-number
                      "
                    >
                      {index + 1}
                    </td>

                    {/* =================================================
                        DEPARTMENT
                        ================================================= */}

                    <td className="kra-table-department">
                      {getDisplayValue(
                        row.department,
                      )}
                    </td>

                    {/* =================================================
                        DESIGNATION
                        ================================================= */}

                    <td className="kra-table-designation">
                      {getDisplayValue(
                        row.designation,
                      )}
                    </td>

                    {/* =================================================
                        FOCUSED AREA
                        ================================================= */}

                    <td className="kra-table-focused-area">
                      {getDisplayValue(
                        row.focusedArea,
                      )}
                    </td>

                    {/* =================================================
                        WEIGHTAGE
                        ================================================= */}

                    <td className="kra-table-center kra-table-weightage">
                      {getWeightage(
                        row.weightage,
                      )}
                    </td>

                    {/* =================================================
                        FROM
                        ================================================= */}

                    <td className="kra-table-month">
                      {getDisplayValue(
                        row.fromMonth,
                      )}
                    </td>

                    {/* =================================================
                        TO
                        ================================================= */}

                    <td className="kra-table-month">
                      {getDisplayValue(
                        row.toMonth,
                      )}
                    </td>

                    {/* =================================================
                        YEAR
                        ================================================= */}

                    <td className="kra-table-year">
                      {getDisplayValue(
                        row.year,
                      )}
                    </td>

                    {/* =================================================
                        STATUS
                        ================================================= */}

                    <td className="kra-table-center">
                      <span
                        className={`kra-status-badge kra-status-${statusClass}`}
                      >
                        {getDisplayValue(
                          row.status,
                        )}
                      </span>
                    </td>

                    {/* =================================================
                        ACTIONS
                        ================================================= */}

                    <td className="kra-table-center kra-table-actions-cell">
                      <div className="kra-table-actions">

                        {/* EDIT */}

                        <button
                          type="button"
                          className="
                            kra-table-action-btn
                            kra-table-edit-btn
                          "
                          onClick={() =>
                            onEdit(row)
                          }
                          aria-label={`Edit KRA for ${getDisplayValue(
                            row.department,
                            "record",
                          )}`}
                          title="Edit KRA"
                        >
                          <Pencil
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="
                            kra-table-action-btn
                            kra-table-delete-btn
                          "
                          onClick={() =>
                            handleDelete(
                              row.id,
                            )
                          }
                          aria-label={`Delete KRA for ${getDisplayValue(
                            row.department,
                            "record",
                          )}`}
                          title="Delete KRA"
                        >
                          <Trash2
                            size={15}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              },
            )
          ) : (
            <tr>
              <td
                colSpan={10}
                className="kra-table-empty"
              >
                No KRA records found.
              </td>
            </tr>
          )}
        </tbody>

      </table>
    </div>
  );
};

export default KraTable;