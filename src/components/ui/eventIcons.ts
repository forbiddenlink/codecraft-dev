import type { LucideIcon } from 'lucide-react';
import {
  Gem,
  Lightbulb,
  Users,
  Zap,
  Sun,
  Sparkles,
  PartyPopper,
  Bot,
  Trophy,
  TriangleAlert,
  Flame,
  CloudRain,
  Snowflake,
  Moon,
  Rocket,
  Package,
  Wrench,
  Music,
  BookOpen,
  Palette,
  Heart,
  Wind,
} from 'lucide-react';

const EVENT_ICONS: Record<string, LucideIcon> = {
  gem: Gem,
  lightbulb: Lightbulb,
  users: Users,
  zap: Zap,
  sun: Sun,
  sparkles: Sparkles,
  'party-popper': PartyPopper,
  bot: Bot,
  trophy: Trophy,
  'triangle-alert': TriangleAlert,
  flame: Flame,
  'cloud-rain': CloudRain,
  snowflake: Snowflake,
  moon: Moon,
  rocket: Rocket,
  package: Package,
  wrench: Wrench,
  music: Music,
  'book-open': BookOpen,
  palette: Palette,
  heart: Heart,
  wind: Wind,
};

export function getColonyEventIcon(iconKey: string): LucideIcon {
  return EVENT_ICONS[iconKey] ?? Sparkles;
}
