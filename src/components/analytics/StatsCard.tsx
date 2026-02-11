/**
 * Stats Card Component
 * Displays individual statistics with visual appeal
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

const colorClasses = {
  purple: {
    bg: 'from-purple-600/20 to-purple-800/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20',
  },
  blue: {
    bg: 'from-blue-600/20 to-blue-800/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  green: {
    bg: 'from-green-600/20 to-green-800/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  orange: {
    bg: 'from-orange-600/20 to-orange-800/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20',
  },
  red: {
    bg: 'from-red-600/20 to-red-800/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  yellow: {
    bg: 'from-yellow-600/20 to-yellow-800/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
};

export function StatsCard({ title, value, icon, color, subtitle, trend }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 shadow-lg ${colors.glow} hover:shadow-xl transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {trend && (
              <span className="text-sm">
                {trend === 'up' && <span className="text-green-400">↗</span>}
                {trend === 'down' && <span className="text-red-400">↘</span>}
                {trend === 'stable' && <span className="text-gray-400">→</span>}
              </span>
            )}
          </div>
        </div>
        <div className={`text-4xl opacity-80`}>{icon}</div>
      </div>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
    </div>
  );
}
