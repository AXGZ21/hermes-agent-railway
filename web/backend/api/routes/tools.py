from fastapi import APIRouter
from typing import List
import sys
import os
from pathlib import Path

# Add parent directory to path to import toolsets
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

from toolsets import get_all_toolsets, resolve_toolset
from ..models.schemas import ToolResponse

router = APIRouter(tags=["tools"])


def get_tool_category(tool_name: str) -> str:
    """Determine the category of a tool based on its name."""
    if tool_name.startswith("web_"):
        return "web"
    elif tool_name.startswith("browser_"):
        return "browser"
    elif tool_name.startswith("vision_") or tool_name == "image_generate":
        return "vision"
    elif tool_name in ["terminal", "process"]:
        return "terminal"
    elif tool_name in ["read_file", "write_file", "patch", "search_files"]:
        return "file"
    elif tool_name.startswith("skills_") or tool_name in ["skill_view", "skill_manage"]:
        return "skills"
    elif tool_name.startswith("rl_"):
        return "rl"
    elif tool_name in ["schedule_cronjob", "list_cronjobs", "remove_cronjob"]:
        return "cronjob"
    elif tool_name == "text_to_speech":
        return "tts"
    elif tool_name == "mixture_of_agents":
        return "moa"
    elif tool_name == "todo":
        return "planning"
    elif tool_name == "memory":
        return "memory"
    elif tool_name == "session_search":
        return "session"
    elif tool_name == "clarify":
        return "interaction"
    elif tool_name == "execute_code":
        return "code_execution"
    elif tool_name == "delegate_task":
        return "delegation"
    elif tool_name == "send_message":
        return "messaging"
    else:
        return "other"


def get_tool_description(tool_name: str) -> str:
    """Get a human-readable description for a tool."""
    descriptions = {
        "web_search": "Search the web for information",
        "web_extract": "Extract content from web pages",
        "browser_navigate": "Navigate to a URL in the browser",
        "browser_snapshot": "Take a screenshot of the current page",
        "browser_click": "Click an element on the page",
        "browser_type": "Type text into an input field",
        "browser_scroll": "Scroll the page",
        "browser_back": "Go back to the previous page",
        "browser_press": "Press a keyboard key",
        "browser_close": "Close the browser",
        "browser_get_images": "Get all images from the current page",
        "browser_vision": "Analyze the current page with vision",
        "vision_analyze": "Analyze images with AI vision",
        "image_generate": "Generate images from text descriptions",
        "terminal": "Execute terminal commands",
        "process": "Manage system processes",
        "read_file": "Read file contents",
        "write_file": "Write content to a file",
        "patch": "Apply fuzzy patches to files",
        "search_files": "Search for files and content",
        "skills_list": "List all available skills",
        "skill_view": "View a specific skill",
        "skill_manage": "Create, edit, or delete skills",
        "text_to_speech": "Convert text to speech audio",
        "mixture_of_agents": "Advanced multi-agent reasoning",
        "todo": "Task planning and tracking",
        "memory": "Persistent memory across sessions",
        "session_search": "Search past conversations",
        "clarify": "Ask clarifying questions",
        "execute_code": "Execute Python code",
        "delegate_task": "Spawn subagents for complex tasks",
        "schedule_cronjob": "Schedule automated tasks",
        "list_cronjobs": "List scheduled jobs",
        "remove_cronjob": "Remove a scheduled job",
        "send_message": "Send cross-platform messages",
    }

    # Add RL tools
    rl_tools = {
        "rl_list_environments": "List available RL environments",
        "rl_select_environment": "Select an RL environment",
        "rl_get_current_config": "Get current RL configuration",
        "rl_edit_config": "Edit RL configuration",
        "rl_start_training": "Start RL training",
        "rl_check_status": "Check RL training status",
        "rl_stop_training": "Stop RL training",
        "rl_get_results": "Get RL training results",
        "rl_list_runs": "List RL training runs",
        "rl_test_inference": "Test RL model inference",
    }

    descriptions.update(rl_tools)

    return descriptions.get(tool_name, f"Tool: {tool_name}")


@router.get("", response_model=List[ToolResponse])
async def list_tools():
    """
    List all available tools with their information.

    Returns:
        List of ToolResponse objects with tool details
    """
    # Get all tools from the hermes-cli toolset (most comprehensive)
    all_tools = resolve_toolset("hermes-cli")

    # Convert to response objects
    tools = []
    for tool_name in sorted(all_tools):
        tools.append(
            ToolResponse(
                name=tool_name,
                description=get_tool_description(tool_name),
                category=get_tool_category(tool_name),
                enabled=True,  # All tools in the toolset are enabled
            )
        )

    return tools
