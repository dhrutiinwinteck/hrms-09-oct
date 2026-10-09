import React from 'react';
import { Calendar, Clock, PauseCircle, Users } from 'lucide-react';
import { ShiftPatternStats as StatsType } from '../../types/shiftPatterns.types';
import ShiftPatternStatCard from '../ShiftPatternStatCard/ShiftPatternStatCard';
import './ShiftPatternStats.css';

interface ShiftPatternStatsProps {
  stats: StatsType;
}

const iconMap = {
  Calendar,
  Clock,
  PauseCircle,
  Users,
};

const ShiftPatternStats: React.FC<ShiftPatternStatsProps> = ({ stats }) => {
  const cards = [
    { id: 'total', title: 'Total Shift Patterns', value: stats.total, description: 'All Patterns', icon: 'Calendar' },
    { id: 'active', title: 'Active Patterns', value: stats.active, description: 'Currently Active', icon: 'Clock' },
    { id: 'inactive', title: 'Inactive Patterns', value: stats.inactive, description: 'Currently Inactive', icon: 'PauseCircle' },
    { id: 'assigned', title: 'Employees Assigned', value: stats.assigned, description: 'Across All Patterns', icon: 'Users' },
  ];

  return (
    <div className="shift-pattern-stats">
      {cards.map((card) => {
        const IconComponent = iconMap[card.icon as keyof typeof iconMap];
        return (
          <ShiftPatternStatCard
            key={card.id}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={IconComponent}
          />
        );
      })}
    </div>
  );
};

export default ShiftPatternStats;