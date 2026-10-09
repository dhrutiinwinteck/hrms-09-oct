import React from "react";
import { useNavigate } from "react-router-dom";

import "./SendApplicationFormHeader.css";

const SendApplicationFormHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeNavigation = (): void => {
    navigate("/dashboard/home");
  };

  const handleRecruitmentNavigation = (): void => {
    navigate("/recruitment");
  };

  return (
    <section className="send-application-form-header">
      <div className="send-application-form-header__top">
        <nav
          className="send-application-form-header__breadcrumb"
          aria-label="Breadcrumb"
        >
          <button
            type="button"
            className="send-application-form-header__breadcrumb-link"
            onClick={handleHomeNavigation}
          >
            Home
          </button>

          <span
            className="send-application-form-header__separator"
            aria-hidden="true"
          >
            ›
          </span>

          <button
            type="button"
            className="send-application-form-header__breadcrumb-link"
            onClick={handleRecruitmentNavigation}
          >
            Recruitment
          </button>

          <span
            className="send-application-form-header__separator"
            aria-hidden="true"
          >
            ›
          </span>

          <span className="send-application-form-header__breadcrumb-current">
            Send Join Form
          </span>
        </nav>
      </div>

      <div className="send-application-form-header__content">
        <h1 className="send-application-form-header__title">
          Send Join Form
        </h1>

        <p className="send-application-form-header__description">
          Invite a candidate by sending the join form link to their email.
        </p>
      </div>
    </section>
  );
};

export default SendApplicationFormHeader;