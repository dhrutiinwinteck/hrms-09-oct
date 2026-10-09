import React from 'react';

import {
  Search,
} from 'lucide-react';

import {
  AdminHoliday,
} from '../../types/adminHoliday.types';

import {
  PAGE_SIZE_OPTIONS,
} from '../../constants/adminHoliday.constants';

import {
  AdminHolidayRow,
} from '../AdminHolidayRow/AdminHolidayRow';

import {
  AdminHolidayPagination,
} from '../AdminHolidayPagination/AdminHolidayPagination';

import './AdminHolidayTable.css';

interface AdminHolidayTableProps {
  holidays: AdminHoliday[];

  loading: boolean;

  searchQuery: string;

  currentPage: number;

  pageSize: number;

  totalItems: number;

  onSearch: (
    query: string,
  ) => void;

  onPageChange: (
    page: number,
  ) => void;

  onPageSizeChange: (
    size: number,
  ) => void;

  onEdit: (
    holiday: AdminHoliday,
  ) => void;

  onDelete: (
    id: string,
  ) => void;

  onStatusToggle: (
    id: string,
  ) => void;
}

export const AdminHolidayTable: React.FC<
  AdminHolidayTableProps
> = ({
  holidays,
  loading,
  searchQuery,
  currentPage,
  pageSize,
  totalItems,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {
  return (
    <div className="admin-holiday-table-container">

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-holiday-table-toolbar">

        {/* ====================================================
            ENTRIES
        ==================================================== */}

        <div className="admin-holiday-table-entries">

          <span>
            Show
          </span>

          <select
            value={pageSize}
            onChange={(event) =>
              onPageSizeChange(
                Number(
                  event.target.value,
                ),
              )
            }
          >
            {PAGE_SIZE_OPTIONS.map(
              (size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              ),
            )}
          </select>

          <span>
            entries
          </span>

        </div>


        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="admin-holiday-table-search">

          <input
            type="text"
            value={searchQuery}
            placeholder="Search holidays..."
            onChange={(event) =>
              onSearch(
                event.target.value,
              )
            }
          />

          <Search
            size={18}
            className="admin-holiday-search-icon"
          />

        </div>

      </div>


      {/* ======================================================
          TABLE WRAPPER
      ====================================================== */}

      <div className="admin-holiday-table-wrapper">

        <table className="admin-holiday-table">

          {/* ==================================================
              TABLE HEADER
          ================================================== */}

          <thead>

            <tr>

              <th className="admin-holiday-table-header-id">
                #
              </th>

              <th className="admin-holiday-table-header-title">
                Holiday Name
              </th>

              <th className="admin-holiday-table-header-date">
                Holiday Date
              </th>

              <th className="admin-holiday-table-header-day">
                Day
              </th>

              <th className="admin-holiday-table-header-status">
                Status
              </th>

              <th className="admin-holiday-table-header-actions">
                Actions
              </th>

            </tr>

          </thead>


          {/* ==================================================
              TABLE BODY
          ================================================== */}

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={6}
                  className="admin-holiday-table-loading"
                >
                  Loading holidays...
                </td>

              </tr>

            ) : holidays.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="admin-holiday-table-empty"
                >
                  No holidays found.
                </td>

              </tr>

            ) : (

              holidays.map(
                (
                  holiday,
                  index,
                ) => (

                  <AdminHolidayRow
                    key={
                      holiday.id
                    }

                    holiday={
                      holiday
                    }

                    index={
                      (
                        currentPage -
                        1
                      ) *
                        pageSize +
                      index
                    }

                    onEdit={
                      onEdit
                    }

                    onDelete={
                      onDelete
                    }

                    onStatusToggle={
                      onStatusToggle
                    }
                  />

                ),
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="admin-holiday-table-footer">

        <div className="admin-holiday-table-info">

          {totalItems > 0 ? (

            <>
              Showing{' '}
              {
                (
                  currentPage -
                  1
                ) *
                  pageSize +
                1
              }{' '}

              to{' '}

              {
                Math.min(
                  currentPage *
                    pageSize,
                  totalItems,
                )
              }{' '}

              of{' '}

              {totalItems}{' '}
              entries
            </>

          ) : (

            'Showing 0 to 0 of 0 entries'

          )}

        </div>


        <AdminHolidayPagination
          currentPage={
            currentPage
          }

          totalItems={
            totalItems
          }

          pageSize={
            pageSize
          }

          onPageChange={
            onPageChange
          }
        />

      </div>

    </div>
  );
};

export default AdminHolidayTable;