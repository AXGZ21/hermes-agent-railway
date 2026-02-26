import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .database.db import init_db
from .services.agent_service import AgentService
from .services.auth_service import get_current_user
from .services.config_service import apply_config_to_env
from .websocket import websocket_endpoint

# Import routers
from .routes.health import router as health_router
from .routes.auth import router as auth_router
from .routes.chat import router as chat_router
from .routes.config import router as config_router
from .routes.logs import router as logs_router
from .routes.skills import router as skills_router
from .routes.sessions import router as sessions_router
from .routes.memory import router as memory_router
from .routes.tools import router as tools_router
from .routes.gateway import router as gateway_router
from .routes.cron import router as cron_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("Initializing database...")
    init_db()

    print("Loading saved configuration into environment...")
    apply_config_to_env()

    print("Initializing agent service...")
    AgentService.initialize()

    print("Server startup complete")

    yield

    # Shutdown
    print("Server shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Hermes Agent",
    description="Web API for Hermes Agent - AI agent with 40+ tools",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route (no auth required)
app.include_router(health_router, prefix="/api")

# Auth routes (no auth required)
app.include_router(auth_router, prefix="/api/auth")

# Protected routes (auth required)
app.include_router(
    chat_router,
    prefix="/api/chat",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    config_router,
    prefix="/api/config",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    logs_router,
    prefix="/api/logs",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    skills_router,
    prefix="/api/skills",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    sessions_router,
    prefix="/api/sessions",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    memory_router,
    prefix="/api/memory",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    tools_router,
    prefix="/api/tools",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    gateway_router,
    prefix="/api/gateway",
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    cron_router,
    prefix="/api/cron",
    dependencies=[Depends(get_current_user)],
)

# WebSocket endpoint
app.add_api_websocket_route("/ws/chat", websocket_endpoint)

# Serve React SPA with proper client-side routing fallback
frontend_dir = os.path.join(os.path.dirname(__file__), "../../frontend/dist")
frontend_dir = os.path.abspath(frontend_dir)

if os.path.isdir(frontend_dir):
    print(f"Serving frontend from: {frontend_dir}")
    # Mount /assets for hashed static files (JS, CSS, images)
    assets_dir = os.path.join(frontend_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """
        SPA catch-all: serve static file if it exists, otherwise index.html.
        """
        file_path = os.path.join(frontend_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))
else:
    print(f"Frontend directory not found: {frontend_dir}")
    print("Frontend will not be served. Build the frontend first.")

    @app.get("/")
    async def root():
        return {
            "name": "Hermes Agent API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/health",
        }
