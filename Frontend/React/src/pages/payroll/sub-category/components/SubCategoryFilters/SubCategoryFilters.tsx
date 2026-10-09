import React from 'react';

import { Search } from 'lucide-react';

import {
  SUB_CATEGORY_PAGE_SIZE_OPTIONS,
} from '../../constants/subCategory.constants';

import './SubCategoryFilters.css';

interface SubCategoryFiltersProps {
  pageSize: number;
  search: string;

  onPageSizeChange: (value: number) => void;
  onSearchChange: (value: string) => void;
}

const SubCategoryFilters: React.FC<SubCategoryFiltersProps> = ({
  pageSize,
  search,
  onPageSizeChange,
  onSearchChange,
}) => {
  return (
    <div className="sub-category-filters">
      <div className="sub-category-length-control">
        <span>Show</span>

        <select
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value))
          }
          aria-label="Entries per page"
        >
          {SUB_CATEGORY_PAGE_SIZE_OPTIONS.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>

        <span>entries</span>
      </div>

      <label className="sub-category-search">
        <Search size={14} />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search sub category..."
          aria-label="Search sub categories"
        />
      </label>
    </div>
  );
};

export default SubCategoryFilters;