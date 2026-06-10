"use client";
import { useState, useEffect } from "react";
import { Bell, Download, Search } from "lucide-react";
import { formatDateSpanish, formatTimeSpanish } from "@/lib/utils";
import JarvisButton from "@/components/jarvis/JarvisButton";

interface HeaderProps {
  collapsed: boolean;
}

export default function Header({ collapsed: _collapsed }: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now ? formatDateSpanish(now).replace(/^\w/, (c) => c.toUpperCase()) : "";
  const timeStr = now ? formatTimeSpanish(now) : "";

  return (
    <header className="shrink-0 h-16 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.8)] backdrop-blur-xl z-10">
      {/* Left: search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-xl px-3.5 py-2 text-sm text-zinc-500 hover:border-gold/20 transition-colors w-56 cursor-text">
          <Search size={14} />
          <span>Buscar…</span>
        </div>
      </div>

      {/* Center: clock */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center select-none">
        <p className="text-gold font-semibold text-lg tabular-nums leading-tight tracking-tight">
          {timeStr}
        </p>
        <p className="text-zinc-500 text-xs capitalize leading-none">{dateStr}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* JARVIS voice assistant */}
        <JarvisButton />

        <button
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-gold border border-white/6 hover:border-gold/25 rounded-xl px-3 py-2 transition-all duration-200"
          title="Exportar reporte PDF"
          onClick={() => alert("Generando reporte PDF de Cavaliss... (conectar a endpoint real)")}
        >
          <Download size={14} />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-gold hover:bg-white/5 transition-all duration-200"
          >
            <Bell size={18} />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-72 glass-card border-[rgba(212,160,23,0.15)] shadow-gold-lg z-50 animate-slide-up">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-zinc-200">Notificaciones</h3>
              </div>
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto mb-3 text-zinc-700" />
                <p className="text-zinc-500 text-sm">Sin notificaciones nuevas</p>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-cavaliss-pink to-pink-800 flex items-center justify-center text-xs font-bold text-white shadow-pink cursor-pointer"
          title="Angee"
        >
          A
        </div>
      </div>
    </header>
  );
}
