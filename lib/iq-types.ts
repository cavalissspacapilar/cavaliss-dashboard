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
  telefono: string;
  score_general_capilar: number;
  riesgo_abandono: string;
  objetivo_capilar: string;
  tendencia: string;
  fecha_ultimo_diagnostico: string;
  // Raw 0-10 diagnostic values (null → 5 neutral)
  nivel_daño_actual: number;
  hidratacion_actual: number;
  frizz_actual: number;
  rotura_actual: number;
  caida_actual: number;
  brillo_actual: number;
  elasticidad_actual: number;
  // Problem flags
  problema_alopecia: boolean;
  problema_dermatitis: boolean;
  problema_caspa: boolean;
  problema_seborrea: boolean;
  // Treatment info
  sesiones_recomendadas: string;
  procedimiento_a_realizar: string;
  // Digital signature
  firma_cliente_timestamp?: string;
  firma_especialista_nombre?: string;
  // CRM fields
  visit_count: number;
  total_spent: number;
  loyalty_tier: string;
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
  // Raw 0-10 diagnostic values (null → 5 neutral)
  nivel_daño_actual: number;
  hidratacion_actual: number;
  frizz_actual: number;
  rotura_actual: number;
  caida_actual: number;
  brillo_actual: number;
  elasticidad_actual: number;
  // Legacy 0-100 scores (kept for backward compat if present)
  score_dano: number;
  score_hidratacion: number;
  score_frizz: number;
  score_rotura: number;
  score_caida: number;
  score_brillo: number;
  score_elasticidad: number;
  // Problem flags
  problema_alopecia: boolean;
  problema_dermatitis: boolean;
  problema_caspa: boolean;
  problema_seborrea: boolean;
  // Treatment info
  sesiones_recomendadas: string;
  procedimiento_a_realizar: string;
  // Optional before/after photos
  foto_antes_url?: string;
  foto_despues_url?: string;
  // Digital signature
  firma_cliente_timestamp?: string;
  firma_especialista_nombre?: string;
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
