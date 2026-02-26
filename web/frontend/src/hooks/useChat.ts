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
  }, [loadSessions]);

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
