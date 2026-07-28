import type { LucideIcon, LucideProps } from 'lucide-react';

type IconProps = LucideProps & {
  icon: LucideIcon;
  className?: string;
};

/** Consistent Lucide icon sizing for HUD / menus. */
export function Icon({
  icon: Glyph,
  className = '',
  size = 18,
  strokeWidth = 1.75,
  ...props
}: IconProps) {
  return (
    <Glyph
      aria-hidden
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}
