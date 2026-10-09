/**
 * Button Component
 * Reusable button with multiple variants and sizes
 */

import React from 'react';
import './Button';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    isLoading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" aria-hidden="true">
          <span className="spinner-dot"></span>
          <span className="spinner-dot"></span>
          <span className="spinner-dot"></span>
        </span>
      )}
      {leftIcon && !isLoading && (
        <span className="btn-icon btn-icon-left">{leftIcon}</span>
      )}
      <span className="btn-text">{children}</span>
      {rightIcon && !isLoading && (
        <span className="btn-icon btn-icon-right">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;