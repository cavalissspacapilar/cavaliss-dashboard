"use client";
import { useState } from "react";
import { Search, Filter, Crown, Star, Sparkles } from "lucide-react";
import { CLIENTS } from "@/lib/data";
import { cn, getInitials, getAvatarColor, formatCurrency, isInactive } from "@/lib/utils";
import type { ClientSegment } from "@/lib/types";

const SEGMENT_STYLES: Record<ClientSegment, string> = {
  VIP: "bg-gold/15 text-gold border-gold/25",
  Regular: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Nueva: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

const SEGMENT_ICONS: Record<ClientSegment, React.ElementType> = {
  VIP: Crown,
  Regular: Star,
  Nueva: Sparkles,
};

export default function ClientsTable() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClientSegment | "Todas">("Todas");
  const [sortBy, setSortBy] = useState<"name" | "value" | "lastVisit">("value");

  const filtered = CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.lastService.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Todas" || c.segment === filter;
    return matchSearch && matchFilter;
  }).sort((a, b) => {
    if (sortBy === "value") return b.totalValue - a.totalValue;
    if (sortBy === "lastVisit") return b.lastVisit.localeCompare(a.lastVisit);
    return a.name.localeCompare(b.name);
  });

  const inactive = filtered.filter(c => isInactive(c.lastVisit)).length;

  return (
    <div className="glass-card border border-white/7 p-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-xl px-3.5 py-2.5 flex-1 min-w-[200px]">
          <Search size={14} className="text-zinc-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar clienta, servicio, teléfono..."
            className="bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none flex-1"
          />
        </div>

        <div className="flex gap-1.5">
          {(["Todas", "VIP", "Regular", "Nueva"] as const).map(seg => (
            <button
              key={seg}
              onClick={() => setFilter(seg)}
              className={cn(
                "text-xs px-3 py-2 rounded-xl transition-all duration-200 border font-medium",
                filter === seg
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300"
              )}
            >
              {seg}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="text-xs bg-white/4 border border-white/6 text-zinc-400 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-gold/20 transition-colors"
        >
          <option value="value">Valor total</option>
          <option value="lastVisit">Última visita</option>
          <option value="name">Nombre A-Z</option>
        </select>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-4 text-xs text-zinc-500">
        <span>{filtered.length} clientas</span>
        <span className="text-gold">{filtered.filter(c => c.segment === "VIP").length} VIP</span>
        <span className="text-blue-400">{filtered.filter(c => c.segment === "Regular").length} Regular</span>
        <span className="text-emerald-400">{filtered.filter(c => c.segment === "Nueva").length} Nueva</span>
        {inactive > 0 && <span className="text-red-400">{inactive} inactivas +60d</span>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {["Clienta", "Teléfono", "Último servicio", "Última visita", "Próxima cita", "Valor total", "Segmento"].map(h => (
                <th key={h} className="text-left text-xs text-zinc-600 font-medium pb-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => {
              const SegIcon = SEGMENT_ICONS[client.segment];
              const inactive60 = isInactive(client.lastVisit);
              const avatarColor = getAvatarColor(client.name);
              return (
                <tr
                  key={client.id}
                  className={cn(
                    "border-b border-white/4 hover:bg-white/3 transition-all duration-150 group",
                    inactive60 && "bg-red-500/3"
                  )}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="client-avatar shrink-0 text-xs font-bold"
                        style={{ background: avatarColor }}
                      >
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", inactive60 ? "text-red-300" : "text-zinc-200")}>
                          {client.name}
                        </p>
                        {inactive60 && (
                          <p className="text-[10px] text-red-400 font-medium">Inactiva +60 días</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-zinc-400 text-sm font-mono text-xs">{client.phone}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-zinc-400 text-sm truncate max-w-[160px]">{client.lastService}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p className={cn("text-sm", inactive60 ? "text-red-400 font-semibold" : "text-zinc-400")}>
                      {new Date(client.lastVisit + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "2-digit" })}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    {client.nextAppointment ? (
                      <p className="text-emerald-400 text-sm">
                        {new Date(client.nextAppointment + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </p>
                    ) : (
                      <p className="text-zinc-600 text-sm">—</p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-gold font-bold text-sm">{formatCurrency(client.totalValue)}</p>
                    <p className="text-zinc-600 text-xs">{client.visits} visitas</p>
                  </td>
                  <td className="py-3">
                    <span className={cn("text-xs px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 font-medium", SEGMENT_STYLES[client.segment])}>
                      <SegIcon size={10} />
                      {client.segment}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
