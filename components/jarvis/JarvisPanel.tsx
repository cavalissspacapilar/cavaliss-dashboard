"use client";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Mic, Loader2, Volume2, Zap, Clock, Send, MicOff } from 'lucide-react';
import { useJarvis } from './JarvisVoice';
import type { JarvisStatus } from './JarvisVoice';

// ── Voice bars ─────────────────────────────────────────────────────────────

function VoiceBars({ active }: { active: boolean }) {
  // Each bar has its own target height and animation speed
  const bars = [
    { h: 14, dur: 0.40 }, { h: 26, dur: 0.55 }, { h: 18, dur: 0.48 },
    { h: 30, dur: 0.62 }, { h: 16, dur: 0.44 }, { h: 24, dur: 0.57 }, { h: 12, dur: 0.38 },
  ];

  return (
    <div className="flex items-end gap-[3px]" style={{ height: 32 }}>
      {bars.map(({ h, dur }, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gold"
          style={{
            height: 32,
            transformOrigin: 'bottom',
            transform: active ? 'scaleY(1)' : 'scaleY(0.13)',
            transition: `transform ${dur}s ease`,
            animation: active
              ? `jarvisVoiceBar ${dur}s ease-in-out ${i * 0.06}s infinite alternate`
              : 'none',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
}

// ── Status label ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<JarvisStatus, string> = {
  idle:       'Listo',
  listening:  'Escuchando…',
  processing: 'Procesando…',
  speaking:   'Respondiendo…',
  error:      'Error',
};

const STATUS_COLORS: Record<JarvisStatus, string> = {
  idle:       'bg-zinc-600',
  listening:  'bg-gold animate-pulse',
  processing: 'bg-blue-400 animate-pulse',
  speaking:   'bg-emerald-400 animate-pulse',
  error:      'bg-red-500',
};

// ── Time formatter ─────────────────────────────────────────────────────────

function fmtTime(d: Date) {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// ── Panel ──────────────────────────────────────────────────────────────────

export default function JarvisPanel() {
  const {
    isOpen, close,
    status, transcript, response, history, error,
    startListening, stopListening, sendCommand,
  } = useJarvis();

  const [textInput, setTextInput] = useState('');
  const responseRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest response
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [response]);

  const handleMic = () => {
    if (status === 'listening') stopListening();
    else if (status === 'idle' || status === 'error') startListening();
  };

  const handleTextSend = () => {
    const cmd = textInput.trim();
    if (!cmd || status === 'processing' || status === 'speaking') return;
    sendCommand(cmd);
    setTextInput('');
  };

  const busy = status === 'processing' || status === 'speaking';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────── */}
          <motion.div
            key="jarvis-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40"
            onClick={close}
          />

          {/* ── Panel ─────────────────────────────────────────────────── */}
          <motion.aside
            key="jarvis-panel"
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
            className="fixed right-0 top-0 h-full w-[380px] z-50 flex flex-col
              bg-[#0a0a0a] border-l border-[rgba(212,160,23,0.15)] shadow-[−4px_0_40px_rgba(0,0,0,0.6)]"
          >

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shadow-gold">
                  <Zap size={14} className="text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none tracking-wide">JARVIS</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-none">Cavaliss IA · Operativo</p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                aria-label="Cerrar JARVIS"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">

              {/* Status row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all ${STATUS_COLORS[status]}`} />
                  <span className="text-xs text-zinc-400">{STATUS_LABELS[status]}</span>
                </div>
                <VoiceBars active={status === 'listening' || status === 'speaking'} />
              </div>

              {/* Live transcript */}
              {(transcript || status === 'listening') && (
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Tú</p>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    {transcript || (
                      <span className="text-zinc-600 italic flex items-center gap-1.5">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="rounded-xl bg-red-500/[0.08] border border-red-500/20 px-4 py-3 flex items-start gap-2">
                  <MicOff size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400 leading-snug">{error}</p>
                </div>
              )}

              {/* Response */}
              {(response || status === 'processing') && (
                <div ref={responseRef} className="rounded-xl bg-[rgba(212,160,23,0.05)] border border-[rgba(212,160,23,0.12)] px-4 py-3">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                      <Zap size={8} className="text-black" />
                    </div>
                    <p className="text-[10px] text-gold/60 uppercase tracking-wider">JARVIS</p>
                  </div>

                  {status === 'processing' ? (
                    <div className="flex items-center gap-2 text-zinc-500 py-0.5">
                      <Loader2 size={13} className="animate-spin shrink-0" />
                      <span className="text-sm">Consultando datos en tiempo real…</span>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">{response}</p>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!transcript && !response && status === 'idle' && !error && history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gold/[0.08] border border-gold/15 flex items-center justify-center mb-4">
                    <Mic size={24} className="text-gold/50" />
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">¿En qué puedo ayudarte?</p>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Pregúntame por citas, clientas,<br />
                    métricas o genera protocolos
                  </p>
                  <div className="mt-5 space-y-1.5 text-left w-full max-w-[260px]">
                    {[
                      '¿Cuántas citas hay hoy?',
                      '¿Cómo está Karen?',
                      '¿Cómo va el negocio esta semana?',
                      'Genera protocolo para Nicol',
                    ].map(hint => (
                      <button
                        key={hint}
                        onClick={() => sendCommand(hint)}
                        className="w-full text-left text-xs text-zinc-500 hover:text-gold border border-white/[0.05] hover:border-gold/20
                          rounded-lg px-3 py-2 transition-all hover:bg-gold/5"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Command history */}
              {history.length > 0 && (
                <div className="border-t border-white/[0.05] pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={11} className="text-zinc-600" />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Historial</span>
                  </div>
                  <div className="space-y-2">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="rounded-xl bg-white/[0.02] border border-white/[0.05] px-3 py-2.5
                          hover:bg-white/[0.04] transition-colors cursor-pointer"
                        onClick={() => sendCommand(item.command)}
                        title="Repetir consulta"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs text-zinc-300 leading-snug flex-1">{item.command}</p>
                          <span className="text-[10px] text-zinc-600 shrink-0">{fmtTime(item.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{item.response}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.05] space-y-3 shrink-0">

              {/* Text input fallback */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                  placeholder="Escribe un comando…"
                  disabled={busy}
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2
                    text-sm text-zinc-200 placeholder:text-zinc-600
                    focus:outline-none focus:border-gold/30 focus:bg-white/[0.05]
                    transition-all disabled:opacity-40"
                />
                <button
                  onClick={handleTextSend}
                  disabled={!textInput.trim() || busy}
                  className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center
                    text-gold hover:bg-gold/20 hover:border-gold/30 transition-all
                    disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Enviar"
                >
                  <Send size={14} />
                </button>
              </div>

              {/* Mic button */}
              <button
                onClick={handleMic}
                disabled={busy}
                className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2.5
                  font-medium text-sm transition-all duration-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${status === 'listening'
                    ? 'bg-gold text-black shadow-[0_0_28px_rgba(212,160,23,0.5)]'
                    : 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/15 hover:border-gold/30'
                  }`}
              >
                {status === 'processing' && <><Loader2 size={18} className="animate-spin" /><span>Procesando…</span></>}
                {status === 'speaking'   && <><Volume2 size={18} /><span>Respondiendo…</span></>}
                {status === 'listening'  && <><span className="w-3 h-3 rounded-sm bg-black" /><span>Detener escucha</span></>}
                {(status === 'idle' || status === 'error') && <><Mic size={18} /><span>Hablar con JARVIS</span></>}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
