"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Send, Zap, CheckCircle, Clock, Users } from "lucide-react";
import { fetchConversaciones } from "@/lib/api-client";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import EmptyState from "@/components/EmptyState";
import type { CavaConversation } from "@/lib/types";

const STATUS_STYLES = {
  activa: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  esperando: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  resuelta: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="typing-dot" style={{ animationDelay: "0ms" }} />
      <span className="typing-dot" style={{ animationDelay: "200ms" }} />
      <span className="typing-dot" style={{ animationDelay: "400ms" }} />
    </div>
  );
}

function ConversationCard({ conv, selected, onClick }: { conv: CavaConversation; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        selected ? "border-gold/30 bg-gold/6" : "border-white/5 bg-white/2 hover:bg-white/4 hover:border-white/8"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="client-avatar w-10 h-10 text-sm font-bold" style={{ background: getAvatarColor(conv.name) }}>
            {getInitials(conv.name)}
          </div>
          {conv.status === "activa" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0d0d]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-zinc-200 text-sm font-semibold truncate">{conv.name}</p>
              {conv.isHot && <span className="text-sm shrink-0">🔥</span>}
            </div>
            <p className="text-zinc-600 text-xs shrink-0">{conv.lastMessageTime}</p>
          </div>
          {conv.isTyping ? <TypingIndicator /> : (
            <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{conv.lastMessage || "Sin mensajes"}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md border", STATUS_STYLES[conv.status])}>
              {conv.status}
            </span>
            {conv.serviceInterest && (
              <span className="text-[10px] text-zinc-600 truncate max-w-[100px]">{conv.serviceInterest.split(" ")[0]}</span>
            )}
            {conv.messagesCount > 1 && (
              <span className="text-[10px] text-zinc-600">{conv.messagesCount} msgs</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationDetail({ conv }: { conv: CavaConversation | null }) {
  const [takenOver, setTakenOver] = useState(false);

  if (!conv) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-600">
        <div className="text-center">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>Selecciona una conversación</p>
        </div>
      </div>
    );
  }

  const avatarColor = getAvatarColor(conv.name);

  async function handleTakeover() {
    const next = !takenOver;
    setTakenOver(next);
    const phone = conv?.phone;
    if (next && phone) {
      try {
        await fetch("/api/conversaciones/takeover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
      } catch {}
    }
  }

  return (
    <div className="flex-1 flex flex-col border border-white/7 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="client-avatar w-9 h-9 text-sm font-bold" style={{ background: avatarColor }}>
            {getInitials(conv.name)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-zinc-200 font-semibold text-sm">{conv.name}</p>
              {conv.isHot && <span className="text-sm">🔥</span>}
            </div>
            <p className="text-zinc-500 text-xs">{conv.phone || conv.serviceInterest}</p>
          </div>
        </div>
        <button
          onClick={handleTakeover}
          className={cn(
            "text-xs px-4 py-2 rounded-xl border font-semibold transition-all duration-200",
            takenOver ? "bg-cavaliss-pink/15 text-cavaliss-pink border-cavaliss-pink/30" : "text-gold border-gold/25 hover:bg-gold/10"
          )}
        >
          {takenOver ? "✓ Control tomado" : "Tomar control"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Client's last message */}
        {conv.lastMessage && (
          <div className="flex justify-start">
            <div className="client-avatar w-7 h-7 text-xs font-bold mr-2 shrink-0 mt-auto" style={{ background: avatarColor }}>
              {getInitials(conv.name)[0]}
            </div>
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm bg-white/6 border border-white/8 text-zinc-300 rounded-tl-sm">
              <p className="leading-relaxed">{conv.lastMessage}</p>
              <p className="text-xs opacity-40 mt-1 text-right">{conv.lastMessageTime}</p>
            </div>
          </div>
        )}

        {/* Cava's last response */}
        {conv.lastResponseCava && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 bg-gold/15 border border-gold/20 text-zinc-200 text-sm rounded-tr-sm">
              <p className="leading-relaxed">{conv.lastResponseCava}</p>
              <p className="text-xs opacity-40 mt-1 text-right">Cava IA</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center ml-2 shrink-0 mt-auto">
              <span className="text-gold text-xs font-bold">C</span>
            </div>
          </div>
        )}

        {conv.isTyping && (
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 bg-gold/15 border border-gold/20 rounded-tr-sm">
              <TypingIndicator />
            </div>
            <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center ml-2 shrink-0 mt-auto">
              <span className="text-gold text-xs font-bold">C</span>
            </div>
          </div>
        )}

        {!conv.lastMessage && !conv.lastResponseCava && (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-zinc-600 text-sm">Sin mensajes disponibles</p>
          </div>
        )}
      </div>

      {takenOver && (
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-gold/30 transition-colors"
              placeholder="Escribe como Angee..."
            />
            <button className="p-2.5 rounded-xl bg-gold/15 border border-gold/25 text-gold hover:bg-gold/25 transition-all">
              <Send size={16} />
            </button>
          </div>
          <p className="text-zinc-600 text-xs mt-2 text-center">Estás controlando esta conversación. Cava IA está pausada.</p>
        </div>
      )}
    </div>
  );
}

export default function CavaPage() {
  const [conversations, setConversations] = useState<CavaConversation[]>([]);
  const [selected, setSelected] = useState<CavaConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"todas" | "activa" | "esperando" | "resuelta">("todas");

  useEffect(() => {
    fetchConversaciones()
      .then(data => {
        setConversations(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activas = conversations.filter(c => c.status === "activa").length;
  const hotLeads = conversations.filter(c => c.isHot).length;
  const resueltas = conversations.filter(c => c.status === "resuelta").length;

  const filtered = conversations.filter(c => statusFilter === "todas" || c.status === statusFilter);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Monitor Cava IA</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          {loading ? "Cargando conversaciones..." : "Centro de conversaciones de la IA de ventas de Cavaliss"}
        </p>
      </div>

      <ErrorBoundary label="Stats Cava">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Conversaciones activas", value: activas, icon: MessageSquare, color: "text-gold" },
            { label: "Leads calientes", value: hotLeads, icon: Zap, color: "text-orange-400" },
            { label: "Conversaciones resueltas", value: resueltas, icon: CheckCircle, color: "text-cavaliss-pink" },
            { label: "Tiempo de respuesta", value: "Tiempo real", icon: Clock, color: "text-blue-400" },
          ].map(k => (
            <div key={k.label} className="glass-card border border-white/7 p-5 glass-card-hover">
              <k.icon size={18} className={`${k.color} mb-3`} />
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-zinc-500 text-sm mt-1">{k.label}</p>
            </div>
          ))}
        </div>
      </ErrorBoundary>

      {hotLeads > 0 && (
        <div className="glass-card border border-orange-500/25 bg-orange-500/5 p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-orange-300 font-semibold text-sm">
              {hotLeads} lead{hotLeads > 1 ? "s calientes" : " caliente"} en conversación
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {conversations.filter(c => c.isHot).slice(0, 3).map(c => c.name.split(" ")[0]).join(", ")} — prioridad alta
            </p>
          </div>
          <Users size={18} className="text-orange-400 ml-auto shrink-0" />
        </div>
      )}

      <ErrorBoundary label="Panel de conversaciones">
        {!loading && conversations.length === 0 ? (
          <div className="glass-card border border-white/7 p-6">
            <EmptyState
              icon={MessageSquare}
              title="Sin conversaciones registradas"
              description="Las conversaciones se cargan desde la hoja 'Conversaciones' de Google Sheets."
            />
          </div>
        ) : (
          <div className="flex gap-6" style={{ height: "60vh", minHeight: 480 }}>
            <div className="w-80 shrink-0 flex flex-col gap-3">
              <div className="flex gap-1.5">
                {(["todas", "activa", "esperando", "resuelta"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-lg transition-all capitalize flex-1",
                      statusFilter === f ? "bg-gold/15 text-gold" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filtered.map(conv => (
                  <ConversationCard
                    key={conv.id}
                    conv={conv}
                    selected={selected?.id === conv.id}
                    onClick={() => setSelected(conv)}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="text-zinc-600 text-xs text-center mt-8">Sin conversaciones en este estado</p>
                )}
              </div>
            </div>
            <ConversationDetail conv={selected} />
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
