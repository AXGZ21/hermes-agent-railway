import { useEffect, useCallback } from 'react';
import { wsClient } from '../services/websocket';
import { useAuthStore } from '../store/auth';
import { useChatStore } from '../store/chat';
import { WSMessage } from '../types';

export const useWebSocket = () => {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    const handleMessage = (data: WSMessage) => {
      const store = useChatStore.getState();

      switch (data.type) {
        case 'token':
          if (data.content) {
            store.appendStreamToken(data.content);
          }
          break;

        case 'tool_call':
          if (data.name && data.arguments) {
            store.appendStreamToken(`\n\n[Tool Call: ${data.name}]\n`);
          }
          break;

        case 'tool_result':
          if (data.result) {
            store.appendStreamToken(`\n[Result: ${data.result}]\n\n`);
          }
          break;

        case 'done': {
          const content = useChatStore.getState().streamingContent;
          if (content && data.session_id) {
            store.addMessage({
              id: Date.now(),
              session_id: data.session_id,
              role: 'assistant',
              content: content.trim(),
              created_at: new Date().toISOString(),
            });
          }
          store.clearStreamingContent();
          store.setStreaming(false);
          break;
        }

        case 'session_created':
          if (data.session_id) {
            // Update the current session ID and reload sessions
            useChatStore.getState().loadSessions();
          }
          break;

        case 'error':
          console.error('WebSocket error:', data.message);
          store.setStreaming(false);
          store.clearStreamingContent();
          break;
      }
    };

    const handleClose = () => {
      useChatStore.getState().setStreaming(false);
    };

    wsClient.connect(token, handleMessage, handleClose);

    return () => {
      wsClient.disconnect();
    };
  }, [token]);

  const sendMessage = useCallback((message: string) => {
    const { currentSessionId, addMessage, setStreaming, clearStreamingContent } =
      useChatStore.getState();

    if (!currentSessionId) {
      console.error('No active session');
      return;
    }

    addMessage({
      id: Date.now(),
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    });

    setStreaming(true);
    clearStreamingContent();
    wsClient.send(message, currentSessionId);
  }, []);

  return { sendMessage };
};
