/**
 * @file RememberMe.tsx
 * @description Remember me checkbox component.
 * @version 1.0.0
 */

import React from 'react';
import { Check } from 'lucide-react';
import './RememberMe.css';

export interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const RememberMe: React.FC<RememberMeProps> = ({ checked, onChange }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <label className="remember-me">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        className="remember-me__input"
      />
      <span className="remember-me__custom-checkbox">
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="remember-me__label">Remember me</span>
    </label>
  );
};

export default RememberMe;