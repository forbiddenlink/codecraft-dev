export interface BuildingCost {
  resourceId: string;
  amount: number;
}

export interface BuildingEffect {
  type: 'resource' | 'capacity' | 'efficiency' | 'special';
  target: string;
  value: number;
}

export type BuildingCategory = 'habitat' | 'production' | 'storage' | 'research' | 'special';

export interface BuildingTemplate {
  id: string;
  name: string;
  category: BuildingCategory;
  description: string;
  htmlTemplate: string;
  cssTemplate: string;
  jsTemplate?: string;
  model: string;
  icon: string;
  costs: BuildingCost[];
  buildTime: number; // seconds
  effects: BuildingEffect[];
  requiredLevel: number;
  gridSize: { width: number; height: number }; // Size in grid units
  previewScale: number; // Scale for 3D preview
}

export interface PlacedBuilding {
  id: string;
  templateId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  html: string; // Current HTML code
  css: string; // Current CSS code
  js?: string; // Current JS code (optional)
  status: 'construction' | 'active' | 'inactive';
  constructionProgress: number; // 0 to 1
  health: number; // Current health/durability
  effects: BuildingEffect[]; // Current active effects
}

// Building validation result
export interface BuildingValidation {
  isValid: boolean;
  errors: {
    html?: string[];
    css?: string[];
    js?: string[];
    resources?: string[];
  };
} 