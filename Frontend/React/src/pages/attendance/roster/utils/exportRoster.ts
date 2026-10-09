import {
  ExportPayload,
  RosterEmployee,
  RosterShift,
  Week,
} from "../types/roster.types";

import {
  getShiftDisplayLabel,
} from "./roster.utils";

/* ============================================================
   EXPORT PAYLOAD
============================================================ */

export const prepareExportPayload = (
  employees: RosterEmployee[],
  week: Week,
): ExportPayload => {
  const formatDate =
    (
      value: Date,
    ): string =>
      value.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      );

  const weekLabel =
    `Week: ${formatDate(
      week.startDate,
    )} - ${formatDate(
      week.endDate,
    )}`;

  const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  const data =
    employees.map(
      (
        employee,
      ) => {
        const row: {
          employee: string;

          monday: string;
          tuesday: string;
          wednesday: string;
          thursday: string;
          friday: string;
          saturday: string;
          sunday: string;
        } = {
          employee:
            employee.name,

          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: "",
          sunday: "",
        };

        employee.shifts.forEach(
          (
            shift,
            index,
          ) => {
            const key =
              dayKeys[index];

            if (!key) {
              return;
            }

            row[key] =
              getShiftDisplayLabel(
                shift,
              );
          },
        );

        return row;
      },
    );

  return {
    weekLabel,
    data,
  };
};

/* ============================================================
   CSV EXPORT
============================================================ */

export const exportRosterToExcel = (
  payload: ExportPayload,
): void => {
  const header = [
    "Employee",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const rows =
    payload.data.map(
      (row) => [
        row.employee,
        row.monday,
        row.tuesday,
        row.wednesday,
        row.thursday,
        row.friday,
        row.saturday,
        row.sunday,
      ],
    );

  const escapeValue = (
    value: string,
  ): string => {
    return `"${value.replace(
      /"/g,
      '""',
    )}"`;
  };

  const csv =
    "\uFEFF" +
    [header, ...rows]
      .map(
        (row) =>
          row
            .map(
              escapeValue,
            )
            .join(","),
      )
      .join("\r\n");

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      },
    );

  const url =
    URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement(
      "a",
    );

  link.href = url;

  link.download =
    `Roster_${payload.weekLabel
      .replace(
        /[^a-zA-Z0-9]+/g,
        "_",
      )
      .replace(
        /_+$/,
        "",
      )}.csv`;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url,
  );
};