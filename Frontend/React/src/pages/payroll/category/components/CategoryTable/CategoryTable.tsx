import React from 'react';

import type { Category } from '../../types/category.types';

import CategoryRow from '../CategoryRow/CategoryRow';

import './CategoryTable.css';

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  loading,
  onEdit,
}) => {
  return (
    <div className="category-table-scroll">
      <table className="category-table">
        <thead>
          <tr>
            <th>
              <span>Category Name</span>
              <span className="category-sort-indicator">↕</span>
            </th>

            <th>
              <span>Status</span>
            </th>

            <th className="category-action-header">
              <span>Action</span>
              <span className="category-sort-indicator">↕</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={3}
                className="category-table-message"
              >
                Loading categories...
              </td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="category-table-message"
              >
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={onEdit}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;