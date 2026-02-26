import { WSMessage } from '../types';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

type StatusListener = (status: ConnectionStatus) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 50;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;
  private messageHandler: ((data: WSMessage) => void) | null = null;
  private closeHandler: (() => void) | null = null;
  private currentToken: string | null = null;
  private _status: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<StatusListener>();

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  connect(
    token: string,
    onMessage: (data: WSMessage) => void,
    onClose: () => void
  ): void {
    this.shouldReconnect = true;
    this.messageHandler = onMessage;
    this.closeHandler = onClose;
    this.currentToken = token;
    this.setStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage;
          this.messageHandler?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        // onerror is always followed by onclose
      };

      this.ws.onclose = () => {
        this.ws = null;
        this.setStatus('disconnected');

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
          );

          this.setStatus('connecting');

          setTimeout(() => {
            if (this.shouldReconnect && this.currentToken) {
              this.connect(this.currentToken, this.messageHandler!, this.closeHandler!);
            }
          }, delay);
        } else {
          this.closeHandler?.();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.setStatus('disconnected');
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
    this.currentToken = null;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
