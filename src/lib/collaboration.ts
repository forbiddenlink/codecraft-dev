import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from 'y-monaco'
import type * as monaco from 'monaco-editor'

export interface CollaborationConfig {
  /** WebSocket server URL (e.g., 'wss://your-server.com') */
  serverUrl: string
  /** Room identifier for the collaborative session */
  roomId: string
  /** Optional user info for awareness */
  user?: {
    name: string
    color: string
  }
}

export interface CollaborationInstance {
  /** The Yjs document containing shared state */
  doc: Y.Doc
  /** WebSocket provider for network sync */
  provider: WebsocketProvider
  /** Clean up all collaboration resources */
  destroy: () => void
}

/**
 * Set up real-time collaboration for a Monaco editor instance using Yjs CRDT.
 *
 * @param editor - The Monaco editor instance to bind
 * @param config - Collaboration configuration
 * @returns CollaborationInstance with doc, provider, and destroy method
 *
 * @example
 * ```ts
 * const collab = setupCollaboration(editor, {
 *   serverUrl: 'wss://your-server.com',
 *   roomId: 'project-123',
 *   user: { name: 'Alice', color: '#ff0000' }
 * })
 *
 * // Clean up when done
 * collab.destroy()
 * ```
 */
export function setupCollaboration(
  editor: monaco.editor.IStandaloneCodeEditor,
  config: CollaborationConfig
): CollaborationInstance {
  const { serverUrl, roomId, user } = config

  // Create a new Yjs document for shared state
  const doc = new Y.Doc()

  // Connect to WebSocket server for real-time sync
  const provider = new WebsocketProvider(serverUrl, roomId, doc)

  // Set user awareness info if provided
  if (user) {
    provider.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
    })
  }

  // Get the shared text type for Monaco content
  const ytext = doc.getText('monaco')

  // Get the editor model (will throw if model is null)
  const model = editor.getModel()
  if (!model) {
    throw new Error('Editor model is null. Ensure the editor has a model before setting up collaboration.')
  }

  // Bind Yjs text to Monaco editor with awareness
  const binding = new MonacoBinding(
    ytext,
    model,
    new Set([editor]),
    provider.awareness
  )

  return {
    doc,
    provider,
    destroy: () => {
      binding.destroy()
      provider.destroy()
      doc.destroy()
    },
  }
}

/**
 * Create a standalone Yjs document without editor binding.
 * Useful for syncing other state (e.g., cursor positions, selections, metadata).
 *
 * @param serverUrl - WebSocket server URL
 * @param roomId - Room identifier
 * @returns Object with doc, provider, and destroy method
 */
export function createCollaborativeDoc(
  serverUrl: string,
  roomId: string
): Omit<CollaborationInstance, 'doc'> & { doc: Y.Doc } {
  const doc = new Y.Doc()
  const provider = new WebsocketProvider(serverUrl, roomId, doc)

  return {
    doc,
    provider,
    destroy: () => {
      provider.destroy()
      doc.destroy()
    },
  }
}
