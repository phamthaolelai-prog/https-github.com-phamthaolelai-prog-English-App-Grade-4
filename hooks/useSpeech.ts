// Fix: Add type definitions for Web Speech API to resolve TypeScript errors.
// These types are not always included in standard TypeScript lib definitions.
// --- START of type definitions ---

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start(): void;
  abort(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}
// --- END of type definitions ---

import { useState, useEffect, useRef, useCallback } from 'react';

const SR = window.SpeechRecognition || (window as any).webkitSpeechRecognition || null;

export const useSpeech = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const recognizer = useRef<SpeechRecognition | null>(null);

    const loadVoices = useCallback(() => {
        const voiceList = window.speechSynthesis.getVoices();
        setVoices(voiceList);
    }, []);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
            // Warm up TTS
            const warm = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(warm);
        }
        
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, [loadVoices]);

    const speak = useCallback((text: string, rate: number, voiceName: string) => {
        if (!('speechSynthesis' in window) || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            utterance.voice = voice;
        }
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [voices]);
    
    const startRecording = useCallback((
        lang: string,
        onResult: (transcript: string) => void,
        onError: (error: SpeechRecognitionErrorEvent) => void
    ) => {
        if (!SR || isRecording) return;
        
        const r = new SR();
        r.lang = lang;
        r.interimResults = false;
        r.maxAlternatives = 1;

        recognizer.current = r;
        setIsRecording(true);

        r.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            stopRecording();
        };
        
        r.onerror = (event) => {
            onError(event);
            stopRecording();
        };

        r.onend = () => {
            setIsRecording(false);
            recognizer.current = null;
        };
        
        r.start();
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (recognizer.current) {
            recognizer.current.abort();
        }
    }, []);

    return {
        voices,
        speak,
        isRecording,
        startRecording,
        stopRecording,
        isSupported: !!SR
    };
};
