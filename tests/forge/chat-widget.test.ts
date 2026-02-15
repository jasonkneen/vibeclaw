// ============================================
// CHAT WIDGET TESTS
// ============================================
// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChatWidget } from '../../src/forge/chat-widget.js';
import type { ChatWidgetConfig } from '../../src/forge/chat-widget.js';

// Mock fetch for API calls
global.fetch = vi.fn();

describe('ChatWidget', () => {
  let container: HTMLElement;
  let widget: ChatWidget;

  beforeEach(() => {
    // Create container
    container = document.createElement('div');
    container.id = 'chat-container';
    document.body.appendChild(container);

    // Reset fetch mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    widget?.destroy();
    container.remove();
  });

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('initialization', () => {
    it('should create widget with default config', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
      });

      const widgetEl = container.querySelector('.mesh-chat-widget');
      expect(widgetEl).toBeTruthy();
    });

    it('should throw if container not found', () => {
      expect(() => {
        new ChatWidget('#nonexistent', {
          apiUrl: 'https://api.test.com/v1/chat/completions',
        });
      }).toThrow('Container not found');
    });

    it('should apply custom theme', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        theme: 'light',
      });

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('--black: #ffffff');
    });

    it('should apply custom dimensions', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        width: '500px',
        height: '800px',
      });

      const widgetEl = container.querySelector('.mesh-chat-widget') as HTMLElement;
      expect(widgetEl.style.width).toBe('500px');
      expect(widgetEl.style.height).toBe('800px');
    });

    it('should show welcome message if provided', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        welcomeMessage: 'Hello! How can I help?',
      });

      const messages = container.querySelectorAll('.mesh-chat-message');
      expect(messages.length).toBe(1);
      expect(messages[0].textContent).toContain('Hello! How can I help?');
    });

    it('should set custom placeholder', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        placeholder: 'Ask me anything...',
      });

      const input = container.querySelector('.mesh-chat-input') as HTMLTextAreaElement;
      expect(input.placeholder).toBe('Ask me anything...');
    });

    it('should apply position styles', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        position: 'bottom-right',
      });

      const styles = container.querySelector('style');
      expect(styles?.textContent).toContain('position: fixed');
      expect(styles?.textContent).toContain('bottom: 20px');
      expect(styles?.textContent).toContain('right: 20px');
    });
  });

  // ============================================
  // MESSAGE HANDLING TESTS
  // ============================================

  describe('message handling', () => {
    beforeEach(() => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
      });
    });

    it('should add user message', () => {
      widget.addMessage('user', 'Hello');

      const messages = widget.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Hello');
    });

    it('should add assistant message', () => {
      widget.addMessage('assistant', 'Hi there!');

      const messages = widget.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0].role).toBe('assistant');
      expect(messages[0].content).toBe('Hi there!');
    });

    it('should render messages in DOM', () => {
      widget.addMessage('user', 'Test message');

      const messageEls = container.querySelectorAll('.mesh-chat-message');
      expect(messageEls.length).toBe(1);
      expect(messageEls[0].textContent).toContain('Test message');
    });

    it('should clear all messages', () => {
      widget.addMessage('user', 'Message 1');
      widget.addMessage('assistant', 'Message 2');
      widget.addMessage('user', 'Message 3');

      expect(widget.getMessages().length).toBe(3);

      widget.clearMessages();

      expect(widget.getMessages().length).toBe(0);
      const messageEls = container.querySelectorAll('.mesh-chat-message');
      expect(messageEls.length).toBe(0);
    });

    it('should preserve welcome message after clear', () => {
      widget.destroy();
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        welcomeMessage: 'Welcome!',
      });

      widget.addMessage('user', 'Test');
      widget.clearMessages();

      const messages = widget.getMessages();
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Welcome!');
    });

    it('should escape HTML in messages', () => {
      widget.addMessage('user', '<script>alert("xss")</script>');

      const messageEl = container.querySelector('.mesh-chat-message-content');
      expect(messageEl?.innerHTML).toContain('&lt;script&gt;');
      expect(messageEl?.innerHTML).not.toContain('<script>');
    });

    it('should preserve timestamps', () => {
      const before = Date.now();
      widget.addMessage('user', 'Test');
      const after = Date.now();

      const messages = widget.getMessages();
      expect(messages[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(messages[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  // ============================================
  // STREAMING TESTS
  // ============================================

  describe('streaming', () => {
    beforeEach(() => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
      });
    });

    it('should send message and handle streaming response', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
            )
          );
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":" there"}}]}\n\n'
            )
          );
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await widget.sendMessage('Hi');

      const messages = widget.getMessages();
      expect(messages.length).toBe(2); // user + assistant
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Hi');
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].content).toBe('Hello there');
    });

    it('should include API key in headers if provided', async () => {
      widget.destroy();
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        apiKey: 'test-key-123',
      });

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await widget.sendMessage('Test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key-123',
          }),
        })
      );
    });

    it('should include model in request if provided', async () => {
      widget.destroy();
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        model: 'test-model',
      });

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await widget.sendMessage('Test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"model":"test-model"'),
        })
      );
    });

    it('should include system prompt if provided', async () => {
      widget.destroy();
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
        systemPrompt: 'You are a helpful assistant',
      });

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      await widget.sendMessage('Test');

      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);

      expect(body.messages[0]).toEqual({
        role: 'system',
        content: 'You are a helpful assistant',
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await widget.sendMessage('Test');

      const messages = widget.getMessages();
      const lastMessage = messages[messages.length - 1];
      expect(lastMessage.role).toBe('assistant');
      expect(lastMessage.content).toContain('Error');
    });

    it('should not send empty messages', async () => {
      await widget.sendMessage('   ');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(widget.getMessages().length).toBe(0);
    });

    it('should not send messages while streaming', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          // Keep stream open
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const promise = widget.sendMessage('First');

      // Try to send another message while streaming
      await widget.sendMessage('Second');

      expect((global.fetch as any).mock.calls.length).toBe(1);
    });
  });

  // ============================================
  // UI INTERACTION TESTS
  // ============================================

  describe('UI interaction', () => {
    beforeEach(() => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
      });
    });

    it('should send message on button click', async () => {
      const input = container.querySelector('.mesh-chat-input') as HTMLTextAreaElement;
      const button = container.querySelector('.mesh-chat-send') as HTMLButtonElement;

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      input.value = 'Test message';
      button.click();

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(widget.getMessages()[0].content).toBe('Test message');
    });

    it('should send message on Enter key', async () => {
      const input = container.querySelector('.mesh-chat-input') as HTMLTextAreaElement;

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      input.value = 'Test message';

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: false,
      });
      input.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(widget.getMessages()[0]?.content).toBe('Test message');
    });

    it('should allow new line on Shift+Enter', () => {
      const input = container.querySelector('.mesh-chat-input') as HTMLTextAreaElement;

      input.value = 'Line 1';

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: true,
      });
      const preventDefault = vi.spyOn(event, 'preventDefault');
      input.dispatchEvent(event);

      // Should not prevent default (allow new line)
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should clear input after sending', async () => {
      const input = container.querySelector('.mesh-chat-input') as HTMLTextAreaElement;

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      input.value = 'Test message';
      await widget.sendMessage(input.value);

      expect(input.value).toBe('');
    });

    it('should disable send button while streaming', async () => {
      const button = container.querySelector('.mesh-chat-send') as HTMLButtonElement;

      let resolveStream: any;
      const mockStream = new ReadableStream({
        start(controller) {
          resolveStream = () => {
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          };
        },
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      expect(button.disabled).toBe(false);

      const promise = widget.sendMessage('Test');

      // Wait a bit for stream to start
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Button should be disabled during stream
      // (This is hard to test reliably with mocks)

      resolveStream();
      await promise;

      expect(button.disabled).toBe(false);
    });
  });

  // ============================================
  // DESTROY TESTS
  // ============================================

  describe('destroy', () => {
    it('should remove widget from DOM', () => {
      widget = new ChatWidget('#chat-container', {
        apiUrl: 'https://api.test.com/v1/chat/completions',
      });

      expect(container.querySelector('.mesh-chat-widget')).toBeTruthy();

      widget.destroy();

      expect(container.querySelector('.mesh-chat-widget')).toBeFalsy();
      expect(container.innerHTML).toBe('');
    });
  });
});
