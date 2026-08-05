import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Bot,
  CloudRain,
  Flame,
  Gem,
  Heart,
  Lightbulb,
  Moon,
  Music,
  Package,
  Palette,
  PartyPopper,
  Rocket,
  Snowflake,
  Sparkles,
  Sun,
  TriangleAlert,
  Trophy,
  Users,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'

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
}

export function getColonyEventIcon(iconKey: string): LucideIcon {
  return EVENT_ICONS[iconKey] ?? Sparkles
}
