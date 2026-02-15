// ============================================
// MESH TYPES - Browser-Compatible MoltRats Types
// ============================================
// Extracted from gasrats/backend/src/types/index.ts
// Only includes types needed for browser mesh client

// Token tiers based on model tier
export type TokenTier = 'pinchy' | 'claw' | 'crusher' | 'leviathan';

// Rat tiers based on cheese stash
export type RatTier = 'street' | 'sewer' | 'lab' | 'king';

// Priority levels for requests
export type Priority = 'low' | 'normal' | 'critical';

// Registered rat
export interface Rat {
  id: string;
  name: string;
  scentToken: string;
  createdAt: number;
  lastSeen: number;
  capabilities: string[];
  metadata: Record<string, unknown>;
}

// Rat's cheese stash
export interface Stash {
  ratId: string;
  pinchy: number;
  claw: number;
  crusher: number;
  leviathan: number;
  totalEarned: number;
  totalSpent: number;
}

// Active node (connected rat)
export interface Node {
  ratId: string;
  connectedAt: number;
  lastHeartbeat: number;
  availableGas: Record<TokenTier, number>;
  status: 'idle' | 'busy' | 'offline';
}

// Model info for P2P advertising
export interface ModelInfo {
  id: string;
  name?: string;
  provider: string;
  tier?: string;
  ready?: boolean;
  tps?: number;
}

// WebSocket message types
export type WSMessageType =
  | 'connect'
  | 'heartbeat'
  | 'advertise'
  | 'request'
  | 'match'
  | 'fulfill'
  | 'fulfill_request'
  | 'fulfill_response'
  | 'error'
  | 'stats'
  | 'ping'
  | 'pong'
  | 'peer.list'
  | 'peer.joined'
  | 'peer.status'
  | 'peer.left'
  | 'node.status'
  | 'node.metrics'
  | 'node.metrics.ack'
  | 'rtc.offer'
  | 'rtc.answer'
  | 'rtc.ice'
  | 'kicked';

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
  timestamp: number;
}

// Specific message payloads
export interface ConnectPayload {
  token: string;
}

export interface ConnectResponsePayload {
  success: boolean;
  ratId?: string;
  name?: string;
  message?: string;
}

export interface HeartbeatPayload {
  ack?: boolean;
}

export interface AdvertisePayload {
  availableGas: Record<TokenTier, number>;
}

export interface FulfillRequestPayload {
  requestId: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens: number;
  fromRatId?: string;
  fromRatName?: string;
}

export interface FulfillResponsePayload {
  requestId: string;
  response?: string;
  tokensUsed?: number;
  actualModel?: string;
  success: boolean;
  error?: string;
}

export interface NodeStatusPayload {
  models?: ModelInfo[];
  model?: string | null; // Legacy single model support
  busy: boolean;
  tps?: number | null;
  visibility?: {
    public?: boolean;
    live?: boolean;
  };
}

export interface PeerListPayload {
  peers: Array<{
    id: string;
    name: string;
    models: ModelInfo[];
    busy: boolean;
  }>;
}

export interface PeerJoinedPayload {
  peerId: string;
  peerName: string;
  models?: ModelInfo[];
  model?: string | null;
}

export interface PeerLeftPayload {
  peerId: string;
}

export interface PeerStatusPayload {
  peerId: string;
  peerName: string;
  models: ModelInfo[];
  busy: boolean;
}

export interface ErrorPayload {
  message: string;
}

export interface NodeMetricsPayload {
  tokensIn?: number;
  tokensOut?: number;
  tps?: number;
  requests?: number;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Burrow stats
export interface BurrowStats {
  totalRats: number;
  activeNodes: number;
  totalCheese: {
    pinchy: number;
    claw: number;
    crusher: number;
    leviathan: number;
  };
  requestsToday: number;
  requestsFulfilled: number;
  tankLevel: Record<TokenTier, number>;
}
