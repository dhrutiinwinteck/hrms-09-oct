import React from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  ShieldCheck,
} from "lucide-react";

import "./AdminPolicyHeader.css";

interface AdminPolicyHeaderProps {
  onAddPolicy?: () => void;
}

const AdminPolicyHeader: React.FC<AdminPolicyHeaderProps> = ({
  onAddPolicy,
}) => {
  return (
    <header className="admin-policy-header">
      {/* Decorative background */}
      <div
        className="admin-policy-header__decoration"
        aria-hidden="true"
      >
        <span className="admin-policy-header__wave admin-policy-header__wave--1" />
        <span className="admin-policy-header__wave admin-policy-header__wave--2" />
      </div>

      {/* Left Content */}
      <div className="admin-policy-header__left">
        <div className="admin-policy-header__title-row">
          <div
            className="admin-policy-header__title-icon"
            aria-hidden="true"
          >
            <ShieldCheck size={22} strokeWidth={2} />
          </div>

          <h1 className="admin-policy-header__title">
            Policy Management
          </h1>
        </div>

        <p className="admin-policy-header__subtitle">
          Create, organize and manage all company policies in one place.
        </p>
      </div>

      {/* Right Content */}
      <div className="admin-policy-header__right">
        <nav
          className="admin-policy-header__breadcrumb"
          aria-label="Breadcrumb"
        >
          <span className="admin-policy-header__breadcrumb-item">
            Dashboard
          </span>

          <ChevronRight
            className="admin-policy-header__breadcrumb-arrow"
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span className="admin-policy-header__breadcrumb-item admin-policy-header__breadcrumb-item--current">
            Policy Management
          </span>
        </nav>

        <div
          className="admin-policy-header__document"
          aria-hidden="true"
        >
          <div className="admin-policy-header__document-paper">
            <span className="admin-policy-header__paper-fold" />

            <FileText
              className="admin-policy-header__file-icon"
              size={31}
              strokeWidth={1.4}
            />
          </div>

          <div className="admin-policy-header__document-shield">
            <ShieldCheck size={22} strokeWidth={1.8} />
          </div>
        </div>

        <button
          type="button"
          className="admin-policy-header__add-button"
          onClick={onAddPolicy}
        >
          <Plus
            className="admin-policy-header__add-icon"
            size={20}
            strokeWidth={2}
          />

          <span>Add Policy</span>

          <ChevronDown
            className="admin-policy-header__button-arrow"
            size={17}
            strokeWidth={2}
          />
        </button>
      </div>
    </header>
  );
};

export default AdminPolicyHeader;