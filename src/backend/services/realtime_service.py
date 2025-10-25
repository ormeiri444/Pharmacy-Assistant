"""
Realtime Service - Handles WebRTC session creation with OpenAI Realtime API
"""
import os
import json
import requests
from pathlib import Path


def load_system_prompt():
    """Load system prompt from file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    prompt_path = os.path.join(current_dir, '..', 'config', 'prompts', 'system-prompt.txt')
    with open(prompt_path, 'r', encoding='utf-8') as f:
        return f.read()


def load_function_definitions():
    """Load function definitions from file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    functions_path = os.path.join(current_dir, '..', 'config', 'prompts', 'function-definitions.json')
    with open(functions_path, 'r', encoding='utf-8') as f:
        functions = json.load(f)

    # Convert to Realtime API format (add "type": "function" wrapper)
    tools = [
        {
            "type": "function",
            "name": func["name"],
            "description": func["description"],
            "parameters": func["parameters"]
        }
        for func in functions
    ]
    return tools


def create_realtime_session(sdp_offer, language='he'):
    """
    Create a WebRTC session with OpenAI Realtime API

    Args:
        sdp_offer: SDP offer from client
        language: Language code (he for Hebrew, en for English)

    Returns:
        SDP answer from OpenAI
    """
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    # Load system prompt and tools
    system_prompt = load_system_prompt()
    tools = load_function_definitions()

    # Create session configuration
    session_config = {
        "model": "gpt-4o-realtime-preview-2024-12-17",
        "modalities": ["text", "audio"],
        "instructions": system_prompt,
        "voice": "alloy",  # Hebrew-compatible voice
        "input_audio_format": "pcm16",
        "output_audio_format": "pcm16",
        "input_audio_transcription": {
            "model": "whisper-1",
            "language": "he"  # Force Hebrew language recognition only
        },
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 1200
        },
        "tools": tools,
        "tool_choice": "auto",
        "temperature": 0.8,
        "max_response_output_tokens": 4096
    }

    # OpenAI Realtime API uses multipart form data with SDP + session config
    url = "https://api.openai.com/v1/realtime"

    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    # Create multipart form data with two parts:
    # 1. SDP offer (application/sdp)
    # 2. Session config (application/json)
    files = {
        'sdp': (None, sdp_offer, 'application/sdp'),
        'session': (None, json.dumps(session_config), 'application/json')
    }

    print("[Realtime Service] Creating session with OpenAI Realtime API...")
    print(f"[Realtime Service] Language: {language}")
    print(f"[Realtime Service] Tools count: {len(tools)}")

    try:
        response = requests.post(
            url,
            headers=headers,
            files=files,
            timeout=30
        )

        # Accept both 200 (OK) and 201 (Created) as success
        if response.status_code not in [200, 201]:
            error_msg = f"OpenAI API error: {response.status_code} - {response.text}"
            print(f"[Realtime Service] Error: {error_msg}")
            raise Exception(error_msg)

        # Response should be the SDP answer
        answer_sdp = response.text
        print(f"[Realtime Service] Successfully created session (status: {response.status_code})")
        print("[Realtime Service] Received SDP answer from OpenAI")
        return answer_sdp

    except requests.exceptions.RequestException as e:
        print(f"[Realtime Service] Request failed: {e}")
        raise Exception(f"Failed to create session: {str(e)}")
