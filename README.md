# 🏥 Pharmacy Assistant AI - Realtime Voice Interface

Real-time voice assistant for pharmacy using OpenAI's Realtime API with WebRTC for ultra-low latency interactions.

## 🎯 Overview

This is a streamlined voice-first pharmacy assistant that uses OpenAI's Realtime API for natural, low-latency voice conversations. The system provides factual medication information through an always-listening voice interface.

### Key Features ⭐

- **⚡ Ultra-Low Latency**: 200-500ms response time via WebRTC
- **🎤 Always Listening**: Server-side Voice Activity Detection (VAD)
- **🗣️ Natural Speech**: Direct AI audio streaming, no robotic TTS
- **📝 Real-time Transcription**: See what you and the AI are saying
- **🔧 Function Calling**: All pharmacy tools work seamlessly
- **🎨 Developer Mode**: Debug function calls and see technical details

### What the System Can Do ✅

- Provide factual medication information
- Explain dosage and usage instructions
- Verify prescription requirements
- Check stock availability
- Identify active ingredients
- Suggest available alternatives

### What the System Does NOT Do ❌

- Does not provide medical advice
- Does not encourage purchases
- Does not perform diagnosis
- Does not recommend medical treatment

## 🏗️ Architecture

```
pharmacy-assistant-realtime/
├── src/
│   ├── backend/                      # Python Backend
│   │   ├── api/
│   │   │   └── server.py             # Flask server with Realtime endpoints
│   │   ├── services/
│   │   │   ├── realtime_service.py   # WebRTC session management
│   │   │   └── pharmacy_service.py   # Medication database & functions
│   │   └── config/
│   │       └── prompts/              # AI prompts & function definitions
│   │           ├── system-prompt.txt
│   │           └── function-definitions.json
│   └── frontend/                     # Frontend
│       ├── public/
│       │   └── unified-realtime.html # Main voice interface
│       └── assets/
│           ├── js/
│           │   ├── rtc-manager.js           # WebRTC connection handler
│           │   ├── event-handler.js         # Realtime API event processor
│           │   └── unified-realtime-client.js # Client logic
│           └── css/
│               └── styles.css        # Styles (RTL-aware)
├── run.py                            # Application launcher
├── requirements.txt                  # Python dependencies
└── README.md                         # This file
```

## 📦 Installation

### Prerequisites

- Python 3.8+
- OpenAI API Key with Realtime API access
- Modern browser (Chrome, Firefox, Safari, Edge) with WebRTC support

### Installation Steps

1. **Clone the project:**
```bash
git clone <repository-url>
cd pharmacy-assistant-realtime
```

2. **Create virtual environment:**
```bash
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
```
Edit `.env` and add your API key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

## 🚀 Running the Application

### Quick Start

Simply run the launch script:

```bash
python3 run.py
```

The server will start and be available at:
- **Realtime Interface**: http://localhost:8080/

### Manual Start (Optional)

```bash
cd src/backend
python3 -m api.server
```

### Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

## 💡 Usage

### Voice Interface

1. Open browser at: http://localhost:8080/
2. Click the microphone button 🎤
3. Grant microphone permission when prompted
4. Start speaking naturally - the AI is always listening!
5. The AI will respond with both text and voice

### Control Buttons

- **🎤 Microphone**: Start/stop voice conversation
- **⚙️ Developer Mode**: Show function calls and technical details
- **🔊/🔇 Audio**: Mute/unmute AI voice output
- **🗑️ Clear**: Clear conversation and restart

### Example Questions

#### Medication Information
```
"מה זה נורופן?"
"ספר לי על אקמול"
```

#### Stock Check
```
"יש לכם נורופן במלאי?"
"נורופן 400 זמין?"
```

#### Search by Ingredient
```
"אילו תרופות יש עם איבופרופן?"
"מה יש עם פרצטמול?"
```

#### Prescription Requirements
```
"האם ונטולין דורש מרשם?"
"נורופן צריך מרשם?"
```

#### Find Alternatives
```
"מה התחליף לאופטלגין?"
"יש תחליף לנורופן?"
```

## 🔧 API Endpoints

### POST /session
Create WebRTC session with OpenAI Realtime API

**Request:**
```
Content-Type: application/sdp
Body: <SDP offer from client>
```

**Response:**
```
Content-Type: application/sdp
Body: <SDP answer from OpenAI>
```

### POST /execute-function
Execute a pharmacy function

**Request:**
```json
{
  "function_name": "get_medication_by_name",
  "arguments": {
    "name": "נורופן"
  }
}
```

**Response:**
```json
{
  "success": true,
  "medication": {
    "name_he": "נורופן",
    "active_ingredient": "איבופרופן",
    ...
  }
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

## 🧪 How It Works

### 1. WebRTC Connection
- Client creates peer connection
- Sends SDP offer to backend
- Backend forwards to OpenAI Realtime API
- OpenAI returns SDP answer
- Direct audio streaming established

### 2. Voice Activity Detection (VAD)
- Server-side detection (threshold: 0.7)
- Automatically detects when user speaks
- No button clicking required during conversation

### 3. Real-time Transcription
- Speech-to-text as you speak
- Both user and AI speech transcribed
- Displayed in real-time in the interface

### 4. Function Calling
- AI detects need for medication information
- Frontend calls `/execute-function` endpoint
- Backend executes pharmacy function
- Result sent back to AI via WebRTC
- AI continues conversation with the information

## 💰 Cost Estimate

**Realtime API Pricing:**
- Audio input: $0.06/min
- Audio output: $0.24/min
- ~$0.30 per minute of conversation

**Example:**
- 100 conversations/day
- 2 minutes average
- = $60/day = $1,800/month

**Optimization Tips:**
- Set max conversation length
- Implement session timeouts
- Monitor usage patterns

## ⚠️ Important Warnings

- The system provides **factual information only** and does not replace professional medical advice
- Always consult a licensed pharmacist or doctor for medical advice
- The medication database is mock (demonstration) and does not represent real inventory
- Do not use this system for making medical decisions

## 🐛 Troubleshooting

### "Session creation failed"
**Check:**
1. OpenAI API key in `.env`
2. API key has Realtime API access
3. Backend terminal for error logs

### "No audio"
**Check:**
1. Microphone permission granted
2. 🔊 button not muted
3. System audio not muted
4. Browser console for errors

### "Functions not working"
**Check:**
1. Backend `/execute-function` endpoint running
2. pharmacy_service.py has all functions
3. Developer mode to see function calls

## 📚 Resources

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Documentation](https://webrtc.org/getting-started/overview)

## 📝 License

This project is for demonstration purposes only. Do not use for actual medical advice without professional approval.

---

**Built with ❤️ using Flask, OpenAI Realtime API, and WebRTC**
