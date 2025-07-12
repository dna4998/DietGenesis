import { useState, useCallback, useRef, useEffect } from 'react';

interface TextToSpeechHook {
  speak: (text: string, options?: SpeechSynthesisUtteranceOptions) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

interface SpeechSynthesisUtteranceOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(): TextToSpeechHook {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRateState] = useState(1);
  const [pitch, setPitchState] = useState(1);
  const [volume, setVolumeState] = useState(1);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = 'speechSynthesis' in window;

  // Load available voices
  const loadVoices = useCallback(() => {
    if (isSupported) {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      if (!selectedVoice && availableVoices.length > 0) {
        const englishVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en-')
        ) || availableVoices[0];
        setSelectedVoice(englishVoice);
      }
    }
  }, [selectedVoice, isSupported]);

  // Load voices on component mount and when voices change
  useEffect(() => {
    if (isSupported) {
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [loadVoices, isSupported]);

  const speak = useCallback((text: string, options: SpeechSynthesisUtteranceOptions = {}) => {
    if (!isSupported) {
      console.warn('Text-to-speech not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Apply options or use defaults
    utterance.voice = options.voice || selectedVoice;
    utterance.rate = options.rate || rate;
    utterance.pitch = options.pitch || pitch;
    utterance.volume = options.volume || volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, rate, pitch, volume]);

  const cancel = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  const setRate = useCallback((newRate: number) => {
    setRateState(Math.max(0.1, Math.min(10, newRate)));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    setPitchState(Math.max(0, Math.min(2, newPitch)));
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    voices,
    setVoice,
    setRate,
    setPitch,
    setVolume
  };
}