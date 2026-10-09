import React from 'react';

import {
  Search,
} from 'lucide-react';

import './JoiningApprovalSearch.css';

interface SearchProps {
  value: string;

  onChange: (value: string) => void;

  placeholder?: string;
}

export const JoiningApprovalSearch: React.FC<
  SearchProps
> = ({
  value,
  onChange,
  placeholder = 'Search candidate...',
}) => {
  return (
    <div className="joining-approval-search">

      <Search
        size={18}
        className="search-icon"
        aria-hidden="true"
      />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label="Search candidate"
      />

    </div>
  );
};