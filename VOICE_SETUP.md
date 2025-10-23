# OpenAI Realtime Voice API Setup Guide

## Overview
This guide will help you set up the OpenAI Realtime Voice API for verbal conversations with the pharmacy assistant.

## Prerequisites
1. OpenAI API key with access to the Realtime API
2. Python 3.7+ installed
3. Modern web browser (Chrome, Firefox, Safari, or Edge)
4. Microphone access

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Create a `.env` file in the project root directory:
```bash
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important:** Make sure your OpenAI API key has access to the Realtime API. This is currently in preview and may require special access.

### 3. Start the Backend Server
```bash
cd backend
python3 chat_server.py
```

You should see:
```
Starting Pharmacy Assistant Chat Server...
Server running on http://localhost:5001
```

### 4. Open the Voice Interface
1. Open `frontend/voice.html` in your web browser
2. Click the "התחל שיחה" (Start Conversation) button
3. Allow microphone access when prompted
4. Start speaking in Hebrew!

## How It Works

### Architecture
```
Browser (WebRTC) <---> OpenAI Realtime API
       ↓
Backend Server (Token Generation)
       ↓
Mock Pharmacy API (Function Calls)
```

### Features
- **Real-time voice conversation** in Hebrew
- **Automatic speech recognition** using Whisper
- **Natural voice responses** using OpenAI TTS
- **Function calling** for medication queries
- **Developer mode** to see API calls and responses

### Voice Commands Examples
Try saying (in Hebrew):
- "יש לכם נורופן במלאי?" (Do you have Nurofen in stock?)
- "מה המרכיב הפעיל באקמול?" (What's the active ingredient in Acamol?)
- "תרופות עם איבופרופן" (Medications with ibuprofen)

## Troubleshooting

### "Failed to get session token"
- Check that your `.env` file exists and contains a valid `OPENAI_API_KEY`
- Verify your API key has Realtime API access
- Ensure the backend server is running on port 5001

### "Microphone access denied"
- Check browser permissions for microphone access
- Try refreshing the page and allowing access again
- On macOS: System Preferences → Security & Privacy → Microphone

### "Connection failed"
- Ensure you have a stable internet connection
- Check browser console for detailed error messages
- Verify the backend server is running

### No audio output
- Check your system volume settings
- Verify browser audio permissions
- Try using headphones to avoid feedback

## API Costs
The OpenAI Realtime API charges for:
- Audio input (per minute)
- Audio output (per minute)
- Text tokens (for function calls and responses)

Monitor your usage in the OpenAI dashboard.

## Developer Mode
Click the 🔧 icon to enable developer mode and see:
- Function calls being made
- Arguments passed to functions
- Results returned from the pharmacy API
- Real-time transcriptions

## Security Notes
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Keep your OpenAI API key secure
- Consider implementing rate limiting for production use

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

WebRTC and Web Audio API support required.

## Next Steps
1. Test the voice interface with various queries
2. Customize the system prompt in `prompts/system-prompt.txt`
3. Add more function definitions in `prompts/function-definitions.json`
4. Adjust voice settings (speed, tone) in the session configuration

## Support
For issues with:
- **OpenAI API**: Check [OpenAI Documentation](https://platform.openai.com/docs)
- **Realtime API**: See [Realtime API Guide](https://platform.openai.com/docs/guides/realtime)
- **This project**: Check the console logs and developer mode

## Important Notes
⚠️ **The Realtime API is currently in preview** and may have:
- Limited availability
- API changes
- Different pricing than standard APIs
- Waitlist requirements

Make sure you have access before attempting to use this feature.