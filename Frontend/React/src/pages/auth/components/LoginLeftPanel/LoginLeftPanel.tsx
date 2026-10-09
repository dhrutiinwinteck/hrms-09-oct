/**
 * @file LoginLeftPanel.tsx
 * @description Left panel with background image, overlay, brand info, and stats card.
 * @version 1.0.0
 */

import React from 'react';
import './LoginLeftPanel.css';
// Import the login image (adjust extension if needed)
import loginImage from '@/assets/images/login/login.png';

const LoginLeftPanel: React.FC = () => {
  return (
    <div className="login-left-panel">
      <div
        className="login-left-panel__image"
        style={{ backgroundImage: `url(${loginImage})` }}
      >
        <div className="login-left-panel__overlay">
          {/* Top left brand */}
          <div className="login-left-panel__brand">
            <span className="login-left-panel__brand-name">HRMS</span>
            <div className="login-left-panel__brand-line" />
          </div>

          {/* Main heading and subtitle */}
          <div className="login-left-panel__content">
            <h1 className="login-left-panel__heading">
              Empowering organizations
              <br />
              through seamless
              <br />
              HR management
            </h1>
            <p className="login-left-panel__subtitle">
              Efficient. Reliable. Secure.
            </p>
          </div>

          {/* Stats card floating at bottom */}
          {/* <div className="login-left-panel__stats">
            <div className="login-left-panel__stats-item">
              <span className="login-left-panel__stats-number">20K+</span>
              <span className="login-left-panel__stats-label">Employees</span>
            </div>
            <div className="login-left-panel__stats-divider" />
            <div className="login-left-panel__stats-item">
              <span className="login-left-panel__stats-number">500+</span>
              <span className="login-left-panel__stats-label">Companies</span>
            </div>
            <div className="login-left-panel__stats-divider" />
            <div className="login-left-panel__stats-item">
              <span className="login-left-panel__stats-number">99.9%</span>
              <span className="login-left-panel__stats-label">Uptime</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginLeftPanel;