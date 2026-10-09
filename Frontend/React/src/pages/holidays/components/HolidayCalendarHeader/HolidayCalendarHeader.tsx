import React from 'react';
import calendarImage from '../../../../assets/images/calendar/calendar.png';
import './HolidayCalendarHeader.css';

interface HolidayCalendarHeaderProps {
  title?: string;
  subtitle?: string;
}

export const HolidayCalendarHeader: React.FC<HolidayCalendarHeaderProps> = ({
  title = 'Holiday Calendar',
  subtitle = 'View all company holidays for the year',
}) => {
  return (
    <div className="holiday-calendar-header">
      <div className="holiday-calendar-header-image">
        <img 
          src={calendarImage} 
          alt="Calendar illustration" 
          className="holiday-calendar-image"
        />
      </div>
      <div className="holiday-calendar-header-text">
        <h1 className="holiday-calendar-title">{title}</h1>
        <p className="holiday-calendar-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};