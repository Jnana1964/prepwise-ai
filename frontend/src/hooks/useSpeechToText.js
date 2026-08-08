import { useEffect, useRef, useState } from 'react';

// Real browser speech-to-text (Web Speech API) - no server round-trip, no
// new dependency. Not every browser supports it (Firefox notably doesn't),
// so `supported` tells the caller whether to even show a working mic
// button rather than a fake one.
export function useSpeechToText({ onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
      }
      if (transcript.trim()) onResult?.(transcript.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return { supported, listening, toggleListening };
}
