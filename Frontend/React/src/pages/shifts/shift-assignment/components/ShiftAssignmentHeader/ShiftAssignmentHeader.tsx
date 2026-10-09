// src/pages/shifts/shift-assignment/components/ShiftAssignmentHeader/ShiftAssignmentHeader.tsx

import React from 'react';
import { CalendarDays } from 'lucide-react';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './ShiftAssignmentHeader.css';

export interface ShiftAssignmentHeaderProps {
    title: string;
    subtitle: string;
    breadcrumbItems: Array<{ label: string; path?: string; isActive?: boolean }>;
}

const ShiftAssignmentHeader: React.FC<ShiftAssignmentHeaderProps> = ({
    title,
    subtitle,
    breadcrumbItems,
}) => {
    return (
        <header className="sa-header">
            <div className="sa-header__left">
                <div className="sa-header__icon-wrapper">
                    <CalendarDays size={24} className="sa-header__icon" />
                </div>
                <div className="sa-header__content">
                    <h1 className="sa-header__title">{title}</h1>
                    <p className="sa-header__subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="sa-header__right">
                <Breadcrumb items={breadcrumbItems} />
            </div>
        </header>
    );
};

export default ShiftAssignmentHeader;