// iq-types.ts — Shared TypeScript interfaces for Cavaliss IQ module
// No server-only imports — safe to use in both route handlers and client components

export interface IQDashboardData {
  total_clientes: number;
  hair_score_promedio: number;
  mejorando: number;
  en_riesgo: number;
  datos_completos: number;
}

export interface IQClienteSummary {
  id: string;
  client_profile_id: string;
  nombre: string;
  score_general_capilar: number;
  riesgo_abandono: string;
  objetivo_capilar: string;
  tendencia: string;
  fecha_ultimo_diagnostico: string;
}

export interface PerfilCapilarV2 {
  id: string;
  client_profile_id: string;
  nombre: string;
  score_general_capilar: number;
  riesgo_abandono: string;
  objetivo_capilar: string;
  tendencia: string;
  fecha_ultimo_diagnostico: string;
  datos_completos: boolean;
  // Seven diagnostic scores (0–100)
  score_dano: number;
  score_hidratacion: number;
  score_frizz: number;
  score_rotura: number;
  score_caida: number;
  score_brillo: number;
  score_elasticidad: number;
  // Optional before/after photos
  foto_antes_url?: string;
  foto_despues_url?: string;
}

export interface HistorialCapilarSnapshot {
  id: string;
  client_profile_id: string;
  fecha_snapshot: string;
  score_general: number;
  tendencia: string;
  servicio_aplicado: string;
}

export interface IQClienteDetail {
  perfil: PerfilCapilarV2 | null;
  snapshots: HistorialCapilarSnapshot[];
}
