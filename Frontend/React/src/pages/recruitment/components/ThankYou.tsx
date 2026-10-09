import React from 'react';

import logoImage from '@/assets/images/Inwinteck_logo.png';

import './ThankYou.css';

const ThankYou: React.FC = () => {
  const handleBackToHome = (): void => {
    window.location.href = '/';
  };

  return (
    <div className="thank-you-page">
      <div className="thank-you-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="thank-you-header">
          <div className="thank-you-brand">

            <img
              src={logoImage}
              alt="Inwinteck"
              className="thank-you-logo"
            />

            <div className="thank-you-brand-text">
              <h1>INWINTECK</h1>

              <p>
                Innovative, Accountable, Decent.
              </p>
            </div>

          </div>
        </header>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <main className="thank-you-content">

          {/* SUCCESS ICON */}

          <div
            className="thank-you-icon"
            role="img"
            aria-label="Application submitted successfully"
          >
            <span>✓</span>
          </div>

          {/* TITLE */}

          <h2>
            Thank You!
          </h2>

          {/* PRIMARY MESSAGE */}

          <p className="thank-you-primary-message">
            Your job application has been submitted successfully.
          </p>

          {/* SECONDARY MESSAGE */}

          <p className="thank-you-secondary-message">
            We appreciate your interest in joining Inwinteck.
            Our recruitment team will review your application
            and contact you if your profile is shortlisted.
          </p>

          {/* ====================================================
              STATUS CARD
          ==================================================== */}

          <div className="thank-you-status-card">

            <div className="thank-you-status-item">

              <span className="thank-you-status-check">
                ✓
              </span>

              <span>
                Application submitted successfully
              </span>

            </div>

            <div className="thank-you-status-item">

              <span className="thank-you-status-check">
                ✓
              </span>

              <span>
                Your information has been received
              </span>

            </div>

            <div className="thank-you-status-item">

              <span className="thank-you-status-check">
                ✓
              </span>

              <span>
                Our recruitment team will review your profile
              </span>

            </div>

          </div>

          {/* ====================================================
              HOME BUTTON
          ==================================================== */}

          <button
            type="button"
            className="thank-you-home-button"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>

        </main>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="thank-you-footer">

          <p className="thank-you-security">
            Your information is secure and will not be shared
            with third parties.
          </p>

          <div className="thank-you-footer-bottom">

            <p>
              © {new Date().getFullYear()} Inwinteck.
              All rights reserved.
            </p>

            <nav
              className="thank-you-links"
              aria-label="Footer links"
            >

              <a href="/privacy-policy">
                Privacy Policy
              </a>

              <span>|</span>

              <a href="/terms-of-service">
                Terms of Service
              </a>

              <span>|</span>

              <a href="/support">
                Support
              </a>

            </nav>

          </div>

        </footer>

      </div>
    </div>
  );
};

export default ThankYou;