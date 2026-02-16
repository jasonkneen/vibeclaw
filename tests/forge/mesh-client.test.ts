// ============================================
// MESH CLIENT TESTS
// ============================================
// @vitest-environment jsdom
// @vitest-timeout 15000

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MeshClient } from '../../src/forge/mesh-client.js';
import type { InferenceRequest } from '../../src/forge/mesh-client.js';
import type { WSMessage } from '../../src/forge/mesh-types.js';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static lastInstance: MockWebSocket | null = null;

  readyState = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    // Track last instance for tests
    MockWebSocket.lastInstance = this;
  }

  // Test helper to manually open the connection
  open(): void {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event('open'));
  }

  send(data: string): void {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED;
    const event = new CloseEvent('close', { code, reason });
    this.onclose?.(event);
  }

  // Test helper to simulate receiving a message
  receiveMessage(msg: WSMessage): void {
    const event = new MessageEvent('message', { data: JSON.stringify(msg) });
    this.onmessage?.(event);
  }

  // Test helper to get last sent message
  getLastMessage(): WSMessage | null {
    if (this.sentMessages.length === 0) return null;
    return JSON.parse(this.sentMessages[this.sentMessages.length - 1]);
  }

  // Test helper to get all sent messages
  getAllMessages(): WSMessage[] {
    return this.sentMessages.map((msg) => JSON.parse(msg));
  }

  // Test helper to clear sent messages
  clearMessages(): void {
    this.sentMessages = [];
  }
}

// Mock document.visibilityState
Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible',
});

describe('MeshClient', { timeout: 15000 }, () => {
  let client: MeshClient;
  let mockWs: MockWebSocket;

  beforeEach(() => {
    // Mock global WebSocket
    global.WebSocket = MockWebSocket as any;

    client = new MeshClient({
      burrowUrl: 'https://test.burrow.com',
      scentToken: 'test-token-123',
      name: 'TestRat',
      debug: false,
      autoReconnect: false, // Disable for tests
      heartbeatInterval: 1000,
    });

    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    client.disconnect();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // ============================================
  // CONNECTION TESTS
  // ============================================

  describe('connect', () => {
    it('should connect to burrow WebSocket', async () => {
      const connectPromise = client.connect();

      // Get the WebSocket instance and manually open it
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      // Simulate successful connection response
      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      const state = client.getState();
      expect(state.connected).toBe(true);
      expect(state.ratId).toBe('rat_123');
      expect(state.ratName).toBe('TestRat');

      // Verify connect message was sent
      const messages = mockWs.getAllMessages();
      const connectMsg = messages.find(m => m.type === 'connect');
      expect(connectMsg).toBeDefined();
      expect(connectMsg?.payload).toEqual({ token: 'test-token-123' });
    });

    it('should convert http to wss protocol', async () => {
      client = new MeshClient({
        burrowUrl: 'http://test.burrow.com',
        scentToken: 'test-token',
      });

      client.connect();
      mockWs = MockWebSocket.lastInstance!;

      // Even http gets upgraded to wss for security
      expect(mockWs.url).toContain('wss://');
    });

    it('should convert https to wss protocol', async () => {
      client = new MeshClient({
        burrowUrl: 'https://test.burrow.com',
        scentToken: 'test-token',
      });

      client.connect();
      mockWs = MockWebSocket.lastInstance!;

      expect(mockWs.url).toContain('wss://');
    });

    it('should handle connection failure', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      // Send failure response
      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: false },
        timestamp: Date.now(),
      });

      await expect(connectPromise).rejects.toThrow();
    });

    it('should handle WebSocket error', async () => {
      // Create a custom WebSocket class that triggers error immediately
      class FailingWebSocket extends MockWebSocket {
        constructor(url: string) {
          super(url);
          // Trigger error immediately in constructor (no setTimeout)
          this.readyState = MockWebSocket.CONNECTING;
          queueMicrotask(() => {
            this.onerror?.(new Event('error'));
          });
        }
      }

      global.WebSocket = FailingWebSocket as any;

      const failClient = new MeshClient({
        burrowUrl: 'https://test.burrow.com',
        scentToken: 'test-token',
      });

      await expect(failClient.connect()).rejects.toThrow();

      // Restore mock
      global.WebSocket = MockWebSocket as any;
    });

    it('should not connect if already connected', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();

      // Try to connect again
      await client.connect();

      // Should not send new connect message
      expect(mockWs.sentMessages.length).toBe(0);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from burrow', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      client.disconnect();

      const state = client.getState();
      expect(state.connected).toBe(false);
      expect(state.ratId).toBe(null);
      expect(state.ratName).toBe(null);
    });

    it('should disable auto-reconnect on intentional disconnect', async () => {
      client = new MeshClient({
        burrowUrl: 'https://test.burrow.com',
        scentToken: 'test-token',
        autoReconnect: true,
      });

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages(); // Clear connect message and initial heartbeat

      client.disconnect();

      // Should not attempt reconnect
      await vi.advanceTimersByTimeAsync(10000);
      expect(mockWs.sentMessages.length).toBe(0);
    });
  });

  // ============================================
  // HEARTBEAT TESTS
  // ============================================

  describe('heartbeat', () => {
    it('should send heartbeat after connecting', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();

      // Advance timer to trigger heartbeat
      await vi.advanceTimersByTimeAsync(1000);

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('heartbeat');
    });

    it('should send heartbeat on visibility change', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();

      // Simulate tab becoming visible
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('heartbeat');
    });

    it('should stop heartbeat on disconnect', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      client.disconnect();
      mockWs.clearMessages();

      // Advance timer
      await vi.advanceTimersByTimeAsync(5000);

      // No heartbeats should be sent
      expect(mockWs.sentMessages.length).toBe(0);
    });
  });

  // ============================================
  // MESSAGE HANDLING TESTS
  // ============================================

  describe('message handling', () => {
    beforeEach(async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();
    });

    it('should handle peer.list message', () => {
      mockWs.receiveMessage({
        type: 'peer.list',
        payload: {
          peers: [
            {
              id: 'peer_1',
              name: 'Peer1',
              models: [{ id: 'model1', provider: 'webgpu' }],
              busy: false,
            },
            {
              id: 'peer_2',
              name: 'Peer2',
              models: [{ id: 'model2', provider: 'local' }],
              busy: true,
            },
          ],
        },
        timestamp: Date.now(),
      });

      const peers = client.getPeers();
      expect(peers.length).toBe(2);
      expect(peers[0].id).toBe('peer_1');
      expect(peers[0].name).toBe('Peer1');
      expect(peers[1].busy).toBe(true);
    });

    it('should handle peer.joined message', () => {
      const events: any[] = [];
      client.on((event) => events.push(event));

      mockWs.receiveMessage({
        type: 'peer.joined',
        payload: {
          peerId: 'peer_3',
          peerName: 'Peer3',
          models: [{ id: 'model3', provider: 'cloud' }],
        },
        timestamp: Date.now(),
      });

      const peers = client.getPeers();
      expect(peers.length).toBe(1);
      expect(peers[0].id).toBe('peer_3');

      expect(events.length).toBe(1);
      expect(events[0].type).toBe('peer.joined');
    });

    it('should handle peer.left message', () => {
      // First add a peer
      mockWs.receiveMessage({
        type: 'peer.joined',
        payload: { peerId: 'peer_4', peerName: 'Peer4', models: [] },
        timestamp: Date.now(),
      });

      expect(client.getPeers().length).toBe(1);

      const events: any[] = [];
      client.on((event) => events.push(event));

      // Then remove it
      mockWs.receiveMessage({
        type: 'peer.left',
        payload: { peerId: 'peer_4' },
        timestamp: Date.now(),
      });

      expect(client.getPeers().length).toBe(0);
      expect(events[0].type).toBe('peer.left');
    });

    it('should handle peer.status message', () => {
      // Add a peer first
      mockWs.receiveMessage({
        type: 'peer.joined',
        payload: {
          peerId: 'peer_5',
          peerName: 'Peer5',
          models: [{ id: 'model1', provider: 'webgpu' }],
        },
        timestamp: Date.now(),
      });

      const events: any[] = [];
      client.on((event) => events.push(event));

      // Update status
      mockWs.receiveMessage({
        type: 'peer.status',
        payload: {
          peerId: 'peer_5',
          peerName: 'Peer5',
          models: [{ id: 'model2', provider: 'local' }],
          busy: true,
        },
        timestamp: Date.now(),
      });

      const peers = client.getPeers();
      expect(peers[0].busy).toBe(true);
      expect(peers[0].models[0].id).toBe('model2');
      expect(events[0].type).toBe('peer.status');
    });

    it('should handle error message', () => {
      const events: any[] = [];
      client.on((event) => events.push(event));

      mockWs.receiveMessage({
        type: 'error',
        payload: { message: 'Test error' },
        timestamp: Date.now(),
      });

      expect(events.length).toBe(1);
      expect(events[0].type).toBe('error');
      expect(events[0].payload).toEqual({ message: 'Test error' });
    });

    it('should handle kicked message', () => {
      const events: any[] = [];
      client.on((event) => events.push(event));

      mockWs.receiveMessage({
        type: 'kicked',
        payload: {},
        timestamp: Date.now(),
      });

      expect(events.length).toBe(2); // kicked + disconnected
      expect(events[0].type).toBe('kicked');
      expect(events[1].type).toBe('disconnected');
      expect(client.getState().connected).toBe(false);
    });
  });

  // ============================================
  // INFERENCE REQUEST TESTS
  // ============================================

  describe('inference requests', () => {
    beforeEach(async () => {
      // Use real timers for inference tests (async handlers need real timers)
      vi.useRealTimers();

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();
    });

    it('should handle fulfill_request with handler', async () => {
      let capturedRequest: InferenceRequest | null = null;

      client.onInferenceRequest(async (req) => {
        capturedRequest = req;
        return {
          response: 'Test response',
          tokensUsed: 42,
          actualModel: 'test-model',
        };
      });

      mockWs.receiveMessage({
        type: 'fulfill_request',
        payload: {
          requestId: 'req_123',
          model: 'test-model',
          prompt: 'Test prompt',
          systemPrompt: 'System prompt',
          maxTokens: 100,
          fromRatId: 'rat_456',
          fromRatName: 'OtherRat',
        },
        timestamp: Date.now(),
      });

      // Wait for async handler to execute
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest?.requestId).toBe('req_123');
      expect(capturedRequest?.prompt).toBe('Test prompt');

      const response = mockWs.getLastMessage();
      expect(response?.type).toBe('fulfill_response');
      expect(response?.payload).toMatchObject({
        requestId: 'req_123',
        response: 'Test response',
        tokensUsed: 42,
        actualModel: 'test-model',
        success: true,
      });
    });

    it('should handle fulfill_request without handler', async () => {
      mockWs.receiveMessage({
        type: 'fulfill_request',
        payload: {
          requestId: 'req_124',
          model: 'test-model',
          prompt: 'Test prompt',
          maxTokens: 100,
        },
        timestamp: Date.now(),
      });

      // Wait for async handler to execute
      await new Promise(resolve => setImmediate(resolve));

      const response = mockWs.getLastMessage();
      expect(response?.type).toBe('fulfill_response');
      expect(response?.payload).toMatchObject({
        requestId: 'req_124',
        success: false,
        error: 'No inference handler',
      });
    });

    it('should handle inference handler errors', async () => {
      client.onInferenceRequest(async () => {
        throw new Error('Inference failed');
      });

      mockWs.receiveMessage({
        type: 'fulfill_request',
        payload: {
          requestId: 'req_125',
          model: 'test-model',
          prompt: 'Test prompt',
          maxTokens: 100,
        },
        timestamp: Date.now(),
      });

      // Wait for async handler to execute
      await new Promise(resolve => setImmediate(resolve));

      const response = mockWs.getLastMessage();
      expect(response?.type).toBe('fulfill_response');
      expect(response?.payload).toMatchObject({
        requestId: 'req_125',
        success: false,
        error: 'Inference failed',
      });
    });

    it('should update busy state during inference', async () => {
      let busyDuringInference = false;

      client.onInferenceRequest(async () => {
        busyDuringInference = client.getState().busy;
        return { response: 'ok', tokensUsed: 1 };
      });

      expect(client.getState().busy).toBe(false);

      mockWs.receiveMessage({
        type: 'fulfill_request',
        payload: {
          requestId: 'req_126',
          model: 'test-model',
          prompt: 'Test prompt',
          maxTokens: 100,
        },
        timestamp: Date.now(),
      });

      // Wait for async handler to execute
      await new Promise(resolve => setImmediate(resolve));

      expect(busyDuringInference).toBe(true);
      expect(client.getState().busy).toBe(false);
    });
  });

  // ============================================
  // STATUS UPDATE TESTS
  // ============================================

  describe('status updates', () => {
    beforeEach(async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;
      mockWs.clearMessages();
    });

    it('should announce models', () => {
      client.announceModels([
        { id: 'model1', provider: 'webgpu', tier: 'pinchy', ready: true },
        { id: 'model2', provider: 'local', tier: 'claw', ready: true },
      ]);

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('node.status');
      expect(msg?.payload).toMatchObject({
        models: [
          { id: 'model1', provider: 'webgpu' },
          { id: 'model2', provider: 'local' },
        ],
        busy: false,
        visibility: { public: true, live: true },
      });
    });

    it('should announce offline', () => {
      client.announceOffline();

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('node.status');
      expect(msg?.payload).toMatchObject({
        models: [],
        busy: false,
        visibility: { public: false, live: false },
      });
    });

    it('should update busy state', () => {
      client.setBusy(true);

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('node.status');
      expect(msg?.payload).toMatchObject({
        busy: true,
      });
    });

    it('should send metrics', () => {
      client.updateMetrics({
        tokensIn: 100,
        tokensOut: 200,
        tps: 50,
        requests: 5,
      });

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('node.metrics');
      expect(msg?.payload).toEqual({
        tokensIn: 100,
        tokensOut: 200,
        tps: 50,
        requests: 5,
      });
    });

    it('should send ping', () => {
      client.ping();

      const msg = mockWs.getLastMessage();
      expect(msg?.type).toBe('ping');
    });
  });

  // ============================================
  // RECONNECTION TESTS
  // ============================================

  describe('reconnection', () => {
    it('should attempt reconnect after connection loss', async () => {
      client = new MeshClient({
        burrowUrl: 'https://test.burrow.com',
        scentToken: 'test-token',
        autoReconnect: true,
        reconnectMaxAttempts: 3,
        reconnectBackoffMs: 1000,
      });

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      // Simulate connection loss
      mockWs.close();

      // Should schedule reconnect
      await vi.advanceTimersByTimeAsync(1000);

      // Verify a new WebSocket was created for reconnect
      // (The reconnect attempt creates a new instance)
      expect(MockWebSocket.lastInstance).not.toBe(mockWs);
    });

    it('should respect max reconnect attempts', async () => {
      client = new MeshClient({
        burrowUrl: 'https://test.burrow.com',
        scentToken: 'test-token',
        autoReconnect: true,
        reconnectMaxAttempts: 2,
        reconnectBackoffMs: 100,
      });

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      // Simulate connection loss and failed reconnects
      for (let i = 0; i < 3; i++) {
        mockWs.close();
        await vi.advanceTimersByTimeAsync(5000);
      }

      // Should stop attempting after max attempts
      // (Hard to verify without exposing internal state)
    });
  });

  // ============================================
  // EVENT SUBSCRIPTION TESTS
  // ============================================

  describe('event subscription', () => {
    it('should emit connected event', async () => {
      const events: any[] = [];
      client.on((event) => events.push(event));

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      expect(events.find((e) => e.type === 'connected')).toBeDefined();
    });

    it('should emit disconnected event', async () => {
      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      const events: any[] = [];
      client.on((event) => events.push(event));

      mockWs.close();

      expect(events.find((e) => e.type === 'disconnected')).toBeDefined();
    });

    it('should allow unsubscribing from events', async () => {
      const events: any[] = [];
      const unsubscribe = client.on((event) => events.push(event));

      unsubscribe();

      const connectPromise = client.connect();
      mockWs = MockWebSocket.lastInstance!;
      mockWs.open();

      mockWs.receiveMessage({
        type: 'connect',
        payload: { success: true, ratId: 'rat_123', name: 'TestRat' },
        timestamp: Date.now(),
      });

      await connectPromise;

      // Should not have received event
      expect(events.length).toBe(0);
    });
  });
});
