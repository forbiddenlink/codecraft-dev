/**
 * Building Upgrade System
 * Progressive upgrades that enhance buildings and unlock new features
 */

export interface BuildingUpgrade {
  id: string;
  buildingType: string;
  level: number;
  name: string;
  description: string;
  icon: string;
  
  requirements: {
    playerLevel?: number;
    resources: Record<string, number>;
    prerequisiteUpgrades?: string[];
    completedChallenges?: string[];
  };
  
  benefits: {
    resourceGeneration?: Record<string, number>; // +X per minute
    efficiency?: number; // Multiplier (1.5 = 50% increase)
    capacity?: Record<string, number>; // Storage capacity
    unlocks?: string[]; // New features/buildings
    morale?: number;
  };
  
  visualChanges?: {
    scale?: number;
    color?: string;
    particles?: boolean;
    glow?: boolean;
  };
  
  upgradeTime?: number; // seconds
}

export const BUILDING_UPGRADES: BuildingUpgrade[] = [
  // ===== ENERGY GENERATOR UPGRADES =====
  {
    id: 'energy-gen-2',
    buildingType: 'energyGenerator',
    level: 2,
    name: 'Enhanced Power Core',
    description: 'Upgrade power generation by 50%',
    icon: '⚡',
    requirements: {
      playerLevel: 3,
      resources: {
        energy: 500,
        minerals: 200
      }
    },
    benefits: {
      resourceGeneration: {
        energy: 5 // +5 energy/min
      },
      efficiency: 1.5
    },
    visualChanges: {
      scale: 1.1,
      particles: true,
      glow: true
    },
    upgradeTime: 30
  },

  {
    id: 'energy-gen-3',
    buildingType: 'energyGenerator',
    level: 3,
    name: 'Fusion Reactor',
    description: 'Advanced fusion technology doubles output',
    icon: '⚡⚡',
    requirements: {
      playerLevel: 6,
      resources: {
        energy: 1000,
        minerals: 500
      },
      prerequisiteUpgrades: ['energy-gen-2']
    },
    benefits: {
      resourceGeneration: {
        energy: 10
      },
      efficiency: 2.0,
      unlocks: ['fusion-tech']
    },
    visualChanges: {
      scale: 1.2,
      color: '#60a5fa',
      particles: true,
      glow: true
    },
    upgradeTime: 60
  },

  {
    id: 'energy-gen-max',
    buildingType: 'energyGenerator',
    level: 4,
    name: 'Quantum Power Array',
    description: 'Ultimate power generation using quantum mechanics',
    icon: '✨⚡',
    requirements: {
      playerLevel: 10,
      resources: {
        energy: 2000,
        minerals: 1000
      },
      prerequisiteUpgrades: ['energy-gen-3'],
      completedChallenges: ['js-async']
    },
    benefits: {
      resourceGeneration: {
        energy: 20
      },
      efficiency: 3.0,
      unlocks: ['quantum-tech', 'ultimate-buildings']
    },
    visualChanges: {
      scale: 1.5,
      color: '#a78bfa',
      particles: true,
      glow: true
    },
    upgradeTime: 120
  },

  // ===== RESOURCE COLLECTOR UPGRADES =====
  {
    id: 'collector-2',
    buildingType: 'resourceCollector',
    level: 2,
    name: 'Advanced Drill System',
    description: 'Dig deeper to find more resources',
    icon: '⛏️',
    requirements: {
      playerLevel: 3,
      resources: {
        energy: 300,
        minerals: 300
      }
    },
    benefits: {
      resourceGeneration: {
        minerals: 5
      },
      efficiency: 1.5
    },
    visualChanges: {
      scale: 1.1,
      particles: true
    },
    upgradeTime: 30
  },

  {
    id: 'collector-3',
    buildingType: 'resourceCollector',
    level: 3,
    name: 'Automated Mining',
    description: 'AI-controlled mining operations',
    icon: '🤖⛏️',
    requirements: {
      playerLevel: 7,
      resources: {
        energy: 600,
        minerals: 600
      },
      prerequisiteUpgrades: ['collector-2'],
      completedChallenges: ['javascript-2']
    },
    benefits: {
      resourceGeneration: {
        minerals: 10,
        energy: 2
      },
      efficiency: 2.0,
      morale: 10,
      unlocks: ['automation-systems']
    },
    visualChanges: {
      scale: 1.2,
      color: '#10b981',
      particles: true,
      glow: true
    },
    upgradeTime: 60
  },

  // ===== LIVING QUARTERS UPGRADES =====
  {
    id: 'habitat-2',
    buildingType: 'livingQuarters',
    level: 2,
    name: 'Comfort Upgrade',
    description: 'Better living conditions improve morale',
    icon: '🏠',
    requirements: {
      playerLevel: 2,
      resources: {
        energy: 200,
        food: 100
      }
    },
    benefits: {
      morale: 15,
      capacity: {
        population: 10
      }
    },
    visualChanges: {
      scale: 1.1,
      particles: true
    },
    upgradeTime: 20
  },

  {
    id: 'habitat-3',
    buildingType: 'livingQuarters',
    level: 3,
    name: 'Luxury Apartments',
    description: 'Premium living spaces for happy colonists',
    icon: '🏰',
    requirements: {
      playerLevel: 5,
      resources: {
        energy: 400,
        food: 200,
        minerals: 200
      },
      prerequisiteUpgrades: ['habitat-2']
    },
    benefits: {
      morale: 30,
      capacity: {
        population: 25
      },
      resourceGeneration: {
        energy: 3 // Happy people = productive people
      }
    },
    visualChanges: {
      scale: 1.3,
      color: '#ec4899',
      particles: true,
      glow: true
    },
    upgradeTime: 45
  },

  // ===== COMMAND CENTER UPGRADES =====
  {
    id: 'command-2',
    buildingType: 'commandCenter',
    level: 2,
    name: 'Advanced Sensors',
    description: 'Better information gathering and analysis',
    icon: '📡',
    requirements: {
      playerLevel: 4,
      resources: {
        energy: 500,
        minerals: 300
      }
    },
    benefits: {
      unlocks: ['advanced-analytics', 'event-prediction'],
      morale: 10
    },
    visualChanges: {
      scale: 1.1,
      particles: true,
      glow: true
    },
    upgradeTime: 40
  },

  {
    id: 'command-3',
    buildingType: 'commandCenter',
    level: 3,
    name: 'AI Assistant Integration',
    description: 'Integrate advanced AI for colony management',
    icon: '🤖📡',
    requirements: {
      playerLevel: 8,
      resources: {
        energy: 1000,
        minerals: 500
      },
      prerequisiteUpgrades: ['command-2'],
      completedChallenges: ['js-objects']
    },
    benefits: {
      efficiency: 1.5, // All resource generation +50%
      unlocks: ['ai-assistant', 'auto-optimization'],
      morale: 20
    },
    visualChanges: {
      scale: 1.3,
      color: '#3b82f6',
      particles: true,
      glow: true
    },
    upgradeTime: 90
  },

  // ===== SPECIAL BUILDING UPGRADES =====
  {
    id: 'cafeteria-upgrade',
    buildingType: 'cafeteria',
    level: 2,
    name: 'Gourmet Kitchen',
    description: 'Better food = happier colonists!',
    icon: '👨‍🍳',
    requirements: {
      playerLevel: 3,
      resources: {
        food: 300,
        energy: 200
      }
    },
    benefits: {
      morale: 25,
      resourceGeneration: {
        food: 5
      }
    },
    visualChanges: {
      scale: 1.2,
      particles: true
    },
    upgradeTime: 30
  },

  {
    id: 'data-center-upgrade',
    buildingType: 'dataCenter',
    level: 2,
    name: 'Quantum Computing Core',
    description: 'Process data at incredible speeds',
    icon: '💻',
    requirements: {
      playerLevel: 6,
      resources: {
        energy: 800,
        minerals: 400
      },
      completedChallenges: ['js-async']
    },
    benefits: {
      efficiency: 2.0,
      unlocks: ['quantum-algorithms', 'instant-compile'],
      morale: 15
    },
    visualChanges: {
      scale: 1.2,
      color: '#8b5cf6',
      particles: true,
      glow: true
    },
    upgradeTime: 60
  },

  {
    id: 'art-gallery-upgrade',
    buildingType: 'artGallery',
    level: 2,
    name: 'Holographic Exhibits',
    description: 'Interactive 3D art installations',
    icon: '🎨✨',
    requirements: {
      playerLevel: 5,
      resources: {
        energy: 400,
        minerals: 200
      },
      completedChallenges: ['mastery-2']
    },
    benefits: {
      morale: 40,
      unlocks: ['holographic-tech'],
      resourceGeneration: {
        energy: 5 // Tourism/inspiration generates energy
      }
    },
    visualChanges: {
      scale: 1.3,
      color: '#ec4899',
      particles: true,
      glow: true
    },
    upgradeTime: 45
  }
];

// Helper functions
export function getUpgradesForBuilding(buildingType: string): BuildingUpgrade[] {
  return BUILDING_UPGRADES.filter(u => u.buildingType === buildingType)
    .sort((a, b) => a.level - b.level);
}

export function getNextUpgrade(buildingType: string, currentLevel: number): BuildingUpgrade | null {
  const upgrades = getUpgradesForBuilding(buildingType);
  return upgrades.find(u => u.level === currentLevel + 1) || null;
}

export function canAffordUpgrade(
  upgrade: BuildingUpgrade,
  playerResources: Record<string, number>
): boolean {
  return Object.entries(upgrade.requirements.resources).every(
    ([resource, amount]) => (playerResources[resource] || 0) >= amount
  );
}

export function meetsRequirements(
  upgrade: BuildingUpgrade,
  playerLevel: number,
  completedChallenges: string[],
  completedUpgrades: string[]
): boolean {
  // Level check
  if (upgrade.requirements.playerLevel && playerLevel < upgrade.requirements.playerLevel) {
    return false;
  }

  // Prerequisite upgrades
  if (upgrade.requirements.prerequisiteUpgrades) {
    if (!upgrade.requirements.prerequisiteUpgrades.every(u => completedUpgrades.includes(u))) {
      return false;
    }
  }

  // Challenge requirements
  if (upgrade.requirements.completedChallenges) {
    if (!upgrade.requirements.completedChallenges.every(c => completedChallenges.includes(c))) {
      return false;
    }
  }

  return true;
}

export function calculateUpgradeBenefit(
  upgrade: BuildingUpgrade,
  baseProduction: number
): number {
  if (!upgrade.benefits.efficiency) return baseProduction;
  return baseProduction * upgrade.benefits.efficiency;
}

export function getAllUnlocks(completedUpgrades: string[]): string[] {
  const unlocks: string[] = [];
  
  completedUpgrades.forEach(upgradeId => {
    const upgrade = BUILDING_UPGRADES.find(u => u.id === upgradeId);
    if (upgrade?.benefits.unlocks) {
      unlocks.push(...upgrade.benefits.unlocks);
    }
  });

  return [...new Set(unlocks)]; // Remove duplicates
}

export function getTotalMoraleBonus(completedUpgrades: string[]): number {
  return completedUpgrades.reduce((total, upgradeId) => {
    const upgrade = BUILDING_UPGRADES.find(u => u.id === upgradeId);
    return total + (upgrade?.benefits.morale || 0);
  }, 0);
}

