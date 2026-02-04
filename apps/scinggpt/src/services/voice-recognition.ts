// ScingGPT - Voice Recognition Service

import type { VoiceConfig, VoiceState } from '../shared/types';
import { DEFAULTS } from '../shared/constants';

type VoiceCallback = (transcript: string, isFinal: boolean) => void;
type StateCallback = (state: VoiceState) => void;

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;
  private config: VoiceConfig = {
    enabled: true,
    wakeWord: DEFAULTS.VOICE.WAKE_WORD,
    language: DEFAULTS.VOICE.LANGUAGE,
    continuous: DEFAULTS.VOICE.CONTINUOUS,
  };
  private callbacks: VoiceCallback[] = [];
  private stateCallbacks: StateCallback[] = [];
  private state: VoiceState = {
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    error: null,
  };

  constructor() {
    this.initialize();
  }

  /**
   * Initialize speech recognition
   */
  private initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.isSupported = false;
      this.updateState({ error: 'Speech recognition not supported' });
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  /**
   * Set up recognition event handlers
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = true;
    this.recognition.lang = this.config.language;

    this.recognition.onstart = () => {
      this.updateState({ isListening: true, error: null });
    };

    this.recognition.onend = () => {
      this.updateState({ isListening: false, isProcessing: false });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Recognition error';

      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'network':
          errorMessage = 'Network error';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      this.updateState({
        isListening: false,
        isProcessing: false,
        error: errorMessage,
      });
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          this.updateState({
            confidence: result[0].confidence,
            isProcessing: false,
          });
        } else {
          interimTranscript += result[0].transcript;
          this.updateState({ isProcessing: true });
        }
      }

      // Check for wake word
      const transcript = finalTranscript || interimTranscript;
      const hasWakeWord = this.checkWakeWord(transcript);

      if (hasWakeWord || !this.config.wakeWord) {
        const cleanTranscript = this.removeWakeWord(transcript);
        this.updateState({ transcript: cleanTranscript });
        this.notifyCallbacks(cleanTranscript, !!finalTranscript);
      }
    };
  }

  /**
   * Check if transcript contains wake word
   */
  private checkWakeWord(transcript: string): boolean {
    if (!this.config.wakeWord) return true;
    return transcript.toLowerCase().includes(this.config.wakeWord.toLowerCase());
  }

  /**
   * Remove wake word from transcript
   */
  private removeWakeWord(transcript: string): string {
    if (!this.config.wakeWord) return transcript;
    const regex = new RegExp(this.config.wakeWord, 'gi');
    return transcript.replace(regex, '').trim();
  }

  /**
   * Update state and notify listeners
   */
  private updateState(update: Partial<VoiceState>): void {
    this.state = { ...this.state, ...update };
    this.notifyStateCallbacks();
  }

  /**
   * Notify transcript callbacks
   */
  private notifyCallbacks(transcript: string, isFinal: boolean): void {
    for (const callback of this.callbacks) {
      callback(transcript, isFinal);
    }
  }

  /**
   * Notify state callbacks
   */
  private notifyStateCallbacks(): void {
    for (const callback of this.stateCallbacks) {
      callback({ ...this.state });
    }
  }

  /**
   * Configure voice recognition
   */
  configure(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.lang = this.config.language;
    }
  }

  /**
   * Start listening
   */
  start(): void {
    if (!this.isSupported || !this.recognition) {
      this.updateState({ error: 'Speech recognition not supported' });
      return;
    }

    if (this.state.isListening) {
      return;
    }

    try {
      this.updateState({ transcript: '' });
      this.recognition.start();
    } catch (error) {
      // Already started
    }
  }

  /**
   * Stop listening
   */
  stop(): void {
    if (this.recognition && this.state.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Toggle listening
   */
  toggle(): void {
    if (this.state.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * Subscribe to transcripts
   */
  onTranscript(callback: VoiceCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: StateCallback): () => void {
    this.stateCallbacks.push(callback);
    callback({ ...this.state }); // Emit current state
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get current state
   */
  getState(): VoiceState {
    return { ...this.state };
  }

  /**
   * Check if voice is supported
   */
  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Clear transcript
   */
  clearTranscript(): void {
    this.updateState({ transcript: '', confidence: 0 });
  }
}

// Export singleton instance
export const voiceService = new VoiceRecognitionService();
