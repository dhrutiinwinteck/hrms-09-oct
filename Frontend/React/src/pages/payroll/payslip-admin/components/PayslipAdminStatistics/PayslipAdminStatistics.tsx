import React from 'react';

import {
  PAYSLIP_FEATURES,
} from '../../constants/payslipAdmin.constants';

import {
  PayslipAdminStatCard,
} from '../PayslipAdminStatCard/PayslipAdminStatCard';

import './PayslipAdminStatistics.css';

export const PayslipAdminStatistics: React.FC = () => {
  return (
    <div className="payslip-admin-statistics">
      {PAYSLIP_FEATURES.map((feature) => (
        <PayslipAdminStatCard
          key={feature.title}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
        />
      ))}
    </div>
  );
};