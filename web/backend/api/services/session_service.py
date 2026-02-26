import uuid
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from ..database.db import get_db
from ..models.schemas import (
    SessionResponse,
    SessionDetailResponse,
    ChatMessage,
    ToolCall,
    CreateSessionResponse,
)


def create_session(title: Optional[str] = None) -> CreateSessionResponse:
    """
    Create a new chat session.

    Args:
        title: Optional title for the session

    Returns:
        CreateSessionResponse with session details
    """
    session_id = str(uuid.uuid4())
    session_title = title or "New Chat"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sessions (id, title, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (session_id, session_title),
        )
        conn.commit()

        # Get the created session
        cursor.execute(
            "SELECT id, title, created_at FROM sessions WHERE id = ?", (session_id,)
        )
        row = cursor.fetchone()

    return CreateSessionResponse(
        id=row["id"], title=row["title"], created_at=row["created_at"]
    )


def list_sessions(limit: int = 50, offset: int = 0) -> List[SessionResponse]:
    """
    List all chat sessions with message counts.

    Args:
        limit: Maximum number of sessions to return
        offset: Number of sessions to skip

    Returns:
        List of SessionResponse objects
    """
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
            GROUP BY s.id
            ORDER BY s.updated_at DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
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


def get_session(session_id: str) -> Optional[SessionDetailResponse]:
    """
    Get a session with all its messages.

    Args:
        session_id: The session ID to retrieve

    Returns:
        SessionDetailResponse or None if not found
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Get session
        cursor.execute(
            "SELECT id, title, created_at, updated_at FROM sessions WHERE id = ?",
            (session_id,),
        )
        session_row = cursor.fetchone()

        if not session_row:
            return None

        # Get messages
        cursor.execute(
            """
            SELECT id, role, content, tool_calls, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY created_at ASC
            """,
            (session_id,),
        )

        messages = []
        for msg_row in cursor.fetchall():
            tool_calls = None
            if msg_row["tool_calls"]:
                try:
                    tool_calls_data = json.loads(msg_row["tool_calls"])
                    tool_calls = [ToolCall(**tc) for tc in tool_calls_data]
                except json.JSONDecodeError:
                    pass

            messages.append(
                ChatMessage(
                    role=msg_row["role"],
                    content=msg_row["content"],
                    tool_calls=tool_calls,
                    created_at=msg_row["created_at"],
                )
            )

    return SessionDetailResponse(
        id=session_row["id"],
        title=session_row["title"],
        messages=messages,
        created_at=session_row["created_at"],
        updated_at=session_row["updated_at"],
    )


def delete_session(session_id: str) -> bool:
    """
    Delete a session and all its messages.

    Args:
        session_id: The session ID to delete

    Returns:
        True if deleted, False if not found
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        deleted = cursor.rowcount > 0
        conn.commit()

    return deleted


def add_message(
    session_id: str,
    role: str,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None,
) -> None:
    """
    Add a message to a session.

    Args:
        session_id: The session ID
        role: Message role (user, assistant, system, tool)
        content: Message content
        tool_calls: Optional list of tool calls
    """
    tool_calls_json = None
    if tool_calls:
        tool_calls_json = json.dumps(tool_calls)

    with get_db() as conn:
        cursor = conn.cursor()

        # Insert message
        cursor.execute(
            """
            INSERT INTO messages (session_id, role, content, tool_calls, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (session_id, role, content, tool_calls_json),
        )

        # Update session timestamp
        cursor.execute(
            "UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (session_id,),
        )

        conn.commit()


def get_messages(session_id: str) -> List[ChatMessage]:
    """
    Get all messages for a session.

    Args:
        session_id: The session ID

    Returns:
        List of ChatMessage objects
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT role, content, tool_calls, created_at
            FROM messages
            WHERE session_id = ?
            ORDER BY created_at ASC
            """,
            (session_id,),
        )

        messages = []
        for row in cursor.fetchall():
            tool_calls = None
            if row["tool_calls"]:
                try:
                    tool_calls_data = json.loads(row["tool_calls"])
                    tool_calls = [ToolCall(**tc) for tc in tool_calls_data]
                except json.JSONDecodeError:
                    pass

            messages.append(
                ChatMessage(
                    role=row["role"],
                    content=row["content"],
                    tool_calls=tool_calls,
                    created_at=row["created_at"],
                )
            )

    return messages


def update_session_title(session_id: str, title: str) -> bool:
    """
    Update a session's title.

    Args:
        session_id: The session ID
        title: New title

    Returns:
        True if updated, False if not found
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE sessions
            SET title = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (title, session_id),
        )
        updated = cursor.rowcount > 0
        conn.commit()

    return updated


def auto_generate_title(session_id: str) -> None:
    """
    Auto-generate a title from the first user message in a session.

    Args:
        session_id: The session ID
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Get first user message
        cursor.execute(
            """
            SELECT content FROM messages
            WHERE session_id = ? AND role = 'user'
            ORDER BY created_at ASC
            LIMIT 1
            """,
            (session_id,),
        )

        row = cursor.fetchone()
        if row:
            # Use first 50 chars of message as title
            content = row["content"]
            title = content[:50] + ("..." if len(content) > 50 else "")

            cursor.execute(
                """
                UPDATE sessions
                SET title = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (title, session_id),
            )
            conn.commit()
