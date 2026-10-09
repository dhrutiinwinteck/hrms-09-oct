import React from 'react';

import { Plus } from 'lucide-react';

import categoryImage from '../../../../../assets/images/payslip/category.png';

import './SubCategoryHeader.css';

interface SubCategoryHeaderProps {
  onAddSubCategory: () => void;
}

const SubCategoryHeader: React.FC<SubCategoryHeaderProps> = ({
  onAddSubCategory,
}) => {
  return (
    <>
      <div className="sub-category-breadcrumb">
        <span>Dashboard</span>
        <span className="sub-category-breadcrumb-separator">
          /
        </span>
        <strong>Sub Category</strong>
      </div>

      <section className="sub-category-hero">
        <div className="sub-category-hero-content">
          <span className="sub-category-eyebrow">
            ACCOUNTS
          </span>

          <h1>Sub Category</h1>

          <p>
            Manage sub categories to keep your expenses well organized.
          </p>
        </div>

        <div className="sub-category-hero-image">
          <img
            src={categoryImage}
            alt="Sub Category"
          />
        </div>
      </section>

      <section className="sub-category-action-bar">
        <button
          type="button"
          className="sub-category-add-button"
          onClick={onAddSubCategory}
        >
          <Plus size={17} strokeWidth={2.4} />

          <span>Add Sub Category</span>
        </button>
      </section>
    </>
  );
};

export default SubCategoryHeader;