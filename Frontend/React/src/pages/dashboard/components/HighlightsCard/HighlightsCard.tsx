import React from 'react';
import './HighlightsCard.css';

export interface HighlightItem {
  id: string;
  title: string;
  subtitle: string;
  status: 'success' | 'warning' | 'info' | 'neutral';
  icon: React.ReactNode;
  color?: string;
}

export interface HighlightsCardProps {
  title: string;
  items: HighlightItem[];
  onViewAll?: () => void;
}

const HighlightsCard = ({
  title,
  items,
  onViewAll,
}: HighlightsCardProps): JSX.Element => {
  return (
    <article className="highlights-card">
      <div className="highlights-card-header">
        <h3 className="highlights-card-title">{title}</h3>

        {onViewAll && (
          <button
            type="button"
            className="highlights-view-all-btn"
            onClick={onViewAll}
          >
            View All
          </button>
        )}
      </div>

      <div className="highlights-card-list">
        {items.map((item) => (
          <div
            key={item.id}
            className="highlights-card-item"
          >
            <div className="highlights-item-left">
              <div
                className="highlights-item-icon-wrapper"
                style={{
                  color: item.color ?? '#1976D2',
                }}
              >
                {item.icon}
              </div>

              <div className="highlights-item-content">
                <span className="highlights-item-title">
                  {item.title}
                </span>

                <span className="highlights-item-subtitle">
                  {item.subtitle}
                </span>
              </div>
            </div>

            <span
              className={`highlights-item-status highlights-status-${item.status}`}
            >
              {item.status.charAt(0).toUpperCase() +
                item.status.slice(1)}
            </span>
          </div>
        ))}

        {items.length === 0 && (
          <div className="highlight-empty">
            No highlights for today.
          </div>
        )}
      </div>
    </article>
  );
};

export default HighlightsCard;