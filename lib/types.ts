export type ServiceName =
  | "Diagnóstico Capilar"
  | "Exfoliación Capilar"
  | "Nutrición Capilar"
  | "Ritual Detox"
  | "Reconstrucción Molecular"
  | "Luminoplastia"
  | "VIP Curly Experience"
  | "Electroestimulación"
  | "Mesoterapia con Exosomas";

export type AppointmentStatus = "confirmada" | "pendiente" | "completada" | "cancelada";
export type ClientSegment = "VIP" | "Regular" | "Nueva";
export type LeadStatus = "Nuevo" | "En conversación" | "Lead caliente" | "Reserva lista" | "Convertido" | "Perdido";
export type LeadSource = "Meta Ads" | "TikTok" | "Instagram" | "WhatsApp directo";
export type LeadTemperature = "caliente" | "tibio" | "frío";
export type WorkflowStatusType = "activo" | "error" | "advertencia";

export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastService: ServiceName;
  lastVisit: string;
  nextAppointment?: string;
  totalValue: number;
  segment: ClientSegment;
  visits: number;
}

export interface Appointment {
  id: number;
  clientName: string;
  service: ServiceName;
  time: string;
  duration: number;
  status: AppointmentStatus;
  depositPaid: boolean;
  depositAmount: number;
  price: number;
  date: string;
  clientPhone: string;
  notes?: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  serviceInterest: ServiceName;
  source: LeadSource;
  status: LeadStatus;
  temperature: LeadTemperature;
  daysInPipeline: number;
  lastMessage: string;
  lastMessageTime: string;
  estimatedValue: number;
  // Extended Sheets fields
  leadId?: string;
  entryDate?: string;
  conversionDate?: string;
  utmSource?: string;
  campaign?: string;
  adSet?: string;
  ad?: string;
}

export interface RevenueDataPoint {
  date: string;
  amount: number;
  appointments: number;
  [key: string]: number | string;
}

export interface CavaConversation {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  lastResponseCava?: string;
  lastMessageTime: string;
  serviceInterest: ServiceName;
  status: "activa" | "esperando" | "resuelta";
  isTyping?: boolean;
  isHot?: boolean;
  messagesCount: number;
  responseTime: number;
}

export interface Workflow {
  id: number;
  name: string;
  description: string;
  status: WorkflowStatusType;
  lastRun: string;
  nextRun?: string;
  executionsToday: number;
  successRate: number;
  monthlyCost: number;
  lastError?: string;
}

export interface ActivityItem {
  id: number;
  type: "reserva" | "pago" | "mensaje" | "alerta" | "lead" | "completada";
  description: string;
  time: string;
  amount?: number;
  clientName?: string;
  isNew?: boolean;
}

export interface ServiceData {
  name: ServiceName;
  price: number;
  duration: number;
  color: string;
  colorHex: string;
}
