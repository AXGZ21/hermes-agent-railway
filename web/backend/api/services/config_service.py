import os
from typing import Dict, Optional, List
from ..database.db import get_db
from ..models.schemas import ConfigResponse, ProviderInfo

# Mapping between short key names and os.environ key names
_API_KEY_MAP = {
    "openrouter": "OPENROUTER_API_KEY",
    "nous": "NOUS_API_KEY",
    "custom": "CUSTOM_API_KEY",
    "firecrawl": "FIRECRAWL_API_KEY",
    "fal": "FAL_KEY",
    "browserbase": "BROWSERBASE_API_KEY",
    "telegram": "TELEGRAM_BOT_TOKEN",
}


def mask_key(key: Optional[str]) -> Optional[str]:
    """Mask an API key for display, showing only first 4 and last 4 characters."""
    if not key or len(key) < 8:
        return None
    return f"{key[:4]}...{key[-4:]}"


def _resolve_key(name: str, db_config: Dict[str, str]) -> Optional[str]:
    """Get an API key value: DB override takes priority over env var."""
    env_name = _API_KEY_MAP.get(name, "")
    db_key = f"API_KEY_{name.upper()}"
    return db_config.get(db_key) or os.getenv(env_name) or None


def get_config() -> ConfigResponse:
    """Get current config, merging env vars with DB overrides."""
    provider = os.getenv("LLM_PROVIDER", "openrouter")
    model = os.getenv("LLM_MODEL", "anthropic/claude-3.5-sonnet")
    base_url = os.getenv("LLM_BASE_URL", "")
    log_level = os.getenv("LOG_LEVEL", "INFO")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM config")
        db_config = {row["key"]: row["value"] for row in cursor.fetchall()}

    provider = db_config.get("LLM_PROVIDER", provider)
    model = db_config.get("LLM_MODEL", model)
    base_url = db_config.get("LLM_BASE_URL", base_url)
    log_level = db_config.get("LOG_LEVEL", log_level)

    # Resolve API keys (DB overrides env vars) and mask for display
    api_keys = {}
    for name in _API_KEY_MAP:
        raw = _resolve_key(name, db_config)
        api_keys[name] = mask_key(raw)

    telegram_enabled = bool(_resolve_key("telegram", db_config))

    return ConfigResponse(
        provider=provider,
        model=model,
        base_url=base_url or None,
        api_keys=api_keys,
        log_level=log_level,
        telegram_enabled=telegram_enabled,
    )


def get_resolved_api_key(name: str) -> Optional[str]:
    """Get the real (unmasked) API key value for use by the agent."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM config")
        db_config = {row["key"]: row["value"] for row in cursor.fetchall()}
    return _resolve_key(name, db_config)


def get_resolved_config() -> Dict[str, str]:
    """Get fully resolved config (with real keys) as env-var-style dict."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT key, value FROM config")
        db_config = {row["key"]: row["value"] for row in cursor.fetchall()}

    result = {
        "LLM_PROVIDER": db_config.get("LLM_PROVIDER", os.getenv("LLM_PROVIDER", "openrouter")),
        "LLM_MODEL": db_config.get("LLM_MODEL", os.getenv("LLM_MODEL", "anthropic/claude-3.5-sonnet")),
        "LLM_BASE_URL": db_config.get("LLM_BASE_URL", os.getenv("LLM_BASE_URL", "")),
        "LOG_LEVEL": db_config.get("LOG_LEVEL", os.getenv("LOG_LEVEL", "INFO")),
    }

    for name, env_name in _API_KEY_MAP.items():
        val = _resolve_key(name, db_config)
        if val:
            result[env_name] = val

    return result


def apply_config_to_env() -> None:
    """Push resolved config into os.environ so the Hermes agent core picks it up."""
    resolved = get_resolved_config()
    for key, value in resolved.items():
        if value:
            os.environ[key] = value


def _upsert(cursor, key: str, value: str) -> None:
    cursor.execute(
        """
        INSERT INTO config (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
        """,
        (key, value, value),
    )


def update_config(updates: Dict[str, any]) -> ConfigResponse:
    """Update configuration in the database and apply to environment."""
    with get_db() as conn:
        cursor = conn.cursor()

        if updates.get("provider"):
            _upsert(cursor, "LLM_PROVIDER", updates["provider"])
        if updates.get("model"):
            _upsert(cursor, "LLM_MODEL", updates["model"])
        if "base_url" in updates:
            _upsert(cursor, "LLM_BASE_URL", updates.get("base_url") or "")
        if updates.get("log_level"):
            _upsert(cursor, "LOG_LEVEL", updates["log_level"])

        # Save API keys to DB
        if updates.get("api_keys"):
            for name, value in updates["api_keys"].items():
                if not value or "..." in value:
                    continue
                db_key = f"API_KEY_{name.upper()}"
                _upsert(cursor, db_key, value)

        conn.commit()

    # Push updated config into os.environ for the agent
    apply_config_to_env()

    return get_config()


def get_providers() -> List[ProviderInfo]:
    """Get list of available LLM providers."""
    return [
        ProviderInfo(
            id="openrouter",
            name="OpenRouter",
            description="Access 200+ models through a single API (openrouter.ai)",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="nous",
            name="Nous Portal",
            description="Nous Research model portal (portal.nousresearch.com)",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="custom",
            name="Custom Endpoint",
            description="Any OpenAI-compatible API (vLLM, Ollama, etc.)",
            requires_api_key=False,
            supports_streaming=True,
        ),
    ]
