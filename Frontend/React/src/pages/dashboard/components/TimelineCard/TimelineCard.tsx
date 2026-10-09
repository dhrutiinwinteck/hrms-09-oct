import './TimelineCard.css';

/**
 * Interface representing a single timeline activity.
 */
export interface TimelineActivity {
  id: string;
  time: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
}

/**
 * Props interface for the TimelineCard component.
 */
export interface TimelineCardProps {
  title: string;
  activities: TimelineActivity[];
  onViewComplete?: () => void;
}

/**
 * TimelineCard Component
 * 
 * Displays a chronological list of recent activities and events.
 * Features a horizontal flex layout: [Time] - [Dot/Line] - [Content]
 * Strictly matches enterprise ESS design reference.
 * 
 * @param {TimelineCardProps} props - The component props.
 * @returns {JSX.Element} The rendered TimelineCard component.
 */
const TimelineCard = ({ title, activities, onViewComplete }: TimelineCardProps): JSX.Element => {
  return (
    <article className="timeline-card">
      <div className="timeline-card-header">
        <h3 className="timeline-card-title">{title}</h3>
      </div>

      <div className="timeline-card-body">
        {activities.length === 0 ? (
          <div className="timeline-empty-state">
            <p className="timeline-empty-text">No activity recorded today.</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="timeline-item">
              
              {/* LEFT COLUMN: Time */}
              <div className="timeline-item-time-col">
                <span className="timeline-item-time">{activity.time}</span>
              </div>

              {/* MIDDLE COLUMN: Dot + Line */}
              <div className="timeline-item-marker">
                <div 
                  className="timeline-item-dot" 
                  style={{ 
                    backgroundColor: activity.color || '#8FC746',
                    borderColor: activity.color ? `${activity.color}33` : '#E8F5E9'
                  }}
                >
                  {activity.icon}
                </div>
                {index < activities.length - 1 && <div className="timeline-item-line"></div>}
              </div>

              {/* RIGHT COLUMN: Title + Description */}
              <div className="timeline-item-content">
                <span className="timeline-item-title">{activity.title}</span>
                <span className="timeline-item-description">{activity.description}</span>
              </div>

            </div>
          ))
        )}
      </div>

      {onViewComplete && (
        <div className="timeline-card-footer">
          <button type="button" className="timeline-view-btn" onClick={onViewComplete}>
            View Complete Timeline
          </button>
        </div>
      )}
    </article>
  );
};

export default TimelineCard;