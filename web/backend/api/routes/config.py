from fastapi import APIRouter
from typing import List
from ..models.schemas import (
    ConfigResponse,
    ConfigUpdateRequest,
    ProviderInfo,
    ProvidersResponse,
)
from ..services.config_service import get_config, update_config, get_providers

router = APIRouter(tags=["config"])


@router.get("", response_model=ConfigResponse)
async def get_configuration():
    """
    Get current configuration.
    API keys are masked for security.

    Returns:
        ConfigResponse with current configuration
    """
    return get_config()


@router.put("", response_model=ConfigResponse)
async def update_configuration(request: ConfigUpdateRequest):
    """
    Update configuration.
    Changes are saved to the database and will override environment variables.

    Note: API key changes require environment variable updates and service restart.

    Args:
        request: ConfigUpdateRequest with fields to update

    Returns:
        ConfigResponse with updated configuration
    """
    updates = request.model_dump(exclude_none=True)
    return update_config(updates)


@router.get("/providers", response_model=ProvidersResponse)
async def get_available_providers():
    """
    Get list of available LLM providers.

    Returns:
        ProvidersResponse with list of provider information
    """
    providers = get_providers()
    return ProvidersResponse(providers=providers)
