import React from 'react';

import {
  Pencil,
  Power,
  LoaderCircle,
} from 'lucide-react';

import type { SubCategory } from '../../types/subCategory.types';

import './SubCategoryRow.css';

interface SubCategoryRowProps {
  subCategory: SubCategory;

  updatingStatusId: number | null;

  onToggleStatus: (
    id: number,
  ) => Promise<void>;
}

const SubCategoryRow: React.FC<
  SubCategoryRowProps
> = ({
  subCategory,
  updatingStatusId,
  onToggleStatus,
}) => {
  const isUpdating =
    updatingStatusId === subCategory.id;

  const handleToggleStatus = async () => {
    if (isUpdating) {
      return;
    }

    await onToggleStatus(subCategory.id);
  };

  return (
    <tr className="sub-category-table-row">
      {/* Sub Category Name */}
      <td className="sub-category-name-cell">
        {subCategory.name}
      </td>

      {/* Status */}
      <td>
        <button
          type="button"
          className={`sub-category-status-badge ${
            subCategory.status.toLowerCase()
          }`}
          onClick={handleToggleStatus}
          disabled={isUpdating}
          title={
            subCategory.status === 'Active'
              ? 'Deactivate sub category'
              : 'Activate sub category'
          }
          aria-label={`Change status of ${subCategory.name}`}
        >
          {isUpdating ? (
            <LoaderCircle
              size={12}
              className="sub-category-status-loader"
            />
          ) : (
            subCategory.status
          )}
        </button>
      </td>

      {/* Actions */}
      <td className="sub-category-action-cell">
        <button
          type="button"
          className="sub-category-edit-button"
          aria-label={`Edit ${subCategory.name}`}
          title={`Edit ${subCategory.name}`}
        >
          <Pencil size={13} />
        </button>

        <button
          type="button"
          className={`sub-category-toggle-button ${
            subCategory.status.toLowerCase()
          }`}
          onClick={handleToggleStatus}
          disabled={isUpdating}
          aria-label={
            subCategory.status === 'Active'
              ? `Deactivate ${subCategory.name}`
              : `Activate ${subCategory.name}`
          }
          title={
            subCategory.status === 'Active'
              ? 'Deactivate'
              : 'Activate'
          }
        >
          {isUpdating ? (
            <LoaderCircle
              size={13}
              className="sub-category-status-loader"
            />
          ) : (
            <Power size={13} />
          )}
        </button>
      </td>
    </tr>
  );
};

export default SubCategoryRow;