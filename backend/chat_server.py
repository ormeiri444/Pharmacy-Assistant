"""
Simple Flask server for pharmacy assistant chat
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai_client import chat_completion
from dotenv import load_dotenv

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
            "function_call": result.get('function_call')
        })
        
    except Exception as e:
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
            "/health": "GET - Health check"
        },
        "frontend": "Open frontend/index.html in your browser to use the chat interface"
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    print("Starting Pharmacy Assistant Chat Server...")
    print("Server running on http://localhost:5001")
    app.run(debug=True, port=5001)