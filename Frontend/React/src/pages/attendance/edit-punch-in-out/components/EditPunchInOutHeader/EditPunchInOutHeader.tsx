import React from 'react';
import { CalendarDays } from 'lucide-react';
import { UI_LABELS } from '../../constants/editPunchInOut.constants';
import './EditPunchInOutHeader.css';

// Import the existing image - adjust path based on actual file
// You'll need to check the actual file extension and path
import headerImage from '@/assets/images/edit punch in-out/edit punch in-out.png';

export const EditPunchInOutHeader: React.FC = () => {
  return (
    <div className="edit-punch-in-out-header">
      <div className="edit-punch-in-out-header__content">
        <div className="edit-punch-in-out-header__left">
          <div className="edit-punch-in-out-header__icon-wrapper">
            <CalendarDays size={24} className="edit-punch-in-out-header__icon" />
          </div>
          <div className="edit-punch-in-out-header__text">
            <h1 className="edit-punch-in-out-header__title">
              {UI_LABELS.attendance}
            </h1>
            <p className="edit-punch-in-out-header__subtitle">
              {UI_LABELS.subtitle}
            </p>
          </div>
        </div>
        <div className="edit-punch-in-out-header__right">
          <img 
            src={headerImage} 
            alt="Attendance illustration" 
            className="edit-punch-in-out-header__image"
          />
        </div>
      </div>
    </div>
  );
};