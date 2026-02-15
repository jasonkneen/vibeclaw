// ============================================
// MESH CLIENT - Browser-Compatible MoltRats Client
// ============================================
// WebSocket-based mesh networking client for VibeClaw
// Ports essential parts of gasrats/backend/sdk/index.ts for browser use

import type {
  WSMessage,
  WSMessageType,
  ModelInfo,
  ConnectPayload,
  ConnectResponsePayload,
  HeartbeatPayload,
  NodeStatusPayload,
  FulfillRequestPayload,
  FulfillResponsePayload,
  PeerListPayload,
  PeerJoinedPayload,
  PeerLeftPayload,
  PeerStatusPayload,
  ErrorPayload,
  NodeMetricsPayload,
} from './mesh-types.js';

// ============================================
// TYPES
// ============================================

export interface MeshClientConfig {
  burrowUrl: string;
  scentToken: string;
  name?: string;
  capabilities?: string[];
  debug?: boolean;
  autoReconnect?: boolean;
  heartbeatInterval?: number; // milliseconds
  reconnectMaxAttempts?: number;
  reconnectBackoffMs?: number;
}

export interface MeshClientState {
  connected: boolean;
  ratId: string | null;
  ratName: string | null;
  peers: Map<string, PeerInfo>;
  busy: boolean;
}

export interface PeerInfo {
  id: string;
  name: string;
  models: ModelInfo[];
  busy: boolean;
}

export interface InferenceRequest {
  requestId: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens: number;
  fromRatId?: string;
  fromRatName?: string;
}

export type InferenceHandler = (
  request: InferenceRequest
) => Promise<{ response: string; tokensUsed: number; actualModel?: string }>;

export type EventHandler = (event: MeshEvent) => void;

export interface MeshEvent {
  type: 'connected' | 'disconnected' | 'peer.joined' | 'peer.left' | 'peer.status' | 'error' | 'kicked';
  payload?: unknown;
}

// ============================================
// MESH CLIENT
// ============================================

export class MeshClient {
  private config: Required<MeshClientConfig>;
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private state: MeshClientState = {
    connected: false,
    ratId: null,
    ratName: null,
    peers: new Map(),
    busy: false,
  };
  private inferenceHandler: InferenceHandler | null = null;
  private eventHandlers: Set<EventHandler> = new Set();
  private visibilityHandler: (() => void) | null = null;

  constructor(config: MeshClientConfig) {
    this.config = {
      name: config.name || 'Anonymous',
      capabilities: config.capabilities || [],
      debug: config.debug ?? false,
      autoReconnect: config.autoReconnect ?? true,
      heartbeatInterval: config.heartbeatInterval ?? 20000,
      reconnectMaxAttempts: config.reconnectMaxAttempts ?? 10,
      reconnectBackoffMs: config.reconnectBackoffMs ?? 2000,
      ...config,
    };
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Connect to the burrow
   */
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    return new Promise((resolve, reject) => {
      const wsUrl = this.config.burrowUrl.replace(/^http/, 'ws').replace(/^ws/, 'wss') + '/ws';
      this.log(`Connecting to ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.log('WebSocket open — authenticating');
        this.send('connect', {
          token: this.config.scentToken,
        } as ConnectPayload);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          this.handleMessage(msg);

          if (msg.type === 'connect') {
            const payload = msg.payload as ConnectResponsePayload;
            if (payload.success) {
              this.state.connected = true;
              this.state.ratId = payload.ratId || null;
              this.state.ratName = payload.name || null;
              this.log(`✅ Connected as ${payload.name} (${payload.ratId?.slice(0, 8)})`);
              this.startHeartbeat();
              this.reconnectAttempts = 0;
              this.emit({ type: 'connected', payload });
              // Request peer list
              this.send('peer.list', {});
              resolve();
            } else {
              reject(new Error('Connection failed'));
            }
          }
        } catch (err) {
          this.log('Error handling message:', err);
        }
      };

      this.ws.onerror = (err) => {
        this.log('WebSocket error:', err);
        reject(new Error('WebSocket connection failed'));
      };

      this.ws.onclose = (event) => {
        const wasConnected = this.state.connected;
        this.log(`WebSocket closed: code=${event.code} reason="${event.reason || 'none'}"`);
        this.stopHeartbeat();
        this.state.connected = false;
        this.state.ratId = null;
        this.state.ratName = null;
        this.state.peers.clear();
        this.emit({ type: 'disconnected' });

        if (wasConnected && this.config.autoReconnect) {
          this.scheduleReconnect();
        }
      };
    });
  }

  /**
   * Disconnect from the burrow
   */
  disconnect(): void {
    this.log('Disconnecting');
    this.config.autoReconnect = false; // Prevent auto-reconnect
    this.stopHeartbeat();
    this.cancelReconnect();
    this.ws?.close();
    this.ws = null;
    this.state.connected = false;
    this.state.ratId = null;
    this.state.ratName = null;
    this.state.peers.clear();
  }

  /**
   * Announce models to the network
   */
  announceModels(models: ModelInfo[], visibility?: { public?: boolean; live?: boolean }): void {
    if (!this.state.connected) {
      this.log('⚠️ Cannot announce — not connected');
      return;
    }

    this.log(`Announcing ${models.length} models:`, models.map((m) => m.id).join(', '));
    this.send('node.status', {
      models,
      busy: this.state.busy,
      visibility: {
        public: visibility?.public ?? true,
        live: visibility?.live ?? true,
      },
    } as NodeStatusPayload);
  }

  /**
   * Announce offline (no models)
   */
  announceOffline(): void {
    if (!this.state.connected) return;

    this.send('node.status', {
      models: [],
      busy: false,
      visibility: { public: false, live: false },
    } as NodeStatusPayload);
  }

  /**
   * Update busy state
   */
  setBusy(busy: boolean): void {
    this.state.busy = busy;
    if (this.state.connected) {
      // Resend status with updated busy flag
      this.send('node.status', {
        models: [], // Would need to track models to resend them
        busy,
      } as NodeStatusPayload);
    }
  }

  /**
   * Set inference handler for fulfilling requests
   */
  onInferenceRequest(handler: InferenceHandler): void {
    this.inferenceHandler = handler;
  }

  /**
   * Subscribe to mesh events
   */
  on(handler: EventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  /**
   * Get current state
   */
  getState(): MeshClientState {
    return { ...this.state, peers: new Map(this.state.peers) };
  }

  /**
   * Get list of peers
   */
  getPeers(): PeerInfo[] {
    return Array.from(this.state.peers.values());
  }

  /**
   * Send metrics update
   */
  updateMetrics(metrics: NodeMetricsPayload): void {
    if (!this.state.connected) return;
    this.send('node.metrics', metrics);
  }

  /**
   * Send ping
   */
  ping(): void {
    if (!this.state.connected) return;
    this.send('ping', {});
  }

  // ============================================
  // INTERNAL
  // ============================================

  private send(type: WSMessageType, payload: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log(`⚠️ Cannot send ${type} — WebSocket not open`);
      return;
    }

    const msg: WSMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(msg));
  }

  private handleMessage(msg: WSMessage): void {
    // Log all messages except heartbeat/pong
    if (msg.type !== 'heartbeat' && msg.type !== 'pong') {
      this.log(`← ${msg.type}`, msg.payload);
    }

    switch (msg.type) {
      case 'heartbeat':
        // Heartbeat ack
        break;

      case 'pong':
        // Ping response
        break;

      case 'fulfill_request':
        this.handleFulfillRequest(msg.payload as FulfillRequestPayload);
        break;

      case 'peer.list':
        this.handlePeerList(msg.payload as PeerListPayload);
        break;

      case 'peer.joined':
        this.handlePeerJoined(msg.payload as PeerJoinedPayload);
        break;

      case 'peer.left':
        this.handlePeerLeft(msg.payload as PeerLeftPayload);
        break;

      case 'peer.status':
        this.handlePeerStatus(msg.payload as PeerStatusPayload);
        break;

      case 'error':
        this.handleError(msg.payload as ErrorPayload);
        break;

      case 'kicked':
        this.handleKicked();
        break;

      case 'node.metrics.ack':
        // Metrics acknowledged
        break;

      default:
        this.log(`Unknown message type: ${msg.type}`);
    }
  }

  private async handleFulfillRequest(payload: FulfillRequestPayload): Promise<void> {
    if (!this.inferenceHandler) {
      this.log('⚠️ No inference handler set — ignoring request');
      this.send('fulfill_response', {
        requestId: payload.requestId,
        success: false,
        error: 'No inference handler',
      } as FulfillResponsePayload);
      return;
    }

    this.state.busy = true;

    try {
      const result = await this.inferenceHandler({
        requestId: payload.requestId,
        model: payload.model,
        prompt: payload.prompt,
        systemPrompt: payload.systemPrompt,
        maxTokens: payload.maxTokens,
        fromRatId: payload.fromRatId,
        fromRatName: payload.fromRatName,
      });

      this.send('fulfill_response', {
        requestId: payload.requestId,
        response: result.response,
        tokensUsed: result.tokensUsed,
        actualModel: result.actualModel,
        success: true,
      } as FulfillResponsePayload);

      this.log(`✅ Fulfilled request ${payload.requestId.slice(0, 8)} (${result.tokensUsed} tokens)`);
    } catch (err) {
      this.send('fulfill_response', {
        requestId: payload.requestId,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      } as FulfillResponsePayload);

      this.log(`❌ Failed to fulfill request ${payload.requestId.slice(0, 8)}:`, err);
    } finally {
      this.state.busy = false;
    }
  }

  private handlePeerList(payload: PeerListPayload): void {
    this.log(`Peer list: ${payload.peers.length} peers`);
    payload.peers.forEach((p) => {
      this.state.peers.set(p.id, {
        id: p.id,
        name: p.name,
        models: p.models || [],
        busy: p.busy,
      });
    });
  }

  private handlePeerJoined(payload: PeerJoinedPayload): void {
    this.log(`+ Peer joined: ${payload.peerName} (${payload.peerId.slice(0, 8)})`);
    this.state.peers.set(payload.peerId, {
      id: payload.peerId,
      name: payload.peerName,
      models: payload.models || [],
      busy: false,
    });
    this.emit({ type: 'peer.joined', payload });
  }

  private handlePeerLeft(payload: PeerLeftPayload): void {
    const peer = this.state.peers.get(payload.peerId);
    this.log(`- Peer left: ${peer?.name || payload.peerId.slice(0, 8)}`);
    this.state.peers.delete(payload.peerId);
    this.emit({ type: 'peer.left', payload });
  }

  private handlePeerStatus(payload: PeerStatusPayload): void {
    const peer = this.state.peers.get(payload.peerId);
    if (peer) {
      peer.models = payload.models;
      peer.busy = payload.busy;
      this.emit({ type: 'peer.status', payload });
    }
  }

  private handleError(payload: ErrorPayload): void {
    this.log(`❌ Error: ${payload.message}`);
    this.emit({ type: 'error', payload });
  }

  private handleKicked(): void {
    this.log('❌ Kicked from burrow');
    this.emit({ type: 'kicked' });
    this.disconnect();
  }

  private emit(event: MeshEvent): void {
    this.eventHandlers.forEach((handler) => handler(event));
  }

  // ============================================
  // HEARTBEAT
  // ============================================

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.log(`Starting heartbeat (every ${this.config.heartbeatInterval}ms + visibility wakeup)`);

    const sendBeat = () => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', {});
      } else if (this.state.connected) {
        this.log('⚠️ WebSocket died — forcing close');
        this.ws?.close();
      }
    };

    // Regular interval
    this.heartbeatTimer = setInterval(sendBeat, this.config.heartbeatInterval);

    // Visibility change handler — send immediate heartbeat on tab focus
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.log('Tab visible — sending immediate heartbeat');
        sendBeat();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Send one now
    sendBeat();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }

  // ============================================
  // RECONNECTION
  // ============================================

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (this.reconnectAttempts >= this.config.reconnectMaxAttempts) {
      this.log(`❌ Max reconnect attempts (${this.config.reconnectMaxAttempts}) reached`);
      return;
    }

    const delay = Math.min(
      this.config.reconnectBackoffMs * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.reconnectMaxAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        this.log('Attempting reconnect...');
        await this.connect();
        this.log('✅ Reconnected');
        this.reconnectAttempts = 0;
      } catch (err) {
        this.log('❌ Reconnect failed:', err);
        this.scheduleReconnect();
      }
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  // ============================================
  // LOGGING
  // ============================================

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      const ts = new Date().toISOString().slice(11, 23);
      console.log(`[${ts}][MeshClient]`, ...args);
    }
  }
}
