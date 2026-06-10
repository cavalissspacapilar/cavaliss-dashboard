"use client";
import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export type JarvisStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface HistoryItem {
  id: number;
  command: string;
  response: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface ConvMsg {
  role: 'user' | 'assistant';
  content: string;
}

interface JarvisCtx {
  isOpen: boolean;
  status: JarvisStatus;
  transcript: string;
  response: string;
  history: HistoryItem[];
  error: string | null;
  open(): void;
  close(): void;
  toggle(): void;
  startListening(): void;
  stopListening(): void;
  sendCommand(text: string): void;
}

const JarvisContext = createContext<JarvisCtx | null>(null);

export function useJarvis(): JarvisCtx {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error('useJarvis must be used inside JarvisProvider');
  return ctx;
}

// WebSpeech API — not all TS DOM versions expose these; declare locally
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: ((e: ISpeechRecognitionErrorEvent) => void) | null;
}
interface ISpeechRecognitionResult {
  isFinal: boolean;
  readonly length: number;
  item(idx: number): { transcript: string; confidence: number };
  [idx: number]: { transcript: string; confidence: number };
}
interface ISpeechRecognitionEvent extends Event {
  readonly results: { length: number; item(idx: number): ISpeechRecognitionResult; [idx: number]: ISpeechRecognitionResult };
}
interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => ISpeechRecognition;
  webkitSpeechRecognition?: new () => ISpeechRecognition;
};

export function JarvisProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [status, setStatus]       = useState<JarvisStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse]   = useState('');
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [error, setError]         = useState<string | null>(null);

  const recRef    = useRef<ISpeechRecognition | null>(null);
  const convRef   = useRef<ConvMsg[]>([]);
  const idRef     = useRef(0);

  // ── SpeechSynthesis ────────────────────────────────────────────────────────

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'es-MX';
    utter.rate  = 1.05;
    utter.pitch = 1.0;

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(v => v.lang === 'es-MX') ??
        voices.find(v => v.lang.startsWith('es')) ??
        null;
      if (voice) utter.voice = voice;
      utter.onstart = () => setStatus('speaking');
      utter.onend   = () => setStatus('idle');
      utter.onerror = () => setStatus('idle');
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    }
  }, []);

  // ── API call ───────────────────────────────────────────────────────────────

  const sendCommand = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStatus('processing');
    setError(null);

    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text, history: convRef.current }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { response: string; toolsUsed: string[] };
      const txt  = data.response || 'Sin respuesta.';

      setResponse(txt);
      convRef.current = [
        ...convRef.current,
        { role: 'user' as const, content: text },
        { role: 'assistant' as const, content: txt },
      ].slice(-16);

      setHistory(prev => [
        { id: ++idRef.current, command: text, response: txt, timestamp: new Date(), toolsUsed: data.toolsUsed },
        ...prev,
      ].slice(0, 5));

      speak(txt);
    } catch {
      const msg = 'Error al conectar con JARVIS. Verifica la conexión.';
      setError(msg);
      setResponse(msg);
      setStatus('error');
      setTimeout(() => setStatus(s => (s === 'error' ? 'idle' : s)), 3500);
    }
  }, [speak]);

  // ── SpeechRecognition ──────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setStatus(s => (s === 'listening' ? 'idle' : s));
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.speechSynthesis.cancel();

    const win  = window as SpeechWindow;
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!Ctor) {
      setError('Tu navegador no soporta voz. Usa Chrome o Edge, o escribe el comando.');
      setStatus('error');
      setTimeout(() => setStatus(s => (s === 'error' ? 'idle' : s)), 4000);
      return;
    }

    recRef.current?.stop();
    const rec = new Ctor();
    rec.lang             = 'es-MX';
    rec.continuous       = false;
    rec.interimResults   = true;
    rec.maxAlternatives  = 1;

    rec.onstart = () => {
      setStatus('listening');
      setTranscript('');
      setError(null);
    };

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
      if (last.isFinal) {
        rec.stop();
        sendCommand(text);
      }
    };

    rec.onerror = (e: ISpeechRecognitionErrorEvent) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        setStatus(s => (s === 'listening' ? 'idle' : s));
      } else {
        setError(`Error de micrófono: ${e.error}`);
        setStatus('error');
        setTimeout(() => setStatus(s => (s === 'error' ? 'idle' : s)), 3500);
      }
    };

    rec.onend = () => setStatus(s => (s === 'listening' ? 'idle' : s));

    recRef.current = rec;
    rec.start();
  }, [sendCommand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recRef.current?.stop();
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  // Warm up voice list on first render
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.getVoices();
  }, []);

  return (
    <JarvisContext.Provider value={{
      isOpen,
      status,
      transcript,
      response,
      history,
      error,
      open:           () => setIsOpen(true),
      close:          () => { setIsOpen(false); stopListening(); },
      toggle:         () => setIsOpen(v => !v),
      startListening,
      stopListening,
      sendCommand,
    }}>
      {children}
    </JarvisContext.Provider>
  );
}
