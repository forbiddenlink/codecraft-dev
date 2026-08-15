import type { Challenge } from './challenge'
import type { GameStructureNode } from './gameStructure'

export interface Game {
  id: string
  title: string
  description: string
  structure: GameStructureNode
  challenges: Challenge[]
  currentState?: Record<string, unknown>
}
