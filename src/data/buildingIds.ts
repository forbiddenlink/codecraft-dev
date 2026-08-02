import type { LucideIcon } from 'lucide-react'
import { Box, FlaskConical, Home, LayoutDashboard, Leaf, Package, Zap } from 'lucide-react'

/** Maps legacy challenge reward IDs → real building template IDs. */
export const BUILDING_REWARD_TO_TEMPLATE: Record<string, string> = {
  basicHabitat: 'habitat-module',
  livingQuarters: 'greenhouse-module',
  resourceCenter: 'storage-vault',
  communicationHub: 'command-center',
  securityStation: 'energy-generator',
  crewQuarters: 'nav-corridor',
  dockingBay: 'laboratory-module',
  // Pass-through for already-correct IDs
  'habitat-module': 'habitat-module',
  'greenhouse-module': 'greenhouse-module',
  'storage-vault': 'storage-vault',
  'command-center': 'command-center',
  'energy-generator': 'energy-generator',
  'nav-corridor': 'nav-corridor',
  'laboratory-module': 'laboratory-module',
}

export function resolveBuildingTemplateId(rewardOrTemplateId: string): string {
  return BUILDING_REWARD_TO_TEMPLATE[rewardOrTemplateId] ?? rewardOrTemplateId
}

export const BUILDING_TEMPLATE_ICONS: Record<string, LucideIcon> = {
  'habitat-module': Home,
  'laboratory-module': FlaskConical,
  'energy-generator': Zap,
  'storage-vault': Package,
  'greenhouse-module': Leaf,
  'nav-corridor': Box,
  'command-center': LayoutDashboard,
}
