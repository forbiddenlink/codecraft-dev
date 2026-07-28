import type { ReactNode } from 'react';

type HudPanelProps = {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingMap = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
} as const;

/** Frosted HUD surface used over the 3D world. */
export function HudPanel({ children, className = '', padding = 'md' }: HudPanelProps) {
  return (
    <div
      className={`panel border border-white/[0.08] bg-[rgb(var(--bg-surface)/0.92)] shadow-[var(--shadow-md)] backdrop-blur-xl ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
