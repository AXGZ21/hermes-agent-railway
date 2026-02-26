import { useEffect } from 'react';
import { useChatStore } from '../store/chat';

export const useChat = () => {
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    streamingContent,
    loadSessions,
    selectSession,
    createSession,
    deleteSession,
  } = useChatStore();

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    streamingContent,
    selectSession,
    createSession,
    deleteSession,
  };
};
