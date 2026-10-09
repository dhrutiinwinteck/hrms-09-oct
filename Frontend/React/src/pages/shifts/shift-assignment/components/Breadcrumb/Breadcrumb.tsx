// src/pages/shifts/shift-assignment/components/Breadcrumb/Breadcrumb.tsx

import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    isActive?: boolean;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, separator = '>' }) => {
    return (
        <nav className="sa-breadcrumb" aria-label="Breadcrumb">
            <ol className="sa-breadcrumb__list">
                {items.map((item, index) => (
                    <li
                        key={index}
                        className={`sa-breadcrumb__item ${item.isActive ? 'sa-breadcrumb__item--active' : ''}`}
                    >
                        {index > 0 && <span className="sa-breadcrumb__separator">{separator}</span>}
                        {item.path ? (
                            <a href={item.path} className="sa-breadcrumb__link">
                                {item.label}
                            </a>
                        ) : (
                            <span className="sa-breadcrumb__text">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;