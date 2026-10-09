import React from 'react';
import { ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="policy-breadcrumb" aria-label="Breadcrumb">
      <ol className="policy-breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li
                className={`policy-breadcrumb-item ${
                  isLast ? 'policy-breadcrumb-item-active' : ''
                }`}
              >
                {item.onClick && !isLast ? (
                  <button
                    type="button"
                    className="policy-breadcrumb-link"
                    onClick={item.onClick}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>

              {!isLast && (
                <li
                  className="policy-breadcrumb-separator"
                  aria-hidden="true"
                >
                  <ChevronRight size={14} strokeWidth={1.8} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;