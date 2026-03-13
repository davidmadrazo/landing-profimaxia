import { openrouter, MODELS } from '@/lib/ai/openrouter'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { createClient } from '@/lib/supabase/server'

const FALLBACK_SYSTEM_PROMPT = `Eres Axia, la asistente IA de ProfimaxIA. Hablas con visitantes de la web que estan valorando si trabajar con nosotros.

## Sobre ProfimaxIA
Fundada hace un año por David Madrazo — graduado en ADE, programador autodidacta y con un Master en Ciencia de Datos. Lo que empezo como un proyecto en solitario es hoy un equipo especializado en construir software con IA para negocios.

## Que hacemos (nuestros 3 pilares)

### 1. Construimos tu app (VENTAJA COMPETITIVA)
Desarrollamos aplicaciones a medida, plataformas y MVPs. No usamos plantillas — cada proyecto se construye desde cero adaptado al negocio del cliente. Esto es lo que nos diferencia de otras agencias: no solo automatizamos, CONSTRUIMOS software real.

### 2. Automatizamos tu negocio
- Bots de WhatsApp: atienden clientes, gestionan pedidos, responden dudas y cobran 24/7
- Llamadas IA: agentes de voz que atienden el telefono como un humano
- CRMs a medida: gestion de clientes, comerciales y procesos internos
- Integraciones: conectamos sistemas existentes con IA

### 3. Vendemos por ti
- Landing pages de alta conversion
- Webs profesionales
- Funnels de venta automatizados

## Proyectos reales (usarlos como prueba social)
- JMCakesss: bot de WhatsApp para pasteleria artesanal — pedidos automatizados sin intervencion humana
- Oxford Language School: bot de WhatsApp para academia de ingles — captacion de leads automatica
- Montchis: CRM propio + bot WhatsApp con pasarela de pago integrada para reposteria creativa
- App Comerciales: SaaS de captacion e integracion de comerciales con CRM
- 1923 Barber Shop: app de reservas y gestion de citas para barberia premium
- Otis Valen: portafolio web brutalista para estudio de diseño grafico

## Datos de contacto
- WhatsApp: +34 644 357 558
- Email: davidmadrazo@profimaxia.com
- Instagram: @davidmadrazo.ia
- TikTok: @davidmadrazo_

## Tu personalidad
- Cercana, directa y con energia. Como una compañera lista que sabe de lo que habla.
- Usas español de España (tutea, nada de "ustedes")
- Respuestas cortas: 2-3 frases maximo. Ve al grano.
- Muestras interes real en el problema del visitante antes de ofrecer soluciones.
- Cuando detectas una necesidad clara, explicas brevemente como lo resolveriamos y compartes un caso similar.

## Estrategia de conversion
1. ESCUCHA: primero entiende que necesita el visitante (pregunta sobre su negocio)
2. CONECTA: relaciona su problema con un caso real que hayamos resuelto
3. PROPUESTA: explica brevemente como lo hariamos para el
4. CIERRA: tras 2-3 intercambios, sugiere continuar por WhatsApp — "Si quieres, hablamos por WhatsApp y te cuento exactamente como lo hariamos para tu caso. Sin compromiso."
- NUNCA des precios concretos. Di que depende del alcance y que por WhatsApp lo valorais juntos.
- Si preguntan algo muy tecnico, responde lo justo y redirige a WhatsApp.
- Si alguien pregunta "que es esto" o "que haces", preséntate y explica que eres una muestra real de lo que ProfimaxIA puede construir para su negocio.`

const SESSION_GAP_MS = 4 * 60 * 60 * 1000 // 4 horas

// ─── Rate Limiting (in-memory, per visitor) ───
const MAX_MESSAGES_PER_WINDOW = 20    // max messages per visitor
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour window
const MAX_MESSAGES_PER_CONVERSATION = 30 // absolute max per conversation

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(visitorId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(visitorId)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(visitorId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { allowed: true, remaining: MAX_MESSAGES_PER_WINDOW - 1 }
  }

  if (entry.count >= MAX_MESSAGES_PER_WINDOW) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_MESSAGES_PER_WINDOW - entry.count }
}

// Clean up stale entries every 10 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now()
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key)
    }
  }
  setInterval(cleanup, 10 * 60 * 1000)
}

interface AgentConfig {
  id: string
  system_prompt: string
  model_id: string
  temperature: number
  max_tokens: number
}

const DEFAULT_AGENT: AgentConfig = {
  id: '00000000-0000-0000-0000-000000000000',
  system_prompt: FALLBACK_SYSTEM_PROMPT,
  model_id: MODELS.fast,
  temperature: 0.7,
  max_tokens: 300,
}

async function ensureAgent(supabase: Awaited<ReturnType<typeof createClient>>): Promise<AgentConfig> {
  // Ensure the default agent exists in DB (for FK constraint on conversations)
  const { data } = await supabase
    .from('agents')
    .select('id')
    .eq('id', DEFAULT_AGENT.id)
    .single()

  if (!data) {
    await supabase.from('agents').insert({
      id: DEFAULT_AGENT.id,
      name: 'Axia',
      system_prompt: 'managed-in-code',
      model_id: DEFAULT_AGENT.model_id,
      temperature: DEFAULT_AGENT.temperature,
      max_tokens: DEFAULT_AGENT.max_tokens,
      is_active: true,
    })
  }

  // Always use the hardcoded prompt (single source of truth)
  return DEFAULT_AGENT
}

async function getOrCreateConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  agentId: string,
  visitorId: string
): Promise<string> {
  // Buscar conversacion reciente de este visitor
  const { data: existing } = await supabase
    .from('conversations')
    .select('id, updated_at')
    .eq('visitor_id', visitorId)
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const lastActivity = new Date(existing.updated_at).getTime()
    const now = Date.now()
    if (now - lastActivity < SESSION_GAP_MS) {
      return existing.id
    }
  }

  // Crear nueva conversacion
  const { data, error } = await supabase
    .from('conversations')
    .insert({ agent_id: agentId, visitor_id: visitorId })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error('Failed to create conversation')
  }

  return data.id
}

export async function POST(req: Request) {
  const startTime = Date.now()
  const { messages, visitorId }: { messages: UIMessage[]; visitorId?: string } = await req.json()

  // ─── Rate Limiting ───
  const clientId = visitorId || req.headers.get('x-forwarded-for') || 'anonymous'
  const { allowed, remaining } = checkRateLimit(clientId)
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Has alcanzado el limite de mensajes. Prueba de nuevo en una hora o escribenos por WhatsApp al +34 644 357 558.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Remaining': '0' } }
    )
  }

  // ─── Conversation length limit ───
  if (messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    return new Response(
      JSON.stringify({ error: 'Esta conversacion es muy larga. Para seguir hablando, escribenos por WhatsApp al +34 644 357 558.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ─── Supabase (optional — works without it) ───
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null
  let agent: AgentConfig

  if (hasSupabase) {
    supabase = await createClient()
    agent = await ensureAgent(supabase)
  } else {
    agent = DEFAULT_AGENT
  }

  // Persistir si hay visitorId y Supabase (fire-and-forget pattern)
  let conversationId: string | null = null
  if (visitorId && supabase) {
    try {
      conversationId = await getOrCreateConversation(supabase, agent.id, visitorId)

      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
      if (lastUserMsg) {
        const textContent = lastUserMsg.parts
          ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
          .map(p => p.text)
          .join('') || ''

        if (textContent) {
          supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: textContent,
          }).then(() => {
            supabase!.from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', conversationId!)
              .then(() => {})
          })
        }
      }
    } catch (e) {
      console.error('Persistence error:', e)
    }
  }

  const modelMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: openrouter(agent.model_id || MODELS.fast),
    system: agent.system_prompt,
    messages: modelMessages,
    temperature: agent.temperature,
    maxOutputTokens: agent.max_tokens,
    onFinish: async ({ text, usage }) => {
      // Guardar respuesta del assistant (fire-and-forget)
      if (conversationId && supabase && text) {
        const processingTime = Date.now() - startTime
        supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: text,
          tokens_used: usage?.totalTokens ?? null,
          model_used: agent.model_id,
          processing_time_ms: processingTime,
        }).then(() => {
          supabase!.from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId!)
            .then(() => {})
        })
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
