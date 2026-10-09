import type {
  FC,
  ReactNode,
} from "react";

import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Monitor,
  Network,
  Trash2,
  UserRound,
} from "lucide-react";

import "./DesignationTable.css";

/* =========================================
   TYPES
========================================= */

export interface DesignationTableItem {
  id: number;
  name: string;
  department: string;
  employees: number;

  icon:
    | "user"
    | "briefcase"
    | "network"
    | "monitor";

  status:
    | "Active"
    | "Inactive";
}

export interface DesignationTableProps {
  designations?: DesignationTableItem[];

  currentPage?: number;

  pageSize?: number;

  totalItems?: number;

  totalPages?: number;

  onPageChange?: (
    page: number,
  ) => void;

  onEdit?: (
    designation: DesignationTableItem,
  ) => void;

  onDelete?: (
    designation: DesignationTableItem,
  ) => void;
}

/* =========================================
   TEST DATA
========================================= */

export const TEST_DESIGNATIONS: DesignationTableItem[] = [
  {
    id: 1,
    name: "Assistant Human Resource",
    department: "Human Resource",
    employees: 12,
    icon: "user",
    status: "Active",
  },
  {
    id: 2,
    name: "Business Strategy Manager",
    department: "Operations",
    employees: 8,
    icon: "briefcase",
    status: "Active",
  },
  {
    id: 3,
    name: "Chief Executive Officer",
    department: "Top Management",
    employees: 1,
    icon: "user",
    status: "Active",
  },
  {
    id: 4,
    name: "Chief Financial Officer",
    department: "Finance",
    employees: 1,
    icon: "network",
    status: "Active",
  },
  {
    id: 5,
    name: "Software Developer",
    department: "IT",
    employees: 15,
    icon: "monitor",
    status: "Active",
  },
  {
    id: 6,
    name: "HR Executive",
    department: "Human Resource",
    employees: 6,
    icon: "user",
    status: "Active",
  },
  {
    id: 7,
    name: "Operations Manager",
    department: "Operations",
    employees: 4,
    icon: "briefcase",
    status: "Active",
  },
  {
    id: 8,
    name: "Finance Executive",
    department: "Finance",
    employees: 5,
    icon: "network",
    status: "Inactive",
  },
  {
    id: 9,
    name: "Frontend Developer",
    department: "IT",
    employees: 9,
    icon: "monitor",
    status: "Active",
  },
  {
    id: 10,
    name: "Backend Developer",
    department: "IT",
    employees: 11,
    icon: "monitor",
    status: "Active",
  },
  {
    id: 11,
    name: "Talent Acquisition Manager",
    department: "Human Resource",
    employees: 3,
    icon: "user",
    status: "Active",
  },
  {
    id: 12,
    name: "Project Manager",
    department: "Operations",
    employees: 7,
    icon: "briefcase",
    status: "Active",
  },
];

/* =========================================
   ICON HELPER
========================================= */

const getDesignationIcon = (
  type: DesignationTableItem["icon"],
): ReactNode => {
  const iconProps = {
    size: 18,
    strokeWidth: 1.7,
  };

  switch (type) {
    case "briefcase":
      return (
        <BriefcaseBusiness
          {...iconProps}
        />
      );

    case "network":
      return (
        <Network
          {...iconProps}
        />
      );

    case "monitor":
      return (
        <Monitor
          {...iconProps}
        />
      );

    case "user":
    default:
      return (
        <UserRound
          {...iconProps}
        />
      );
  }
};

/* =========================================
   COMPONENT
========================================= */

export const DesignationTable: FC<
  DesignationTableProps
> = ({
  designations = TEST_DESIGNATIONS,

  currentPage = 1,

  pageSize = 5,

  totalItems = designations.length,

  totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / pageSize,
    ),
  ),

  onPageChange,

  onEdit,

  onDelete,
}) => {
  /* =========================================
     PAGINATION
  ========================================= */

  const firstItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const lastItem = Math.min(
    currentPage * pageSize,
    totalItems,
  );

  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = (
  designation: DesignationTableItem,
): void => {
  if (!onDelete) {
    return;
  }

  onDelete(designation);
};

  /* =========================================
     RENDER
  ========================================= */

  return (
    <section
      className="designation-table"
      aria-label="Designation table"
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <div className="designation-table__header">
        <div className="designation-table__cell designation-table__cell--number">
          #
        </div>

        <div className="designation-table__cell designation-table__cell--designation">
          DESIGNATION NAME
        </div>

        <div className="designation-table__cell designation-table__cell--department">
          DEPARTMENT
        </div>

        <div className="designation-table__cell designation-table__cell--status">
          STATUS
        </div>


        <div className="designation-table__cell designation-table__cell--action">
          ACTION
        </div>
      </div>

      {/* =====================================
          BODY
      ===================================== */}

      <div className="designation-table__body">
        {designations.length > 0 ? (
          designations.map(
            (
              designation,
              index,
            ) => (
              <div
                className="designation-table__row"
                key={designation.id}
              >
                {/* NUMBER */}

                <div className="designation-table__cell designation-table__cell--number">
                  <span className="designation-table__number">
                    {String(
                      (currentPage - 1) *
                        pageSize +
                        index +
                        1,
                    ).padStart(2, "0")}
                  </span>
                </div>

                {/* DESIGNATION */}

                <div className="designation-table__cell designation-table__cell--designation">
                  <div className="designation-table__designation-wrapper">
                    <span className="designation-table__designation-icon">
                      {getDesignationIcon(
                        designation.icon,
                      )}
                    </span>

                    <span className="designation-table__designation-name">
                      {designation.name}
                    </span>
                  </div>
                </div>

                {/* DEPARTMENT */}

                <div className="designation-table__cell designation-table__cell--department">
                  <span className="designation-table__department-name">
                    {designation.department}
                  </span>
                </div>

                {/* STATUS */}

                <div className="designation-table__cell designation-table__cell--status">
                  <span
                    className={`designation-table__status designation-table__status--${designation.status.toLowerCase()}`}
                  >
                    {designation.status}
                  </span>
                </div>


                {/* ACTIONS */}

                <div className="designation-table__cell designation-table__cell--action">
                  <div className="designation-table__actions">
                    {/* EDIT */}

                    <button
                      type="button"
                      className="designation-table__action-button designation-table__action-button--edit"
                      aria-label={`Edit ${designation.name}`}
                      onClick={() =>
                        onEdit?.(
                          designation,
                        )
                      }
                    >
                      <Edit3
                        size={15}
                        strokeWidth={1.8}
                      />
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      className="designation-table__action-button designation-table__action-button--delete"
                      aria-label={`Delete ${designation.name}`}
                      onClick={() =>
                        handleDelete(
                          designation,
                        )
                      }
                    >
                      <Trash2
                        size={15}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )
        ) : (
          <div className="designation-table__empty">
            No designations found.
          </div>
        )}
      </div>

      {/* =====================================
          FOOTER
      ===================================== */}

      <div className="designation-table__footer">
        <span className="designation-table__showing">
          {totalItems === 0
            ? "Showing 0 designations"
            : `Showing ${firstItem} to ${lastItem} of ${totalItems} designations`}
        </span>

        <div
          className="designation-table__pagination"
          aria-label="Designation pagination"
        >
          {/* PREVIOUS */}

          <button
            type="button"
            className="designation-table__page-button designation-table__page-button--arrow"
            aria-label="Previous page"
            disabled={
              currentPage <= 1
            }
            onClick={() =>
              onPageChange?.(
                currentPage - 1,
              )
            }
          >
            <ChevronLeft
              size={15}
              strokeWidth={1.8}
            />
          </button>

          {/* PAGES */}

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1,
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={`designation-table__page-button ${
                page === currentPage
                  ? "designation-table__page-button--active"
                  : ""
              }`}
              aria-current={
                page === currentPage
                  ? "page"
                  : undefined
              }
              onClick={() =>
                onPageChange?.(
                  page,
                )
              }
            >
              {page}
            </button>
          ))}

          {/* NEXT */}

          <button
            type="button"
            className="designation-table__page-button designation-table__page-button--arrow"
            aria-label="Next page"
            disabled={
              currentPage >=
              totalPages
            }
            onClick={() =>
              onPageChange?.(
                currentPage + 1,
              )
            }
          >
            <ChevronRight
              size={15}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DesignationTable;