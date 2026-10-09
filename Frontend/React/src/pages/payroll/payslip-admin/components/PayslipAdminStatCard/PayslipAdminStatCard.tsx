import React from 'react';

import {
  Clock3,
  ShieldCheck,
  Users,
} from 'lucide-react';

import './PayslipAdminStatCard.css';

type PayslipStatIcon =
  | 'users'
  | 'clock'
  | 'shield';

interface PayslipAdminStatCardProps {
  title: string;
  description: string;
  icon: PayslipStatIcon;
}

export const PayslipAdminStatCard: React.FC<
  PayslipAdminStatCardProps
> = ({
  title,
  description,
  icon,
}) => {
  const renderIcon = () => {
    if (icon === 'users') {
      return <Users size={20} />;
    }

    if (icon === 'clock') {
      return <Clock3 size={20} />;
    }

    return <ShieldCheck size={20} />;
  };

  return (
    <div className="payslip-admin-stat-card">
      <div className="payslip-admin-stat-card__icon">
        {renderIcon()}
      </div>

      <div className="payslip-admin-stat-card__content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
};