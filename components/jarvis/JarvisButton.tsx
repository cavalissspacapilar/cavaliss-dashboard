"use client";
import { Mic, Loader2, Volume2 } from 'lucide-react';
import { useJarvis } from './JarvisVoice';

export default function JarvisButton() {
  const { status, toggle, history, isOpen } = useJarvis();

  const active = isOpen || status !== 'idle';

  return (
    <button
      onClick={toggle}
      title="JARVIS — Asistente de IA"
      aria-label="Abrir JARVIS"
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
        ${active
          ? 'bg-gold shadow-gold-lg scale-105'
          : 'bg-gold/85 hover:bg-gold hover:shadow-gold hover:scale-105'
        }`}
    >
      {/* Icon by state */}
      {status === 'processing' ? (
        <Loader2 size={15} className="text-black animate-spin" />
      ) : status === 'speaking' ? (
        <Volume2 size={15} className="text-black animate-pulse" />
      ) : (
        <Mic size={15} className={`text-black ${status === 'listening' ? 'animate-pulse' : ''}`} />
      )}

      {/* Ping ring while listening */}
      {status === 'listening' && (
        <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping pointer-events-none" />
      )}

      {/* Badge: recent commands count (only when panel is closed) */}
      {history.length > 0 && status === 'idle' && !isOpen && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cavaliss-pink text-white text-[9px] font-bold flex items-center justify-center leading-none">
          {history.length}
        </span>
      )}
    </button>
  );
}
