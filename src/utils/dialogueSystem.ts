/**
 * Advanced NPC Dialogue System
 * Branching conversations with context-aware responses
 */

export interface DialogueNode {
  id: string;
  speaker: string; // NPC name
  text: string;
  emotion?: 'happy' | 'neutral' | 'sad' | 'excited' | 'angry' | 'confused' | 'proud';
  animation?: string; // Animation to play
  conditions?: DialogueCondition[]; // Conditions to show this node
  effects?: DialogueEffect[]; // Effects when this node is shown
  choices?: DialogueChoice[];
  next?: string | null; // Auto-advance to next node (null = end conversation)
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string | null; // null = end conversation
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
  requirementText?: string; // Text to show if requirements not met
}

export interface DialogueCondition {
  type:
    | 'hasCompletedChallenge'
    | 'hasSkill'
    | 'levelGreaterThan'
    | 'hasItem'
    | 'questStatus'
    | 'timeOfDay'
    | 'visitCount';
  param: string | number;
  operator?: '>' | '<' | '=' | '>=' | '<=';
  value?: any;
}

export interface DialogueEffect {
  type:
    | 'giveQuest'
    | 'completeQuest'
    | 'giveItem'
    | 'giveXP'
    | 'giveResources'
    | 'unlockChallenge'
    | 'setFlag'
    | 'playSound';
  param: string | number;
  value?: any;
}

export interface DialogueTree {
  id: string;
  npcId: string;
  title: string;
  startNodeId: string;
  nodes: Map<string, DialogueNode>;
  priority?: number; // Higher priority trees shown first
}

export interface DialogueHistory {
  npcId: string;
  treeId: string;
  nodeId: string;
  choiceId?: string;
  timestamp: Date;
}

export interface NPCState {
  npcId: string;
  visitCount: number;
  lastVisit?: Date;
  relationship: number; // -100 to 100
  flags: Set<string>; // Custom flags for tracking interactions
  completedTrees: Set<string>;
}

class DialogueSystem {
  private trees: Map<string, DialogueTree> = new Map();
  private npcStates: Map<string, NPCState> = new Map();
  private dialogueHistory: DialogueHistory[] = [];
  private storageKey = 'codecraft_dialogue';

  // Player state (would be injected from game state in real implementation)
  private playerState = {
    completedChallenges: new Set<string>(),
    level: 1,
    inventory: new Map<string, number>(),
    quests: new Map<string, 'active' | 'completed'>(),
    flags: new Set<string>(),
  };

  constructor() {
    this.loadState();
  }

  /**
   * Register a dialogue tree
   */
  registerDialogueTree(tree: DialogueTree): void {
    this.trees.set(tree.id, tree);
  }

  /**
   * Get appropriate dialogue tree for an NPC
   */
  getDialogueTree(npcId: string): DialogueTree | null {
    // Find all trees for this NPC
    const npcTrees = Array.from(this.trees.values())
      .filter((tree) => tree.npcId === npcId)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Return first tree with met conditions
    for (const tree of npcTrees) {
      const startNode = tree.nodes.get(tree.startNodeId);
      if (startNode && this.checkConditions(startNode.conditions || [])) {
        return tree;
      }
    }

    return npcTrees[0] || null;
  }

  /**
   * Start conversation with NPC
   */
  startConversation(npcId: string): {
    tree: DialogueTree | null;
    node: DialogueNode | null;
  } {
    // Update NPC state
    const state = this.getOrCreateNPCState(npcId);
    state.visitCount++;
    state.lastVisit = new Date();
    this.saveState();

    const tree = this.getDialogueTree(npcId);
    if (!tree) return { tree: null, node: null };

    const node = tree.nodes.get(tree.startNodeId) || null;

    if (node) {
      this.applyEffects(node.effects || []);
      this.recordHistory(npcId, tree.id, node.id);
    }

    return { tree, node };
  }

  /**
   * Advance dialogue to next node
   */
  advanceDialogue(
    treeId: string,
    currentNodeId: string,
    choiceId?: string
  ): DialogueNode | null {
    const tree = this.trees.get(treeId);
    if (!tree) return null;

    const currentNode = tree.nodes.get(currentNodeId);
    if (!currentNode) return null;

    let nextNodeId: string | null = null;

    if (choiceId) {
      // Player made a choice
      const choice = currentNode.choices?.find((c) => c.id === choiceId);
      if (!choice) return null;

      // Check choice conditions
      if (!this.checkConditions(choice.conditions || [])) {
        return null; // Choice not available
      }

      nextNodeId = choice.nextNodeId;
      this.applyEffects(choice.effects || []);
      this.recordHistory(tree.npcId, treeId, currentNodeId, choiceId);
    } else {
      // Auto-advance
      nextNodeId = currentNode.next || null;
    }

    if (!nextNodeId) {
      // Conversation ended
      const npcState = this.npcStates.get(tree.npcId);
      if (npcState) {
        npcState.completedTrees.add(treeId);
        this.saveState();
      }
      return null;
    }

    const nextNode = tree.nodes.get(nextNodeId) || null;
    if (nextNode) {
      this.applyEffects(nextNode.effects || []);
      this.recordHistory(tree.npcId, treeId, nextNode.id);
    }

    return nextNode;
  }

  /**
   * Get available choices for a node
   */
  getAvailableChoices(treeId: string, nodeId: string): DialogueChoice[] {
    const tree = this.trees.get(treeId);
    if (!tree) return [];

    const node = tree.nodes.get(nodeId);
    if (!node || !node.choices) return [];

    return node.choices.map((choice) => ({
      ...choice,
      // Mark if requirements are met
      requirementText: this.checkConditions(choice.conditions || [])
        ? undefined
        : choice.requirementText || 'Requirements not met',
    }));
  }

  /**
   * Check if all conditions are met
   */
  private checkConditions(conditions: DialogueCondition[]): boolean {
    return conditions.every((condition) => {
      switch (condition.type) {
        case 'hasCompletedChallenge':
          return this.playerState.completedChallenges.has(condition.param as string);

        case 'levelGreaterThan':
          return this.playerState.level > (condition.param as number);

        case 'hasItem':
          const itemCount = this.playerState.inventory.get(condition.param as string) || 0;
          if (condition.operator && condition.value !== undefined) {
            return this.compareValues(itemCount, condition.operator, condition.value);
          }
          return itemCount > 0;

        case 'questStatus':
          return this.playerState.quests.get(condition.param as string) === condition.value;

        case 'visitCount':
          const npcState = this.npcStates.get(condition.param as string);
          if (!npcState || !condition.operator || condition.value === undefined) return false;
          return this.compareValues(npcState.visitCount, condition.operator, condition.value);

        default:
          return true;
      }
    });
  }

  /**
   * Compare values with operator
   */
  private compareValues(
    a: number,
    operator: '>' | '<' | '=' | '>=' | '<=',
    b: number
  ): boolean {
    switch (operator) {
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '=':
        return a === b;
      case '>=':
        return a >= b;
      case '<=':
        return a <= b;
      default:
        return false;
    }
  }

  /**
   * Apply dialogue effects
   */
  private applyEffects(effects: DialogueEffect[]): void {
    effects.forEach((effect) => {
      switch (effect.type) {
        case 'giveQuest':
          this.playerState.quests.set(effect.param as string, 'active');
          break;

        case 'completeQuest':
          this.playerState.quests.set(effect.param as string, 'completed');
          break;

        case 'giveItem':
          const currentCount = this.playerState.inventory.get(effect.param as string) || 0;
          this.playerState.inventory.set(
            effect.param as string,
            currentCount + (effect.value || 1)
          );
          break;

        case 'giveXP':
          // In real implementation, update player XP
          break;

        case 'setFlag':
          this.playerState.flags.add(effect.param as string);
          break;

        case 'playSound':
          // In real implementation, play sound
          break;
      }
    });
  }

  /**
   * Get or create NPC state
   */
  private getOrCreateNPCState(npcId: string): NPCState {
    if (!this.npcStates.has(npcId)) {
      this.npcStates.set(npcId, {
        npcId,
        visitCount: 0,
        relationship: 0,
        flags: new Set(),
        completedTrees: new Set(),
      });
    }
    return this.npcStates.get(npcId)!;
  }

  /**
   * Record dialogue history
   */
  private recordHistory(
    npcId: string,
    treeId: string,
    nodeId: string,
    choiceId?: string
  ): void {
    this.dialogueHistory.push({
      npcId,
      treeId,
      nodeId,
      choiceId,
      timestamp: new Date(),
    });

    // Keep only last 1000 entries
    if (this.dialogueHistory.length > 1000) {
      this.dialogueHistory = this.dialogueHistory.slice(-1000);
    }

    this.saveState();
  }

  /**
   * Get NPC relationship
   */
  getRelationship(npcId: string): number {
    return this.npcStates.get(npcId)?.relationship || 0;
  }

  /**
   * Modify NPC relationship
   */
  modifyRelationship(npcId: string, amount: number): void {
    const state = this.getOrCreateNPCState(npcId);
    state.relationship = Math.max(-100, Math.min(100, state.relationship + amount));
    this.saveState();
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return;

    try {
      const state = {
        npcStates: Array.from(this.npcStates.entries()).map(([id, state]) => [
          id,
          {
            ...state,
            flags: Array.from(state.flags),
            completedTrees: Array.from(state.completedTrees),
          },
        ]),
        dialogueHistory: this.dialogueHistory,
      };

      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save dialogue state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const state = JSON.parse(stored);

      this.npcStates = new Map(
        state.npcStates.map(([id, s]: [string, any]) => [
          id,
          {
            ...s,
            flags: new Set(s.flags),
            completedTrees: new Set(s.completedTrees),
            lastVisit: s.lastVisit ? new Date(s.lastVisit) : undefined,
          },
        ])
      );

      this.dialogueHistory = state.dialogueHistory.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load dialogue state:', error);
    }
  }

  /**
   * Update player state (called from game manager)
   */
  updatePlayerState(state: Partial<typeof this.playerState>): void {
    Object.assign(this.playerState, state);
  }
}

// Singleton instance
let dialogueInstance: DialogueSystem | null = null;

export function getDialogueSystem(): DialogueSystem {
  if (!dialogueInstance) {
    dialogueInstance = new DialogueSystem();
  }
  return dialogueInstance;
}

// Convenience exports
export const registerDialogue = (tree: DialogueTree) =>
  getDialogueSystem().registerDialogueTree(tree);
export const startConversation = (npcId: string) =>
  getDialogueSystem().startConversation(npcId);
export const advanceDialogue = (treeId: string, nodeId: string, choiceId?: string) =>
  getDialogueSystem().advanceDialogue(treeId, nodeId, choiceId);
export const getAvailableChoices = (treeId: string, nodeId: string) =>
  getDialogueSystem().getAvailableChoices(treeId, nodeId);
export const getNPCRelationship = (npcId: string) =>
  getDialogueSystem().getRelationship(npcId);
