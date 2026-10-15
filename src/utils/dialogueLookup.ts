import type { DialogueNode, DialogueTree } from './dialogueSystem'

/** Finds the active dialogue node from the redux ids; null when the tree or node is unknown. */
export function resolveDialogueNode(
  trees: readonly DialogueTree[],
  treeId: string | null,
  nodeId: string | null
): DialogueNode | null {
  if (!treeId || !nodeId) return null
  const tree = trees.find((t) => t.id === treeId)
  return tree?.nodes.get(nodeId) ?? null
}
