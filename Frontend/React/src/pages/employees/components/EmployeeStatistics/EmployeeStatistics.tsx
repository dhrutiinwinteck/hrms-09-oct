import React from 'react';
import { Users, UserCheck, UserPlus, Plane } from 'lucide-react';
import './EmployeeStatistics.css';

// Reusable Wave Component
const CardWave = ({ color }: { color: string }) => (
  <div className="statistic-wave">
    <svg viewBox="0 0 500 150" preserveAspectRatio="none">
      <path
        d="M-0.56,60.69 C155.19,136.67 334.66,-33.05 502.82,100.16 L500.00,150.00 L0.00,150.00 Z"
        style={{ stroke: 'none', fill: color, opacity: 0.4 }}
      ></path>
      <path 
        d="M-0.56,60.69 C155.19,136.67 334.66,-33.05 502.82,100.16" 
        style={{ stroke: color, fill: 'none', strokeWidth: 2 }}
      ></path>
    </svg>
  </div>
);

export const EmployeeStatistics: React.FC<{ statistics: any }> = ({ statistics }) => {
  const statsConfig = [
    {
      label: 'Total Employees',
      value: statistics.total || 350,
      footer: '↑ 12 this month',
      icon: Users,
      iconBg: '#004d55', // Dark Teal
      waveColor: '#d4e4e3',
      footerColor: '#4d8a8f'
    },
    {
      label: 'Active Employees',
      value: statistics.active || 287,
      footer: '82% of total',
      icon: UserCheck,
      iconBg: '#ccaa88', // Tan
      waveColor: '#f5e6d3',
      footerColor: '#b08d6a'
    },
    {
      label: 'New Joiners (This Month)',
      value: statistics.newJoiners || 18,
      footer: '↑ 5 this month',
      icon: UserPlus,
      iconBg: '#8e9e93', // Sage
      waveColor: '#e1e9e3',
      footerColor: '#6d8576'
    },
    {
      label: 'On Leave',
      value: statistics.onLeave || 12,
      footer: 'Currently',
      icon: Plane, // Plane matches the image icon better than UserX
      iconBg: '#4e616b', // Slate
      waveColor: '#dbe2e6',
      footerColor: '#5c727d'
    }
  ];

  return (
    <div className="employee-statistics">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="statistic-card">
            <div className="statistic-content">
              <div className="statistic-icon-wrapper" style={{ backgroundColor: stat.iconBg }}>
                <Icon size={28} color="white" strokeWidth={1.5} />
              </div>
              
              <div className="statistic-info">
                <span className="statistic-label">{stat.label}</span>
                <span className="statistic-value">{stat.value}</span>
                <div className="statistic-footer-text" style={{ color: stat.footerColor }}>
                  {stat.footer}
                </div>
              </div>
            </div>
            
            {/* The decorative wave at the bottom */}
            <CardWave color={stat.waveColor} />
          </div>
        );
      })}
    </div>
  );
};