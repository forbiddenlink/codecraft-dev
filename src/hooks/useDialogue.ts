/**
 * Dialogue Hook
 * React hook for managing NPC conversations
 */

import { useState, useCallback } from 'react';
import { getDialogueSystem } from '@/utils/dialogueSystem';
import type { DialogueTree, DialogueNode, DialogueChoice } from '@/utils/dialogueSystem';

export interface UseDialogueReturn {
  isActive: boolean;
  currentTree: DialogueTree | null;
  currentNode: DialogueNode | null;
  availableChoices: DialogueChoice[];
  startDialogue: (npcId: string) => void;
  makeChoice: (choiceId: string) => void;
  continue: () => void;
  endDialogue: () => void;
}

export function useDialogue(): UseDialogueReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentTree, setCurrentTree] = useState<DialogueTree | null>(null);
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
  const [availableChoices, setAvailableChoices] = useState<DialogueChoice[]>([]);

  const dialogueSystem = getDialogueSystem();

  const startDialogue = useCallback((npcId: string) => {
    const { tree, node } = dialogueSystem.startConversation(npcId);

    if (tree && node) {
      setCurrentTree(tree);
      setCurrentNode(node);
      setIsActive(true);

      // Load available choices
      const choices = dialogueSystem.getAvailableChoices(tree.id, node.id);
      setAvailableChoices(choices);
    }
  }, []);

  const makeChoice = useCallback(
    (choiceId: string) => {
      if (!currentTree || !currentNode) return;

      const nextNode = dialogueSystem.advanceDialogue(
        currentTree.id,
        currentNode.id,
        choiceId
      );

      if (nextNode) {
        setCurrentNode(nextNode);
        const choices = dialogueSystem.getAvailableChoices(currentTree.id, nextNode.id);
        setAvailableChoices(choices);
      } else {
        // Conversation ended
        endDialogue();
      }
    },
    [currentTree, currentNode]
  );

  const continueDialogue = useCallback(() => {
    if (!currentTree || !currentNode) return;

    const nextNode = dialogueSystem.advanceDialogue(currentTree.id, currentNode.id);

    if (nextNode) {
      setCurrentNode(nextNode);
      const choices = dialogueSystem.getAvailableChoices(currentTree.id, nextNode.id);
      setAvailableChoices(choices);
    } else {
      // Conversation ended
      endDialogue();
    }
  }, [currentTree, currentNode]);

  const endDialogue = useCallback(() => {
    setIsActive(false);
    setCurrentTree(null);
    setCurrentNode(null);
    setAvailableChoices([]);
  }, []);

  return {
    isActive,
    currentTree,
    currentNode,
    availableChoices,
    startDialogue,
    makeChoice: makeChoice,
    continue: continueDialogue,
    endDialogue,
  };
}
