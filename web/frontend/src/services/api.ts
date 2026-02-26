import { Session, Message, Config, LogEntry, Skill } from '../types';

class APIClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('hermes_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(password: string): Promise<{ access_token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  // Sessions
  async getSessions(): Promise<Session[]> {
    const data = await this.request<{ sessions: Session[] }>('/sessions');
    return data.sessions;
  }

  async getSession(id: string): Promise<{ session: Session; messages: Message[] }> {
    return this.request(`/sessions/${id}`);
  }

  async createSession(): Promise<{ id: string }> {
    return this.request('/sessions', { method: 'POST' });
  }

  async deleteSession(id: string): Promise<void> {
    await this.request(`/sessions/${id}`, { method: 'DELETE' });
  }

  // Config
  async getConfig(): Promise<Config> {
    return this.request('/config');
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async getProviders(): Promise<{ providers: any[] }> {
    return this.request('/config/providers');
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return this.request('/config/test-connection', { method: 'POST' });
  }

  // Logs
  async getLogs(params: {
    level?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: LogEntry[]; total: number }> {
    const query = new URLSearchParams();
    if (params.level) query.append('level', params.level);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    return this.request(`/logs?${query.toString()}`);
  }

  async clearLogs(): Promise<void> {
    await this.request('/logs', { method: 'DELETE' });
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    const data = await this.request<{ skills: Skill[] }>('/skills');
    return data.skills;
  }

  async createSkill(skill: Partial<Skill>): Promise<Skill> {
    return this.request('/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    return this.request(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSkill(id: string): Promise<void> {
    await this.request(`/skills/${id}`, { method: 'DELETE' });
  }

  // Health
  async getHealth(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const api = new APIClient();
