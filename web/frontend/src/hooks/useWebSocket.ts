import { useEffect } from 'react';
import { wsClient } from '../services/websocket';
import { useAuthStore } from '../store/auth';
import { useChatStore } from '../store/chat';
import { WSMessage } from '../types';

export const useWebSocket = () => {
  const token = useAuthStore((state) => state.token);
  const {
    addMessage,
    appendStreamToken,
    setStreaming,
    clearStreamingContent,
    currentSessionId,
  } = useChatStore();

  useEffect(() => {
    if (!token) return;

    const handleMessage = (data: WSMessage) => {
      switch (data.type) {
        case 'token':
          if (data.content) {
            appendStreamToken(data.content);
          }
          break;

        case 'tool_call':
          if (data.name && data.arguments) {
            appendStreamToken(`\n\n[Tool Call: ${data.name}]\n`);
          }
          break;

        case 'tool_result':
          if (data.result) {
            appendStreamToken(`\n[Result: ${data.result}]\n\n`);
          }
          break;

        case 'done':
          const content = useChatStore.getState().streamingContent;
          if (content && data.session_id) {
            addMessage({
              id: Date.now(),
              session_id: data.session_id,
              role: 'assistant',
              content: content.trim(),
              created_at: new Date().toISOString(),
            });
          }
          clearStreamingContent();
          setStreaming(false);
          break;

        case 'error':
          console.error('WebSocket error:', data.message);
          setStreaming(false);
          clearStreamingContent();
          break;
      }
    };

    const handleClose = () => {
      console.log('WebSocket connection closed');
      setStreaming(false);
    };

    wsClient.connect(token, handleMessage, handleClose);

    return () => {
      wsClient.disconnect();
    };
  }, [token]);

  const sendMessage = (message: string) => {
    if (!currentSessionId) {
      console.error('No active session');
      return;
    }

    // Add user message immediately
    addMessage({
      id: Date.now(),
      session_id: currentSessionId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    });

    // Send to WebSocket
    setStreaming(true);
    clearStreamingContent();
    wsClient.send(message, currentSessionId);
  };

  return { sendMessage };
};
