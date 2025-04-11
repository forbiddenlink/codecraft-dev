import { Challenge } from './challenge';
import { GameStructureNode } from './gameStructure';

export interface Game {
  id: string;
  title: string;
  description: string;
  structure: GameStructureNode;
  challenges: Challenge[];
  currentState?: Record<string, unknown>;
} 