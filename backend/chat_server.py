"""
Simple Flask server for pharmacy assistant chat
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai_client import chat_completion, get_client
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        messages = data.get('messages', [])
        
        # Get response from OpenAI
        result = chat_completion(messages)
        
        return jsonify({
            "success": True,
            "message": result['message'],
            "tool_calls": result.get('tool_calls')
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/realtime/token', methods=['POST'])
def get_realtime_token():
    """Get ephemeral token for OpenAI Realtime API"""
    try:
        # For the Realtime API, we need to return the API key itself
        # as an ephemeral token. In production, you would create a
        # short-lived token, but for development we use the API key directly.
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        return jsonify({
            "token": api_key
        })
        
    except Exception as e:
        print(f"Error getting realtime token: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information"""
    return jsonify({
        "name": "Pharmacy Assistant Chat API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/chat": "POST - Send chat messages",
            "/realtime/token": "POST - Get ephemeral token for Realtime API",
            "/health": "GET - Health check"
        },
        "frontend": "Navigate to http://localhost:8080/index.html to use the chat interface"
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("Starting Pharmacy Assistant Chat Server...")
    print("Server running on http://localhost:5001")
    app.run(debug=True, port=5001)