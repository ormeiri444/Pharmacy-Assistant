/**
 * Unified Client - combines chat and voice functionality
 * - Input: Text OR Voice (Web Speech API)
 * - Output: Text (always) + Audio (Web Speech Synthesis)
 * - Shows function calls with input/output inline
 */

const API_URL = 'http://localhost:8080';
let conversationHistory = [];
let developerModeEnabled = false;
let audioEnabled = true;
let isRecording = false;
let recognition = null;
let speechSynthesis = window.speechSynthesis;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const clearChatBtn = document.getElementById('clearChat');
const toggleDevModeBtn = document.getElementById('toggleDeveloperMode');
const toggleAudioBtn = document.getElementById('toggleAudio');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const voiceIcon = document.getElementById('voiceIcon');
const voiceStatus = document.getElementById('voiceStatus');
const voiceStatusText = document.getElementById('voiceStatusText');
const developerMode = document.getElementById('developerMode');
const developerContent = document.getElementById('developerContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    chatForm.addEventListener('submit', handleSubmit);
    clearChatBtn.addEventListener('click', clearChat);
    toggleDevModeBtn.addEventListener('click', toggleDeveloperMode);
    toggleAudioBtn.addEventListener('click', toggleAudio);
    voiceInputBtn.addEventListener('click', toggleVoiceInput);
});

/**
 * Initialize Web Speech Recognition API
 */
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'he-IL'; // Hebrew
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            voiceIcon.textContent = '🔴';
            voiceStatus.style.display = 'block';
            voiceStatusText.textContent = 'מקשיב...';
            voiceInputBtn.style.background = '#dc3545';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            voiceStatusText.textContent = `נקלט: "${transcript}"`;

            // Auto-submit after 500ms
            setTimeout(() => {
                if (messageInput.value === transcript) {
                    chatForm.dispatchEvent(new Event('submit'));
                }
            }, 500);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            voiceStatusText.textContent = 'שגיאה בזיהוי דיבור';
            resetVoiceInput();
        };

        recognition.onend = () => {
            resetVoiceInput();
        };
    } else {
        voiceInputBtn.style.display = 'none';
        console.warn('Speech Recognition API not supported');
    }
}

/**
 * Toggle voice input
 * If LLM is speaking, stop the audio and start listening
 */
function toggleVoiceInput() {
    if (!recognition) return;

    // If currently speaking, stop the speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        const indicator = document.getElementById('audioIndicator');
        if (indicator) indicator.remove();
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

/**
 * Reset voice input UI
 */
function resetVoiceInput() {
    isRecording = false;
    voiceIcon.textContent = '🎤';
    voiceInputBtn.style.background = 'transparent';
    setTimeout(() => {
        voiceStatus.style.display = 'none';
    }, 2000);
}

/**
 * Toggle audio output
 */
function toggleAudio() {
    audioEnabled = !audioEnabled;
    toggleAudioBtn.textContent = audioEnabled ? '🔊' : '🔇';
    toggleAudioBtn.style.background = audioEnabled ? '#28a745' : '#dc3545';

    // Stop any ongoing speech
    if (!audioEnabled) {
        speechSynthesis.cancel();
    }
}

/**
 * Speak text using Web Speech Synthesis API
 */
function speakText(text) {
    if (!audioEnabled) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL'; // Hebrew
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Get Hebrew voice if available
    const voices = speechSynthesis.getVoices();
    const hebrewVoice = voices.find(voice => voice.lang.startsWith('he'));
    if (hebrewVoice) {
        utterance.voice = hebrewVoice;
    }

    utterance.onstart = () => {
        // Add visual indicator that audio is playing
        const audioIndicator = document.createElement('div');
        audioIndicator.id = 'audioIndicator';
        audioIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #28a745;
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 12px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        audioIndicator.textContent = '🔊 מדבר...';
        document.body.appendChild(audioIndicator);

        // Update mic button to show it can interrupt
        if (!isRecording) {
            voiceIcon.textContent = '⏸️';
            voiceInputBtn.title = 'לחץ להפסקת הדיבור ולהתחלת הקלטה';
        }
    };

    utterance.onend = () => {
        const indicator = document.getElementById('audioIndicator');
        if (indicator) indicator.remove();

        // Reset mic button
        if (!isRecording) {
            voiceIcon.textContent = '🎤';
            voiceInputBtn.title = 'דיבור';
        }
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        const indicator = document.getElementById('audioIndicator');
        if (indicator) indicator.remove();

        // Reset mic button
        if (!isRecording) {
            voiceIcon.textContent = '🎤';
            voiceInputBtn.title = 'דיבור';
        }
    };

    speechSynthesis.speak(utterance);
}

/**
 * Handle form submission
 */
async function handleSubmit(e) {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    messageInput.value = '';

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Show typing indicator
    showTyping(true);
    sendButton.disabled = true;

    try {
        // Send to backend (same as chat)
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: conversationHistory
            })
        });

        const data = await response.json();

        if (data.success) {
            // Show tool calls in chat (inline - always visible)
            if (data.tool_calls && data.tool_calls.length > 0) {
                data.tool_calls.forEach(toolCall => {
                    showToolCallInChat(toolCall);
                });
            }

            // Add bot response to UI (text)
            addMessage(data.message, 'bot');

            // Speak the response (audio)
            speakText(data.message);

            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.message
            });

            // Show tool calls in developer mode (detailed view)
            if (data.tool_calls && developerModeEnabled) {
                data.tool_calls.forEach(toolCall => {
                    showToolCallInDeveloperMode(toolCall);
                });
            }
        } else {
            const errorMsg = 'מצטער, אירעה שגיאה. אנא נסה שוב.';
            addMessage(errorMsg, 'bot');
            speakText(errorMsg);
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = 'מצטער, לא הצלחתי להתחבר לשרת. אנא ודא שהשרת פועל.';
        addMessage(errorMsg, 'bot');
        speakText(errorMsg);
    } finally {
        showTyping(false);
        sendButton.disabled = false;
        messageInput.focus();
    }
}

/**
 * Add message to chat
 */
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convert markdown-like formatting
    const formattedText = formatMessage(text);
    contentDiv.innerHTML = formattedText;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Format message text (simple markdown)
 */
function formatMessage(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert line breaks
    text = text.replace(/\n/g, '<br>');

    // Convert bullet points
    text = text.replace(/^[•\-\*]\s/gm, '<li>');
    if (text.includes('<li>')) {
        text = '<ul>' + text + '</ul>';
    }

    return text;
}

/**
 * Show/hide typing indicator
 */
function showTyping(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
}

/**
 * Clear chat
 */
function clearChat() {
    if (confirm('האם אתה בטוח שברצונך לנקות את השיחה?')) {
        conversationHistory = [];
        chatMessages.innerHTML = '';

        // Stop any ongoing speech
        speechSynthesis.cancel();

        // Add welcome message
        const welcomeMsg = 'שלום! אני עוזר רוקח AI. במה אוכל לעזור לך?';
        addMessage(welcomeMsg, 'bot');

        if (developerModeEnabled) {
            developerContent.innerHTML = '';
        }
    }
}

/**
 * Toggle developer mode
 */
function toggleDeveloperMode() {
    developerModeEnabled = !developerModeEnabled;
    developerMode.style.display = developerModeEnabled ? 'block' : 'none';
    toggleDevModeBtn.style.background = developerModeEnabled ? '#ffc107' : 'transparent';
}

/**
 * Show tool call in developer mode (detailed view)
 */
function showToolCallInDeveloperMode(toolCall) {
    const callDiv = document.createElement('div');
    callDiv.style.marginBottom = '20px';
    callDiv.style.padding = '15px';
    callDiv.style.backgroundColor = '#1e1e1e';
    callDiv.style.borderRadius = '8px';
    callDiv.style.border = '1px solid #50fa7b';

    const callInfo = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #50fa7b; font-size: 14px;">🔧 TOOL CALL:</strong>
            <span style="color: #8be9fd; font-weight: bold;">${toolCall.name}</span>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #f1fa8c;">Parameters:</strong>
            <pre style="background: #282a36; padding: 10px; border-radius: 4px; margin-top: 5px; overflow-x: auto;">${JSON.stringify(toolCall.arguments, null, 2)}</pre>
        </div>
        <div>
            <strong style="color: #50fa7b;">✅ TOOL RESPONSE:</strong>
            <pre style="background: #282a36; padding: 10px; border-radius: 4px; margin-top: 5px; overflow-x: auto;">${JSON.stringify(toolCall.result, null, 2)}</pre>
        </div>
    `;

    callDiv.innerHTML = callInfo;
    developerContent.appendChild(callDiv);

    // Scroll developer content to bottom
    developerContent.scrollTop = developerContent.scrollHeight;
}

/**
 * Show tool call in main chat area (always visible - inline display)
 */
function showToolCallInChat(toolCall) {
    const callDiv = document.createElement('div');
    callDiv.className = 'message tool-call-message';
    callDiv.style.backgroundColor = '#f8f9fa';
    callDiv.style.border = '1px solid #dee2e6';
    callDiv.style.borderRadius = '12px';
    callDiv.style.padding = '15px';
    callDiv.style.margin = '10px 0';

    const callHeader = document.createElement('div');
    callHeader.style.fontWeight = 'bold';
    callHeader.style.color = '#6c757d';
    callHeader.style.marginBottom = '10px';
    callHeader.style.fontSize = '14px';
    callHeader.innerHTML = `🔧 קריאה לפונקציה: <span style="color: #0066cc;">${toolCall.name}</span>`;

    const inputSection = document.createElement('div');
    inputSection.style.marginBottom = '10px';

    const inputLabel = document.createElement('div');
    inputLabel.style.fontWeight = 'bold';
    inputLabel.style.color = '#495057';
    inputLabel.style.marginBottom = '5px';
    inputLabel.style.fontSize = '13px';
    inputLabel.textContent = 'קלט (Input):';

    const inputContent = document.createElement('pre');
    inputContent.style.backgroundColor = '#ffffff';
    inputContent.style.border = '1px solid #e9ecef';
    inputContent.style.borderRadius = '6px';
    inputContent.style.padding = '10px';
    inputContent.style.margin = '0';
    inputContent.style.fontSize = '12px';
    inputContent.style.overflow = 'auto';
    inputContent.style.direction = 'ltr';
    inputContent.style.textAlign = 'left';
    inputContent.style.fontFamily = 'monospace';
    inputContent.textContent = JSON.stringify(toolCall.arguments, null, 2);

    inputSection.appendChild(inputLabel);
    inputSection.appendChild(inputContent);

    const outputSection = document.createElement('div');

    const outputLabel = document.createElement('div');
    outputLabel.style.fontWeight = 'bold';
    outputLabel.style.color = '#28a745';
    outputLabel.style.marginBottom = '5px';
    outputLabel.style.fontSize = '13px';
    outputLabel.textContent = '✅ פלט (Output):';

    const outputContent = document.createElement('pre');
    outputContent.style.backgroundColor = '#ffffff';
    outputContent.style.border = '1px solid #e9ecef';
    outputContent.style.borderRadius = '6px';
    outputContent.style.padding = '10px';
    outputContent.style.margin = '0';
    outputContent.style.fontSize = '12px';
    outputContent.style.overflow = 'auto';
    outputContent.style.direction = 'ltr';
    outputContent.style.textAlign = 'left';
    outputContent.style.fontFamily = 'monospace';
    outputContent.textContent = JSON.stringify(toolCall.result, null, 2);

    outputSection.appendChild(outputLabel);
    outputSection.appendChild(outputContent);

    callDiv.appendChild(callHeader);
    callDiv.appendChild(inputSection);
    callDiv.appendChild(outputSection);

    chatMessages.appendChild(callDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load voices when they become available
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
    };
}
