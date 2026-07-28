import type { LucideIcon } from 'lucide-react';
import { Zap, Gem, Droplets, Wheat, Wind, Users, Microscope } from 'lucide-react';

export type ColonyResource =
  | 'energy'
  | 'minerals'
  | 'water'
  | 'food'
  | 'oxygen'
  | 'colonists'
  | 'research';

export const RESOURCE_ICONS: Record<ColonyResource, LucideIcon> = {
  energy: Zap,
  minerals: Gem,
  water: Droplets,
  food: Wheat,
  oxygen: Wind,
  colonists: Users,
  research: Microscope,
};

export const RESOURCE_COLORS: Record<ColonyResource, string> = {
  energy: '#FBBF24',
  minerals: '#3B82F6',
  water: '#60A5FA',
  food: '#10B981',
  oxygen: '#67E8F9',
  colonists: '#F97316',
  research: '#38BDF8',
};
