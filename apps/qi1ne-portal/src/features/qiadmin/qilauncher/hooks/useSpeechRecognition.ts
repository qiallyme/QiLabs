// apps/qilauncher/hooks/useSpeechRecognition.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  hasMicPermission: boolean | null;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    onResult,
    onError,
    lang = 'en-US',
    continuous = false,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) {
      setHasMicPermission(false);
      return;
    }

    // Initialize recognition
    const Recognition = (window.SpeechRecognition || (window as any).webkitSpeechRecognition) as typeof SpeechRecognition;
    const recognition = new Recognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript.trim();
      setTranscript(interimTranscript || finalTranscriptRef.current);

      // If we have a final result, call onResult
      if (finalTranscript.trim() && onResult) {
        onResult(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          setHasMicPermission(false);
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please enable microphone access.';
          setHasMicPermission(false);
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User stopped or cancelled - not really an error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Check microphone permission on mount
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setHasMicPermission(result.state === 'granted');
          result.onchange = () => {
            setHasMicPermission(result.state === 'granted');
          };
        })
        .catch(() => {
          // Permission API not fully supported, assume unknown
          setHasMicPermission(null);
        });
    } else {
      // Permission API not available, assume unknown
      setHasMicPermission(null);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [isSupported, lang, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      if (onError) {
        onError('Speech recognition is not supported in this browser.');
      }
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        // Already listening or already stopped
        if (onError) {
          onError('Speech recognition is already active.');
        }
      } else {
        if (onError) {
          onError(`Failed to start speech recognition: ${error.message}`);
        }
      }
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Ignore errors when stopping
      }
    }
  }, [isListening]);

  return {
    isListening,
    hasMicPermission,
    transcript,
    startListening,
    stopListening,
    isSupported,
  };
}

