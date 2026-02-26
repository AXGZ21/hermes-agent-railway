from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from ..models.schemas import (
    SessionResponse,
    SessionDetailResponse,
    ExportSessionResponse,
    ChatMessage,
)
from ..services.session_service import list_sessions, get_session, delete_session
from ..database.db import get_db

router = APIRouter(tags=["sessions"])


@router.get("", response_model=List[SessionResponse])
async def search_sessions(
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    search: Optional[str] = Query(None, description="Search in session titles"),
):
    """
    List and search chat sessions.

    Args:
        limit: Maximum number of sessions to return
        offset: Number of sessions to skip
        search: Optional search query for session titles

    Returns:
        List of SessionResponse objects
    """
    if search:
        # Search in session titles
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT
                    s.id,
                    s.title,
                    s.created_at,
                    s.updated_at,
                    COUNT(m.id) as message_count
                FROM sessions s
                LEFT JOIN messages m ON s.id = m.session_id
                WHERE s.title LIKE ?
                GROUP BY s.id
                ORDER BY s.updated_at DESC
                LIMIT ? OFFSET ?
                """,
                (f"%{search}%", limit, offset),
            )

            sessions = []
            for row in cursor.fetchall():
                sessions.append(
                    SessionResponse(
                        id=row["id"],
                        title=row["title"],
                        created_at=row["created_at"],
                        updated_at=row["updated_at"],
                        message_count=row["message_count"],
                    )
                )
            return sessions
    else:
        return list_sessions(limit=limit, offset=offset)


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session_messages(session_id: str):
    """
    Get all messages for a session.

    Args:
        session_id: The session ID

    Returns:
        SessionDetailResponse with messages

    Raises:
        HTTPException: If session not found
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )
    return session


@router.delete("/{session_id}")
async def delete_session_endpoint(session_id: str):
    """
    Delete a session and all its messages.

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


@router.post("/{session_id}/export", response_model=ExportSessionResponse)
async def export_session(session_id: str):
    """
    Export a session as JSON.

    Args:
        session_id: The session ID to export

    Returns:
        ExportSessionResponse with session data

    Raises:
        HTTPException: If session not found
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Session not found"
        )

    return ExportSessionResponse(
        session_id=session.id,
        title=session.title,
        messages=session.messages,
        exported_at=datetime.utcnow(),
    )
