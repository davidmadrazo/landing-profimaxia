# PRP-001: Persistencia de Conversaciones + Analytics Dashboard

> **Estado**: APROBADO
> **Fecha**: 2026-02-06
> **Proyecto**: ProfimaxIA OS Agencia (Landing Template)
> **Referencia**: https://github.com/daniel-carreon/Curso-SF-AgenteDashboard

---

## Objetivo

Implementar persistencia de conversaciones del chat publico (Levy) en Supabase y un dashboard de analytics en `/admin` para visualizar metricas de uso, clasificacion automatica de intenciones, y una cola de intervension para sesiones que requieren atencion humana.

## Por Que

| Problema | Solucion |
|----------|----------|
| No sabemos que preguntan los visitantes | Persistir conversaciones y clasificar automaticamente |
| No sabemos si el agente resuelve bien | Resolution Rate como metrica principal |
| No sabemos que contenido falta | Gap Score prioriza creacion de contenido |
| Problemas pasan desapercibidos | Intervention Queue detecta frustracion y escalaciones |

**Valor de negocio**: Entender al visitante para mejorar conversion. Detectar problemas temprano. Priorizar mejoras basadas en datos reales.

## Que

### Criterios de Exito
- [ ] Chat publico persiste conversaciones en Supabase (sin auth, por visitor_id anonimo)
- [ ] Mensajes se guardan con role, content, tokens_used, processing_time_ms
- [ ] Sesiones se agrupan por gap de 4 horas entre mensajes
- [ ] Clasificacion batch funciona (admin dispara manualmente)
- [ ] Dashboard en `/admin` muestra: overview stats, alertas, top topics, quality distribution
- [ ] `/admin/analytics` muestra: pain points, gap scores, intervention queue
- [ ] `/admin/conversations` permite navegar sesiones con transcripciones
- [ ] `/admin/settings` permite configurar agente (system prompt, modelo, temperature, topics)
- [ ] Solo el email `danielcarreong00@gmail.com` puede acceder (ya configurado)

### Comportamiento Esperado

**Chat Publico (/):**
1. Visitante abre la landing, ve el chat de Levy
2. Al enviar primer mensaje, se genera `visitor_id` y se guarda en localStorage
3. Cada mensaje (user + assistant) se persiste en Supabase
4. El streaming sigue funcionando igual (UX no cambia)
5. Si el visitante vuelve antes de 4 horas, continua la misma sesion

**Admin Dashboard (/admin):**
1. Admin accede con email/password (ya implementado)
2. Ve overview: total sesiones, mensajes, resolution rate, sin clasificar
3. Ve alertas: frustraciones, escalaciones, bugs reportados
4. Puede hacer click en "Clasificar Conversaciones" (batch)
5. Ve analytics detalladas, pain points, gap scores
6. Puede navegar sesiones individuales con transcripciones completas
7. Puede configurar el agente (prompt, modelo, temperature, topics de clasificacion)

---

## Contexto

### Estado Actual del Proyecto
- **Landing publica** con chat de Levy funcionando (streaming via OpenRouter)
- **Auth implementada** solo para `/admin` (proxy.ts + server-side check)
- **Supabase** conectada con tabla `profiles` y RLS
- **Design system**: Glassmorphism dark theme (purple + amber/gold)
- **Stack**: Next.js 16 + React 19 + Vercel AI SDK v5 + OpenRouter + Tailwind 3.4

### Archivos Existentes Relevantes
- `src/app/page.tsx` - Landing con chat widget
- `src/features/chat/components/ChatWidget.tsx` - Componente de chat (useChat de @ai-sdk/react)
- `src/app/api/chat/route.ts` - API de chat (streamText de ai SDK v5)
- `src/lib/ai/openrouter.ts` - Provider de OpenRouter
- `src/app/admin/` - Layout protegido + page placeholder + AdminNav
- `src/lib/supabase/server.ts` - Server client
- `src/lib/supabase/client.ts` - Browser client
- `proxy.ts` - Protege solo /admin

### Referencia: Repo AgenteDashboard
El repo `Curso-SF-AgenteDashboard` tiene la implementacion completa. Debemos ADAPTAR (no copiar) su arquitectura a nuestro stack:

**Diferencias clave:**
| AgenteDashboard | Nuestra Agencia |
|-----------------|-----------------|
| Custom useChat hook con SSE manual | Vercel AI SDK v5 `useChat` de `@ai-sdk/react` |
| Custom streaming parser | `streamText` + `toUIMessageStreamResponse()` |
| `message.parts` no existe | SDK v5 usa `message.parts` con `type: 'text'` |
| `convertToModelMessages` sync | `convertToModelMessages` es ASYNC en v5 |
| `sendMessage({ text })` | Igual, pero SDK v5 pattern |
| Next.js 15 middleware.ts | Next.js 16 proxy.ts |
| Multiple agents | Un solo agente (Levy) |

### Arquitectura Propuesta (Feature-First)
```
src/features/
  chat/
    components/ChatWidget.tsx  (existente, modificar para persistir)
    hooks/                     (no necesario - usamos useChat de @ai-sdk/react)
    types/index.ts             (crear)
  dashboard/
    components/
      OverviewCards.tsx
      AlertsPanel.tsx
      TopTopicsChart.tsx
      QualityDistribution.tsx
      PainPointsTable.tsx
      GapScorePanel.tsx
      InterventionQueue.tsx
      SessionBrowser.tsx
      AgentSettings.tsx
    types/index.ts

src/app/
  api/
    chat/route.ts              (modificar para persistir mensajes)
    analytics/route.ts         (crear)
    classify/route.ts          (crear)
    conversations/route.ts     (crear)
  admin/
    page.tsx                   (reescribir con analytics reales)
    analytics/page.tsx         (crear)
    conversations/page.tsx     (crear)
    settings/page.tsx          (crear)
    layout.tsx                 (existente)
    components/AdminNav.tsx    (existente, agregar links)
```

---

## Modelo de Datos

### Tabla: agents
```sql
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Levy',
  description TEXT DEFAULT 'Consultor IA de ventas',
  system_prompt TEXT NOT NULL,
  model_id VARCHAR(100) DEFAULT 'google/gemini-3-flash-preview',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  classification_topics JSONB DEFAULT '["software_medida", "automatizacion_ia", "agentes_ia", "precios", "tiempos", "soporte", "otro"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: solo admins pueden leer/escribir
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage agents"
  ON public.agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );
```

### Tabla: conversations
```sql
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id),
  visitor_id VARCHAR(100) NOT NULL,
  visitor_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: insert anonimo (anon key), select solo admins
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own conversation by visitor_id"
  ON public.conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update own conversation"
  ON public.conversations FOR UPDATE
  USING (true);
```

### Tabla: messages
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  model_used VARCHAR(100),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON public.messages FOR SELECT
  USING (true);
```

### Tabla: conversation_sessions
```sql
CREATE TABLE public.conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  first_message_at TIMESTAMPTZ NOT NULL,
  last_message_at TIMESTAMPTZ NOT NULL,
  message_count INTEGER DEFAULT 0,
  user_message_count INTEGER DEFAULT 0,
  assistant_message_count INTEGER DEFAULT 0,
  transcript TEXT,
  classification JSONB,
  classified_at TIMESTAMPTZ,
  classified_by_model VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sessions"
  ON public.conversation_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Para que el API de clasificacion (server-side con service key) pueda insertar
CREATE POLICY "Service can insert sessions"
  ON public.conversation_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update sessions"
  ON public.conversation_sessions FOR UPDATE
  USING (true);
```

### Indexes
```sql
CREATE INDEX idx_conversations_visitor ON public.conversations(visitor_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);
CREATE INDEX idx_sessions_classification ON public.conversation_sessions USING GIN(classification);
CREATE INDEX idx_sessions_unclassified ON public.conversation_sessions(classified_at) WHERE classified_at IS NULL;
CREATE UNIQUE INDEX idx_sessions_upsert ON public.conversation_sessions(conversation_id, first_message_at);
```

### View: conversation_stats
```sql
CREATE OR REPLACE VIEW public.conversation_stats AS
SELECT
  COUNT(*) as total_sessions,
  SUM(message_count) as total_messages,
  COUNT(*) FILTER (WHERE classification IS NOT NULL) as classified_count,
  COUNT(*) FILTER (WHERE classification IS NULL) as unclassified_count,
  COUNT(*) FILTER (WHERE classification->>'flags'->>'resolved' = 'true') as resolved_count,
  COUNT(*) FILTER (WHERE classification->'flags'->>'frustration_detected' = 'true') as frustration_count,
  COUNT(*) FILTER (WHERE classification->'flags'->>'escalation_needed' = 'true') as escalation_count,
  COUNT(*) FILTER (WHERE classification->'flags'->>'bug_reported' = 'true') as bug_count
FROM public.conversation_sessions;
```

### Classification JSONB Structure
```json
{
  "topics": ["software_medida", "precios"],
  "intent": "troubleshooting",
  "quality": "high",
  "summary": "Usuario pregunto sobre precios de un CRM a medida",
  "flags": {
    "frustration_detected": false,
    "escalation_needed": false,
    "bug_reported": false,
    "resolved": true
  }
}
```

---

## Algoritmos Clave

### Session Grouping (Gap de 4 horas)
```typescript
// Agrupar mensajes en sesiones por gap de 4 horas
const SESSION_GAP_MS = 4 * 60 * 60 * 1000 // 4 horas

function groupIntoSessions(messages: Message[]): Session[] {
  const sorted = messages.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const sessions: Session[] = []
  let currentSession: Message[] = []

  for (const msg of sorted) {
    if (currentSession.length === 0) {
      currentSession.push(msg)
      continue
    }

    const lastMsg = currentSession[currentSession.length - 1]
    const gap = new Date(msg.created_at).getTime() - new Date(lastMsg.created_at).getTime()

    if (gap > SESSION_GAP_MS) {
      sessions.push(buildSession(currentSession))
      currentSession = [msg]
    } else {
      currentSession.push(msg)
    }
  }

  if (currentSession.length > 0) {
    sessions.push(buildSession(currentSession))
  }

  return sessions
}
```

### Gap Score (Priorizacion de Contenido)
```typescript
// Gap Score = (sessions x frustrationRate) / resolutionRate
// >= 50: urgent
// >= 20: recommended
// >= 10: monitor
// < 10: ok

function calculateGapScore(topic: TopicStats): number {
  const resolutionRate = topic.resolvedCount / topic.sessionCount || 0.01
  return (topic.sessionCount * topic.frustrationRate) / resolutionRate
}
```

### Intervention Queue Severity
```typescript
function calculateSeverity(flags: ClassificationFlags): 'critical' | 'high' | 'medium' {
  if (flags.escalation_needed && flags.frustration_detected) return 'critical'
  if (flags.escalation_needed || flags.bug_reported) return 'high'
  return 'medium'
}
```

### Visitor ID (Tracking Anonimo)
```typescript
// Generar en el cliente, guardar en localStorage
function getVisitorId(): string {
  const stored = localStorage.getItem('visitor_id')
  if (stored) return stored
  const id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`
  localStorage.setItem('visitor_id', id)
  return id
}
```

---

## API Endpoints

| Endpoint | Metodo | Descripcion | Auth |
|----------|--------|-------------|------|
| `/api/chat` | POST | Streaming chat + persistencia | No (publico) |
| `/api/conversations` | GET | Listar sesiones | Si (admin) |
| `/api/classify` | POST | Clasificacion batch | Si (admin) |
| `/api/analytics` | GET | Metricas calculadas | Si (admin) |

### GET /api/analytics - Response Shape
```typescript
{
  overview: {
    totalSessions: number
    totalMessages: number
    classifiedCount: number
    unclassifiedCount: number
    resolutionRate: number // porcentaje
  }
  alerts: {
    frustrationCount: number
    escalationCount: number
    bugCount: number
  }
  qualityDistribution: {
    high: number
    medium: number
    low: number
    spam: number
  }
  topTopics: Array<{
    topic: string
    count: number
    percentage: number
  }>
  painPoints: Array<{
    topic: string
    sessionCount: number
    frustrationRate: number
    unresolvedRate: number
    avgMessagesPerSession: number
  }>
  gapScores: Array<{
    topic: string
    score: number
    recommendation: 'urgent' | 'recommended' | 'monitor' | 'ok'
  }>
  interventionQueue: Array<{
    id: string
    summary: string
    severity: 'critical' | 'high' | 'medium'
    flags: { frustration: boolean; escalation: boolean; bug: boolean }
    hoursAgo: number
  }>
}
```

---

## Blueprint (Assembly Line)

> Solo FASES. Las subtareas se generan al entrar a cada fase.

### Fase 1: Modelo de Datos
**Objetivo**: Crear todas las tablas, RLS, indexes, y seed del agente Levy en Supabase
**Validacion**: `list_tables` muestra agents, conversations, messages, conversation_sessions con RLS

### Fase 2: Persistencia de Chat
**Objetivo**: Modificar `/api/chat` y `ChatWidget` para persistir mensajes sin romper UX de streaming
**Validacion**: Enviar mensaje en chat publico -> verificar en Supabase que messages tiene el registro

### Fase 3: Endpoints de Admin
**Objetivo**: Crear `/api/analytics`, `/api/classify`, `/api/conversations`
**Validacion**: Curl/fetch a cada endpoint retorna datos correctos (o error si no hay data)

### Fase 4: Dashboard UI
**Objetivo**: Construir todas las paginas de admin con el design system glassmorphism
**Validacion**: Screenshots de /admin, /admin/analytics, /admin/conversations, /admin/settings

### Fase 5: Settings del Agente
**Objetivo**: Pagina para configurar system prompt, modelo, temperature, topics del agente
**Validacion**: Cambiar prompt en settings -> verificar que el chat lo usa

### Fase 6: Validacion Final
**Objetivo**: Sistema funcionando end-to-end
**Validacion**:
- [ ] Chat publico persiste mensajes
- [ ] Admin puede clasificar sesiones
- [ ] Analytics muestra metricas reales
- [ ] Intervention queue detecta problemas
- [ ] Settings modifica comportamiento del agente
- [ ] `npm run typecheck` pasa
- [ ] Playwright screenshots confirman UI

---

## Aprendizajes (Auto-Blindaje)

### 2026-02-06: convertToModelMessages es async en SDK v5
- **Error**: `convertToModelMessages` retorna Promise, no valor directo
- **Fix**: Usar `await convertToModelMessages(messages)`
- **Aplicar en**: Todos los API routes que usen Vercel AI SDK v5

### 2026-02-06: Next.js 16 usa proxy.ts, no middleware.ts
- **Error**: middleware.ts no funciona en Next.js 16
- **Fix**: Crear proxy.ts en root con funcion `proxy()` (no `middleware()`)
- **Aplicar en**: Todas las rutas protegidas

### 2026-02-06: Supabase function search_path mutable
- **Error**: Security advisory al crear funciones sin search_path
- **Fix**: Agregar `SET search_path = public` al final de la funcion
- **Aplicar en**: Todas las funciones PL/pgSQL

### 2026-02-06: Tailwind v3 usa @tailwind directives, no @import
- **Error**: `@import 'tailwindcss'` es v4, no v3
- **Fix**: Usar `@tailwind base; @tailwind components; @tailwind utilities;`
- **Aplicar en**: globals.css en proyectos con Tailwind 3.x

---

## Gotchas

- [ ] El chat usa Vercel AI SDK v5 (`useChat` de `@ai-sdk/react`, `sendMessage({ text })`, `message.parts`) - NO copiar el hook custom del repo de referencia
- [ ] La persistencia debe ser transparente al usuario - el streaming no puede bloquearse esperando el INSERT
- [ ] RLS en conversations y messages debe permitir INSERT anonimo (anon key) pero SELECT restringido para admins en ciertos casos
- [ ] Classification es batch (Gemini Flash via OpenRouter), no real-time - se dispara manualmente
- [ ] visitor_id se genera en el cliente (localStorage) - no depende de auth
- [ ] La clasificacion usa los topics dinamicos del agente (configurables en settings)
- [ ] El modelo de clasificacion debe ser barato (Gemini Flash ~$0.075/1M tokens)

## Anti-Patrones

- NO crear custom useChat hook - usar el de `@ai-sdk/react`
- NO hacer clasificacion per-message - es batch por sesion
- NO requerir auth para chatear - mata la conversion
- NO calcular analytics en el cliente - hacerlo server-side en el API
- NO hacer streaming bloqueante por la persistencia - fire-and-forget para los INSERTs
- NO hardcodear topics de clasificacion - deben ser configurables por agente
