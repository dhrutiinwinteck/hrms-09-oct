import React from 'react';
import { FileText } from 'lucide-react';
import './NoticeCard.css';

import envelopeImg from '../../../../assets/images/dashboard/envelop.png';

export interface NoticeCardProps {
  /** Array containing all 3 notice items */
  notices?: Array<{
    id: string;
    title: string;
    date: string;
    status: 'new' | 'urgent' | 'reminder';
  }>;
}

/**
 * DEFAULT FALLBACK DATA: 
 * Used if the admin hasn't added any notices yet or if the data is malformed.
 */
const DEFAULT_NOTICES = [
  { id: 'd1', title: 'Remote Work Policy Update', date: 'Nov 14, 2023', status: 'new' as const },
  { id: 'd2', title: 'Office Security Protocol Change', date: 'Nov 16, 2023', status: 'urgent' as const },
  { id: 'd3', title: 'Q4 Goals Review Deadline', date: 'Nov 20, 2023', status: 'reminder' as const },
];

/**
 * NoticeCard Component
 * 
 * A strictly single-container enterprise Notice Board.
 * Uses CSS Grid to split the layout into 3 exact visual partitions.
 * Short, perfectly centered 70px dividers are placed between items via clean DOM elements.
 */
const NoticeCard: React.FC<NoticeCardProps> = ({ notices }) => {
  // =========================================================
  // 1. DATA VALIDATION & FALLBACK SAFETY
  // Prevents 'charAt of undefined' runtime crashes
  // =========================================================
  let activeNotices = DEFAULT_NOTICES;
  if (notices && Array.isArray(notices) && notices.length === 3 && notices[0].status) {
    activeNotices = notices;
  }

  return (
    <div className="notice-card-wrapper">
      
      {/* =========================================================
          THE SINGLE PARENT CONTAINER 
          Strict 30%, 45%, 25% Grid split.
          ========================================================= */}
      <div className="notice-board">
        
        {/* --------------------------------------------------------
           PARTITION 1: LEFT (Icon + 1st Notice - 30%)
           -------------------------------------------------------- */}
        <div className="notice-left-section">
          <div className="notice-icon-box">
            <FileText size={24} strokeWidth={1.5} />
          </div>
          <div className="notice-left-text-wrapper">
            <h3 className="notice-main-heading">Notices</h3>
            <p className="notice-main-title">{activeNotices[0].title}</p>
            <div className="notice-main-meta">
              <span className="notice-main-date">{activeNotices[0].date}</span>
              <span className={`notice-badge badge-${activeNotices[0].status}`}>
                {activeNotices[0].status.charAt(0).toUpperCase() + activeNotices[0].status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------
           DIVIDER 1: Between Left and Center (70px height)
           -------------------------------------------------------- */}
        <div className="notice-divider-short"></div>

        {/* --------------------------------------------------------
           PARTITION 2: CENTER (2nd Notice - Part of 45% grid)
           -------------------------------------------------------- */}
        <div className="notice-center-col-1">
          <p className="notice-center-title">{activeNotices[1].title}</p>
          <div className="notice-center-meta">
            <span className="notice-center-date">{activeNotices[1].date}</span>
            <span className={`notice-badge badge-${activeNotices[1].status}`}>
              {activeNotices[1].status.charAt(0).toUpperCase() + activeNotices[1].status.slice(1)}
            </span>
          </div>
        </div>

        {/* --------------------------------------------------------
           DIVIDER 2: Between Center items (70px height)
           -------------------------------------------------------- */}
        <div className="notice-divider-short"></div>

        {/* --------------------------------------------------------
           PARTITION 2b: CENTER (3rd Notice - Part of 45% grid)
           -------------------------------------------------------- */}
        <div className="notice-center-col-2">
          <p className="notice-center-title">{activeNotices[2].title}</p>
          <div className="notice-center-meta">
            <span className="notice-center-date">{activeNotices[2].date}</span>
            <span className={`notice-badge badge-${activeNotices[2].status}`}>
              {activeNotices[2].status.charAt(0).toUpperCase() + activeNotices[2].status.slice(1)}
            </span>
          </div>
        </div>

        {/* --------------------------------------------------------
           PARTITION 3: RIGHT (Envelope Image - 25%)
           -------------------------------------------------------- */}
        <div className="notice-right-section">
          <img 
            src={envelopeImg} 
            alt="Envelope and Plant" 
            className="notice-image"
          />
        </div>

      </div>
    </div>
  );
};

export default NoticeCard;