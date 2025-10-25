# Testing Guide - Realtime API Integration

## ✅ What Was Fixed

1. **OpenAI Realtime API Format** - Updated to use correct JSON payload format
2. **Manual Voice Button** - Added toggle button for voice conversation (not always-on)
3. **Hybrid Mode** - Text input works with regular Chat API, voice uses Realtime API

## 🚀 Quick Test

### Test 1: Text Input (No Voice)

1. Open: http://localhost:8080/unified-realtime.html
2. Type in text box: "יש לכם נורופן?"
3. Click "שלח"
4. ✅ Should see response from Chat API

### Test 2: Voice Conversation

1. Open: http://localhost:8080/unified-realtime.html
2. Click microphone button 🎤
3. Grant microphone permission
4. Wait for "✅ שיחה קולית מחוברת!"
5. Speak: "יש לכם נורופן?"
6. ✅ Should hear natural AI response

### Test 3: Stop Voice

1. While voice is active (red microphone)
2. Click microphone button again
3. ✅ Should stop voice and show "🔴 שיחה קולית הופסקה"

### Test 4: Switch Modes

1. Start with text input - ask a question
2. Click microphone - start voice
3. Ask voice question
4. Click microphone - stop voice
5. Use text input again
6. ✅ Both should work independently

## ⚠️ Important Note About Realtime API

The OpenAI Realtime API is currently in **beta** and has specific requirements:

### API Access
- Requires **Realtime API access** on your OpenAI account
- May need to join waitlist: https://openai.com/waitlist/realtime-api
- Check your API dashboard: https://platform.openai.com/settings

### If You Don't Have Realtime API Access Yet:

**Option 1: Use Text Only**
- The text input will work fine with regular Chat API
- Just don't click the voice button

**Option 2: Use Original Version**
- Go to: http://localhost:8080/unified.html
- Uses browser TTS/STT (no API access needed)
- All features work

## 🔍 Troubleshooting

### Error: "Session creation failed"

**Check Terminal Output:**

```bash
# Look for this error:
[Realtime Service] Error: OpenAI API error: 404
```

**Solution:**
- Your API key doesn't have Realtime API access yet
- Use text input only, or use original version

### Error: "Failed to start voice"

**Possible Causes:**
1. No microphone permission
2. API access issue
3. Network problem

**Solution:**
1. Check browser permissions
2. Check terminal logs
3. Try text input to verify server works

### Voice Button Does Nothing

**Check:**
1. Browser console (F12) for errors
2. Terminal for backend errors
3. Make sure server is running

## 📋 What Works Now

### ✅ Working Features

1. **Text Input** - Always works (uses Chat API)
2. **Voice Button** - Manual start/stop
3. **Hybrid Mode** - Switch between text and voice
4. **Developer Mode** - Shows function calls
5. **Function Calling** - All pharmacy tools work
6. **Hebrew Support** - Both text and voice

### 🎯 User Flow

```
User opens page
    ↓
Can type text immediately ✅
    OR
Click 🎤 to start voice
    ↓
Grant microphone permission
    ↓
Speak naturally
    ↓
Click 🎤 to stop voice
    ↓
Can type text again
```

## 🎨 UI States

### Microphone Button States

1. **Ready (Blue)** 🎤
   - Click to start voice
   - Text: "לחץ להתחלת שיחה קולית"

2. **Connecting (Spinning)** ⏳
   - Connecting to Realtime API
   - Status: "מתחבר..."

3. **Active (Green)** 🔴
   - Voice conversation active
   - Click to stop
   - Text: "לחץ לעצירת שיחה קולית"

## 🧪 Advanced Testing

### Test Function Calling

1. Enable developer mode (⚙️ button)
2. Ask: "תן לי מידע על נורופן 400"
3. ✅ Should see function call box with:
   - Function: `get_medication_by_name`
   - Input: `{"name": "נורופן", "strength_mg": 400}`
   - Output: Full medication info

### Test Multiple Functions

1. Ask: "יש תחליף לאופטלגין?"
2. ✅ Should see multiple function calls:
   - `get_medication_by_name` (for אופטלגין)
   - `get_alternative_medications`

### Test Audio Mute

1. Start voice conversation
2. While AI is speaking, click 🔊
3. ✅ Should mute output
4. Click again to unmute

## 📊 Expected Behavior

| Action | Text Mode | Voice Mode |
|--------|-----------|------------|
| Type message | ✅ Uses Chat API | ✅ Uses Realtime API |
| Speak | ❌ Not active | ✅ VAD detects speech |
| Response | ❌ No audio | ✅ Natural speech |
| Latency | ~2-3 seconds | ~500ms |
| Function calls | ✅ Works | ✅ Works |

## 🎉 Success Indicators

If everything works, you should see:

1. ✅ Text input works immediately
2. ✅ Microphone button clickable
3. ✅ Can start/stop voice conversation
4. ✅ Real-time speech transcription
5. ✅ Natural AI voice response
6. ✅ Function calls execute
7. ✅ Developer mode shows details
8. ✅ Can switch between modes

## 🔄 Comparison

### This Version (unified-realtime.html)
- Text: Regular Chat API
- Voice: Realtime API (when button clicked)
- **Hybrid approach** - best of both worlds

### Original Version (unified.html)
- Text: Regular Chat API
- Voice: Browser TTS/STT
- **Simpler** - no API access needed

## 💡 Pro Tips

1. **Start with text** to verify server works
2. **Then try voice** if you have API access
3. **Use developer mode** to understand what's happening
4. **Check terminal logs** for debugging
5. **Compare with original version** to see differences

## 📞 Next Steps

If everything works:
- ✅ You have a working hybrid implementation!
- ✅ Users can choose text or voice
- ✅ Lower latency when using voice
- ✅ Fallback to text if no Realtime API access

If voice doesn't work:
- ✅ Text still works fine
- ✅ Use original version for browser-based voice
- ✅ Request Realtime API access from OpenAI

---

**Ready to test! Try it out: http://localhost:8080/unified-realtime.html**
