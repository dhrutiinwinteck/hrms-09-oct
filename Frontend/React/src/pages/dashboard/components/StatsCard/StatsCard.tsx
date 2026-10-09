import React, { ReactNode, useMemo } from 'react';
import {  ArrowUp } from 'lucide-react';
import './StatsCard.css';

// ============================================================================
// 1. STRONG TYPING - The component accepts ONLY raw data
// ============================================================================

interface BaseCardProps {
  title: string;
  subtitle: string;
}

/** Props for Attendance & Leave cards */
interface StandardCardProps extends BaseCardProps {
  type: 'attendance' | 'leave';
  icon: ReactNode;
  value: number; // Raw number
  footerText: string;
  trend?: 'up' | 'down';
  /** Raw data for sparkline (e.g., [10, 40, 30, 50, 20]) */
  sparklineData?: number[]; 
}

/** Props for Working Hours card */
interface DonutCardProps extends BaseCardProps {
  type: 'working-hours';
  icon: ReactNode;
  workedMinutes: number; // e.g. 450
  targetMinutes: number; // e.g. 540
}

type StatsCardProps = StandardCardProps | DonutCardProps;

// ============================================================================
// 2. INTERNAL UTILITY SUB-COMPONENTS
// ============================================================================

const HeaderRow: React.FC<{ icon: ReactNode; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div className="stats-card-header-row">
    <div className="stats-card-icon">{icon}</div>
    <div className="stats-card-title-group">
      <h3 className="stats-card-title">{title}</h3>
      <span className="stats-card-subtitle">{subtitle}</span>
    </div>
  </div>
);

const DonutChart: React.FC<{ progress: number; icon: ReactNode }> = ({ progress, icon }) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="stats-card-donut-wrapper">
      <svg className="stats-card-donut-svg" viewBox="0 0 80 80">
        <circle className="donut-bg" cx="40" cy="40" r={radius} />
        <circle 
          className="donut-fill" 
          cx="40" cy="40" r={radius} 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="stats-card-donut-icon">{icon}</div>
    </div>
  );
};

// ============================================================================
// 3. MAIN COMPONENT - Entry point and Render Decider
// ============================================================================

/**
 * StatsCard - Enterprise Reusable Metric Component.
 * 
 * Avoids formatted string passing. Calculates layouts using raw numerical data.
 * Designed for seamless integration with mock APIs or FastAPI backends.
 */
const StatsCard = (props: StatsCardProps): JSX.Element => {
  // Working Hours Logic
  if (props.type === 'working-hours') {
    const { title, subtitle, icon, workedMinutes, targetMinutes } = props;
    
    // Calculate data precisely from minutes
    const progress = (workedMinutes / targetMinutes) * 100;
    const hours = Math.floor(workedMinutes / 60);
    const mins = workedMinutes % 60;
    const targetHours = Math.floor(targetMinutes / 60);
    
    const displayTime = `${hours}h ${mins}m`;
    const targetDisplay = `${targetHours}h`;

    return (
      <article className="stats-card variant-green">
        <div className="stats-card-header-row">
          <div className="stats-card-title-group">
            <h3 className="stats-card-title">{title}</h3>
            <span className="stats-card-subtitle">{subtitle}</span>
          </div>
        </div>

        <div className="stats-card-donut-layout">
          <DonutChart progress={progress} icon={icon} />
          
          <div className="stats-card-text-block">
            <div className="stats-card-time-row">
              <span className="stats-card-hours">{displayTime}</span>
              <span className="stats-card-target-hours">/ {targetDisplay}</span>
            </div>
            <span className="stats-card-percent-text">{Math.round(progress)}% Completed</span>
            
            <div className="stats-card-linear-progress">
              <div className="stats-card-linear-fill" style={{ width: `${Math.round(progress)}%` }}></div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Attendance & Leave Request Logic (Identical layout, different data)
  const { type, title, subtitle, icon, value, footerText, sparklineData, trend = 'up' } = props;
  const variantClass = type === 'attendance' ? 'variant-green' : 'variant-orange';

  // SVG Path generation for Sparkline from raw array data
  const sparklinePath = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const width = 100;
    const height = 40;
    const padding = 4;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1; // Prevent division by zero

    // Generate string of SVG coordinates
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      // Invert Y axis so higher numbers are higher on the screen, apply padding
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }, [sparklineData]);

  return (
    <article className={`stats-card ${variantClass}`}>
      
      <HeaderRow icon={icon} title={title} subtitle={subtitle} />

      <div className="stats-card-value-container">
        <span className="stats-card-value-large">{value}</span>
      </div>

      <div className="stats-card-footer-row">
        <span className="stats-card-status">
          {footerText}
          {trend === 'up' && <ArrowUp size={14} strokeWidth={3} className="trend-arrow-up" />}
        </span>
      </div>

      {/* Only render Sparkline if data is provided */}
      {sparklineData && sparklinePath && (
        <div className="stats-card-sparkline-container">
          <svg className="stats-card-sparkline-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
            <path 
              d={sparklinePath} 
              stroke={type === 'attendance' ? '#2E7D32' : '#EF6C00'} 
              strokeWidth="2.5" 
              fill="none"
              opacity="0.8"
            />
            <path 
              d={`${sparklinePath} L100,40 L0,40 Z`} 
              fill={type === 'attendance' ? '#E8F5E9' : '#FFF3E0'} 
              opacity="0.6"
            />
          </svg>
        </div>
      )}
    </article>
  );
};

export default StatsCard;