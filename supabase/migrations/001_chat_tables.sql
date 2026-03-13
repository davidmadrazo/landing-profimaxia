-- ═══ Tablas para el chat de Axia ═══

-- Agents: configuración del bot
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Axia',
  system_prompt text NOT NULL,
  model_id text NOT NULL DEFAULT 'gpt-4o-mini',
  temperature numeric NOT NULL DEFAULT 0.7,
  max_tokens integer NOT NULL DEFAULT 300,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Conversations: sesiones de chat
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Messages: mensajes individuales
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  tokens_used integer,
  model_used text,
  processing_time_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON conversations(visitor_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active) WHERE is_active = true;

-- RLS: permitir anon insertar conversaciones y mensajes (el bot necesita escribir)
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Agents: solo lectura para anon
CREATE POLICY "agents_read" ON agents FOR SELECT TO anon USING (is_active = true);

-- Conversations: anon puede crear y leer sus propias
CREATE POLICY "conversations_insert" ON conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "conversations_read" ON conversations FOR SELECT TO anon USING (true);
CREATE POLICY "conversations_update" ON conversations FOR UPDATE TO anon USING (true);

-- Messages: anon puede crear y leer
CREATE POLICY "messages_insert" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "messages_read" ON messages FOR SELECT TO anon USING (true);
