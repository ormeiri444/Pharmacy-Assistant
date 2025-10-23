/**
 * Chat Client - handles chat interface and communication with backend
 */

const API_URL = 'http://localhost:5001';
let conversationHistory = [];
let developerModeEnabled = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const clearChatBtn = document.getElementById('clearChat');
const toggleDevModeBtn = document.getElementById('toggleDeveloperMode');
const developerMode = document.getElementById('developerMode');
const developerContent = document.getElementById('developerContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    chatForm.addEventListener('submit', handleSubmit);
    clearChatBtn.addEventListener('click', clearChat);
    toggleDevModeBtn.addEventListener('click', toggleDeveloperMode);
});

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
        // Send to backend
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
            // Add bot response to UI
            addMessage(data.message, 'bot');
            
            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: data.message
            });
            
            // Show tool calls in developer mode
            if (data.tool_calls && developerModeEnabled) {
                data.tool_calls.forEach(toolCall => {
                    showToolCall(toolCall);
                });
            }
        } else {
            addMessage('מצטער, אירעה שגיאה. אנא נסה שוב.', 'bot');
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('מצטער, לא הצלחתי להתחבר לשרת. אנא ודא שהשרת פועל.', 'bot');
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
        
        // Add welcome message
        addMessage('שלום! אני עוזר רוקח AI. במה אוכל לעזור לך?', 'bot');
        
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
 * Show tool call in developer mode
 */
function showToolCall(toolCall) {
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