/**
 * Stats Card Component
 * Displays individual statistics with clean, minimal styling
 */

import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

// Simplified color mapping - just accent colors for the value
const colorClasses = {
  purple: 'text-violet-400',
  blue: 'text-blue-400',
  green: 'text-emerald-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  yellow: 'text-amber-400',
};

export function StatsCard({ title, value, icon, color, subtitle, trend }: StatsCardProps) {
  const valueColor = colorClasses[color];

  return (
    <div className="card card-interactive hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-small mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
            {trend && (
              <span className="text-sm">
                {trend === 'up' && <span className="text-success">↗</span>}
                {trend === 'down' && <span className="text-error">↘</span>}
                {trend === 'stable' && <span className="text-text-muted">→</span>}
              </span>
            )}
          </div>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
      {subtitle && <p className="text-small">{subtitle}</p>}
    </div>
  );
}
