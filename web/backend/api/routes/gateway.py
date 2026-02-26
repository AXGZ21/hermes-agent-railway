from fastapi import APIRouter
import os
from typing import List
from ..models.schemas import GatewayStatusResponse, GatewayPlatformStatus

router = APIRouter(tags=["gateway"])


def check_platform_configured(env_var: str) -> bool:
    """Check if a platform is configured via environment variable."""
    value = os.getenv(env_var)
    return bool(value and value.strip())


def check_platform_connected(platform_id: str) -> bool:
    """
    Check if a platform is currently connected.
    This is a placeholder - in a real implementation, this would check
    if the bot/service is actually running and connected.
    """
    # For now, we'll assume if it's configured, it's connected
    # In a real implementation, you'd check if the gateway service is running
    # and if the specific bot is connected
    configured = False

    if platform_id == "telegram":
        configured = check_platform_configured("TELEGRAM_BOT_TOKEN")
    elif platform_id == "discord":
        configured = check_platform_configured("DISCORD_BOT_TOKEN")
    elif platform_id == "slack":
        configured = check_platform_configured("SLACK_BOT_TOKEN")
    elif platform_id == "whatsapp":
        configured = check_platform_configured("WHATSAPP_API_KEY")

    # Simplified: if configured, assume connected
    # In reality, you'd ping the gateway service or check process status
    return configured


@router.get("/status", response_model=GatewayStatusResponse)
async def get_gateway_status():
    """
    Get the status of all messaging platforms.

    Returns:
        GatewayStatusResponse with platform statuses
    """
    platforms = [
        {
            "id": "telegram",
            "name": "Telegram",
            "env_var": "TELEGRAM_BOT_TOKEN",
            "icon": "telegram",
        },
        {
            "id": "discord",
            "name": "Discord",
            "env_var": "DISCORD_BOT_TOKEN",
            "icon": "discord",
        },
        {
            "id": "slack",
            "name": "Slack",
            "env_var": "SLACK_BOT_TOKEN",
            "icon": "slack",
        },
        {
            "id": "whatsapp",
            "name": "WhatsApp",
            "env_var": "WHATSAPP_API_KEY",
            "icon": "whatsapp",
        },
    ]

    platform_statuses = []

    for platform in platforms:
        configured = check_platform_configured(platform["env_var"])
        connected = check_platform_connected(platform["id"])

        platform_statuses.append(
            GatewayPlatformStatus(
                id=platform["id"],
                name=platform["name"],
                configured=configured,
                connected=connected,
                icon=platform["icon"],
            )
        )

    return GatewayStatusResponse(platforms=platform_statuses)
