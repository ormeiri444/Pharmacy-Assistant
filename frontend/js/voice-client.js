/**
 * Voice Client - handles voice interface using OpenAI Realtime API
 */

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
let peerConnection = null;
let dataChannel = null;
let audioContext = null;
let mediaStream = null;

// Configuration
const BACKEND_URL = 'http://localhost:8080';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    startButton.addEventListener('click', startVoiceSession);
    stopButton.addEventListener('click', stopVoiceSession);
    toggleDevModeBtn.addEventListener('click', toggleDeveloperMode);
});

/**
 * Start voice session with OpenAI Realtime API
 */
async function startVoiceSession() {
    if (isConnected) return;
    
    try {
        updateStatus('🔄', 'מתחבר...');
        startButton.style.display = 'none';
        
        // Get ephemeral token from backend
        const tokenResponse = await fetch(`${BACKEND_URL}/realtime/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!tokenResponse.ok) {
            throw new Error('Failed to get session token');
        }
        
        const { token } = await tokenResponse.json();
        
        // Initialize WebRTC connection
        await initializeRealtimeConnection(token);
        
        isConnected = true;
        updateStatus('🎤', 'מאזין... דבר עכשיו');
        stopButton.style.display = 'block';
        
        addTranscription('מערכת: החיבור הקולי הופעל. אתה יכול להתחיל לדבר.', 'system');
        
    } catch (error) {
        console.error('Error starting voice session:', error);
        updateStatus('❌', 'שגיאה בהתחברות: ' + error.message);
        startButton.style.display = 'block';
        addTranscription('מערכת: שגיאה - ' + error.message, 'system');
    }
}

/**
 * Initialize WebRTC connection to OpenAI Realtime API
 */
async function initializeRealtimeConnection(ephemeralToken) {
    // Create peer connection
    peerConnection = new RTCPeerConnection();
    
    // Set up audio context for microphone
    audioContext = new AudioContext({ sampleRate: 24000 });
    
    // Get user microphone
    mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    });
    
    // Add microphone track to peer connection
    const audioTrack = mediaStream.getAudioTracks()[0];
    peerConnection.addTrack(audioTrack);
    
    // Set up data channel for events
    dataChannel = peerConnection.createDataChannel('oai-events');
    
    dataChannel.addEventListener('open', () => {
        console.log('Data channel opened');
        // Send session configuration
        sendSessionUpdate();
    });
    
    dataChannel.addEventListener('message', (event) => {
        handleRealtimeEvent(JSON.parse(event.data));
    });
    
    // Handle incoming audio
    peerConnection.addEventListener('track', (event) => {
        const remoteStream = event.streams[0];
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.play();
    });
    
    // Create and set local offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    // Send offer to OpenAI with correct model parameter
    const sdpResponse = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ephemeralToken}`,
            'Content-Type': 'application/sdp'
        },
        body: offer.sdp
    });
    
    if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('OpenAI API Error Response:', errorText);
        console.error('Status:', sdpResponse.status);
        throw new Error(`Failed to connect to OpenAI Realtime API: ${sdpResponse.status} - ${errorText}`);
    }
    
    const answerSdp = await sdpResponse.text();
    await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
    });
}

/**
 * Send session configuration to OpenAI
 */
function sendSessionUpdate() {
    const sessionConfig = {
        type: 'session.update',
        session: {
            modalities: ['text', 'audio'],
            instructions: 'אתה עוזר רוקח וירטואלי. עזור למשתמשים עם שאלות על תרופות, מלאי, ומרכיבים. דבר בעברית.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
                model: 'whisper-1'
            },
            turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500
            },
            tools: [
                {
                    type: 'function',
                    name: 'get_medication_by_name',
                    description: 'חפש תרופה לפי שם',
                    parameters: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'שם התרופה'
                            }
                        },
                        required: ['name']
                    }
                },
                {
                    type: 'function',
                    name: 'check_stock',
                    description: 'בדוק מלאי של תרופה',
                    parameters: {
                        type: 'object',
                        properties: {
                            medication_id: {
                                type: 'string',
                                description: 'מזהה התרופה'
                            }
                        },
                        required: ['medication_id']
                    }
                },
                {
                    type: 'function',
                    name: 'search_by_ingredient',
                    description: 'חפש תרופות לפי מרכיב פעיל',
                    parameters: {
                        type: 'object',
                        properties: {
                            ingredient: {
                                type: 'string',
                                description: 'שם המרכיב הפעיל'
                            }
                        },
                        required: ['ingredient']
                    }
                }
            ],
            tool_choice: 'auto',
            temperature: 0.8
        }
    };
    
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(JSON.stringify(sessionConfig));
    }
}

/**
 * Handle events from OpenAI Realtime API
 */
function handleRealtimeEvent(event) {
    console.log('Realtime event:', event);
    
    switch (event.type) {
        case 'conversation.item.input_audio_transcription.completed':
            addTranscription(`משתמש: ${event.transcript}`, 'user');
            break;
            
        case 'response.audio_transcript.delta':
            // Accumulate transcript deltas
            if (!window.currentTranscript) {
                window.currentTranscript = '';
            }
            window.currentTranscript += event.delta;
            break;
            
        case 'response.audio_transcript.done':
            if (window.currentTranscript) {
                addTranscription(`עוזר: ${window.currentTranscript}`, 'bot');
                window.currentTranscript = '';
            }
            break;
            
        case 'response.function_call_arguments.done':
            // Show function call in transcription
            showFunctionCallInTranscription({
                name: event.name,
                call_id: event.call_id,
                arguments: JSON.parse(event.arguments)
            });
            
            if (developerModeEnabled) {
                showFunctionCall({
                    name: event.name,
                    call_id: event.call_id,
                    arguments: JSON.parse(event.arguments)
                });
            }
            // Execute function and send result
            executeFunctionCall(event.call_id, event.name, JSON.parse(event.arguments));
            break;
            
        case 'error':
            console.error('Realtime API error:', event.error);
            addTranscription(`שגיאה: ${event.error.message}`, 'system');
            break;
    }
}

/**
 * Execute function call and send result back
 */
async function executeFunctionCall(callId, functionName, args) {
    try {
        // Call backend to execute function
        const result = await executeToolCall(functionName, args);
        
        // Send result back to OpenAI
        const functionOutput = {
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(result)
            }
        };
        
        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify(functionOutput));
            
            // Request response generation
            dataChannel.send(JSON.stringify({ type: 'response.create' }));
        }
        
        // Show result in transcription
        showFunctionResultInTranscription(callId, result);
        
        if (developerModeEnabled) {
            showFunctionResult(callId, result);
        }
    } catch (error) {
        console.error('Error executing function:', error);
    }
}

/**
 * Stop voice session
 */
async function stopVoiceSession() {
    if (!isConnected) return;
    
    try {
        updateStatus('🔄', 'מתנתק...');
        
        // Close data channel
        if (dataChannel) {
            dataChannel.close();
            dataChannel = null;
        }
        
        // Close peer connection
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        
        // Stop microphone
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
        
        // Close audio context
        if (audioContext) {
            await audioContext.close();
            audioContext = null;
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
    callDiv.id = `call-${functionCall.call_id}`;
    
    const callInfo = `
        <strong style="color: #50fa7b;">TOOL CALL:</strong> ${functionCall.name}<br>
        <strong>Call ID:</strong> ${functionCall.call_id}<br>
        <pre>${JSON.stringify(functionCall.arguments, null, 2)}</pre>
        <div id="result-${functionCall.call_id}"></div>
    `;
    
    callDiv.innerHTML = callInfo;
    developerContent.appendChild(callDiv);
}

/**
 * Show function result in developer mode
 */
function showFunctionResult(callId, result) {
    const resultDiv = document.getElementById(`result-${callId}`);
    if (resultDiv) {
        resultDiv.innerHTML = `
            <strong style="color: #50fa7b;">TOOL RESPONSE:</strong><br>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        `;
    }
}

/**
 * Show function call in transcription area
 */
function showFunctionCallInTranscription(functionCall) {
    const callDiv = document.createElement('div');
    callDiv.style.backgroundColor = '#f8f9fa';
    callDiv.style.border = '1px solid #dee2e6';
    callDiv.style.borderRadius = '8px';
    callDiv.style.padding = '12px';
    callDiv.style.marginTop = '10px';
    callDiv.style.marginBottom = '10px';
    callDiv.id = `transcription-call-${functionCall.call_id}`;
    
    const callHeader = document.createElement('div');
    callHeader.style.fontWeight = 'bold';
    callHeader.style.color = '#6c757d';
    callHeader.style.marginBottom = '8px';
    callHeader.innerHTML = `🔧 קריאה לפונקציה: ${functionCall.name}`;
    
    const callArgs = document.createElement('pre');
    callArgs.style.backgroundColor = '#ffffff';
    callArgs.style.border = '1px solid #e9ecef';
    callArgs.style.borderRadius = '4px';
    callArgs.style.padding = '8px';
    callArgs.style.margin = '0';
    callArgs.style.fontSize = '12px';
    callArgs.style.overflow = 'auto';
    callArgs.style.direction = 'ltr';
    callArgs.style.textAlign = 'left';
    callArgs.textContent = JSON.stringify(functionCall.arguments, null, 2);
    
    const resultPlaceholder = document.createElement('div');
    resultPlaceholder.id = `transcription-result-${functionCall.call_id}`;
    resultPlaceholder.style.marginTop = '8px';
    
    callDiv.appendChild(callHeader);
    callDiv.appendChild(callArgs);
    callDiv.appendChild(resultPlaceholder);
    
    transcription.appendChild(callDiv);
    transcription.scrollTop = transcription.scrollHeight;
}

/**
 * Show function result in transcription area
 */
function showFunctionResultInTranscription(callId, result) {
    const resultDiv = document.getElementById(`transcription-result-${callId}`);
    if (resultDiv) {
        const resultHeader = document.createElement('div');
        resultHeader.style.fontWeight = 'bold';
        resultHeader.style.color = '#28a745';
        resultHeader.style.marginBottom = '4px';
        resultHeader.innerHTML = '✅ תוצאה:';
        
        const resultContent = document.createElement('pre');
        resultContent.style.backgroundColor = '#ffffff';
        resultContent.style.border = '1px solid #e9ecef';
        resultContent.style.borderRadius = '4px';
        resultContent.style.padding = '8px';
        resultContent.style.margin = '0';
        resultContent.style.fontSize = '12px';
        resultContent.style.overflow = 'auto';
        resultContent.style.direction = 'ltr';
        resultContent.style.textAlign = 'left';
        resultContent.textContent = JSON.stringify(result, null, 2);
        
        resultDiv.appendChild(resultHeader);
        resultDiv.appendChild(resultContent);
        
        transcription.scrollTop = transcription.scrollHeight;
    }
}