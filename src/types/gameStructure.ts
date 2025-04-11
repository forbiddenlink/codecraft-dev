export interface GameStructureNode {
  elementType: string;
  styles?: {
    color?: string;
    scale?: number;
    rotation?: [number, number, number];
    position?: [number, number, number];
    opacity?: number;
    shadow?: boolean;
  };
  children?: GameStructureNode[];
}

export interface GameStructureStyle extends GameStructureNode {
  style: Record<string, unknown>;
}

export type GameStructureNodeArray = GameStructureNode[]; 