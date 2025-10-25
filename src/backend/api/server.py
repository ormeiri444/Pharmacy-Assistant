"""
Realtime API Server for Pharmacy Assistant
WebRTC-based voice assistant using OpenAI Realtime API
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.realtime_service import create_realtime_session
from dotenv import load_dotenv

load_dotenv()

# Get the absolute path to the project root
project_root = Path(__file__).parent.parent.parent.parent
frontend_path = project_root / 'src' / 'frontend'

# Set the static folder to the frontend directory
app = Flask(__name__, static_folder=str(frontend_path / 'public'), static_url_path='')
CORS(app)


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


@app.route('/')
def serve_index():
    """Serve the Realtime interface"""
    return send_from_directory(app.static_folder, 'unified-realtime.html')


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
        "name": "Pharmacy Assistant Realtime API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "/session": "POST - Create WebRTC session with OpenAI Realtime API",
            "/execute-function": "POST - Execute pharmacy functions",
            "/health": "GET - Health check"
        }
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("Starting Pharmacy Assistant Realtime Server...")
    print("Server running on http://localhost:8080")
    print("Realtime Interface: http://localhost:8080/")
    app.run(debug=True, port=8080, host='0.0.0.0')