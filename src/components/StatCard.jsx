import React from 'react';

/**
 * Metric card showcasing numeric or textual healthcare stats.
 */
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconVariant = 'primary', 
  trend 
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon icon-${iconVariant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="stat-card-value">{value}</div>
      
      {trend && (
        <div className="stat-card-indicator">
          {trend.value && (
            <span 
              style={{ 
                color: trend.isPositive ? 'var(--success)' : trend.isCritical ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: '600'
              }}
            >
              {trend.value}
            </span>
          )}
          {trend.label && (
            <span style={{ color: 'var(--text-muted)' }}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
