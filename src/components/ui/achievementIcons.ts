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
} from 'lucide-react';

/** Lucide icons keyed by achievement id (FeatureHub / data). */
export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  first_challenge: Target,
  five_challenges: Rocket,
  perfect_score: Star,
  speed_demon: Zap,
  master_builder: Building2,
  code_master: Crown,
  legend: Sparkles,
};

export function getAchievementIcon(id: string, fallback?: string): LucideIcon {
  if (ACHIEVEMENT_ICONS[id]) return ACHIEVEMENT_ICONS[id];
  // Legacy emoji / unknown → generic trophy
  void fallback;
  return Trophy;
}

export const ACHIEVEMENT_SECTION_ICONS = {
  unlocked: CheckCircle2,
  inProgress: Hourglass,
  locked: Lock,
} as const;
