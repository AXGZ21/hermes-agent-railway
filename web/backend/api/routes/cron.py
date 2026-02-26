from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from datetime import datetime
from ..models.schemas import CronJobResponse, CreateCronJobRequest
from ..database.db import get_db

router = APIRouter(tags=["cron"])


@router.get("/jobs", response_model=List[CronJobResponse])
async def list_cron_jobs():
    """
    List all scheduled cron jobs.

    Returns:
        List of CronJobResponse objects
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if cron_jobs table exists, create if not
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cron_jobs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                schedule TEXT NOT NULL,
                command TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                last_run TEXT,
                next_run TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()

        cursor.execute(
            """
            SELECT id, name, schedule, command, enabled, last_run, next_run, created_at
            FROM cron_jobs
            ORDER BY created_at DESC
            """
        )

        jobs = []
        for row in cursor.fetchall():
            jobs.append(
                CronJobResponse(
                    id=row["id"],
                    name=row["name"],
                    schedule=row["schedule"],
                    command=row["command"],
                    enabled=bool(row["enabled"]),
                    last_run=row["last_run"],
                    next_run=row["next_run"],
                    created_at=row["created_at"],
                )
            )

        return jobs


@router.post("/jobs", response_model=CronJobResponse, status_code=status.HTTP_201_CREATED)
async def create_cron_job(request: CreateCronJobRequest):
    """
    Create a new scheduled cron job.

    Args:
        request: CreateCronJobRequest with job details

    Returns:
        CronJobResponse with created job details
    """
    job_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()

        # Ensure table exists
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cron_jobs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                schedule TEXT NOT NULL,
                command TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                last_run TEXT,
                next_run TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cursor.execute(
            """
            INSERT INTO cron_jobs (id, name, schedule, command, enabled, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                request.name,
                request.schedule,
                request.command,
                int(request.enabled),
                created_at,
            ),
        )
        conn.commit()

        # Return the created job
        cursor.execute(
            """
            SELECT id, name, schedule, command, enabled, last_run, next_run, created_at
            FROM cron_jobs
            WHERE id = ?
            """,
            (job_id,),
        )
        row = cursor.fetchone()

        return CronJobResponse(
            id=row["id"],
            name=row["name"],
            schedule=row["schedule"],
            command=row["command"],
            enabled=bool(row["enabled"]),
            last_run=row["last_run"],
            next_run=row["next_run"],
            created_at=row["created_at"],
        )


@router.delete("/jobs/{job_id}")
async def delete_cron_job(job_id: str):
    """
    Delete a scheduled cron job.

    Args:
        job_id: The job ID to delete

    Returns:
        Success message

    Raises:
        HTTPException: If job not found
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if table exists
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS cron_jobs (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                schedule TEXT NOT NULL,
                command TEXT NOT NULL,
                enabled INTEGER DEFAULT 1,
                last_run TEXT,
                next_run TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cursor.execute("DELETE FROM cron_jobs WHERE id = ?", (job_id,))
        deleted = cursor.rowcount > 0
        conn.commit()

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cron job not found"
        )

    return {"message": "Cron job deleted successfully"}
