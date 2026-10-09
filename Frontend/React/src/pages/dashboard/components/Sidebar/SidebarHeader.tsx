import { Menu } from 'lucide-react';
import './SidebarHeader.css';

// Import the logo from the specified assets path
import logo from '../../../../assets/images/Inwinteck_logo.png';

/**
 * Props interface for the SidebarHeader component.
 */
export interface SidebarHeaderProps {
  /**
   * Callback function triggered when the toggle button is clicked.
   * Used to collapse or expand the navigation panel.
   */
  togglePanel: () => void;
}

/**
 * SidebarHeader Component
 * 
 * Renders the top section of the right navigation panel.
 * Includes the company logo, brand name, department title,
 * and a hamburger menu button for toggling the panel state.
 * 
 * @param {SidebarHeaderProps} props - The component props.
 * @returns {JSX.Element} The rendered SidebarHeader component.
 */
const SidebarHeader = ({ togglePanel }: SidebarHeaderProps): JSX.Element => {
  return (
    <header className="sidebar-header">
      <div className="sidebar-brand-container">
        <div className="sidebar-logo-wrapper">
          <img 
            src={logo} 
            alt="Inwinteck Logo" 
            className="sidebar-logo" 
          />
        </div>
        <div className="sidebar-brand-text">
          <h1 className="sidebar-company-name">INWINTECK</h1>
          <span className="sidebar-department-title">
            Human Resource Management System
          </span>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={togglePanel}
        aria-label="Toggle Navigation Panel"
      >
        <Menu size={22} strokeWidth={2} />
      </button>
    </header>
  );
};

export default SidebarHeader;