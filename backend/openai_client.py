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
        # Get the directory of this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, '..', 'prompts', 'system-prompt.txt')
        with open(prompt_path, 'r', encoding='utf-8') as f:
            _system_prompt = f.read()
    return _system_prompt


def load_function_definitions():
    """Load function definitions from file"""
    global _functions
    if _functions is None:
        # Get the directory of this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        functions_path = os.path.join(current_dir, '..', 'prompts', 'function-definitions.json')
        with open(functions_path, 'r', encoding='utf-8') as f:
            _functions = json.load(f)
    return _functions


def chat_completion(messages):
    """
    Send chat completion request to OpenAI
    Returns: dict with response and optional function call info
    """
    client = get_client()
    system_prompt = load_system_prompt()
    function_definitions = load_function_definitions()
    
    # Convert function definitions to tools format
    tools = [
        {
            "type": "function",
            "function": func
        }
        for func in function_definitions
    ]
    
    # Add system prompt if not present
    if not messages or messages[0].get('role') != 'system':
        messages.insert(0, {"role": "system", "content": system_prompt})
    
    # Call OpenAI API with tools
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )
    
    message = response.choices[0].message
    
    # Check if tool calls are needed
    if message.tool_calls:
        # Process all tool calls
        tool_call_results = []
        
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            
            # Execute function
            function_result = execute_function(function_name, function_args)
            
            tool_call_results.append({
                "name": function_name,
                "arguments": function_args,
                "result": function_result
            })
            
            # Add tool call result to messages
            messages.append({
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": function_name,
                            "arguments": tool_call.function.arguments
                        }
                    }
                ]
            })
            
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(function_result, ensure_ascii=False)
            })
        
        # Get final response
        second_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        
        return {
            "message": second_response.choices[0].message.content,
            "tool_calls": tool_call_results
        }
    
    return {
        "message": message.content,
        "tool_calls": None
    }