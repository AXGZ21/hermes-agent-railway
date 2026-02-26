import os
import sys
from typing import Optional, Callable, AsyncGenerator, Dict, Any, List
import json

# Add parent directories to path to import from hermes agent
HERMES_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../../")
)
sys.path.insert(0, HERMES_ROOT)

try:
    from run_agent import AIAgent
    from model_tools import get_tools
    HERMES_AVAILABLE = True
except ImportError:
    HERMES_AVAILABLE = False
    AIAgent = None
    get_tools = None


class AgentService:
    """Singleton service for managing the AI agent instance."""

    _instance: Optional["AIAgent"] = None
    _initialized: bool = False

    @classmethod
    def initialize(cls, config: Optional[Dict[str, Any]] = None) -> None:
        """
        Initialize the agent service.

        Args:
            config: Optional configuration dictionary
        """
        if cls._initialized:
            return

        if not HERMES_AVAILABLE:
            print("Warning: Hermes agent not available. Agent features will be limited.")
            cls._initialized = True
            return

        try:
            # Create agent instance with default config
            # The AIAgent class reads from environment variables
            cls._instance = AIAgent()
            cls._initialized = True
            print("Agent service initialized successfully")
        except Exception as e:
            print(f"Error initializing agent service: {e}")
            cls._initialized = True

    @classmethod
    def get_instance(cls) -> Optional["AIAgent"]:
        """
        Get the singleton agent instance.

        Returns:
            AIAgent instance or None if not initialized
        """
        return cls._instance

    @classmethod
    def is_initialized(cls) -> bool:
        """
        Check if the agent service is initialized.

        Returns:
            True if initialized
        """
        return cls._initialized

    @classmethod
    async def stream_chat(
        cls,
        message: str,
        session_id: str,
        conversation_history: List[Dict[str, Any]],
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream a chat response from the agent.

        Args:
            message: User message
            session_id: Session ID for context
            conversation_history: Previous messages in the conversation

        Yields:
            Dictionary with response chunks:
            - {"type": "token", "content": "..."}
            - {"type": "tool_call", "name": "...", "arguments": "..."}
            - {"type": "tool_result", "name": "...", "result": "..."}
            - {"type": "error", "message": "..."}
        """
        if not cls._instance:
            yield {
                "type": "error",
                "message": "Agent not initialized. Please check server configuration.",
            }
            return

        try:
            # Build messages for OpenAI API
            messages = conversation_history.copy()
            messages.append({"role": "user", "content": message})

            # Get tools
            tools = get_tools() if get_tools else []

            # Call OpenAI API with streaming
            response = cls._instance.client.chat.completions.create(
                model=cls._instance.model,
                messages=messages,
                tools=tools if tools else None,
                stream=True,
                temperature=0.7,
            )

            # Stream the response
            current_tool_call = None
            accumulated_content = ""

            for chunk in response:
                if not chunk.choices:
                    continue

                delta = chunk.choices[0].delta

                # Handle content tokens
                if delta.content:
                    accumulated_content += delta.content
                    yield {"type": "token", "content": delta.content}

                # Handle tool calls
                if delta.tool_calls:
                    for tool_call in delta.tool_calls:
                        if tool_call.function:
                            if current_tool_call is None:
                                current_tool_call = {
                                    "id": tool_call.id,
                                    "name": tool_call.function.name or "",
                                    "arguments": tool_call.function.arguments or "",
                                }
                            else:
                                if tool_call.function.name:
                                    current_tool_call["name"] += tool_call.function.name
                                if tool_call.function.arguments:
                                    current_tool_call["arguments"] += (
                                        tool_call.function.arguments
                                    )

                # Check if finish reason indicates tool call
                finish_reason = chunk.choices[0].finish_reason
                if finish_reason == "tool_calls" and current_tool_call:
                    yield {
                        "type": "tool_call",
                        "id": current_tool_call["id"],
                        "name": current_tool_call["name"],
                        "arguments": current_tool_call["arguments"],
                    }

                    # Execute tool call
                    try:
                        tool_result = await cls._execute_tool_call(
                            current_tool_call["name"],
                            current_tool_call["arguments"],
                        )
                        yield {
                            "type": "tool_result",
                            "name": current_tool_call["name"],
                            "result": tool_result,
                        }
                    except Exception as e:
                        yield {
                            "type": "tool_result",
                            "name": current_tool_call["name"],
                            "result": f"Error: {str(e)}",
                        }

                    current_tool_call = None

        except Exception as e:
            yield {"type": "error", "message": f"Error during chat: {str(e)}"}

    @classmethod
    async def _execute_tool_call(cls, tool_name: str, arguments_json: str) -> str:
        """
        Execute a tool call.

        Args:
            tool_name: Name of the tool to execute
            arguments_json: JSON string of arguments

        Returns:
            Tool execution result as string
        """
        try:
            arguments = json.loads(arguments_json)

            # Import tool execution function from hermes
            if HERMES_AVAILABLE:
                from model_tools import handle_function_call

                result = handle_function_call(tool_name, arguments)
                return str(result)
            else:
                return f"Tool execution not available: {tool_name}"

        except Exception as e:
            return f"Error executing tool: {str(e)}"

    @classmethod
    def get_available_tools(cls) -> List[Dict[str, Any]]:
        """
        Get list of available tools.

        Returns:
            List of tool definitions
        """
        if HERMES_AVAILABLE and get_tools:
            try:
                return get_tools()
            except Exception as e:
                print(f"Error getting tools: {e}")
                return []
        return []
