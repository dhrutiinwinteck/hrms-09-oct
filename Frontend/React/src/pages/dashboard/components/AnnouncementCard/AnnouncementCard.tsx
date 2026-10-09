import './AnnouncementCard.css';

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AnnouncementCardProps {
  title: string;
  announcements: AnnouncementItem[];
  onViewAll?: () => void;
}

const AnnouncementCard = ({
  title,
  announcements,
  onViewAll,
}: AnnouncementCardProps): JSX.Element => {
  const getPriorityLabel = (
    priority: AnnouncementItem['priority'],
  ): string => {
    const map: Record<AnnouncementItem['priority'], string> = {
      high: 'Urgent',
      medium: 'Important',
      low: 'General',
    };

    return map[priority] || 'General';
  };

  return (
    <article className="announcement-card">
      <div className="announcement-card-header">
        <h3 className="announcement-card-title">{title}</h3>

        {onViewAll && (
          <button
            type="button"
            className="announcement-view-btn"
            onClick={onViewAll}
          >
            View All
          </button>
        )}
      </div>

      <div className="announcement-card-list">
        {announcements.map((announcement) => (
          <div
            className="announcement-card-item"
            key={announcement.id}
          >
            <div className="announcement-item-top">
              <span className="announcement-item-title">
                {announcement.title}
              </span>

              {announcement.priority && (
                <span
                  className={`announcement-item-priority priority-${announcement.priority}`}
                >
                  {getPriorityLabel(announcement.priority)}
                </span>
              )}
            </div>

            <div className="announcement-item-bottom">
              {announcement.date && (
                <span className="announcement-item-date">
                  {announcement.date}
                </span>
              )}

              <span className="announcement-item-desc">
                {announcement.description}
              </span>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="announcement-empty">
            No recent announcements.
          </div>
        )}
      </div>
    </article>
  );
};

export default AnnouncementCard;