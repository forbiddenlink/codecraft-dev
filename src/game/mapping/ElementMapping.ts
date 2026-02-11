import { Vector3, Object3D, Material, Color } from 'three';

export interface GameObjectDefinition {
  model: string;
  defaultProperties: {
    scale: Vector3;
    color?: string;
    opacity?: number;
    emissive?: string;
    metalness?: number;
    roughness?: number;
  };
  behaviors: string[];
}

export interface TransformRules {
  scale: Vector3;
  rotation: Vector3;
  position: Vector3;
  parent?: string;
  constraints?: {
    minScale?: Vector3;
    maxScale?: Vector3;
    allowRotation?: boolean;
    allowTranslation?: boolean;
  };
}

export interface ElementMapping {
  htmlTag: string;
  gameObject: GameObjectDefinition;
  transformRules: TransformRules;
  children?: {
    allowedTags: string[];
    maxCount?: number;
    positioning: 'grid' | 'flex' | 'absolute';
  };
}

// Base mappings for HTML structural elements
export const BASE_MAPPINGS: Record<string, ElementMapping> = {
  div: {
    htmlTag: 'div',
    gameObject: {
      model: 'models/structures/basic-block.glb',
      defaultProperties: {
        scale: new Vector3(1, 1, 1),
        color: '#1E3A8A', // cosmic-blue
        opacity: 1,
        metalness: 0.5,
        roughness: 0.5
      },
      behaviors: ['resizable', 'colorable', 'interactive']
    },
    transformRules: {
      scale: new Vector3(1, 1, 1),
      rotation: new Vector3(0, 0, 0),
      position: new Vector3(0, 0, 0),
      constraints: {
        minScale: new Vector3(0.5, 0.5, 0.5),
        maxScale: new Vector3(5, 5, 5),
        allowRotation: true,
        allowTranslation: true
      }
    },
    children: {
      allowedTags: ['*'],
      positioning: 'grid'
    }
  },

  main: {
    htmlTag: 'main',
    gameObject: {
      model: 'models/structures/colony-center.glb',
      defaultProperties: {
        scale: new Vector3(2, 2, 2),
        color: '#F8FAFC', // stellar-white
        emissive: '#FBBF24', // energy-yellow
        metalness: 0.7,
        roughness: 0.3
      },
      behaviors: ['central-hub', 'resource-distributor', 'interactive']
    },
    transformRules: {
      scale: new Vector3(2, 2, 2),
      rotation: new Vector3(0, 0, 0),
      position: new Vector3(0, 0, 0),
      constraints: {
        allowRotation: false,
        allowTranslation: false
      }
    },
    children: {
      allowedTags: ['section', 'article', 'nav', 'aside'],
      positioning: 'grid'
    }
  },

  section: {
    htmlTag: 'section',
    gameObject: {
      model: 'models/structures/major-section.glb',
      defaultProperties: {
        scale: new Vector3(1.5, 1.5, 1.5),
        color: '#1E3A8A', // cosmic-blue
        opacity: 0.9,
        metalness: 0.6,
        roughness: 0.4
      },
      behaviors: ['resource-container', 'expandable', 'interactive']
    },
    transformRules: {
      scale: new Vector3(1.5, 1.5, 1.5),
      rotation: new Vector3(0, 0, 0),
      position: new Vector3(0, 0, 0),
      constraints: {
        minScale: new Vector3(1, 1, 1),
        maxScale: new Vector3(3, 3, 3),
        allowRotation: true,
        allowTranslation: true
      }
    },
    children: {
      allowedTags: ['article', 'div', 'aside'],
      positioning: 'flex'
    }
  }
};

// CSS property to game world effect mapping
export interface CSSToGameMapping {
  cssProperty: string;
  gameProperty: {
    component: string;
    property: string;
    converter: (value: string) => number | Color | boolean | string;
  };
}

export const CSS_MAPPINGS: Record<string, CSSToGameMapping> = {
  backgroundColor: {
    cssProperty: 'background-color',
    gameProperty: {
      component: 'material',
      property: 'color',
      converter: (value: string) => value // Color conversion handled by Three.js
    }
  },
  width: {
    cssProperty: 'width',
    gameProperty: {
      component: 'transform',
      property: 'scale.x',
      converter: (value: string) => parseFloat(value) / 100 // Convert percentage to scale
    }
  },
  height: {
    cssProperty: 'height',
    gameProperty: {
      component: 'transform',
      property: 'scale.y',
      converter: (value: string) => parseFloat(value) / 100
    }
  },
  opacity: {
    cssProperty: 'opacity',
    gameProperty: {
      component: 'material',
      property: 'opacity',
      converter: (value: string) => parseFloat(value)
    }
  }
};

// Helper function to get mapping for an HTML element
export function getElementMapping(tag: string): ElementMapping {
  return BASE_MAPPINGS[tag.toLowerCase()] || BASE_MAPPINGS.div;
}

// Helper function to apply CSS properties to a game object
export function applyCSSToGameObject(
  gameObject: Object3D,
  cssProperties: Record<string, string>
): void {
  Object.entries(cssProperties).forEach(([property, value]) => {
    const mapping = CSS_MAPPINGS[property];
    if (mapping) {
      const convertedValue = mapping.gameProperty.converter(value);
      if (mapping.gameProperty.component === 'material' && 'material' in gameObject) {
        ((gameObject as any).material as any)[mapping.gameProperty.property] = convertedValue;
      } else if (mapping.gameProperty.component === 'transform') {
        const [prop, axis] = mapping.gameProperty.property.split('.');
        if (axis) {
          (gameObject as any)[prop][axis] = convertedValue as number;
        } else {
          (gameObject as any)[prop] = convertedValue as number;
        }
      }
    }
  });
} 