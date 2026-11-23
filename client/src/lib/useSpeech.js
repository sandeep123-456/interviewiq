import { useCallback, useEffect, useRef, useState } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export const canListen = Boolean(SpeechRecognition);
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Mic: bolne par onFinal(text) har pura hua vakya bhejta hai
export function useListen(onFinal) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState(''); // abhi bol rahe ho, wo adhura text
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal; // hamesha latest function use ho

  const start = useCallback(() => {
    if (!SpeechRecognition || recRef.current) return;
    setError('');
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN'; // Indian English accent ke liye behtar
    rec.continuous = true; // chup hone par band na ho
    rec.interimResults = true;

    rec.onresult = (event) => {
      let live = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) onFinalRef.current(r[0].transcript.trim());
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Microphone is blocked. Allow it in the address bar.');
      else if (e.error === 'no-speech') setError('No speech heard. Try again.');
      else if (e.error !== 'aborted') setError(`Mic error: ${e.error}`);
    };
    rec.onend = () => {
      recRef.current = null;
      setListening(false);
      setInterim('');
    };

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  // Page chhodte hi mic band
  useEffect(() => () => recRef.current?.abort(), []);

  return { listening, interim, error, start, stop };
}

// Speaker: question ko awaaz me padhna
export function useSpeak() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text) => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel(); // pehle ka kuch chal raha ho to rok do
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const cancel = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => () => canSpeak && window.speechSynthesis.cancel(), []);

  return { speaking, speak, cancel };
}