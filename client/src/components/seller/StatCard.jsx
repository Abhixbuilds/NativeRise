import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'accent' }) => {
  const colorMap = {
    accent: 'bg-accent-light text-accent-dark',
    secondary: 'bg-secondary-light text-secondary-dark',
    success: 'bg-emerald-50 text-emerald-800',
    warning: 'bg-amber-50 text-amber-800',
  };

  return (
    <div className="card-base p-5 flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
          {title}
        </span>
        <span className="font-serif text-2xl font-bold text-text-primary block">
          {value}
        </span>
        {subtitle && (
          <span className="text-[11px] text-text-secondary block">
            {subtitle}
          </span>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color] || colorMap.accent} shadow-xs`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
};

export default StatCard;
