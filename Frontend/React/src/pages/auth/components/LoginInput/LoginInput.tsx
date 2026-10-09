/**
 * @file LoginInput.tsx
 * @description Reusable input component with icon and optional password toggle.
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import './LoginInput.css';

export interface LoginInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: 'user' | 'lock';
}

const LoginInput: React.FC<LoginInputProps> = ({
  icon,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword && showPassword ? 'text' : type;

  const IconComponent = icon === 'user' ? User : Lock;

  return (
    <div className="login-input__wrapper">
      <div className="login-input__icon">
        <IconComponent size={20} strokeWidth={2} />
      </div>
      <input
        className="login-input__field"
        type={inputType}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          className="login-input__toggle"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

export default LoginInput;