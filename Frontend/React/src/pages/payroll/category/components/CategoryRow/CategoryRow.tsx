import React from 'react';

import { Pencil } from 'lucide-react';

import type { Category } from '../../types/category.types';

import './CategoryRow.css';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
}) => {
  return (
    <tr className="category-table-row">
      <td className="category-name-cell">
        {category.categoryName}
      </td>

      <td>
        <span
          className={`category-status-badge ${
            category.status === 'Active'
              ? 'category-status-active'
              : 'category-status-inactive'
          }`}
        >
          {category.status}
        </span>
      </td>

      <td className="category-action-cell">
        <button
          type="button"
          className="category-edit-button"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.categoryName}`}
          title="Edit category"
        >
          <Pencil size={16} strokeWidth={2.1} />
        </button>
      </td>
    </tr>
  );
};

export default CategoryRow;