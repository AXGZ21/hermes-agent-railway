from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ToolCall(BaseModel):
    id: Optional[str] = None
    name: str
    arguments: str


class ChatMessage(BaseModel):
    role: str
    content: str
    tool_calls: Optional[List[ToolCall]] = None
    created_at: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class SessionDetailResponse(BaseModel):
    id: str
    title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime


class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Chat"


class CreateSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime


class ConfigResponse(BaseModel):
    provider: str
    model: str
    base_url: Optional[str] = None
    api_keys: Dict[str, Optional[str]]
    log_level: str
    telegram_enabled: bool


class ConfigUpdateRequest(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None
    base_url: Optional[str] = None
    api_keys: Optional[Dict[str, str]] = None
    log_level: Optional[str] = None


class ProviderInfo(BaseModel):
    id: str
    name: str
    description: str
    requires_api_key: bool
    supports_streaming: bool


class ProvidersResponse(BaseModel):
    providers: List[ProviderInfo]


class LogEntry(BaseModel):
    id: int
    level: str
    logger: str
    message: str
    created_at: datetime


class LogsResponse(BaseModel):
    logs: List[LogEntry]
    total: int
    page: int
    page_size: int


class SkillResponse(BaseModel):
    id: str
    name: str
    description: str
    content: Optional[str] = None
    enabled: bool
    created_at: datetime
    updated_at: datetime


class CreateSkillRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    enabled: bool = True


class UpdateSkillRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    enabled: Optional[bool] = None


class HealthResponse(BaseModel):
    status: str
    agent_initialized: bool
    database_connected: bool
    version: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


class ExportSessionResponse(BaseModel):
    session_id: str
    title: str
    messages: List[ChatMessage]
    exported_at: datetime


# Memory schemas
class MemoryFileResponse(BaseModel):
    name: str
    filename: str
    content: str
    description: str
    updated_at: Optional[float] = None


class UpdateMemoryRequest(BaseModel):
    content: str


# Tools schemas
class ToolResponse(BaseModel):
    name: str
    description: str
    category: str
    enabled: bool


# Gateway schemas
class GatewayPlatformStatus(BaseModel):
    id: str
    name: str
    configured: bool
    connected: bool
    icon: str


class GatewayStatusResponse(BaseModel):
    platforms: List[GatewayPlatformStatus]


# Cron schemas
class CronJobResponse(BaseModel):
    id: str
    name: str
    schedule: str
    command: str
    enabled: bool
    last_run: Optional[str] = None
    next_run: Optional[str] = None
    created_at: str


class CreateCronJobRequest(BaseModel):
    name: str
    schedule: str
    command: str
    enabled: bool = True
