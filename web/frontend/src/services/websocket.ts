import { WSMessage } from '../types';

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private shouldReconnect = true;
  private messageHandler: ((data: WSMessage) => void) | null = null;
  private closeHandler: (() => void) | null = null;

  connect(
    token: string,
    onMessage: (data: WSMessage) => void,
    onClose: () => void
  ): void {
    this.shouldReconnect = true;
    this.messageHandler = onMessage;
    this.closeHandler = onClose;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage;
          this.messageHandler?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.ws = null;

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

          setTimeout(() => {
            if (this.shouldReconnect && token) {
              this.connect(token, this.messageHandler!, this.closeHandler!);
            }
          }, delay);
        } else {
          this.closeHandler?.();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.closeHandler?.();
    }
  }

  send(message: string, sessionId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ message, session_id: sessionId }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
