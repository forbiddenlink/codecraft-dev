/**
 * Stats Card Component
 * Displays individual statistics with Lucide icons
 */

import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'yellow';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

const colorClasses = {
  purple: 'text-[rgb(var(--accent-subtle))]',
  blue: 'text-[rgb(var(--accent-subtle))]',
  green: 'text-[rgb(var(--success))]',
  orange: 'text-[rgb(var(--energy))]',
  red: 'text-[rgb(var(--error))]',
  yellow: 'text-[rgb(var(--energy))]',
};

export function StatsCard({ title, value, icon, color, subtitle, trend }: StatsCardProps) {
  const valueColor = colorClasses[color];

  return (
    <div className="card card-interactive hover:scale-[1.02]">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-small">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
            {trend && (
              <span className="text-sm">
                {trend === 'up' && (
                  <Icon icon={TrendingUp} size={14} className="text-[rgb(var(--success))]" />
                )}
                {trend === 'down' && (
                  <Icon icon={TrendingDown} size={14} className="text-[rgb(var(--error))]" />
                )}
                {trend === 'stable' && (
                  <Icon icon={Minus} size={14} className="text-[rgb(var(--text-muted))]" />
                )}
              </span>
            )}
          </div>
        </div>
        <span className={`opacity-80 ${valueColor}`}>
          <Icon icon={icon} size={22} />
        </span>
      </div>
      {subtitle && <p className="text-small">{subtitle}</p>}
    </div>
  );
}
