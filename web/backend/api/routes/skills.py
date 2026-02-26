from fastapi import APIRouter, HTTPException, status
from typing import List
import uuid
from ..models.schemas import (
    SkillResponse,
    CreateSkillRequest,
    UpdateSkillRequest,
)
from ..database.db import get_db

router = APIRouter(tags=["skills"])


@router.get("", response_model=List[SkillResponse])
async def list_skills():
    """
    List all skills.

    Returns:
        List of SkillResponse objects
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, description, content, enabled, created_at, updated_at
            FROM skills
            ORDER BY created_at DESC
            """
        )

        skills = []
        for row in cursor.fetchall():
            skills.append(
                SkillResponse(
                    id=row["id"],
                    name=row["name"],
                    description=row["description"],
                    content=row["content"],
                    enabled=bool(row["enabled"]),
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )
            )

    return skills


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill(skill_id: str):
    """
    Get a specific skill.

    Args:
        skill_id: The skill ID

    Returns:
        SkillResponse with skill details

    Raises:
        HTTPException: If skill not found
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, name, description, content, enabled, created_at, updated_at
            FROM skills
            WHERE id = ?
            """,
            (skill_id,),
        )

        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found"
            )

        return SkillResponse(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            content=row["content"],
            enabled=bool(row["enabled"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(request: CreateSkillRequest):
    """
    Create a new skill.

    Args:
        request: CreateSkillRequest with skill details

    Returns:
        SkillResponse with created skill
    """
    skill_id = str(uuid.uuid4())

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO skills (id, name, description, content, enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """,
            (
                skill_id,
                request.name,
                request.description,
                request.content,
                int(request.enabled),
            ),
        )
        conn.commit()

        # Return the created skill
        cursor.execute(
            """
            SELECT id, name, description, content, enabled, created_at, updated_at
            FROM skills
            WHERE id = ?
            """,
            (skill_id,),
        )
        row = cursor.fetchone()

        return SkillResponse(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            content=row["content"],
            enabled=bool(row["enabled"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(skill_id: str, request: UpdateSkillRequest):
    """
    Update an existing skill.

    Args:
        skill_id: The skill ID to update
        request: UpdateSkillRequest with fields to update

    Returns:
        SkillResponse with updated skill

    Raises:
        HTTPException: If skill not found
    """
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if skill exists
        cursor.execute("SELECT id FROM skills WHERE id = ?", (skill_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found"
            )

        # Build update query dynamically
        updates = []
        params = []

        if request.name is not None:
            updates.append("name = ?")
            params.append(request.name)

        if request.description is not None:
            updates.append("description = ?")
            params.append(request.description)

        if request.content is not None:
            updates.append("content = ?")
            params.append(request.content)

        if request.enabled is not None:
            updates.append("enabled = ?")
            params.append(int(request.enabled))

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(skill_id)

            query = f"UPDATE skills SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()

        # Return updated skill
        cursor.execute(
            """
            SELECT id, name, description, content, enabled, created_at, updated_at
            FROM skills
            WHERE id = ?
            """,
            (skill_id,),
        )
        row = cursor.fetchone()

        return SkillResponse(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            content=row["content"],
            enabled=bool(row["enabled"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )


@router.delete("/{skill_id}")
async def delete_skill(skill_id: str):
    """
    Delete a skill.

    Args:
        skill_id: The skill ID to delete

    Returns:
        Success message

    Raises:
        HTTPException: If skill not found
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM skills WHERE id = ?", (skill_id,))
        deleted = cursor.rowcount > 0
        conn.commit()

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found"
        )

    return {"message": "Skill deleted successfully"}
