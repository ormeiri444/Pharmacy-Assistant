/**
 * Voice Client - handles voice interface using OpenAI Realtime API
 * Note: This requires the OpenAI Realtime API client library
 */

// Configuration
const OPENAI_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual API key

// Load system prompt and functions
let systemPrompt = '';
let functions = [];

// DOM Elements
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const transcription = document.getElementById('transcription');
const toggleDevModeBtn = document.getElementById('toggleDeveloperMode');
const developerMode = document.getElementById('developerMode');
const developerContent = document.getElementById('developerContent');

let developerModeEnabled = false;
let isConnected = false;
let realtimeSession = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfiguration();
    startButton.addEventListener('click', startVoiceSession);
    stopButton.addEventListener('click', stopVoiceSession);
    toggleDevModeBtn.addEventListener('click', toggleDeveloperMode);
});

/**
 * Load system prompt and function definitions
 */
async function loadConfiguration() {
    try {
        // Load system prompt
        const promptResponse = await fetch('../prompts/system-prompt.txt');
        systemPrompt = await promptResponse.text();
        
        // Load function definitions
        const functionsResponse = await fetch('../prompts/function-definitions.json');
        functions = await functionsResponse.json();
        
        console.log('Configuration loaded successfully');
    } catch (error) {
        console.error('Error loading configuration:', error);
        updateStatus('❌', 'שגיאה בטעינת הגדרות');
    }
}

/**
 * Start voice session
 */
async function startVoiceSession() {
    if (isConnected) return;
    
    try {
        updateStatus('🔄', 'מתחבר...');
        startButton.style.display = 'none';
        
        // Note: This is a placeholder for the actual Realtime API implementation
        // The actual implementation would use: import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
        
        // For now, we'll simulate the connection
        await simulateRealtimeConnection();
        
        isConnected = true;
        updateStatus('🎤', 'מאזין... דבר עכשיו');
        stopButton.style.display = 'block';
        
        addTranscription('מערכת: החיבור הקולי הופעל. אתה יכול להתחיל לדבר.', 'system');
        
    } catch (error) {
        console.error('Error starting voice session:', error);
        updateStatus('❌', 'שגיאה בהתחברות');
        startButton.style.display = 'block';
    }
}

/**
 * Stop voice session
 */
async function stopVoiceSession() {
    if (!isConnected) return;
    
    try {
        updateStatus('🔄', 'מתנתק...');
        
        // Disconnect session
        if (realtimeSession) {
            await realtimeSession.disconnect();
            realtimeSession = null;
        }
        
        isConnected = false;
        updateStatus('🎤', 'לחץ להתחלת שיחה');
        stopButton.style.display = 'none';
        startButton.style.display = 'block';
        
        addTranscription('מערכת: החיבור הקולי הופסק.', 'system');
        
    } catch (error) {
        console.error('Error stopping voice session:', error);
    }
}

/**
 * Simulate Realtime API connection (placeholder)
 * In production, this would use the actual OpenAI Realtime API
 */
async function simulateRealtimeConnection() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Simulated connection established');
            
            // Simulate receiving transcription
            setTimeout(() => {
                addTranscription('משתמש: יש לכם נורופן במלאי?', 'user');
                
                // Simulate function call
                if (developerModeEnabled) {
                    showFunctionCall({
                        name: 'get_medication_by_name',
                        arguments: { name: 'נורופן' },
                        result: {
                            success: true,
                            name: 'נורופן',
                            in_stock: true,
                            requires_prescription: false
                        }
                    });
                }
                
                // Simulate bot response
                setTimeout(() => {
                    addTranscription('עוזר: כן, נורופן זמין במלאי. זו תרופה ללא מרשם למשכך כאבים ונוגד דלקת.', 'bot');
                }, 1500);
            }, 2000);
            
            resolve();
        }, 1000);
    });
}

/**
 * Update status display
 */
function updateStatus(icon, text) {
    statusIcon.textContent = icon;
    statusText.textContent = text;
}

/**
 * Add transcription to display
 */
function addTranscription(text, type) {
    // Remove placeholder if exists
    const placeholder = transcription.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const p = document.createElement('p');
    p.textContent = text;
    
    if (type === 'user') {
        p.style.color = '#0066cc';
        p.style.fontWeight = 'bold';
    } else if (type === 'bot') {
        p.style.color = '#28a745';
        p.style.fontWeight = 'bold';
    } else if (type === 'system') {
        p.style.color = '#666';
        p.style.fontStyle = 'italic';
    }
    
    transcription.appendChild(p);
    transcription.scrollTop = transcription.scrollHeight;
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
 * Show function call in developer mode
 */
function showFunctionCall(functionCall) {
    const callDiv = document.createElement('div');
    callDiv.style.marginBottom = '15px';
    
    const callInfo = `
        <strong style="color: #50fa7b;">TOOL CALL:</strong> ${functionCall.name}<br>
        <pre>${JSON.stringify(functionCall.arguments, null, 2)}</pre>
        <strong style="color: #50fa7b;">TOOL RESPONSE:</strong><br>
        <pre>${JSON.stringify(functionCall.result, null, 2)}</pre>
    `;
    
    callDiv.innerHTML = callInfo;
    developerContent.appendChild(callDiv);
}

/**
 * Handle function calls from Realtime API
 */
function handleFunctionCall(functionName, args) {
    // Execute the function using mock API
    const result = executeToolCall(functionName, args);
    
    // Show in developer mode
    if (developerModeEnabled) {
        showFunctionCall({
            name: functionName,
            arguments: args,
            result: result
        });
    }
    
    return result;
}

// Note: To implement the actual Realtime API, you would need to:
// 1. Install the OpenAI Realtime API client: npm install @openai/agents
// 2. Import the necessary classes
// 3. Create a RealtimeAgent with the system prompt and functions
// 4. Create a RealtimeSession and connect it
// 5. Handle audio input/output streams
// 6. Process function calls and responses

// Example implementation structure (commented out):
/*
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

async function startVoiceSession() {
    const agent = new RealtimeAgent({
        name: "Pharmacy Assistant",
        instructions: systemPrompt,
        functions: functions
    });
    
    realtimeSession = new RealtimeSession(agent);
    
    // Handle function calls
    realtimeSession.on('function_call', async (call) => {
        const result = handleFunctionCall(call.name, call.arguments);
        return result;
    });
    
    // Handle transcription
    realtimeSession.on('transcription', (text, speaker) => {
        addTranscription(`${speaker}: ${text}`, speaker === 'user' ? 'user' : 'bot');
    });
    
    // Connect with API key
    await realtimeSession.connect({
        apiKey: OPENAI_API_KEY
    });
}
*/