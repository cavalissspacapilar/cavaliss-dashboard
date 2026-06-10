import { NextRequest, NextResponse } from 'next/server';

// ── Types ────────────────────────────────────────────────────────────────────

interface JarvisMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicContentBlock {
  type: 'text' | 'tool_use';
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
}

interface AnthropicToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

// ── Base44 helpers ────────────────────────────────────────────────────────────

const B44_URL = process.env.BASE44_API_URL ?? '';
const B44_KEY = process.env.BASE44_API_KEY ?? '';
const B44_FN_KEY = process.env.BASE44_FUNCTIONS_KEY ?? B44_KEY;

function fnUrl(name: string) {
  return `${B44_URL.replace(/\/entities$/, '')}/functions/${name}`;
}

async function b44fn(name: string): Promise<Record<string, unknown>> {
  const res = await fetch(fnUrl(name), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': B44_FN_KEY },
    body: '{}',
  });
  if (!res.ok) throw new Error(`Base44 fn ${name}: ${res.status}`);
  return res.json();
}

async function b44entity(entity: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${B44_URL}/${entity}`, {
    headers: { api_key: B44_KEY },
  });
  if (!res.ok) throw new Error(`Base44 entity ${entity}: ${res.status}`);
  const json: unknown = await res.json();
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  const j = json as Record<string, unknown>;
  return (Array.isArray(j?.data) ? j.data : Array.isArray(j?.items) ? j.items : []) as Record<string, unknown>[];
}

// ── Tool implementations ──────────────────────────────────────────────────────

async function toolGetCitas(periodo: string): Promise<string> {
  try {
    const rows = await b44entity('Appointment');
    const now = new Date();
    const pad = (d: Date) => d.toISOString().split('T')[0];
    const today = pad(now);
    const tomorrow = pad(new Date(now.getTime() + 86_400_000));
    const weekEnd = pad(new Date(now.getTime() + 7 * 86_400_000));
    const monthStart = today.substring(0, 7);

    const getDate = (a: Record<string, unknown>) =>
      String(a.date ?? a.fecha ?? a.appointment_date ?? '');

    let filtered: Record<string, unknown>[];
    if (periodo === 'hoy') {
      filtered = rows.filter(a => getDate(a).startsWith(today));
    } else if (periodo === 'manana' || periodo === 'mañana') {
      filtered = rows.filter(a => getDate(a).startsWith(tomorrow));
    } else if (periodo === 'semana') {
      filtered = rows.filter(a => { const d = getDate(a); return d >= today && d <= weekEnd; });
    } else if (periodo === 'mes') {
      filtered = rows.filter(a => getDate(a).startsWith(monthStart));
    } else {
      filtered = rows;
    }

    if (filtered.length === 0) return `No hay citas para el período "${periodo}".`;

    const list = filtered.map(a => {
      const nombre = String(a.client_name ?? a.clientName ?? a.cliente ?? a.name ?? 'Sin nombre');
      const servicio = String(a.service_name ?? a.service ?? a.servicio ?? '');
      const hora = String(a.time ?? a.hora ?? a.start_time ?? '').slice(0, 5);
      const estado = String(a.status ?? a.estado ?? '');
      const fecha = getDate(a);
      return `• ${nombre} | ${servicio} | ${fecha} ${hora} | ${estado}`;
    }).join('\n');

    return `${filtered.length} cita(s) para "${periodo}":\n${list}`;
  } catch (err) {
    return `Error al obtener citas: ${String(err)}`;
  }
}

async function toolGetClienteInfo(nombre: string): Promise<string> {
  try {
    const [clientsData, perfiles] = await Promise.all([
      b44fn('getClientsForDashboard').catch(() => ({ clients: [] })),
      b44entity('PerfilCapilarV2').catch(() => [] as Record<string, unknown>[]),
    ]);

    const clients = ((clientsData as Record<string, unknown>).clients as Record<string, unknown>[]) ?? [];
    const q = nombre.toLowerCase().trim();

    const client = clients.find(c => String(c.name ?? '').toLowerCase().includes(q));
    if (!client) return `No se encontró ninguna clienta con el nombre "${nombre}" en el sistema.`;

    const clientId = String(client.id ?? '');
    const perfil = (perfiles as Record<string, unknown>[]).find(
      p => String(p.client_profile_id ?? '') === clientId
    );

    const problems: string[] = [];
    if (perfil?.problema_alopecia === true) problems.push('Alopecia');
    if (perfil?.problema_caspa === true) problems.push('Caspa');
    if (perfil?.problema_dermatitis === true) problems.push('Dermatitis');
    if (perfil?.problema_seborrea === true) problems.push('Seborrea');

    let result = `=== ${client.name} ===\n`;
    result += `Teléfono: ${client.phone ?? client.telefono ?? 'No registrado'}\n`;
    result += `Última visita: ${client.last_visit ?? client.lastVisit ?? 'Sin registro'}\n`;
    result += `Sesiones totales: ${client.visit_count ?? client.visits ?? 0}\n`;

    if (perfil) {
      result += `\nPERFIL CAPILAR:\n`;
      result += `Hair Score: ${perfil.score_general_capilar ?? 0}/10\n`;
      result += `Tendencia: ${perfil.tendencia ?? 'N/A'}\n`;
      result += `Riesgo abandono: ${perfil.riesgo_abandono ?? 'N/A'}\n`;
      result += `Último diagnóstico: ${perfil.fecha_ultimo_diagnostico ?? 'Sin fecha'}\n`;
      result += `Procedimiento a realizar: ${perfil.procedimiento_a_realizar ?? 'N/A'}\n`;
      result += `Sesiones recomendadas: ${perfil.sesiones_recomendadas ?? 'N/A'}\n`;
      result += `Objetivo: ${perfil.objetivo_capilar ?? 'N/A'}\n`;
      if (problems.length > 0) result += `Problemas: ${problems.join(', ')}\n`;
      result += `\nMÉTRICAS (escala 0-10):\n`;
      result += `Daño: ${perfil.nivel_daño_actual ?? 5} | Hidratación: ${perfil.hidratacion_actual ?? 5}\n`;
      result += `Frizz: ${perfil.frizz_actual ?? 5} | Rotura: ${perfil.rotura_actual ?? 5}\n`;
      result += `Brillo: ${perfil.brillo_actual ?? 5} | Elasticidad: ${perfil.elasticidad_actual ?? 5} | Caída: ${perfil.caida_actual ?? 5}\n`;
      if (perfil.observaciones_tricocamara) {
        result += `Observaciones tricócamara: ${perfil.observaciones_tricocamara}\n`;
      }
    } else {
      result += '\nSin perfil capilar registrado aún.';
    }

    return result;
  } catch (err) {
    return `Error al buscar clienta "${nombre}": ${String(err)}`;
  }
}

async function toolGetLeads(periodo?: string): Promise<string> {
  try {
    const data = await b44fn('getLeadsForDashboard');
    const leads = ((data as Record<string, unknown>).leads as Record<string, unknown>[]) ?? [];

    if (leads.length === 0) return 'No hay leads registrados en el sistema.';

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let filtered = leads;

    if (periodo === 'hoy') {
      filtered = leads.filter(l => String(l.created_date ?? '').startsWith(today));
    } else if (periodo === 'semana') {
      const weekAgo = new Date(now.getTime() - 7 * 86_400_000).toISOString().split('T')[0];
      filtered = leads.filter(l => String(l.created_date ?? '') >= weekAgo);
    } else if (periodo === 'mes') {
      filtered = leads.filter(l => String(l.created_date ?? '').startsWith(today.substring(0, 7)));
    }

    const byStatus: Record<string, number> = {};
    filtered.forEach(l => {
      const s = String(l.conversion_status ?? 'Nuevo');
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    });

    let result = `${filtered.length} lead(s)${periodo ? ` en "${periodo}"` : ' en total'}:\n`;
    result += Object.entries(byStatus).map(([s, c]) => `  ${s}: ${c}`).join('\n');

    if (filtered.length <= 15) {
      result += '\n\nDetalle:\n';
      result += filtered.map(l =>
        `• ${l.name} | ${l.conversion_status ?? 'Nuevo'} | ${l.problem ?? ''} | Tel: ${l.phone ?? ''}`
      ).join('\n');
    }

    return result;
  } catch (err) {
    return `Error al obtener leads: ${String(err)}`;
  }
}

async function toolGetMetricas(): Promise<string> {
  try {
    const data = await b44fn('getMetricsForDashboard');
    const metricas = (data as Record<string, unknown>).metricas ?? data;

    if (Array.isArray(metricas)) {
      return (metricas as Record<string, unknown>[])
        .map(m => `${m.label ?? m.name ?? m.key}: ${m.value}`)
        .join('\n');
    }
    if (typeof metricas === 'object' && metricas !== null) {
      return Object.entries(metricas as Record<string, unknown>)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }
    return JSON.stringify(metricas);
  } catch (err) {
    return `Error al obtener métricas: ${String(err)}`;
  }
}

async function toolGetClientesEnRiesgo(diasSinVisita: number): Promise<string> {
  try {
    const perfiles = await b44entity('PerfilCapilarV2');
    const now = new Date();
    const cutoff = new Date(now.getTime() - diasSinVisita * 86_400_000);

    const enRiesgo = perfiles
      .filter(p => {
        if (!p.client_profile_id) return false;
        const raw = String(p.fecha_ultimo_diagnostico ?? '');
        if (!raw) return true; // Never diagnosed = at risk
        const d = new Date(raw);
        return !isNaN(d.getTime()) && d < cutoff;
      })
      .map(p => {
        const raw = String(p.fecha_ultimo_diagnostico ?? '');
        const d = raw ? new Date(raw) : null;
        const dias = d && !isNaN(d.getTime())
          ? Math.floor((now.getTime() - d.getTime()) / 86_400_000)
          : null;
        return {
          nombre: String(p.nombre ?? p.name ?? 'Sin nombre'),
          score: Number(p.score_general_capilar ?? 0),
          diasSin: dias,
          ultimaFecha: raw || 'Nunca',
          riesgo: String(p.riesgo_abandono ?? 'N/A'),
        };
      })
      .sort((a, b) => (b.diasSin ?? 999) - (a.diasSin ?? 999));

    if (enRiesgo.length === 0) {
      return `No hay clientas en riesgo (sin diagnóstico en ${diasSinVisita}+ días).`;
    }

    const list = enRiesgo.map(c =>
      `• ${c.nombre} | ${c.diasSin !== null ? `${c.diasSin} días sin visita` : 'Sin registro'} | Score: ${c.score}/10 | Riesgo: ${c.riesgo}`
    ).join('\n');

    return `${enRiesgo.length} clienta(s) sin visita en ${diasSinVisita}+ días:\n${list}`;
  } catch (err) {
    return `Error al obtener clientas en riesgo: ${String(err)}`;
  }
}

async function toolGenerarProtocolo(nombre: string): Promise<string> {
  try {
    const [clientsData, perfiles] = await Promise.all([
      b44fn('getClientsForDashboard').catch(() => ({ clients: [] })),
      b44entity('PerfilCapilarV2').catch(() => [] as Record<string, unknown>[]),
    ]);

    const clients = ((clientsData as Record<string, unknown>).clients as Record<string, unknown>[]) ?? [];
    const q = nombre.toLowerCase().trim();
    const client = clients.find(c => String(c.name ?? '').toLowerCase().includes(q));

    if (!client) return `No se encontró la clienta "${nombre}" en el sistema. No puedo generar el protocolo.`;

    const perfil = (perfiles as Record<string, unknown>[]).find(
      p => String(p.client_profile_id ?? '') === String(client.id ?? '')
    );

    if (!perfil) return `La clienta ${client.name} existe pero no tiene perfil capilar registrado en IQ. El protocolo no puede generarse sin diagnóstico.`;

    const problems: string[] = [];
    if (perfil.problema_alopecia === true) problems.push('Alopecia');
    if (perfil.problema_caspa === true) problems.push('Caspa');
    if (perfil.problema_dermatitis === true) problems.push('Dermatitis');
    if (perfil.problema_seborrea === true) problems.push('Seborrea');

    return `DATOS REALES PARA PROTOCOLO — ${String(client.name).toUpperCase()}
Fecha diagnóstico: ${perfil.fecha_ultimo_diagnostico ?? 'Sin fecha'}
Hair Score general: ${perfil.score_general_capilar ?? 0}/10
Tendencia: ${perfil.tendencia ?? 'N/A'}
Objetivo capilar: ${perfil.objetivo_capilar ?? 'N/A'}
Problemas activos: ${problems.join(', ') || 'Ninguno detectado'}
Procedimiento indicado: ${perfil.procedimiento_a_realizar ?? 'No especificado'}
Sesiones recomendadas: ${perfil.sesiones_recomendadas ?? 'No especificadas'}
Observaciones tricócamara: ${perfil.observaciones_tricocamara ?? 'Sin observaciones'}

MÉTRICAS ACTUALES (0=crítico, 10=óptimo):
• Nivel de daño:    ${perfil.nivel_daño_actual ?? 5}/10
• Hidratación:      ${perfil.hidratacion_actual ?? 5}/10
• Frizz:            ${perfil.frizz_actual ?? 5}/10
• Rotura:           ${perfil.rotura_actual ?? 5}/10
• Brillo:           ${perfil.brillo_actual ?? 5}/10
• Elasticidad:      ${perfil.elasticidad_actual ?? 5}/10
• Caída:            ${perfil.caida_actual ?? 5}/10

Sesiones totales: ${client.visit_count ?? 0} | Total gastado: $${client.total_spent ?? 0}`;
  } catch (err) {
    return `Error al obtener datos de ${nombre}: ${String(err)}`;
  }
}

async function toolGenerarMensajeWhatsApp(nombre: string, tipo: string): Promise<string> {
  try {
    const [clientsData, perfiles] = await Promise.all([
      b44fn('getClientsForDashboard').catch(() => ({ clients: [] })),
      b44entity('PerfilCapilarV2').catch(() => [] as Record<string, unknown>[]),
    ]);

    const clients = ((clientsData as Record<string, unknown>).clients as Record<string, unknown>[]) ?? [];
    const q = nombre.toLowerCase().trim();
    const client = clients.find(c => String(c.name ?? '').toLowerCase().includes(q));

    if (!client) return `No se encontró la clienta "${nombre}". No puedo generar el mensaje.`;

    const perfil = (perfiles as Record<string, unknown>[]).find(
      p => String(p.client_profile_id ?? '') === String(client.id ?? '')
    );

    const problems: string[] = [];
    if (perfil?.problema_alopecia === true) problems.push('alopecia');
    if (perfil?.problema_caspa === true) problems.push('caspa');
    if (perfil?.problema_dermatitis === true) problems.push('dermatitis');
    if (perfil?.problema_seborrea === true) problems.push('seborrea');

    const firstName = String(client.name ?? '').split(' ')[0];

    return `DATOS REALES PARA MENSAJE — ${String(client.name).toUpperCase()}
Nombre: ${client.name} (llámala ${firstName})
Teléfono: ${client.phone ?? client.telefono ?? 'No registrado'}
Tipo de mensaje: ${tipo}
Hair Score actual: ${perfil?.score_general_capilar ?? 'N/A'}/10
Tendencia: ${perfil?.tendencia ?? 'N/A'}
Procedimiento actual: ${perfil?.procedimiento_a_realizar ?? 'N/A'}
Problemas detectados: ${problems.join(', ') || 'ninguno específico'}
Último diagnóstico: ${perfil?.fecha_ultimo_diagnostico ?? 'Sin fecha'}
Sesiones completadas: ${client.visit_count ?? 0}
Objetivo capilar: ${perfil?.objetivo_capilar ?? 'N/A'}`;
  } catch (err) {
    return `Error al obtener datos de ${nombre}: ${String(err)}`;
  }
}

// ── Tool dispatch ─────────────────────────────────────────────────────────────

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'getCitas':
      return toolGetCitas(String(input.periodo ?? 'hoy'));
    case 'getClienteInfo':
      return toolGetClienteInfo(String(input.nombre ?? ''));
    case 'getLeads':
      return toolGetLeads(input.periodo ? String(input.periodo) : undefined);
    case 'getMetricas':
      return toolGetMetricas();
    case 'getClientesEnRiesgo':
      return toolGetClientesEnRiesgo(Number(input.dias_sin_visita ?? 30));
    case 'generarProtocolo':
      return toolGenerarProtocolo(String(input.nombre ?? ''));
    case 'generarMensajeWhatsApp':
      return toolGenerarMensajeWhatsApp(String(input.nombre ?? ''), String(input.tipo ?? 'seguimiento_post_servicio'));
    default:
      return `Herramienta desconocida: ${name}`;
  }
}

// ── Anthropic tool definitions ────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'getCitas',
    description: 'Consulta las citas del negocio desde Base44. Filtra por período: hoy, manana, semana o mes.',
    input_schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'string',
          enum: ['hoy', 'manana', 'semana', 'mes'],
          description: 'Período a consultar',
        },
      },
      required: ['periodo'],
    },
  },
  {
    name: 'getClienteInfo',
    description: 'Busca información completa de una clienta: perfil capilar, Hair Score, problemas detectados, último diagnóstico, procedimiento recomendado.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre o parte del nombre de la clienta a buscar (búsqueda parcial, case-insensitive)',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'getLeads',
    description: 'Consulta los leads y el pipeline del negocio desde Base44.',
    input_schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'string',
          enum: ['hoy', 'semana', 'mes'],
          description: 'Filtro de tiempo opcional. Omitir para ver todos.',
        },
      },
    },
  },
  {
    name: 'getMetricas',
    description: 'Obtiene los KPIs y métricas generales del negocio: ingresos, citas completadas, tasa de retención, clientas activas.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getClientesEnRiesgo',
    description: 'Detecta clientas que llevan muchos días sin visita, ordenadas por días sin asistir.',
    input_schema: {
      type: 'object',
      properties: {
        dias_sin_visita: {
          type: 'number',
          description: 'Número de días sin visita para considerar en riesgo. Default: 30.',
        },
      },
    },
  },
  {
    name: 'generarProtocolo',
    description: 'Obtiene los datos reales del perfil capilar de una clienta para que puedas generar un protocolo personalizado completo.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre de la clienta',
        },
      },
      required: ['nombre'],
    },
  },
  {
    name: 'generarMensajeWhatsApp',
    description: 'Obtiene los datos del perfil de una clienta para generar un mensaje de WhatsApp personalizado.',
    input_schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          description: 'Nombre de la clienta',
        },
        tipo: {
          type: 'string',
          enum: ['seguimiento_post_servicio', 'recordatorio_cita', 'reactivacion', 'felicitacion'],
          description: 'Tipo de mensaje a generar',
        },
      },
      required: ['nombre', 'tipo'],
    },
  },
];

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `Eres JARVIS, el asistente de inteligencia operativa de Cavaliss Spa Capilar en Cancún.

Tienes acceso en tiempo real a todos los datos del negocio: clientas, citas, perfiles capilares, leads e ingresos.

PERSONALIDAD:
- Profesional pero cálido, como un asistente ejecutivo de alto nivel
- Directo y preciso en los datos — nunca inventas cifras
- Proactivo: si detectas algo importante al consultar los datos, lo mencionas
- Siempre hablas en español
- Cuando te preguntan por una clienta, usas su nombre real y datos reales de Base44
- Si no encuentras información, lo dices claramente sin inventar

FORMATO DE RESPUESTAS:
- Para consultas de citas/leads/métricas: máximo 3-4 oraciones concisas con los datos exactos
- Para protocolos: texto completo estructurado con secciones claras
- Para mensajes de WhatsApp: el mensaje completo listo para copiar, natural, cálido, en primera persona
- Siempre termina con una acción sugerida si es relevante

CUANDO GENERAS PROTOCOLOS:
Basándote en los datos reales del perfil capilar, genera un protocolo que incluya:
1. Diagnóstico principal (qué está pasando con su cabello)
2. Tratamiento recomendado paso a paso en cabina
3. Productos específicos para su tipo de problema
4. Frecuencia de sesiones sugerida
5. Cuidados en casa personalizados

CUANDO GENERAS MENSAJES DE WHATSAPP:
- Usa el primer nombre de la clienta
- Referencia su tratamiento específico o su Hair Score si es relevante
- Tono: cálido, personal, como de una amiga especialista
- Incluye siempre un CTA claro
- Máximo 3 párrafos cortos

EJEMPLOS DE RESPUESTAS CORRECTAS:
"Hoy tienes 3 citas: Karen a las 10am, Rosa a las 12pm y Adicely a las 3pm. Karen tiene alopecia activa — recuerda revisar su progreso de las últimas sesiones."

"El Hair Score de Nicol es 3/10. Tiene caspa activa y su último diagnóstico fue hace 2 días. Su protocolo indica exfoliación + electro + exosomas. ¿Genero el protocolo completo?"`;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { command: string; history?: JarvisMessage[] };
    const { command, history = [] } = body;

    if (!command?.trim()) {
      return NextResponse.json({ response: 'No recibí ningún comando.', toolsUsed: [] });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { response: 'JARVIS no está configurado: falta ANTHROPIC_API_KEY.', toolsUsed: [] },
        { status: 500 }
      );
    }

    // Build message history (keep last 8 for context without exceeding token budget)
    type AnthropicMsg = { role: 'user' | 'assistant'; content: string | (AnthropicContentBlock | AnthropicToolResultBlock)[] };
    const messages: AnthropicMsg[] = [
      ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: command },
    ];

    const toolsUsed: string[] = [];
    const MAX_ROUNDS = 5;

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM,
          tools: TOOLS,
          messages,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[/api/jarvis] Anthropic error:', res.status, err);
        return NextResponse.json(
          { response: `Error de IA: ${res.status}. Intenta de nuevo.`, toolsUsed },
          { status: 500 }
        );
      }

      const data = await res.json() as {
        stop_reason: string;
        content: AnthropicContentBlock[];
      };

      // Final response — no more tool calls
      if (data.stop_reason === 'end_turn') {
        const text = data.content.find(b => b.type === 'text')?.text ?? '';
        return NextResponse.json({ response: text, toolsUsed });
      }

      // Tool calls needed
      if (data.stop_reason === 'tool_use') {
        // Add assistant turn to history
        messages.push({ role: 'assistant', content: data.content });

        // Execute all tool calls in parallel
        const toolBlocks = data.content.filter(b => b.type === 'tool_use');
        const results = await Promise.all(
          toolBlocks.map(async block => {
            const toolName = block.name!;
            const toolInput = block.input ?? {};
            toolsUsed.push(toolName);
            const result = await runTool(toolName, toolInput);
            return {
              type: 'tool_result' as const,
              tool_use_id: block.id!,
              content: result,
            };
          })
        );

        messages.push({ role: 'user', content: results });
        continue;
      }

      // Any other stop reason — return what we have
      const text = data.content.find(b => b.type === 'text')?.text ?? '';
      return NextResponse.json({ response: text, toolsUsed });
    }

    return NextResponse.json({
      response: 'No pude completar la consulta. Por favor, intenta de nuevo.',
      toolsUsed,
    });
  } catch (err) {
    console.error('[/api/jarvis]', err);
    return NextResponse.json(
      { response: 'Error interno de JARVIS. Por favor, intenta de nuevo.', toolsUsed: [] },
      { status: 500 }
    );
  }
}
