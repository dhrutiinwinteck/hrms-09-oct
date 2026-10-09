import {
  CalendarDays,
  Plus,
} from 'lucide-react';

interface CompOffHeaderProps {
  onApply: () => void;
}

const CompOffHeader = ({
  onApply,
}: CompOffHeaderProps) => {
  return (
    <div className="comp-off-header">
      <div className="comp-off-breadcrumb">
        <span>Home</span>
        <span className="breadcrumb-separator">
          ›
        </span>
        <span>Comp Off</span>
      </div>

      <div className="comp-off-title-row">
        <div className="comp-off-title-content">
          <h1>Comp Off</h1>

          <p>
            Request and manage compensatory off
            for working on public holidays or
            week offs.
          </p>
        </div>

        <button
          type="button"
          className="comp-off-primary-button"
          onClick={onApply}
        >
          <Plus size={18} />
          Apply for Comp Off
        </button>
      </div>

      <div className="comp-off-banner">
        <div className="comp-off-banner-illustration">
          <div className="banner-leaf banner-leaf-one" />
          <div className="banner-leaf banner-leaf-two" />

          <div className="banner-calendar">
            <CalendarDays size={34} />
          </div>
        </div>

        <div className="comp-off-banner-message">
          <strong>
            Worked on a Holiday or Week Off?
          </strong>

          <span>
            Submit a request to get compensatory
            off.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompOffHeader;