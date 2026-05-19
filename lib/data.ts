import type {
  Client,
  Appointment,
  Lead,
  RevenueDataPoint,
  CavaConversation,
  Workflow,
  ActivityItem,
  ServiceData,
} from "./types";

export const SERVICES: ServiceData[] = [
  { name: "Diagnóstico Capilar", price: 600, duration: 60, color: "bg-sky-500", colorHex: "#0EA5E9" },
  { name: "Exfoliación Capilar", price: 1200, duration: 75, color: "bg-emerald-500", colorHex: "#10B981" },
  { name: "Nutrición Capilar", price: 1500, duration: 90, color: "bg-violet-500", colorHex: "#8B5CF6" },
  { name: "Ritual Detox", price: 1800, duration: 90, color: "bg-teal-500", colorHex: "#14B8A6" },
  { name: "Reconstrucción Molecular", price: 2400, duration: 120, color: "bg-blue-500", colorHex: "#3B82F6" },
  { name: "Luminoplastia", price: 3000, duration: 120, color: "bg-pink-500", colorHex: "#EC4899" },
  { name: "VIP Curly Experience", price: 3600, duration: 150, color: "bg-purple-500", colorHex: "#A855F7" },
  { name: "Electroestimulación", price: 1500, duration: 60, color: "bg-orange-500", colorHex: "#F97316" },
  { name: "Mesoterapia con Exosomas", price: 2800, duration: 90, color: "bg-rose-500", colorHex: "#F43F5E" },
];

export const CLIENTS: Client[] = [
  { id: 1, name: "María García López", phone: "+52 998 123 4501", email: "maria.garcia@gmail.com", lastService: "Luminoplastia", lastVisit: "2026-05-10", nextAppointment: "2026-05-26", totalValue: 12400, segment: "VIP", visits: 9 },
  { id: 2, name: "Ana Martínez Rodríguez", phone: "+52 998 123 4502", email: "ana.martinez@gmail.com", lastService: "VIP Curly Experience", lastVisit: "2026-05-08", nextAppointment: "2026-05-22", totalValue: 18600, segment: "VIP", visits: 14 },
  { id: 3, name: "Carmen Hernández Cruz", phone: "+52 998 123 4503", email: "carmen.hc@gmail.com", lastService: "Nutrición Capilar", lastVisit: "2026-05-12", totalValue: 4500, segment: "Regular", visits: 3 },
  { id: 4, name: "Rosa López González", phone: "+52 998 123 4504", email: "rosa.lopez@hotmail.com", lastService: "Diagnóstico Capilar", lastVisit: "2026-05-01", nextAppointment: "2026-05-28", totalValue: 600, segment: "Nueva", visits: 1 },
  { id: 5, name: "Patricia Torres Díaz", phone: "+52 998 123 4505", email: "pato.torres@gmail.com", lastService: "Reconstrucción Molecular", lastVisit: "2026-04-20", totalValue: 9600, segment: "VIP", visits: 7 },
  { id: 6, name: "Gabriela Ramírez Flores", phone: "+52 998 123 4506", email: "gaby.ramirez@gmail.com", lastService: "Mesoterapia con Exosomas", lastVisit: "2026-05-15", nextAppointment: "2026-05-29", totalValue: 14200, segment: "VIP", visits: 8 },
  { id: 7, name: "Sofía Castro Morales", phone: "+52 998 123 4507", email: "sofia.castro@icloud.com", lastService: "Exfoliación Capilar", lastVisit: "2026-03-10", totalValue: 3600, segment: "Regular", visits: 3 },
  { id: 8, name: "Isabel Vega Ruiz", phone: "+52 998 123 4508", email: "isa.vega@gmail.com", lastService: "Ritual Detox", lastVisit: "2026-05-05", nextAppointment: "2026-05-24", totalValue: 7200, segment: "Regular", visits: 5 },
  { id: 9, name: "Elena Mendoza Jiménez", phone: "+52 998 123 4509", email: "elena.mj@gmail.com", lastService: "Luminoplastia", lastVisit: "2026-05-14", nextAppointment: "2026-06-01", totalValue: 21000, segment: "VIP", visits: 12 },
  { id: 10, name: "Valentina Ortiz Reyes", phone: "+52 998 123 4510", email: "vale.ortiz@gmail.com", lastService: "Diagnóstico Capilar", lastVisit: "2026-05-16", totalValue: 1200, segment: "Nueva", visits: 2 },
  { id: 11, name: "Fernanda Núñez Vargas", phone: "+52 998 123 4511", email: "fer.nunez@hotmail.com", lastService: "Electroestimulación", lastVisit: "2026-05-11", nextAppointment: "2026-05-27", totalValue: 6000, segment: "Regular", visits: 4 },
  { id: 12, name: "Alejandra Gutiérrez Lara", phone: "+52 998 123 4512", email: "ale.gl@gmail.com", lastService: "VIP Curly Experience", lastVisit: "2026-04-28", totalValue: 28800, segment: "VIP", visits: 18 },
  { id: 13, name: "Daniela Moreno Castillo", phone: "+52 998 123 4513", email: "dany.moreno@gmail.com", lastService: "Nutrición Capilar", lastVisit: "2026-02-14", totalValue: 4500, segment: "Regular", visits: 3 },
  { id: 14, name: "Andrea Ramos Peña", phone: "+52 998 123 4514", email: "andrea.rp@gmail.com", lastService: "Exfoliación Capilar", lastVisit: "2026-05-17", totalValue: 2400, segment: "Nueva", visits: 2 },
  { id: 15, name: "Claudia Fuentes Salinas", phone: "+52 998 123 4515", email: "clau.fs@icloud.com", lastService: "Mesoterapia con Exosomas", lastVisit: "2026-05-09", nextAppointment: "2026-05-30", totalValue: 16800, segment: "VIP", visits: 10 },
  { id: 16, name: "Mariana Herrera Aguilar", phone: "+52 998 123 4516", email: "mari.ha@gmail.com", lastService: "Ritual Detox", lastVisit: "2026-04-05", totalValue: 5400, segment: "Regular", visits: 4 },
  { id: 17, name: "Diana González Ponce", phone: "+52 998 123 4517", email: "diana.gp@gmail.com", lastService: "Luminoplastia", lastVisit: "2026-05-13", nextAppointment: "2026-05-25", totalValue: 9000, segment: "VIP", visits: 6 },
  { id: 18, name: "Natalia Sánchez Torres", phone: "+52 998 123 4518", email: "nata.st@gmail.com", lastService: "Diagnóstico Capilar", lastVisit: "2026-05-18", totalValue: 600, segment: "Nueva", visits: 1 },
  { id: 19, name: "Karla Jiménez Medina", phone: "+52 998 123 4519", email: "karla.jm@hotmail.com", lastService: "Electroestimulación", lastVisit: "2026-01-20", totalValue: 3000, segment: "Regular", visits: 2 },
  { id: 20, name: "Laura Reyes Campos", phone: "+52 998 123 4520", email: "laura.rc@gmail.com", lastService: "Reconstrucción Molecular", lastVisit: "2026-05-07", nextAppointment: "2026-05-29", totalValue: 12000, segment: "VIP", visits: 8 },
  { id: 21, name: "Verónica Cruz Espinoza", phone: "+52 998 123 4521", email: "vero.ce@gmail.com", lastService: "Nutrición Capilar", lastVisit: "2026-03-28", totalValue: 3000, segment: "Regular", visits: 2 },
  { id: 22, name: "Brenda Álvarez Mata", phone: "+52 998 123 4522", email: "brenda.am@gmail.com", lastService: "VIP Curly Experience", lastVisit: "2026-05-15", nextAppointment: "2026-06-02", totalValue: 22400, segment: "VIP", visits: 11 },
  { id: 23, name: "Lorena Padilla Ríos", phone: "+52 998 123 4523", email: "lorena.pr@icloud.com", lastService: "Exfoliación Capilar", lastVisit: "2026-05-03", totalValue: 2400, segment: "Nueva", visits: 2 },
  { id: 24, name: "Paola Vargas Soto", phone: "+52 998 123 4524", email: "paola.vs@gmail.com", lastService: "Ritual Detox", lastVisit: "2026-04-10", totalValue: 7200, segment: "Regular", visits: 5 },
  { id: 25, name: "Mónica Ávila Paredes", phone: "+52 998 123 4525", email: "monica.ap@gmail.com", lastService: "Mesoterapia con Exosomas", lastVisit: "2026-02-01", totalValue: 5600, segment: "Regular", visits: 4 },
  { id: 26, name: "Esther Blanco Molina", phone: "+52 998 123 4526", email: "esther.bm@hotmail.com", lastService: "Luminoplastia", lastVisit: "2026-05-06", nextAppointment: "2026-05-23", totalValue: 15000, segment: "VIP", visits: 9 },
  { id: 27, name: "Sandra Fuentes Ibáñez", phone: "+52 998 123 4527", email: "sandra.fi@gmail.com", lastService: "Diagnóstico Capilar", lastVisit: "2026-05-19", totalValue: 600, segment: "Nueva", visits: 1 },
  { id: 28, name: "Rocío Pedraza Luna", phone: "+52 998 123 4528", email: "rocio.pl@gmail.com", lastService: "Electroestimulación", lastVisit: "2026-03-15", totalValue: 4500, segment: "Regular", visits: 3 },
  { id: 29, name: "Liliana Quiróz Reina", phone: "+52 998 123 4529", email: "lili.qr@gmail.com", lastService: "Reconstrucción Molecular", lastVisit: "2026-05-04", nextAppointment: "2026-05-28", totalValue: 9600, segment: "VIP", visits: 6 },
  { id: 30, name: "Adriana Montes Fuerte", phone: "+52 998 123 4530", email: "adri.mf@icloud.com", lastService: "VIP Curly Experience", lastVisit: "2026-01-08", totalValue: 10800, segment: "VIP", visits: 7 },
  { id: 31, name: "Beatriz Serna Cano", phone: "+52 998 123 4531", email: "bea.sc@gmail.com", lastService: "Nutrición Capilar", lastVisit: "2026-05-12", totalValue: 3000, segment: "Regular", visits: 2 },
  { id: 32, name: "Catalina Olvera Vidal", phone: "+52 998 123 4532", email: "cata.ov@gmail.com", lastService: "Exfoliación Capilar", lastVisit: "2026-04-22", totalValue: 2400, segment: "Regular", visits: 2 },
  { id: 33, name: "Dolores Ibarra Chávez", phone: "+52 998 123 4533", email: "lola.ic@hotmail.com", lastService: "Ritual Detox", lastVisit: "2026-02-20", totalValue: 3600, segment: "Regular", visits: 3 },
  { id: 34, name: "Eva Merino Ángeles", phone: "+52 998 123 4534", email: "eva.ma@gmail.com", lastService: "Diagnóstico Capilar", lastVisit: "2026-05-18", totalValue: 1200, segment: "Nueva", visits: 2 },
  { id: 35, name: "Fabiola Tovar Espinosa", phone: "+52 998 123 4535", email: "faby.te@gmail.com", lastService: "Mesoterapia con Exosomas", lastVisit: "2026-05-10", nextAppointment: "2026-06-05", totalValue: 19600, segment: "VIP", visits: 13 },
];

export const APPOINTMENTS: Appointment[] = [
  { id: 1, clientName: "Elena Mendoza Jiménez", service: "Luminoplastia", time: "09:00", duration: 120, status: "confirmada", depositPaid: true, depositAmount: 1000, price: 3000, date: "2026-05-19", clientPhone: "+52 998 123 4509" },
  { id: 2, clientName: "Fernanda Núñez Vargas", service: "Electroestimulación", time: "09:30", duration: 60, status: "confirmada", depositPaid: true, depositAmount: 500, price: 1500, date: "2026-05-19", clientPhone: "+52 998 123 4511" },
  { id: 3, clientName: "Natalia Sánchez Torres", service: "Diagnóstico Capilar", time: "11:00", duration: 60, status: "pendiente", depositPaid: false, depositAmount: 0, price: 600, date: "2026-05-19", clientPhone: "+52 998 123 4518" },
  { id: 4, clientName: "Diana González Ponce", service: "Exfoliación Capilar", time: "12:00", duration: 75, status: "confirmada", depositPaid: true, depositAmount: 600, price: 1200, date: "2026-05-19", clientPhone: "+52 998 123 4517" },
  { id: 5, clientName: "Gabriela Ramírez Flores", service: "Mesoterapia con Exosomas", time: "13:30", duration: 90, status: "confirmada", depositPaid: true, depositAmount: 1000, price: 2800, date: "2026-05-19", clientPhone: "+52 998 123 4506" },
  { id: 6, clientName: "Sandra Fuentes Ibáñez", service: "Diagnóstico Capilar", time: "14:00", duration: 60, status: "confirmada", depositPaid: false, depositAmount: 0, price: 600, date: "2026-05-19", clientPhone: "+52 998 123 4527" },
  { id: 7, clientName: "Laura Reyes Campos", service: "Reconstrucción Molecular", time: "15:00", duration: 120, status: "confirmada", depositPaid: true, depositAmount: 1200, price: 2400, date: "2026-05-19", clientPhone: "+52 998 123 4520" },
  { id: 8, clientName: "Andrea Ramos Peña", service: "Exfoliación Capilar", time: "16:30", duration: 75, status: "pendiente", depositPaid: false, depositAmount: 0, price: 1200, date: "2026-05-19", clientPhone: "+52 998 123 4514" },
  { id: 9, clientName: "Beatriz Serna Cano", service: "Nutrición Capilar", time: "17:30", duration: 90, status: "confirmada", depositPaid: true, depositAmount: 750, price: 1500, date: "2026-05-19", clientPhone: "+52 998 123 4531" },

  { id: 10, clientName: "María García López", service: "Luminoplastia", time: "09:00", duration: 120, status: "completada", depositPaid: true, depositAmount: 1000, price: 3000, date: "2026-05-18", clientPhone: "+52 998 123 4501" },
  { id: 11, clientName: "Claudia Fuentes Salinas", service: "Mesoterapia con Exosomas", time: "11:00", duration: 90, status: "completada", depositPaid: true, depositAmount: 1000, price: 2800, date: "2026-05-18", clientPhone: "+52 998 123 4515" },
  { id: 12, clientName: "Isabel Vega Ruiz", service: "Ritual Detox", time: "13:00", duration: 90, status: "completada", depositPaid: true, depositAmount: 900, price: 1800, date: "2026-05-18", clientPhone: "+52 998 123 4508" },
  { id: 13, clientName: "Valentina Ortiz Reyes", service: "Exfoliación Capilar", time: "15:00", duration: 75, status: "completada", depositPaid: true, depositAmount: 600, price: 1200, date: "2026-05-18", clientPhone: "+52 998 123 4510" },
  { id: 14, clientName: "Eva Merino Ángeles", service: "Diagnóstico Capilar", time: "17:00", duration: 60, status: "completada", depositPaid: false, depositAmount: 0, price: 600, date: "2026-05-18", clientPhone: "+52 998 123 4534" },

  { id: 15, clientName: "Ana Martínez Rodríguez", service: "VIP Curly Experience", time: "10:00", duration: 150, status: "confirmada", depositPaid: true, depositAmount: 1500, price: 3600, date: "2026-05-20", clientPhone: "+52 998 123 4502" },
  { id: 16, clientName: "Esther Blanco Molina", service: "Luminoplastia", time: "09:00", duration: 120, status: "confirmada", depositPaid: true, depositAmount: 1000, price: 3000, date: "2026-05-20", clientPhone: "+52 998 123 4526" },
  { id: 17, clientName: "Lorena Padilla Ríos", service: "Exfoliación Capilar", time: "13:00", duration: 75, status: "pendiente", depositPaid: false, depositAmount: 0, price: 1200, date: "2026-05-20", clientPhone: "+52 998 123 4523" },
  { id: 18, clientName: "Paola Vargas Soto", service: "Ritual Detox", time: "15:00", duration: 90, status: "confirmada", depositPaid: true, depositAmount: 900, price: 1800, date: "2026-05-20", clientPhone: "+52 998 123 4524" },
  { id: 19, clientName: "Fabiola Tovar Espinosa", service: "Mesoterapia con Exosomas", time: "16:30", duration: 90, status: "confirmada", depositPaid: true, depositAmount: 1000, price: 2800, date: "2026-05-20", clientPhone: "+52 998 123 4535" },

  { id: 20, clientName: "Alejandra Gutiérrez Lara", service: "VIP Curly Experience", time: "09:30", duration: 150, status: "confirmada", depositPaid: true, depositAmount: 1500, price: 3600, date: "2026-05-21", clientPhone: "+52 998 123 4512" },
  { id: 21, clientName: "Brenda Álvarez Mata", service: "Mesoterapia con Exosomas", time: "11:00", duration: 90, status: "confirmada", depositPaid: true, depositAmount: 1000, price: 2800, date: "2026-05-21", clientPhone: "+52 998 123 4522" },
  { id: 22, clientName: "Carmen Hernández Cruz", service: "Nutrición Capilar", time: "13:00", duration: 90, status: "pendiente", depositPaid: false, depositAmount: 0, price: 1500, date: "2026-05-21", clientPhone: "+52 998 123 4503" },
  { id: 23, clientName: "Liliana Quiróz Reina", service: "Reconstrucción Molecular", time: "15:00", duration: 120, status: "confirmada", depositPaid: true, depositAmount: 1200, price: 2400, date: "2026-05-21", clientPhone: "+52 998 123 4529" },

  { id: 24, clientName: "Patricia Torres Díaz", service: "Reconstrucción Molecular", time: "10:00", duration: 120, status: "confirmada", depositPaid: true, depositAmount: 1200, price: 2400, date: "2026-05-22", clientPhone: "+52 998 123 4505" },
  { id: 25, clientName: "Ana Martínez Rodríguez", service: "VIP Curly Experience", time: "09:00", duration: 150, status: "confirmada", depositPaid: true, depositAmount: 1500, price: 3600, date: "2026-05-22", clientPhone: "+52 998 123 4502" },
  { id: 26, clientName: "Catalina Olvera Vidal", service: "Exfoliación Capilar", time: "14:00", duration: 75, status: "pendiente", depositPaid: false, depositAmount: 0, price: 1200, date: "2026-05-22", clientPhone: "+52 998 123 4532" },
];

export const LEADS: Lead[] = [
  { id: 1, name: "Lucía Varela Rojas", phone: "+52 998 555 0101", serviceInterest: "VIP Curly Experience", source: "Meta Ads", status: "Nuevo", temperature: "caliente", daysInPipeline: 0, lastMessage: "Hola! Vi su anuncio y me interesa mucho el servicio para cabello rizado", lastMessageTime: "hace 5 min", estimatedValue: 3600 },
  { id: 2, name: "Jimena Solís Pedraza", phone: "+52 998 555 0102", serviceInterest: "Luminoplastia", source: "Instagram", status: "Nuevo", temperature: "caliente", daysInPipeline: 1, lastMessage: "¿Cuánto dura el efecto de la luminoplastia?", lastMessageTime: "hace 1h", estimatedValue: 3000 },
  { id: 3, name: "Rebeca Monroy Luna", phone: "+52 998 555 0103", serviceInterest: "Diagnóstico Capilar", source: "TikTok", status: "En conversación", temperature: "tibio", daysInPipeline: 2, lastMessage: "¿El diagnóstico incluye el tratamiento?", lastMessageTime: "hace 3h", estimatedValue: 600 },
  { id: 4, name: "Ximena Peña Soriano", phone: "+52 998 555 0104", serviceInterest: "Mesoterapia con Exosomas", source: "Meta Ads", status: "En conversación", temperature: "caliente", daysInPipeline: 1, lastMessage: "Me explicaron que la mesoterapia ayuda para la caída 😍", lastMessageTime: "hace 2h", estimatedValue: 2800 },
  { id: 5, name: "Priscila Aguirre Méndez", phone: "+52 998 555 0105", serviceInterest: "Reconstrucción Molecular", source: "WhatsApp directo", status: "En conversación", temperature: "tibio", daysInPipeline: 3, lastMessage: "¿Tienen disponibilidad para el sábado?", lastMessageTime: "hace 5h", estimatedValue: 2400 },
  { id: 6, name: "Tania Olvera Campos", phone: "+52 998 555 0106", serviceInterest: "Luminoplastia", source: "Meta Ads", status: "Lead caliente", temperature: "caliente", daysInPipeline: 2, lastMessage: "¡Me encantó el antes y después! ¿Cuándo tienen lugar?", lastMessageTime: "hace 1h", estimatedValue: 3000 },
  { id: 7, name: "Paulina Cárdenas Ruiz", phone: "+52 998 555 0107", serviceInterest: "VIP Curly Experience", source: "Instagram", status: "Lead caliente", temperature: "caliente", daysInPipeline: 1, lastMessage: "Ya vi los videos y quiero agendar lo más pronto posible", lastMessageTime: "hace 30 min", estimatedValue: 3600 },
  { id: 8, name: "Selene Arroyo Vidal", phone: "+52 998 555 0108", serviceInterest: "Electroestimulación", source: "TikTok", status: "Lead caliente", temperature: "caliente", daysInPipeline: 3, lastMessage: "Necesito el tratamiento urgente, estoy perdiendo mucho pelo", lastMessageTime: "hace 2h", estimatedValue: 1500 },
  { id: 9, name: "Ingrid Campos Solano", phone: "+52 998 555 0109", serviceInterest: "Ritual Detox", source: "Meta Ads", status: "Reserva lista", temperature: "caliente", daysInPipeline: 4, lastMessage: "Ya confirmé para el jueves a las 3pm 🙌", lastMessageTime: "hace 4h", estimatedValue: 1800 },
  { id: 10, name: "Gisela Morán Fonseca", phone: "+52 998 555 0110", serviceInterest: "Nutrición Capilar", source: "WhatsApp directo", status: "Reserva lista", temperature: "caliente", daysInPipeline: 2, lastMessage: "Perfecto, el anticipo ya lo mandé por Stripe", lastMessageTime: "hace 1h", estimatedValue: 1500 },
  { id: 11, name: "Alejandra Cruz Soto", phone: "+52 998 555 0111", serviceInterest: "Luminoplastia", source: "Meta Ads", status: "Convertido", temperature: "caliente", daysInPipeline: 5, lastMessage: "¡Quedé encantada! Ya agendé para el próximo mes también", lastMessageTime: "ayer", estimatedValue: 3000 },
  { id: 12, name: "Norma Ibarra Rojas", phone: "+52 998 555 0112", serviceInterest: "Diagnóstico Capilar", source: "Instagram", status: "Convertido", temperature: "caliente", daysInPipeline: 3, lastMessage: "Gracias por toda la información 💛", lastMessageTime: "hace 2 días", estimatedValue: 600 },
  { id: 13, name: "Flor Aguilera Paz", phone: "+52 998 555 0113", serviceInterest: "Reconstrucción Molecular", source: "TikTok", status: "Perdido", temperature: "frío", daysInPipeline: 8, lastMessage: "Gracias, por ahora no puedo", lastMessageTime: "hace 3 días", estimatedValue: 2400 },
  { id: 14, name: "Miriam Ramos Castellanos", phone: "+52 998 555 0114", serviceInterest: "Exfoliación Capilar", source: "Meta Ads", status: "Perdido", temperature: "frío", daysInPipeline: 10, lastMessage: "No me interesa por el momento", lastMessageTime: "hace 4 días", estimatedValue: 1200 },
  { id: 15, name: "Yolanda Soto Pimentel", phone: "+52 998 555 0115", serviceInterest: "Mesoterapia con Exosomas", source: "Instagram", status: "En conversación", temperature: "tibio", daysInPipeline: 4, lastMessage: "¿Tienen financiamiento?", lastMessageTime: "hace 6h", estimatedValue: 2800 },
  { id: 16, name: "Perla Guzmán Torres", phone: "+52 998 555 0116", serviceInterest: "VIP Curly Experience", source: "WhatsApp directo", status: "Nuevo", temperature: "caliente", daysInPipeline: 0, lastMessage: "¡Buenos días! Quiero información del VIP Curly", lastMessageTime: "hace 10 min", estimatedValue: 3600 },
  { id: 17, name: "Consuelo Navarro Díaz", phone: "+52 998 555 0117", serviceInterest: "Electroestimulación", source: "Meta Ads", status: "Lead caliente", temperature: "caliente", daysInPipeline: 2, lastMessage: "¿Cuántas sesiones necesito para ver resultado?", lastMessageTime: "hace 3h", estimatedValue: 4500 },
  { id: 18, name: "Marina León Espejo", phone: "+52 998 555 0118", serviceInterest: "Luminoplastia", source: "TikTok", status: "Reserva lista", temperature: "caliente", daysInPipeline: 3, lastMessage: "Listo, ya pagué el anticipo por Stripe ✅", lastMessageTime: "hace 45 min", estimatedValue: 3000 },
  { id: 19, name: "Hilda Estrada Fuerte", phone: "+52 998 555 0119", serviceInterest: "Nutrición Capilar", source: "Instagram", status: "Nuevo", temperature: "tibio", daysInPipeline: 1, lastMessage: "¿Cuál es la diferencia entre nutrición y reconstrucción?", lastMessageTime: "hace 2h", estimatedValue: 1500 },
  { id: 20, name: "Blanca Téllez Romero", phone: "+52 998 555 0120", serviceInterest: "Ritual Detox", source: "Meta Ads", status: "En conversación", temperature: "caliente", daysInPipeline: 2, lastMessage: "¿El ritual detox incluye masaje?", lastMessageTime: "hace 4h", estimatedValue: 1800 },
  { id: 21, name: "Celia Pacheco Montes", phone: "+52 998 555 0121", serviceInterest: "Diagnóstico Capilar", source: "WhatsApp directo", status: "Nuevo", temperature: "frío", daysInPipeline: 0, lastMessage: "Hola, ¿tienen precio especial para primer visita?", lastMessageTime: "hace 3h", estimatedValue: 600 },
];

function generateRevenue(): RevenueDataPoint[] {
  const data: RevenueDataPoint[] = [];
  const today = new Date(2026, 4, 19);
  const services = ["Diagnóstico Capilar", "Nutrición Capilar", "Luminoplastia", "Reconstrucción Molecular", "Mesoterapia con Exosomas", "VIP Curly Experience"];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 0 : Math.floor(Math.random() * 8000 + 8000);
    const dateStr = d.toISOString().split("T")[0];
    const point: RevenueDataPoint = { date: dateStr, amount: base, appointments: isWeekend ? 0 : Math.floor(Math.random() * 4 + 7) };
    let remaining = base;
    services.forEach((s, idx) => {
      const val = idx === services.length - 1 ? remaining : Math.floor(remaining * (Math.random() * 0.25 + 0.08));
      point[s] = val;
      remaining -= val;
    });
    data.push(point);
  }
  return data;
}

export const REVENUE_DATA: RevenueDataPoint[] = generateRevenue();

export const CAVA_CONVERSATIONS: CavaConversation[] = [
  { id: 1, name: "Lucía Varela Rojas", phone: "+52 998 555 0101", lastMessage: "¿Tienen disponibilidad para el viernes?", lastMessageTime: "hace 2 min", serviceInterest: "VIP Curly Experience", status: "activa", isTyping: true, messagesCount: 8, responseTime: 45 },
  { id: 2, name: "Paulina Cárdenas Ruiz", phone: "+52 998 555 0107", lastMessage: "¡Me encantan los resultados que veo en su instagram!", lastMessageTime: "hace 5 min", serviceInterest: "Luminoplastia", status: "activa", isTyping: false, messagesCount: 12, responseTime: 30 },
  { id: 3, name: "Selene Arroyo Vidal", phone: "+52 998 555 0108", lastMessage: "¿Cuánto tarda el tratamiento de electroestimulación?", lastMessageTime: "hace 8 min", serviceInterest: "Electroestimulación", status: "activa", isTyping: false, messagesCount: 6, responseTime: 60 },
  { id: 4, name: "Perla Guzmán Torres", phone: "+52 998 555 0116", lastMessage: "Buenos días, ¿el VIP Curly incluye diagnóstico previo?", lastMessageTime: "hace 11 min", serviceInterest: "VIP Curly Experience", status: "activa", isTyping: true, messagesCount: 4, responseTime: 40 },
  { id: 5, name: "Jimena Solís Pedraza", phone: "+52 998 555 0102", lastMessage: "Perfecto, ¿puedo pagar con tarjeta?", lastMessageTime: "hace 15 min", serviceInterest: "Luminoplastia", status: "activa", isTyping: false, messagesCount: 15, responseTime: 25 },
  { id: 6, name: "Tania Olvera Campos", phone: "+52 998 555 0106", lastMessage: "Genial! ¿Qué necesito llevar el día de mi cita?", lastMessageTime: "hace 18 min", serviceInterest: "Luminoplastia", status: "activa", isTyping: false, messagesCount: 20, responseTime: 35 },
  { id: 7, name: "Ximena Peña Soriano", phone: "+52 998 555 0104", lastMessage: "¿La mesoterapia duele mucho?", lastMessageTime: "hace 22 min", serviceInterest: "Mesoterapia con Exosomas", status: "activa", isTyping: false, messagesCount: 9, responseTime: 50 },
  { id: 8, name: "Consuelo Navarro Díaz", phone: "+52 998 555 0117", lastMessage: "¿Tienen paquete de varias sesiones de electro?", lastMessageTime: "hace 25 min", serviceInterest: "Electroestimulación", status: "activa", isTyping: true, messagesCount: 11, responseTime: 30 },
  { id: 9, name: "Yolanda Soto Pimentel", phone: "+52 998 555 0115", lastMessage: "¿Tienen algún plan de pago a meses?", lastMessageTime: "hace 30 min", serviceInterest: "Mesoterapia con Exosomas", status: "esperando", isTyping: false, messagesCount: 7, responseTime: 90 },
  { id: 10, name: "Blanca Téllez Romero", phone: "+52 998 555 0120", lastMessage: "¿El ritual detox me lo puedes detallar más?", lastMessageTime: "hace 35 min", serviceInterest: "Ritual Detox", status: "activa", isTyping: false, messagesCount: 5, responseTime: 45 },
  { id: 11, name: "Hilda Estrada Fuerte", phone: "+52 998 555 0119", lastMessage: "Oye, ¿para cabello teñido sirven los servicios?", lastMessageTime: "hace 40 min", serviceInterest: "Nutrición Capilar", status: "activa", isTyping: false, messagesCount: 6, responseTime: 55 },
  { id: 12, name: "Priscila Aguirre Méndez", phone: "+52 998 555 0105", lastMessage: "¿El sábado tienen lugar por la mañana?", lastMessageTime: "hace 45 min", serviceInterest: "Reconstrucción Molecular", status: "esperando", isTyping: false, messagesCount: 8, responseTime: 120 },
  { id: 13, name: "Marina León Espejo", phone: "+52 998 555 0118", lastMessage: "Listo, ya hice el pago del anticipo 💛", lastMessageTime: "hace 48 min", serviceInterest: "Luminoplastia", status: "resuelta", isTyping: false, messagesCount: 18, responseTime: 20 },
  { id: 14, name: "Rebeca Monroy Luna", phone: "+52 998 555 0103", lastMessage: "¿El diagnóstico lo hace la misma especialista?", lastMessageTime: "hace 55 min", serviceInterest: "Diagnóstico Capilar", status: "activa", isTyping: false, messagesCount: 5, responseTime: 70 },
];

export const WORKFLOWS: Workflow[] = [
  { id: 1, name: "Confirmación de Citas", description: "Envía WhatsApp de confirmación 24h antes de la cita", status: "activo", lastRun: "hace 2 min", nextRun: "en 58 min", executionsToday: 9, successRate: 100, monthlyCost: 120 },
  { id: 2, name: "Seguimiento de Leads", description: "Cava IA responde y nutre leads de Meta Ads", status: "activo", lastRun: "hace 30 seg", nextRun: "continuo", executionsToday: 47, successRate: 98, monthlyCost: 380 },
  { id: 3, name: "Recordatorio de Anticipo", description: "Alerta a clientes con reserva sin pago de anticipo", status: "activo", lastRun: "hace 15 min", nextRun: "en 45 min", executionsToday: 5, successRate: 100, monthlyCost: 60 },
  { id: 4, name: "Sincronización Base44→Sheets", description: "Exporta citas confirmadas a Google Sheets CRM", status: "advertencia", lastRun: "hace 1h 20min", nextRun: "en 10 min", executionsToday: 3, successRate: 75, monthlyCost: 90, lastError: "Timeout al escribir en Sheets (ref: row 847). Reintentando..." },
  { id: 5, name: "Reactivación de Clientas", description: "Contacta clientas inactivas más de 45 días", status: "activo", lastRun: "hace 6h", nextRun: "mañana 9am", executionsToday: 1, successRate: 100, monthlyCost: 45 },
  { id: 6, name: "Reporte Diario de Ingresos", description: "Genera resumen de ingresos y lo envía por WhatsApp a Angee", status: "activo", lastRun: "hoy 8:00am", nextRun: "mañana 8am", executionsToday: 1, successRate: 100, monthlyCost: 30 },
  { id: 7, name: "Post-Servicio Review", description: "Solicita reseña de Google a clientas 2h después del servicio", status: "activo", lastRun: "hace 45 min", nextRun: "en 1h 15min", executionsToday: 4, successRate: 100, monthlyCost: 55 },
  { id: 8, name: "Integración Stripe→CRM", description: "Registra pagos de Stripe en Google Sheets automáticamente", status: "error", lastRun: "hace 3h 10min", nextRun: "—", executionsToday: 0, successRate: 0, monthlyCost: 70, lastError: "API Stripe webhook 401 Unauthorized. Revisar clave secreta." },
];

export const ACTIVITY_FEED: ActivityItem[] = [
  { id: 1, type: "reserva", description: "Nueva reserva: Beatriz Serna — Nutrición Capilar 5:30pm", time: "hace 3 min", clientName: "Beatriz Serna Cano", isNew: true },
  { id: 2, type: "lead", description: "Lead caliente: Perla Guzmán pregunta por VIP Curly Experience", time: "hace 10 min", clientName: "Perla Guzmán Torres", isNew: true },
  { id: 3, type: "pago", description: "Anticipo recibido: Marina León — Luminoplastia $1,000 MXN", time: "hace 18 min", amount: 1000, clientName: "Marina León Espejo", isNew: true },
  { id: 4, type: "completada", description: "Servicio completado: Eva Merino — Diagnóstico Capilar", time: "hace 32 min", clientName: "Eva Merino Ángeles" },
  { id: 5, type: "pago", description: "Pago completo: Gisela Morán — Nutrición Capilar $1,500 MXN", time: "hace 45 min", amount: 1500, clientName: "Gisela Morán Fonseca" },
  { id: 6, type: "lead", description: "Nuevo lead desde Meta Ads: Lucía Varela — VIP Curly", time: "hace 1h", clientName: "Lucía Varela Rojas" },
  { id: 7, type: "reserva", description: "Cita confirmada: Ingrid Campos — Ritual Detox jueves 3pm", time: "hace 1h 20min", clientName: "Ingrid Campos Solano" },
  { id: 8, type: "alerta", description: "⚠️ Error en workflow: Integración Stripe→CRM necesita atención", time: "hace 3h 10min" },
  { id: 9, type: "completada", description: "Servicio completado: Valentina Ortiz — Exfoliación Capilar", time: "hace 4h", clientName: "Valentina Ortiz Reyes" },
  { id: 10, type: "pago", description: "Pago recibido: Isabel Vega — Ritual Detox $1,800 MXN", time: "hace 4h 30min", amount: 1800, clientName: "Isabel Vega Ruiz" },
];

export const TODAY_KPIS = {
  citasConfirmadas: 9,
  citasTrend: 12,
  ingresosDia: 13500,
  ingresosTrend: 18,
  leadsActivos: 21,
  leadsTrend: -3,
  tasaConversion: 34,
  conversionTrend: 5,
  ocupacion: 85,
  healthScore: 72,
};

export const MONTHLY_SUMMARY = {
  currentMonth: 67400,
  previousMonth: 58200,
  target: 80000,
  weeklyData: [
    { week: "Sem 1", amount: 14800 },
    { week: "Sem 2", amount: 18200 },
    { week: "Sem 3", amount: 16400 },
    { week: "Sem 4 (proy)", amount: 18000 },
  ],
  byService: [
    { name: "VIP Curly Experience", amount: 21600, count: 6 },
    { name: "Luminoplastia", amount: 18000, count: 6 },
    { name: "Mesoterapia con Exosomas", amount: 14000, count: 5 },
    { name: "Reconstrucción Molecular", amount: 9600, count: 4 },
    { name: "Ritual Detox", amount: 9000, count: 5 },
    { name: "Nutrición Capilar", amount: 7500, count: 5 },
    { name: "Electroestimulación", amount: 6000, count: 4 },
    { name: "Exfoliación Capilar", amount: 4800, count: 4 },
    { name: "Diagnóstico Capilar", amount: 3000, count: 5 },
  ],
  pendingDeposits: [
    { client: "Natalia Sánchez Torres", service: "Diagnóstico Capilar", date: "Hoy 11am", amount: 300 },
    { client: "Andrea Ramos Peña", service: "Exfoliación Capilar", date: "Hoy 4:30pm", amount: 600 },
    { client: "Lorena Padilla Ríos", service: "Exfoliación Capilar", date: "Mañana 1pm", amount: 600 },
    { client: "Carmen Hernández Cruz", service: "Nutrición Capilar", date: "Jue 21 May 1pm", amount: 750 },
  ],
};
