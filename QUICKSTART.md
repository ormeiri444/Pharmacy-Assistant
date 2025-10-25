# 🚀 Quick Start Guide - Realtime Voice Assistant

Get your pharmacy voice assistant running in 5 minutes!

## Prerequisites

- Python 3.8+
- OpenAI API Key with Realtime API access
- Modern browser with microphone

## Installation

```bash
# 1. Clone and navigate
git clone <repository-url>
cd pharmacy-assistant-realtime

# 2. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Mac/Linux
# or .venv\Scripts\activate on Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-your-key-here
```

## Run

```bash
python3 run.py
```

Open browser at: **http://localhost:8080/**

## Usage

1. Click the microphone button 🎤
2. Grant microphone permission
3. Start speaking naturally!

### Try These Questions:

- "יש לכם נורופן?" (Do you have Nurofen?)
- "מה זה אקמול?" (What is Acamol?)
- "האם ונטולין דורש מרשם?" (Does Ventolin require prescription?)

## Features

- ⚡ **Ultra-low latency** (200-500ms)
- 🎤 **Always listening** - no button clicks needed
- 🗣️ **Natural AI voice** - not robotic TTS
- 📝 **Real-time transcription** - see what's being said
- 🔧 **Function calling** - medication info, stock, alternatives

## Troubleshooting

### No audio?
- Check microphone permission
- Unmute the 🔊 button
- Check system audio settings

### Session failed?
- Verify OpenAI API key in `.env`
- Ensure you have Realtime API access
- Check backend logs for errors

### Functions not working?
- Enable developer mode (⚙️ button)
- Check backend terminal for errors
- Verify pharmacy_service.py exists

## Next Steps

- Read [README.md](README.md) for full documentation
- Customize system prompt in `src/backend/config/prompts/system-prompt.txt`
- Add more medications in `src/backend/services/pharmacy_service.py`

---

**Need help?** Check the full README or backend logs for detailed error messages.
