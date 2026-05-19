import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString("es-MX")}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#D4A017", "#C2185B", "#7B1FA2", "#1565C0", "#00695C",
  "#E64A19", "#2E7D32", "#AD1457", "#6A1B9A", "#0277BD",
  "#00838F", "#F57F17", "#4527A0", "#283593", "#1B5E20",
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isInactive(lastVisit: string, days = 60): boolean {
  return getDaysAgo(lastVisit) >= days;
}

export function formatDateSpanish(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatTimeSpanish(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function getTemperatureEmoji(temp: string): string {
  if (temp === "caliente") return "🔥";
  if (temp === "tibio") return "🌡️";
  return "❄️";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    confirmada: "text-emerald-400 bg-emerald-400/10",
    pendiente: "text-amber-400 bg-amber-400/10",
    completada: "text-blue-400 bg-blue-400/10",
    cancelada: "text-red-400 bg-red-400/10",
    activo: "text-emerald-400",
    error: "text-red-400",
    advertencia: "text-amber-400",
    VIP: "text-gold-400 bg-gold-500/15",
    Regular: "text-blue-400 bg-blue-500/10",
    Nueva: "text-emerald-400 bg-emerald-500/10",
  };
  return map[status] ?? "text-zinc-400 bg-zinc-400/10";
}

export function calcHealthScore(params: {
  occupancy: number;
  conversion: number;
  retention: number;
  revenueVsTarget: number;
}): number {
  const { occupancy, conversion, retention, revenueVsTarget } = params;
  return Math.round(
    occupancy * 0.3 + conversion * 0.25 + retention * 0.25 + revenueVsTarget * 0.2
  );
}
