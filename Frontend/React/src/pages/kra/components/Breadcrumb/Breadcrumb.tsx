import React from "react";
import {
  BarChart3,
  ChevronRight,
  Target,
  TrendingUp,
} from "lucide-react";

import "./Breadcrumb.css";

const Breadcrumb: React.FC = () => {
  return (
    <section
      className="kra-hero"
      aria-labelledby="kra-page-title"
    >
      {/* Decorative background */}
      <div
        className="kra-hero-decoration"
        aria-hidden="true"
      >
        <span className="kra-hero-orb kra-hero-orb-one" />
        <span className="kra-hero-orb kra-hero-orb-two" />
      </div>

      {/* Left Content */}
      <div className="kra-hero-content">
        <div className="kra-hero-heading">
          <h1
            id="kra-page-title"
            className="kra-hero-title"
          >
            KRA Master
          </h1>

          <p className="kra-hero-subtitle">
            Manage Key Result Areas for your organization
          </p>
        </div>

        {/* Breadcrumb */}
        <nav
          className="breadcrumb"
          aria-label="Breadcrumb"
        >
          <span className="breadcrumb-item">
            Dashboard
          </span>

          <ChevronRight
            className="breadcrumb-separator"
            aria-hidden="true"
          />

          <span className="breadcrumb-item">
            KRA
          </span>

          <ChevronRight
            className="breadcrumb-separator"
            aria-hidden="true"
          />

          <span
            className="breadcrumb-item active"
            aria-current="page"
          >
            KRA Master
          </span>
        </nav>
      </div>

      {/* Right Visual */}
      <div
        className="kra-hero-visual"
        aria-hidden="true"
      >
        <div className="kra-visual-dots">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="kra-target-visual">
          <span className="kra-target-ring ring-one" />
          <span className="kra-target-ring ring-two" />
          <span className="kra-target-ring ring-three" />

          <Target
            className="kra-target-icon"
            strokeWidth={1.5}
          />

          <TrendingUp
            className="kra-trend-icon"
            strokeWidth={2}
          />
        </div>

        <div className="kra-chart-visual">
          <BarChart3
            className="kra-chart-icon"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </section>
  );
};

export default Breadcrumb;

