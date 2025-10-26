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
            console.log('[RTC] Requesting microphone access...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Safari.');
            }

            // Request microphone with specific constraints
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 24000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            console.log('[RTC] Microphone access granted');
            console.log('[RTC] Audio tracks:', this.localStream.getAudioTracks().length);

            // Verify we got audio tracks
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No audio tracks available from microphone');
            }

            // Log track details
            audioTracks.forEach((track, index) => {
                console.log(`[RTC] Audio track ${index}:`, {
                    label: track.label,
                    enabled: track.enabled,
                    muted: track.muted,
                    readyState: track.readyState,
                    settings: track.getSettings()
                });
            });

            // Add audio track to peer connection
            this.localStream.getTracks().forEach(track => {
                console.log('[RTC] Adding track to peer connection:', track.kind);
                this.peerConnection.addTrack(track, this.localStream);
            });

            // Start with microphone muted (will be unmuted when user clicks mic button)
            this.muteMicrophone();

            // Set up audio level monitoring
            this.setupAudioLevelMonitoring();

            console.log('[RTC] Microphone setup complete (initially muted)');
        } catch (error) {
            console.error('[RTC] Microphone access failed:', error);
            
            // Provide user-friendly error messages
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                throw new Error('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                throw new Error('No microphone found. Please connect a microphone and try again.');
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                throw new Error('Microphone is already in use by another application. Please close other apps using the microphone and try again.');
            } else {
                throw new Error(`Microphone error: ${error.message}`);
            }
        }
    }

    /**
     * Setup audio level monitoring for debugging
     */
    setupAudioLevelMonitoring() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(this.localStream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            // Monitor audio levels
            const checkAudioLevel = () => {
                if (!this.localStream) return;

                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                
                // Log when audio is detected (above threshold)
                if (average > 10) {
                    console.log('[RTC] Audio detected - level:', Math.round(average));
                }

                requestAnimationFrame(checkAudioLevel);
            };

            checkAudioLevel();
            console.log('[RTC] Audio level monitoring started');
        } catch (error) {
            console.warn('[RTC] Could not set up audio monitoring:', error);
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
     * Mute the microphone
     */
    muteMicrophone() {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = false;
                console.log('[RTC] Microphone muted');
            });
        }
    }

    /**
     * Unmute the microphone
     */
    unmuteMicrophone() {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = true;
                console.log('[RTC] Microphone unmuted');
            });
        }
    }

    /**
     * Check if microphone is muted
     */
    isMicrophoneMuted() {
        if (!this.localStream) return true;
        const audioTracks = this.localStream.getAudioTracks();
        return audioTracks.length === 0 || !audioTracks[0].enabled;
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
