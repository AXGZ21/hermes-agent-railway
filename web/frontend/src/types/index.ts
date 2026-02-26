export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

export interface ToolCall {
  name: string;
  arguments: string;
  result?: string;
}

export interface Config {
  provider: string;
  model: string;
  base_url: string;
  openrouter_api_key: string;
  nous_api_key: string;
  firecrawl_api_key: string;
  fal_key: string;
  telegram_bot_token: string;
  browserbase_api_key: string;
  log_level: string;
}

export interface LogEntry {
  id: number;
  level: string;
  logger: string;
  message: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  enabled: boolean;
  created_at: string;
}

export interface WSMessage {
  type: 'token' | 'tool_call' | 'tool_result' | 'done' | 'error';
  content?: string;
  name?: string;
  arguments?: string;
  result?: string;
  message?: string;
  session_id?: string;
}
