from fastapi import APIRouter
from ..models.schemas import HealthResponse
from ..services.agent_service import AgentService
from ..database.db import get_db

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns the current status of the server and its dependencies.
    """
    # Check database connection
    database_connected = True
    try:
        with get_db() as conn:
            conn.execute("SELECT 1")
    except Exception:
        database_connected = False

    # Check agent initialization
    agent_initialized = AgentService.is_initialized()

    # Determine overall status
    status = "healthy"
    if not database_connected or not agent_initialized:
        status = "degraded"

    return HealthResponse(
        status=status,
        agent_initialized=agent_initialized,
        database_connected=database_connected,
        version="1.0.0",
    )
