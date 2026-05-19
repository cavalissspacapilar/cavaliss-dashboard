"use client";
import { useState } from "react";
import { LEADS } from "@/lib/data";
import { cn, getTemperatureEmoji, formatCurrency, getAvatarColor, getInitials } from "@/lib/utils";
import type { Lead, LeadStatus, LeadSource } from "@/lib/types";
import { MessageCircle, Clock, Tag } from "lucide-react";

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: "Nuevo", label: "Nuevo", color: "border-zinc-600 bg-zinc-600/8" },
  { id: "En conversación", label: "En conversación", color: "border-blue-500/40 bg-blue-500/5" },
  { id: "Lead caliente", label: "Lead caliente", color: "border-orange-500/40 bg-orange-500/5" },
  { id: "Reserva lista", label: "Reserva lista", color: "border-yellow-500/40 bg-yellow-500/5" },
  { id: "Convertido", label: "Convertido ✓", color: "border-emerald-500/40 bg-emerald-500/5" },
  { id: "Perdido", label: "Perdido", color: "border-red-500/30 bg-red-500/5" },
];

const SOURCE_COLORS: Record<LeadSource, string> = {
  "Meta Ads": "text-blue-400 bg-blue-500/10",
  TikTok: "text-pink-400 bg-pink-500/10",
  Instagram: "text-purple-400 bg-purple-500/10",
  "WhatsApp directo": "text-emerald-400 bg-emerald-500/10",
};

function LeadCard({ lead, onDragStart }: { lead: Lead; onDragStart: (id: number) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="glass-card border border-white/6 p-3.5 cursor-grab active:cursor-grabbing glass-card-hover group"
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className="client-avatar w-8 h-8 text-[11px] shrink-0"
          style={{ background: getAvatarColor(lead.name) }}
        >
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-200 text-sm font-semibold truncate">{lead.name}</p>
          <p className="text-zinc-500 text-xs font-mono">{lead.phone.slice(-8)}</p>
        </div>
        <span className="text-lg shrink-0" title={lead.temperature}>
          {getTemperatureEmoji(lead.temperature)}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Tag size={10} className="text-zinc-600" />
          <p className="text-zinc-400 text-xs truncate">{lead.serviceInterest}</p>
        </div>
        <p className="text-xs text-zinc-500 italic line-clamp-1 leading-snug">&ldquo;{lead.lastMessage}&rdquo;</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium", SOURCE_COLORS[lead.source])}>
            {lead.source.split(" ")[0]}
          </span>
          <span className="text-[10px] text-zinc-600 flex items-center gap-1">
            <Clock size={9} /> {lead.daysInPipeline}d
          </span>
        </div>
        <span className="text-gold text-xs font-bold">{formatCurrency(lead.estimatedValue)}</span>
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [leads, setLeads] = useState(LEADS);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);

  function handleDrop(status: LeadStatus) {
    if (dragging == null) return;
    setLeads(prev => prev.map(l => l.id === dragging ? { ...l, status } : l));
    setDragging(null);
    setDragOver(null);
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-[900px]">
        {COLUMNS.map(col => {
          const colLeads = leads.filter(l => l.status === col.id);
          const isOver = dragOver === col.id;
          return (
            <div
              key={col.id}
              className="flex-1 min-w-[160px]"
              onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.id)}
            >
              <div className={cn(
                "rounded-xl border p-3 transition-all duration-200 kanban-column",
                col.color,
                isOver && "drag-over"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-zinc-300">{col.label}</p>
                  <span className="text-xs bg-white/8 text-zinc-400 rounded-full px-2 py-0.5 font-bold">
                    {colLeads.length}
                  </span>
                </div>
                <div className="space-y-2.5 min-h-[80px]">
                  {colLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={setDragging} />
                  ))}
                  {colLeads.length === 0 && (
                    <div className={cn("border-2 border-dashed rounded-xl h-16 flex items-center justify-center text-zinc-700 text-xs transition-colors", isOver && "border-gold/30 text-gold/50")}>
                      {isOver ? "Soltar aquí" : "Vacío"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
