from fastapi import APIRouter, Query
from typing import Optional
from ..models.schemas import LogsResponse, LogEntry
from ..database.db import get_db

router = APIRouter(tags=["logs"])


@router.get("", response_model=LogsResponse)
async def get_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    level: Optional[str] = Query(None, description="Filter by log level"),
):
    """
    Get application logs with pagination and optional filtering.

    Args:
        page: Page number (starting from 1)
        page_size: Number of logs per page (1-100)
        level: Optional log level filter (DEBUG, INFO, WARNING, ERROR, CRITICAL)

    Returns:
        LogsResponse with logs and pagination info
    """
    offset = (page - 1) * page_size

    with get_db() as conn:
        cursor = conn.cursor()

        # Build query
        where_clause = ""
        params = []

        if level:
            where_clause = "WHERE level = ?"
            params.append(level.upper())

        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM logs {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        # Get logs
        logs_query = f"""
            SELECT id, level, logger, message, created_at
            FROM logs
            {where_clause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(logs_query, params + [page_size, offset])

        logs = []
        for row in cursor.fetchall():
            logs.append(
                LogEntry(
                    id=row["id"],
                    level=row["level"],
                    logger=row["logger"],
                    message=row["message"],
                    created_at=row["created_at"],
                )
            )

    return LogsResponse(logs=logs, total=total, page=page, page_size=page_size)


@router.delete("")
async def clear_logs(level: Optional[str] = Query(None, description="Clear only logs of this level")):
    """
    Clear application logs.

    Args:
        level: Optional log level to clear (if not specified, clears all logs)

    Returns:
        Success message with count of deleted logs
    """
    with get_db() as conn:
        cursor = conn.cursor()

        if level:
            cursor.execute("DELETE FROM logs WHERE level = ?", (level.upper(),))
        else:
            cursor.execute("DELETE FROM logs")

        deleted_count = cursor.rowcount
        conn.commit()

    return {"message": f"Deleted {deleted_count} log entries", "count": deleted_count}
