from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models.schemas import (
    ChatRequest,
    ChatMessage,
    SessionResponse,
    SessionDetailResponse,
    CreateSessionRequest,
    CreateSessionResponse,
)
from ..services.session_service import (
    create_session,
    list_sessions,
    get_session,
    delete_session,
)

router = APIRouter(tags=["chat"])


@router.post("/sessions", response_model=CreateSessionResponse)
async def create_new_session(request: CreateSessionRequest = None):
    """
    Create a new chat session.

    Args:
        request: Optional CreateSessionRequest with title

    Returns:
        CreateSessionResponse with session details
    """
    title = request.title if request else None
    return create_session(title)


@router.get("/sessions", response_model=List[SessionResponse])
async def get_sessions(limit: int = 50, offset: int = 0):
    """
    List all chat sessions.

    Args:
        limit: Maximum number of sessions to return (default 50)
        offset: Number of sessions to skip (default 0)

    Returns:
        List of SessionResponse objects
    """
    return list_sessions(limit=limit, offset=offset)


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session_detail(session_id: str):
    """
    Get a specific session with all messages.

    Args:
        session_id: The session ID

    Returns:
        SessionDetailResponse with session details and messages

    Raises:
        HTTPException: If session not found
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.delete("/sessions/{session_id}")
async def delete_session_endpoint(session_id: str):
    """
    Delete a chat session.

    Args:
        session_id: The session ID to delete

    Returns:
        Success message

    Raises:
        HTTPException: If session not found
    """
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return {"message": "Session deleted successfully"}


@router.post("/message")
async def send_message(request: ChatRequest):
    """
    Send a chat message (non-streaming fallback).
    For streaming, use the WebSocket endpoint at /ws/chat.

    Args:
        request: ChatRequest with message and optional session_id

    Returns:
        Message indicating to use WebSocket for actual chat
    """
    return {
        "message": "Please use the WebSocket endpoint at /ws/chat for chat functionality",
        "websocket_url": "/ws/chat",
    }
