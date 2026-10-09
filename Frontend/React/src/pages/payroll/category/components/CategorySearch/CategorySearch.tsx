import React from 'react';

import { Search } from 'lucide-react';

import './CategorySearch.css';

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
}

const CategorySearch: React.FC<CategorySearchProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="category-search-wrapper">
      <Search size={14} />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search category..."
        aria-label="Search category"
      />
    </div>
  );
};

export default CategorySearch;