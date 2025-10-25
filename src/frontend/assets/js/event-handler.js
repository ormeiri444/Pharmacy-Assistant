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

            // Input audio transcription (user speech-to-text)
            case 'conversation.item.input_audio_transcription.delta':
                this.handleInputAudioTranscriptionDelta(event);
                break;
            case 'conversation.item.input_audio_transcription.completed':
                this.handleInputAudioTranscriptionCompleted(event);
                break;

            // Response events
            case 'response.created':
                this.handleResponseCreated(event);
                break;
            case 'response.done':
                this.handleResponseDone(event);
                break;

            // Audio output transcription (AI speech-to-text)
            case 'response.audio_transcript.delta':
                this.handleAudioTranscriptDelta(event);
                break;
            case 'response.audio_transcript.done':
                this.handleAudioTranscriptDone(event);
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

        if (!this.buffers.transcripts[itemId]) {
            this.buffers.transcripts[itemId] = '';
        }

        this.buffers.transcripts[itemId] += delta;

        // Show interim transcript in UI
        if (this.uiCallbacks.onUserSpeechInterim) {
            this.uiCallbacks.onUserSpeechInterim(this.buffers.transcripts[itemId]);
        }
    }

    /**
     * User speech-to-text completed
     */
    handleInputAudioTranscriptionCompleted(event) {
        const itemId = event.item_id;
        const transcript = event.transcript || this.buffers.transcripts[itemId] || '';

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

        if (!this.buffers.audioTranscripts[itemId]) {
            this.buffers.audioTranscripts[itemId] = '';
        }

        this.buffers.audioTranscripts[itemId] += delta;

        // Show interim AI message
        if (this.uiCallbacks.onAIMessageInterim) {
            this.uiCallbacks.onAIMessageInterim(this.buffers.audioTranscripts[itemId]);
        }
    }

    /**
     * AI speech-to-text completed
     */
    handleAudioTranscriptDone(event) {
        const itemId = event.item_id;
        const transcript = event.transcript || this.buffers.audioTranscripts[itemId] || '';

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
