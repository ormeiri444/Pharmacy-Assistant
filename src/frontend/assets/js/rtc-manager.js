/**
 * RTC Manager - Handles WebRTC connection to OpenAI Realtime API
 * Adapted for Pharmacy Assistant with Hebrew support
 */

class RTCManager {
    constructor() {
        this.peerConnection = null;
        this.dataChannel = null;
        this.audioElement = null;
        this.localStream = null;
        this.onMessageCallback = null;
        this.sessionEstablished = false;
    }

    /**
     * Initialize WebRTC connection with OpenAI Realtime API
     */
    async initialize(onMessageCallback) {
        try {
            console.log('[RTC] Initializing WebRTC connection...');
            this.onMessageCallback = onMessageCallback;

            // Create peer connection
            this.peerConnection = new RTCPeerConnection();

            // Set up audio element for playback
            this.audioElement = document.createElement('audio');
            this.audioElement.autoplay = true;
            this.audioElement.muted = false;

            // Add to DOM (required for some browsers)
            this.audioElement.style.display = 'none';
            document.body.appendChild(this.audioElement);

            // Handle incoming audio tracks
            this.peerConnection.ontrack = (event) => {
                console.log('[RTC] Received remote audio track');
                this.audioElement.srcObject = event.streams[0];

                // Try to play (handle autoplay restrictions)
                this.audioElement.play().catch(e => {
                    console.warn('[RTC] Autoplay prevented:', e);
                });
            };

            // Monitor connection state
            this.peerConnection.onconnectionstatechange = () => {
                console.log('[RTC] Connection state:', this.peerConnection.connectionState);
            };

            // Create data channel for events
            this.dataChannel = this.peerConnection.createDataChannel('oai-events');
            this.setupDataChannel();

            // Get microphone access
            await this.setupMicrophone();

            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            // Send SDP to backend
            const response = await fetch('http://localhost:8080/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/sdp'
                },
                body: offer.sdp
            });

            if (!response.ok) {
                throw new Error(`Session creation failed: ${response.statusText}`);
            }

            const answerSDP = await response.text();
            console.log('[RTC] Received SDP answer from server');

            // Set remote description
            await this.peerConnection.setRemoteDescription({
                type: 'answer',
                sdp: answerSDP
            });

            this.sessionEstablished = true;
            console.log('[RTC] WebRTC connection established successfully');

            return true;
        } catch (error) {
            console.error('[RTC] Failed to initialize:', error);
            throw error;
        }
    }

    /**
     * Setup microphone audio input
     */
    async setupMicrophone() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 24000,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Add audio track to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            console.log('[RTC] Microphone setup complete');
        } catch (error) {
            console.error('[RTC] Microphone access failed:', error);
            throw error;
        }
    }

    /**
     * Setup data channel for events
     */
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('[RTC] Data channel opened');
        };

        this.dataChannel.onclose = () => {
            console.log('[RTC] Data channel closed');
        };

        this.dataChannel.onerror = (error) => {
            console.error('[RTC] Data channel error:', error);
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (this.onMessageCallback) {
                    this.onMessageCallback(message);
                }
            } catch (error) {
                console.error('[RTC] Failed to parse message:', error);
            }
        };
    }

    /**
     * Send event to OpenAI Realtime API
     */
    sendEvent(event) {
        if (!this.sessionEstablished || !this.dataChannel) {
            console.error('[RTC] Cannot send event: session not established');
            return false;
        }

        if (this.dataChannel.readyState !== 'open') {
            console.error('[RTC] Cannot send event: data channel not open');
            return false;
        }

        try {
            this.dataChannel.send(JSON.stringify(event));
            return true;
        } catch (error) {
            console.error('[RTC] Failed to send event:', error);
            return false;
        }
    }

    /**
     * Send text message to the AI
     */
    sendTextMessage(text) {
        const event = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [
                    {
                        type: 'input_text',
                        text: text
                    }
                ]
            }
        };

        this.sendEvent(event);

        // Trigger response
        this.sendEvent({
            type: 'response.create'
        });
    }

    /**
     * Send function call result back to AI
     */
    sendFunctionResult(callId, result) {
        const event = {
            type: 'conversation.item.create',
            item: {
                type: 'function_call_output',
                call_id: callId,
                output: JSON.stringify(result)
            }
        };

        this.sendEvent(event);

        // Trigger response
        this.sendEvent({
            type: 'response.create'
        });
    }

    /**
     * Update session configuration
     */
    updateSession(config) {
        const event = {
            type: 'session.update',
            session: config
        };

        this.sendEvent(event);
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('[RTC] Cleaning up resources...');

        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.srcObject = null;
            if (this.audioElement.parentNode) {
                this.audioElement.parentNode.removeChild(this.audioElement);
            }
            this.audioElement = null;
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
                console.log('[RTC] Stopped track:', track.kind);
            });
            this.localStream = null;
        }

        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        this.sessionEstablished = false;
        console.log('[RTC] Cleanup complete');
    }

    /**
     * Check if session is active
     */
    isConnected() {
        return this.sessionEstablished &&
               this.dataChannel &&
               this.dataChannel.readyState === 'open';
    }
}
