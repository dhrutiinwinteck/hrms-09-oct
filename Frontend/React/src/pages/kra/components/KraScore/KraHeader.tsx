import React from 'react';
import {
  ChevronRight,
  Plus,
} from 'lucide-react';

import './KraHeader.css';

interface KraHeaderProps {
  onAddClick: () => void;
}

const KraHeader: React.FC<KraHeaderProps> = ({
  onAddClick,
}) => {
  return (
    <header className="kra-score-header">
      <div className="kra-score-header-left">
        <h1 className="kra-score-header-title">
          KRA
        </h1>

        <nav
          className="kra-score-breadcrumb"
          aria-label="Breadcrumb"
        >
          <span className="kra-score-breadcrumb-item">
            Home
          </span>

          <ChevronRight
            className="kra-score-breadcrumb-separator"
            aria-hidden="true"
          />

          <span
            className="
              kra-score-breadcrumb-item
              kra-score-breadcrumb-active
            "
            aria-current="page"
          >
            KRA
          </span>
        </nav>
      </div>

      <div className="kra-score-header-right">
        <button
          type="button"
          className="kra-score-add-button"
          onClick={onAddClick}
          aria-label="Add KRA Score"
        >
          <Plus
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Add KRA Score
          </span>
        </button>
      </div>
    </header>
  );
};

export default KraHeader;