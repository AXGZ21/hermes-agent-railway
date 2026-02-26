import json
from typing import Dict, Any
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from .services.auth_service import get_current_user_ws
from .services.agent_service import AgentService
from .services.session_service import (
    add_message,
    get_messages,
    create_session,
    auto_generate_title,
)


async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat streaming.

    Protocol:
    - Client connects with ?token=<jwt_token>
    - Client sends: {"message": "...", "session_id": "..."}
    - Server streams:
        - {"type": "token", "content": "..."}
        - {"type": "tool_call", "id": "...", "name": "...", "arguments": "..."}
        - {"type": "tool_result", "name": "...", "result": "..."}
        - {"type": "done", "session_id": "..."}
        - {"type": "error", "message": "..."}
    """
    await websocket.accept()

    try:
        # Authenticate via token query parameter
        token = websocket.query_params.get("token")
        if not token:
            await websocket.send_json(
                {"type": "error", "message": "Authentication required"}
            )
            await websocket.close(code=1008)
            return

        try:
            user = await get_current_user_ws(token)
        except HTTPException:
            await websocket.send_json(
                {"type": "error", "message": "Invalid or expired token"}
            )
            await websocket.close(code=1008)
            return

        # Main message loop
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message_data = json.loads(data)

                user_message = message_data.get("message")
                session_id = message_data.get("session_id")

                if not user_message:
                    await websocket.send_json(
                        {"type": "error", "message": "Message is required"}
                    )
                    continue

                # Create new session if not provided
                if not session_id:
                    session_response = create_session()
                    session_id = session_response.id
                    await websocket.send_json(
                        {"type": "session_created", "session_id": session_id}
                    )

                # Add user message to session
                add_message(session_id, "user", user_message)

                # Auto-generate title if this is the first message
                auto_generate_title(session_id)

                # Get conversation history
                messages = get_messages(session_id)
                conversation_history = [
                    {"role": msg.role, "content": msg.content} for msg in messages
                ]

                # Stream response from agent
                assistant_message = ""
                tool_calls_data = []

                async for chunk in AgentService.stream_chat(
                    user_message, session_id, conversation_history
                ):
                    chunk_type = chunk.get("type")

                    if chunk_type == "token":
                        # Stream token to client
                        assistant_message += chunk["content"]
                        await websocket.send_json(chunk)

                    elif chunk_type == "tool_call":
                        # Stream tool call to client
                        tool_calls_data.append(
                            {
                                "id": chunk.get("id"),
                                "name": chunk["name"],
                                "arguments": chunk["arguments"],
                            }
                        )
                        await websocket.send_json(chunk)

                    elif chunk_type == "tool_result":
                        # Stream tool result to client
                        await websocket.send_json(chunk)

                    elif chunk_type == "error":
                        # Stream error to client
                        await websocket.send_json(chunk)
                        break

                # Save assistant message to session
                if assistant_message or tool_calls_data:
                    add_message(
                        session_id,
                        "assistant",
                        assistant_message,
                        tool_calls_data if tool_calls_data else None,
                    )

                # Send done message
                await websocket.send_json({"type": "done", "session_id": session_id})

            except json.JSONDecodeError:
                await websocket.send_json(
                    {"type": "error", "message": "Invalid JSON format"}
                )
            except Exception as e:
                await websocket.send_json(
                    {"type": "error", "message": f"Error processing message: {str(e)}"}
                )

    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.send_json(
                {"type": "error", "message": f"Server error: {str(e)}"}
            )
        except:
            pass
    finally:
        try:
            await websocket.close()
        except:
            pass
