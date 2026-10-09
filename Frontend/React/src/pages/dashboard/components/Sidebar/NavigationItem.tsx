import { NavLink } from 'react-router-dom';
import './NavigationItem.css';

export interface NavigationItemProps {
  label: string;
  path: string;
  active?: boolean;
}

const NavigationItem = ({
  label,
  path,
}: NavigationItemProps): JSX.Element => {
  return (
    <li className="navigation-item">
      <NavLink
        to={path}
        end={path === "/dashboard"}
        className={({ isActive }) =>
          `navigation-link ${
            isActive
              ? "navigation-link-active"
              : ""
          }`
        }
      >
        {label}
      </NavLink>
    </li>
  );
};

export default NavigationItem;