"""
OpenAI Client - handles communication with OpenAI API
"""
import os
import json
from openai import OpenAI
from mock_pharmacy_api import execute_function

# Global variables
_client = None
_system_prompt = None
_functions = None


def get_client():
    """Get or create OpenAI client"""
    global _client
    if _client is None:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        _client = OpenAI(api_key=api_key)
    return _client


def load_system_prompt():
    """Load system prompt from file"""
    global _system_prompt
    if _system_prompt is None:
        with open('../prompts/system-prompt.txt', 'r', encoding='utf-8') as f:
            _system_prompt = f.read()
    return _system_prompt


def load_function_definitions():
    """Load function definitions from file"""
    global _functions
    if _functions is None:
        with open('../prompts/function-definitions.json', 'r', encoding='utf-8') as f:
            _functions = json.load(f)
    return _functions


def chat_completion(messages):
    """
    Send chat completion request to OpenAI
    Returns: dict with response and optional function call info
    """
    client = get_client()
    system_prompt = load_system_prompt()
    functions = load_function_definitions()
    
    # Add system prompt if not present
    if not messages or messages[0].get('role') != 'system':
        messages.insert(0, {"role": "system", "content": system_prompt})
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        functions=functions,
        function_call="auto"
    )
    
    message = response.choices[0].message
    
    # Check if function call is needed
    if message.function_call:
        function_name = message.function_call.name
        function_args = json.loads(message.function_call.arguments)
        
        # Execute function
        function_result = execute_function(function_name, function_args)
        
        # Add function call and result to messages
        messages.append({
            "role": "assistant",
            "content": None,
            "function_call": {
                "name": function_name,
                "arguments": message.function_call.arguments
            }
        })
        
        messages.append({
            "role": "function",
            "name": function_name,
            "content": json.dumps(function_result, ensure_ascii=False)
        })
        
        # Get final response
        second_response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        
        return {
            "message": second_response.choices[0].message.content,
            "function_call": {
                "name": function_name,
                "arguments": function_args,
                "result": function_result
            }
        }
    
    return {
        "message": message.content,
        "function_call": None
    }