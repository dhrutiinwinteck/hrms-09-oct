// import React from 'react';
import { railIcons, logoutConfig } from '../../constants/sidebarMenu';
import './IconRail.css';

// ------------------------------------------------------
// IconRail Component Props
// ------------------------------------------------------
export interface IconRailProps {
  activeIconId: string;
  selectIcon: (id: string) => void;
}

/**
 * IconRail Component
 * 
 * The left-side vertical navigation rail containing only icons.
 * Maps through the railIcons configuration and renders interactive
 * icon buttons. The 'logout' icon is manually pinned to the bottom.
 * 
 * @param {IconRailProps} props - The component props.
 * @returns {JSX.Element} The rendered IconRail component.
 */
const IconRail = ({ activeIconId, selectIcon }: IconRailProps): JSX.Element => {
  return (
    <nav className="icon-rail" aria-label="Main Navigation Rail">
      <ul className="icon-rail-list">
        {/* Render main menu icons from configuration */}
        {railIcons.map((iconItem) => {
          const isActive = activeIconId === iconItem.id;
          const IconComponent = iconItem.icon;

          return (
            <li key={iconItem.id} className="icon-rail-item">
              <button
                type="button"
                className={`icon-rail-btn ${isActive ? 'icon-rail-btn-active' : ''}`}
                onClick={() => selectIcon(iconItem.id)}
                title={iconItem.label}
                aria-label={iconItem.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Dynamically render the Icon Component with passed props */}
                <IconComponent size={22} strokeWidth={1.5} />
              </button>
            </li>
          );
        })}
      </ul>

      {/* Logout Icon Pinned to Bottom */}
      <ul className="icon-rail-list icon-rail-logout-wrapper">
        <li className="icon-rail-item">
          <button
            type="button"
            className={`icon-rail-btn ${activeIconId === 'logout' ? 'icon-rail-btn-active' : ''}`}
            onClick={() => selectIcon('logout')}
            title={logoutConfig.label}
            aria-label={logoutConfig.label}
          >
            <logoutConfig.icon size={22} strokeWidth={1.5} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default IconRail;