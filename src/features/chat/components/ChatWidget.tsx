'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { Send } from 'lucide-react'
import Image from 'next/image'

const QUICK_PROMPTS = [
  'Tengo un negocio y quiero automatizarlo',
  'Necesito una app a medida',
  'Quiero un bot de WhatsApp',
  'Que habeis hecho para otros clientes?',
]

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  const stored = localStorage.getItem('visitor_id')
  if (stored) return stored
  const id = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`
  localStorage.setItem('visitor_id', id)
  return id
}

export function ChatWidget() {
  const visitorIdRef = useRef<string>('')
  const { messages, status, error, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    visitorIdRef.current = getVisitorId()
  }, [])

  const isLoading = status === 'submitted' || status === 'streaming'
  const hasMessages = messages.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    sendMessage({ text }, { body: { visitorId: visitorIdRef.current } })
  }

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return
    sendMessage({ text: prompt }, { body: { visitorId: visitorIdRef.current } })
  }

  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts) return ''
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('')
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'var(--font-jakarta), system-ui' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-hide">
        {!hasMessages && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="flex gap-2.5 max-w-[85%]">
              <Image src="/axia-avatar.png" alt="Axia" width={30} height={30} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0 mt-0.5" />
              <div className="glass-assistant-message rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <p className="text-[13px] text-white/90 leading-relaxed">
                  Hola! Soy Axia, la asistente de ProfimaxIA. Cuentame que necesita tu negocio y te explico como la IA puede ayudarte.
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} streaming-fade`}
          >
            {m.role === 'assistant' ? (
              <div className="flex gap-2.5 max-w-[85%]">
                <Image src="/axia-avatar.png" alt="Axia" width={30} height={30} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0 mt-0.5" />
                <div className="glass-assistant-message rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                  <p className="text-[13px] text-white/90 leading-relaxed whitespace-pre-wrap">
                    {getMessageText(m)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-user-message rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%]">
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{getMessageText(m)}</p>
              </div>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start streaming-fade">
            <div className="flex gap-2.5">
              <Image src="/axia-avatar.png" alt="Axia" width={30} height={30} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0 mt-0.5" />
              <div className="glass-assistant-message rounded-2xl rounded-tl-sm px-3.5 py-3">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#60A5FA] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#93c5fd] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#bfdbfe] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Prompts - inside scroll area */}
        {!hasMessages && (
          <div className="flex flex-wrap gap-1.5 animate-fadeInUp delay-300">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 text-[11px] rounded-full border border-[var(--glass-border)] bg-[var(--surface)] text-[var(--muted)] hover:text-white hover:border-[var(--primary)] transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-[11px]">
            Error: {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--border)]">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[13px] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-[#3B82F6] text-white disabled:opacity-30 hover:bg-[#60A5FA] transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
