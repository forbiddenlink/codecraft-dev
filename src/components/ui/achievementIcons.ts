import type { LucideIcon } from 'lucide-react';
import {
  Target,
  Rocket,
  Star,
  Zap,
  Building2,
  Crown,
  Sparkles,
  Trophy,
  CheckCircle2,
  Hourglass,
  Lock,
  FileCode2,
  Palette,
  Gem,
  Shield,
  Bot,
  Flame,
  GraduationCap,
  Dumbbell,
  BookOpen,
} from 'lucide-react';

/** Lucide icons keyed by achievement id (FeatureHub / data). */
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  first_challenge: Target,
  first_steps: Sparkles,
  five_challenges: Rocket,
  perfect_score: Star,
  speed_demon: Zap,
  master_builder: Building2,
  code_master: Crown,
  legend: Sparkles,
  html_novice: FileCode2,
  css_artist: Palette,
  javascript_wizard: Zap,
};

const FALLBACK_BY_NAME: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  trophy: Trophy,
  target: Target,
  rocket: Rocket,
  star: Star,
  zap: Zap,
  crown: Crown,
  gem: Gem,
  shield: Shield,
  bot: Bot,
  flame: Flame,
  'file-code': FileCode2,
  palette: Palette,
  'building-2': Building2,
  building: Building2,
  'graduation-cap': GraduationCap,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
};

export function getAchievementIcon(id: string, fallback?: string): LucideIcon {
  if (ACHIEVEMENT_ICONS[id]) return ACHIEVEMENT_ICONS[id];
  if (fallback && FALLBACK_BY_NAME[fallback]) return FALLBACK_BY_NAME[fallback];
  return Trophy;
}

export const ACHIEVEMENT_SECTION_ICONS = {
  unlocked: CheckCircle2,
  inProgress: Hourglass,
  locked: Lock,
} as const;
