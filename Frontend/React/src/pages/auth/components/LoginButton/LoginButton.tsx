/**
 * @file LoginButton.tsx
 * @description Primary login button with loading state.
 * @version 1.0.0
 */

import React from 'react';
import './LoginButton.css';

export interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({ children, ...props }) => {
  return (
    <button className="login-button" {...props}>
      {children}
    </button>
  );
};

export default LoginButton;