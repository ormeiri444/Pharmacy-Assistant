"""
Simple Flask server for pharmacy assistant chat
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.openai_service import chat_completion, get_client
from services.realtime_service import create_realtime_session
from dotenv import load_dotenv
import json

load_dotenv()

# Get the absolute path to the project root
project_root = Path(__file__).parent.parent.parent.parent
frontend_path = project_root / 'src' / 'frontend'

# Set the static folder to the frontend directory
app = Flask(__name__, static_folder=str(frontend_path / 'public'), static_url_path='')
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


@app.route('/session', methods=['POST'])
def create_session():
    """Create WebRTC session with OpenAI Realtime API"""
    try:
        # Get SDP offer from client
        sdp_offer = request.data.decode('utf-8')

        if not sdp_offer:
            return jsonify({
                "success": False,
                "error": "No SDP offer provided"
            }), 400

        # Create session with OpenAI
        answer_sdp = create_realtime_session(sdp_offer)

        # Return SDP answer
        return answer_sdp, 200, {'Content-Type': 'application/sdp'}

    except Exception as e:
        print(f"Error creating session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/execute-tool', methods=['POST'])
@app.route('/execute-function', methods=['POST'])
def execute_tool():
    """Execute a pharmacy tool function"""
    try:
        data = request.json
        function_name = data.get('function_name')
        arguments = data.get('arguments', {})

        # Import pharmacy service
        from services.pharmacy_service import execute_function

        # Execute the function
        result = execute_function(function_name, arguments)

        return jsonify(result)

    except Exception as e:
        print(f"Error executing tool: {e}")
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


@app.route('/')
def serve_index():
    """Serve the main index.html page"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/assets/<path:path>')
def serve_assets(path):
    """Serve static assets (JS, CSS, etc.)"""
    assets_folder = frontend_path / 'assets'
    return send_from_directory(str(assets_folder), path)


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from frontend public directory"""
    return send_from_directory(app.static_folder, path)


@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        "name": "Pharmacy Assistant Chat API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/chat": "POST - Send chat messages",
            "/realtime/token": "POST - Get ephemeral token for Realtime API",
            "/health": "GET - Health check"
        }
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("Starting Pharmacy Assistant Chat Server...")
    print("Server running on http://localhost:8080")
    print("Frontend available at http://localhost:8080/index.html")
    app.run(debug=True, port=8080, host='0.0.0.0')