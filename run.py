#!/usr/bin/env python3
"""
Pharmacy Assistant Application Launcher
"""
import sys
import os
from pathlib import Path

# Add src/backend to Python path
backend_path = Path(__file__).parent / 'src' / 'backend'
sys.path.insert(0, str(backend_path))

# Import and run the server
from api.server import app

if __name__ == '__main__':
    print("=" * 60)
    print("🏥 Pharmacy Assistant Chat Server")
    print("=" * 60)
    print()
    print("Server running on: http://localhost:8080")
    print("Main Interface:    http://localhost:8080/unified.html")
    print("Landing Page:      http://localhost:8080/")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()

    app.run(debug=True, port=8080, host='0.0.0.0')
