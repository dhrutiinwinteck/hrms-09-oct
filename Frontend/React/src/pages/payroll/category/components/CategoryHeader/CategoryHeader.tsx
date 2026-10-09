import React from 'react';

import { Plus } from 'lucide-react';

import categoryBanner from '../../../../../assets/images/payslip/category.png';

import './CategoryHeader.css';

interface CategoryHeaderProps {
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
}) => {
  return (
    <>
      <div className="category-breadcrumb">
        <span>Dashboard</span>
        <span className="category-breadcrumb-separator">›</span>
        <strong>Category</strong>
      </div>

      <section className="category-hero">
        <img
          src={categoryBanner}
          alt=""
          className="category-hero-image"
        />

        <div className="category-hero-content">
          <span className="category-eyebrow">PAYROLL</span>

          <h1>Category</h1>

          <p>
            Manage expense categories for better organization.
          </p>
        </div>
      </section>

      <section className="category-action-bar">
        <button
          type="button"
          className="category-add-button"
          onClick={onAddCategory}
        >
          <Plus size={17} strokeWidth={2.2} />
          <span>Add Category</span>
        </button>
      </section>
    </>
  );
};

export default CategoryHeader;