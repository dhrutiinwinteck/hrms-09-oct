import React from 'react';

import {
  ArrowDownUp,
  LoaderCircle,
} from 'lucide-react';

import type { SubCategory } from '../../types/subCategory.types';

import SubCategoryRow from '../SubCategoryRow/SubCategoryRow';

import './SubCategoryTable.css';

interface SubCategoryTableProps {
  data: SubCategory[];
  loading: boolean;
  hasSearch: boolean;

  updatingStatusId: number | null;

  onToggleStatus: (
    id: number,
  ) => Promise<void>;
}

const SubCategoryTable: React.FC<
  SubCategoryTableProps
> = ({
  data,
  loading,
  hasSearch,
  updatingStatusId,
  onToggleStatus,
}) => {
  return (
    <div className="sub-category-table-wrapper">
      <table className="sub-category-table">
        <thead>
          <tr>
            <th>Sub Category Name</th>

            <th>Status</th>

            <th>
              <span className="sub-category-action-header">
                Action

                <ArrowDownUp size={10} />
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={3}
                className="sub-category-table-state"
              >
                <LoaderCircle
                  size={17}
                  className="sub-category-loader"
                />

                <span>
                  Loading sub categories...
                </span>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item) => (
              <SubCategoryRow
                key={item.id}
                subCategory={item}
                updatingStatusId={updatingStatusId}
                onToggleStatus={onToggleStatus}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={3}
                className="sub-category-table-state"
              >
                {hasSearch
                  ? 'No sub categories match your search.'
                  : 'No sub categories found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubCategoryTable;