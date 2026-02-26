<p align="center">
  <img src="assets/banner.png" alt="Hermes Agent" width="100%">
</p>

# Hermes Agent - Railway Template

<p align="center">
  <a href="https://railway.app/template/hermes-agent"><img src="https://railway.app/button.svg" alt="Deploy on Railway"></a>
</p>

<p align="center">
  <a href="https://x.com/NousResearch"><img src="https://img.shields.io/badge/@NousResearch-black?style=for-the-badge&logo=X&logoColor=white" alt="@NousResearch"/></a>
  <a href="https://discord.gg/NousResearch"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://github.com/NousResearch/hermes-agent/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License: MIT"></a>
  <a href="https://nousresearch.com"><img src="https://img.shields.io/badge/Built%20by-Nous%20Research-blueviolet?style=for-the-badge" alt="Built by Nous Research"></a>
</p>

**One-click Railway deployment of [Hermes Agent](https://github.com/NousResearch/hermes-agent) with a full Web UI dashboard.** The fully open-source autonomous AI agent by Nous Research, now with a browser-based management interface.

---

## What's Included

| Feature | Description |
|---------|-------------|
| **Web UI Dashboard** | Chat interface, configuration panel, logs viewer, skills manager, and session history |
| **Real-time Chat** | WebSocket-based streaming with tool call visualization |
| **Multi-Provider LLM** | OpenRouter (200+ models), Nous Portal, or your own custom endpoint |
| **40+ Built-in Tools** | Web search, terminal, browser automation, image generation, vision, TTS, and more |
| **Telegram Gateway** | Optional Telegram bot integration (auto-starts when token is configured) |
| **Persistent Storage** | SQLite database for sessions, messages, config, and logs |
| **Skills System** | Install, manage, and create agent skills from the web UI |
| **Scheduled Tasks** | Built-in cron scheduler for automated reports and tasks |

## Quick Start

### Deploy to Railway

1. Click the **Deploy on Railway** button above
2. Set your environment variables:
   - `OPENROUTER_API_KEY` - Get one at [openrouter.ai/keys](https://openrouter.ai/keys)
   - `WEB_UI_PASSWORD` - Choose a password for the dashboard
   - `JWT_SECRET` - Any random string (auto-generated if not set)
3. Deploy and wait for the health check to pass
4. Access the web UI at your Railway domain
5. Login with your `WEB_UI_PASSWORD`

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes* | - | OpenRouter API key |
| `NOUS_API_KEY` | No | - | Nous Portal API key |
| `LLM_PROVIDER` | No | `openrouter` | Provider: `openrouter`, `nous_portal`, or `custom` |
| `LLM_MODEL` | No | `anthropic/claude-opus-4.6` | Default model (OpenRouter format) |
| `LLM_BASE_URL` | No | auto | Custom endpoint URL |
| `WEB_UI_PASSWORD` | Yes | - | Dashboard login password |
| `JWT_SECRET` | Yes | auto | JWT signing secret |
| `TELEGRAM_BOT_TOKEN` | No | - | Enables Telegram gateway |
| `FIRECRAWL_API_KEY` | No | - | Web search tool |
| `FAL_KEY` | No | - | Image generation tool |
| `BROWSERBASE_API_KEY` | No | - | Browser automation |
| `LOG_LEVEL` | No | `INFO` | Logging level |

*At least one LLM provider key is required.

## Architecture

```
Railway Container
├── FastAPI Backend (PORT)
│   ├── WebSocket /ws/chat (streaming chat)
│   ├── REST API /api/* (config, logs, skills, sessions)
│   ├── Static React frontend at /
│   └── Hermes Agent core integration
├── Telegram Gateway (optional)
└── Supervisord (process manager)
```

**Stack:** Python 3.11 + FastAPI + React 18 + TypeScript + Tailwind CSS + SQLite

## Web UI Features

### Chat
- Real-time streaming responses via WebSocket
- Tool call visualization with expandable details
- Multiple sessions with persistent history
- New chat creation

### Configuration
- Switch between LLM providers (OpenRouter, Nous Portal, Custom)
- Model selection
- API key management (securely masked)
- Telegram bot configuration
- Tool API key management

### Logs
- Real-time log viewer with level filtering
- Search and pagination
- Auto-refresh toggle

### Skills
- Browse and manage installed skills
- Enable/disable skills
- Create custom skills
- Search and filter

### Sessions
- Full session history with search
- View past conversations
- Export sessions as JSON
- Delete old sessions

## Development

### Local Setup

```bash
# Clone the repo
git clone https://github.com/AXGZ21/hermes-agent-railway.git
cd hermes-agent-railway

# Install Python dependencies
pip install -e ".[all]"
pip install -r web/backend/requirements.txt

# Install frontend dependencies
cd web/frontend
npm install
cd ../..

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run backend
PYTHONPATH=. uvicorn web.backend.api.main:app --reload --port 8000

# Run frontend (in another terminal)
cd web/frontend
npm run dev
```

### Docker Build

```bash
docker build -f docker/Dockerfile -t hermes-agent .
docker run -p 8000:8000 \
  -e OPENROUTER_API_KEY=your-key \
  -e WEB_UI_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  hermes-agent
```

## Based On

This template is built on top of [Hermes Agent](https://github.com/NousResearch/hermes-agent) by [Nous Research](https://nousresearch.com) - the fully open-source AI agent that grows with you.

## License

MIT License - see [LICENSE](LICENSE) for details.
