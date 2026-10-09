import React from 'react';
import { ChevronRight } from 'lucide-react';

import './KraManagementHeader.css';

const KraManagementHeader: React.FC = () => {
  return (
    <header className="kra-management-header">
      <div className="kra-management-header-left">
        <h1 className="kra-management-header-title">
          KRA Management
        </h1>

        <p className="kra-management-header-description">
          Define, manage and track Key Result Areas effectively.
        </p>
      </div>

      <nav
        className="kra-management-header-breadcrumb"
        aria-label="Breadcrumb"
      >
        <span className="kra-management-header-breadcrumb-item">
          Dashboard
        </span>

        <ChevronRight
          className="kra-management-header-breadcrumb-icon"
          size={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span
          className="kra-management-header-breadcrumb-item kra-management-header-breadcrumb-current"
          aria-current="page"
        >
          KRA Management
        </span>
      </nav>
    </header>
  );
};

export default KraManagementHeader;