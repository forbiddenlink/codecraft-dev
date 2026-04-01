/**
 * PartyKit Server for CodeCraft Multiplayer
 * Handles real-time collaborative coding sessions
 */

import type * as Party from "partykit/server";

// Types for the collaboration session
interface Player {
  id: string;
  username: string;
  color: string;
  level: number;
  xp: number;
  cursor?: CursorPosition;
  isActive: boolean;
  joinedAt: number;
}

interface CursorPosition {
  language: "html" | "css" | "javascript";
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
  type: "text" | "system" | "code-snippet";
  codeSnippet?: {
    language: string;
    code: string;
  };
}

interface RoomState {
  hostId: string;
  challengeId: string | null;
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  settings: {
    maxParticipants: number;
    allowEditing: "host-only" | "all" | "turn-based";
    voiceChat: boolean;
    allowSpectators: boolean;
  };
  createdAt: number;
  isActive: boolean;
}

// Message types
type ClientMessage =
  | { type: "join"; player: Player }
  | { type: "leave" }
  | { type: "cursor"; position: CursorPosition }
  | { type: "code"; language: "html" | "css" | "javascript"; code: string }
  | { type: "chat"; message: string; codeSnippet?: ChatMessage["codeSnippet"] }
  | { type: "kick"; targetUserId: string }
  | { type: "settings"; settings: Partial<RoomState["settings"]> }
  | { type: "sync-request" };

type ServerMessage =
  | { type: "player-joined"; player: Player }
  | { type: "player-left"; playerId: string }
  | { type: "cursor-update"; playerId: string; position: CursorPosition }
  | { type: "code-update"; playerId: string; language: "html" | "css" | "javascript"; code: string }
  | { type: "chat"; message: ChatMessage }
  | { type: "kicked"; targetUserId: string }
  | { type: "settings-update"; settings: RoomState["settings"] }
  | { type: "sync"; state: RoomState; players: Player[]; recentMessages: ChatMessage[] }
  | { type: "error"; message: string };

export default class CodeCraftParty implements Party.Server {
  private players: Map<string, Player> = new Map();
  private state: RoomState | null = null;
  private messages: ChatMessage[] = [];
  private connectionToPlayer: Map<string, string> = new Map();

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void {
    // Connection established - wait for join message with player info
    console.log(`[${this.room.id}] Connection ${conn.id} established`);
  }

  onClose(conn: Party.Connection): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (playerId) {
      this.handlePlayerLeave(conn, playerId);
    }
  }

  onMessage(message: string, sender: Party.Connection): void {
    try {
      const data = JSON.parse(message) as ClientMessage;

      switch (data.type) {
        case "join":
          this.handleJoin(sender, data.player);
          break;
        case "leave":
          const playerId = this.connectionToPlayer.get(sender.id);
          if (playerId) {
            this.handlePlayerLeave(sender, playerId);
          }
          break;
        case "cursor":
          this.handleCursorUpdate(sender, data.position);
          break;
        case "code":
          this.handleCodeUpdate(sender, data.language, data.code);
          break;
        case "chat":
          this.handleChat(sender, data.message, data.codeSnippet);
          break;
        case "kick":
          this.handleKick(sender, data.targetUserId);
          break;
        case "settings":
          this.handleSettingsUpdate(sender, data.settings);
          break;
        case "sync-request":
          this.handleSyncRequest(sender);
          break;
      }
    } catch (error) {
      console.error(`[${this.room.id}] Error processing message:`, error);
      this.sendToConnection(sender, { type: "error", message: "Invalid message format" });
    }
  }

  private handleJoin(conn: Party.Connection, player: Player): void {
    // Initialize room state if this is the first player (host)
    if (!this.state) {
      this.state = {
        hostId: player.id,
        challengeId: null,
        code: { html: "", css: "", javascript: "" },
        settings: {
          maxParticipants: 4,
          allowEditing: "all",
          voiceChat: false,
          allowSpectators: true,
        },
        createdAt: Date.now(),
        isActive: true,
      };
    }

    // Check if room is full
    if (this.players.size >= this.state.settings.maxParticipants) {
      this.sendToConnection(conn, { type: "error", message: "Room is full" });
      return;
    }

    // Add player
    const newPlayer: Player = {
      ...player,
      isActive: true,
      joinedAt: Date.now(),
    };
    this.players.set(player.id, newPlayer);
    this.connectionToPlayer.set(conn.id, player.id);

    // Send sync to the joining player
    this.sendToConnection(conn, {
      type: "sync",
      state: this.state,
      players: Array.from(this.players.values()),
      recentMessages: this.messages.slice(-50),
    });

    // Broadcast join to all other players
    this.broadcastExcept(conn.id, { type: "player-joined", player: newPlayer });

    // Add system message
    this.addSystemMessage(`${player.username} joined the session`);
  }

  private handlePlayerLeave(conn: Party.Connection, playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    this.players.delete(playerId);
    this.connectionToPlayer.delete(conn.id);

    // Broadcast leave
    this.broadcast({ type: "player-left", playerId });

    // Add system message
    this.addSystemMessage(`${player.username} left the session`);

    // Transfer host if necessary
    if (this.state && playerId === this.state.hostId && this.players.size > 0) {
      const newHost = Array.from(this.players.values())[0];
      this.state.hostId = newHost.id;
      this.addSystemMessage(`${newHost.username} is now the host`);
    }

    // Deactivate room if empty
    if (this.players.size === 0 && this.state) {
      this.state.isActive = false;
    }
  }

  private handleCursorUpdate(conn: Party.Connection, position: CursorPosition): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (player) {
      player.cursor = position;
      this.broadcastExcept(conn.id, {
        type: "cursor-update",
        playerId,
        position,
      });
    }
  }

  private handleCodeUpdate(
    conn: Party.Connection,
    language: "html" | "css" | "javascript",
    code: string
  ): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (!playerId || !this.state) return;

    // Check permissions
    if (this.state.settings.allowEditing === "host-only" && playerId !== this.state.hostId) {
      this.sendToConnection(conn, { type: "error", message: "Only the host can edit" });
      return;
    }

    // Update code
    this.state.code[language] = code;

    // Broadcast to all except sender
    this.broadcastExcept(conn.id, {
      type: "code-update",
      playerId,
      language,
      code,
    });
  }

  private handleChat(
    conn: Party.Connection,
    message: string,
    codeSnippet?: ChatMessage["codeSnippet"]
  ): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (!playerId) return;

    const player = this.players.get(playerId);
    if (!player) return;

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: playerId,
      username: player.username,
      message,
      timestamp: Date.now(),
      type: codeSnippet ? "code-snippet" : "text",
      codeSnippet,
    };

    this.messages.push(chatMessage);
    if (this.messages.length > 100) {
      this.messages.shift();
    }

    this.broadcast({ type: "chat", message: chatMessage });
  }

  private handleKick(conn: Party.Connection, targetUserId: string): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (!playerId || !this.state) return;

    // Only host can kick
    if (playerId !== this.state.hostId) {
      this.sendToConnection(conn, { type: "error", message: "Only the host can kick players" });
      return;
    }

    // Can't kick yourself
    if (targetUserId === playerId) return;

    // Find and remove the target player
    const targetPlayer = this.players.get(targetUserId);
    if (targetPlayer) {
      // Find connection for target
      for (const [connId, pId] of this.connectionToPlayer.entries()) {
        if (pId === targetUserId) {
          const targetConn = this.room.getConnection(connId);
          if (targetConn) {
            this.sendToConnection(targetConn, { type: "kicked", targetUserId });
            targetConn.close();
          }
          break;
        }
      }
    }
  }

  private handleSettingsUpdate(
    conn: Party.Connection,
    settings: Partial<RoomState["settings"]>
  ): void {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (!playerId || !this.state) return;

    // Only host can change settings
    if (playerId !== this.state.hostId) {
      this.sendToConnection(conn, { type: "error", message: "Only the host can change settings" });
      return;
    }

    this.state.settings = { ...this.state.settings, ...settings };
    this.broadcast({ type: "settings-update", settings: this.state.settings });
  }

  private handleSyncRequest(conn: Party.Connection): void {
    if (!this.state) return;

    this.sendToConnection(conn, {
      type: "sync",
      state: this.state,
      players: Array.from(this.players.values()),
      recentMessages: this.messages.slice(-50),
    });
  }

  private addSystemMessage(text: string): void {
    const message: ChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: "system",
      username: "System",
      message: text,
      timestamp: Date.now(),
      type: "system",
    };

    this.messages.push(message);
    if (this.messages.length > 100) {
      this.messages.shift();
    }

    this.broadcast({ type: "chat", message });
  }

  private sendToConnection(conn: Party.Connection, message: ServerMessage): void {
    conn.send(JSON.stringify(message));
  }

  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      conn.send(data);
    }
  }

  private broadcastExcept(excludeConnId: string, message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const conn of this.room.getConnections()) {
      if (conn.id !== excludeConnId) {
        conn.send(data);
      }
    }
  }
}
