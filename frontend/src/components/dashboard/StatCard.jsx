import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#0d9488', bg = '#f0fdfa', subtitle }) => {
  return (
    <div className="stat-card">
      <div>
        <span className="stat-card-label">{title}</span>
        <div className="stat-card-value">{value}</div>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="stat-card-icon" style={{ backgroundColor: bg, color }}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatCard;
