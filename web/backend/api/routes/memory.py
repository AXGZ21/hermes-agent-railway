from fastapi import APIRouter, HTTPException, status
from typing import List
import os
from pathlib import Path
from ..models.schemas import MemoryFileResponse, UpdateMemoryRequest

router = APIRouter(tags=["memory"])

# Define memory directory - try multiple locations
def get_memory_dir() -> Path:
    """Get the memory directory path."""
    possible_dirs = [
        Path("/app/data/memories"),
        Path.home() / ".hermes",
        Path.home() / ".hermes" / "memories",
    ]

    for dir_path in possible_dirs:
        if dir_path.exists():
            return dir_path

    # Default to ~/.hermes if nothing exists
    default_dir = Path.home() / ".hermes"
    default_dir.mkdir(parents=True, exist_ok=True)
    return default_dir


MEMORY_FILES = {
    "SOUL.md": {
        "name": "Soul",
        "description": "Agent personality, values, and behavioral guidelines",
    },
    "MEMORY.md": {
        "name": "Agent Memory",
        "description": "Persistent notes and knowledge across sessions",
    },
    "USER.md": {
        "name": "User Profile",
        "description": "Information about user preferences and context",
    },
}


@router.get("", response_model=List[MemoryFileResponse])
async def list_memory_files():
    """
    List all memory files with their metadata.

    Returns:
        List of MemoryFileResponse objects with file information
    """
    memory_dir = get_memory_dir()
    files = []

    for filename, info in MEMORY_FILES.items():
        file_path = memory_dir / filename

        # Read content if file exists, otherwise use empty string
        content = ""
        updated_at = None

        if file_path.exists():
            try:
                content = file_path.read_text(encoding="utf-8")
                stat = file_path.stat()
                updated_at = stat.st_mtime
            except Exception as e:
                print(f"Error reading {filename}: {e}")

        files.append(
            MemoryFileResponse(
                name=info["name"],
                filename=filename,
                content=content,
                description=info["description"],
                updated_at=updated_at,
            )
        )

    return files


@router.get("/{filename}", response_model=MemoryFileResponse)
async def get_memory_file(filename: str):
    """
    Get a specific memory file's content.

    Args:
        filename: The memory file name (SOUL.md, MEMORY.md, or USER.md)

    Returns:
        MemoryFileResponse with file content

    Raises:
        HTTPException: If file name is invalid
    """
    if filename not in MEMORY_FILES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invalid memory file. Valid files: {', '.join(MEMORY_FILES.keys())}",
        )

    memory_dir = get_memory_dir()
    file_path = memory_dir / filename
    info = MEMORY_FILES[filename]

    # Read content if file exists
    content = ""
    updated_at = None

    if file_path.exists():
        try:
            content = file_path.read_text(encoding="utf-8")
            stat = file_path.stat()
            updated_at = stat.st_mtime
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading file: {str(e)}",
            )

    return MemoryFileResponse(
        name=info["name"],
        filename=filename,
        content=content,
        description=info["description"],
        updated_at=updated_at,
    )


@router.put("/{filename}", response_model=MemoryFileResponse)
async def update_memory_file(filename: str, request: UpdateMemoryRequest):
    """
    Update a memory file's content.

    Args:
        filename: The memory file name to update
        request: UpdateMemoryRequest with new content

    Returns:
        MemoryFileResponse with updated content

    Raises:
        HTTPException: If file name is invalid or write fails
    """
    if filename not in MEMORY_FILES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invalid memory file. Valid files: {', '.join(MEMORY_FILES.keys())}",
        )

    memory_dir = get_memory_dir()
    memory_dir.mkdir(parents=True, exist_ok=True)

    file_path = memory_dir / filename
    info = MEMORY_FILES[filename]

    try:
        # Write content to file
        file_path.write_text(request.content, encoding="utf-8")

        # Get updated timestamp
        stat = file_path.stat()
        updated_at = stat.st_mtime

        return MemoryFileResponse(
            name=info["name"],
            filename=filename,
            content=request.content,
            description=info["description"],
            updated_at=updated_at,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error writing file: {str(e)}",
        )
