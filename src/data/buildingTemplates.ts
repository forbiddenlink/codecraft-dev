import { BuildingModelType } from '@/components/game/buildings/BuildingModel';

// Building effect types
export type EffectType = 'resource' | 'capacity' | 'efficiency' | 'special';

// Building categories
export type BuildingCategory = 'habitat' | 'production' | 'storage' | 'research' | 'special';

// Resource types
export type ResourceType = 'energy' | 'minerals' | 'water' | 'oxygen' | 'food' | 'colonists' | 'research';

// Interface for building costs
export interface BuildingCost {
  resourceId: ResourceType;
  amount: number;
}

// Interface for building effects
export interface BuildingEffect {
  type: EffectType;
  target: ResourceType;
  value: number;
}

// Interface for building template
export interface BuildingTemplate {
  id: string;
  name: string;
  description: string;
  category: BuildingCategory;
  icon: string;
  htmlElement: BuildingModelType;
  defaultHtml: string;
  defaultCss: string;
  defaultJs?: string;
  costs: BuildingCost[];
  effects: BuildingEffect[];
  gridSize: {
    width: number;
    height: number;
    depth: number;
  };
  constructionTime: number; // seconds
  requiredLevel: number;
  unlockRequirement?: {
    type: 'challenge' | 'level' | 'resource';
    value: string | number;
  };
  defaultStyles: Record<string, string | number>;
}

// Interface for placed buildings
export interface PlacedBuilding {
  id: string;
  templateId: string;
  position: { x: number, y: number, z: number };
  rotation: number; // Y-axis rotation in radians
  status: 'construction' | 'active' | 'inactive' | 'damaged';
  constructionProgress: number; // 0-1
  health: number; // 0-100
  efficiency: number; // 0-1
  effects: BuildingEffect[];
  // Reference to HTML/CSS that created this building
  htmlNodeRef?: string;
  cssRef?: string;
}

// Building templates data
export const buildingTemplates: Record<string, BuildingTemplate> = {
  'habitat-module': {
    id: 'habitat-module',
    name: 'Habitat Module',
    description: 'Living quarters for colonists',
    category: 'habitat',
    icon: '🏠',
    htmlElement: 'habitat',
    defaultHtml: '<habitat class="habitat-module">\n  <header class="module-entrance">Habitat Module</header>\n  <div class="living-space">\n    <div class="crew-quarters">Crew Quarters</div>\n  </div>\n  <footer class="life-support">Life Support Systems</footer>\n</habitat>',
    defaultCss: '.habitat-module {\n  width: 100%;\n  height: 80px;\n  background-color: #7bb5d4;\n  border-radius: 15px;\n  --energy-level: 85;\n}\n\n.module-entrance {\n  height: 20px;\n  background-color: #5d8ca8;\n  text-align: center;\n}\n\n.living-space {\n  display: flex;\n  height: 40px;\n}\n\n.crew-quarters {\n  width: 100%;\n  background-color: #a8c6d9;\n}\n\n.life-support {\n  height: 20px;\n  background-color: #5d8ca8;\n  text-align: center;\n}',
    costs: [
      { resourceId: 'energy', amount: 50 },
      { resourceId: 'minerals', amount: 100 }
    ],
    effects: [
      { type: 'capacity', target: 'colonists', value: 10 }
    ],
    gridSize: {
      width: 2.5,
      height: 2,
      depth: 2.5
    },
    constructionTime: 30,
    requiredLevel: 1,
    defaultStyles: {
      backgroundColor: '#7bb5d4',
      borderRadius: '15px'
    }
  },
  
  'laboratory-module': {
    id: 'laboratory-module',
    name: 'Research Laboratory',
    description: 'Generates research points for new technologies',
    category: 'research',
    icon: '🧪',
    htmlElement: 'laboratory',
    defaultHtml: '<laboratory class="lab-module">\n  <header class="lab-entrance">Research Laboratory</header>\n  <div class="lab-space">\n    <div class="research-station">Research Station</div>\n  </div>\n  <footer class="lab-systems">Laboratory Systems</footer>\n</laboratory>',
    defaultCss: '.lab-module {\n  width: 100%;\n  height: 80px;\n  background-color: #a8c6d9;\n  border-radius: 15px;\n}\n\n.lab-entrance {\n  height: 20px;\n  background-color: #5d8ca8;\n  text-align: center;\n}\n\n.lab-space {\n  display: flex;\n  height: 40px;\n}\n\n.research-station {\n  width: 100%;\n  background-color: #c1d9e8;\n}\n\n.lab-systems {\n  height: 20px;\n  background-color: #5d8ca8;\n  text-align: center;\n}',
    costs: [
      { resourceId: 'energy', amount: 75 },
      { resourceId: 'minerals', amount: 150 }
    ],
    effects: [
      { type: 'resource', target: 'research', value: 5 }
    ],
    gridSize: {
      width: 2,
      height: 2,
      depth: 2
    },
    constructionTime: 45,
    requiredLevel: 2,
    unlockRequirement: {
      type: 'challenge',
      value: 'html-basics'
    },
    defaultStyles: {
      backgroundColor: '#a8c6d9',
      borderRadius: '15px'
    }
  },
  
  'energy-generator': {
    id: 'energy-generator',
    name: 'Energy Generator',
    description: 'Produces energy for colony operations',
    category: 'production',
    icon: '⚡',
    htmlElement: 'generator',
    defaultHtml: '<generator class="energy-generator">\n  <div class="generator-core">Generator Core</div>\n  <footer class="generator-base">Power Systems</footer>\n</generator>',
    defaultCss: '.energy-generator {\n  width: 80%;\n  height: 70px;\n  background-color: #4a5568;\n  border-radius: 5px;\n  --energy-level: 100;\n}\n\n.generator-core {\n  height: 50px;\n  background-color: #fbbf24;\n  text-align: center;\n  animation: pulse 2s infinite;\n}\n\n.generator-base {\n  height: 20px;\n  background-color: #374151;\n  text-align: center;\n}\n\n@keyframes pulse {\n  0% { opacity: 0.7; }\n  50% { opacity: 1; }\n  100% { opacity: 0.7; }\n}',
    costs: [
      { resourceId: 'minerals', amount: 200 }
    ],
    effects: [
      { type: 'resource', target: 'energy', value: 10 }
    ],
    gridSize: {
      width: 1.5,
      height: 2,
      depth: 1.5
    },
    constructionTime: 60,
    requiredLevel: 1,
    defaultStyles: {
      backgroundColor: '#4a5568',
      '--energy-level': 100
    }
  },
  
  'storage-vault': {
    id: 'storage-vault',
    name: 'Storage Vault',
    description: 'Increases resource storage capacity',
    category: 'storage',
    icon: '📦',
    htmlElement: 'storage',
    defaultHtml: '<storage class="storage-vault">\n  <div class="storage-container">Storage Vault</div>\n  <footer class="vault-base">Inventory Systems</footer>\n</storage>',
    defaultCss: '.storage-vault {\n  width: 90%;\n  height: 60px;\n  background-color: #6b7280;\n  border-radius: 5px;\n}\n\n.storage-container {\n  height: 40px;\n  background-color: #9ca3af;\n  text-align: center;\n}\n\n.vault-base {\n  height: 20px;\n  background-color: #4b5563;\n  text-align: center;\n}',
    costs: [
      { resourceId: 'energy', amount: 25 },
      { resourceId: 'minerals', amount: 150 }
    ],
    effects: [
      { type: 'capacity', target: 'minerals', value: 500 },
      { type: 'capacity', target: 'water', value: 500 },
      { type: 'capacity', target: 'food', value: 500 }
    ],
    gridSize: {
      width: 2,
      height: 1.5,
      depth: 2
    },
    constructionTime: 30,
    requiredLevel: 1,
    defaultStyles: {
      backgroundColor: '#6b7280',
      borderRadius: '5px'
    }
  },
  
  'greenhouse-module': {
    id: 'greenhouse-module',
    name: 'Greenhouse Module',
    description: 'Produces food for the colony',
    category: 'production',
    icon: '🌱',
    htmlElement: 'greenhouse',
    defaultHtml: '<greenhouse class="greenhouse-module">\n  <div class="growing-area">Growing Area</div>\n  <footer class="greenhouse-systems">Hydroponics Systems</footer>\n</greenhouse>',
    defaultCss: '.greenhouse-module {\n  width: 90%;\n  height: 70px;\n  background-color: #10b981;\n  border-radius: 15px;\n}\n\n.growing-area {\n  height: 50px;\n  background-color: #34d399;\n  text-align: center;\n}\n\n.greenhouse-systems {\n  height: 20px;\n  background-color: #059669;\n  text-align: center;\n}',
    costs: [
      { resourceId: 'energy', amount: 50 },
      { resourceId: 'minerals', amount: 100 },
      { resourceId: 'water', amount: 100 }
    ],
    effects: [
      { type: 'resource', target: 'food', value: 8 },
      { type: 'resource', target: 'water', value: -3 }
    ],
    gridSize: {
      width: 2,
      height: 2,
      depth: 2
    },
    constructionTime: 45,
    requiredLevel: 2,
    unlockRequirement: {
      type: 'challenge',
      value: 'css-basics'
    },
    defaultStyles: {
      backgroundColor: '#10b981',
      borderRadius: '15px'
    }
  },
  
  'nav-corridor': {
    id: 'nav-corridor',
    name: 'Connection Corridor',
    description: 'Connects different parts of the colony',
    category: 'habitat',
    icon: '🔄',
    htmlElement: 'nav',
    defaultHtml: '<nav class="corridor">\n  <div class="passage">Connection Corridor</div>\n</nav>',
    defaultCss: '.corridor {\n  width: 100%;\n  height: 40px;\n  background-color: #5d8ca8;\n}\n\n.passage {\n  width: 100%;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}',
    costs: [
      { resourceId: 'minerals', amount: 50 }
    ],
    effects: [
      { type: 'efficiency', target: 'colonists', value: 0.1 }
    ],
    gridSize: {
      width: 3,
      height: 1,
      depth: 1
    },
    constructionTime: 15,
    requiredLevel: 1,
    defaultStyles: {
      backgroundColor: '#5d8ca8'
    }
  },
  
  'command-center': {
    id: 'command-center',
    name: 'Command Center',
    description: 'Central control hub for the colony',
    category: 'special',
    icon: '🎮',
    htmlElement: 'command',
    defaultHtml: '<command class="command-center">\n  <header class="command-entrance">Command Center</header>\n  <div class="control-room">\n    <div class="main-console">Main Console</div>\n    <div class="monitoring-station">Monitoring Station</div>\n  </div>\n  <footer class="command-systems">Control Systems</footer>\n</command>',
    defaultCss: '.command-center {\n  width: 120%;\n  height: 100px;\n  background-color: #3b82f6;\n  border-radius: 15px;\n}\n\n.command-entrance {\n  height: 20px;\n  background-color: #1e3a8a;\n  text-align: center;\n}\n\n.control-room {\n  display: flex;\n  height: 60px;\n}\n\n.main-console {\n  width: 60%;\n  background-color: #60a5fa;\n  text-align: center;\n}\n\n.monitoring-station {\n  width: 40%;\n  background-color: #93c5fd;\n  text-align: center;\n}\n\n.command-systems {\n  height: 20px;\n  background-color: #1e3a8a;\n  text-align: center;\n}',
    defaultJs: 'document.addEventListener("DOMContentLoaded", function() {\n  const commandCenter = document.querySelector(".command-center");\n  const mainConsole = document.querySelector(".main-console");\n  \n  // Add interaction to main console\n  mainConsole.addEventListener("click", function() {\n    colony.addResource("efficiency", 5);\n    // Visual feedback\n    this.style.backgroundColor = "#2563eb";\n    setTimeout(() => {\n      this.style.backgroundColor = "#60a5fa";\n    }, 500);\n  });\n});',
    costs: [
      { resourceId: 'energy', amount: 100 },
      { resourceId: 'minerals', amount: 300 },
      { resourceId: 'research', amount: 50 }
    ],
    effects: [
      { type: 'efficiency', target: 'energy', value: 0.2 },
      { type: 'efficiency', target: 'research', value: 0.3 },
      { type: 'special', target: 'colonists', value: 5 }
    ],
    gridSize: {
      width: 3.5,
      height: 2.5,
      depth: 3.5
    },
    constructionTime: 120,
    requiredLevel: 3,
    unlockRequirement: {
      type: 'challenge',
      value: 'javascript-basics'
    },
    defaultStyles: {
      backgroundColor: '#3b82f6',
      borderRadius: '15px'
    }
  }
}; 