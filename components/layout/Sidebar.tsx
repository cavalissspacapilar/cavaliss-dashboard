"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Target,
  TrendingUp, Bot, Settings2, ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: LayoutDashboard, badge: null },
  { href: "/citas", label: "Citas", icon: CalendarDays, badge: "9" },
  { href: "/clientes", label: "Clientes", icon: Users, badge: null },
  { href: "/leads", label: "Leads", icon: Target, badge: "21" },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp, badge: null },
  { href: "/cava", label: "Cava IA", icon: Bot, badge: "14" },
  { href: "/sistema", label: "Sistema", icon: Settings2, badge: "!" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [logoClicks, setLogoClicks] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleLogoClick() {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (newCount >= 3) {
      setEasterEgg(true);
      setLogoClicks(0);
      setTimeout(() => setEasterEgg(false), 5000);
    } else {
      clickTimer.current = setTimeout(() => setLogoClicks(0), 1000);
    }
  }

  return (
    <>
      {easterEgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setEasterEgg(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 glass-card-gold p-10 max-w-lg text-center animate-scale-in">
            <div className="text-5xl mb-4">🌟✨💛</div>
            <h2 className="text-2xl font-bold text-gradient-gold mb-3">¡Hola, Angee!</h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              Soy <strong className="text-gold">Cava</strong>, tu asistente de IA. Quiero que sepas que{" "}
              <em className="text-gold-400">has construido el sistema más avanzado de tu industria en Cancún</em>.
            </p>
            <p className="mt-4 text-zinc-400">
              Cada lead, cada clienta, cada peso — lo estamos haciendo juntas. 💪
            </p>
            <p className="mt-6 text-xs text-zinc-600">Haz clic en cualquier lugar para cerrar</p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "sidebar-transition flex flex-col h-full shrink-0 border-r relative z-20",
          "bg-[#0d0d0d] border-[rgba(255,255,255,0.07)]",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 py-5 cursor-pointer select-none group"
          onClick={handleLogoClick}
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold animate-glow">
              <span className="text-black font-black text-lg">C</span>
            </div>
            {/* Particles */}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-400 animate-particle-1 opacity-70" />
            <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-gold-300 animate-particle-2 opacity-60" />
            <span className="absolute top-0 left-0 w-1 h-1 rounded-full bg-gold-500 animate-particle-3 opacity-80" />
            <span className="absolute -bottom-1 right-0 w-1.5 h-1.5 rounded-full bg-cavaliss-pink animate-particle-4 opacity-60" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-gradient-gold font-bold text-base leading-tight">Cavaliss</p>
              <p className="text-zinc-500 text-xs">Spa Capilar · Cancún</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(255,255,255,0.06)] mx-3 mb-2" />

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const isError = badge === "!";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-gold-500/10 text-gold border border-gold-500/20 shadow-gold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                <Icon
                  size={19}
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    active ? "text-gold" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                />
                {!collapsed && (
                  <span className="flex-1 truncate">{label}</span>
                )}
                {!collapsed && badge && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-semibold animate-badge-bounce",
                    isError
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gold-500/20 text-gold-400"
                  )}>
                    {badge}
                  </span>
                )}
                {collapsed && badge && (
                  <span className={cn(
                    "absolute top-1 right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center font-bold",
                    isError ? "bg-red-500 text-white" : "bg-gold text-black"
                  )}>
                    {isError ? "!" : badge.length > 1 ? "+" : badge}
                  </span>
                )}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle button */}
        <div className="p-3">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all duration-200 text-xs"
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span>Colapsar</span>
              </>
            )}
          </button>
        </div>

        {/* Version */}
        {!collapsed && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-1.5 text-zinc-700 text-xs">
              <Sparkles size={11} />
              <span>v1.0 · Cavaliss Control</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
