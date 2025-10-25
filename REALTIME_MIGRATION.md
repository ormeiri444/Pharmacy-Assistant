# OpenAI Realtime API Migration Guide

## Overview

Your Pharmacy Assistant has been upgraded to support **OpenAI's Realtime API** for ultra-low latency voice interactions. This document explains what changed, how to use it, and the differences between the two versions.

## What Changed?

### Architecture Upgrade

**Before (Chat API):**
```
User speaks → Browser STT → Text → HTTP POST → OpenAI Chat API
                                        ↓
                                   Execute tools
                                        ↓
User hears ← Browser TTS ← Text ← Response
```

**After (Realtime API):**
```
User speaks → WebRTC → OpenAI Realtime API (direct audio stream)
                            ↓
                     Tool needed? → Backend HTTP → Execute function
                            ↓
User hears ← WebRTC ← Audio stream (natural speech, no TTS)
```

### Key Improvements

1. **Ultra-Low Latency**: ~200-500ms response time (vs 2-3 seconds before)
2. **Natural Speech**: Direct audio streaming, no robotic TTS
3. **Always Listening**: Server-side Voice Activity Detection (VAD)
4. **Real-time Transcription**: See what you and the AI are saying in real-time
5. **Same Interface**: Your existing UI remains unchanged!

## New Files Created

### Frontend
- `src/frontend/assets/js/rtc-manager.js` - WebRTC connection handler
- `src/frontend/assets/js/event-handler.js` - Realtime API event processor
- `src/frontend/assets/js/unified-realtime-client.js` - New client logic
- `src/frontend/public/unified-realtime.html` - New HTML page for Realtime

### Backend
- `src/backend/services/realtime_service.py` - WebRTC session creation
- Updated `src/backend/api/server.py` - Added `/session` and `/execute-tool` endpoints

## How to Use

### 1. Install Dependencies

```bash
# Install updated Python packages
pip install -r requirements.txt
```

### 2. Start the Server

```bash
# Same as before
python3 run.py
```

### 3. Access the Interfaces

You now have **TWO versions**:

- **Original (Chat API)**: http://localhost:8080/unified.html
- **New (Realtime API)**: http://localhost:8080/unified-realtime.html

## Testing the Realtime API

### Step 1: Open the Realtime Interface

Navigate to: http://localhost:8080/unified-realtime.html

### Step 2: Grant Microphone Permission

Your browser will ask for microphone access - click "Allow"

### Step 3: Wait for Connection

You'll see: "מתחבר לשרת..." then "שלום! אני עוזר רוקח AI..."

### Step 4: Start Talking!

Just speak naturally - the AI is always listening. No need to click any button!

### Step 5: Try Text Input

You can also type messages in the text box and click "שלח"

### Step 6: Enable Developer Mode

Click the ⚙️ button to see:
- Function calls in real-time
- Function arguments and results
- Debug information

## API Endpoints

### New Endpoints

#### `POST /session`
Creates a WebRTC session with OpenAI Realtime API

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

#### `POST /execute-tool`
Executes a pharmacy function/tool

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
  "result": {
    "name_he": "נורופן",
    "active_ingredient": "איבופרופן",
    ...
  }
}
```

## Configuration

### Realtime API Settings

Located in `src/backend/services/realtime_service.py`:

```python
session_config = {
    "model": "gpt-4o-realtime-preview-2024-12-17",
    "voice": "alloy",  # Hebrew-compatible voice
    "turn_detection": {
        "type": "server_vad",
        "threshold": 0.5,
        "silence_duration_ms": 500
    }
}
```

**Adjustable Parameters:**
- `threshold`: Sensitivity for detecting speech (0.0-1.0)
- `silence_duration_ms`: How long to wait before considering speech ended
- `voice`: Options: alloy, echo, fable, onyx, nova, shimmer

## Troubleshooting

### Issue: "Failed to initialize WebRTC"

**Solution:**
1. Check that your OpenAI API key supports Realtime API
2. Ensure you're using HTTPS or localhost (WebRTC requirement)
3. Grant microphone permissions

### Issue: "No audio output"

**Solution:**
1. Check browser audio settings
2. Click the 🔊 button to unmute
3. Verify your speakers/headphones are working

### Issue: "Session creation failed"

**Solution:**
1. Check backend logs for errors
2. Verify OpenAI API key is set in `.env`
3. Check that you have Realtime API access (may require waitlist approval)

### Issue: "Function calls not working"

**Solution:**
1. Enable developer mode (⚙️ button) to see function calls
2. Check backend logs for execution errors
3. Verify pharmacy_service.py has all required functions

## Comparison: Chat API vs Realtime API

| Feature | Chat API | Realtime API |
|---------|----------|--------------|
| **Latency** | 2-3 seconds | 200-500ms |
| **Voice Quality** | Browser TTS (robotic) | Natural AI speech |
| **Connection** | HTTP REST | WebRTC P2P |
| **Voice Input** | Manual button click | Always listening (VAD) |
| **Transcription** | One-time | Real-time streaming |
| **Interruption** | Not possible | Can interrupt AI |
| **Function Calling** | ✅ Yes | ✅ Yes |
| **Developer Mode** | ✅ Yes | ✅ Yes |
| **Browser Support** | All modern browsers | Chrome, Edge, Safari |
| **Complexity** | Simple | Moderate |

## Cost Considerations

**Realtime API Pricing (as of Dec 2024):**
- Audio input: $0.06 per minute
- Audio output: $0.24 per minute
- Text input: $5.00 per 1M tokens
- Text output: $20.00 per 1M tokens

**Chat API Pricing (GPT-4o):**
- Input: $2.50 per 1M tokens
- Output: $10.00 per 1M tokens

**Recommendation:**
- Use Realtime API for production voice interactions (better UX)
- Use Chat API for text-only or development/testing

## Next Steps

### Production Readiness

To make this production-ready:

1. **Add Redis** for conversation persistence:
   ```python
   # Store conversation history
   redis_client.hset(f"conversation:{session_id}", "messages", json.dumps(messages))
   ```

2. **Add Analytics Dashboard** to track:
   - Session duration
   - Function call frequency
   - User satisfaction
   - Error rates

3. **Implement Session Management**:
   - User authentication
   - Session expiration
   - Conversation history

4. **Add Security Layers**:
   - Rate limiting
   - Input validation
   - Prompt injection prevention

5. **Deploy with HTTPS** (required for WebRTC in production)

## Resources

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Documentation](https://webrtc.org/getting-started/overview)
- [Dr. Max Reference Implementation](https://github.com/ofirsteinherz/realtime-voice-agent)

## Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Check backend terminal for logs
3. Verify all files were created correctly
4. Test with the original Chat API version first

---

**Built with ❤️ using Flask, OpenAI Realtime API, and WebRTC**
