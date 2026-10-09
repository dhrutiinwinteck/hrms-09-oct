// src/pages/employees/components/EmployeeAvatar/EmployeeAvatar.tsx

import React from 'react';
import './EmployeeAvatar.css';

interface EmployeeAvatarProps {
  photo?: string;
  fullName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmployeeAvatar: React.FC<EmployeeAvatarProps> = ({
  photo,
  fullName,
  size = 'md'
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeMap = {
    sm: 28,
    md: 32,
    lg: 40
  };

  const sizePx = sizeMap[size];

  return (
    <div 
      className="employee-avatar"
      style={{ width: sizePx, height: sizePx, fontSize: sizePx * 0.4 }}
    >
      {photo ? (
        <img src={photo} alt={fullName} className="employee-avatar-image" />
      ) : (
        <span className="employee-avatar-initials">{getInitials(fullName)}</span>
      )}
    </div>
  );
};