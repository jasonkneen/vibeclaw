// ============================================
// CHAT WIDGET - Vanilla JS Mesh Chat Widget
// ============================================
// Pure JS/HTML chat widget for VibeClaw mesh integration
// No React — embeddable in any page

export interface ChatWidgetConfig {
  apiUrl: string; // Mesh API endpoint or mesh node
  apiKey?: string; // Optional API key for authentication
  model?: string; // Model to use (optional)
  systemPrompt?: string; // System prompt (optional)
  theme?: 'dark' | 'light';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'inline';
  width?: string;
  height?: string;
  placeholder?: string;
  welcomeMessage?: string;
  debug?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class ChatWidget {
  private config: Required<ChatWidgetConfig>;
  private container: HTMLElement;
  private messagesContainer: HTMLElement;
  private inputElement: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private messages: ChatMessage[] = [];
  private streaming = false;
  private currentStreamId: string | null = null;

  constructor(containerSelector: string, config: ChatWidgetConfig) {
    this.config = {
      theme: 'dark',
      position: 'inline',
      width: '100%',
      height: '600px',
      placeholder: 'Type a message...',
      welcomeMessage: '',
      debug: false,
      model: '',
      systemPrompt: '',
      apiKey: '',
      ...config,
    };

    const container = document.querySelector(containerSelector);
    if (!container) {
      throw new Error(`Container not found: ${containerSelector}`);
    }

    this.container = container as HTMLElement;
    this.render();
    this.messagesContainer = this.container.querySelector('.mesh-chat-messages')!;
    this.inputElement = this.container.querySelector('.mesh-chat-input')!;
    this.sendButton = this.container.querySelector('.mesh-chat-send')!;

    this.attachEventListeners();

    if (this.config.welcomeMessage) {
      this.addMessage('assistant', this.config.welcomeMessage);
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Send a message
   */
  async sendMessage(content: string): Promise<void> {
    if (!content.trim() || this.streaming) return;

    // Add user message
    this.addMessage('user', content);
    this.inputElement.value = '';
    this.inputElement.style.height = 'auto';

    // Show typing indicator
    const typingId = this.showTypingIndicator();

    try {
      // Build messages array for API
      const messages = this.buildMessagesArray();

      // Send to API with streaming
      await this.streamCompletion(messages, typingId);
    } catch (err) {
      this.removeMessage(typingId);
      this.addMessage('assistant', `Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      this.log('Error:', err);
    }
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    if (this.config.welcomeMessage) {
      this.addMessage('assistant', this.config.welcomeMessage);
    }
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Add a message programmatically
   */
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    const message: ChatMessage = {
      role,
      content,
      timestamp: Date.now(),
    };

    this.messages.push(message);
    this.renderMessage(message);
    this.scrollToBottom();
  }

  /**
   * Destroy the widget
   */
  destroy(): void {
    this.container.innerHTML = '';
  }

  // ============================================
  // RENDERING
  // ============================================

  private render(): void {
    const theme = this.config.theme;
    const position = this.config.position;

    const styles = `
      .mesh-chat-widget {
        --black: #000000;
        --surface: #1a1a1a;
        --border: #333333;
        --text: #ffffff;
        --text-dim: #888888;
        --accent: #00ff88;
        --user-bg: #2a2a2a;
        --assistant-bg: #1a1a1a;
        --mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', monospace;

        font-family: var(--mono);
        background: var(--surface);
        color: var(--text);
        border: 1px solid var(--border);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        width: ${this.config.width};
        height: ${this.config.height};
        overflow: hidden;
        ${position !== 'inline' ? this.getPositionStyles(position) : ''}
      }

      ${theme === 'light' ? this.getLightThemeStyles() : ''}

      .mesh-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .mesh-chat-message {
        display: flex;
        gap: 8px;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mesh-chat-message-role {
        font-size: 12px;
        color: var(--text-dim);
        min-width: 60px;
        flex-shrink: 0;
      }

      .mesh-chat-message-content {
        flex: 1;
        line-height: 1.5;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .mesh-chat-message.user .mesh-chat-message-content {
        color: var(--accent);
      }

      .mesh-chat-typing {
        display: flex;
        gap: 4px;
      }

      .mesh-chat-typing span {
        width: 6px;
        height: 6px;
        background: var(--text-dim);
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .mesh-chat-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .mesh-chat-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          opacity: 0.3;
          transform: translateY(0);
        }
        30% {
          opacity: 1;
          transform: translateY(-4px);
        }
      }

      .mesh-chat-input-container {
        border-top: 1px solid var(--border);
        padding: 12px;
        display: flex;
        gap: 8px;
        align-items: flex-end;
      }

      .mesh-chat-input {
        flex: 1;
        background: var(--black);
        border: 1px solid var(--border);
        border-radius: 4px;
        padding: 8px 12px;
        color: var(--text);
        font-family: var(--mono);
        font-size: 14px;
        resize: none;
        min-height: 20px;
        max-height: 120px;
        overflow-y: auto;
      }

      .mesh-chat-input:focus {
        outline: none;
        border-color: var(--accent);
      }

      .mesh-chat-input::placeholder {
        color: var(--text-dim);
      }

      .mesh-chat-send {
        background: var(--accent);
        color: var(--black);
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-family: var(--mono);
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .mesh-chat-send:hover:not(:disabled) {
        opacity: 0.8;
      }

      .mesh-chat-send:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .mesh-chat-messages::-webkit-scrollbar {
        width: 8px;
      }

      .mesh-chat-messages::-webkit-scrollbar-track {
        background: var(--black);
      }

      .mesh-chat-messages::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 4px;
      }

      .mesh-chat-messages::-webkit-scrollbar-thumb:hover {
        background: #444;
      }
    `;

    this.container.innerHTML = `
      <style>${styles}</style>
      <div class="mesh-chat-widget">
        <div class="mesh-chat-messages"></div>
        <div class="mesh-chat-input-container">
          <textarea 
            class="mesh-chat-input" 
            placeholder="${this.config.placeholder}"
            rows="1"
          ></textarea>
          <button class="mesh-chat-send">Send</button>
        </div>
      </div>
    `;
  }

  private getPositionStyles(position: string): string {
    const positions: Record<string, string> = {
      'bottom-right': 'position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999;',
      'bottom-left': 'position: fixed; bottom: 20px; left: 20px; width: 400px; height: 600px; z-index: 9999;',
      'top-right': 'position: fixed; top: 20px; right: 20px; width: 400px; height: 600px; z-index: 9999;',
      'top-left': 'position: fixed; top: 20px; left: 20px; width: 400px; height: 600px; z-index: 9999;',
    };
    return positions[position] || '';
  }

  private getLightThemeStyles(): string {
    return `
      .mesh-chat-widget {
        --black: #ffffff;
        --surface: #f5f5f5;
        --border: #e0e0e0;
        --text: #000000;
        --text-dim: #666666;
        --accent: #00cc66;
        --user-bg: #e8e8e8;
        --assistant-bg: #f5f5f5;
      }
    `;
  }

  private renderMessage(message: ChatMessage, id?: string): void {
    const messageEl = document.createElement('div');
    messageEl.className = `mesh-chat-message ${message.role}`;
    if (id) messageEl.dataset.messageId = id;

    const roleLabel = message.role === 'user' ? 'you:' : 'assistant:';

    messageEl.innerHTML = `
      <div class="mesh-chat-message-role">${roleLabel}</div>
      <div class="mesh-chat-message-content">${this.escapeHtml(message.content)}</div>
    `;

    this.messagesContainer.appendChild(messageEl);
  }

  private showTypingIndicator(): string {
    const id = `typing-${Date.now()}`;
    const typingEl = document.createElement('div');
    typingEl.className = 'mesh-chat-message assistant';
    typingEl.dataset.messageId = id;

    typingEl.innerHTML = `
      <div class="mesh-chat-message-role">assistant:</div>
      <div class="mesh-chat-message-content">
        <div class="mesh-chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(typingEl);
    this.scrollToBottom();

    return id;
  }

  private removeMessage(id: string): void {
    const el = this.messagesContainer.querySelector(`[data-message-id="${id}"]`);
    el?.remove();
  }

  private updateMessageContent(id: string, content: string): void {
    const el = this.messagesContainer.querySelector(`[data-message-id="${id}"]`);
    if (el) {
      const contentEl = el.querySelector('.mesh-chat-message-content');
      if (contentEl) {
        contentEl.textContent = content;
      }
    }
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  // ============================================
  // API COMMUNICATION
  // ============================================

  private buildMessagesArray(): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (this.config.systemPrompt) {
      messages.push({ role: 'system', content: this.config.systemPrompt });
    }

    this.messages
      .filter((m) => m.role !== 'system')
      .forEach((m) => {
        messages.push({ role: m.role, content: m.content });
      });

    return messages;
  }

  private async streamCompletion(
    messages: Array<{ role: string; content: string }>,
    streamId: string
  ): Promise<void> {
    this.streaming = true;
    this.currentStreamId = streamId;
    this.sendButton.disabled = true;

    const requestBody = {
      model: this.config.model || 'default',
      messages,
      stream: true,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const data = line.slice(6); // Remove 'data: ' prefix
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content || '';

            if (delta) {
              fullContent += delta;

              if (isFirstChunk) {
                // Replace typing indicator with actual content
                this.removeMessage(streamId);
                const message: ChatMessage = {
                  role: 'assistant',
                  content: fullContent,
                  timestamp: Date.now(),
                };
                this.messages.push(message);
                this.renderMessage(message, streamId);
                isFirstChunk = false;
              } else {
                // Update existing message in both DOM and array
                this.updateMessageContent(streamId, fullContent);
                // Also update the message in the array
                const lastMessage = this.messages[this.messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = fullContent;
                }
              }

              this.scrollToBottom();
            }
          } catch (err) {
            this.log('Error parsing SSE:', err);
          }
        }
      }

      // If no content was streamed, remove typing indicator
      if (isFirstChunk) {
        this.removeMessage(streamId);
        throw new Error('No response received');
      }
    } finally {
      this.streaming = false;
      this.currentStreamId = null;
      this.sendButton.disabled = false;
      this.inputElement.focus();
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  private attachEventListeners(): void {
    // Send button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage(this.inputElement.value);
    });

    // Enter to send (Shift+Enter for new line)
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage(this.inputElement.value);
      }
    });

    // Auto-resize textarea
    this.inputElement.addEventListener('input', () => {
      this.inputElement.style.height = 'auto';
      this.inputElement.style.height = `${Math.min(this.inputElement.scrollHeight, 120)}px`;
    });
  }

  // ============================================
  // UTILITIES
  // ============================================

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[ChatWidget]', ...args);
    }
  }
}

// Export for global usage
if (typeof window !== 'undefined') {
  (window as any).ChatWidget = ChatWidget;
}
