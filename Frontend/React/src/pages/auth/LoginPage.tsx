/**
 * @file LoginPage.tsx
 * @description Login page container combining left panel and login form.
 * @version 1.0.0
 */

import React from 'react';
import LoginLeftPanel from './components/LoginLeftPanel/LoginLeftPanel';
import LoginForm from './components/LoginForm/LoginForm';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="login-page__container">
        <LoginLeftPanel />
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;