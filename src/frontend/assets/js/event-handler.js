/**
 * Event Handler - Processes OpenAI Realtime API events
 * Handles transcription, function calls, audio responses, and more
 */

class EventHandler {
    constructor(rtcManager, uiCallbacks) {
        this.rtcManager = rtcManager;
        this.uiCallbacks = uiCallbacks;

        // State buffers
        this.buffers = {
            transcripts: {},      // itemId -> transcript text
            functionCalls: {},    // callId -> function data
            audioTranscripts: {}, // itemId -> audio transcript
        };

        this.sessionId = null;
        this.currentResponseId = null;
    }

    /**
     * Main event router
     */
    handleEvent(event) {
        const eventType = event.type;
        console.log(`[EventHandler] Processing event: ${eventType}`);

        switch (eventType) {
            // Session events
            case 'session.created':
                this.handleSessionCreated(event);
                break;
            case 'session.updated':
                this.handleSessionUpdated(event);
                break;

            // Conversation events
            case 'conversation.item.created':
                this.handleConversationItemCreated(event);
                break;
            case 'conversation.item.input_audio_transcription.delta':
                this.handleInputAudioTranscriptionDelta(event);
                break;
            case 'conversation.item.input_audio_transcription.completed':
                this.handleInputAudioTranscriptionCompleted(event);
                break;

            // Input audio buffer events
            case 'input_audio_buffer.committed':
                console.log('[EventHandler] Audio buffer committed');
                break;
            case 'input_audio_buffer.speech_started':
                console.log('[EventHandler] 🎤 Speech started detected!');
                if (this.uiCallbacks.onUserSpeechInterim) {
                    this.uiCallbacks.onUserSpeechInterim('...');
                }
                break;
            case 'input_audio_buffer.speech_stopped':
                console.log('[EventHandler] 🎤 Speech stopped detected');
                break;

            // Response events
            case 'response.created':
                this.handleResponseCreated(event);
                break;
            case 'response.done':
                this.handleResponseDone(event);
                break;
            case 'response.output_item.added':
                console.log('[EventHandler] Output item added:', event.item?.type);
                break;
            case 'response.output_item.done':
                console.log('[EventHandler] Output item done:', event.item?.type);
                break;

            // Audio output transcription (AI speech-to-text)
            case 'response.audio_transcript.delta':
                this.handleAudioTranscriptDelta(event);
                break;
            case 'response.audio_transcript.done':
                this.handleAudioTranscriptDone(event);
                break;

            // Text deltas
            case 'response.text.delta':
                console.log('[EventHandler] Text delta:', event.delta);
                break;
            case 'response.text.done':
                console.log('[EventHandler] Text done:', event.text);
                break;

            // Function calling
            case 'response.function_call_arguments.delta':
                this.handleFunctionCallArgumentsDelta(event);
                break;
            case 'response.function_call_arguments.done':
                this.handleFunctionCallArgumentsDone(event);
                break;

            // Audio deltas (we handle this via WebRTC audio track)
            case 'response.audio.delta':
                // Audio is handled by WebRTC audio track automatically
                break;
            case 'response.audio.done':
                console.log('[EventHandler] Audio response complete');
                break;

            // Rate limits
            case 'rate_limits.updated':
                console.log('[EventHandler] Rate limits updated');
                break;

            // Error handling
            case 'error':
                this.handleError(event);
                break;

            default:
                console.log(`[EventHandler] Unhandled event: ${eventType}`, event);
        }
    }

    /**
     * Session created
     */
    handleSessionCreated(event) {
        console.log('[EventHandler] Session created:', event.session.id);
        this.sessionId = event.session.id;

        if (this.uiCallbacks.onSessionCreated) {
            this.uiCallbacks.onSessionCreated(event.session);
        }
    }

    /**
     * Session updated
     */
    handleSessionUpdated(event) {
        console.log('[EventHandler] Session updated');
    }

    /**
     * Conversation item created
     */
    handleConversationItemCreated(event) {
        console.log('[EventHandler] Conversation item created:', event.item.id);
    }

    /**
     * User speech-to-text delta (accumulate)
     */
    handleInputAudioTranscriptionDelta(event) {
        const itemId = event.item_id;
        const delta = event.delta;

        // Initialize buffer if needed
        if (!this.buffers.transcripts[itemId]) {
            this.buffers.transcripts[itemId] = {
                text: '',
                contentIndex: event.content_index || 0
            };
        }

        // Handle content_index to ensure proper ordering
        // If content_index is provided, it indicates where this delta belongs
        if (event.content_index !== undefined) {
            // If we're getting a new content_index, it might be a replacement
            if (event.content_index < this.buffers.transcripts[itemId].contentIndex) {
                // This is a correction/replacement - reset from this point
                this.buffers.transcripts[itemId].text = delta;
                this.buffers.transcripts[itemId].contentIndex = event.content_index;
            } else {
                // Normal append
                this.buffers.transcripts[itemId].text += delta;
                this.buffers.transcripts[itemId].contentIndex = event.content_index;
            }
        } else {
            // No content_index, just append (fallback behavior)
            this.buffers.transcripts[itemId].text += delta;
        }

        // Show interim transcript in UI
        if (this.uiCallbacks.onUserSpeechInterim) {
            this.uiCallbacks.onUserSpeechInterim(this.buffers.transcripts[itemId].text);
        }
    }

    /**
     * User speech-to-text completed
     */
    handleInputAudioTranscriptionCompleted(event) {
        const itemId = event.item_id;
        
        // Use the final transcript from the event, or fall back to buffered text
        let transcript = event.transcript;
        if (!transcript && this.buffers.transcripts[itemId]) {
            transcript = this.buffers.transcripts[itemId].text || '';
        }
        transcript = transcript || '';

        console.log('[EventHandler] User speech transcribed:', transcript);

        // Show in UI
        if (this.uiCallbacks.onUserMessage) {
            this.uiCallbacks.onUserMessage(transcript);
        }

        // Clean up buffer
        delete this.buffers.transcripts[itemId];
    }

    /**
     * Response created (AI started processing)
     */
    handleResponseCreated(event) {
        console.log('[EventHandler] Response created:', event.response.id);
        this.currentResponseId = event.response.id;

        if (this.uiCallbacks.onAIThinking) {
            this.uiCallbacks.onAIThinking(true);
        }
    }

    /**
     * Response done (AI finished)
     */
    handleResponseDone(event) {
        console.log('[EventHandler] Response done:', event.response.id);
        this.currentResponseId = null;

        if (this.uiCallbacks.onAIThinking) {
            this.uiCallbacks.onAIThinking(false);
        }
    }

    /**
     * AI speech-to-text delta (accumulate)
     */
    handleAudioTranscriptDelta(event) {
        const itemId = event.item_id;
        const delta = event.delta;

        // Initialize buffer if needed
        if (!this.buffers.audioTranscripts[itemId]) {
            this.buffers.audioTranscripts[itemId] = {
                text: '',
                contentIndex: event.content_index || 0
            };
        }

        // Handle content_index to ensure proper ordering
        if (event.content_index !== undefined) {
            // If we're getting a new content_index, it might be a replacement
            if (event.content_index < this.buffers.audioTranscripts[itemId].contentIndex) {
                // This is a correction/replacement - reset from this point
                this.buffers.audioTranscripts[itemId].text = delta;
                this.buffers.audioTranscripts[itemId].contentIndex = event.content_index;
            } else {
                // Normal append
                this.buffers.audioTranscripts[itemId].text += delta;
                this.buffers.audioTranscripts[itemId].contentIndex = event.content_index;
            }
        } else {
            // No content_index, just append (fallback behavior)
            this.buffers.audioTranscripts[itemId].text += delta;
        }

        // Show interim AI message
        if (this.uiCallbacks.onAIMessageInterim) {
            this.uiCallbacks.onAIMessageInterim(this.buffers.audioTranscripts[itemId].text);
        }
    }

    /**
     * AI speech-to-text completed
     */
    handleAudioTranscriptDone(event) {
        const itemId = event.item_id;
        
        // Use the final transcript from the event, or fall back to buffered text
        let transcript = event.transcript;
        if (!transcript && this.buffers.audioTranscripts[itemId]) {
            transcript = this.buffers.audioTranscripts[itemId].text || '';
        }
        transcript = transcript || '';

        console.log('[EventHandler] AI speech transcribed:', transcript);

        // Show final AI message
        if (this.uiCallbacks.onAIMessage) {
            this.uiCallbacks.onAIMessage(transcript);
        }

        // Clean up buffer
        delete this.buffers.audioTranscripts[itemId];
    }

    /**
     * Function call arguments delta (accumulate JSON)
     */
    handleFunctionCallArgumentsDelta(event) {
        const callId = event.call_id;
        const delta = event.delta;

        if (!this.buffers.functionCalls[callId]) {
            this.buffers.functionCalls[callId] = {
                name: event.name,
                arguments: ''
            };
        }

        this.buffers.functionCalls[callId].arguments += delta;
    }

    /**
     * Function call arguments done - execute the function
     */
    async handleFunctionCallArgumentsDone(event) {
        const callId = event.call_id;
        const functionName = event.name;
        const argumentsJson = event.arguments;

        console.log(`[EventHandler] Function call: ${functionName}`);
        console.log(`[EventHandler] Arguments:`, argumentsJson);

        try {
            // Parse arguments
            const args = JSON.parse(argumentsJson);

            // Show in developer mode
            if (this.uiCallbacks.onFunctionCall) {
                this.uiCallbacks.onFunctionCall(functionName, args);
            }

            // Execute function via backend
            const response = await fetch('http://localhost:8080/execute-function', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    function_name: functionName,
                    arguments: args
                })
            });

            const result = await response.json();
            console.log(`[EventHandler] Function result:`, result);

            // Show result in developer mode
            if (this.uiCallbacks.onFunctionResult) {
                this.uiCallbacks.onFunctionResult(functionName, args, result);
            }

            // Send result back to AI
            this.rtcManager.sendFunctionResult(callId, result);

        } catch (error) {
            console.error(`[EventHandler] Function call error:`, error);

            // Send error back to AI
            this.rtcManager.sendFunctionResult(callId, {
                error: error.message
            });
        }

        // Clean up buffer
        delete this.buffers.functionCalls[callId];
    }

    /**
     * Error handling
     */
    handleError(event) {
        console.error('[EventHandler] Error event:', event);

        if (this.uiCallbacks.onError) {
            this.uiCallbacks.onError(event.error);
        }
    }

    /**
     * Reset handler state
     */
    reset() {
        this.buffers = {
            transcripts: {},
            functionCalls: {},
            audioTranscripts: {},
        };
        this.sessionId = null;
        this.currentResponseId = null;
    }
}
