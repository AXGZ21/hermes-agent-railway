import os
from typing import Dict, Optional, List
from ..database.db import get_db
from ..models.schemas import ConfigResponse, ProviderInfo


def mask_key(key: Optional[str]) -> Optional[str]:
    """
    Mask an API key for display, showing only first 4 and last 4 characters.

    Args:
        key: The API key to mask

    Returns:
        Masked key string or None if key is None/empty
    """
    if not key or len(key) < 8:
        return None
    return f"{key[:4]}...{key[-4:]}"


def get_config() -> ConfigResponse:
    """
    Get the current configuration, combining environment variables and database overrides.

    Returns:
        ConfigResponse with current configuration and masked API keys
    """
    # Get base values from environment
    provider = os.getenv("LLM_PROVIDER", "openrouter")
    model = os.getenv("LLM_MODEL", "anthropic/claude-3.5-sonnet")
    base_url = os.getenv("LLM_BASE_URL", "")
    log_level = os.getenv("LOG_LEVEL", "INFO")

    # Check for overrides in database
    with get_db() as conn:
        cursor = conn.cursor()

        # Get config overrides
        cursor.execute("SELECT key, value FROM config")
        db_config = {row["key"]: row["value"] for row in cursor.fetchall()}

        # Apply overrides
        provider = db_config.get("LLM_PROVIDER", provider)
        model = db_config.get("LLM_MODEL", model)
        base_url = db_config.get("LLM_BASE_URL", base_url)
        log_level = db_config.get("LOG_LEVEL", log_level)

    # Get API keys and mask them
    api_keys = {
        "openrouter": mask_key(os.getenv("OPENROUTER_API_KEY")),
        "nous": mask_key(os.getenv("NOUS_API_KEY")),
        "firecrawl": mask_key(os.getenv("FIRECRAWL_API_KEY")),
        "fal": mask_key(os.getenv("FAL_KEY")),
    }

    # Check if Telegram is enabled
    telegram_enabled = bool(os.getenv("TELEGRAM_BOT_TOKEN"))

    return ConfigResponse(
        provider=provider,
        model=model,
        base_url=base_url or None,
        api_keys=api_keys,
        log_level=log_level,
        telegram_enabled=telegram_enabled,
    )


def update_config(updates: Dict[str, any]) -> ConfigResponse:
    """
    Update configuration values in the database.

    Args:
        updates: Dictionary of configuration values to update

    Returns:
        Updated ConfigResponse
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Update provider
        if "provider" in updates and updates["provider"]:
            cursor.execute(
                """
                INSERT INTO config (key, value, updated_at)
                VALUES ('LLM_PROVIDER', ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
                """,
                (updates["provider"], updates["provider"]),
            )

        # Update model
        if "model" in updates and updates["model"]:
            cursor.execute(
                """
                INSERT INTO config (key, value, updated_at)
                VALUES ('LLM_MODEL', ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
                """,
                (updates["model"], updates["model"]),
            )

        # Update base URL
        if "base_url" in updates:
            cursor.execute(
                """
                INSERT INTO config (key, value, updated_at)
                VALUES ('LLM_BASE_URL', ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
                """,
                (updates["base_url"] or "", updates["base_url"] or ""),
            )

        # Update log level
        if "log_level" in updates and updates["log_level"]:
            cursor.execute(
                """
                INSERT INTO config (key, value, updated_at)
                VALUES ('LOG_LEVEL', ?, CURRENT_TIMESTAMP)
                ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
                """,
                (updates["log_level"], updates["log_level"]),
            )

        # Note: API keys are stored as environment variables, not in DB
        # They need to be updated via environment variable changes and service restart

        conn.commit()

    return get_config()


def get_providers() -> List[ProviderInfo]:
    """
    Get list of available LLM providers.

    Returns:
        List of ProviderInfo objects
    """
    providers = [
        ProviderInfo(
            id="openrouter",
            name="OpenRouter",
            description="Access to multiple LLM providers through OpenRouter API",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="nous",
            name="Nous Research",
            description="Direct access to Nous Research models",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="openai",
            name="OpenAI",
            description="OpenAI GPT models",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="anthropic",
            name="Anthropic",
            description="Claude models from Anthropic",
            requires_api_key=True,
            supports_streaming=True,
        ),
        ProviderInfo(
            id="local",
            name="Local Model",
            description="Local or custom endpoint",
            requires_api_key=False,
            supports_streaming=True,
        ),
    ]
    return providers
