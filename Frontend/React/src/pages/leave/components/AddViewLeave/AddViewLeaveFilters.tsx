import React, { ChangeEvent } from "react";
import {
  Filter,
  List,
  Search,
} from "lucide-react";

import "./AddViewLeaveFilters.css";

interface AddViewLeaveFiltersProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
}

const AddViewLeaveFilters: React.FC<AddViewLeaveFiltersProps> = ({
  searchValue = "",
  onSearchChange,
  onFilterClick,
}) => {
  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    onSearchChange?.(event.target.value);
  };

  const handleFilterClick = (): void => {
    onFilterClick?.();
  };

  return (
    <div className="add-view-leave-filters">
      <div className="add-view-leave-filters__heading">
        <div
          className="add-view-leave-filters__heading-icon"
          aria-hidden="true"
        >
          <List size={19} strokeWidth={2.3} />
        </div>

        <h2 className="add-view-leave-filters__title">
          Employee Leave Balances
        </h2>
      </div>

      <div className="add-view-leave-filters__actions">
        <div className="add-view-leave-filters__search">
          <Search
            className="add-view-leave-filters__search-icon"
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />

          <input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search employee..."
            aria-label="Search employee"
          />
        </div>

        <button
          type="button"
          className="add-view-leave-filters__filter-button"
          onClick={handleFilterClick}
        >
          <Filter size={17} strokeWidth={2} />

          <span>Filter</span>
        </button>
      </div>
    </div>
  );
};

export default AddViewLeaveFilters;