/**
 * Unified Realtime Client - WebRTC-based real-time voice assistant
 * Uses OpenAI Realtime API for low-latency voice interactions
 * Keeps the same UI/UX as the original unified interface
 */

// Global state
let rtcManager = null;
let eventHandler = null;
let developerModeEnabled = false;
let isConnected = false;
let voiceEnabled = false;
let audioContext = null;

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

// Current interim message elements
let currentInterimUserMessage = null;
let currentInterimAIMessage = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[UnifiedClient] Initializing Realtime client...');

    // Set up button listeners
    chatForm.addEventListener('submit', handleSubmit);
    clearChatBtn.addEventListener('click', clearChat);
    toggleDevModeBtn.addEventListener('click', toggleDeveloperMode);
    toggleAudioBtn.addEventListener('click', toggleAudio);
    voiceInputBtn.addEventListener('click', toggleVoiceConversation);

    // Prevent page visibility changes from closing connection
    document.addEventListener('visibilitychange', () => {
        console.log('[UnifiedClient] Page visibility changed:', document.hidden);
        // Don't cleanup on visibility change - keep connection alive
    });

    // Prevent beforeunload from triggering cleanup prematurely
    window.addEventListener('beforeunload', (e) => {
        if (voiceEnabled && rtcManager) {
            console.log('[UnifiedClient] Page unloading, cleaning up...');
            rtcManager.cleanup();
        }
    });

    // Show welcome message
    addMessage('שלום! אני עוזר רוקח AI.', 'bot');
    addMessage('לחץ על כפתור המיקרופון 🎤 להתחלת שיחה קולית, או הקלד שאלה בשדה למטה.', 'bot');

    // Enable text input immediately
    sendButton.disabled = false;
    messageInput.disabled = false;

    console.log('[UnifiedClient] Ready. Click microphone to start voice conversation.');
});

/**
 * Toggle voice conversation on/off
 */
async function toggleVoiceConversation() {
    console.log('[UnifiedClient] toggleVoiceConversation called, voiceEnabled:', voiceEnabled);
    
    // Prevent double-clicks
    if (voiceInputBtn.disabled) {
        console.log('[UnifiedClient] Button is disabled, ignoring click');
        return;
    }

    if (!voiceEnabled) {
        // Start voice conversation
        try {
            console.log('[UnifiedClient] Starting voice conversation...');
            voiceInputBtn.disabled = true;
            voiceIcon.textContent = '⏳';
            voiceStatusText.textContent = 'מתחבר...';
            voiceStatus.style.display = 'block';

            await initializeConnection();

            voiceEnabled = true;
            voiceIcon.textContent = '🔴';
            voiceInputBtn.style.background = '#28a745';
            voiceInputBtn.title = 'לחץ לעצירת שיחה קולית';
            voiceInputBtn.disabled = false;

            // Show voice status indicator
            voiceStatus.style.display = 'block';

            addMessage('✅ שיחה קולית מחוברת! המיקרופון מקשיב - דבר בחופשיות', 'bot');
            console.log('[UnifiedClient] Voice conversation started, voiceEnabled:', voiceEnabled);
        } catch (error) {
            console.error('[UnifiedClient] Failed to start voice:', error);
            addMessage('מצטער, לא הצלחתי להתחבר לשיחה קולית. אנא נסה שוב.', 'bot');
            voiceEnabled = false;
            voiceIcon.textContent = '🎤';
            voiceInputBtn.style.background = 'var(--primary-color)';
            voiceStatus.style.display = 'none';
            voiceInputBtn.disabled = false;
        }
    } else {
        // Stop voice conversation
        console.log('[UnifiedClient] Stopping voice conversation...');
        voiceInputBtn.disabled = true;
        
        if (rtcManager) {
            rtcManager.cleanup();
        }
        if (eventHandler) {
            eventHandler.reset();
        }

        voiceEnabled = false;
        isConnected = false;
        voiceIcon.textContent = '🎤';
        voiceInputBtn.style.background = 'var(--primary-color)';
        voiceInputBtn.title = 'לחץ להתחלת שיחה קולית';
        voiceStatus.style.display = 'none';
        voiceInputBtn.disabled = false;

        addMessage('🔴 שיחה קולית הופסקה. לחץ על המיקרופון להתחלה מחדש.', 'bot');
        console.log('[UnifiedClient] Voice conversation stopped');
    }
}

/**
 * Initialize WebRTC connection
 */
async function initializeConnection(initialMessage = null) {
    // Create RTC manager
    rtcManager = new RTCManager();

    // Create event handler with UI callbacks
    eventHandler = new EventHandler(rtcManager, {
        onSessionCreated: () => {
            console.log('[UnifiedClient] Session created successfully');
            isConnected = true;
            
            // Send initial message if provided
            if (initialMessage) {
                console.log('[UnifiedClient] Sending initial message:', initialMessage);
                rtcManager.sendTextMessage(initialMessage);
            }
        },

        onUserSpeechInterim: (transcript) => {
            // Show interim user speech
            if (!currentInterimUserMessage) {
                currentInterimUserMessage = addMessage(transcript, 'user', true);
            } else {
                updateInterimMessage(currentInterimUserMessage, transcript);
            }
        },

        onUserMessage: (transcript) => {
            // Finalize user message
            if (currentInterimUserMessage) {
                updateInterimMessage(currentInterimUserMessage, transcript, false);
                currentInterimUserMessage = null;
            } else {
                addMessage(transcript, 'user');
            }
        },

        onAIThinking: (isThinking) => {
            showTyping(isThinking);
        },

        onAIMessageInterim: (transcript) => {
            // Show interim AI message
            if (!currentInterimAIMessage) {
                currentInterimAIMessage = addMessage(transcript, 'bot', true);
            } else {
                updateInterimMessage(currentInterimAIMessage, transcript);
            }
        },

        onAIMessage: (transcript) => {
            // Finalize AI message
            if (currentInterimAIMessage) {
                updateInterimMessage(currentInterimAIMessage, transcript, false);
                currentInterimAIMessage = null;
            } else {
                addMessage(transcript, 'bot');
            }
        },

        onFunctionCall: (functionName, args) => {
            // Show function call in developer mode
            if (developerModeEnabled) {
                showFunctionCall(functionName, args, null);
            }
        },

        onFunctionResult: (functionName, args, result) => {
            // Update function call with result in developer mode
            if (developerModeEnabled) {
                showFunctionCall(functionName, args, result);
            }
        },

        onError: (error) => {
            console.error('[UnifiedClient] Error:', error);
            addMessage('מצטער, אירעה שגיאה. אנא נסה שוב.', 'bot');
        }
    });

    // Initialize WebRTC
    await rtcManager.initialize((event) => {
        eventHandler.handleEvent(event);
    });

    console.log('[UnifiedClient] Connected successfully');
}

/**
 * Handle form submission (text input)
 */
async function handleSubmit(e) {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    // Show user message immediately
    addMessage(message, 'user');

    // Clear input
    messageInput.value = '';

    if (isConnected && voiceEnabled) {
        // Use WebRTC to send text message
        rtcManager.sendTextMessage(message);
    } else {
        // Voice not connected - start connection automatically with initial message
        try {
            addMessage('מתחבר לשיחה...', 'bot');
            
            // Pass the message to be sent after connection is established
            await initializeConnection(message);
            
            voiceEnabled = true;
            
            // Update UI to show voice is active
            voiceIcon.textContent = '🔴';
            voiceInputBtn.style.background = '#28a745';
            voiceInputBtn.title = 'לחץ לעצירת שיחה קולית';
            voiceStatus.style.display = 'block';
            
            addMessage('✅ מחובר! תוכל להמשיך לכתוב או לדבר', 'bot');
        } catch (error) {
            console.error('[UnifiedClient] Failed to auto-connect:', error);
            addMessage('מצטער, לא הצלחתי להתחבר. אנא נסה שוב.', 'bot');
        }
        messageInput.focus();
    }
}

/**
 * Add message to chat
 */
function addMessage(text, sender, isInterim = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    if (isInterim) {
        messageDiv.classList.add('interim');
        messageDiv.style.opacity = '0.6';
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(text);

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
}

/**
 * Update the last message (for welcome message)
 */
function updateMessage(text, sender) {
    const messages = chatMessages.querySelectorAll('.message');
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.classList.contains(`${sender}-message`)) {
            const contentDiv = lastMessage.querySelector('.message-content');
            contentDiv.innerHTML = formatMessage(text);
            return;
        }
    }
    addMessage(text, sender);
}

/**
 * Update interim message content
 */
function updateInterimMessage(messageDiv, text, isInterim = true) {
    const contentDiv = messageDiv.querySelector('.message-content');
    contentDiv.innerHTML = formatMessage(text);

    if (!isInterim) {
        messageDiv.classList.remove('interim');
        messageDiv.style.opacity = '1';
    }

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
 * Show function call in chat (developer mode)
 */
function showFunctionCall(functionName, args, result) {
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
    callHeader.innerHTML = `🔧 קריאה לפונקציה: <span style="color: #0066cc;">${functionName}</span>`;

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
    inputContent.textContent = JSON.stringify(args, null, 2);

    inputSection.appendChild(inputLabel);
    inputSection.appendChild(inputContent);
    callDiv.appendChild(callHeader);
    callDiv.appendChild(inputSection);

    if (result !== null) {
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
        outputContent.textContent = JSON.stringify(result, null, 2);

        outputSection.appendChild(outputLabel);
        outputSection.appendChild(outputContent);
        callDiv.appendChild(outputSection);
    }

    chatMessages.appendChild(callDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Show/hide typing indicator
 */
function showTyping(show) {
    typingIndicator.style.display = show ? 'flex' : 'none';
}

/**
 * Toggle developer mode
 */
function toggleDeveloperMode() {
    developerModeEnabled = !developerModeEnabled;
    toggleDevModeBtn.style.background = developerModeEnabled ? '#ffc107' : 'transparent';
    toggleDevModeBtn.title = developerModeEnabled ? 'מצב מפתח פעיל - קריאות פונקציה מוצגות' : 'מצב מפתח כבוי';
}

/**
 * Toggle audio (mute/unmute)
 */
function toggleAudio() {
    if (!rtcManager || !rtcManager.audioElement) return;

    const isMuted = rtcManager.audioElement.muted;
    rtcManager.audioElement.muted = !isMuted;

    toggleAudioBtn.textContent = isMuted ? '🔊' : '🔇';
    toggleAudioBtn.style.background = isMuted ? '#28a745' : '#dc3545';
}

/**
 * Clear chat
 */
function clearChat() {
    if (confirm('האם אתה בטוח שברצונך לנקות את השיחה?')) {
        chatMessages.innerHTML = '';
        currentInterimUserMessage = null;
        currentInterimAIMessage = null;

        // Reset connection if voice was active
        if (voiceEnabled) {
            if (rtcManager) {
                rtcManager.cleanup();
            }
            if (eventHandler) {
                eventHandler.reset();
            }
            voiceEnabled = false;
            isConnected = false;
            voiceIcon.textContent = '🎤';
            voiceInputBtn.style.background = 'var(--primary-color)';
            voiceStatus.style.display = 'none';
        }

        // Show welcome message
        addMessage('שלום! אני עוזר רוקח AI.', 'bot');
        addMessage('לחץ על כפתור המיקרופון 🎤 להתחלת שיחה קולית, או הקלד שאלה בשדה למטה.', 'bot');
    }
}
