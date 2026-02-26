import { create } from 'zustand';
import { Session, Message } from '../types';
import { api } from '../services/api';

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;

  loadSessions: () => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  createSession: () => Promise<string>;
  addMessage: (message: Message) => void;
  appendStreamToken: (token: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearStreamingContent: () => void;
  deleteSession: (id: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',

  loadSessions: async () => {
    try {
      const sessions = await api.getSessions();
      set({ sessions });
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  },

  selectSession: async (id: string) => {
    try {
      const { messages } = await api.getSession(id);
      set({
        currentSessionId: id,
        messages,
        streamingContent: '',
        isStreaming: false
      });
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  },

  createSession: async () => {
    try {
      const { id } = await api.createSession();
      await get().loadSessions();
      set({
        currentSessionId: id,
        messages: [],
        streamingContent: '',
        isStreaming: false
      });
      return id;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  deleteSession: async (id: string) => {
    try {
      await api.deleteSession(id);
      const { sessions, currentSessionId } = get();
      const newSessions = sessions.filter(s => s.id !== id);
      set({ sessions: newSessions });

      if (currentSessionId === id) {
        set({ currentSessionId: null, messages: [] });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  appendStreamToken: (token: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + token,
    }));
  },

  setStreaming: (isStreaming: boolean) => {
    set({ isStreaming });
  },

  clearStreamingContent: () => {
    set({ streamingContent: '' });
  },
}));
